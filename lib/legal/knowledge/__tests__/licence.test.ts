/**
 * The sentence "autor převádí veškerá autorská práva" is in half the Czech IT,
 * design and marketing contracts in circulation, and it is impossible: § 26
 * odst. 1 AZ makes economic rights non-transferable and § 11 odst. 4 says the
 * same of moral rights. Only a licence can be granted.
 *
 * The rest of these pin the defaults, because § 2376 odst. 3 fills every gap
 * against the acquirer — Czech Republic, one year, usual quantity — and § 2362
 * makes an unstated licence non-exclusive. A licence that reads broadly but
 * omits the scope is a one-year Czech non-exclusive licence.
 *
 * Checked against the statute texts on 2026-08-24.
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

const profile = CONTRACT_PROFILES.licence
const rule = (id: string) => profile.rules.find((r) => r.id === id)
const schema = getSchema('licencni-smlouva-v1')
const field = (sectionId: string, fieldId: string) =>
  schema.sections.find((s) => s.id === sectionId)?.fields.find((f) => f.id === fieldId)

describe('detection', () => {
  it('recognises a licence', () => {
    expect(
      resolveContractFamily('LICENČNÍ SMLOUVA\nPoskytovatel poskytuje nabyvateli licenci k dílu.'),
    ).toBe('licence')
  })

  it('wins over the smlouva o dílo the work came from', () => {
    // § 61 AZ ties the two together, so a licence to a commissioned work names
    // the dílo — and the dílo checklist would ask for handover and defect terms.
    const doc =
      'LICENČNÍ SMLOUVA\nK dílu vytvořenému na základě smlouvy o dílo ze dne 1. 2. 2027 ' +
      'poskytuje autor licenci.'
    expect(resolveContractFamily(doc)).toBe('licence')
  })

  it('leaves an actual smlouva o dílo alone', () => {
    expect(
      resolveContractFamily('SMLOUVA O DÍLO\nZhotovitel provede dílo a objednatel je převezme.'),
    ).toBe('services')
  })
})

describe('copyright cannot be transferred', () => {
  it('treats an assignment clause as struck out', () => {
    const r = rule('licence-neprevadi-se')
    expect(r?.kind).toBe('prohibited')
    expect(r?.consequence).toBe('neprihlizi-se')
    expect(r?.law).toMatch(/26 odst\. 1/)
    expect(r?.law).toMatch(/11 odst\. 4/)
  })

  it('says plainly that such a contract transfers nothing', () => {
    expect(rule('licence-neprevadi-se')?.reviewCheck).toMatch(/nepřevede nic/)
  })

  it('keeps moral rights out of reach of a waiver', () => {
    expect(rule('licence-osobnostni-prava')?.reviewCheck).toMatch(/nepřihlíží/)
  })

  it('bans the phrasing in the drafting instructions too', () => {
    expect(schema.metadata.aiInstructions).toMatch(/NIKDY nepiš, že autor „převádí autorská práva"/)
    expect(renderKnowledgeForDrafting('licence')).toMatch(/NEPŘEVODITELNÁ/)
  })
})

describe('the defaults that shrink an unstated licence', () => {
  it('carries all three § 2376 odst. 3 fallbacks', () => {
    const r = rule('licence-rozsah-uzemi-cas')
    expect(r?.requirement).toMatch(/České republiky/)
    expect(r?.requirement).toMatch(/NEJVÝŠE JEDEN ROK/)
    expect(r?.law).toMatch(/2376 odst\. 3/)
  })

  it('says what a broadly worded but unscoped licence actually is', () => {
    expect(rule('licence-rozsah-uzemi-cas')?.reviewCheck).toMatch(/roční a tuzemská/)
  })

  it('makes territory and duration required fields with useful defaults', () => {
    expect(field('rozsah', 'territory')?.required).toBe(true)
    expect(field('rozsah', 'territory')?.defaultValue).toBe('celosvetove')
    expect(field('rozsah', 'durationType')?.required).toBe(true)
    expect(field('rozsah', 'durationType')?.defaultValue).toBe('trvani-prav')
  })

  it('defaults exclusivity to what the law would supply', () => {
    // § 2362 — non-exclusive unless expressly agreed. The form should not
    // quietly promise more than the statute gives.
    expect(rule('licence-vyhradnost')?.law).toMatch(/2362/)
    expect(field('rozsah', 'exclusivity')?.defaultValue).toBe('nevyhradni')
  })

  it('reminds an exclusive licensor they lose their own portfolio', () => {
    const r = rule('licence-vyhradni-zdrzeni')
    expect(r?.law).toMatch(/2360 odst\. 1/)
    expect(r?.reviewCheck).toMatch(/portfoli/)
    expect(field('rozsah', 'authorMayUse')?.conditional).toEqual({
      fieldId: 'exclusivity',
      value: 'vyhradni',
    })
  })
})

describe('the two clauses no drafting survives', () => {
  it('disregards a licence to unknown future uses', () => {
    const r = rule('licence-nezname-zpusoby')
    expect(r?.kind).toBe('prohibited')
    expect(r?.consequence).toBe('neprihlizi-se')
    expect(r?.law).toMatch(/2372 odst\. 1/)
  })

  it('disregards any waiver of the additional-remuneration right', () => {
    const r = rule('licence-dodatecna-odmena')
    expect(r?.kind).toBe('prohibited')
    expect(r?.consequence).toBe('neprihlizi-se')
    expect(r?.requirement).toMatch(/vzdá-li se autor tohoto práva výslovně/)
    expect(r?.law).toMatch(/2374 odst\. 2/)
  })

  it('tells the drafter not to write either of them', () => {
    expect(schema.metadata.aiInstructions).toMatch(/dosud neznámých/)
    expect(schema.metadata.aiInstructions).toMatch(/NIKDY nevylučuj právo autora na dodatečnou/)
  })
})

describe('the general rule that is reversed here', () => {
  it('marks § 2359 inapplicable to copyright works', () => {
    expect((profile.inapplicable ?? []).map((p) => p.section)).toContain('2359')
  })

  it('states the duty to use, and lets the form switch it off', () => {
    const r = rule('licence-povinnost-vyuzit')
    expect(r?.requirement).toMatch(/POVINEN/)
    expect(r?.law).toMatch(/2372 odst\. 2/)
    expect(field('nakladani', 'mustUse')?.required).toBe(true)
  })
})

describe('what the acquirer may do with the licence', () => {
  it('defaults sub-licensing to forbidden, as the law does', () => {
    expect(rule('licence-podlicence')?.law).toMatch(/2363/)
    expect(field('nakladani', 'sublicence')?.defaultValue).toBe('ne')
  })

  it('spells out why that matters for an agency', () => {
    expect(rule('licence-podlicence')?.reviewCheck).toMatch(/celý smysl obchodu/)
  })

  it('keeps assignment behind written consent, with the business-transfer carve-out', () => {
    const r = rule('licence-postoupeni')
    expect(r?.law).toMatch(/2364/)
    expect(r?.law).toMatch(/2365/)
    expect(r?.requirement).toMatch(/obchodního závodu/)
  })

  it('warns about the one-year notice default', () => {
    const r = rule('licence-vypoved-rok')
    expect(r?.requirement).toMatch(/JEDNOHO ROKU/)
    expect(r?.law).toMatch(/2370/)
  })
})

describe('when no licence is needed at all', () => {
  it('says an employer already exercises the rights', () => {
    const r = rule('licence-zamestnanecke-dilo')
    expect(r?.law).toMatch(/58 odst\. 1/)
    expect(r?.reviewCheck).toMatch(/nadbytečné/)
  })

  it('says a commissioned work already carries a purpose licence', () => {
    const r = rule('licence-dilo-na-objednavku')
    expect(r?.requirement).toMatch(/K ÚČELU/)
    expect(r?.requirement).toMatch(/NAD RÁMEC/)
    expect(r?.law).toMatch(/61/)
  })

  it('asks the relationship before anything else', () => {
    const relationship = field('dilo', 'authorRelationship')
    expect(relationship?.required).toBe(true)
    expect(relationship?.options?.map((o) => o.value)).toEqual([
      'nezavisly',
      'objednavka',
      'zamestnanec',
    ])
  })
})

describe('form is narrower than templates claim', () => {
  it('requires writing only for an exclusive licence', () => {
    const r = rule('licence-pisemna-forma')
    expect(r?.law).toMatch(/2358 odst\. 2/)
    expect(r?.reviewCheck).toMatch(/u nevýhradní licence naopak písemnou\s+formu nevyžaduj/i)
  })
})

describe('the audit on a real licence', () => {
  it('accepts a complete one', () => {
    const complete = `LICENČNÍ SMLOUVA
      Předmětem licence je grafický manuál a logotyp specifikovaný v příloze č. 1.
      Licence zahrnuje rozmnožování, rozšiřování a sdělování veřejnosti.
      Licence se poskytuje jako výhradní, celosvětově a na dobu trvání majetkových práv autorských.
      Autor je oprávněn dílo užít ve svém portfoliu a referencích.
      Odměna za licenci činí 120 000 Kč.
      Nabyvatel předloží autorovi jednou ročně informace o užití díla.
      Nabyvatel je oprávněn poskytnout podlicenci třetí osobě.
      Nabyvatel není povinen licenci využít.
      V Praze dne 1. 4. 2027, podpisy obou stran.`
    const missing = auditContract(complete, 'licence').notFound.map((f) => f.ruleId)
    expect(missing).toEqual([])
  })

  it('notices the scope an assignment-style contract leaves out', () => {
    const assignmentStyle = `LICENČNÍ SMLOUVA
      Autor převádí na nabyvatele veškerá autorská práva k dílu — logotypu značky Aurora.
      Licence zahrnuje rozmnožování a rozšiřování.
      Odměna činí 120 000 Kč.
      V Praze dne 1. 4. 2027, podpisy obou stran.`
    const missing = auditContract(assignmentStyle, 'licence').notFound.map((f) => f.ruleId)
    expect(missing).toContain('licence-rozsah-uzemi-cas')
    expect(missing).toContain('licence-vyhradnost')
  })

  it('puts the assignment problem in front of the reviewer', () => {
    expect(renderKnowledgeForReview('licence')).toMatch(/psaná jako převod autorských práv/)
  })
})
