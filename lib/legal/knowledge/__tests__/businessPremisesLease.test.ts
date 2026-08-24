/**
 * The default mistake here is a residential template with "byt" swapped for
 * "provozovna". It brings three rules that do not apply and leaves out the one
 * entitlement that has no residential analogue.
 *
 * These tests keep the two regimes apart in both directions: the byt rules must
 * stay out, and § 2312, § 2314 and § 2315 must stay in.
 *
 * Checked against the statute text on 2026-08-24.
 */

import { describe, it, expect } from 'vitest'
import {
  CONTRACT_PROFILES,
  renderKnowledgeForDrafting,
  renderKnowledgeForReview,
  resolveContractFamily,
} from '../index'
import { auditContract } from '@/lib/review/structuralAudit'
import { getSchema } from '@/lib/contracts/contractSchemas'

const profile = CONTRACT_PROFILES['business-premises-lease']
const rule = (id: string) => profile.rules.find((r) => r.id === id)
const schema = getSchema('najem-prostoru-podnikani-v1')
const inapplicable = (profile.inapplicable ?? []).map((p) => p.section)

describe('detection separates it from a flat', () => {
  it('recognises a business lease', () => {
    expect(
      resolveContractFamily(
        'NÁJEMNÍ SMLOUVA\nPředmětem je nájem prostoru sloužícího podnikání o výměře 84 m².',
      ),
    ).toBe('business-premises-lease')
  })

  it('recognises the older wording people still use', () => {
    expect(
      resolveContractFamily('SMLOUVA O NÁJMU NEBYTOVÝCH PROSTOR\nNájemce zde provozuje kavárnu.'),
    ).toBe('business-premises-lease')
  })

  it('still routes a flat to the residential profile', () => {
    expect(
      resolveContractFamily('NÁJEMNÍ SMLOUVA\nPronajímatel přenechává nájemci byt č. 4 k bydlení.'),
    ).toBe('tenancy')
  })
})

describe('the byt rules stay out', () => {
  it('marks the deposit cap inapplicable and says so to the reviewer', () => {
    expect(inapplicable).toContain('2254')
    expect(rule('bizlease-jistota')?.reviewCheck).toMatch(/NEHLAS/)
  })

  it('marks the § 2288 notice grounds inapplicable', () => {
    expect(inapplicable).toContain('2288')
  })

  it('marks the § 2286 objections instruction inapplicable', () => {
    expect(inapplicable).toContain('2286')
  })

  it('marks § 2239 inapplicable — it is a byt protection', () => {
    expect(inapplicable).toContain('2239')
  })

  it('tells the drafter outright this is not a flat', () => {
    expect(schema.metadata.aiInstructions).toMatch(/TOTO NENÍ NÁJEM BYTU/)
    expect(schema.metadata.aiInstructions).toMatch(/§ 2254/)
  })

  it('never asks the drafting prompt for a three-month deposit ceiling', () => {
    const drafting = renderKnowledgeForDrafting('business-premises-lease')
    expect(drafting).not.toMatch(/trojnásobek měsíčního nájemného/)
  })
})

describe('the notice regime that actually applies', () => {
  it('defaults to six months, not three', () => {
    const r = rule('bizlease-vypovedni-doba')
    expect(r?.requirement).toMatch(/ŠESTIMĚSÍČNÍ/)
    expect(r?.law).toMatch(/2312/)

    const doba = schema.sections.find((s) => s.id === 'doba')
    expect(doba?.fields.find((f) => f.id === 'noticeMonths')?.defaultValue).toBe('6')
  })

  it('rejects the residential start-of-next-month rule', () => {
    expect(rule('bizlease-vypovedni-doba')?.reviewCheck).toMatch(/prvního dne dalšího měsíce/)
    expect(schema.metadata.aiInstructions).toMatch(/Nikdy nepiš, že výpovědní doba běží od/)
  })

  it('makes a reasonless notice invalid', () => {
    const r = rule('bizlease-duvod-vypovedi')
    expect(r?.consequence).toBe('neplatnost')
    expect(r?.law).toMatch(/2310 odst\. 1/)
  })

  it('carries both sides of the fixed-term grounds', () => {
    expect(rule('bizlease-duvody-najemce')?.law).toMatch(/2308/)
    expect(rule('bizlease-duvody-pronajimatele')?.requirement).toMatch(/JEDEN MĚSÍC/)
  })

  it('keeps the objections window and what missing it costs', () => {
    const r = rule('bizlease-namitky')
    expect(r?.requirement).toMatch(/JEDNOHO MĚSÍCE/)
    expect(r?.requirement).toMatch(/ZANIKNE/)
    expect(r?.law).toMatch(/2314/)
  })

  it('warns that vacating counts as acceptance', () => {
    const r = rule('bizlease-vyklizeni-je-souhlas')
    expect(r?.law).toMatch(/2313/)
    expect(r?.reviewCheck).toMatch(/vyklidit/)
  })
})

