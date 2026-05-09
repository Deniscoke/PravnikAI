/**
 * Tests for the structured legal quality gate (Stage 2).
 *
 * Test areas:
 *  1.  parseQualityGateResponse — correct structured output parsing
 *  2.  parseQualityGateResponse — garbage/malformed input → safe fallback
 *  3.  applyQualityGateDecision — block forces review-needed
 *  4.  applyQualityGateDecision — warn downgrades complete to draft
 *  5.  applyQualityGateDecision — never upgrades mode
 *  6.  extractQualityWarnings — surfaces non-empty findings
 *  7.  getEssentialClauses — returns schema-specific checklists
 *  8.  buildQualityGatePrompt — schema-specific prompt generation
 *
 * Run:
 *   npx vitest run lib/contracts/__tests__/qualityGate.test.ts
 */

import { describe, it, expect } from 'vitest'
import {
  parseQualityGateResponse,
  applyQualityGateDecision,
  extractQualityWarnings,
  getEssentialClauses,
  buildQualityGatePrompt,
  ESSENTIAL_CLAUSES,
} from '../qualityGate'
import type { QualityGateResult } from '../qualityGate'
import type { GenerationMode } from '../types'

// ─── Factory Helpers ─────────────────────────────────────────────────────────

function makeGateResult(overrides: Partial<QualityGateResult> = {}): QualityGateResult {
  return {
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
    jurisdictionSpecificRisks: [],
    consumerOrRegulatoryFlags: [],
    suggestedFixes: [],
    ...overrides,
  }
}

// ══════════════════════════════════════════════════════════════════════════════
// 1. Correct structured output parsing
// ══════════════════════════════════════════════════════════════════════════════

describe('1 — parseQualityGateResponse: valid JSON', () => {
  it('parses a complete pass result', () => {
    const json = JSON.stringify(makeGateResult())
    const result = parseQualityGateResponse(json)
    expect(result.status).toBe('pass')
    expect(result.recommendedMode).toBe('complete')
    expect(result.summary).toBe('Smlouva je v pořádku.')
  })

  it('parses a block result with findings', () => {
    const json = JSON.stringify(makeGateResult({
      status: 'block',
      recommendedMode: 'review-needed',
      missingEssentialFacts: ['Chybí IČO prodávajícího'],
      contradictions: ['Článek II a IV si protiřečí v termínu předání'],
    }))
    const result = parseQualityGateResponse(json)
    expect(result.status).toBe('block')
    expect(result.recommendedMode).toBe('review-needed')
    expect(result.missingEssentialFacts).toEqual(['Chybí IČO prodávajícího'])
    expect(result.contradictions).toEqual(['Článek II a IV si protiřečí v termínu předání'])
  })

  it('parses correctedText when present', () => {
    const corrected = 'A'.repeat(100) // > 50 chars
    const json = JSON.stringify(makeGateResult({ correctedText: corrected }))
    const result = parseQualityGateResponse(json)
    expect(result.correctedText).toBe(corrected)
  })

  it('ignores correctedText when too short (< 50 chars)', () => {
    const json = JSON.stringify(makeGateResult({ correctedText: 'short' }))
    const result = parseQualityGateResponse(json)
    expect(result.correctedText).toBeUndefined()
  })

  it('handles JSON wrapped in markdown code fences', () => {
    const raw = '```json\n' + JSON.stringify(makeGateResult({ status: 'warn' })) + '\n```'
    const result = parseQualityGateResponse(raw)
    expect(result.status).toBe('warn')
  })

  it('filters non-string items from arrays', () => {
    const json = JSON.stringify({
      ...makeGateResult(),
      ambiguities: ['valid', 123, null, '', 'also valid'],
    })
    const result = parseQualityGateResponse(json)
    expect(result.ambiguities).toEqual(['valid', 'also valid'])
  })
})

// ══════════════════════════════════════════════════════════════════════════════
// 2. Garbage / malformed input → safe fallback
// ══════════════════════════════════════════════════════════════════════════════

