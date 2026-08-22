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

export const maxDuration = 300

export const runtime = 'nodejs'

import { buildReviewPrompt } from '@/lib/review/reviewPromptBuilder'
import { generateText } from '@/lib/llm/openaiClient'
import { saveReviewToHistory } from '@/lib/supabase/actions'
import { assertBillingAccess } from '@/lib/billing/guard'
import { logAiUsage } from '@/lib/billing/aiUsageLog'
import { sanitizeSuggestion } from '@/lib/review/suggestionGuard'
import {
  dropInapplicableFindings,
  filterLegalBasis,
} from '@/lib/review/citationGuard'
import { detectContractFamily } from '@/lib/review/reviewPromptBuilder'
import { triageRiskyClauses } from '@/lib/review/findingTriage'
import { checkRateLimit, getClientIp, rateLimitResponse } from '@/lib/rateLimit'
import { formatOpenAiUserHint } from '@/lib/llm/userVisibleLlmError'
import type { ReviewContractRequest, ReviewContractResponse } from '@/lib/review/types'

/** Maximum contract text length — ~50 pages of dense legal text */
const MAX_CONTRACT_LENGTH = 100_000

export async function POST(req: NextRequest): Promise<NextResponse> {
  // ── 0a. Rate limit ────────────────────────────────────────────────────────
  const ip = getClientIp(req.headers)
  const rl = await checkRateLimit(`rev:${ip}`, { max: 10, windowMs: 60_000 })
  if (!rl.allowed) {
    return rateLimitResponse(rl, 'Příliš mnoho požadavků. Zkuste to za chvíli.')
  }

  // ── 0b. Billing guard ─────────────────────────────────────────────────────
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
  let tokensUsed = 0
  let modelUsed = 'default'
  try {
    const result = await generateText({
      systemPrompt,
      userPrompt,
      temperature: 0.1,
      maxTokens: 4096,
      jsonMode: true,
    })
    rawText = result.text
    tokensUsed = result.tokensUsed
    modelUsed = result.model
  } catch (err) {
    const hint = formatOpenAiUserHint(err, 'cs')
    console.error('[review-contract] LLM error:', err)
    return errorResponse(
      'Chyba při komunikaci s AI. Zkuste to znovu.',
      'LLM_ERROR',
      502,
      hint,
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

  // Which body of law actually governs this document. The same answer the
  // prompt was built from, so the guard below cannot disagree with the checklist
  // the model was given.
  const family = detectContractFamily({
    contractText: body.contractText,
    contractTypeHint: body.contractTypeHint,
  })

  // Findings resting on a provision that does not govern this contract type are
  // dropped, not softened. A dohoda reviewed against § 213 and § 51 produced two
  // high-severity defects in a lawful contract; nothing in that reasoning
  // survives removing the provision it started from.
  // A finding whose own explanation concludes the clause is lawful is not a
  // risk. It keeps its substance but moves to the negotiation points, where
  // "lawful but could be sharper" belongs.
  const triaged = triageRiskyClauses(
    dropInapplicableFindings(
      Array.isArray(parsed.riskyClauses)
        ? parsed.riskyClauses.map(normalizeRiskyClause).filter(isValidRiskyClause)
        : [],
      family,
      'risky clause',
    ),
  )
  const riskyClauses = triaged.risky

  const missingClauses = dropInapplicableFindings(
    Array.isArray(parsed.missingClauses)
      ? parsed.missingClauses.map(normalizeMissingClause).filter(isValidMissingClause)
      : [],
    family,
    'missing clause',
  )

  const response: ReviewContractResponse = {
    overallRisk: validateRisk(parsed.overallRisk),
    summary: String(parsed.summary),
    riskyClauses,
    missingClauses,
    negotiationFlags: [
      ...(Array.isArray(parsed.negotiationFlags)
        ? parsed.negotiationFlags.filter(isNonEmptyString).map(String)
        : []),
      ...triaged.movedToNegotiation,
    ],
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
      ? filterLegalBasis(parsed.legalBasis.filter(isNonEmptyString).map(String), family)
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

  if (guard.user && tokensUsed > 0) {
    logAiUsage({
      userId: guard.user.id,
      action: 'review',
      model: modelUsed,
      tokensUsed,
    })
  }

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
    ...(() => {
      const safe = typeof c.suggestedRevision === 'string'
        ? sanitizeSuggestion(c.suggestedRevision)
        : undefined
      return safe ? { suggestedRevision: safe } : {}
    })(),
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
    ...(() => {
      const safe = typeof c.suggestedClause === 'string'
        ? sanitizeSuggestion(c.suggestedClause)
        : undefined
      return safe ? { suggestedClause: safe } : {}
    })(),
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
  hint?: string,
): NextResponse {
  const body: Record<string, string> = { error: message, code }
  if (hint?.trim()) body.hint = hint.trim()
  return NextResponse.json(body, { status })
}
