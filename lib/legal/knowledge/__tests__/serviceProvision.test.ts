/**
 * Two boundaries decide everything about a services contract, and the schema is
 * built to keep the user on the right side of both.
 *
 * Against a dílo: an activity performed with due care, not a result handed over
 * and accepted. Against employment: the švarcsystém line, where getting it
 * wrong costs the client up to ten million and a two-year ban on the activity.
 *
 * Checked against the statute text on 2026-08-23.
 */

import { describe, it, expect } from 'vitest'
import { CONTRACT_PROFILES, resolveContractFamily, renderKnowledgeForDrafting } from '../index'
import { auditContract } from '@/lib/review/structuralAudit'
import { getSchema } from '@/lib/contracts/contractSchemas'
import {
  ILLEGAL_WORK_FINE_MAX_CZK,
  ILLEGAL_WORK_FINE_MIN_CZK,
  formatCzk,
} from '@/lib/legal/czechLegalFacts'

const profile = CONTRACT_PROFILES['service-provision']
const rule = (id: string) => profile.rules.find((r) => r.id === id)

describe('telling a service from a dílo', () => {
  it('recognises a services contract', () => {
    expect(
      resolveContractFamily('SMLOUVA O POSKYTOVÁNÍ SLUŽEB\nPoskytovatel poskytuje správu serverů.'),
    ).toBe('service-provision')
  })

  it('still routes a dílo to its own profile', () => {
    expect(
      resolveContractFamily('SMLOUVA O DÍLO\nZhotovitel provede dílo a objednatel je převezme.'),
    ).toBe('services')
  })

  it('refuses to guess on a document naming itself both ways', () => {
    // Genuinely hybrid. Falling back to the common rules beats applying the
    // wrong half of a specific checklist.
    const hybrid =
      'SMLOUVA O POSKYTOVÁNÍ SLUŽEB\nNa jednotlivé výstupy se uzavře smlouva o dílo.'
    expect(resolveContractFamily(hybrid)).toBeNull()
  })

  it('says which regime a promised result pulls the contract into', () => {
    const r = rule('service-cinnost-ne-vysledek')
    expect(r?.kind).toBe('essential')
    expect(r?.requirement).toMatch(/VÝSLEDEK/)
    expect(r?.law).toMatch(/2586/)
  })

  it('keeps handover and defect-of-work rules out of a service', () => {
    const sections = (profile.inapplicable ?? []).map((p) => p.section)
    expect(sections).toContain('2605')
    expect(sections).toContain('2615')
  })

  it('warns off guaranteeing a measurable outcome', () => {
    expect(rule('service-odborna-pece')?.reviewCheck).toMatch(/vyhledávač|obratu/)
  })
})

describe('švarcsystém', () => {
  it('treats dependent work as the gravest defect available', () => {
    const r = rule('service-zavisla-prace')
    expect(r?.kind).toBe('prohibited')
    expect(r?.consequence).toBe('neplatnost')
    expect(r?.law).toMatch(/262\/2006/)
  })

  it('names the specific words that give it away', () => {
    const r = rule('service-zavisla-prace')
    for (const tell of ['pracovní dobu', 'dovolenou', 'nadřízeného', 'docházku']) {
      expect(r?.requirement).toContain(tell)
    }
  })

  it('carries the fine, floor included', () => {
    expect(ILLEGAL_WORK_FINE_MAX_CZK.value).toBe(10_000_000)
    expect(ILLEGAL_WORK_FINE_MIN_CZK.value).toBe(50_000)
    const r = rule('service-svarcsystem-sankce')
    expect(r?.requirement).toContain(formatCzk(ILLEGAL_WORK_FINE_MAX_CZK.value))
    expect(r?.requirement).toContain(formatCzk(ILLEGAL_WORK_FINE_MIN_CZK.value))
    expect(r?.law).toMatch(/435\/2004/)
  })

  it('asks for the clauses that point the other way', () => {
    const r = rule('service-samostatnost')
    expect(r?.requirement).toMatch(/vlastní náklady/)
    expect(r?.requirement).toMatch(/prostřednictvím třetí osoby/)
  })

  it('separates instructions about the result from instructions about the day', () => {
    expect(rule('service-pokyny-objednatele')?.requirement).toMatch(/VÝSLEDKU/)
  })

  it('never puts working hours or leave into the drafting prompt as requirements', () => {
    const drafting = renderKnowledgeForDrafting('service-provision')
    expect(drafting).toMatch(/NEPIŠ/)
  })
})

