import { describe, it, expect } from 'vitest'
import { hasIncoherentInvalidityRemedy, sanitizeSuggestion } from '../suggestionGuard'

describe('hasIncoherentInvalidityRemedy', () => {
  it('catches the observed failure: non-payment treated as a cause of invalidity', () => {
    const suggestion =
      'Vlastnické právo přechází na kupujícího zaplacením kupní ceny, přičemž v případě ' +
      'neuhrazení kupní ceny do 30 dnů od splatnosti se smlouva považuje za neplatnou.'
    expect(hasIncoherentInvalidityRemedy(suggestion)).toBe(true)
  })

  it('catches the same idea phrased around default', () => {
    expect(
      hasIncoherentInvalidityRemedy('Při prodlení delším než 14 dnů je smlouva neplatná.'),
    ).toBe(true)
  })

  it('leaves withdrawal — the remedy the law actually provides — alone', () => {
    const suggestion =
      'Nezaplatí-li kupující kupní cenu do 30 dnů od splatnosti, je prodávající oprávněn ' +
      'od smlouvy odstoupit podle § 2002 NOZ.'
    expect(hasIncoherentInvalidityRemedy(suggestion)).toBe(false)
  })

  it('leaves a plain invalidity discussion alone when no breach is involved', () => {
    expect(
      hasIncoherentInvalidityRemedy('Ujednání zkracující práva spotřebitele je neplatné.'),
    ).toBe(false)
  })

  it('handles empty input', () => {
    expect(hasIncoherentInvalidityRemedy('')).toBe(false)
  })
})

describe('sanitizeSuggestion', () => {
  it('withholds an unsafe suggestion so the finding survives without the wording', () => {
    expect(
      sanitizeSuggestion('Při nezaplacení se smlouva považuje za neplatnou.'),
    ).toBeUndefined()
  })

  it('passes a sound suggestion through unchanged', () => {
    const ok = 'Kupující uplatní práva z vadného plnění písemně na adresu prodávajícího.'
    expect(sanitizeSuggestion(ok)).toBe(ok)
  })

  it('passes undefined through', () => {
    expect(sanitizeSuggestion(undefined)).toBeUndefined()
  })
})
