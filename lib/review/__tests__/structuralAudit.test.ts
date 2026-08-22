/**
 * The audit's value is that its findings are observations rather than opinions,
 * so the tests are mostly about not over-claiming: a false "not found" becomes a
 * confidently reported missing clause, which is the failure mode the whole
 * review-quality effort has been chasing.
 */

import { describe, it, expect } from 'vitest'
import { auditContract, renderAudit } from '../structuralAudit'

const LEASE_WITH_PENALTY = `NÁJEMNÍ SMLOUVA
Pronajímatel přenechává nájemci byt č. 4.
Nájemné činí 18 000 Kč měsíčně. Jistota činí trojnásobek nájemného.
Při prodlení s úhradou se sjednává smluvní pokuta ve výši 0,5 % denně.`

const NO_PRICE_SALE = `KUPNÍ SMLOUVA
Prodávající prodává kupujícímu vozidlo VIN TMB123.`

const CLEAN_LEASE = `NÁJEMNÍ SMLOUVA
Pronajímatel přenechává nájemci byt č. 4.
Nájemné činí 18 000 Kč měsíčně. Jistota činí trojnásobek nájemného.
Při prodlení náleží pronajímateli zákonný úrok z prodlení.`

describe('prohibited clauses', () => {
  it('finds a contractual penalty in a residential lease', () => {
    const audit = auditContract(LEASE_WITH_PENALTY, 'tenancy')
    expect(audit.prohibitedPresent.map((f) => f.ruleId)).toContain('tenancy-smluvni-pokuta')
  })

  it('does not invent one where there is none', () => {
    const audit = auditContract(CLEAN_LEASE, 'tenancy')
    expect(audit.prohibitedPresent.map((f) => f.ruleId)).not.toContain('tenancy-smluvni-pokuta')
  })

  it('does not flag a penalty in a sale contract, where it is lawful', () => {
    const sale = 'KUPNÍ SMLOUVA\nKupní cena činí 250 000 Kč. Sjednává se smluvní pokuta 0,05 % denně.'
    const audit = auditContract(sale, 'sale')
    expect(audit.prohibitedPresent.map((f) => f.ruleId)).not.toContain('tenancy-smluvni-pokuta')
  })
})

describe('required elements', () => {
  it('reports a purchase price that is genuinely absent', () => {
    const noPrice = 'KUPNÍ SMLOUVA\nProdávající prodává kupujícímu vozidlo VIN TMB123.'
    const audit = auditContract(noPrice, 'sale')
    expect(audit.notFound.map((f) => f.ruleId)).toContain('sale-cena')
  })

  it('does not report a price that is present', () => {
    const withPrice = 'KUPNÍ SMLOUVA\nKupní cena činí 250 000 Kč.'
    const audit = auditContract(withPrice, 'sale')
    expect(audit.notFound.map((f) => f.ruleId)).not.toContain('sale-cena')
  })

  it('accepts an alternative phrasing of the same element', () => {
    // "Cena činí" without the word "kupní" is still a stated price. Missing this
    // would tell the user a valid contract has no price in it.
    const audit = auditContract('Cena činí 250 000 Kč.', 'sale')
    expect(audit.notFound.map((f) => f.ruleId)).not.toContain('sale-cena')
  })

  it('finds the essentials of a real dohoda o provedení práce', () => {
    const dpp = `DOHODA O PROVEDENÍ PRÁCE
      Zaměstnavatel se zavazuje zaplatit odměnu 450 Kč za hodinu.
      Rozsah práce v kalendářním roce nepřesáhne 300 hodin.`
    const audit = auditContract(dpp, 'employment-agreement')
    const missing = audit.notFound.map((f) => f.ruleId)
    expect(missing).not.toContain('dpp-odmena-minimum')
    expect(missing).not.toContain('dpp-rozsah-300-hodin')
  })
})

describe('scope', () => {
  it('audits common rules alone when the type is unknown', () => {
    const audit = auditContract('Nějaký text.', null)
    expect(audit.checked).toBeGreaterThan(0)
    // Nothing type-specific may leak in.
    expect(audit.notFound.every((f) => f.ruleId.startsWith('common-'))).toBe(true)
  })

  it('reports how many rules it could actually check', () => {
    const audit = auditContract(CLEAN_LEASE, 'tenancy')
    expect(audit.checked).toBeGreaterThan(0)
  })
})

describe('renderAudit', () => {
  it('presents an absence as something to verify, not as a conclusion', () => {
    // The wording matters: told a clause is missing, the model reports it;
    // asked to verify, it looks at the text.
    const rendered = renderAudit(auditContract(NO_PRICE_SALE, 'sale'))
    expect(rendered).toMatch(/ověř, zda skutečně chybí/)
    expect(rendered).toMatch(/není vyjádřen jinými slovy/)
  })

  it('separates what it found from what it did not', () => {
    const rendered = renderAudit(auditContract(LEASE_WITH_PENALTY, 'tenancy'))
    expect(rendered).toMatch(/V textu NALEZENO/)
    expect(rendered).toMatch(/vyhledáním v textu/)
    // Says outright that this was not the model's judgement.
    expect(rendered).toMatch(/provedena strojově, nikoli modelem/)
  })

  it('says plainly that a clean result is not a clean bill of health', () => {
    const rendered = renderAudit({ notFound: [], prohibitedPresent: [], checked: 5 })
    expect(rendered).toMatch(/To neznamená, že smlouva je v pořádku/)
  })

  it('returns nothing when no rule was checkable', () => {
    expect(renderAudit({ notFound: [], prohibitedPresent: [], checked: 0 })).toBe('')
  })

  it('carries the conditional caveat so a rule is not over-applied', () => {
    const rendered = renderAudit({
      notFound: [],
      prohibitedPresent: [
        {
          ruleId: 'x',
          requirement: 'Něco',
          law: '§ 1',
          appliesWhen: 'Jedna strana je spotřebitel.',
        },
      ],
      checked: 1,
    })
    expect(rendered).toMatch(/Platí jen když: Jedna strana je spotřebitel/)
  })
})
