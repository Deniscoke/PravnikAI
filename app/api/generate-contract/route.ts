/**
 * POST /api/generate-contract — multi-jurisdiction (CZ / DE / UK)
 *
 * Pipeline:
 *   1. Parse & validate request body
 *   2. Resolve schemaId (handles legacy Slovak slugs) + jurisdiction
 *   3. Run 3-layer validation
 *   4. Build per-jurisdiction system + user prompts
 *   5. Stage 1: Generate draft via LLM (default model, high reasoning)
 *   6. Stage 2: Self-check quality review (JSON) — skipped when SKIP_CONTRACT_QUALITY_GATE set or CONTRACT_PIPELINE=hobby
 *   7. Stage 3 (optional): Premium polish (premium model)
 *   8. Stage 3b: Deterministic integrity check (locale-specific keywords/tokens)
 *   9. Return structured GenerateContractResponse
 */

import { NextRequest, NextResponse } from 'next/server'

export const maxDuration = 300

export const runtime = 'nodejs'

import { getSchema, resolveSchemaId } from '@/lib/contracts/contractSchemas'
import { runFullValidation } from '@/lib/contracts/validators'
import { buildPrompt } from '@/lib/contracts/promptBuilder'
import { generateText } from '@/lib/llm/openaiClient'
import { getSelfCheckPrompt } from '@/lib/contracts/systemPrompt'
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
import { logAiUsage } from '@/lib/billing/aiUsageLog'
import { checkRateLimit, getClientIp, rateLimitResponse } from '@/lib/rateLimit'
import { formatOpenAiUserHint } from '@/lib/llm/userVisibleLlmError'

import type {
  GenerateContractRequest,
  GenerateContractResponse,
  GenerateContractError,
  ContractWarning,
  GenerationMode,
  Jurisdiction,
} from '@/lib/contracts/types'
import { jurisdictionToLocale } from '@/lib/contracts/types'

// ─── Czech-only UI messages for API responses ───────────────────────────────

const POLISH_USER_PROMPT = (text: string) =>
  `Proveď finální jazykovou a právní revizi tohoto návrhu smlouvy. Oprav stylistické nedostatky, zpřesni formulace a zajisti maximální právní preciznost.\n\n${text}`

const RATE_LIMITED_MSG = 'Příliš mnoho požadavků. Zkuste to za chvíli.'
const VALIDATION_MSG = 'Neplatný JSON v těle požadavku.'
const MISSING_PARAMS_MSG = 'Chybí schemaId nebo formData.'
const SCHEMA_NOT_FOUND_MSG = (id: string) => `Typ smlouvy nebyl nalezen: "${id}"`
const TOO_MANY_ERRORS_MSG = 'Formulář obsahuje příliš mnoho chyb. Opravte povinná pole před generováním.'
const LLM_ERROR_MSG = 'Chyba při komunikaci s AI. Zkuste to znovu.'

const DRAFT_WARN_MSG = (n: number) =>
  `Smlouva byla vygenerována jako návrh. ${n} volitelných polí chybí — hledejte [DOPLNIT] v textu.`

const REVIEW_WARN_MSG = (missingList: string) =>
  `Smlouva vyžaduje kontrolu. ${missingList ? `Povinná pole chybí: ${missingList}. ` : ''}Hledejte ⚠️ ZKONTROLOVAT v textu.`

const QUALITY_DOWNGRADE_MSG = (from: string, to: string, summary: string) =>
  `Kontrola kvality změnila režim z „${from}" na „${to}": ${summary}`

/** Hobby / short-timeout hosting: skips Stage‑2 AI review; optional lighter draft reasoning. */
function isHobbyPipeline(): boolean {
  return process.env.CONTRACT_PIPELINE?.trim().toLowerCase() === 'hobby'
}

function isQualityGateLlmSkipped(): boolean {
  if (isHobbyPipeline()) return true
  const v = process.env.SKIP_CONTRACT_QUALITY_GATE?.trim().toLowerCase()
  return v === '1' || v === 'true' || v === 'yes'
}

const QUALITY_GATE_SKIPPED_MSG =
  'V tomto nasazení je vypnut druhý krok AI (kontrola kvality) kvůli krátkému časovému limitu serverové funkce — na výkonnějším tarifu hostingu ho znovu zapněte.'

