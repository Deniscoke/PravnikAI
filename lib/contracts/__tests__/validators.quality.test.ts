/**
 * Quality-guard tests for validateInputQuality() in validators.ts
 *
 * Test areas:
 *  1. Junk exact matches               — "asd", "test", "qwerty", "foo" → error
 *  2. All-same-character values        — "aaaa", "1111" → error
 *  3. Placeholder-like values          — "[doplnit]", "...", "---" → error
 *  4. Invalid IČO format               — too short, letters, wrong length → error
 *  5. Suspicious / fake IČO sequences  — "12345678", "00000000" → error
 *  6. Invalid email format             — missing @, no TLD → error
 *  7. Test-like email domains          — test@, @example. → warning
 *  8. Short but possibly valid values  — "AB" → warning (not error)
 *  9. Address without digits           — "Václavské náměstí" → warning
 * 10. Far-past / far-future dates      — >5 years ago or >10 years ahead → warning
 *
 * All tests call validateInputQuality() directly — no HTTP, no schema files.
 * Run:  npx vitest run lib/contracts/__tests__/validators.quality.test.ts
 * Watch: npx vitest lib/contracts/__tests__/validators.quality.test.ts
 */

import { describe, it, expect } from 'vitest'
import { validateInputQuality } from '../validators'
import type {
  ContractSchema,
  NormalizedFormData,
  ValidationIssue,
} from '../types'

// ─── Minimal factory helpers ──────────────────────────────────────────────────

/** Creates a ContractSchema that exposes the party fields we pass. */
function makeSchema(opts: {
  partyId?: string
  requiredFields?: Array<{ id: string; label: string }>
  optionalFields?: Array<{ id: string; label: string }>
  sections?: Array<{
    id: string
    fields: Array<{ id: string; label: string; type: string; required?: boolean }>
  }>
} = {}): ContractSchema {
  const {
    partyId = 'strana',
    requiredFields = [],
    optionalFields = [],
    sections = [],
  } = opts

  return {
    metadata: {
      schemaId: 'test-schema-v1',
      name: 'Test',
      version: '1.0.0',
      jurisdiction: 'CZ',
      legalBasis: [],
      sensitivity: 'standard',
      outputStructure: { sections: [], requiresSignature: true },
      aiInstructions: '',
      description: '',
      category: 'občanské',
    },
    parties: [
      {
        id: partyId,
        label: 'Strana',
        role: 'strana',
        requiredFields: requiredFields.map((f) => ({
          id: f.id as any,
          label: f.label,
          required: true,
          sensitivity: 'personal' as const,
        })),
        optionalFields: optionalFields.map((f) => ({
          id: f.id as any,
          label: f.label,
          required: false,
          sensitivity: 'personal' as const,
        })),
      },
    ],
    sections: sections.map((s) => ({
      id: s.id,
      title: s.id,
      fields: s.fields.map((f) => ({
        id: f.id,
        label: f.label,
        type: f.type as any,
        required: f.required ?? false,
        sensitivity: 'public' as const,
      })),
    })),
  }
}

/** Creates NormalizedFormData with one party and optional section values. */
function makeData(opts: {
  partyId?: string
  partyFields?: Record<string, string>
  sections?: Record<string, Record<string, string>>
} = {}): NormalizedFormData {
  return {
    schemaId: 'test-schema-v1',
    parties: [
      {
        partyId: opts.partyId ?? 'strana',
        fields: (opts.partyFields ?? {}) as any,
      },
    ],
    sections: opts.sections ?? {},
  }
}

/** Convenience: run quality guard on a single party name field. */
function qualityOnName(value: string): ValidationIssue[] {
  const schema = makeSchema({ requiredFields: [{ id: 'name', label: 'Jméno' }] })
  const data = makeData({ partyFields: { name: value } })
  return validateInputQuality(schema, data)
}

