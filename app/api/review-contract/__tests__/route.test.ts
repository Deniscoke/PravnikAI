/**
 * API integration tests for POST /api/review-contract
 *
 * What is tested:
 *  1.  Valid structured LLM response → 200 + correctly shaped ReviewContractResponse
 *  2.  Empty model JSON ({}) → 502 PARSE_ERROR, not misleading success
 *  3.  Garbage riskyClauses items (primitives, nulls) → filtered out
 *  4.  Garbage missingClauses items → filtered out
 *  5.  Non-string negotiationFlags/assumptions/legalBasis → filtered out
 *  6.  Missing contractText → 400
 *  7.  Too-short contractText (< 50 chars) → 400
 *  8.  Oversized contractText (> 100K chars) → 413
 *  9.  Malformed JSON body → 400
 * 10.  LLM throws → 502 LLM_ERROR
 * 11.  LLM returns non-JSON text → 502 PARSE_ERROR
 * 12.  Valid risky/missing clauses are preserved alongside filtered garbage
 *
 * No real OpenAI calls are made. generateText is replaced by vi.mock.
 *
 * Run:
 *   npx vitest run app/api/review-contract/__tests__/route.test.ts
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'

// ── Mocks must be declared BEFORE the route import ──────────────────────────
vi.mock('@/lib/llm/openaiClient', () => ({
  generateText: vi.fn(),
}))

// Mock billing guard — tests focus on business logic, not auth/billing
vi.mock('@/lib/billing/guard', () => ({
  assertBillingAccess: vi.fn().mockResolvedValue({ allowed: true, userId: 'test-user-id' }),
}))

// Mock rate limiter — tests should not be rate-limited
vi.mock('@/lib/rateLimit', () => ({
  checkRateLimit: vi.fn().mockReturnValue({ allowed: true, remaining: 9, resetAt: Date.now() + 60_000 }),
  getClientIp: vi.fn().mockReturnValue('127.0.0.1'),
}))

import { POST } from '@/app/api/review-contract/route'
import { generateText } from '@/lib/llm/openaiClient'
import type { ReviewContractResponse } from '@/lib/review/types'

// ─── Fixtures ────────────────────────────────────────────────────────────────

/** Minimal valid contract text (> 50 chars) */
const VALID_CONTRACT = 'Kupní smlouva uzavřená dle § 2079 zákona č. 89/2012 Sb. mezi stranami níže uvedenými.'