describe('the notice default nobody expects', () => {
  it('spells out § 1999', () => {
    const r = rule('service-vypoved-ctvrtleti')
    expect(r?.requirement).toMatch(/KE KONCI\s+KALENDÁŘNÍHO ČTVRTLETÍ|KONCI KALENDÁŘNÍHO/)
    expect(r?.requirement).toMatch(/tři měsíce/)
    expect(r?.law).toMatch(/1999/)
  })

  it('makes the notice clause required in the form, not optional', () => {
    const schema = getSchema('smlouva-o-poskytovani-sluzeb-v1')
    const trvani = schema.sections.find((s) => s.id === 'trvani')
    const notice = trvani?.fields.find((f) => f.id === 'noticeMonths')
    expect(notice?.required).toBe(true)
    expect(notice?.legalNote).toMatch(/1999/)
  })
})

describe('GDPR is not covered by a confidentiality clause', () => {
  it('sends the user to a separate processor agreement', () => {
    const r = rule('service-osobni-udaje')
    expect(r?.law).toMatch(/28/)
    expect(r?.requirement).toMatch(/Ustanovení\s+o mlčenlivosti ji nenahrazuje/)
    expect(r?.appliesWhen).toMatch(/osobní údaje/)
  })
})

describe('the audit on a real contract', () => {
  it('accepts one that stays on the right side of both lines', () => {
    const complete = `SMLOUVA O POSKYTOVÁNÍ SLUŽEB
      Poskytovatel poskytuje správu serverové infrastruktury v rozsahu 20 hodin měsíčně.
      Poskytovatel určuje způsob provedení sám, na vlastní náklady a odpovědnost,
      a může plnit prostřednictvím třetí osoby.
      Odměna činí 25 000 Kč měsíčně se splatností 14 dnů. Cestovní náklady hradí objednatel.
      Smlouva se uzavírá na dobu neurčitou a lze ji vypovědět s jednoměsíční výpovědní dobou.
      V Praze dne 3. 3. 2026, podpisy obou stran.`
    const missing = auditContract(complete, 'service-provision').notFound.map((f) => f.ruleId)
    expect(missing).toEqual([])
  })

  it('notices a contract with no exit clause', () => {
    const noExit = `SMLOUVA O POSKYTOVÁNÍ SLUŽEB
      Poskytovatel poskytuje účetní služby v rozsahu dle potřeby objednatele.
      Odměna činí 8 000 Kč měsíčně. Smlouva se uzavírá na dobu neurčitou.
      V Praze dne 3. 3. 2026, podpisy obou stran.`
    const missing = auditContract(noExit, 'service-provision').notFound.map((f) => f.ruleId)
    expect(missing).toContain('service-vypoved-ctvrtleti')
  })
})

describe('the schema keeps the user away from the line', () => {
  const schema = getSchema('smlouva-o-poskytovani-sluzeb-v1')

  it('is a two-sided contract', () => {
    expect(schema.metadata.documentKind).toBe('contract')
    expect(schema.metadata.aiInstructions).toMatch(/Podpisy uveď u OBOU stran/)
  })

  it('offers independence rather than working hours', () => {
    const zpusob = schema.sections.find((s) => s.id === 'zpusob')
    const ids = zpusob?.fields.map((f) => f.id) ?? []
    expect(ids).toContain('independence')
    expect(ids).toContain('ownResources')
    expect(ids).toContain('substitution')
    // The tells must not be collectable through the form at all.
    const allFieldIds = schema.sections.flatMap((s) => s.fields.map((f) => f.id))
    for (const banned of ['workingHours', 'vacation', 'supervisor', 'attendance']) {
      expect(allFieldIds).not.toContain(banned)
    }
  })

  it('bans the dílo vocabulary in the drafting instructions', () => {
    expect(schema.metadata.aiInstructions).toMatch(/předá dílo/)
    expect(schema.metadata.aiInstructions).toMatch(/NIKDY nevkládej znaky závislé práce/)
  })

  it('asks whether the provider is an individual, because that is what raises the risk', () => {
    const predmet = schema.sections.find((s) => s.id === 'predmet')
    const individual = predmet?.fields.find((f) => f.id === 'providerIsIndividual')
    expect(individual?.required).toBe(true)
    expect(individual?.legalNote).toMatch(/závislá práce|závislou práci/)
  })
})
