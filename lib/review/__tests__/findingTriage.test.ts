/**
 * Fixtures are the real findings a live review produced for a lawful dohoda.
 *
 * The negation cases matter most. "Není v souladu se zákonem" contains the
 * compliance phrase verbatim, and a naive match would move a genuine defect out
 * of the risk list — turning a real warning into a mild suggestion, which is
 * considerably worse than the presentational flaw being fixed.
 */

import { describe, it, expect, vi, afterEach } from 'vitest'
import { statesCompliance, triageRiskyClauses } from '../findingTriage'

afterEach(() => {
  vi.restoreAllMocks()
})

/** Filed as a risk, but the explanation says the clause is fine. */
const COMPLIANT_FINDING = {
  title: 'Splatnost mzdy',
  severity: 'medium' as const,
  explanation:
    'Smlouva uvádí, že mzda bude vyplacena nejpozději do 20. dne následujícího měsíce, ' +
    'což je v souladu se zákonem, ale je třeba zajistit evidenci.',
  suggestedRevision: 'Zaměstnavatel povede evidenci odpracovaných hodin.',
}

const GENUINE_DEFECT = {
  title: 'Odměna pod minimem',
  severity: 'high' as const,
  explanation:
    'Sjednaná odměna 90 Kč za hodinu není v souladu se zákonem — minimální hodinová ' +
    'mzda činí 134,40 Kč.',
}

describe('statesCompliance', () => {
  it('recognises a finding that concludes the clause is lawful', () => {
    expect(statesCompliance(COMPLIANT_FINDING)).toBe(true)
  })

  it('is not fooled by the negated form', () => {
    expect(statesCompliance(GENUINE_DEFECT)).toBe(false)
  })

  it('leaves a finding alone when it also says the clause is invalid', () => {
    expect(
      statesCompliance({
        title: 'Doložka',
        explanation: 'Formálně odpovídá zákonu, avšak jde o neplatné ujednání dle § 580.',
      }),
    ).toBe(false)
  })

  it('leaves a finding alone when it says the law disregards the clause', () => {
    expect(
      statesCompliance({
        title: 'Smluvní pokuta',
        explanation: 'Je v souladu se zákonem o nájmu, ale nepřihlíží se k ní dle § 2239.',
      }),
    ).toBe(false)
  })

  it('recognises the other ways a review words compliance', () => {
    expect(statesCompliance({ explanation: 'Ustanovení odpovídá zákonu.' })).toBe(true)
    expect(statesCompliance({ explanation: 'Toto je v pořádku.' })).toBe(true)
    expect(statesCompliance({ explanation: 'Neodporuje zákonu.' })).toBe(true)
  })

  it('says nothing about a finding with no text', () => {
    expect(statesCompliance({})).toBe(false)
  })
})

describe('triageRiskyClauses', () => {
  it('moves a compliance finding out of the risk list', () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {})
    const result = triageRiskyClauses([COMPLIANT_FINDING])
    expect(result.risky).toEqual([])
    expect(result.movedToNegotiation).toHaveLength(1)
  })

  it('keeps the substance when it moves it', () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {})
    const [moved] = triageRiskyClauses([COMPLIANT_FINDING]).movedToNegotiation
    expect(moved).toContain('Splatnost mzdy')
    expect(moved).toContain('evidenci')
  })

  it('never moves a genuine defect', () => {
    const result = triageRiskyClauses([GENUINE_DEFECT])
    expect(result.risky).toEqual([GENUINE_DEFECT])
    expect(result.movedToNegotiation).toEqual([])
  })

  it('separates a mixed batch correctly', () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {})
    const result = triageRiskyClauses([COMPLIANT_FINDING, GENUINE_DEFECT])
    expect(result.risky).toEqual([GENUINE_DEFECT])
    expect(result.movedToNegotiation).toHaveLength(1)
  })

  it('handles a compliance finding with no suggestion attached', () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {})
    const [moved] = triageRiskyClauses([
      { title: 'Rozsah práce', explanation: 'Je v souladu se zákonem.' },
    ]).movedToNegotiation
    expect(moved).toContain('Rozsah práce')
    expect(moved).toContain('lze jej upřesnit')
  })

  it('logs what it reclassified rather than doing it silently', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    triageRiskyClauses([COMPLIANT_FINDING])
    expect(warn).toHaveBeenCalledOnce()
    expect(warn.mock.calls[0][0]).toContain('Splatnost mzdy')
  })

  it('passes an empty list through', () => {
    expect(triageRiskyClauses([])).toEqual({ risky: [], movedToNegotiation: [] })
  })
})