/** Convenience: run quality guard on a single party address field. */
function qualityOnAddress(value: string): ValidationIssue[] {
  const schema = makeSchema({ requiredFields: [{ id: 'address', label: 'Adresa' }] })
  const data = makeData({ partyFields: { address: value } })
  return validateInputQuality(schema, data)
}

/** Convenience: run quality guard on a single party IČO field. */
function qualityOnIco(value: string): ValidationIssue[] {
  const schema = makeSchema({ requiredFields: [{ id: 'ico', label: 'IČO' }] })
  const data = makeData({ partyFields: { ico: value } })
  return validateInputQuality(schema, data)
}

/** Convenience: run quality guard on a single party email field. */
function qualityOnEmail(value: string): ValidationIssue[] {
  const schema = makeSchema({ requiredFields: [{ id: 'email', label: 'E-mail' }] })
  const data = makeData({ partyFields: { email: value } })
  return validateInputQuality(schema, data)
}

/** Convenience: run quality guard on a single section date field. */
function qualityOnDate(value: string): ValidationIssue[] {
  const schema = makeSchema({
    sections: [{ id: 'sec', fields: [{ id: 'dt', label: 'Datum', type: 'date' }] }],
  })
  const data = makeData({ sections: { sec: { dt: value } } })
  return validateInputQuality(schema, data)
}

/** Convenience: run quality guard on a single section text field. */
function qualityOnText(value: string): ValidationIssue[] {
  const schema = makeSchema({
    sections: [{ id: 'sec', fields: [{ id: 'tx', label: 'Pole', type: 'text' }] }],
  })
  const data = makeData({ sections: { sec: { tx: value } } })
  return validateInputQuality(schema, data)
}

// Helper assertions
function expectError(issues: ValidationIssue[], partial?: string) {
  const errors = issues.filter((i) => i.severity === 'error')
  expect(errors.length, `Expected at least one error but got: ${JSON.stringify(issues)}`).toBeGreaterThan(0)
  if (partial) {
    expect(errors.some((e) => e.message.includes(partial))).toBe(true)
  }
}

function expectWarning(issues: ValidationIssue[], partial?: string) {
  const warnings = issues.filter((i) => i.severity === 'warning')
  expect(warnings.length, `Expected at least one warning but got: ${JSON.stringify(issues)}`).toBeGreaterThan(0)
  if (partial) {
    expect(warnings.some((w) => w.message.includes(partial))).toBe(true)
  }
}

function expectClean(issues: ValidationIssue[]) {
  expect(
    issues.filter((i) => i.severity === 'error'),
    `Expected no errors but got: ${JSON.stringify(issues)}`,
  ).toHaveLength(0)
}

// ─── Test suite ───────────────────────────────────────────────────────────────

// ══════════════════════════════════════════════════════════════════════════════
// 1. Junk exact matches
// ══════════════════════════════════════════════════════════════════════════════

describe('1 — Junk exact matches (name field)', () => {
  const junkWords = ['asd', 'asdf', 'qwerty', 'qwertz', 'test', 'foo', 'bar', 'baz',
    'abc', 'abcde', 'xxx', 'yyy', 'doplnit', 'firma', 'name', 'company',
    'todo', 'tbd', 'n/a', 'null', 'undefined', 'example']

  for (const word of junkWords) {
    it(`"${word}" → error`, () => {
      expectError(qualityOnName(word))
    })
    it(`"${word.toUpperCase()}" (uppercase) → error`, () => {
      expectError(qualityOnName(word.toUpperCase()))
    })
  }

  it('"Testing Company s.r.o." is NOT flagged (substring protection)', () => {
    expectClean(qualityOnName('Testing Company s.r.o.'))
  })

  it('"Test s.r.o." is NOT flagged (partial word)', () => {
    expectClean(qualityOnName('Test s.r.o.'))
  })

  it('"Foo & Partners" is NOT flagged', () => {
    expectClean(qualityOnName('Foo & Partners'))
  })

  it('"Jan Novák" passes cleanly', () => {
    expectClean(qualityOnName('Jan Novák'))
  })

  it('"ACME Czech s.r.o." passes cleanly', () => {
    expectClean(qualityOnName('ACME Czech s.r.o.'))
  })
})

