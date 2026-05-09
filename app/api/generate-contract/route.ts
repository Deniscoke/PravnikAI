/**
 * POST /api/generate-contract — multi-jurisdiction (CZ / DE / UK)
 *
 * Pipeline:
 *   1. Parse & validate request body
 *   2. Resolve schemaId (handles legacy Slovak slugs) + jurisdiction
 *   3. Run 3-layer validation
 *   4. Build per-jurisdiction system + user prompts
 *   5. Stage 1: Generate draft via LLM (default model, high reasoning)
 *   6. Stage 2: Self-check quality review (JSON, locale-specific gate)
 *   7. Stage 3 (optional): Premium polish (premium model)
 *   8. Stage 3b: Deterministic integrity check (locale-specific keywords/tokens)
 *   9. Return structured GenerateContractResponse
 */

import { NextRequest, NextResponse } from 'next/server'

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
import { checkRateLimit, getClientIp } from '@/lib/rateLimit'

import type {
  GenerateContractRequest,
  GenerateContractResponse,
  GenerateContractError,
  ContractWarning,
  GenerationMode,
  Jurisdiction,
} from '@/lib/contracts/types'

/** Localized polish-pass prompts for Stage 3 (premium model). */
const POLISH_USER_PROMPT: Record<Jurisdiction, (text: string) => string> = {
  CZ: (text) =>
    `Proveď finální jazykovou a právní revizi tohoto návrhu smlouvy. Oprav stylistické nedostatky, zpřesni formulace a zajisti maximální právní preciznost.\n\n${text}`,
  DE: (text) =>
    `Führe eine abschließende sprachliche und juristische Überarbeitung dieses Vertragsentwurfs durch. Bessere stilistische Schwächen aus, präzisiere die Formulierungen und stelle maximale rechtliche Präzision sicher.\n\n${text}`,
  UK: (text) =>
    `Perform a final linguistic and legal review of this contract draft. Fix stylistic weaknesses, sharpen the wording and ensure the maximum legal precision.\n\n${text}`,
}

const RATE_LIMITED_MSG: Record<Jurisdiction, string> = {
  CZ: 'Příliš mnoho požadavků. Zkuste to za chvíli.',
  DE: 'Zu viele Anfragen. Bitte versuchen Sie es in Kürze erneut.',
  UK: 'Too many requests. Please try again shortly.',
}

const VALIDATION_MSG: Record<Jurisdiction, string> = {
  CZ: 'Neplatný JSON v těle požadavku.',
  DE: 'Ungültiges JSON im Anfragetext.',
  UK: 'Invalid JSON in request body.',
}

const MISSING_PARAMS_MSG: Record<Jurisdiction, string> = {
  CZ: 'Chybí schemaId nebo formData.',
  DE: 'schemaId oder formData fehlen.',
  UK: 'Missing schemaId or formData.',
}

const SCHEMA_NOT_FOUND_MSG: Record<Jurisdiction, (id: string) => string> = {
  CZ: (id) => `Typ smlouvy nebyl nalezen: "${id}"`,
  DE: (id) => `Vertragsart nicht gefunden: "${id}"`,
  UK: (id) => `Contract type not found: "${id}"`,
}

const TOO_MANY_ERRORS_MSG: Record<Jurisdiction, string> = {
  CZ: 'Formulář obsahuje příliš mnoho chyb. Opravte povinná pole před generováním.',
  DE: 'Das Formular enthält zu viele Fehler. Bitte korrigieren Sie die Pflichtfelder vor der Erstellung.',
  UK: 'The form contains too many errors. Please correct the required fields before drafting.',
}

const LLM_ERROR_MSG: Record<Jurisdiction, string> = {
  CZ: 'Chyba při komunikaci s AI. Zkuste to znovu.',
  DE: 'Fehler bei der Kommunikation mit der KI. Bitte versuchen Sie es erneut.',
  UK: 'Error communicating with the AI. Please try again.',
}

const DRAFT_WARN_MSG: Record<Jurisdiction, (n: number) => string> = {
  CZ: (n) =>
    `Smlouva byla vygenerována jako návrh. ${n} volitelných polí chybí — hledejte [DOPLNIT] v textu.`,
  DE: (n) =>
    `Der Vertrag wurde als Entwurf erstellt. ${n} optionale Felder fehlen — suchen Sie nach [BITTE ERGÄNZEN] im Text.`,
  UK: (n) =>
    `Contract drafted as a working draft. ${n} optional fields are missing — search for [TO COMPLETE] in the text.`,
}

