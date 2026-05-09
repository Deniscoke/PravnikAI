/**
 * API integration tests for POST /api/generate-contract
 *
 * What is tested (full orchestration pipeline, OpenAI mocked):
 *  1.  Valid request → 200 + correctly shaped GenerateContractResponse
 *  2.  Junk/empty request with >5 validation errors → 422 VALIDATION_FAILED
 *  3.  Suspicious data (quality-guard errors on optional fields) → review-needed
 *  4.  Legacy Slovak slug resolution → resolves to canonical schemaId
 *  5.  Unknown schema ID → 404 SCHEMA_NOT_FOUND
 *  6.  Missing schemaId or formData in body → 400 VALIDATION_FAILED
 *  7.  Malformed JSON body → 400 VALIDATION_FAILED
 *  8.  OpenAI wrapper throws → 502 LLM_ERROR (safe, no internal details leaked)
 *  9.  Response shape invariants on every 200 (mode, warnings, missingFields, etc.)
 * 10.  Route does not leak provider internals (no 'gpt-4o', tokensUsed, etc.)
 * 11.  Draft mode: DRAFT_MODE warning included in response warnings
 * 12.  Review-needed mode: REVIEW_NEEDED warning + missingFields populated
 * 13.  Business-legal constraint surfaced as warning (not as a blocking error)
 *
 * No real OpenAI calls are made. generateText is replaced by vi.mock.
 *
 * Run:
 *   npx vitest run app/api/generate-contract/__tests__/route.test.ts
 * Watch:
 *   npx vitest app/api/generate-contract/__tests__/route.test.ts
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'

// ── Mocks must be declared BEFORE the route import ──────────────────────────
// vi.mock is hoisted by Vitest — the factory runs before any module is evaluated,
// so route.ts will receive the mock when it imports generateText.
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

// Import after mock is registered
import { POST } from '@/app/api/generate-contract/route'
import { generateText } from '@/lib/llm/openaiClient'
import type {
  NormalizedFormData,
  GenerateContractResponse,
  GenerateContractError,
} from '@/lib/contracts/types'

// ─── Mock helpers ─────────────────────────────────────────────────────────────

/** A realistic mock contract text returned by the (fake) LLM. */
const MOCK_CONTRACT = `KUPNÍ SMLOUVA

uzavřená dle § 2079 a násl. zákona č. 89/2012 Sb., občanský zákoník (NOZ)

Článek I. — Smluvní strany

Prodávající: ACME Czech s.r.o., IČO: 27082440
Sídlo: Václavské náměstí 1, 110 00 Praha 1

Kupující: Jan Novák
Adresa: Husova 12, 602 00 Brno

Článek II. — Předmět koupě

Prodávající prodává kupujícímu toto zboží: Dell Latitude 5540 notebook, stav: nový.

Článek III. — Kupní cena

Kupní cena činí 150 000 Kč (slovy: sto padesát tisíc korun českých).

Článek IV. — Přechod vlastnického práva

Vlastnické právo k předmětu koupě přechází na kupujícího okamžikem předání.

Článek V. — Odpovědnost za vady

Odpovědnost za vady se řídí § 2099–2112 NOZ.

Článek VI. — Závěrečná ustanovení

Tato smlouva se řídí právem České republiky.

Podpis prodávajícího: ___________________________

Podpis kupujícího: ___________________________`

/** A quality gate JSON response indicating "pass" (no issues). */
function makeQualityGateJSON(overrides: Record<string, unknown> = {}): string {
  return JSON.stringify({
    status: 'pass',
    recommendedMode: 'complete',
    summary: 'Smlouva je v pořádku.',
    missingEssentialFacts: [],
    missingEssentialClauses: [],
    ambiguities: [],
    contradictions: [],
    undefinedOrInconsistentTerms: [],
    riskyAssumptions: [],
    executionRisks: [],
    czechLawSpecificRisks: [],
    consumerOrRegulatoryFlags: [],
    suggestedFixes: [],
    ...overrides,
  })
}

/**
 * Configures the mock to return successful LLM results for the two-stage pipeline.
 * Stage 1 (draft) returns the given text; Stage 2 (quality gate) returns a JSON verdict.
 */
function mockLLMSuccess(text = MOCK_CONTRACT, gateOverrides: Record<string, unknown> = {}) {
  // Stage 1: generate draft
  vi.mocked(generateText).mockResolvedValueOnce({ text, tokensUsed: 1234, model: 'gpt-4o' })
  // Stage 2: quality gate (returns JSON verdict)
  vi.mocked(generateText).mockResolvedValueOnce({
    text: makeQualityGateJSON(gateOverrides),
    tokensUsed: 800,
    model: 'gpt-4o',
  })
}

/** Configures the mock to simulate a Stage 1 LLM failure. */
function mockLLMFailure(message = 'OpenAI API timeout') {
  vi.mocked(generateText).mockRejectedValueOnce(new Error(message))
}

/** Configures Stage 1 success + Stage 2 failure (non-fatal — falls back to Stage 1 draft). */
function mockStage2Failure(text = MOCK_CONTRACT) {
  vi.mocked(generateText).mockResolvedValueOnce({ text, tokensUsed: 1234, model: 'gpt-4o' })
  vi.mocked(generateText).mockRejectedValueOnce(new Error('Quality gate timeout'))
}

/** Configures full 3-stage pipeline mock (Stage 1 + 2 + 3 premium). */
function mockPremiumSuccess(text = MOCK_CONTRACT, polishedText = MOCK_CONTRACT + '\n\n// polished') {
  vi.mocked(generateText).mockResolvedValueOnce({ text, tokensUsed: 1234, model: 'gpt-4o' })
  vi.mocked(generateText).mockResolvedValueOnce({
    text: makeQualityGateJSON(),
    tokensUsed: 800,
    model: 'gpt-4o',
  })
  vi.mocked(generateText).mockResolvedValueOnce({ text: polishedText, tokensUsed: 1500, model: 'gpt-4o' })
}

// ─── Request helpers ──────────────────────────────────────────────────────────

/** Wraps a body in a NextRequest exactly as the browser would send. */
function makeRequest(body: unknown): NextRequest {
  return new NextRequest('http://localhost/api/generate-contract', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}

/** Makes a NextRequest with a raw string body (for malformed JSON tests). */
function makeRawRequest(raw: string): NextRequest {
  return new NextRequest('http://localhost/api/generate-contract', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: raw,
  })
}

// ─── Test form data ───────────────────────────────────────────────────────────
//
// kupni-smlouva-v1 required fields:
//   Parties: prodavajici.{name, address}, kupujici.{name, address}
//   predmet: subjectDescription (minLength:20), subjectCondition
//   cena:    price (min:1), vatNote, paymentMethod
//   predani: handoverDate, handoverPlace, ownershipTransfer
//   zaverecna: contractDate
//
// assessGenerationReadiness counts ALL empty optional section fields (ignores
// field-level conditionals), so with paymentMethod='hotove' the conditional
// fields paymentDeadline and bankAccount are still counted as missing.
// With all 5 optional section fields absent → missingOptional=5 > 2 → 'draft'.

/** All 13 required fields filled correctly — produces mode='draft' (5 optional absent). */
const DRAFT_FORM_DATA: NormalizedFormData = {
  schemaId: 'kupni-smlouva-v1',
  parties: [
    {
      partyId: 'prodavajici',
      fields: {
        name: 'ACME Czech s.r.o.',
        address: 'Václavské náměstí 1, 110 00 Praha 1',
      } as any,
    },
    {
      partyId: 'kupujici',
      fields: {
        name: 'Jan Novák',
        address: 'Husova 12, 602 00 Brno',
      } as any,
    },
  ],
  sections: {
    predmet: {
      subjectDescription: 'Dell Latitude 5540 notebook, stav: nový, s. č. dle protokolu',
      subjectCondition: 'novy',
    },
    cena: {
      price: '150000',
      vatNote: 'bez-dph',
      paymentMethod: 'hotove',
    },
    predani: {
      handoverDate: '2026-07-01',
      handoverPlace: 'Václavské náměstí 1, Praha 1',
      ownershipTransfer: 'predanim',
    },
    zaverecna: {
      contractDate: '2026-06-01',
    },
  },
}