// ══════════════════════════════════════════════════════════════════════════════
// 2. All-same-character values
// ══════════════════════════════════════════════════════════════════════════════

describe('2 — All-same-character values', () => {
  it('"aaaa" → error', () => expectError(qualityOnName('aaaa')))
  it('"AAAA" → error', () => expectError(qualityOnName('AAAA')))
  it('"1111" → error (name)', () => expectError(qualityOnName('1111')))
  it('"zzzz" → error', () => expectError(qualityOnName('zzzz')))
  it('"a a a a" (space-separated) → error', () => expectError(qualityOnName('a a a a')))
  it('"00000000" IČO → error', () => expectError(qualityOnIco('00000000')))
  it('"11111111" IČO → error', () => expectError(qualityOnIco('11111111')))
  it('"99999999" IČO → error', () => expectError(qualityOnIco('99999999')))

  // Single repeated char that is just length 1 is fine (edge case boundary)
  it('"a" single char → no error (too short to trigger)', () => {
    // Length 1 is filtered upstream by the `!value` or length checks — no quality error expected
    const issues = qualityOnName('a')
    // May or may not produce a warning (short name) but not an all-same-char error
    const allSameErrors = issues.filter((i) =>
      i.severity === 'error' && i.message.includes('opakující'),
    )
    expect(allSameErrors).toHaveLength(0)
  })
})

// ══════════════════════════════════════════════════════════════════════════════
// 3. Placeholder-like values
// ══════════════════════════════════════════════════════════════════════════════

describe('3 — Placeholder-like values', () => {
  it('"[doplnit]" → error', () => expectError(qualityOnName('[doplnit]')))
  it('"[DOPLNIT: jméno]" → error', () => expectError(qualityOnName('[DOPLNIT: jméno]')))
  it('"[fill in name]" → error', () => expectError(qualityOnName('[fill in name]')))
  it('"<doplnit>" → error', () => expectError(qualityOnName('<doplnit>')))
  it('"<company name>" → error', () => expectError(qualityOnName('<company name>')))
  it('"..." → error (name)', () => expectError(qualityOnName('...')))
  it('"......" → error', () => expectError(qualityOnName('......')))
  it('"---" → error (text field)', () => expectError(qualityOnText('---')))
  it('"-----" → error', () => expectError(qualityOnText('-----')))
  it('"XXX" → error (placeholder pattern)', () => expectError(qualityOnName('XXX')))
  it('"xxxxx" → error', () => expectError(qualityOnName('xxxxx')))

  // These should NOT be caught by placeholder patterns
  it('"Mgr. Jan Dvořák" passes (has dots but not "...")', () => {
    expectClean(qualityOnName('Mgr. Jan Dvořák'))
  })
  it('"..data.." does NOT match (dots not alone)', () => {
    // pattern requires ^\.{3,}$ — inline dots with text are fine
    expectClean(qualityOnName('..data..'))
  })
})

// ══════════════════════════════════════════════════════════════════════════════
// 4. Invalid IČO format
// ══════════════════════════════════════════════════════════════════════════════

describe('4 — Invalid IČO format', () => {
  it('7 digits → error', () => expectError(qualityOnIco('1234567')))
  it('9 digits → error', () => expectError(qualityOnIco('123456789')))
  it('letters → error', () => expectError(qualityOnIco('ABC12345')))
  it('whitespace-only → no quality error (skipped before checkIco; empty handled by UI layer)', () => {
    // validateInputQuality trims and skips empty values with `if (!value) continue`
    const issues = qualityOnIco('     ')
    expect(issues).toHaveLength(0)
  })
  it('"12 34 56 78" strips to "12345678" → error (known fake sequence)', () => {
    // The validator strips spaces before checking, so "12 34 56 78" === "12345678" → fake sequence
    expectError(qualityOnIco('12 34 56 78'))
  })

  it('valid IČO "27082440" → no error', () => expectClean(qualityOnIco('27082440')))
  it('valid IČO "00006947" → no error', () => expectClean(qualityOnIco('00006947')))
  it('valid IČO "45274649" → no error', () => expectClean(qualityOnIco('45274649')))
})