describe('2 — parseQualityGateResponse: garbage input', () => {
  it('returns warn/draft fallback for invalid JSON', () => {
    const result = parseQualityGateResponse('this is not json')
    expect(result.status).toBe('warn')
    expect(result.recommendedMode).toBe('draft')
  })

  it('returns warn/draft fallback for empty string', () => {
    const result = parseQualityGateResponse('')
    expect(result.status).toBe('warn')
    expect(result.recommendedMode).toBe('draft')
  })

  it('returns warn/draft for JSON null', () => {
    const result = parseQualityGateResponse('null')
    expect(result.status).toBe('warn')
    expect(result.recommendedMode).toBe('draft')
  })

  it('returns warn/draft for JSON array instead of object', () => {
    const result = parseQualityGateResponse('[1,2,3]')
    expect(result.status).toBe('warn')
    expect(result.recommendedMode).toBe('draft')
  })

  it('normalizes unknown status to warn', () => {
    const json = JSON.stringify({ ...makeGateResult(), status: 'maybe' })
    const result = parseQualityGateResponse(json)
    expect(result.status).toBe('warn')
  })

  it('normalizes unknown recommendedMode to draft', () => {
    const json = JSON.stringify({ ...makeGateResult(), recommendedMode: 'invalid' })
    const result = parseQualityGateResponse(json)
    expect(result.recommendedMode).toBe('draft')
  })

  it('returns empty arrays for missing array fields', () => {
    const json = JSON.stringify({ status: 'pass', recommendedMode: 'complete', summary: 'OK' })
    const result = parseQualityGateResponse(json)
    expect(result.missingEssentialFacts).toEqual([])
    expect(result.contradictions).toEqual([])
    expect(result.ambiguities).toEqual([])
  })

  it('fallback summary is in Czech', () => {
    const result = parseQualityGateResponse('not json')
    expect(result.summary).toMatch(/kontrola|návrh|bezpečnost/i)
  })
})

// ══════════════════════════════════════════════════════════════════════════════
// 3. Block forces review-needed
// ══════════════════════════════════════════════════════════════════════════════

describe('3 — applyQualityGateDecision: block', () => {
  it('block + complete → review-needed', () => {
    const gate = makeGateResult({ status: 'block', recommendedMode: 'review-needed' })
    expect(applyQualityGateDecision('complete', gate)).toBe('review-needed')
  })

  it('block + draft → review-needed', () => {
    const gate = makeGateResult({ status: 'block', recommendedMode: 'review-needed' })
    expect(applyQualityGateDecision('draft', gate)).toBe('review-needed')
  })

  it('block + review-needed → review-needed (stays)', () => {
    const gate = makeGateResult({ status: 'block', recommendedMode: 'review-needed' })
    expect(applyQualityGateDecision('review-needed', gate)).toBe('review-needed')
  })
})

// ══════════════════════════════════════════════════════════════════════════════
// 4. Warn downgrades complete to draft
// ══════════════════════════════════════════════════════════════════════════════

describe('4 — applyQualityGateDecision: warn', () => {
  it('warn + complete → draft', () => {
    const gate = makeGateResult({ status: 'warn', recommendedMode: 'draft' })
    expect(applyQualityGateDecision('complete', gate)).toBe('draft')
  })

  it('warn + draft → draft (stays)', () => {
    const gate = makeGateResult({ status: 'warn', recommendedMode: 'draft' })
    expect(applyQualityGateDecision('draft', gate)).toBe('draft')
  })

  it('warn + review-needed → review-needed (cannot upgrade)', () => {
    const gate = makeGateResult({ status: 'warn', recommendedMode: 'draft' })
    expect(applyQualityGateDecision('review-needed', gate)).toBe('review-needed')
  })
})

// ══════════════════════════════════════════════════════════════════════════════
// 5. Never upgrades mode
// ══════════════════════════════════════════════════════════════════════════════

