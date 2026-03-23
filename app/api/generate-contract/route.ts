/**
 * POST /api/generate-contract
 *
 * Pipeline:
 *   1. Parse & validate request body
 *   2. Resolve schemaId (handles legacy Slovak slugs)
 *   3. Run 3-layer validation
 *   4. Build system + user prompts
 *   5. Call LLM via provider-isolated wrapper
 *   6. Return structured GenerateContractResponse
 */

import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'nodejs'

import { getSchema, resolveSchemaId } from '@/lib/contracts/contractSchemas'
import { runFullValidation } from '@/lib/contracts/validators'
import { buildPrompt } from '@/lib/contracts/promptBuilder'
import { generateText } from '@/lib/llm/openaiClient'
import { saveGenerationToHistory } from '@/lib/supabase/actions'
import { assertBillingAccess } from '@/lib/billing/guard'

import type {
  GenerateContractRequest,
  GenerateContractResponse,
  GenerateContractError,
  ContractWarning,
} from '@/lib/contracts/types'

export async function POST(req: NextRequest): Promise<NextResponse> {
  // ── 0. Billing guard ─────────────────────────────────────────────────────
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
  })

  // ── 5. Call LLM ───────────────────────────────────────────────────────────
  let contractText: string
  try {
    const llmResult = await generateText({ systemPrompt, userPrompt })
    contractText = llmResult.text
    console.info(`[generate-contract] ${resolvedSchemaId} | mode=${mode} | tokens=${llmResult.tokensUsed}`)
  } catch (err) {
    console.error('[generate-contract] LLM error:', err)
    return errorResponse(
      'Chyba při komunikaci s AI. Zkuste to znovu.',
      'LLM_ERROR',
      502,
    )
  }

  // ── 6. Build warnings ─────────────────────────────────────────────────────
  const warnings: ContractWarning[] = []

  for (const issue of validation.businessLegal.issues) {
    warnings.push({
      code: 'LEGAL_CONSTRAINT',
      message: issue.message,
      fieldId: issue.fieldId,
      legalBasis: issue.legalBasis,
    })
  }

  if (mode === 'draft') {
    warnings.push({
      code: 'DRAFT_MODE',
      message: `Smlouva byla vygenerována jako návrh. ${missingOptional.length} volitelných polí chybí — hledejte [DOPLNIT] v textu.`,
    })
  }

  if (mode === 'review-needed') {
    warnings.push({
      code: 'REVIEW_NEEDED',
      message: `Smlouva vyžaduje kontrolu. Povinná pole chybí: ${missingRequired.join(', ')}. Hledejte ⚠️ ZKONTROLOVAT v textu.`,
    })
  }

  // ── 7. Build response ────────────────────────────────────────────────────
  const response: GenerateContractResponse = {
    schemaId: resolvedSchemaId,
    mode,
    contractText,
    warnings,
    missingFields: allMissing,
    legalBasis: schema.metadata.legalBasis,
    generatedAt: new Date().toISOString(),
  }

  // ── 8. Save to history (best-effort, non-blocking for unauthenticated) ──
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
    mode,
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
