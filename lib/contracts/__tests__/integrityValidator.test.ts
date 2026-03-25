/**
 * Tests for the deterministic contract integrity validator.
 *
 * These tests verify the non-LLM validation layer that runs on generated
 * contract text. All checks are deterministic — no mocking required.
 *
 * Run:
 *   npx vitest run lib/contracts/__tests__/integrityValidator.test.ts
 */

import { describe, it, expect } from 'vitest'
import {
  runIntegrityCheck,
  applyIntegrityDecision,
  extractIntegrityWarnings,
} from '../integrityValidator'
import type { IntegrityResult } from '../integrityValidator'

// ─── Test contract text fixtures ──────────────────────────────────────────────

/** A well-formed kupní smlouva with all essential keywords + signature block. */
const GOOD_KUPNI = `KUPNÍ SMLOUVA

Článek I. — Smluvní strany
Prodávající: ACME Czech s.r.o.

Článek II. — Předmět koupě
Předmět koupě: notebook.

Článek III. — Kupní cena
Kupní cena: 150 000 Kč

Článek IV. — Odpovědnost za vady (§ 2099 NOZ)
Odpovědnost za vady se řídí § 2099–2112 NOZ.

Článek V. — Přechod vlastnického práva
Vlastnické právo přechází předáním.

Podpis prodávajícího: _______________
Podpis kupujícího: _______________`

/** Kupní smlouva with unresolved [DOPLNIT] placeholders. */
const PLACEHOLDER_CONTRACT = `KUPNÍ SMLOUVA

Kupní cena: [DOPLNIT: kupní cena]
Předmět koupě: notebook.
Vlastnické právo přechází předáním.
Odpovědnost za vady dle § 2099 NOZ.

Podpis: _______________`

/** Contract with ⚠️ ZKONTROLOVAT markers (review-needed mode artefacts). */
const REVIEW_MARKER_CONTRACT = `KUPNÍ SMLOUVA

⚠️ ZKONTROLOVAT — [DOPLNIT: jméno prodávajícího]
Kupní cena: 150 000 Kč
Předmět koupě: notebook.
Vlastnické právo přechází předáním.
Odpovědnost za vady dle § 2099 NOZ.

Podpis: _______________`

/** Contract missing essential keywords for kupní smlouva. */
const MISSING_KEYWORDS_CONTRACT = `SMLOUVA

Strany se dohodly na předání zboží.
Text smlouvy bez klíčových oddílů.

Podpis: _______________`

/** Contract without any signature block. */
const NO_SIGNATURE_CONTRACT = `KUPNÍ SMLOUVA

Kupní cena: 150 000 Kč
Předmět koupě: notebook.
Vlastnické právo přechází předáním.
Odpovědnost za vady dle § 2099 NOZ.`

/** Contract with multiple unresolved placeholders (>2). */
const MANY_PLACEHOLDERS_CONTRACT = `KUPNÍ SMLOUVA

Kupní cena: [DOPLNIT: kupní cena]
Předmět koupě: [DOPLNIT: předmět]
Strany: [DOPLNIT: prodávající]

Podpis: _______________`

// ─── Helper ───────────────────────────────────────────────────────────────────

function hasIssueCode(result: IntegrityResult, code: string): boolean {
  return result.issues.some((i) => i.code === code)
}

// ══════════════════════════════════════════════════════════════════════════════
// 1. Unresolved placeholder detection
// ══════════════════════════════════════════════════════════════════════════════