export async function POST(req: NextRequest): Promise<NextResponse> {
  // ── 0a. Rate limit ────────────────────────────────────────────────────────
  const ip = getClientIp(req.headers)
  const rl = await checkRateLimit(`gen:${ip}`, { max: 10, windowMs: 60_000 })
  if (!rl.allowed) {
    return rateLimitResponse(rl, RATE_LIMITED_MSG)
  }

  // ── 0b. Billing guard ─────────────────────────────────────────────────────
  const guard = await assertBillingAccess('generate')
  if (!guard.allowed) return guard.response

  // ── 1. Parse body ──────────────────────────────────────────────────────────
  let body: GenerateContractRequest
  try {
    body = await req.json()
  } catch {
    return errorResponse(VALIDATION_MSG, 'VALIDATION_FAILED', 400)
  }

  if (!body.schemaId || !body.formData) {
    return errorResponse(MISSING_PARAMS_MSG, 'VALIDATION_FAILED', 400)
  }

  // ── 2. Resolve schema ──────────────────────────────────────────────────────
  let resolvedSchemaId: string
  let schema
  try {
    resolvedSchemaId = resolveSchemaId(body.schemaId)
    schema = getSchema(resolvedSchemaId)
  } catch {
    return errorResponse(
      SCHEMA_NOT_FOUND_MSG(body.schemaId),
      'SCHEMA_NOT_FOUND',
      404,
    )
  }

  const jurisdiction: Jurisdiction = schema.metadata.jurisdiction
  const skipQualityGate = isQualityGateLlmSkipped()

  // ── 3. Three-layer validation ──────────────────────────────────────────────
  const validation = runFullValidation(schema, body.formData)
  const { generationReadiness } = validation

  const errorCount = validation.ui.issues.filter((i) => i.severity === 'error').length
  if (errorCount > 5) {
    return NextResponse.json<GenerateContractError>(
      {
        error: TOO_MANY_ERRORS_MSG,
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
    const stage1 = await generateText({
      systemPrompt,
      userPrompt,
      stage: 'draft',
      ...(isHobbyPipeline() ? { reasoning: 'low' as const } : {}),
    })
    contractText = stage1.text
    totalTokens += stage1.tokensUsed
    console.info(`[generate-contract] Stage 1 (draft) | ${jurisdiction}/${resolvedSchemaId} | mode=${mode} | tokens=${stage1.tokensUsed}`)
  } catch (err) {
    const locale = jurisdictionToLocale(jurisdiction)
    const hint = formatOpenAiUserHint(err, locale)
    console.error('[generate-contract] Stage 1 LLM error:', err)
    return errorResponse(LLM_ERROR_MSG, 'LLM_ERROR', 502, hint)
  }

  // ── 6. Stage 2: Structured legal quality gate (optional — skipped on Hobby / env) ───
  let qualityGate: QualityGateResult | null = null
  let effectiveMode: GenerationMode = mode
  if (!skipQualityGate) {
    try {
      const qualityPrompt = buildQualityGatePrompt(resolvedSchemaId, schema.metadata.name, jurisdiction)
      const stage2 = await generateText({
        systemPrompt: qualityPrompt,
        userPrompt: contractText,
        jsonMode: true,
        reasoning: 'medium',
        stage: 'quality-gate',
      })
      totalTokens += stage2.tokensUsed
      qualityGate = parseQualityGateResponse(stage2.text, jurisdiction)
      console.info(
        `[generate-contract] Stage 2 (quality gate) | ${jurisdiction} | status=${qualityGate.status} ` +
        `| recommended=${qualityGate.recommendedMode} | tokens=${stage2.tokensUsed}`,
      )

      if (qualityGate.correctedText) {
        contractText = qualityGate.correctedText
      }

      effectiveMode = applyQualityGateDecision(mode, qualityGate)
      if (effectiveMode !== mode) {
        console.info(`[generate-contract] Quality gate downgraded mode: ${mode} → ${effectiveMode}`)
      }
    } catch (err) {
      console.warn('[generate-contract] Stage 2 quality gate failed, using Stage 1 draft:', err)
    }
  } else {
    console.info(
      `[generate-contract] Stage 2 (quality gate) SKIPPED | ${jurisdiction} | ` +
        `CONTRACT_PIPELINE=${process.env.CONTRACT_PIPELINE ?? 'unset'} | SKIP_CONTRACT_QUALITY_GATE=${process.env.SKIP_CONTRACT_QUALITY_GATE ?? 'unset'}`,
    )
  }

  // ── 7. Stage 3 (optional): Premium polish ────────────────────────────────
  if (body.premium) {
    try {
      const stage3 = await generateText({
        systemPrompt: getSelfCheckPrompt(jurisdiction),
        userPrompt: POLISH_USER_PROMPT(contractText),
        stage: 'premium',
      })
      contractText = stage3.text
      totalTokens += stage3.tokensUsed
      console.info(`[generate-contract] Stage 3 (premium) | ${jurisdiction} | tokens=${stage3.tokensUsed}`)
    } catch (err) {
      console.warn('[generate-contract] Stage 3 premium polish failed, using Stage 2 result:', err)
    }
  }

  // ── 7b. Deterministic integrity check ────────────────────────────────────
  const integrityResult = runIntegrityCheck(contractText, resolvedSchemaId, jurisdiction, effectiveMode, body.posture)
  const effectiveModeAfterIntegrity = applyIntegrityDecision(effectiveMode, integrityResult)
  if (effectiveModeAfterIntegrity !== effectiveMode) {
    console.info(
      `[generate-contract] Integrity check downgraded mode: ${effectiveMode} → ${effectiveModeAfterIntegrity}` +
      ` | placeholders=${integrityResult.unresolvedPlaceholders}` +
      ` | reviewMarkers=${integrityResult.unresolvedReviewMarkers}`,
    )
  }
  effectiveMode = effectiveModeAfterIntegrity

  // ── 8. Build warnings ─────────────────────────────────────────────────────
  const warnings: ContractWarning[] = []

  if (skipQualityGate) {
    warnings.push({
      code: 'QUALITY_GATE_SKIPPED',
      message: QUALITY_GATE_SKIPPED_MSG,
    })
  }

  for (const issue of validation.businessLegal.issues) {
    warnings.push({
      code: 'LEGAL_CONSTRAINT',
      message: issue.message,
      fieldId: issue.fieldId,
      legalBasis: issue.legalBasis,
    })
  }

  if (qualityGate) {
    for (const qw of extractQualityWarnings(qualityGate, jurisdiction)) {
      warnings.push({ code: qw.code, message: qw.message })
    }

    if (effectiveMode !== mode) {
      warnings.push({
        code: 'QUALITY_DOWNGRADE',
        message: QUALITY_DOWNGRADE_MSG(mode, effectiveMode, qualityGate.summary),
      })
    }
  }

  for (const iw of extractIntegrityWarnings(integrityResult)) {
    warnings.push({ code: iw.code, message: iw.message })
  }

  if (effectiveMode === 'draft') {
    warnings.push({
      code: 'DRAFT_MODE',
      message: DRAFT_WARN_MSG(missingOptional.length),
    })
  }

  if (effectiveMode === 'review-needed') {
    warnings.push({
      code: 'REVIEW_NEEDED',
      message: REVIEW_WARN_MSG(missingRequired.join(', ')),
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

  // ── 10. Save to history (best-effort) ────────────────────────────────────
  const partyNames = body.formData?.parties
    ?.map((p: { fields?: Record<string, string> }) => p.fields?.name)
    .filter(Boolean)
    .join(' × ') || ''
  const title = `${schema.metadata.name}${partyNames ? ` — ${partyNames}` : ''}`

  saveGenerationToHistory({
    user_id: '',
    schema_id: resolvedSchemaId,
    title,
    mode: effectiveMode,
    contract_text: contractText,
    form_data_snapshot: body.formData as unknown as Record<string, unknown>,
    warnings: warnings as unknown as Array<{ code: string; message: string }>,
    legal_basis: schema.metadata.legalBasis,
    status: 'completed',
  }).catch(() => {})

  if (guard.user && totalTokens > 0) {
    logAiUsage({
      userId: guard.user.id,
      action: 'generate',
      model: 'multi-stage',
      tokensUsed: totalTokens,
    })
  }

  return NextResponse.json<GenerateContractResponse>(response, { status: 200 })
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function errorResponse(
  message: string,
  code: GenerateContractError['code'],
  status: number,
  hint?: string,
): NextResponse {
  const payload: GenerateContractError = hint?.trim()
    ? { error: message, code, hint: hint.trim() }
    : { error: message, code }
  return NextResponse.json<GenerateContractError>(payload, { status })
}