/** A well-formed LLM JSON response with all fields populated */
const GOOD_LLM_RESPONSE = {
  overallRisk: 'medium',
  summary: 'Smlouva obsahuje několik nevyvážených ustanovení vyžadujících pozornost.',
  riskyClauses: [
    {
      title: 'Jednostranná změna podmínek',
      severity: 'high',
      explanation: 'Klauzule umožňuje prodávajícímu jednostranně měnit podmínky bez souhlasu kupujícího, což je v rozporu s § 1752 NOZ.',
      suggestedRevision: 'Doplnit požadavek na písemný souhlas obou stran.',
    },
  ],
  missingClauses: [
    {
      title: 'Ustanovení o odstoupení od smlouvy',
      reason: 'Dle § 2001 NOZ má strana právo odstoupit při podstatném porušení. Smlouva toto neupravuje.',
      suggestedClause: 'Každá smluvní strana je oprávněna od této smlouvy odstoupit...',
    },
  ],
  negotiationFlags: ['Smluvní pokuta je nastavena jednostranně ve prospěch prodávajícího'],
  lawyerReviewRequired: true,
  disclaimer: 'Tato analýza byla provedena AI a neslouží jako právní poradenství.',
  detectedContractType: 'Kupní smlouva',
  assumptions: ['Předpokládám, že se jedná o spotřebitelskou smlouvu'],
  legalBasis: ['§ 2079 zák. č. 89/2012 Sb.', '§ 1752 zák. č. 89/2012 Sb.'],
  reviewMode: 'ai-assisted-review',
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function mockLLMSuccess(responseObj: Record<string, unknown> = GOOD_LLM_RESPONSE) {
  vi.mocked(generateText).mockResolvedValueOnce({
    text: JSON.stringify(responseObj),
    tokensUsed: 800,
  })
}

function mockLLMFailure(message = 'OpenAI API timeout') {
  vi.mocked(generateText).mockRejectedValueOnce(new Error(message))
}

function mockLLMRawText(raw: string) {
  vi.mocked(generateText).mockResolvedValueOnce({ text: raw, tokensUsed: 0 })
}

function makeRequest(body: unknown): NextRequest {
  return new NextRequest('http://localhost/api/review-contract', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}

function makeRawRequest(raw: string): NextRequest {
  return new NextRequest('http://localhost/api/review-contract', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: raw,
  })
}

// ─── Tests ───────────────────────────────────────────────────────────────────

beforeEach(() => {
  // Reset mock state between tests — prevents queued return values bleeding across tests.
  // Use mockReset (not restoreAllMocks) to preserve the vi.mock module replacement.
  vi.mocked(generateText).mockReset()
})

describe('POST /api/review-contract', () => {

  // ── 1. Happy path ──────────────────────────────────────────────────────────

  it('returns 200 with correctly shaped response for valid input + valid LLM output', async () => {
    mockLLMSuccess()
    const res = await POST(makeRequest({ contractText: VALID_CONTRACT }))
    expect(res.status).toBe(200)

    const data: ReviewContractResponse = await res.json()
    expect(data.overallRisk).toBe('medium')
    expect(data.summary).toContain('nevyvážených')
    expect(data.riskyClauses).toHaveLength(1)
    expect(data.riskyClauses[0].title).toBe('Jednostranná změna podmínek')
    expect(data.riskyClauses[0].severity).toBe('high')
    expect(data.riskyClauses[0].explanation).toContain('§ 1752')
    expect(data.riskyClauses[0].suggestedRevision).toBeDefined()
    expect(data.missingClauses).toHaveLength(1)
    expect(data.missingClauses[0].suggestedClause).toBeDefined()
    expect(data.negotiationFlags).toHaveLength(1)
    expect(data.lawyerReviewRequired).toBe(true)
    expect(data.disclaimer).toBeTruthy()
    expect(data.reviewedAt).toBeTruthy()
    expect(data.reviewMode).toBe('ai-assisted-review')
    expect(data.detectedContractType).toBe('Kupní smlouva')
    expect(data.assumptions).toHaveLength(1)
    expect(data.legalBasis).toHaveLength(2)
  })

  // ── 2. Empty model JSON → error, not misleading success ────────────────────

  it('rejects empty LLM JSON ({}) as PARSE_ERROR — no fake "medium risk" success', async () => {
    mockLLMSuccess({})
    const res = await POST(makeRequest({ contractText: VALID_CONTRACT }))
    expect(res.status).toBe(502)

    const data = await res.json()
    expect(data.code).toBe('PARSE_ERROR')
    expect(data.error).toContain('smysluplnou analýzu')
  })

  it('rejects LLM JSON with summary but no overallRisk', async () => {
    mockLLMSuccess({ summary: 'Something', overallRisk: 'invalid-value' })
    const res = await POST(makeRequest({ contractText: VALID_CONTRACT }))
    expect(res.status).toBe(502)
    expect((await res.json()).code).toBe('PARSE_ERROR')
  })

  it('rejects LLM JSON with overallRisk but empty summary', async () => {
    mockLLMSuccess({ overallRisk: 'low', summary: '   ' })
    const res = await POST(makeRequest({ contractText: VALID_CONTRACT }))
    expect(res.status).toBe(502)
    expect((await res.json()).code).toBe('PARSE_ERROR')
  })

  // ── 3. Garbage riskyClauses are filtered out ───────────────────────────────

  it('filters out primitive riskyClauses items (numbers, strings, null)', async () => {
    mockLLMSuccess({
      ...GOOD_LLM_RESPONSE,
      riskyClauses: [
        42,
        null,
        'just a string',
        GOOD_LLM_RESPONSE.riskyClauses[0], // the one valid clause
      ],
    })
    const res = await POST(makeRequest({ contractText: VALID_CONTRACT }))
    expect(res.status).toBe(200)

    const data: ReviewContractResponse = await res.json()
    // Only the valid clause survives
    expect(data.riskyClauses).toHaveLength(1)
    expect(data.riskyClauses[0].title).toBe('Jednostranná změna podmínek')
  })

  it('filters out riskyClauses with missing explanation (empty or absent)', async () => {
    mockLLMSuccess({
      ...GOOD_LLM_RESPONSE,
      riskyClauses: [
        { title: 'Has title but no explanation', severity: 'high' },
        { title: 'Has title with empty explanation', severity: 'medium', explanation: '' },
        { title: 'Whitespace explanation', severity: 'low', explanation: '   ' },
      ],
    })
    const res = await POST(makeRequest({ contractText: VALID_CONTRACT }))
    const data: ReviewContractResponse = await res.json()
    expect(data.riskyClauses).toHaveLength(0)
  })

  // ── 4. Garbage missingClauses are filtered out ─────────────────────────────

  it('filters out missingClauses with empty title or reason', async () => {
    mockLLMSuccess({
      ...GOOD_LLM_RESPONSE,
      missingClauses: [
        { title: '', reason: 'Has reason but no title' },
        { title: 'Has title', reason: '' },
        { reason: 'No title at all' },
        GOOD_LLM_RESPONSE.missingClauses[0], // valid
      ],
    })
    const res = await POST(makeRequest({ contractText: VALID_CONTRACT }))
    const data: ReviewContractResponse = await res.json()
    expect(data.missingClauses).toHaveLength(1)
    expect(data.missingClauses[0].title).toBe('Ustanovení o odstoupení od smlouvy')
  })

  // ── 5. Non-string arrays are filtered ──────────────────────────────────────

  it('filters out non-string negotiationFlags', async () => {
    mockLLMSuccess({
      ...GOOD_LLM_RESPONSE,
      negotiationFlags: [
        'Valid flag',
        42,
        null,
        { nested: 'object' },
        '',
        '   ',
        'Another valid flag',
      ],
    })
    const res = await POST(makeRequest({ contractText: VALID_CONTRACT }))
    const data: ReviewContractResponse = await res.json()
    expect(data.negotiationFlags).toEqual(['Valid flag', 'Another valid flag'])
  })

  it('filters out non-string assumptions', async () => {
    mockLLMSuccess({
      ...GOOD_LLM_RESPONSE,
      assumptions: [true, 123, { obj: true }, 'Valid assumption'],
    })
    const res = await POST(makeRequest({ contractText: VALID_CONTRACT }))
    const data: ReviewContractResponse = await res.json()
    expect(data.assumptions).toEqual(['Valid assumption'])
  })

  it('filters out non-string legalBasis', async () => {
    mockLLMSuccess({
      ...GOOD_LLM_RESPONSE,
      legalBasis: [null, undefined, 0, '§ 2079 NOZ'],
    })
    const res = await POST(makeRequest({ contractText: VALID_CONTRACT }))
    const data: ReviewContractResponse = await res.json()
    expect(data.legalBasis).toEqual(['§ 2079 NOZ'])
  })

  // ── 6–9. Input validation ──────────────────────────────────────────────────

  it('returns 400 when contractText is missing', async () => {
    const res = await POST(makeRequest({}))
    expect(res.status).toBe(400)
    expect((await res.json()).code).toBe('VALIDATION_FAILED')
  })

  it('returns 400 when contractText is too short (< 50 chars)', async () => {
    const res = await POST(makeRequest({ contractText: 'Příliš krátký text.' }))
    expect(res.status).toBe(400)
    const data = await res.json()
    expect(data.code).toBe('VALIDATION_FAILED')
    expect(data.error).toContain('krátký')
  })

  it('returns 413 when contractText exceeds 100K chars', async () => {
    const oversized = 'a'.repeat(100_001)
    const res = await POST(makeRequest({ contractText: oversized }))
    expect(res.status).toBe(413)
    const data = await res.json()
    expect(data.code).toBe('VALIDATION_FAILED')
    expect(data.error).toContain('dlouhý')
  })

  it('returns 400 for malformed JSON body', async () => {
    const res = await POST(makeRawRequest('{not valid json!!!'))
    expect(res.status).toBe(400)
    expect((await res.json()).code).toBe('VALIDATION_FAILED')
  })

  // ── 10–11. LLM failure modes ───────────────────────────────────────────────

  it('returns 502 LLM_ERROR when generateText throws', async () => {
    mockLLMFailure()
    const res = await POST(makeRequest({ contractText: VALID_CONTRACT }))
    expect(res.status).toBe(502)
    const data = await res.json()
    expect(data.code).toBe('LLM_ERROR')
    // Must not leak internal error message
    expect(data.error).not.toContain('OpenAI')
    expect(data.error).not.toContain('timeout')
  })

  it('returns 502 PARSE_ERROR when LLM returns non-JSON text', async () => {
    mockLLMRawText('Sorry, I cannot analyze this contract.')
    const res = await POST(makeRequest({ contractText: VALID_CONTRACT }))
    expect(res.status).toBe(502)
    expect((await res.json()).code).toBe('PARSE_ERROR')
  })

  // ── 12. Mixed valid + garbage clauses — valid ones survive ─────────────────

  it('preserves valid clauses alongside filtered garbage in the same array', async () => {
    const validClause = {
      title: 'Smluvní pokuta',
      severity: 'medium',
      explanation: 'Nepřiměřeně vysoká smluvní pokuta dle § 2048 NOZ.',
    }
    mockLLMSuccess({
      ...GOOD_LLM_RESPONSE,
      riskyClauses: [
        null,
        42,
        { title: 'No explanation' },
        validClause,
        { explanation: 'No title' },
      ],
    })
    const res = await POST(makeRequest({ contractText: VALID_CONTRACT }))
    const data: ReviewContractResponse = await res.json()
    expect(data.riskyClauses).toHaveLength(1)
    expect(data.riskyClauses[0].title).toBe('Smluvní pokuta')
    expect(data.riskyClauses[0].explanation).toContain('§ 2048')
  })

  // ── 13. contractTypeHint is passed through ─────────────────────────────────

  it('passes contractTypeHint to the prompt builder', async () => {
    mockLLMSuccess()
    const res = await POST(makeRequest({
      contractText: VALID_CONTRACT,
      contractTypeHint: 'Nájemní smlouva',
    }))
    expect(res.status).toBe(200)

    // Verify generateText was called with correct options
    expect(vi.mocked(generateText)).toHaveBeenCalledOnce()
    const callArgs = vi.mocked(generateText).mock.calls[0][0]
    expect(callArgs.jsonMode).toBe(true)
    expect(callArgs.temperature).toBe(0.1)
    // The hint should appear in the user prompt when provided
    expect(callArgs.userPrompt).toContain('Nájemní smlouva')
    expect(callArgs.userPrompt).toContain('uživatelem zadaný')
  })

  // ── 14. Response shape invariants ──────────────────────────────────────────

  it('always includes reviewMode and reviewedAt regardless of LLM output', async () => {
    // LLM response missing reviewMode and with wrong reviewedAt
    mockLLMSuccess({
      overallRisk: 'low',
      summary: 'Smlouva je v pořádku.',
      riskyClauses: [],
      missingClauses: [],
      negotiationFlags: [],
      lawyerReviewRequired: false,
    })
    const res = await POST(makeRequest({ contractText: VALID_CONTRACT }))
    const data: ReviewContractResponse = await res.json()
    expect(data.reviewMode).toBe('ai-assisted-review')
    expect(data.reviewedAt).toBeTruthy()
    // Server generates reviewedAt, not the LLM
    expect(() => new Date(data.reviewedAt).toISOString()).not.toThrow()
  })

  it('defaults lawyerReviewRequired to true when LLM omits it', async () => {
    mockLLMSuccess({
      overallRisk: 'high',
      summary: 'Závažné problémy.',
      // lawyerReviewRequired intentionally omitted
    })
    const res = await POST(makeRequest({ contractText: VALID_CONTRACT }))
    const data: ReviewContractResponse = await res.json()
    expect(data.lawyerReviewRequired).toBe(true)
  })
})