describe('1 — Unresolved placeholder detection', () => {
  it('counts [DOPLNIT occurrences correctly', () => {
    const result = runIntegrityCheck(PLACEHOLDER_CONTRACT, 'kupni-smlouva-v1', 'draft')
    expect(result.unresolvedPlaceholders).toBe(1)
  })

  it('reports zero placeholders when none present', () => {
    const result = runIntegrityCheck(GOOD_KUPNI, 'kupni-smlouva-v1', 'complete')
    expect(result.unresolvedPlaceholders).toBe(0)
  })

  it('emits UNRESOLVED_PLACEHOLDERS issue when placeholders found', () => {
    const result = runIntegrityCheck(PLACEHOLDER_CONTRACT, 'kupni-smlouva-v1', 'draft')
    expect(hasIssueCode(result, 'UNRESOLVED_PLACEHOLDERS')).toBe(true)
  })

  it('placeholder in complete mode gets error severity', () => {
    const result = runIntegrityCheck(PLACEHOLDER_CONTRACT, 'kupni-smlouva-v1', 'complete')
    const issue = result.issues.find((i) => i.code === 'UNRESOLVED_PLACEHOLDERS')
    expect(issue?.severity).toBe('error')
  })

  it('placeholder in draft mode gets warning severity', () => {
    const result = runIntegrityCheck(PLACEHOLDER_CONTRACT, 'kupni-smlouva-v1', 'draft')
    const issue = result.issues.find((i) => i.code === 'UNRESOLVED_PLACEHOLDERS')
    expect(issue?.severity).toBe('warning')
  })

  it('counts multiple placeholders correctly', () => {
    const result = runIntegrityCheck(MANY_PLACEHOLDERS_CONTRACT, 'kupni-smlouva-v1', 'draft')
    expect(result.unresolvedPlaceholders).toBe(3)
  })
})

// ══════════════════════════════════════════════════════════════════════════════
// 2. ZKONTROLOVAT marker detection
// ══════════════════════════════════════════════════════════════════════════════

describe('2 — ZKONTROLOVAT marker detection', () => {
  it('detects ⚠️ ZKONTROLOVAT markers', () => {
    const result = runIntegrityCheck(REVIEW_MARKER_CONTRACT, 'kupni-smlouva-v1', 'review-needed')
    expect(result.unresolvedReviewMarkers).toBe(1)
  })

  it('reports zero markers in clean text', () => {
    const result = runIntegrityCheck(GOOD_KUPNI, 'kupni-smlouva-v1', 'complete')
    expect(result.unresolvedReviewMarkers).toBe(0)
  })

  it('emits UNRESOLVED_REVIEW_MARKERS issue', () => {
    const result = runIntegrityCheck(REVIEW_MARKER_CONTRACT, 'kupni-smlouva-v1', 'review-needed')
    expect(hasIssueCode(result, 'UNRESOLVED_REVIEW_MARKERS')).toBe(true)
  })

  it('ZKONTROLOVAT severity is always error', () => {
    const result = runIntegrityCheck(REVIEW_MARKER_CONTRACT, 'kupni-smlouva-v1', 'review-needed')
    const issue = result.issues.find((i) => i.code === 'UNRESOLVED_REVIEW_MARKERS')
    expect(issue?.severity).toBe('error')
  })
})

// ══════════════════════════════════════════════════════════════════════════════
// 3. Essential keyword checks
// ══════════════════════════════════════════════════════════════════════════════

describe('3 — Essential keyword checks', () => {
  it('good kupní smlouva has no missing essential keywords', () => {
    const result = runIntegrityCheck(GOOD_KUPNI, 'kupni-smlouva-v1', 'complete')
    expect(result.missingEssentialKeywords).toHaveLength(0)
  })

  it('detects missing essential keywords in incomplete contract', () => {
    const result = runIntegrityCheck(MISSING_KEYWORDS_CONTRACT, 'kupni-smlouva-v1', 'complete')
    expect(result.missingEssentialKeywords.length).toBeGreaterThan(0)
  })

  it('emits MISSING_ESSENTIAL_KEYWORD issues for missing terms', () => {
    const result = runIntegrityCheck(MISSING_KEYWORDS_CONTRACT, 'kupni-smlouva-v1', 'complete')
    expect(hasIssueCode(result, 'MISSING_ESSENTIAL_KEYWORD')).toBe(true)
  })

  it('uses fallback generic keywords for unknown schema', () => {
    // Generic check: must find "smluvní stran" and "předmět"
    const result = runIntegrityCheck(
      'Smlouva — smluvní strany ... předmět smlouvy ... Podpis: ___',
      'neznamy-typ-v1',
      'complete',
    )
    expect(result.missingEssentialKeywords).toHaveLength(0)
  })

  it('kupní smlouva checks for vlastnické právo', () => {
    // Replace all word-forms that contain 'vlastnick' to ensure the keyword is absent
    const textWithoutOwnership = GOOD_KUPNI.replace(/vlastnick\w*/gi, 'NAHRAZENO')
    const result = runIntegrityCheck(textWithoutOwnership, 'kupni-smlouva-v1', 'complete')
    expect(result.missingEssentialKeywords.some((k) => k.includes('vlastnick'))).toBe(true)
  })
})