// ══════════════════════════════════════════════════════════════════════════════
// 5. Suspicious / fake IČO sequences
// ══════════════════════════════════════════════════════════════════════════════

describe('5 — Suspicious / fake IČO sequences', () => {
  it('"12345678" → error (ascending sequence)', () => expectError(qualityOnIco('12345678')))
  it('"87654321" → error (descending sequence)', () => expectError(qualityOnIco('87654321')))
  it('"00000000" → error (all zeros)', () => expectError(qualityOnIco('00000000')))
  it('"11111111" → error (all ones)', () => expectError(qualityOnIco('11111111')))
  it('"55555555" → error (all same digit)', () => expectError(qualityOnIco('55555555')))

  // Real Czech IČO values (not matching any fake pattern)
  it('"27082440" → clean', () => expectClean(qualityOnIco('27082440')))
  it('"26168685" → clean', () => expectClean(qualityOnIco('26168685')))
})

// ══════════════════════════════════════════════════════════════════════════════
// 6. Invalid email format
// ══════════════════════════════════════════════════════════════════════════════

describe('6 — Invalid email format', () => {
  it('"notanemail" → error', () => expectError(qualityOnEmail('notanemail')))
  it('"@missinglocal.cz" → error', () => expectError(qualityOnEmail('@missinglocal.cz')))
  it('"user@" → error (no domain)', () => expectError(qualityOnEmail('user@')))
  it('"user@domain" → error (no TLD)', () => expectError(qualityOnEmail('user@domain')))
  it('"user @domain.cz" → error (space)', () => expectError(qualityOnEmail('user @domain.cz')))
  it('"user@domain.c" → error (TLD too short)', () => expectError(qualityOnEmail('user@domain.c')))

  it('"jan.novak@firma.cz" → no error', () => expectClean(qualityOnEmail('jan.novak@firma.cz')))
  it('"info@novafirma.com" → no error', () => expectClean(qualityOnEmail('info@novafirma.com')))
  it('"petr+smlouvy@legalcorp.eu" → no error', () => expectClean(qualityOnEmail('petr+smlouvy@legalcorp.eu')))
})

// ══════════════════════════════════════════════════════════════════════════════
// 7. Test-like email domains (warning, not error)
// ══════════════════════════════════════════════════════════════════════════════

describe('7 — Test-like email domains (warning only)', () => {
  it('"test@test.cz" → warning', () => expectWarning(qualityOnEmail('test@test.cz')))
  it('"user@example.com" → warning', () => expectWarning(qualityOnEmail('user@example.com')))
  it('"user@foo.cz" → warning', () => expectWarning(qualityOnEmail('user@foo.cz')))
  it('"user@bar.cz" → warning', () => expectWarning(qualityOnEmail('user@bar.cz')))
  it('"asd@realcompany.cz" → warning (asd@ prefix)', () => expectWarning(qualityOnEmail('asd@realcompany.cz')))
  it('"xxx@firma.cz" → warning (xxx@ prefix)', () => expectWarning(qualityOnEmail('xxx@firma.cz')))

  // Should be warning ONLY, not error
  it('"test@test.cz" produces no error (only warning)', () => {
    const issues = qualityOnEmail('test@test.cz')
    expect(issues.filter((i) => i.severity === 'error')).toHaveLength(0)
  })
  it('"user@example.com" produces no error (only warning)', () => {
    const issues = qualityOnEmail('user@example.com')
    expect(issues.filter((i) => i.severity === 'error')).toHaveLength(0)
  })
})

// ══════════════════════════════════════════════════════════════════════════════
// 8. Short but possibly valid name (warning, not error)
// ══════════════════════════════════════════════════════════════════════════════