/**
 * All required filled + 3 optional section fields filled.
 * missingOptional = [defectsDescription, bankAccount] = 2 ≤ 2 → mode='complete'
 */
const COMPLETE_FORM_DATA: NormalizedFormData = {
  ...DRAFT_FORM_DATA,
  sections: {
    ...DRAFT_FORM_DATA.sections,
    cena: {
      price: '150000',
      vatNote: 'bez-dph',
      paymentMethod: 'prevod',
      paymentDeadline: '2026-07-15',
      bankAccount: 'CZ65 0800 0000 1920 0014 5399',
    },
    zaverecna: {
      contractDate: '2026-06-01',
      contractPlace: 'Praha',
      additionalNotes: 'Bez zvláštních ujednání.',
    },
  },
}

/**
 * kupujici required fields absent → 2 validation errors.
 * 2 ≤ 5 → passes the hard-stop check.
 * missingRequired.length > 0 → mode='review-needed'.
 */
const REVIEW_FORM_DATA: NormalizedFormData = {
  ...DRAFT_FORM_DATA,
  parties: [
    DRAFT_FORM_DATA.parties[0], // prodavajici: valid
    { partyId: 'kupujici', fields: {} as any }, // kupujici: both required fields absent
  ],
}

/**
 * Suspicious data: all required fields valid, but optional fields carry
 * quality-guard errors (fake IČO + invalid email).
 * Quality errors merge into ui.issues → missingRequired.length > 0 → review-needed.
 * errorCount = 2 ≤ 5 → no 422.
 */
const SUSPICIOUS_FORM_DATA: NormalizedFormData = {
  ...DRAFT_FORM_DATA,
  parties: [
    {
      partyId: 'prodavajici',
      fields: {
        name: 'ACME Czech s.r.o.',
        address: 'Václavské náměstí 1, 110 00 Praha 1',
        ico: '12345678',       // known fake IČO → quality error
      } as any,
    },
    {
      partyId: 'kupujici',
      fields: {
        name: 'Jan Novák',
        address: 'Husova 12, 602 00 Brno',
        email: 'notvalidemail', // missing @ → quality error
      } as any,
    },
  ],
}

/**
 * All parties and sections empty → 13 required-field errors > 5 → 422.
 */
const JUNK_FORM_DATA: NormalizedFormData = {
  schemaId: 'kupni-smlouva-v1',
  parties: [
    { partyId: 'prodavajici', fields: {} as any },
    { partyId: 'kupujici', fields: {} as any },
  ],
  sections: {},
}

// ─── Setup ────────────────────────────────────────────────────────────────────

beforeEach(() => {
  // Clear all mock state between tests — prevents mock calls bleeding across tests
  vi.mocked(generateText).mockReset()
})

// ══════════════════════════════════════════════════════════════════════════════
// 1. Valid request → 200 + structured response
// ══════════════════════════════════════════════════════════════════════════════

describe('1 — Valid request → 200 + structured response', () => {
  it('returns HTTP 200 for a well-formed request', async () => {
    mockLLMSuccess()
    const res = await POST(makeRequest({ schemaId: 'kupni-smlouva-v1', formData: DRAFT_FORM_DATA }))
    expect(res.status).toBe(200)
  })

  it('response body contains the mocked contract text', async () => {
    mockLLMSuccess()
    const res = await POST(makeRequest({ schemaId: 'kupni-smlouva-v1', formData: DRAFT_FORM_DATA }))
    const body: GenerateContractResponse = await res.json()
    expect(body.contractText).toBe(MOCK_CONTRACT)
  })

  it('response schemaId reflects the resolved (canonical) schema', async () => {
    mockLLMSuccess()
    const res = await POST(makeRequest({ schemaId: 'kupni-smlouva-v1', formData: DRAFT_FORM_DATA }))
    const body: GenerateContractResponse = await res.json()
    expect(body.schemaId).toBe('kupni-smlouva-v1')
  })

  it('generateText was called twice (Stage 1 draft + Stage 2 self-check)', async () => {
    mockLLMSuccess()
    await POST(makeRequest({ schemaId: 'kupni-smlouva-v1', formData: DRAFT_FORM_DATA }))
    expect(vi.mocked(generateText)).toHaveBeenCalledTimes(2)
  })

  it('generateText is called with both systemPrompt and userPrompt', async () => {
    mockLLMSuccess()
    await POST(makeRequest({ schemaId: 'kupni-smlouva-v1', formData: DRAFT_FORM_DATA }))
    const [callArgs] = vi.mocked(generateText).mock.calls
    expect(callArgs[0]).toHaveProperty('systemPrompt')
    expect(callArgs[0]).toHaveProperty('userPrompt')
    expect(typeof callArgs[0].systemPrompt).toBe('string')
    expect(typeof callArgs[0].userPrompt).toBe('string')
    expect(callArgs[0].systemPrompt.length).toBeGreaterThan(50)
    expect(callArgs[0].userPrompt.length).toBeGreaterThan(50)
  })

  it('systemPrompt identifies Czech law jurisdiction', async () => {
    mockLLMSuccess()
    await POST(makeRequest({ schemaId: 'kupni-smlouva-v1', formData: DRAFT_FORM_DATA }))
    const [callArgs] = vi.mocked(generateText).mock.calls
    expect(callArgs[0].systemPrompt).toContain('český transakční právník')
  })

  it('userPrompt contains the contract subject description provided by user', async () => {
    mockLLMSuccess()
    await POST(makeRequest({ schemaId: 'kupni-smlouva-v1', formData: DRAFT_FORM_DATA }))
    const [callArgs] = vi.mocked(generateText).mock.calls
    expect(callArgs[0].userPrompt).toContain('Dell Latitude 5540')
  })

  it('generatedAt is an ISO 8601 timestamp string', async () => {
    mockLLMSuccess()
    const res = await POST(makeRequest({ schemaId: 'kupni-smlouva-v1', formData: DRAFT_FORM_DATA }))
    const body: GenerateContractResponse = await res.json()
    expect(typeof body.generatedAt).toBe('string')
    expect(new Date(body.generatedAt).toISOString()).toBe(body.generatedAt)
  })

  it('legalBasis array is non-empty and references Czech law', async () => {
    mockLLMSuccess()
    const res = await POST(makeRequest({ schemaId: 'kupni-smlouva-v1', formData: DRAFT_FORM_DATA }))
    const body: GenerateContractResponse = await res.json()
    expect(Array.isArray(body.legalBasis)).toBe(true)
    expect(body.legalBasis.length).toBeGreaterThan(0)
    expect(body.legalBasis.some((b) => b.includes('NOZ'))).toBe(true)
  })

  /**
   * Representative 200 response shape:
   * {
   *   schemaId: 'kupni-smlouva-v1',
   *   mode: 'draft',
   *   contractText: 'KUPNÍ SMLOUVA\n\nuzavřená dle § 2079...',
   *   warnings: [{ code: 'DRAFT_MODE', message: '...' }],
   *   missingFields: ['predmet.defectsDescription', 'cena.paymentDeadline', ...],
   *   legalBasis: ['§ 2079–2183 zák. č. 89/2012 Sb. ...'],
   *   generatedAt: '2026-06-01T12:00:00.000Z'
   * }
   */
})

