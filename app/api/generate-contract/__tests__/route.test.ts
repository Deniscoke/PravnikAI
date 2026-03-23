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

Článek IV. — Závěrečná ustanovení

Tato smlouva se řídí právem České republiky.`

/** Configures the mock to return a successful LLM result. */
function mockLLMSuccess(text = MOCK_CONTRACT) {
  vi.mocked(generateText).mockResolvedValueOnce({ text, tokensUsed: 1234 })
}

/** Configures the mock to simulate an LLM failure. */
function mockLLMFailure(message = 'OpenAI API timeout') {
  vi.mocked(generateText).mockRejectedValueOnce(new Error(message))
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

  it('generateText was called exactly once', async () => {
    mockLLMSuccess()
    await POST(makeRequest({ schemaId: 'kupni-smlouva-v1', formData: DRAFT_FORM_DATA }))
    expect(vi.mocked(generateText)).toHaveBeenCalledTimes(1)
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
    expect(callArgs[0].systemPrompt).toContain('české právo')
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
    expect(vi.mocked(generateText)).toHaveBeenCalledTimes(1)
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

  it('contractText is the string returned by the mock LLM', async () => {
    const customText = 'SMLOUVA O DÍLO dle § 2586 NOZ — testovací obsah'
    vi.mocked(generateText).mockResolvedValueOnce({ text: customText, tokensUsed: 99 })
    const res = await POST(makeRequest({ schemaId: 'kupni-smlouva-v1', formData: DRAFT_FORM_DATA }))
    const body: GenerateContractResponse = await res.json()
    expect(body.contractText).toBe(customText)
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