// ══════════════════════════════════════════════════════════════════════════════
// 4. Signature block detection
// ══════════════════════════════════════════════════════════════════════════════

describe('4 — Signature block detection', () => {
  it('detects signature block via underscores', () => {
    const result = runIntegrityCheck(GOOD_KUPNI, 'kupni-smlouva-v1', 'complete')
    expect(result.hasSignatureBlock).toBe(true)
  })

  it('detects signature block via "Podpis" keyword', () => {
    const text = 'Kupní cena: 100 Kč\nPodpis prodávajícího:'
    const result = runIntegrityCheck(text, 'kupni-smlouva-v1', 'draft')
    expect(result.hasSignatureBlock).toBe(true)
  })

  it('flags missing signature block', () => {
    const result = runIntegrityCheck(NO_SIGNATURE_CONTRACT, 'kupni-smlouva-v1', 'complete')
    expect(result.hasSignatureBlock).toBe(false)
    expect(hasIssueCode(result, 'MISSING_SIGNATURE_BLOCK')).toBe(true)
  })

  it('missing signature block is warning not error (can still be complete)', () => {
    const result = runIntegrityCheck(NO_SIGNATURE_CONTRACT, 'kupni-smlouva-v1', 'complete')
    const issue = result.issues.find((i) => i.code === 'MISSING_SIGNATURE_BLOCK')
    expect(issue?.severity).toBe('warning')
  })
})

// ══════════════════════════════════════════════════════════════════════════════
// 5. applyIntegrityDecision routing
// ══════════════════════════════════════════════════════════════════════════════

describe('5 — applyIntegrityDecision routing', () => {
  it('clean result preserves complete mode', () => {
    const result = runIntegrityCheck(GOOD_KUPNI, 'kupni-smlouva-v1', 'complete')
    expect(applyIntegrityDecision('complete', result)).toBe('complete')
  })

  it('placeholder in complete mode → downgrades to draft', () => {
    const result = runIntegrityCheck(PLACEHOLDER_CONTRACT, 'kupni-smlouva-v1', 'complete')
    expect(applyIntegrityDecision('complete', result)).toBe('draft')
  })

  it('ZKONTROLOVAT markers → forces review-needed from any mode', () => {
    const result = runIntegrityCheck(REVIEW_MARKER_CONTRACT, 'kupni-smlouva-v1', 'complete')
    expect(applyIntegrityDecision('complete', result)).toBe('review-needed')
  })

  it('ZKONTROLOVAT markers → forces review-needed even from draft', () => {
    const result = runIntegrityCheck(REVIEW_MARKER_CONTRACT, 'kupni-smlouva-v1', 'draft')
    expect(applyIntegrityDecision('draft', result)).toBe('review-needed')
  })

  it('more than 2 placeholders → forces review-needed', () => {
    const result = runIntegrityCheck(MANY_PLACEHOLDERS_CONTRACT, 'kupni-smlouva-v1', 'draft')
    expect(applyIntegrityDecision('draft', result)).toBe('review-needed')
  })

  it('never upgrades: draft with clean text stays draft', () => {
    const result = runIntegrityCheck(GOOD_KUPNI, 'kupni-smlouva-v1', 'draft')
    expect(applyIntegrityDecision('draft', result)).toBe('draft')
  })

  it('never upgrades: review-needed with clean text stays review-needed', () => {
    const result = runIntegrityCheck(GOOD_KUPNI, 'kupni-smlouva-v1', 'review-needed')
    expect(applyIntegrityDecision('review-needed', result)).toBe('review-needed')
  })

  it('placeholder in draft mode stays draft (not downgraded further)', () => {
    const result = runIntegrityCheck(PLACEHOLDER_CONTRACT, 'kupni-smlouva-v1', 'draft')
    expect(applyIntegrityDecision('draft', result)).toBe('draft')
  })
})