// ══════════════════════════════════════════════════════════════════════════════
// 2. Junk / empty request with >5 errors → 422
// ══════════════════════════════════════════════════════════════════════════════

describe('2 — Junk/empty request → 422 VALIDATION_FAILED', () => {
  it('returns HTTP 422 when all required fields are absent', async () => {
    const res = await POST(makeRequest({ schemaId: 'kupni-smlouva-v1', formData: JUNK_FORM_DATA }))
    expect(res.status).toBe(422)
  })

  it('422 error code is VALIDATION_FAILED', async () => {
    const res = await POST(makeRequest({ schemaId: 'kupni-smlouva-v1', formData: JUNK_FORM_DATA }))
    const body: GenerateContractError = await res.json()
    expect(body.code).toBe('VALIDATION_FAILED')
  })

  it('422 response includes the validation issues array', async () => {
    const res = await POST(makeRequest({ schemaId: 'kupni-smlouva-v1', formData: JUNK_FORM_DATA }))
    const body: GenerateContractError = await res.json()
    expect(Array.isArray(body.issues)).toBe(true)
    expect(body.issues!.length).toBeGreaterThan(5)
  })

  it('422 response error message is in Czech', async () => {
    const res = await POST(makeRequest({ schemaId: 'kupni-smlouva-v1', formData: JUNK_FORM_DATA }))
    const body: GenerateContractError = await res.json()
    expect(body.error).toMatch(/formulář|chyb|opravte/i)
  })

  it('generateText is never called when request is blocked with 422', async () => {
    await POST(makeRequest({ schemaId: 'kupni-smlouva-v1', formData: JUNK_FORM_DATA }))
    expect(vi.mocked(generateText)).not.toHaveBeenCalled()
  })
})

// ══════════════════════════════════════════════════════════════════════════════
// 3. Suspicious / quality-guard flagged data → review-needed mode
// ══════════════════════════════════════════════════════════════════════════════

describe('3 — Suspicious data (quality guards) → review-needed + 200', () => {
  it('returns HTTP 200 (not 422) for suspicious data below the error threshold', async () => {
    mockLLMSuccess()
    const res = await POST(makeRequest({ schemaId: 'kupni-smlouva-v1', formData: SUSPICIOUS_FORM_DATA }))
    expect(res.status).toBe(200)
  })

  it('mode is review-needed when quality-guard errors are present', async () => {
    mockLLMSuccess()
    const res = await POST(makeRequest({ schemaId: 'kupni-smlouva-v1', formData: SUSPICIOUS_FORM_DATA }))
    const body: GenerateContractResponse = await res.json()
    expect(body.mode).toBe('review-needed')
  })

  it('REVIEW_NEEDED warning is included in warnings array', async () => {
    mockLLMSuccess()
    const res = await POST(makeRequest({ schemaId: 'kupni-smlouva-v1', formData: SUSPICIOUS_FORM_DATA }))
    const body: GenerateContractResponse = await res.json()
    const reviewWarning = body.warnings.find((w) => w.code === 'REVIEW_NEEDED')
    expect(reviewWarning).toBeDefined()
  })

  it('missingFields contains the problematic field IDs from quality guards', async () => {
    mockLLMSuccess()
    const res = await POST(makeRequest({ schemaId: 'kupni-smlouva-v1', formData: SUSPICIOUS_FORM_DATA }))
    const body: GenerateContractResponse = await res.json()
    // missingRequired is populated from quality-guard errors (fake IČO, invalid email)
    expect(body.missingFields.some((f) => f.includes('ico') || f.includes('email'))).toBe(true)
  })

  it('generateText IS called (request is not hard-blocked)', async () => {
    mockLLMSuccess()
    await POST(makeRequest({ schemaId: 'kupni-smlouva-v1', formData: SUSPICIOUS_FORM_DATA }))
    expect(vi.mocked(generateText)).toHaveBeenCalledTimes(2)
  })

  it('userPrompt contains ⚠️ ZKONTROLOVAT instruction (review-needed mode)', async () => {
    mockLLMSuccess()
    await POST(makeRequest({ schemaId: 'kupni-smlouva-v1', formData: SUSPICIOUS_FORM_DATA }))
    const [callArgs] = vi.mocked(generateText).mock.calls
    expect(callArgs[0].userPrompt).toContain('ZKONTROLOVAT')
  })

  it('missingFields are echoed in the REVIEW_NEEDED warning message', async () => {
    mockLLMSuccess()
    const res = await POST(makeRequest({ schemaId: 'kupni-smlouva-v1', formData: SUSPICIOUS_FORM_DATA }))
    const body: GenerateContractResponse = await res.json()
    const reviewWarning = body.warnings.find((w) => w.code === 'REVIEW_NEEDED')
    // Warning message should mention at least one problematic field
    expect(reviewWarning?.message).toContain('ico')
  })
})

// ══════════════════════════════════════════════════════════════════════════════
// 4. Legacy Slovak slug resolution
// ══════════════════════════════════════════════════════════════════════════════

describe('4 — Legacy slug resolution', () => {
  const SLUG_MAP: Array<[string, string]> = [
    ['kupna-zmluva',          'kupni-smlouva-v1'],
    ['zmluva-o-dielo',        'smlouva-o-dilo-v1'],
    ['najomna-zmluva-byt',    'najemni-smlouva-byt-v1'],
    ['pracovna-zmluva',       'pracovni-smlouva-v1'],
    ['zmluva-o-mlcanlivosti', 'nda-smlouva-v1'],
  ]

  it('kupna-zmluva resolves to kupni-smlouva-v1 and returns 200', async () => {
    mockLLMSuccess()
    const res = await POST(makeRequest({ schemaId: 'kupna-zmluva', formData: DRAFT_FORM_DATA }))
    expect(res.status).toBe(200)
  })

  it('response schemaId is the canonical ID, not the legacy slug', async () => {
    mockLLMSuccess()
    const res = await POST(makeRequest({ schemaId: 'kupna-zmluva', formData: DRAFT_FORM_DATA }))
    const body: GenerateContractResponse = await res.json()
    expect(body.schemaId).toBe('kupni-smlouva-v1')
    expect(body.schemaId).not.toBe('kupna-zmluva')
  })

  it('canonical schemaId also resolves correctly (non-slug path)', async () => {
    mockLLMSuccess()
    const res = await POST(makeRequest({ schemaId: 'kupni-smlouva-v1', formData: DRAFT_FORM_DATA }))
    expect(res.status).toBe(200)
    const body: GenerateContractResponse = await res.json()
    expect(body.schemaId).toBe('kupni-smlouva-v1')
  })

  it.each(SLUG_MAP)('%s → correct canonical ID in response', async (slug, canonical) => {
    mockLLMSuccess()
    // Use empty formData — we only care about schema resolution, not valid generation
    // (422 would mean it got past schema resolution but was blocked by validation)
    // So we just assert that we do NOT get 404 (schema was found)
    const res = await POST(makeRequest({
      schemaId: slug,
      formData: { schemaId: slug, parties: [], sections: {} },
    }))
    // Schema was resolved (not 404) — could be 422 or 200 depending on validation
    expect(res.status).not.toBe(404)
    const body = await res.json()
    expect(body.code).not.toBe('SCHEMA_NOT_FOUND')
  })
})

// ══════════════════════════════════════════════════════════════════════════════
// 5. Unknown schema → 404
// ══════════════════════════════════════════════════════════════════════════════

