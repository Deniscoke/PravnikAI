/**
 * One sentence in this document decides whether the employee walks away with
 * three months' pay or nothing. § 67 odst. 1 gives severance where the
 * employment ends by agreement "z týchž důvodů" as § 52 a)–c) — so the
 * organisational reason has to be recorded IN the agreement, or the employee is
 * left proving it later against an employer with no reason to help.
 *
 * These tests keep that requirement, and the two asymmetries people get wrong:
 * an agreement carries no notice period and no protected period.
 *
 * Checked against the statute text on 2026-08-23.
 */

import { describe, it, expect } from 'vitest'
import { CONTRACT_PROFILES, resolveContractFamily, renderKnowledgeForDrafting } from '../index'
import { auditContract } from '@/lib/review/structuralAudit'
import { getSchema } from '@/lib/contracts/contractSchemas'

const profile = CONTRACT_PROFILES['mutual-termination']
const rule = (id: string) => profile.rules.find((r) => r.id === id)
const schema = getSchema('dohoda-o-rozvazani-v1')

describe('detection keeps it away from the notice checklist', () => {
  it('recognises the agreement', () => {
    expect(
      resolveContractFamily('DOHODA O ROZVÁZÁNÍ PRACOVNÍHO POMĚRU\nPoměr končí ke dni 31. 10. 2026.'),
    ).toBe('mutual-termination')
  })

  it('accepts the other two names people use', () => {
    for (const title of [
      'Dohoda o ukončení pracovního poměru',
      'Dohoda o skončení pracovního poměru',
    ]) {
      expect(resolveContractFamily(`${title}\nPracovní poměr končí dohodou stran.`)).toBe(
        'mutual-termination',
      )
    }
  })

  it('wins over the pracovní smlouva it ends', () => {
    const doc =
      'DOHODA O ROZVÁZÁNÍ PRACOVNÍHO POMĚRU\nPracovní smlouva ze dne 1. 9. 2024, druh práce: účetní.'
    expect(resolveContractFamily(doc)).toBe('mutual-termination')
  })

  it('still leaves an actual výpověď to the notice profile', () => {
    expect(
      resolveContractFamily('VÝPOVĚĎ Z PRACOVNÍHO POMĚRU\nDávám výpověď podle § 52 písm. c).'),
    ).toBe('employment-notice')
  })
})

describe('the sentence that decides the severance', () => {
  it('requires the organisational reason to be written down', () => {
    const r = rule('mutterm-duvod-kvuli-odstupnemu')
    expect(r?.requirement).toMatch(/UVEĎ TO V DOHODĚ/)
    expect(r?.requirement).toMatch(/z týchž důvodů/)
    expect(r?.law).toMatch(/67 odst\. 1/)
  })

  it('says plainly what happens without it', () => {
    expect(rule('mutterm-duvod-kvuli-odstupnemu')?.reviewCheck).toMatch(
      /nejčastější a nejdražší vada/,
    )
  })

  it('carries the multiples and the six-month carry-over', () => {
    const r = rule('mutterm-vyse-odstupneho')
    expect(r?.requirement).toMatch(/jednonásobek/)
    expect(r?.requirement).toMatch(/trojnásobek/)
    expect(r?.requirement).toMatch(/6 měsíců/)
    expect(r?.law).toMatch(/67 odst\. 1 a 2/)
  })

  it('keeps the twelvefold tied to exposure, not to injury', () => {
    const r = rule('mutterm-dvanactinasobek')
    expect(r?.requirement).toMatch(/nejvyšší přípustné expozice/)
    expect(r?.reviewCheck).toMatch(/pracovním úrazu/)
  })

  it('asks the form for the reason and gates severance on it', () => {
    const duvod = schema.sections.find((s) => s.id === 'duvod')
    const reason = duvod?.fields.find((f) => f.id === 'reasonType')
    expect(reason?.required).toBe(true)
    expect(reason?.legalNote).toMatch(/prokazovat sám/)

    const odstupne = schema.sections.find((s) => s.id === 'odstupne')
    const multiple = odstupne?.fields.find((f) => f.id === 'severanceMultiple')
    expect(multiple?.conditional?.value).toEqual([
      'organizacni-a',
      'organizacni-b',
      'organizacni-c',
    ])
  })
})