// ══════════════════════════════════════════════════════════════════════════════
// 6. Consumer posture conflict check
// ══════════════════════════════════════════════════════════════════════════════

describe('6 — Consumer posture conflict', () => {
  it('flags vzdává se in consumer context', () => {
    const text = `Kupující vzdává se práva na reklamaci. Kupní cena: 100 Kč. Podpis: ___`
    const result = runIntegrityCheck(text, 'kupni-smlouva-v1', 'complete', {
      transactionContext: 'consumer',
    })
    expect(hasIssueCode(result, 'CONSUMER_RISKY_CLAUSE')).toBe(true)
  })

  it('flags rozhodčí doložka in consumer context', () => {
    const text = `Rozhodčí doložka: spory řeší rozhodce. Kupní cena: 100 Kč. Podpis: ___`
    const result = runIntegrityCheck(text, 'kupni-smlouva-v1', 'complete', {
      transactionContext: 'consumer',
    })
    expect(hasIssueCode(result, 'CONSUMER_RISKY_CLAUSE')).toBe(true)
  })

  it('does NOT flag consumer issues when no consumer context', () => {
    const text = `Kupující vzdává se práva. Kupní cena: 100 Kč. Podpis: ___`
    const result = runIntegrityCheck(text, 'kupni-smlouva-v1', 'complete', {
      transactionContext: 'B2B',
    })
    expect(hasIssueCode(result, 'CONSUMER_RISKY_CLAUSE')).toBe(false)
  })

  it('does NOT flag consumer issues when no posture provided', () => {
    const text = `Kupující vzdává se práva. Kupní cena: 100 Kč. Podpis: ___`
    const result = runIntegrityCheck(text, 'kupni-smlouva-v1', 'complete')
    expect(hasIssueCode(result, 'CONSUMER_RISKY_CLAUSE')).toBe(false)
  })
})

// ══════════════════════════════════════════════════════════════════════════════
// 7. Severity computation
// ══════════════════════════════════════════════════════════════════════════════

describe('7 — Overall severity computation', () => {
  it('good contract gets pass severity', () => {
    const result = runIntegrityCheck(GOOD_KUPNI, 'kupni-smlouva-v1', 'complete')
    expect(result.severity).toBe('pass')
  })

  it('placeholder in complete mode gets block severity', () => {
    const result = runIntegrityCheck(PLACEHOLDER_CONTRACT, 'kupni-smlouva-v1', 'complete')
    expect(result.severity).toBe('block')
  })

  it('ZKONTROLOVAT marker gets block severity', () => {
    const result = runIntegrityCheck(REVIEW_MARKER_CONTRACT, 'kupni-smlouva-v1', 'complete')
    expect(result.severity).toBe('block')
  })

  it('warning-only issues get warn severity', () => {
    const result = runIntegrityCheck(NO_SIGNATURE_CONTRACT, 'kupni-smlouva-v1', 'complete')
    // Missing signature is warning-only
    expect(result.severity).toBe('warn')
  })
})

// ══════════════════════════════════════════════════════════════════════════════
// 8. extractIntegrityWarnings
// ══════════════════════════════════════════════════════════════════════════════

describe('8 — extractIntegrityWarnings', () => {
  it('returns empty array for clean contract', () => {
    const result = runIntegrityCheck(GOOD_KUPNI, 'kupni-smlouva-v1', 'complete')
    expect(extractIntegrityWarnings(result)).toHaveLength(0)
  })

  it('returns warning objects with code and message', () => {
    const result = runIntegrityCheck(PLACEHOLDER_CONTRACT, 'kupni-smlouva-v1', 'complete')
    const warnings = extractIntegrityWarnings(result)
    expect(warnings.length).toBeGreaterThan(0)
    for (const w of warnings) {
      expect(typeof w.code).toBe('string')
      expect(typeof w.message).toBe('string')
      expect(w.code.length).toBeGreaterThan(0)
    }
  })
})