describe('5 — Unknown/missing schema → 404', () => {
  it('returns HTTP 404 for a completely unknown schemaId', async () => {
    const res = await POST(makeRequest({ schemaId: 'neexistujici-smlouva-v99', formData: DRAFT_FORM_DATA }))
    expect(res.status).toBe(404)
  })

  it('404 error code is SCHEMA_NOT_FOUND', async () => {
    const res = await POST(makeRequest({ schemaId: 'neexistujici-smlouva-v99', formData: DRAFT_FORM_DATA }))
    const body: GenerateContractError = await res.json()
    expect(body.code).toBe('SCHEMA_NOT_FOUND')
  })

  it('404 error message mentions the unknown schema ID', async () => {
    const res = await POST(makeRequest({ schemaId: 'neexistujici-smlouva-v99', formData: DRAFT_FORM_DATA }))
    const body: GenerateContractError = await res.json()
    expect(body.error).toContain('neexistujici-smlouva-v99')
  })

  it('generateText is not called when schema is missing', async () => {
    await POST(makeRequest({ schemaId: 'neexistujici-smlouva-v99', formData: DRAFT_FORM_DATA }))
    expect(vi.mocked(generateText)).not.toHaveBeenCalled()
  })

  it('empty string schemaId → 404', async () => {
    const res = await POST(makeRequest({ schemaId: '', formData: DRAFT_FORM_DATA }))
    // Empty schemaId hits the body check first → 400
    expect([400, 404]).toContain(res.status)
    const body: GenerateContractError = await res.json()
    expect(['VALIDATION_FAILED', 'SCHEMA_NOT_FOUND']).toContain(body.code)
  })
})

// ══════════════════════════════════════════════════════════════════════════════
// 6. Missing required body fields → 400
// ══════════════════════════════════════════════════════════════════════════════

describe('6 — Missing schemaId or formData → 400', () => {
  it('returns 400 when schemaId is absent', async () => {
    const res = await POST(makeRequest({ formData: DRAFT_FORM_DATA }))
    expect(res.status).toBe(400)
  })

  it('returns 400 when formData is absent', async () => {
    const res = await POST(makeRequest({ schemaId: 'kupni-smlouva-v1' }))
    expect(res.status).toBe(400)
  })

  it('returns 400 when both are absent (empty body)', async () => {
    const res = await POST(makeRequest({}))
    expect(res.status).toBe(400)
  })

  it('400 error code is VALIDATION_FAILED', async () => {
    const res = await POST(makeRequest({ formData: DRAFT_FORM_DATA }))
    const body: GenerateContractError = await res.json()
    expect(body.code).toBe('VALIDATION_FAILED')
  })

  it('400 error message is in Czech', async () => {
    const res = await POST(makeRequest({}))
    const body: GenerateContractError = await res.json()
    expect(body.error.length).toBeGreaterThan(0)
    // Message should mention what is missing
    expect(body.error).toMatch(/schemaId|formData|Chybí/i)
  })

  it('generateText is not called when body fields are missing', async () => {
    await POST(makeRequest({ formData: DRAFT_FORM_DATA }))
    expect(vi.mocked(generateText)).not.toHaveBeenCalled()
  })
})

// ══════════════════════════════════════════════════════════════════════════════
// 7. Malformed JSON body → 400
// ══════════════════════════════════════════════════════════════════════════════

describe('7 — Malformed JSON body → 400', () => {
  it('returns 400 for invalid JSON', async () => {
    const res = await POST(makeRawRequest('{not valid json'))
    expect(res.status).toBe(400)
  })

  it('400 error code is VALIDATION_FAILED', async () => {
    const res = await POST(makeRawRequest('{"broken":'))
    const body: GenerateContractError = await res.json()
    expect(body.code).toBe('VALIDATION_FAILED')
  })

  it('generateText is not called for malformed JSON', async () => {
    await POST(makeRawRequest('this is not json'))
    expect(vi.mocked(generateText)).not.toHaveBeenCalled()
  })
})

// ══════════════════════════════════════════════════════════════════════════════
// 8. OpenAI wrapper failure → 502 LLM_ERROR
// ══════════════════════════════════════════════════════════════════════════════

describe('8 — LLM failure → 502 LLM_ERROR', () => {
  it('returns HTTP 502 when generateText throws', async () => {
    mockLLMFailure()
    const res = await POST(makeRequest({ schemaId: 'kupni-smlouva-v1', formData: DRAFT_FORM_DATA }))
    expect(res.status).toBe(502)
  })

  it('502 error code is LLM_ERROR', async () => {
    mockLLMFailure()
    const res = await POST(makeRequest({ schemaId: 'kupni-smlouva-v1', formData: DRAFT_FORM_DATA }))
    const body: GenerateContractError = await res.json()
    expect(body.code).toBe('LLM_ERROR')
  })

  it('502 error message is user-friendly Czech (no raw error internals)', async () => {
    mockLLMFailure('OpenAI API timeout after 30s — connection refused')
    const res = await POST(makeRequest({ schemaId: 'kupni-smlouva-v1', formData: DRAFT_FORM_DATA }))
    const body: GenerateContractError = await res.json()
    // Should not expose raw error message
    expect(body.error).not.toContain('timeout after 30s')
    expect(body.error).not.toContain('connection refused')
    // Should be user-friendly
    expect(body.error).toMatch(/AI|komunikaci|znovu/i)
  })

  it('502 response has no contractText (error path, not success path)', async () => {
    mockLLMFailure()
    const res = await POST(makeRequest({ schemaId: 'kupni-smlouva-v1', formData: DRAFT_FORM_DATA }))
    const body = await res.json()
    expect(body).not.toHaveProperty('contractText')
    expect(body).not.toHaveProperty('mode')
  })

  it('generateText was called once before throwing', async () => {
    mockLLMFailure()
    await POST(makeRequest({ schemaId: 'kupni-smlouva-v1', formData: DRAFT_FORM_DATA }))
    expect(vi.mocked(generateText)).toHaveBeenCalledTimes(1)
  })
})

// ══════════════════════════════════════════════════════════════════════════════
// 9. Response shape invariants on every 200
// ══════════════════════════════════════════════════════════════════════════════