describe('5 — applyQualityGateDecision: never upgrades', () => {
  it('pass + review-needed → review-needed (no upgrade)', () => {
    const gate = makeGateResult({ status: 'pass', recommendedMode: 'complete' })
    expect(applyQualityGateDecision('review-needed', gate)).toBe('review-needed')
  })

  it('pass + draft → draft (no upgrade)', () => {
    const gate = makeGateResult({ status: 'pass', recommendedMode: 'complete' })
    expect(applyQualityGateDecision('draft', gate)).toBe('draft')
  })

  it('pass + complete → complete (stays)', () => {
    const gate = makeGateResult({ status: 'pass', recommendedMode: 'complete' })
    expect(applyQualityGateDecision('complete', gate)).toBe('complete')
  })
})

// ══════════════════════════════════════════════════════════════════════════════
// 6. extractQualityWarnings — surfaces non-empty findings
// ══════════════════════════════════════════════════════════════════════════════

describe('6 — extractQualityWarnings', () => {
  it('returns no warnings for a clean pass', () => {
    const gate = makeGateResult()
    expect(extractQualityWarnings(gate)).toEqual([])
  })

  it('surfaces missing essential facts', () => {
    const gate = makeGateResult({ missingEssentialFacts: ['Chybí adresa kupujícího'] })
    const warnings = extractQualityWarnings(gate)
    expect(warnings).toHaveLength(1)
    expect(warnings[0].code).toBe('QUALITY_MISSING_FACTS')
    expect(warnings[0].message).toContain('adresa kupujícího')
  })

  it('surfaces missing essential clauses', () => {
    const gate = makeGateResult({ missingEssentialClauses: ['Odpovědnost za vady'] })
    const warnings = extractQualityWarnings(gate)
    expect(warnings[0].code).toBe('QUALITY_MISSING_CLAUSES')
  })

  it('surfaces contradictions', () => {
    const gate = makeGateResult({ contradictions: ['Článek II × IV'] })
    const warnings = extractQualityWarnings(gate)
    expect(warnings[0].code).toBe('QUALITY_CONTRADICTIONS')
  })

  it('surfaces inconsistent terms', () => {
    const gate = makeGateResult({ undefinedOrInconsistentTerms: ['Dílo vs dílo'] })
    const warnings = extractQualityWarnings(gate)
    expect(warnings[0].code).toBe('QUALITY_TERMS')
  })

  it('surfaces risky assumptions', () => {
    const gate = makeGateResult({ riskyAssumptions: ['Model předpokládá sídlo v Praze'] })
    const warnings = extractQualityWarnings(gate)
    expect(warnings[0].code).toBe('QUALITY_ASSUMPTIONS')
  })

  it('surfaces Czech law risks', () => {
    const gate = makeGateResult({ jurisdictionSpecificRisks: ['Neplatná smluvní pokuta u nájmu bytu'] })
    const warnings = extractQualityWarnings(gate)
    expect(warnings[0].code).toBe('QUALITY_LEGAL_RISKS')
  })

  it('surfaces regulatory flags', () => {
    const gate = makeGateResult({ consumerOrRegulatoryFlags: ['Spotřebitelská ochrana'] })
    const warnings = extractQualityWarnings(gate)
    expect(warnings[0].code).toBe('QUALITY_REGULATORY')
  })

  it('aggregates multiple finding categories', () => {
    const gate = makeGateResult({
      missingEssentialFacts: ['Fakt 1'],
      contradictions: ['Rozpor 1'],
      jurisdictionSpecificRisks: ['Riziko 1'],
    })
    const warnings = extractQualityWarnings(gate)
    expect(warnings).toHaveLength(3)
    const codes = warnings.map(w => w.code)
    expect(codes).toContain('QUALITY_MISSING_FACTS')
    expect(codes).toContain('QUALITY_CONTRADICTIONS')
    expect(codes).toContain('QUALITY_LEGAL_RISKS')
  })
})

// ══════════════════════════════════════════════════════════════════════════════
// 7. getEssentialClauses — schema-specific checklists
// ══════════════════════════════════════════════════════════════════════════════