const REVIEW_WARN_MSG: Record<Jurisdiction, (missingList: string) => string> = {
  CZ: (m) =>
    `Smlouva vyžaduje kontrolu. ${m ? `Povinná pole chybí: ${m}. ` : ''}Hledejte ⚠️ ZKONTROLOVAT v textu.`,
  DE: (m) =>
    `Der Vertrag bedarf der Prüfung. ${m ? `Fehlende Pflichtfelder: ${m}. ` : ''}Suchen Sie nach ⚠️ PRÜFEN im Text.`,
  UK: (m) =>
    `Contract needs review. ${m ? `Missing required fields: ${m}. ` : ''}Search for ⚠️ REVIEW in the text.`,
}

const QUALITY_DOWNGRADE_MSG: Record<Jurisdiction, (from: string, to: string, summary: string) => string> = {
  CZ: (from, to, summary) =>
    `Kontrola kvality změnila režim z „${from}" na „${to}": ${summary}`,
  DE: (from, to, summary) =>
    `Die Qualitätsprüfung hat den Modus von „${from}" auf „${to}" herabgestuft: ${summary}`,
  UK: (from, to, summary) =>
    `Quality gate downgraded the mode from "${from}" to "${to}": ${summary}`,
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  // ── 0a. Rate limit ────────────────────────────────────────────────────────
  const ip = getClientIp(req.headers)
  const { allowed: rlAllowed, resetAt } = await checkRateLimit(ip, { max: 10, windowMs: 60_000 })
  if (!rlAllowed) {
    return NextResponse.json(
      { error: RATE_LIMITED_MSG.CZ, code: 'RATE_LIMITED' },
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
    return errorResponse(VALIDATION_MSG.CZ, 'VALIDATION_FAILED', 400)
  }

  if (!body.schemaId || !body.formData) {
    return errorResponse(MISSING_PARAMS_MSG.CZ, 'VALIDATION_FAILED', 400)
  }

  // ── 2. Resolve schema ──────────────────────────────────────────────────────
  let resolvedSchemaId: string
  let schema
  try {
    resolvedSchemaId = resolveSchemaId(body.schemaId)
    schema = getSchema(resolvedSchemaId)
  } catch {
    return errorResponse(
      SCHEMA_NOT_FOUND_MSG.CZ(body.schemaId),
      'SCHEMA_NOT_FOUND',
      404,
    )
  }

  const jurisdiction: Jurisdiction = schema.metadata.jurisdiction

  // ── 3. Three-layer validation ──────────────────────────────────────────────
  const validation = runFullValidation(schema, body.formData)
  const { generationReadiness } = validation

  const errorCount = validation.ui.issues.filter((i) => i.severity === 'error').length
  if (errorCount > 5) {
    return NextResponse.json<GenerateContractError>(
      {
        error: TOO_MANY_ERRORS_MSG[jurisdiction],
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
    const stage1 = await generateText({ systemPrompt, userPrompt, stage: 'draft' })
    contractText = stage1.text
    totalTokens += stage1.tokensUsed
    console.info(`[generate-contract] Stage 1 (draft) | ${jurisdiction}/${resolvedSchemaId} | mode=${mode} | tokens=${stage1.tokensUsed}`)
  } catch (err) {
    console.error('[generate-contract] Stage 1 LLM error:', err)
    return errorResponse(LLM_ERROR_MSG[jurisdiction], 'LLM_ERROR', 502)
  }

  // ── 6. Stage 2: Structured legal quality gate ────────────────────────────
  let qualityGate: QualityGateResult | null = null
  let effectiveMode: GenerationMode = mode
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

  // ── 7. Stage 3 (optional): Premium polish ────────────────────────────────
  if (body.premium) {
    try {
      const stage3 = await generateText({
        systemPrompt: getSelfCheckPrompt(jurisdiction),
        userPrompt: POLISH_USER_PROMPT[jurisdiction](contractText),
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
        message: QUALITY_DOWNGRADE_MSG[jurisdiction](mode, effectiveMode, qualityGate.summary),
      })
    }
  }

  for (const iw of extractIntegrityWarnings(integrityResult)) {
    warnings.push({ code: iw.code, message: iw.message })
  }

  if (effectiveMode === 'draft') {
    warnings.push({
      code: 'DRAFT_MODE',
      message: DRAFT_WARN_MSG[jurisdiction](missingOptional.length),
    })
  }

  if (effectiveMode === 'review-needed') {
    warnings.push({
      code: 'REVIEW_NEEDED',
      message: REVIEW_WARN_MSG[jurisdiction](missingRequired.join(', ')),
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