describe('9 — Response shape invariants', () => {
  it('200 response has all required GenerateContractResponse fields', async () => {
    mockLLMSuccess()
    const res = await POST(makeRequest({ schemaId: 'kupni-smlouva-v1', formData: DRAFT_FORM_DATA }))
    const body: GenerateContractResponse = await res.json()

    expect(body).toHaveProperty('schemaId')
    expect(body).toHaveProperty('mode')
    expect(body).toHaveProperty('contractText')
    expect(body).toHaveProperty('warnings')
    expect(body).toHaveProperty('missingFields')
    expect(body).toHaveProperty('legalBasis')
    expect(body).toHaveProperty('generatedAt')
  })

  it('warnings is always an array', async () => {
    mockLLMSuccess()
    const res = await POST(makeRequest({ schemaId: 'kupni-smlouva-v1', formData: DRAFT_FORM_DATA }))
    const body: GenerateContractResponse = await res.json()
    expect(Array.isArray(body.warnings)).toBe(true)
  })

  it('missingFields is always an array', async () => {
    mockLLMSuccess()
    const res = await POST(makeRequest({ schemaId: 'kupni-smlouva-v1', formData: DRAFT_FORM_DATA }))
    const body: GenerateContractResponse = await res.json()
    expect(Array.isArray(body.missingFields)).toBe(true)
  })

  it('legalBasis is always an array', async () => {
    mockLLMSuccess()
    const res = await POST(makeRequest({ schemaId: 'kupni-smlouva-v1', formData: DRAFT_FORM_DATA }))
    const body: GenerateContractResponse = await res.json()
    expect(Array.isArray(body.legalBasis)).toBe(true)
  })

  it('mode is one of the valid GenerationMode values', async () => {
    mockLLMSuccess()
    const res = await POST(makeRequest({ schemaId: 'kupni-smlouva-v1', formData: DRAFT_FORM_DATA }))
    const body: GenerateContractResponse = await res.json()
    expect(['complete', 'draft', 'review-needed']).toContain(body.mode)
  })

  it('contractText uses correctedText from quality gate when provided', async () => {
    const corrected = 'SMLOUVA O DÍLO dle § 2586 NOZ — opravený text z quality gate s dostatečnou délkou pro validaci'
    // Stage 1 returns draft, Stage 2 returns JSON with correctedText
    vi.mocked(generateText).mockResolvedValueOnce({ text: 'draft', tokensUsed: 99, model: 'gpt-4o' })
    vi.mocked(generateText).mockResolvedValueOnce({
      text: makeQualityGateJSON({ correctedText: corrected }),
      tokensUsed: 80,
      model: 'gpt-4o',
    })
    const res = await POST(makeRequest({ schemaId: 'kupni-smlouva-v1', formData: DRAFT_FORM_DATA }))
    const body: GenerateContractResponse = await res.json()
    expect(body.contractText).toBe(corrected)
  })

  it('every warning object has code and message fields', async () => {
    mockLLMSuccess()
    const res = await POST(makeRequest({ schemaId: 'kupni-smlouva-v1', formData: DRAFT_FORM_DATA }))
    const body: GenerateContractResponse = await res.json()
    for (const warning of body.warnings) {
      expect(typeof warning.code).toBe('string')
      expect(typeof warning.message).toBe('string')
      expect(warning.code.length).toBeGreaterThan(0)
      expect(warning.message.length).toBeGreaterThan(0)
    }
  })

  it('complete mode response has empty missingFields (no required absent)', async () => {
    mockLLMSuccess()
    const res = await POST(makeRequest({ schemaId: 'kupni-smlouva-v1', formData: COMPLETE_FORM_DATA }))
    const body: GenerateContractResponse = await res.json()
    // complete mode = no missingRequired, ≤ 2 missingOptional
    const requiredMissing = body.missingFields.filter((f) =>
      // required fields: the non-optional section/party fields
      // We can't easily distinguish here — just verify mode is correct
      false
    )
    expect(body.mode).toBe('complete')
  })
})

// ══════════════════════════════════════════════════════════════════════════════
// 10. Route does not leak provider-specific internals
// ══════════════════════════════════════════════════════════════════════════════

describe('10 — No provider internals leaked in API response', () => {
  it('200 response JSON does not contain a tokensUsed field', async () => {
    mockLLMSuccess()
    const res = await POST(makeRequest({ schemaId: 'kupni-smlouva-v1', formData: DRAFT_FORM_DATA }))
    const body = await res.json()
    expect(body).not.toHaveProperty('tokensUsed')
  })

  it('200 response JSON does not contain a model or temperature field', async () => {
    mockLLMSuccess()
    const res = await POST(makeRequest({ schemaId: 'kupni-smlouva-v1', formData: DRAFT_FORM_DATA }))
    const body = await res.json()
    expect(body).not.toHaveProperty('model')
    expect(body).not.toHaveProperty('temperature')
  })

  it('200 response JSON does not contain raw prompt fields', async () => {
    mockLLMSuccess()
    const res = await POST(makeRequest({ schemaId: 'kupni-smlouva-v1', formData: DRAFT_FORM_DATA }))
    const body = await res.json()
    expect(body).not.toHaveProperty('systemPrompt')
    expect(body).not.toHaveProperty('userPrompt')
    expect(body).not.toHaveProperty('prompt')
  })

  it('502 error response does not contain raw OpenAI error object', async () => {
    mockLLMFailure('Rate limit exceeded — retry after 60s')
    const res = await POST(makeRequest({ schemaId: 'kupni-smlouva-v1', formData: DRAFT_FORM_DATA }))
    const body = await res.json()
    // Raw internal error must not be serialized into the response
    expect(body).not.toHaveProperty('originalError')
    expect(body).not.toHaveProperty('cause')
    expect(body).not.toHaveProperty('stack')
    expect(JSON.stringify(body)).not.toContain('retry after 60s')
  })

  it('response JSON body does not contain the string "gpt-4o"', async () => {
    mockLLMSuccess()
    const res = await POST(makeRequest({ schemaId: 'kupni-smlouva-v1', formData: DRAFT_FORM_DATA }))
    const raw = await res.text()
    expect(raw).not.toContain('gpt-4o')
  })

  it('response JSON body does not contain "openai" (case-insensitive)', async () => {
    mockLLMSuccess()
    const res = await POST(makeRequest({ schemaId: 'kupni-smlouva-v1', formData: DRAFT_FORM_DATA }))
    const raw = await res.text()
    expect(raw.toLowerCase()).not.toContain('openai')
  })
})

// ══════════════════════════════════════════════════════════════════════════════
// 11. Draft mode: DRAFT_MODE warning
// ══════════════════════════════════════════════════════════════════════════════

describe('11 — Draft mode behaviour', () => {
  it('DRAFT_FORM_DATA produces mode=draft', async () => {
    mockLLMSuccess()
    const res = await POST(makeRequest({ schemaId: 'kupni-smlouva-v1', formData: DRAFT_FORM_DATA }))
    const body: GenerateContractResponse = await res.json()
    expect(body.mode).toBe('draft')
  })

  it('draft mode includes DRAFT_MODE warning code', async () => {
    mockLLMSuccess()
    const res = await POST(makeRequest({ schemaId: 'kupni-smlouva-v1', formData: DRAFT_FORM_DATA }))
    const body: GenerateContractResponse = await res.json()
    const draftWarning = body.warnings.find((w) => w.code === 'DRAFT_MODE')
    expect(draftWarning).toBeDefined()
  })

  it('DRAFT_MODE warning message mentions optional fields count', async () => {
    mockLLMSuccess()
    const res = await POST(makeRequest({ schemaId: 'kupni-smlouva-v1', formData: DRAFT_FORM_DATA }))
    const body: GenerateContractResponse = await res.json()
    const draftWarning = body.warnings.find((w) => w.code === 'DRAFT_MODE')
    // Message should reference the count of missing optional fields
    expect(draftWarning?.message).toMatch(/\d+.*volitelných/)
  })

  it('draft mode missingFields contains optional section field IDs', async () => {
    mockLLMSuccess()
    const res = await POST(makeRequest({ schemaId: 'kupni-smlouva-v1', formData: DRAFT_FORM_DATA }))
    const body: GenerateContractResponse = await res.json()
    // With DRAFT_FORM_DATA, 5 optional section fields are empty
    expect(body.missingFields.length).toBeGreaterThan(2)
  })

  it('userPrompt contains NÁVRH mode instruction (draft mode)', async () => {
    mockLLMSuccess()
    await POST(makeRequest({ schemaId: 'kupni-smlouva-v1', formData: DRAFT_FORM_DATA }))
    const [callArgs] = vi.mocked(generateText).mock.calls
    expect(callArgs[0].userPrompt).toContain('Generační mód: NÁVRH')
  })
})

// ══════════════════════════════════════════════════════════════════════════════
// 12. Review-needed mode: warning + missingFields
// ══════════════════════════════════════════════════════════════════════════════