describe('what an agreement does not carry', () => {
  it('has no notice period', () => {
    const r = rule('mutterm-bez-vypovedni-doby')
    expect(r?.requirement).toMatch(/NEBĚŽÍ výpovědní doba/)
    expect((profile.inapplicable ?? []).map((p) => p.section)).toContain('51')
  })

  it('has no protected period, and tells the reviewer not to demand one', () => {
    expect(rule('mutterm-neni-ochranna-doba')?.reviewCheck).toMatch(/NEHLAS jako vadu/)
    expect((profile.inapplicable ?? []).map((p) => p.section)).toContain('53')
  })

  it('corrects the unemployment-support myth', () => {
    // "Dohodou přijdete o podporu" is everywhere and is no longer in the act.
    const r = rule('mutterm-podpora-nezamestnanost')
    expect(r?.requirement).toMatch(/nesnižuje podporu/)
    expect(r?.requirement).toMatch(/80 %/)
    expect(r?.law).toMatch(/435\/2004/)
    expect(r?.reviewCheck).toMatch(/překonané/)
  })

  it('does not let the drafting prompt reintroduce a notice period', () => {
    expect(schema.metadata.aiInstructions).toMatch(/NIKDY nepiš o výpovědní době/)
  })
})

describe('the formalities employees lose out on', () => {
  it('requires a copy for each side', () => {
    const r = rule('mutterm-dve-vyhotoveni')
    expect(r?.law).toMatch(/49 odst\. 3/)
    expect(r?.requirement).toMatch(/podepíše a kopii nedostane/)
  })

  it('needs both signatures, unlike a notice', () => {
    const r = rule('mutterm-podpisy-obou')
    expect(r?.consequence).toBe('neplatnost')
    expect(schema.metadata.documentKind).toBe('contract')
  })

  it('remembers unused leave and the certificate of employment', () => {
    expect(rule('mutterm-vyporadani')?.law).toMatch(/222/)
    expect(rule('mutterm-potvrzeni')?.law).toMatch(/313/)
  })
})

describe('the audit on a real agreement', () => {
  it('accepts a complete one', () => {
    const complete = `DOHODA O ROZVÁZÁNÍ PRACOVNÍHO POMĚRU
      Pracovní smlouva ze dne 1. 9. 2024, druh práce: účetní.
      Pracovní poměr končí ke dni 31. 10. 2026 z důvodu nadbytečnosti podle § 52 písm. c) ZP.
      Nevyčerpaná dovolená bude proplacena ve výplatním termínu za říjen 2026.
      Dohoda je vyhotovena ve dvou stejnopisech, po jednom pro každou stranu.
      V Praze dne 30. 9. 2026, podpisy obou stran.`
    const missing = auditContract(complete, 'mutual-termination').notFound.map((f) => f.ruleId)
    expect(missing).toEqual([])
  })

  it('notices the blank version employers prefer', () => {
    const blank = `DOHODA O ROZVÁZÁNÍ PRACOVNÍHO POMĚRU
      Pracovní smlouva ze dne 1. 9. 2024, druh práce: účetní.
      Strany se dohodly, že pracovní poměr končí ke dni 31. 10. 2026.
      V Praze dne 30. 9. 2026, podpisy obou stran.`
    const missing = auditContract(blank, 'mutual-termination').notFound.map((f) => f.ruleId)
    expect(missing).toContain('mutterm-duvod-kvuli-odstupnemu')
    expect(missing).toContain('mutterm-dve-vyhotoveni')
  })
})

describe('the drafting prompt', () => {
  it('never asks for a statutory ground the way a notice would', () => {
    const drafting = renderKnowledgeForDrafting('mutual-termination')
    expect(drafting).not.toMatch(/ochrann\S* dob\S*\s+podle § 53/)
  })

  it('bans the stale twelvefold promise and the support myth', () => {
    expect(schema.metadata.aiInstructions).toMatch(/Nikdy u pracovního úrazu/)
    expect(schema.metadata.aiInstructions).toMatch(/sníženou podporu|snížená podpora/)
  })
})
