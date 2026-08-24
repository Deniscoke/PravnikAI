/**
 * A preliminary contract dies two ways, and neither of them looks like a
 * breach. Nobody calls in time and the duty expires (§ 1788 odst. 1); or
 * circumstances change and the bound party walks (§ 1788 odst. 2). Both sides
 * usually believe the document "holds" until someone acts.
 *
 * The rest of its value rests on § 1787 — a court can conjure the future
 * contract into existence — but only out of content the parties actually
 * agreed. Vagueness does not make the document flexible; it makes it empty.
 *
 * Checked against the statute text on 2026-08-24.
 */

import { describe, it, expect } from 'vitest'
import { CONTRACT_PROFILES, resolveContractFamily, renderKnowledgeForDrafting } from '../index'
import { auditContract } from '@/lib/review/structuralAudit'
import { getSchema } from '@/lib/contracts/contractSchemas'

const profile = CONTRACT_PROFILES['preliminary-contract']
const rule = (id: string) => profile.rules.find((r) => r.id === id)
const schema = getSchema('smlouva-o-smlouve-budouci-v1')

describe('detection beats the contract it promises', () => {
  it('recognises the preliminary contract', () => {
    expect(
      resolveContractFamily(
        'SMLOUVA O SMLOUVĚ BUDOUCÍ KUPNÍ\nStrany se zavazují uzavřít budoucí kupní smlouvu.',
      ),
    ).toBe('preliminary-contract')
  })

  it('is not mistaken for the sale itself', () => {
    // "budoucí kupní smlouva" contains "kupní smlouva" verbatim, so without
    // `beats` this would be checked against the rules for a concluded sale.
    const doc =
      'SMLOUVA O SMLOUVĚ BUDOUCÍ\nPředmětem budoucí kupní smlouvy je jednotka č. 12/3. ' +
      'Kupní cena činí 6 400 000 Kč.'
    expect(resolveContractFamily(doc)).toBe('preliminary-contract')
  })

  it('leaves an actual purchase alone', () => {
    expect(
      resolveContractFamily('KUPNÍ SMLOUVA\nProdávající prodává kupujícímu jednotku č. 12/3.'),
    ).toBe('sale')
  })
})

describe('the deadline that kills it silently', () => {
  it('says the duty expires rather than being breached', () => {
    const r = rule('prelim-lhuta-vyzvy')
    expect(r?.requirement).toMatch(/ZANIKNE/)
    expect(r?.requirement).toMatch(/JEDEN ROK/)
    expect(r?.law).toMatch(/1788 odst\. 1/)
  })

  it('corrects the belief that it runs until someone terminates', () => {
    expect(rule('prelim-zanik-nevyzvanim')?.reviewCheck).toMatch(/dokud jej některá strana nevypoví/)
  })

  it('makes the call deadline a required field', () => {
    const lhuty = schema.sections.find((s) => s.id === 'lhuty')
    const deadline = lhuty?.fields.find((f) => f.id === 'callDeadline')
    expect(deadline?.required).toBe(true)
    expect(deadline?.legalNote).toMatch(/ZANIKÁ/)
  })

  it('pins a concrete period rather than "bez zbytečného odkladu"', () => {
    const lhuty = schema.sections.find((s) => s.id === 'lhuty')
    expect(lhuty?.fields.find((f) => f.id === 'daysToConclude')?.defaultValue).toBe('30')
    expect(rule('prelim-lhuta-k-uzavreni')?.law).toMatch(/1786/)
  })
})

describe('the other exit', () => {
  it('carries the change of circumstances and the duty to report it', () => {
    const r = rule('prelim-zmena-okolnosti')
    expect(r?.requirement).toMatch(/ZANIKÁ/)
    expect(r?.requirement).toMatch(/BEZ\s+ZBYTEČNÉHO ODKLADU/)
    expect(r?.requirement).toMatch(/nahradí škodu/)
    expect(r?.law).toMatch(/1788 odst\. 2/)
  })

  it('includes the clause by default in the form', () => {
    const okolnosti = schema.sections.find((s) => s.id === 'okolnosti')
    expect(
      okolnosti?.fields.find((f) => f.id === 'changeOfCircumstances')?.defaultValue,
    ).toBe('ano')
  })
})