describe('8 — Short names (warning only)', () => {
  it('"AB" (2 chars) → warning', () => expectWarning(qualityOnName('AB')))
  it('"Jo" (2 chars) → warning', () => expectWarning(qualityOnName('Jo')))

  // Short but still only a warning — not blocking
  it('"AB" produces no error (only warning)', () => {
    const issues = qualityOnName('AB')
    expect(issues.filter((i) => i.severity === 'error')).toHaveLength(0)
  })

  // 3 non-space chars is the threshold — should be clean
  it('"A B" (2 non-space chars) → warning', () => expectWarning(qualityOnName('A B')))
  it('"Jan" (3 chars) → no warning', () => {
    const issues = qualityOnName('Jan')
    expect(issues.filter((i) => i.severity === 'warning')).toHaveLength(0)
  })
  it('"A. B. C." (multiple initials, 3+ non-space) → no short-name warning', () => {
    const issues = qualityOnName('A. B. C.')
    const shortWarnings = issues.filter(
      (i) => i.severity === 'warning' && i.message.includes('příliš krátké'),
    )
    expect(shortWarnings).toHaveLength(0)
  })
})

// ══════════════════════════════════════════════════════════════════════════════
// 9. Address without digits (warning only)
// ══════════════════════════════════════════════════════════════════════════════

describe('9 — Address without digits (warning only)', () => {
  it('"Václavské náměstí" (no number) → warning', () => {
    expectWarning(qualityOnAddress('Václavské náměstí'))
  })
  it('"Náměstí Míru, Praha" (no number) → warning', () => {
    expectWarning(qualityOnAddress('Náměstí Míru, Praha'))
  })

  // Should be warning ONLY
  it('"Václavské náměstí" produces no error', () => {
    const issues = qualityOnAddress('Václavské náměstí')
    expect(issues.filter((i) => i.severity === 'error')).toHaveLength(0)
  })

  // With a house number → clean
  it('"Václavské náměstí 1, Praha 1" → no warning', () => {
    expectClean(qualityOnAddress('Václavské náměstí 1, Praha 1'))
  })
  it('"Husova 12/34, 110 00 Praha 1" → clean', () => {
    expectClean(qualityOnAddress('Husova 12/34, 110 00 Praha 1'))
  })

  // Short address is a separate warning path (< 8 chars)
  it('"Husova" (too short) → warning', () => {
    expectWarning(qualityOnAddress('Husova'))
  })
})

// ══════════════════════════════════════════════════════════════════════════════
// 10. Far-past and far-future dates (warning only)
// ══════════════════════════════════════════════════════════════════════════════

describe('10 — Date plausibility warnings', () => {
  const now = new Date()

  const farPast = new Date(now.getFullYear() - 6, now.getMonth(), now.getDate())
    .toISOString()
    .split('T')[0]

  const nearPast = new Date(now.getFullYear() - 2, now.getMonth(), now.getDate())
    .toISOString()
    .split('T')[0]

  const farFuture = new Date(now.getFullYear() + 11, now.getMonth(), now.getDate())
    .toISOString()
    .split('T')[0]

  const nearFuture = new Date(now.getFullYear() + 1, now.getMonth(), now.getDate())
    .toISOString()
    .split('T')[0]

  it(`far-past date (${farPast}) → warning`, () => {
    expectWarning(qualityOnDate(farPast))
  })

  it(`far-future date (${farFuture}) → warning`, () => {
    expectWarning(qualityOnDate(farFuture))
  })

  // Both should be warnings only, not errors
  it(`far-past date produces no error`, () => {
    const issues = qualityOnDate(farPast)
    expect(issues.filter((i) => i.severity === 'error')).toHaveLength(0)
  })

  it(`far-future date produces no error`, () => {
    const issues = qualityOnDate(farFuture)
    expect(issues.filter((i) => i.severity === 'error')).toHaveLength(0)
  })

  // Plausible dates → clean
  it(`recent past date (${nearPast}) → no warning`, () => {
    expectClean(qualityOnDate(nearPast))
  })

  it(`near future date (${nearFuture}) → no warning`, () => {
    expectClean(qualityOnDate(nearFuture))
  })

  // Non-date string → error
  it('"tomorrow" → error (non-date string)', () => {
    expectError(qualityOnDate('tomorrow'))
  })

  it('"junk date" → error', () => {
    expectError(qualityOnDate('junk date'))
  })
})