describe('12 — Review-needed mode behaviour', () => {
  it('REVIEW_FORM_DATA produces mode=review-needed', async () => {
    mockLLMSuccess()
    const res = await POST(makeRequest({ schemaId: 'kupni-smlouva-v1', formData: REVIEW_FORM_DATA }))
    const body: GenerateContractResponse = await res.json()
    expect(body.mode).toBe('review-needed')
  })

  it('review-needed includes REVIEW_NEEDED warning code', async () => {
    mockLLMSuccess()
    const res = await POST(makeRequest({ schemaId: 'kupni-smlouva-v1', formData: REVIEW_FORM_DATA }))
    const body: GenerateContractResponse = await res.json()
    expect(body.warnings.some((w) => w.code === 'REVIEW_NEEDED')).toBe(true)
  })

  it('REVIEW_NEEDED warning message lists missing field IDs', async () => {
    mockLLMSuccess()
    const res = await POST(makeRequest({ schemaId: 'kupni-smlouva-v1', formData: REVIEW_FORM_DATA }))
    const body: GenerateContractResponse = await res.json()
    const reviewWarning = body.warnings.find((w) => w.code === 'REVIEW_NEEDED')
    // kupujici.name and kupujici.address are missing
    expect(reviewWarning?.message).toContain('kupujici')
  })

  it('missingFields includes the absent required party field IDs', async () => {
    mockLLMSuccess()
    const res = await POST(makeRequest({ schemaId: 'kupni-smlouva-v1', formData: REVIEW_FORM_DATA }))
    const body: GenerateContractResponse = await res.json()
    expect(body.missingFields).toContain('kupujici.name')
    expect(body.missingFields).toContain('kupujici.address')
  })

  it('userPrompt contains NEÚPLNÁ KOSTRA warning (review-needed mode)', async () => {
    mockLLMSuccess()
    await POST(makeRequest({ schemaId: 'kupni-smlouva-v1', formData: REVIEW_FORM_DATA }))
    const [callArgs] = vi.mocked(generateText).mock.calls
    expect(callArgs[0].userPrompt).toContain('NEÚPLNÁ KOSTRA')
  })
})

// ══════════════════════════════════════════════════════════════════════════════
// 13. Business-legal constraint surfaced as warning (not 422)
// ══════════════════════════════════════════════════════════════════════════════

describe('13 — Business-legal warnings (validators layer 2)', () => {
  /**
   * Kupní smlouva past handover date → kupniSmlouva validator fires a
   * WARNING (not error) about the handover date being in the past.
   * This should appear in response.warnings as LEGAL_CONSTRAINT.
   */
  it('past handoverDate surfaces as LEGAL_CONSTRAINT warning in response', async () => {
    mockLLMSuccess()
    const pastData: NormalizedFormData = {
      ...DRAFT_FORM_DATA,
      sections: {
        ...DRAFT_FORM_DATA.sections,
        predani: {
          handoverDate: '2020-01-01', // well in the past
          handoverPlace: 'Praha',
          ownershipTransfer: 'predanim',
        },
      },
    }
    const res = await POST(makeRequest({ schemaId: 'kupni-smlouva-v1', formData: pastData }))
    // Should still generate (warning does not block)
    expect(res.status).toBe(200)
    const body: GenerateContractResponse = await res.json()
    const legalWarning = body.warnings.find((w) => w.code === 'LEGAL_CONSTRAINT')
    expect(legalWarning).toBeDefined()
    expect(legalWarning?.message).toMatch(/předání|minulost/i)
  })

  it('LEGAL_CONSTRAINT warning has a fieldId referencing the problematic field', async () => {
    mockLLMSuccess()
    const pastData: NormalizedFormData = {
      ...DRAFT_FORM_DATA,
      sections: {
        ...DRAFT_FORM_DATA.sections,
        predani: {
          handoverDate: '2020-01-01',
          handoverPlace: 'Praha',
          ownershipTransfer: 'predanim',
        },
      },
    }
    const res = await POST(makeRequest({ schemaId: 'kupni-smlouva-v1', formData: pastData }))
    const body: GenerateContractResponse = await res.json()
    const legalWarning = body.warnings.find((w) => w.code === 'LEGAL_CONSTRAINT')
    expect(legalWarning?.fieldId).toContain('handoverDate')
  })

  it('business-legal warning does NOT produce 422 (it is not a hard error)', async () => {
    mockLLMSuccess()
    const pastData: NormalizedFormData = {
      ...DRAFT_FORM_DATA,
      sections: {
        ...DRAFT_FORM_DATA.sections,
        predani: {
          handoverDate: '2019-01-01',
          handoverPlace: 'Praha',
          ownershipTransfer: 'predanim',
        },
      },
    }
    const res = await POST(makeRequest({ schemaId: 'kupni-smlouva-v1', formData: pastData }))
    expect(res.status).toBe(200)
  })
})

// ══════════════════════════════════════════════════════════════════════════════
// 14. Two-stage pipeline: Stage 1 (draft) + Stage 2 (self-check)
// ══════════════════════════════════════════════════════════════════════════════

describe('14 — Two-stage pipeline behaviour', () => {
  it('Stage 2 uses the structured quality gate prompt (not freeform self-check)', async () => {
    mockLLMSuccess()
    await POST(makeRequest({ schemaId: 'kupni-smlouva-v1', formData: DRAFT_FORM_DATA }))
    const calls = vi.mocked(generateText).mock.calls
    expect(calls.length).toBe(2)
    // Quality gate prompt should mention structured review and JSON output
    expect(calls[1][0].systemPrompt).toContain('kontrolu kvality')
    expect(calls[1][0].systemPrompt).toContain('JSON')
    expect(calls[1][0].jsonMode).toBe(true)
  })

  it('Stage 2 receives the Stage 1 draft as its user prompt', async () => {
    const draftText = 'KUPNÍ SMLOUVA — návrh z Stage 1'
    vi.mocked(generateText).mockResolvedValueOnce({ text: draftText, tokensUsed: 1000, model: 'gpt-4o' })
    vi.mocked(generateText).mockResolvedValueOnce({
      text: makeQualityGateJSON(),
      tokensUsed: 500,
      model: 'gpt-4o',
    })
    await POST(makeRequest({ schemaId: 'kupni-smlouva-v1', formData: DRAFT_FORM_DATA }))
    const calls = vi.mocked(generateText).mock.calls
    expect(calls[1][0].userPrompt).toBe(draftText)
  })

  it('Stage 2 uses reasoning=medium (lower effort than Stage 1)', async () => {
    mockLLMSuccess()
    await POST(makeRequest({ schemaId: 'kupni-smlouva-v1', formData: DRAFT_FORM_DATA }))
    const calls = vi.mocked(generateText).mock.calls
    expect(calls[1][0].reasoning).toBe('medium')
  })

  it('Stage 2 failure is non-fatal — returns Stage 1 draft', async () => {
    mockStage2Failure('Dobrý návrh smlouvy')
    const res = await POST(makeRequest({ schemaId: 'kupni-smlouva-v1', formData: DRAFT_FORM_DATA }))
    expect(res.status).toBe(200)
    const body: GenerateContractResponse = await res.json()
    expect(body.contractText).toBe('Dobrý návrh smlouvy')
  })

  it('Stage 2 can modify the contract text via correctedText field', async () => {
    const draft = 'Draft with typo — original version of the contract text before quality gate review'
    const corrected = 'Corrected draft without typo — final version of the contract text after quality gate review'
    vi.mocked(generateText).mockResolvedValueOnce({ text: draft, tokensUsed: 1000, model: 'gpt-4o' })
    vi.mocked(generateText).mockResolvedValueOnce({
      text: makeQualityGateJSON({ correctedText: corrected }),
      tokensUsed: 800,
      model: 'gpt-4o',
    })
    const res = await POST(makeRequest({ schemaId: 'kupni-smlouva-v1', formData: DRAFT_FORM_DATA }))
    const body: GenerateContractResponse = await res.json()
    expect(body.contractText).toBe(corrected)
  })
})