describe('7 — getEssentialClauses', () => {
  it('returns specific clauses for kupni-smlouva-v1', () => {
    const clauses = getEssentialClauses('kupni-smlouva-v1')
    expect(clauses.length).toBeGreaterThan(5)
    expect(clauses.some(c => c.includes('Kupní cena'))).toBe(true)
    expect(clauses.some(c => c.includes('Předmět koupě'))).toBe(true)
  })

  it('returns specific clauses for pracovni-smlouva-v1', () => {
    const clauses = getEssentialClauses('pracovni-smlouva-v1')
    expect(clauses.some(c => c.includes('Druh práce'))).toBe(true)
    expect(clauses.some(c => c.includes('Místo výkonu'))).toBe(true)
    expect(clauses.some(c => c.includes('Den nástupu'))).toBe(true)
  })

  it('returns specific clauses for najemni-smlouva-byt-v1', () => {
    const clauses = getEssentialClauses('najemni-smlouva-byt-v1')
    expect(clauses.some(c => c.includes('nájemného'))).toBe(true)
    expect(clauses.some(c => c.includes('Jistota'))).toBe(true)
  })

  it('returns specific clauses for smlouva-o-dilo-v1', () => {
    const clauses = getEssentialClauses('smlouva-o-dilo-v1')
    expect(clauses.some(c => c.includes('Předmět díla'))).toBe(true)
    expect(clauses.some(c => c.includes('Cena díla'))).toBe(true)
  })

  it('returns specific clauses for nda-smlouva-v1', () => {
    const clauses = getEssentialClauses('nda-smlouva-v1')
    expect(clauses.some(c => c.includes('Definice důvěrných'))).toBe(true)
    expect(clauses.some(c => c.includes('mlčenlivosti'))).toBe(true)
  })

  it('returns generic fallback for unknown schema', () => {
    const clauses = getEssentialClauses('neznamy-schema-v99')
    expect(clauses.length).toBeGreaterThanOrEqual(4)
    expect(clauses.some(c => c.includes('Identifikace'))).toBe(true)
    expect(clauses.some(c => c.includes('Podpisové'))).toBe(true)
  })

  it('every known schema has an essential clause list', () => {
    // Keys are now `${jurisdiction}:${schemaId}` — only assert structurally
    for (const key of Object.keys(ESSENTIAL_CLAUSES)) {
      expect(ESSENTIAL_CLAUSES[key].length).toBeGreaterThan(0)
    }
  })
})

// ══════════════════════════════════════════════════════════════════════════════
// 8. buildQualityGatePrompt — schema-specific
// ══════════════════════════════════════════════════════════════════════════════

describe('8 — buildQualityGatePrompt', () => {
  it('includes schema name in the prompt', () => {
    const prompt = buildQualityGatePrompt('kupni-smlouva-v1', 'Kupní smlouva')
    expect(prompt).toContain('Kupní smlouva')
  })

  it('includes essential clauses for the schema', () => {
    const prompt = buildQualityGatePrompt('kupni-smlouva-v1', 'Kupní smlouva')
    expect(prompt).toContain('Kupní cena')
    expect(prompt).toContain('Předmět koupě')
  })

  it('includes JSON output format instructions', () => {
    const prompt = buildQualityGatePrompt('kupni-smlouva-v1', 'Kupní smlouva')
    expect(prompt).toContain('"status"')
    expect(prompt).toContain('"recommendedMode"')
    expect(prompt).toContain('missingEssentialClauses')
  })

  it('includes status definitions (pass/warn/block)', () => {
    const prompt = buildQualityGatePrompt('kupni-smlouva-v1', 'Kupní smlouva')
    expect(prompt).toContain('"pass"')
    expect(prompt).toContain('"warn"')
    expect(prompt).toContain('"block"')
  })

  it('uses different clause lists for different schemas', () => {
    const kupni = buildQualityGatePrompt('kupni-smlouva-v1', 'Kupní smlouva')
    const pracovni = buildQualityGatePrompt('pracovni-smlouva-v1', 'Pracovní smlouva')
    expect(kupni).toContain('Kupní cena')
    expect(kupni).not.toContain('Druh práce')
    expect(pracovni).toContain('Druh práce')
    expect(pracovni).not.toContain('Kupní cena')
  })

  it('prompt is in Czech', () => {
    const prompt = buildQualityGatePrompt('kupni-smlouva-v1', 'Kupní smlouva')
    expect(prompt).toContain('Zkontroluj přítomnost')
    expect(prompt).toContain('český')
  })
})