describe('the entitlement templates leave out', () => {
  it('carries § 2315 and explains when it is lost', () => {
    const r = rule('bizlease-nahrada-zakaznicka-zakladna')
    expect(r?.law).toMatch(/2315/)
    expect(r?.requirement).toMatch(/ZE STRANY PRONAJÍMATELE/)
    expect(r?.requirement).toMatch(/hrubé porušení/)
  })

  it('makes the form take a position rather than stay silent', () => {
    const doba = schema.sections.find((s) => s.id === 'doba')
    const field = doba?.fields.find((f) => f.id === 'customerBaseCompensation')
    expect(field?.required).toBe(true)
    expect(field?.defaultValue).toBe('zakonna')
    expect(field?.options?.map((o) => o.value)).toContain('vyloucena')
  })

  it('requires a waiver to be visible rather than buried', () => {
    expect(schema.metadata.aiInstructions).toMatch(/VÝSLOVNĚ a odděleně/)
  })
})

describe('operating the premises', () => {
  it('keeps the one-month silent consent for signage', () => {
    const r = rule('bizlease-oznaceni-stity')
    expect(r?.requirement).toMatch(/JEDNOHO MĚSÍCE/)
    expect(r?.law).toMatch(/2305/)
  })

  it('allows insubstantial changes of activity', () => {
    expect(rule('bizlease-zmena-cinnosti')?.reviewCheck).toMatch(/nepodstatné změny/)
  })

  it('remembers the lease can move with the business', () => {
    expect(rule('bizlease-prevod-najmu')?.law).toMatch(/2307/)
  })
})

describe('the audit on a real lease', () => {
  it('accepts a complete one', () => {
    const complete = `NÁJEMNÍ SMLOUVA O NÁJMU PROSTORU SLOUŽÍCÍHO PODNIKÁNÍ
      Předmětem nájmu je prostor č. 3 o výměře 84 m² v 1. nadzemním podlaží.
      Účelem nájmu je provozování kavárny.
      Nájem se sjednává na dobu neurčitou od 1. 1. 2027.
      Nájemné činí 45 000 Kč měsíčně bez DPH, splatné do 15. dne měsíce.
      Zálohy na služby činí 6 000 Kč měsíčně, vyúčtování do 30. 4.
      Nájemce složí jistotu ve výši 135 000 Kč.
      Výpovědní doba činí šest měsíců.
      Vypovídaná strana může do jednoho měsíce vznést proti výpovědi námitky.
      Nájemci náleží náhrada za převzetí zákaznické základny podle § 2315.
      Nájemce může prostor opatřit štítem se souhlasem pronajímatele.
      O předání prostoru bude sepsán předávací protokol se stavem měřidel.
      V Praze dne 1. 12. 2026, podpisy obou stran.`
    const missing = auditContract(complete, 'business-premises-lease').notFound.map((f) => f.ruleId)
    expect(missing).toEqual([])
  })

  it('notices the two things a residential template drops', () => {
    const fromResidentialTemplate = `NÁJEMNÍ SMLOUVA O NÁJMU PROSTORU SLOUŽÍCÍHO PODNIKÁNÍ
      Předmětem nájmu je prostor č. 3 o výměře 84 m².
      Účelem nájmu je provozování kavárny.
      Nájem se sjednává na dobu neurčitou od 1. 1. 2027.
      Nájemné činí 45 000 Kč měsíčně, splatné do 15. dne měsíce.
      Výpovědní doba činí tři měsíce.
      V Praze dne 1. 12. 2026, podpisy obou stran.`
    const missing = auditContract(fromResidentialTemplate, 'business-premises-lease').notFound.map(
      (f) => f.ruleId,
    )
    expect(missing).toContain('bizlease-namitky')
  })

  it('raises § 2315 through the review, not as a structural defect', () => {
    // A lease silent about it is not defective — the right exists by law. The
    // audit would be claiming a defect that is not there, so the reminder
    // belongs in the reviewer's checklist instead.
    expect(rule('bizlease-nahrada-zakaznicka-zakladna')?.kind).toBe('recommended')
    expect(renderKnowledgeForReview('business-premises-lease')).toMatch(/zákaznické základny/)
  })
})
