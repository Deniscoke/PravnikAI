/**
 * POST /api/generate-contract
 *
 * Pipeline:
 *   1. Parse & validate request body
 *   2. Resolve schemaId (handles legacy Slovak slugs)
 *   3. Run 3-layer validation
 *   4. Build system + user prompts
 *   5. Stage 1: Generate draft via LLM (gpt-5.4)
 *   6. Stage 2: Self-check quality review (gpt-5.4)
 *   7. Stage 3 (optional): Premium polish (gpt-5.4-pro) — only if premium=true
 *   8. Return structured GenerateContractResponse
 */

import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'nodejs'

import { getSchema, resolveSchemaId } from '@/lib/contracts/contractSchemas'
import { runFullValidation } from '@/lib/contracts/validators'
import { buildPrompt } from '@/lib/contracts/promptBuilder'
import { generateText } from '@/lib/llm/openaiClient'
import { SELF_CHECK_SYSTEM_PROMPT } from '@/lib/contracts/systemPrompt'
import {
  buildQualityGatePrompt,
  parseQualityGateResponse,
  applyQualityGateDecision,
  extractQualityWarnings,
} from '@/lib/contracts/qualityGate'
import type { QualityGateResult } from '@/lib/contracts/qualityGate'
import {
  runIntegrityCheck,
  applyIntegrityDecision,
  extractIntegrityWarnings,
} from '@/lib/contracts/integrityValidator'
import { saveGenerationToHistory } from '@/lib/supabase/actions'
import { assertBillingAccess } from '@/lib/billing/guard'
import { checkRateLimit, getClientIp } from '@/lib/rateLimit'

import type {
  GenerateContractRequest,
  GenerateContractResponse,
  GenerateContractError,
  ContractWarning,
  GenerationMode,
} from '@/lib/contracts/types'