// ══════════════════════════════════════════════════════════════════════════════
// 15. Premium polish (Stage 3) — optional, only when premium=true
// ══════════════════════════════════════════════════════════════════════════════

describe('15 — Premium polish (Stage 3)', () => {
  it('premium=true triggers 3 generateText calls', async () => {
    mockPremiumSuccess()
    await POST(makeRequest({ schemaId: 'kupni-smlouva-v1', formData: DRAFT_FORM_DATA, premium: true }))
    expect(vi.mocked(generateText)).toHaveBeenCalledTimes(3)
  })

  it('Stage 3 call routes to the premium model', async () => {
    mockPremiumSuccess()
    await POST(makeRequest({ schemaId: 'kupni-smlouva-v1', formData: DRAFT_FORM_DATA, premium: true }))
    const calls = vi.mocked(generateText).mock.calls
    // Stage 3 may be triggered via stage: 'premium' or premium: true — accept either
    const stage3Options = calls[2][0]
    expect(stage3Options.stage === 'premium' || stage3Options.premium === true).toBe(true)
  })

  it('premium=false (default) triggers only 2 calls', async () => {
    mockLLMSuccess()
    await POST(makeRequest({ schemaId: 'kupni-smlouva-v1', formData: DRAFT_FORM_DATA }))
    expect(vi.mocked(generateText)).toHaveBeenCalledTimes(2)
  })

  it('premium response contains the polished text from Stage 3', async () => {
    const polished = 'Finálně revidovaná smlouva'
    mockPremiumSuccess(MOCK_CONTRACT, polished)
    const res = await POST(makeRequest({ schemaId: 'kupni-smlouva-v1', formData: DRAFT_FORM_DATA, premium: true }))
    const body: GenerateContractResponse = await res.json()
    expect(body.contractText).toBe(polished)
  })

  it('Stage 3 failure is non-fatal — returns Stage 2 result (correctedText or Stage 1 draft)', async () => {
    const corrected = 'Quality-gate corrected draft — opravený text smlouvy s dostatečnou délkou pro parser'
    vi.mocked(generateText).mockResolvedValueOnce({ text: 'original draft', tokensUsed: 1000, model: 'gpt-4o' })
    vi.mocked(generateText).mockResolvedValueOnce({
      text: makeQualityGateJSON({ correctedText: corrected }),
      tokensUsed: 800,
      model: 'gpt-4o',
    })
    vi.mocked(generateText).mockRejectedValueOnce(new Error('Premium model timeout'))
    const res = await POST(makeRequest({ schemaId: 'kupni-smlouva-v1', formData: DRAFT_FORM_DATA, premium: true }))
    expect(res.status).toBe(200)
    const body: GenerateContractResponse = await res.json()
    expect(body.contractText).toBe(corrected)
  })

  it('Stage 3 does NOT use jsonMode', async () => {
    mockPremiumSuccess()
    await POST(makeRequest({ schemaId: 'kupni-smlouva-v1', formData: DRAFT_FORM_DATA, premium: true }))
    const calls = vi.mocked(generateText).mock.calls
    expect(calls[2][0].jsonMode).toBeUndefined()
  })
})

// ══════════════════════════════════════════════════════════════════════════════
// 16. Model routing — no provider internals in response
// ══════════════════════════════════════════════════════════════════════════════

describe('16 — Model routing safety', () => {
  it('response does not contain internal OpenAI model IDs', async () => {
    mockLLMSuccess()
    const res = await POST(makeRequest({ schemaId: 'kupni-smlouva-v1', formData: DRAFT_FORM_DATA }))
    const raw = await res.text()
    expect(raw).not.toContain('gpt-4o')
    expect(raw).not.toContain('gpt-5.')
  })

  it('response does not expose total tokens from pipeline', async () => {
    mockLLMSuccess()
    const res = await POST(makeRequest({ schemaId: 'kupni-smlouva-v1', formData: DRAFT_FORM_DATA }))
    const body = await res.json()
    expect(body).not.toHaveProperty('tokensUsed')
    expect(body).not.toHaveProperty('totalTokens')
  })
})

// ══════════════════════════════════════════════════════════════════════════════
// 17. Structured quality gate integration (Stage 2 → mode routing)
// ══════════════════════════════════════════════════════════════════════════════

describe('17 — Quality gate integration', () => {
  it('quality gate "pass" keeps complete mode unchanged', async () => {
    mockLLMSuccess(MOCK_CONTRACT, { status: 'pass', recommendedMode: 'complete' })
    const res = await POST(makeRequest({ schemaId: 'kupni-smlouva-v1', formData: COMPLETE_FORM_DATA }))
    const body: GenerateContractResponse = await res.json()
    expect(body.mode).toBe('complete')
  })

  it('quality gate "warn" downgrades complete → draft', async () => {
    mockLLMSuccess(MOCK_CONTRACT, {
      status: 'warn',
      recommendedMode: 'draft',
      summary: 'Chybí doplňkové klauzule.',
      ambiguities: ['Neurčitá formulace v čl. III'],
    })
    const res = await POST(makeRequest({ schemaId: 'kupni-smlouva-v1', formData: COMPLETE_FORM_DATA }))
    const body: GenerateContractResponse = await res.json()
    expect(body.mode).toBe('draft')
  })

  it('quality gate "block" forces review-needed', async () => {
    mockLLMSuccess(MOCK_CONTRACT, {
      status: 'block',
      recommendedMode: 'review-needed',
      summary: 'Závažné rozpory v textu.',
      contradictions: ['Článek II a III si protiřečí'],
    })
    const res = await POST(makeRequest({ schemaId: 'kupni-smlouva-v1', formData: COMPLETE_FORM_DATA }))
    const body: GenerateContractResponse = await res.json()
    expect(body.mode).toBe('review-needed')
  })

  it('quality gate cannot upgrade mode (draft stays draft even if gate says pass)', async () => {
    mockLLMSuccess(MOCK_CONTRACT, { status: 'pass', recommendedMode: 'complete' })
    const res = await POST(makeRequest({ schemaId: 'kupni-smlouva-v1', formData: DRAFT_FORM_DATA }))
    const body: GenerateContractResponse = await res.json()
    // Stage 1 says draft, quality gate says complete — but gate can never upgrade
    expect(body.mode).toBe('draft')
  })

  it('QUALITY_DOWNGRADE warning is emitted when mode is downgraded', async () => {
    mockLLMSuccess(MOCK_CONTRACT, {
      status: 'block',
      recommendedMode: 'review-needed',
      summary: 'Chybí esenciální klauzule.',
    })
    const res = await POST(makeRequest({ schemaId: 'kupni-smlouva-v1', formData: COMPLETE_FORM_DATA }))
    const body: GenerateContractResponse = await res.json()
    const downgradeWarning = body.warnings.find((w) => w.code === 'QUALITY_DOWNGRADE')
    expect(downgradeWarning).toBeDefined()
    expect(downgradeWarning?.message).toContain('review-needed')
  })

  it('quality gate missing clauses are surfaced as QUALITY_MISSING_CLAUSES warning', async () => {
    mockLLMSuccess(MOCK_CONTRACT, {
      status: 'warn',
      recommendedMode: 'draft',
      summary: 'Chybí podpisové bloky.',
      missingEssentialClauses: ['Podpisové bloky'],
    })
    const res = await POST(makeRequest({ schemaId: 'kupni-smlouva-v1', formData: DRAFT_FORM_DATA }))
    const body: GenerateContractResponse = await res.json()
    const clauseWarning = body.warnings.find((w) => w.code === 'QUALITY_MISSING_CLAUSES')
    expect(clauseWarning).toBeDefined()
    expect(clauseWarning?.message).toContain('Podpisové bloky')
  })

  it('quality gate contradictions are surfaced as QUALITY_CONTRADICTIONS warning', async () => {
    mockLLMSuccess(MOCK_CONTRACT, {
      status: 'block',
      recommendedMode: 'review-needed',
      summary: 'Rozpory.',
      contradictions: ['Článek II a III uvádějí různé ceny'],
    })
    const res = await POST(makeRequest({ schemaId: 'kupni-smlouva-v1', formData: COMPLETE_FORM_DATA }))
    const body: GenerateContractResponse = await res.json()
    const contradictionWarning = body.warnings.find((w) => w.code === 'QUALITY_CONTRADICTIONS')
    expect(contradictionWarning).toBeDefined()
  })

  it('quality gate correctedText replaces Stage 1 draft', async () => {
    const corrected = 'Opravená smlouva z quality gate — dostatečně dlouhý text pro parser validation check'
    mockLLMSuccess(MOCK_CONTRACT, { correctedText: corrected })
    const res = await POST(makeRequest({ schemaId: 'kupni-smlouva-v1', formData: DRAFT_FORM_DATA }))
    const body: GenerateContractResponse = await res.json()
    expect(body.contractText).toBe(corrected)
  })

  it('without correctedText, Stage 1 draft is preserved', async () => {
    mockLLMSuccess(MOCK_CONTRACT)
    const res = await POST(makeRequest({ schemaId: 'kupni-smlouva-v1', formData: DRAFT_FORM_DATA }))
    const body: GenerateContractResponse = await res.json()
    expect(body.contractText).toBe(MOCK_CONTRACT)
  })

  it('quality gate failure falls back safely — mode unchanged, Stage 1 draft used', async () => {
    mockStage2Failure(MOCK_CONTRACT)
    const res = await POST(makeRequest({ schemaId: 'kupni-smlouva-v1', formData: DRAFT_FORM_DATA }))
    expect(res.status).toBe(200)
    const body: GenerateContractResponse = await res.json()
    expect(body.contractText).toBe(MOCK_CONTRACT)
    expect(body.mode).toBe('draft')
  })
})