describe('vagueness defeats the remedy', () => {
  it('treats subject, price and general content as essential', () => {
    for (const id of ['prelim-obsah-budouci', 'prelim-predmet', 'prelim-cena']) {
      expect(rule(id)?.kind, id).toBe('essential')
      expect(rule(id)?.consequence, id).toBe('nevznikne')
    }
  })

  it('explains that the court can only work from what was agreed', () => {
    expect(rule('prelim-obsah-budouci')?.requirement).toMatch(/OBECNÝM ZPŮSOBEM/)
    expect(rule('prelim-obsah-budouci')?.reviewCheck).toMatch(/nevymahateln/)
  })

  it('keeps § 1787 in view as the real point of the document', () => {
    const r = rule('prelim-urceni-soudem')
    expect(r?.requirement).toMatch(/SOUD/)
    expect(r?.reviewCheck).toMatch(/smluvní pokuta nebo/)
  })
})

describe('form is not where this one fails', () => {
  it('marks § 560 inapplicable to the preliminary contract itself', () => {
    expect((profile.inapplicable ?? []).map((p) => p.section)).toContain('560')
  })

  it('still says the future purchase of property needs writing', () => {
    const r = rule('prelim-forma-budouci-smlouvy')
    expect(r?.law).toMatch(/2128 odst\. 1/)
    expect(r?.reviewCheck).toMatch(/neplatná pro nedostatek/)
  })

  it('gets the katastr signature rule right', () => {
    // Verification is not mandatory — but without it authenticity must be
    // proved within 30 days or the proceeding stops.
    const r = rule('prelim-katastr-podpisy')
    expect(r?.requirement).toMatch(/30 dnů/)
    expect(r?.law).toMatch(/256\/2013/)
  })

  it('tells the drafter not to invent a form defect', () => {
    expect(schema.metadata.aiInstructions).toMatch(/Nepiš, že smlouva o smlouvě budoucí je neplatná/)
  })
})

describe('the money', () => {
  it('insists the deposit outcome be spelled out by fault', () => {
    expect(rule('prelim-zaloha')?.requirement).toMatch(/na čí straně důvod leží/)
  })

  it('remembers § 2050 — damages are not automatic alongside a penalty', () => {
    expect(rule('prelim-smluvni-pokuta')?.reviewCheck).toMatch(/2050/)
    const penize = schema.sections.find((s) => s.id === 'penize')
    expect(penize?.fields.find((f) => f.id === 'damagesBesidePenalty')?.required).toBe(true)
  })
})

describe('the audit on a real preliminary contract', () => {
  it('accepts a complete one', () => {
    const complete = `SMLOUVA O SMLOUVĚ BUDOUCÍ KUPNÍ
      Předmětem budoucí kupní smlouvy je jednotka č. 12/3 v k. ú. Vinohrady, LV 4521.
      Kupní cena činí 6 400 000 Kč.
      Oprávněná strana vyzve druhou stranu k uzavření nejpozději do 30. 6. 2027.
      Budoucí smlouva bude uzavřena do 30 dnů od doručení výzvy.
      Výzva se doručuje doporučeně na adresu uvedenou v záhlaví.
      Zavázaná strana oznámí změnu okolností bez zbytečného odkladu.
      V Praze dne 1. 3. 2027, podpisy obou stran.`
    const missing = auditContract(complete, 'preliminary-contract').notFound.map((f) => f.ruleId)
    expect(missing).toEqual([])
  })

  it('notices an agreement to agree with no deadline', () => {
    const vague = `SMLOUVA O SMLOUVĚ BUDOUCÍ
      Strany se dohodly, že spolu v budoucnu uzavřou kupní smlouvu na nemovitost.
      V Praze dne 1. 3. 2027, podpisy obou stran.`
    const missing = auditContract(vague, 'preliminary-contract').notFound.map((f) => f.ruleId)
    expect(missing).toContain('prelim-predmet')
    expect(missing).toContain('prelim-zmena-okolnosti')
  })
})

describe('the drafting prompt', () => {
  it('demands the expiry warning rather than leaving it optional', () => {
    expect(schema.metadata.aiInstructions).toMatch(/VŽDY uveď lhůtu pro výzvu/)
    expect(renderKnowledgeForDrafting('preliminary-contract')).toMatch(/ZANIKNE/)
  })
})
