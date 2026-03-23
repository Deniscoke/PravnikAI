/**
 * POST /api/review-contract
 *
 * AI-assisted contract review under Czech law.
 *
 * Pipeline:
 *   1. Parse & validate request body (contractText required)
 *   2. Build review system + user prompts
 *   3. Call LLM with JSON mode enabled
 *   4. Parse structured response
 *   5. Return ReviewContractResponse
 */

import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'nodejs'

import { buildReviewPrompt } from '@/lib/review/reviewPromptBuilder'
import { generateText } from '@/lib/llm/openaiClient'
import { saveReviewToHistory } from '@/lib/supabase/actions'
import { assertBillingAccess } from '@/lib/billing/guard'
import type { ReviewContractRequest, ReviewContractResponse } from '@/lib/review/types'

/** Maximum contract text length — ~50 pages of dense legal text */
const MAX_CONTRACT_LENGTH = 100_000

export async function POST(req: NextRequest): Promise<NextResponse> {
  // ── 0. Billing guard ─────────────────────────────────────────────────────
  const guard = await assertBillingAccess('review')
  if (!guard.allowed) return guard.response

  // ── 1. Parse body ──────────────────────────────────────────────────────────
  let body: ReviewContractRequest
  try {
    body = await req.json()
  } catch {
    return errorResponse('Neplatný JSON v těle požadavku.', 'VALIDATION_FAILED', 400)
  }

  if (!body.contractText || typeof body.contractText !== 'string') {
    return errorResponse('Chybí text smlouvy k analýze.', 'VALIDATION_FAILED', 400)
  }

  const trimmed = body.contractText.trim()
  if (trimmed.length < 50) {
    return errorResponse(
      'Text smlouvy je příliš krátký pro smysluplnou analýzu (minimum 50 znaků).',
      'VALIDATION_FAILED',
      400,
    )
  }

  if (trimmed.length > MAX_CONTRACT_LENGTH) {
    return errorResponse(
      `Text smlouvy je příliš dlouhý (${trimmed.length.toLocaleString('cs-CZ')} znaků, maximum ${MAX_CONTRACT_LENGTH.toLocaleString('cs-CZ')}).`,
      'VALIDATION_FAILED',
      413,
    )
  }

  // ── 2. Build prompts ───────────────────────────────────────────────────────
  const { systemPrompt, userPrompt } = buildReviewPrompt({
    contractText: trimmed,
    contractTypeHint: body.contractTypeHint,
  })

  // ── 3. Call LLM ────────────────────────────────────────────────────────────
  let rawText: string
  try {
    const result = await generateText({
      systemPrompt,
      userPrompt,
      temperature: 0.1,
      maxTokens: 4096,
      jsonMode: true,
    })
    rawText = result.text
  } catch (err) {
    console.error('[review-contract] LLM error:', err)
    return errorResponse(
      'Chyba při komunikaci s AI. Zkuste to znovu.',
      'LLM_ERROR',
      502,
    )
  }

  // ── 4. Parse JSON response ─────────────────────────────────────────────────
  let parsed: Record<string, unknown>
  try {
    parsed = JSON.parse(rawText)
  } catch {
    console.error('[review-contract] JSON parse error. Raw:', rawText.slice(0, 500))
    return errorResponse(
      'AI vrátila neplatnou odpověď. Zkuste to znovu.',
      'PARSE_ERROR',
      502,
    )
  }

  // ── 5. Validate response has meaningful content ────────────────────────────
  //    Do NOT let defensive normalization turn garbage into misleading success.

  const hasSummary = typeof parsed.summary === 'string' && parsed.summary.trim().length > 0
  const hasRisk = parsed.overallRisk === 'low' || parsed.overallRisk === 'medium' || parsed.overallRisk === 'high'

  if (!hasSummary || !hasRisk) {
    console.error('[review-contract] LLM returned no meaningful analysis. Keys:', Object.keys(parsed))
    return errorResponse(
      'AI nebyla schopna provést smysluplnou analýzu. Zkuste to prosím znovu.',
      'PARSE_ERROR',
      502,
    )
  }

  // ── 6. Build typed response (filter garbage, don't normalize it) ──────────

  const riskyClauses = Array.isArray(parsed.riskyClauses)
    ? parsed.riskyClauses.map(normalizeRiskyClause).filter(isValidRiskyClause)
    : []

  const missingClauses = Array.isArray(parsed.missingClauses)
    ? parsed.missingClauses.map(normalizeMissingClause).filter(isValidMissingClause)
    : []

  const response: ReviewContractResponse = {
    overallRisk: validateRisk(parsed.overallRisk),
    summary: String(parsed.summary),
    riskyClauses,
    missingClauses,
    negotiationFlags: Array.isArray(parsed.negotiationFlags)
      ? parsed.negotiationFlags.filter(isNonEmptyString).map(String)
      : [],
    lawyerReviewRequired: Boolean(parsed.lawyerReviewRequired ?? true),
    disclaimer: String(
      parsed.disclaimer ??
        'Tato analýza byla provedena umělou inteligencí a neslouží jako právní poradenství ve smyslu zák. č. 85/1996 Sb., o advokacii. Před právním jednáním konzultujte advokáta.',
    ),
    reviewedAt: new Date().toISOString(),

    // Extended fields — only accept strings, discard objects/numbers
    detectedContractType: typeof parsed.detectedContractType === 'string'
      ? parsed.detectedContractType
      : undefined,
    assumptions: Array.isArray(parsed.assumptions)
      ? parsed.assumptions.filter(isNonEmptyString).map(String)
      : undefined,
    legalBasis: Array.isArray(parsed.legalBasis)
      ? parsed.legalBasis.filter(isNonEmptyString).map(String)
      : undefined,
    reviewMode: 'ai-assisted-review',
  }

  // ── 7. Save to history (best-effort, non-blocking for unauthenticated) ──
  const reviewTitle = response.detectedContractType
    ? `Kontrola: ${response.detectedContractType}`
    : 'Kontrola smlouvy'

  saveReviewToHistory({
    user_id: '', // Set by the action from session
    detected_contract_type: response.detectedContractType ?? null,
    title: reviewTitle,
    overall_risk: response.overallRisk,
    summary: response.summary,
    review_result: response as unknown as Record<string, unknown>,
    input_text_preview: trimmed.slice(0, 200),
    status: 'completed',
  }).catch(() => {}) // Silently ignore — action logs errors internally

  return NextResponse.json(response, { status: 200 })
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function validateRisk(value: unknown): 'low' | 'medium' | 'high' {
  if (value === 'low' || value === 'medium' || value === 'high') return value
  return 'medium' // safe default
}

function normalizeRiskyClause(raw: unknown): ReviewContractResponse['riskyClauses'][number] {
  const c = (typeof raw === 'object' && raw !== null ? raw : {}) as Record<string, unknown>
  return {
    title: typeof c.title === 'string' ? c.title : '',
    severity: validateRisk(c.severity),
    explanation: typeof c.explanation === 'string' ? c.explanation : '',
    ...(typeof c.suggestedRevision === 'string' && c.suggestedRevision
      ? { suggestedRevision: c.suggestedRevision }
      : {}),
  }
}

/** A risky clause is only valid if it has BOTH a title and an explanation */
function isValidRiskyClause(c: ReviewContractResponse['riskyClauses'][number]): boolean {
  return c.title.trim().length > 0 && c.explanation.trim().length > 0
}

function normalizeMissingClause(raw: unknown): ReviewContractResponse['missingClauses'][number] {
  const c = (typeof raw === 'object' && raw !== null ? raw : {}) as Record<string, unknown>
  return {
    title: typeof c.title === 'string' ? c.title : '',
    reason: typeof c.reason === 'string' ? c.reason : '',
    ...(typeof c.suggestedClause === 'string' && c.suggestedClause
      ? { suggestedClause: c.suggestedClause }
      : {}),
  }
}

/** A missing clause is only valid if it has BOTH a title and a reason */
function isValidMissingClause(c: ReviewContractResponse['missingClauses'][number]): boolean {
  return c.title.trim().length > 0 && c.reason.trim().length > 0
}

/** Only accept non-empty strings — rejects objects, numbers, null */
function isNonEmptyString(v: unknown): boolean {
  return typeof v === 'string' && v.trim().length > 0
}

function errorResponse(
  message: string,
  code: string,
  status: number,
): NextResponse {
  return NextResponse.json({ error: message, code }, { status })
}