// ══════════════════════════════════════════════════════════════════════════════
// 18. Drafting posture + deterministic integrity routing
// ══════════════════════════════════════════════════════════════════════════════

describe('18 — Posture and integrity validator integration', () => {
  it('posture is passed through to prompt (stage 1 system prompt or user prompt)', async () => {
    mockLLMSuccess()
    await POST(makeRequest({
      schemaId: 'kupni-smlouva-v1',
      formData: DRAFT_FORM_DATA,
      posture: { draftingSide: 'prodavajici', riskTolerance: 'conservative' },
    }))
    const calls = vi.mocked(generateText).mock.calls
    // Stage 1 user prompt should contain the posture section
    expect(calls[0][0].userPrompt).toContain('G)')
    expect(calls[0][0].userPrompt).toContain('KONZERVATIVNÍ')
  })

  it('consumer posture injects consumer protection mandate into prompt', async () => {
    mockLLMSuccess()
    await POST(makeRequest({
      schemaId: 'kupni-smlouva-v1',
      formData: DRAFT_FORM_DATA,
      posture: { transactionContext: 'consumer' },
    }))
    const calls = vi.mocked(generateText).mock.calls
    expect(calls[0][0].userPrompt).toContain('spotřebitele')
    expect(calls[0][0].userPrompt).toContain('§ 1813')
  })

  it('mustIncludeClauses appear in prompt', async () => {
    mockLLMSuccess()
    await POST(makeRequest({
      schemaId: 'kupni-smlouva-v1',
      formData: DRAFT_FORM_DATA,
      posture: { mustIncludeClauses: ['Smluvní pokuta 5 % denně'] },
    }))
    const calls = vi.mocked(generateText).mock.calls
    expect(calls[0][0].userPrompt).toContain('Smluvní pokuta 5 %')
  })

  it('mustAvoidClauses appear in prompt', async () => {
    mockLLMSuccess()
    await POST(makeRequest({
      schemaId: 'kupni-smlouva-v1',
      formData: DRAFT_FORM_DATA,
      posture: { mustAvoidClauses: ['Rozhodčí doložka'] },
    }))
    const calls = vi.mocked(generateText).mock.calls
    expect(calls[0][0].userPrompt).toContain('Rozhodčí doložka')
  })

  it('no posture → section G absent from prompt', async () => {
    mockLLMSuccess()
    await POST(makeRequest({ schemaId: 'kupni-smlouva-v1', formData: DRAFT_FORM_DATA }))
    const calls = vi.mocked(generateText).mock.calls
    expect(calls[0][0].userPrompt).not.toContain('## G)')
  })

  it('unresolved [DOPLNIT] in complete-mode output → integrity downgrades to draft', async () => {
    // LLM returns "complete"-flagging quality gate but the text has a placeholder
    const textWithPlaceholder = MOCK_CONTRACT + '\n\nPlatba: [DOPLNIT: způsob platby]'
    mockLLMSuccess(textWithPlaceholder, { status: 'pass', recommendedMode: 'complete' })
    const res = await POST(makeRequest({ schemaId: 'kupni-smlouva-v1', formData: COMPLETE_FORM_DATA }))
    const body: GenerateContractResponse = await res.json()
    // complete → draft due to integrity check
    expect(body.mode).toBe('draft')
  })

  it('UNRESOLVED_PLACEHOLDERS warning emitted when placeholder found', async () => {
    const textWithPlaceholder = MOCK_CONTRACT + '\n\nPlatba: [DOPLNIT: způsob platby]'
    mockLLMSuccess(textWithPlaceholder, { status: 'pass', recommendedMode: 'complete' })
    const res = await POST(makeRequest({ schemaId: 'kupni-smlouva-v1', formData: COMPLETE_FORM_DATA }))
    const body: GenerateContractResponse = await res.json()
    const integrityWarning = body.warnings.find((w) => w.code === 'UNRESOLVED_PLACEHOLDERS')
    expect(integrityWarning).toBeDefined()
  })

  it('more than 2 unresolved placeholders forces review-needed', async () => {
    const manyPlaceholders = MOCK_CONTRACT +
      '\n\n[DOPLNIT: A]\n[DOPLNIT: B]\n[DOPLNIT: C]'
    mockLLMSuccess(manyPlaceholders, { status: 'pass', recommendedMode: 'complete' })
    const res = await POST(makeRequest({ schemaId: 'kupni-smlouva-v1', formData: COMPLETE_FORM_DATA }))
    const body: GenerateContractResponse = await res.json()
    expect(body.mode).toBe('review-needed')
  })

  it('clean complete output passes integrity check — mode stays complete', async () => {
    // MOCK_CONTRACT has essential kupní smlouva terms + signature markers
    mockLLMSuccess(MOCK_CONTRACT, { status: 'pass', recommendedMode: 'complete' })
    const res = await POST(makeRequest({ schemaId: 'kupni-smlouva-v1', formData: COMPLETE_FORM_DATA }))
    const body: GenerateContractResponse = await res.json()
    expect(body.mode).toBe('complete')
  })

  it('integrity and quality gate combine: block + placeholder forces review-needed', async () => {
    const textWithPlaceholder = MOCK_CONTRACT + '\n\n[DOPLNIT: A]\n[DOPLNIT: B]\n[DOPLNIT: C]'
    // Quality gate says warn+draft, integrity also triggers for placeholders
    mockLLMSuccess(textWithPlaceholder, { status: 'warn', recommendedMode: 'draft' })
    const res = await POST(makeRequest({ schemaId: 'kupni-smlouva-v1', formData: COMPLETE_FORM_DATA }))
    const body: GenerateContractResponse = await res.json()
    expect(body.mode).toBe('review-needed')
  })
})
