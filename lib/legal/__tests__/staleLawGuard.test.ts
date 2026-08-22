/**
 * The false-positive cases matter more than the true-positive ones here.
 *
 * A missed stale claim costs one bad sentence. A false positive silently
 * withholds a correct suggested clause and tells the user their lawful contract
 * is wrong — so every rule is tested against text that contains the same number
 * in a context where it is right.
 */

import { describe, it, expect } from 'vitest'
import { findStaleLaw, hasStaleLaw } from '../staleLawGuard'

describe('probation period', () => {
  it('catches the pre-flexinovela three-month maximum', () => {
    const finding = findStaleLaw(
      'Zkušební doba činí nejvýše 3 měsíce ode dne vzniku pracovního poměru.',
    )
    expect(finding.map((f) => f.id)).toContain('stale-probation-3-6')
    expect(finding[0].correction).toMatch(/4 měsíce/)
  })

  it('catches the six-month managerial variant', () => {
    expect(
      hasStaleLaw('U vedoucího zaměstnance může zkušební doba činit maximálně 6 měsíců.'),
    ).toBe(true)
  })

  it('accepts a lawful three-month probation that is not stated as the maximum', () => {
    // Three months is a perfectly valid probation period — only the claim that
    // it is the ceiling is outdated.
    expect(hasStaleLaw('Zkušební doba se sjednává v délce 3 měsíce.')).toBe(false)
  })

  it('accepts the current limit', () => {
    expect(hasStaleLaw('Zkušební doba činí nejvýše 4 měsíce.')).toBe(false)
  })
})

describe('notice period', () => {
  it('catches the claim that it starts the following month', () => {
    const finding = findStaleLaw(
      'Pracovní poměr se řídí zákoníkem práce. Výpovědní doba začíná běžet prvním ' +
        'dnem kalendářního měsíce následujícího po doručení výpovědi.',
    )
    expect(finding.map((f) => f.id)).toContain('stale-notice-period-start')
    expect(finding[0].correction).toMatch(/doručení/)
  })

  it('accepts the current rule', () => {
    expect(
      hasStaleLaw('Výpovědní doba činí dva měsíce a běží ode dne doručení výpovědi.'),
    ).toBe(false)
  })

  it('leaves a lease notice alone — § 2286 was never changed', () => {
    // The flexinovela moved the start of the notice period for employment only.
    // A lease notice period still runs from the first of the following month,
    // so firing here would tell a user their correct notice cites repealed law.
    const lease = `VÝPOVĚĎ Z NÁJMU BYTU
      Pronajímatel vypovídá nájem. Výpovědní doba činí tři měsíce a běží od prvního
      dne kalendářního měsíce následujícího po doručení této výpovědi nájemci
      (§ 2286 zák. č. 89/2012 Sb.).`
    expect(hasStaleLaw(lease)).toBe(false)
  })

  it('still fires on the same wording in an employment contract', () => {
    const employment = `PRACOVNÍ SMLOUVA podle zákoníku práce
      Výpovědní doba začíná běžet prvním dnem kalendářního měsíce následujícího
      po doručení výpovědi zaměstnanci.`
    expect(findStaleLaw(employment).map((f) => f.id)).toContain('stale-notice-period-start')
  })

  it('does not fire on an unrelated reference to the following month', () => {
    expect(
      hasStaleLaw('Mzda je splatná do 15. dne kalendářního měsíce následujícího po měsíci výkonu práce.'),
    ).toBe(false)
  })
})

describe('minimum wage', () => {
  it('catches a superseded figure', () => {
    const finding = findStaleLaw('Mzda nesmí být nižší než minimální mzda, která činí 18 900 Kč.')
    expect(finding.map((f) => f.id)).toContain('stale-minimum-wage')
    // toLocaleString('cs-CZ') groups with a non-breaking space.
    expect(finding[0].correction.replace(/ /g, ' ')).toMatch(/22 400/)
  })

  it('accepts the current figure', () => {
    expect(hasStaleLaw('Minimální mzda činí 22 400 Kč měsíčně.')).toBe(false)
  })

  it('does not diagnose an unlawfully low salary as an outdated statute', () => {
    // 19 000 is below the current minimum, which is a different defect entirely.
    // Reporting it as "outdated minimum wage" would be a wrong diagnosis.
    expect(
      hasStaleLaw('Sjednaná mzda činí 19 000 Kč, což odpovídá minimální mzdě.'),
    ).toBe(false)
  })
})

describe('rental deposit', () => {
  it('catches the pre-2020 sixfold ceiling', () => {
    const finding = findStaleLaw('Jistota může činit až šestinásobek měsíčního nájemného.')
    expect(finding.map((f) => f.id)).toContain('stale-deposit-sixfold')
  })

  it('accepts the current threefold ceiling', () => {
    expect(hasStaleLaw('Jistota činí trojnásobek měsíčního nájemného.')).toBe(false)
  })
})

describe('cash payment limit', () => {
  it('catches the old 350 000 limit', () => {
    expect(hasStaleLaw('Platby v hotovosti jsou omezeny částkou 350 000 Kč.')).toBe(true)
  })

  it('does not fire on a purchase price that happens to be 350 000', () => {
    expect(hasStaleLaw('Kupní cena činí 350 000 Kč a bude uhrazena bankovním převodem.')).toBe(
      false,
    )
  })
})

describe('consumer warranty', () => {
  it('catches the "statutory 24-month guarantee"', () => {
    const finding = findStaleLaw('Na zboží se ze zákona vztahuje záruka 24 měsíců.')
    expect(finding.map((f) => f.id)).toContain('stale-consumer-warranty-as-zaruka')
    expect(finding[0].correction).toMatch(/práva z vadného plnění/)
  })

  it('accepts a voluntarily granted guarantee', () => {
    // A contractual guarantee of 24 months is entirely lawful — it is only the
    // claim that the law imposes one that is wrong.
    expect(
      hasStaleLaw('Prodávající poskytuje kupujícímu záruku za jakost v délce 24 měsíců.'),
    ).toBe(false)
  })
})

describe('findStaleLaw', () => {
  it('returns nothing for empty input', () => {
    expect(findStaleLaw('')).toEqual([])
  })

  it('reports each rule at most once', () => {
    const text =
      'Zkušební doba nejvýše 3 měsíce. Zkušební doba nejvýše 3 měsíce. Zkušební doba nejvýše 3 měsíce.'
    expect(findStaleLaw(text)).toHaveLength(1)
  })

  it('reports several distinct problems in one text', () => {
    const text =
      'Zkušební doba činí nejvýše 3 měsíce. Jistota může činit až šestinásobek měsíčního nájemného.'
    expect(findStaleLaw(text).map((f) => f.id).sort()).toEqual([
      'stale-deposit-sixfold',
      'stale-probation-3-6',
    ])
  })

  it('leaves an ordinary correct contract alone', () => {
    const text = `KUPNÍ SMLOUVA
      Prodávající se zavazuje odevzdat kupujícímu osobní automobil VIN TMBJF25L0B2011111
      a umožnit mu nabýt vlastnické právo. Kupní cena činí 250 000 Kč a bude uhrazena
      bankovním převodem do 10 dnů od podpisu. Nebezpečí škody přechází předáním vozidla.
      Výpovědní doba se nesjednává. Smlouva je vyhotovena ve dvou stejnopisech.`
    expect(findStaleLaw(text)).toEqual([])
  })
})