// ══════════════════════════════════════════════════════════════════════════════
// 11. Cross-field repetition of junk values
// ══════════════════════════════════════════════════════════════════════════════

describe('11 — Cross-field repetition of junk values', () => {
  it('same junk in 3 party fields → error', () => {
    const schema = makeSchema({
      requiredFields: [
        { id: 'name', label: 'Jméno' },
        { id: 'address', label: 'Adresa' },
        { id: 'representative', label: 'Zástupce' },
      ],
    })
    const data = makeData({
      partyFields: { name: 'test', address: 'test', representative: 'test' },
    })
    const issues = validateInputQuality(schema, data)
    const crossField = issues.filter(
      (i) => i.severity === 'error' && i.message.includes('opakuje'),
    )
    expect(crossField.length).toBeGreaterThan(0)
  })

  it('same junk in 2 fields (below threshold) → no cross-field error', () => {
    const schema = makeSchema({
      requiredFields: [
        { id: 'name', label: 'Jméno' },
        { id: 'address', label: 'Adresa' },
      ],
    })
    const data = makeData({ partyFields: { name: 'test', address: 'test' } })
    const issues = validateInputQuality(schema, data)
    const crossField = issues.filter(
      (i) => i.severity === 'error' && i.message.includes('opakuje'),
    )
    expect(crossField).toHaveLength(0)
  })

  it('same legit company name in 2 fields → no cross-field error', () => {
    const schema = makeSchema({
      requiredFields: [
        { id: 'name', label: 'Jméno' },
        { id: 'representative', label: 'Zástupce' },
      ],
      sections: [
        {
          id: 'sec',
          fields: [{ id: 'tx', label: 'Poznámka', type: 'text' }],
        },
      ],
    })
    const legitimateName = 'Novák Trading s.r.o.'
    const data = makeData({
      partyFields: { name: legitimateName, representative: legitimateName },
      sections: { sec: { tx: legitimateName } },
    })
    const issues = validateInputQuality(schema, data)
    const crossField = issues.filter(
      (i) => i.severity === 'error' && i.message.includes('opakuje'),
    )
    expect(crossField).toHaveLength(0)
  })

  it('"aaa" (all-same-char) in 3 fields → cross-field error', () => {
    const schema = makeSchema({
      requiredFields: [
        { id: 'name', label: 'Jméno' },
        { id: 'address', label: 'Adresa' },
        { id: 'representative', label: 'Zástupce' },
      ],
    })
    const data = makeData({
      partyFields: { name: 'aaa', address: 'aaa', representative: 'aaa' },
    })
    const issues = validateInputQuality(schema, data)
    const crossField = issues.filter(
      (i) => i.severity === 'error' && i.message.includes('opakuje'),
    )
    expect(crossField.length).toBeGreaterThan(0)
  })
})

// ══════════════════════════════════════════════════════════════════════════════
// 12. Empty fields are silently skipped (no false positives on blanks)
// ══════════════════════════════════════════════════════════════════════════════

describe('12 — Empty fields produce no quality issues', () => {
  it('empty name → no quality error (handled by UI required-field check)', () => {
    const issues = qualityOnName('')
    expect(issues).toHaveLength(0)
  })

  it('empty IČO → no quality error', () => {
    const issues = qualityOnIco('')
    expect(issues).toHaveLength(0)
  })

  it('whitespace-only name → no quality error', () => {
    const issues = qualityOnName('   ')
    expect(issues).toHaveLength(0)
  })
})