export async function POST(req: NextRequest): Promise<NextResponse> {
  // ── 0a. Rate limit ────────────────────────────────────────────────────────
  const ip = getClientIp(req.headers)
  const { allowed: rlAllowed, remaining, resetAt } = await checkRateLimit(ip, { max: 10, windowMs: 60_000 })
  if (!rlAllowed) {
    return NextResponse.json(
      { error: 'Příliš mnoho požadavků. Zkuste to za chvíli.', code: 'RATE_LIMITED' },
      { status: 429, headers: { 'Retry-After': String(Math.ceil((resetAt - Date.now()) / 1000)), 'X-RateLimit-Remaining': '0' } },
    )
  }

  // ── 0b. Billing guard ─────────────────────────────────────────────────────
  const guard = await assertBillingAccess('generate')
  if (!guard.allowed) return guard.response

  // ── 1. Parse body ──────────────────────────────────────────────────────────
  let body: GenerateContractRequest
  try {
    body = await req.json()
  } catch {
    return errorResponse('Neplatný JSON v těle požadavku.', 'VALIDATION_FAILED', 400)
  }

  if (!body.schemaId || !body.formData) {
    return errorResponse('Chybí schemaId nebo formData.', 'VALIDATION_FAILED', 400)
  }

  // ── 2. Resolve schema ──────────────────────────────────────────────────────
  let resolvedSchemaId: string
  let schema
  try {
    resolvedSchemaId = resolveSchemaId(body.schemaId)
    schema = getSchema(resolvedSchemaId)
  } catch (err) {
    return errorResponse(
      `Typ smlouvy nebyl nalezen: "${body.schemaId}"`,
      'SCHEMA_NOT_FOUND',
      404,
    )
  }

  // ── 3. Three-layer validation ──────────────────────────────────────────────
  const validation = runFullValidation(schema, body.formData)
  const { generationReadiness } = validation

  // Hard stop: if validation has errors AND no data at all, refuse to generate
  const errorCount = validation.ui.issues.filter((i) => i.severity === 'error').length
  if (errorCount > 5) {
    return NextResponse.json<GenerateContractError>(
      {
        error: 'Formulář obsahuje příliš mnoho chyb. Opravte povinná pole před generováním.',
        code: 'VALIDATION_FAILED',
        issues: validation.ui.issues,
      },
      { status: 422 },
    )
  }

  // ── 4. Build prompts ───────────────────────────────────────────────────────
  const { mode, missingRequired, missingOptional } = generationReadiness
  const allMissing = [...missingRequired, ...missingOptional]

  const { systemPrompt, userPrompt } = buildPrompt({
    schema,
    data: body.formData,
    mode,
    missingFields: allMissing,
    posture: body.posture,
  })

  // ── 5. Stage 1: Generate draft ────────────────────────────────────────────
  let contractText: string
  let totalTokens = 0
  try {
    const stage1 = await generateText({ systemPrompt, userPrompt })
    contractText = stage1.text
    totalTokens += stage1.tokensUsed
    console.info(`[generate-contract] Stage 1 (draft) | ${resolvedSchemaId} | mode=${mode} | tokens=${stage1.tokensUsed}`)
  } catch (err) {
    console.error('[generate-contract] Stage 1 LLM error:', err)
    return errorResponse(
      'Chyba při komunikaci s AI. Zkuste to znovu.',
      'LLM_ERROR',
      502,
    )
  }

  // ── 6. Stage 2: Structured legal quality gate ────────────────────────────
  let qualityGate: QualityGateResult | null = null
  let effectiveMode: GenerationMode = mode
  try {
    const qualityPrompt = buildQualityGatePrompt(resolvedSchemaId, schema.metadata.name)
    const stage2 = await generateText({
      systemPrompt: qualityPrompt,
      userPrompt: contractText,
      jsonMode: true,
      reasoning: 'medium',
    })
    totalTokens += stage2.tokensUsed
    qualityGate = parseQualityGateResponse(stage2.text)
    console.info(
      `[generate-contract] Stage 2 (quality gate) | status=${qualityGate.status} ` +
      `| recommended=${qualityGate.recommendedMode} | tokens=${stage2.tokensUsed}`
    )

    // Apply corrected text if the quality gate provided one
    if (qualityGate.correctedText) {
      contractText = qualityGate.correctedText
    }

    // Apply hard routing — quality gate can only downgrade, never upgrade
    effectiveMode = applyQualityGateDecision(mode, qualityGate)
    if (effectiveMode !== mode) {
      console.info(`[generate-contract] Quality gate downgraded mode: ${mode} → ${effectiveMode}`)
    }
  } catch (err) {
    // Quality gate failure is non-fatal — use Stage 1 draft, keep original mode
    console.warn('[generate-contract] Stage 2 quality gate failed, using Stage 1 draft:', err)
  }

  // ── 7. Stage 3 (optional): Premium polish ────────────────────────────────
  if (body.premium) {
    try {
      const stage3 = await generateText({
        systemPrompt: SELF_CHECK_SYSTEM_PROMPT,
        userPrompt: `Proveď finální jazykovou a právní revizi tohoto návrhu smlouvy. Oprav stylistické nedostatky, zpřesni formulace a zajisti maximální právní preciznost.\n\n${contractText}`,
        premium: true,
      })
      contractText = stage3.text
      totalTokens += stage3.tokensUsed
      console.info(`[generate-contract] Stage 3 (premium) | tokens=${stage3.tokensUsed}`)
    } catch (err) {
      // Premium failure is non-fatal — use Stage 2 result
      console.warn('[generate-contract] Stage 3 premium polish failed, using Stage 2 result:', err)
    }
  }

  // ── 7b. Deterministic integrity check ────────────────────────────────────
  // Runs on final contractText (after all LLM stages). Non-LLM, always fast.
  const integrityResult = runIntegrityCheck(contractText, resolvedSchemaId, effectiveMode, body.posture)
  const effectiveModeAfterIntegrity = applyIntegrityDecision(effectiveMode, integrityResult)
  if (effectiveModeAfterIntegrity !== effectiveMode) {
    console.info(
      `[generate-contract] Integrity check downgraded mode: ${effectiveMode} → ${effectiveModeAfterIntegrity}` +
      ` | placeholders=${integrityResult.unresolvedPlaceholders}` +
      ` | reviewMarkers=${integrityResult.unresolvedReviewMarkers}`
    )
  }
  effectiveMode = effectiveModeAfterIntegrity

  // ── 8. Build warnings ─────────────────────────────────────────────────────
  const warnings: ContractWarning[] = []

  for (const issue of validation.businessLegal.issues) {
    warnings.push({
      code: 'LEGAL_CONSTRAINT',
      message: issue.message,
      fieldId: issue.fieldId,
      legalBasis: issue.legalBasis,
    })
  }

  // Quality gate warnings (structured findings from Stage 2)
  if (qualityGate) {
    for (const qw of extractQualityWarnings(qualityGate)) {
      warnings.push({ code: qw.code, message: qw.message })
    }

    // If the quality gate downgraded the mode, add an explicit warning
    if (effectiveMode !== mode) {
      warnings.push({
        code: 'QUALITY_DOWNGRADE',
        message: `Kontrola kvality změnila režim z „${mode}" na „${effectiveMode}": ${qualityGate.summary}`,
      })
    }
  }

  // Integrity validator warnings (deterministic findings)
  for (const iw of extractIntegrityWarnings(integrityResult)) {
    warnings.push({ code: iw.code, message: iw.message })
  }

  if (effectiveMode === 'draft') {
    warnings.push({
      code: 'DRAFT_MODE',
      message: `Smlouva byla vygenerována jako návrh. ${missingOptional.length} volitelných polí chybí — hledejte [DOPLNIT] v textu.`,
    })
  }

  if (effectiveMode === 'review-needed') {
    warnings.push({
      code: 'REVIEW_NEEDED',
      message: `Smlouva vyžaduje kontrolu. ${missingRequired.length > 0 ? `Povinná pole chybí: ${missingRequired.join(', ')}. ` : ''}Hledejte ⚠️ ZKONTROLOVAT v textu.`,
    })
  }

  // ── 9. Build response ────────────────────────────────────────────────────
  const response: GenerateContractResponse = {
    schemaId: resolvedSchemaId,
    mode: effectiveMode,
    contractText,
    warnings,
    missingFields: allMissing,
    legalBasis: schema.metadata.legalBasis,
    generatedAt: new Date().toISOString(),
  }

  // ── 10. Save to history (best-effort, non-blocking for unauthenticated) ─
  const partyNames = body.formData?.parties
    ?.map((p: { fields?: Record<string, string> }) => p.fields?.name)
    .filter(Boolean)
    .join(' × ') || ''
  const title = `${schema.metadata.name}${partyNames ? ` — ${partyNames}` : ''}`

  // Fire-and-forget: don't await, don't block the response
  saveGenerationToHistory({
    user_id: '', // Set by the action from session
    schema_id: resolvedSchemaId,
    title,
    mode: effectiveMode,
    contract_text: contractText,
    form_data_snapshot: body.formData as unknown as Record<string, unknown>,
    warnings: warnings as unknown as Array<{ code: string; message: string }>,
    legal_basis: schema.metadata.legalBasis,
    status: 'completed',
  }).catch(() => {}) // Silently ignore — action logs errors internally

  return NextResponse.json<GenerateContractResponse>(response, { status: 200 })
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function errorResponse(
  message: string,
  code: GenerateContractError['code'],
  status: number,
): NextResponse {
  return NextResponse.json<GenerateContractError>({ error: message, code }, { status })
}
