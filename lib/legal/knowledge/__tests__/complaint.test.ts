/**
 * Reklamace is the type where the model's training data is most reliably wrong.
 * The spotřebitelská novela (374/2022 Sb.) changed the exact numbers that the
 * pre-2023 Czech internet repeats thousands of times, so these tests pin the
 * post-novela values in place — both in the knowledge base and in the guard
 * that reads the generated text back.
 *
 * Every value here was checked against the statute text on 2026-08-23.
 */

import { describe, it, expect } from 'vitest'
import { CONTRACT_PROFILES, resolveContractFamily, renderKnowledgeForDrafting } from '../index'
import { findStaleLaw } from '@/lib/legal/staleLawGuard'
import { auditContract } from '@/lib/review/structuralAudit'
import { getSchema } from '@/lib/contracts/contractSchemas'

const profile = CONTRACT_PROFILES.complaint
const rule = (id: string) => profile.rules.find((r) => r.id === id)

describe('detection does not swallow purchase contracts', () => {
  it('recognises an actual complaint', () => {
    expect(resolveContractFamily('REKLAMACE\nTímto reklamuji zboží zakoupené dne 3. 3. 2026.')).toBe(
      'complaint',
    )
  })

  it('leaves a purchase contract with a "Reklamace" article alone', () => {
    // The bare noun is a section heading in half the kupní smlouvy in the
    // country; only the first-person verb belongs to the letter.
    const contract = `KUPNÍ SMLOUVA
      Prodávající se zavazuje odevzdat kupujícímu předmět koupě.
      Kupní cena činí 45 000 Kč.
      Článek VI — Reklamace
      Kupující reklamuje vady bez zbytečného odkladu.`
    expect(resolveContractFamily(contract)).toBe('sale')
  })

  it('wins over the contract it names', () => {
    const letter = 'Reklamuji zboží z kupní smlouvy ze dne 1. 6. 2026 — prodávající vadu neodstranil.'
    expect(resolveContractFamily(letter)).toBe('complaint')
  })

  it('wins over a bare withdrawal, because § 2171 is the special rule', () => {
    const letter =
      'Reklamuji vadu a současně odstupuji od smlouvy, neboť se vada projevila opakovaně.'
    expect(resolveContractFamily(letter)).toBe('complaint')
  })
})

describe('the numbers the novela changed', () => {
  it('says two years is when the defect must appear, not a warranty', () => {
    const r = rule('complaint-dvouleta-doba')
    expect(r?.requirement).toMatch(/PROJEVÍ/)
    expect(r?.law).toMatch(/2165/)
    expect(r?.reviewCheck).toMatch(/374\/2022/)
  })

  it('puts the presumption at one year, not six months', () => {
    const r = rule('complaint-domnenka-rok')
    expect(r?.requirement).toMatch(/JEDNOHO ROKU/)
    expect(r?.law).toMatch(/2161 odst\. 5/)
    expect(r?.reviewCheck).toMatch(/šestiměsíční/)
  })

  it('requires the consumer to be informed, not merely the complaint settled', () => {
    const r = rule('complaint-30-dnu')
    expect(r?.requirement).toMatch(/INFORMOVÁN/)
    expect(r?.law).toMatch(/634\/1992/)
    expect(r?.reviewCheck).toMatch(/tří pracovních dnů/)
  })

  it('gives the lapse its own right rather than routing it through § 2002', () => {
    const r = rule('complaint-marne-uplynuti')
    expect(r?.law).toMatch(/§ 19 odst\. 4/)
    expect(r?.reviewCheck).toMatch(/podstatným porušením/)
  })
})

describe('the order of remedies', () => {
  it('treats the chosen remedy as essential', () => {
    expect(rule('complaint-zvoleny-narok')?.kind).toBe('essential')
    expect(rule('complaint-zvoleny-narok')?.law).toMatch(/2169/)
  })

  it('spells out that money is not the opening move', () => {
    const r = rule('complaint-poradi-naroku')
    expect(r?.requirement).toMatch(/OPRAVOU a DODÁNÍM NOVÉ VĚCI/)
    expect(r?.law).toMatch(/2171/)
    expect(r?.reviewCheck).toMatch(/vrácení peněz/)
  })

  it('keeps the burden on the seller for an insignificant defect', () => {
    const r = rule('complaint-nevyznamna-vada')
    expect(r?.requirement).toMatch(/má se za to, že vada\s+nevýznamná není|vada\s*\n?\s*nevýznamná není/)
    expect(r?.law).toMatch(/2171 odst\. 3/)
  })

  it('does not let the buyer be charged for shipping the defective item', () => {
    expect(rule('complaint-prevzeti-na-naklady')?.requirement).toMatch(/NA VLASTNÍ NÁKLADY/)
  })

  it('disregards terms limiting the rights in advance', () => {
    const r = rule('complaint-predem-omezena-prava')
    expect(r?.kind).toBe('prohibited')
    expect(r?.consequence).toBe('neprihlizi-se')
    expect(r?.law).toMatch(/2174/)
  })
})

describe('what must not be cited', () => {
  it('marks the statutory-warranty provision inapplicable', () => {
    const sections = (profile.inapplicable ?? []).map((p) => p.section)
    expect(sections).toContain('2113')
  })

  it('keeps the consumer fourteen-day right out of a complaint', () => {
    const sections = (profile.inapplicable ?? []).map((p) => p.section)
    expect(sections).toContain('1829')
  })

  it('tells the drafter outright that two years is not a záruční doba', () => {
    // The phrase does appear — as a denial, which is the point.
    expect(renderKnowledgeForDrafting('complaint')).toMatch(/Není to záruční doba/)
  })
})

describe('the stale-law guard catches what the prompt only asks for', () => {
  it('flags the three-working-day rule', () => {
    const found = findStaleLaw(
      'Prodávající je povinen o reklamaci rozhodnout do tří pracovních dnů.',
    ).map((f) => f.id)
    expect(found).toContain('stale-complaint-three-working-days')
  })

  it('flags the lapse described as a material breach', () => {
    const found = findStaleLaw(
      'Nebude-li reklamace vyřízena do 30 dnů, jde o podstatné porušení smlouvy.',
    ).map((f) => f.id)
    expect(found).toContain('stale-complaint-lapse-as-material-breach')
  })

  it('flags the six-month presumption', () => {
    const found = findStaleLaw(
      'U reklamace platí domněnka, že vada existovala při převzetí, po dobu šesti měsíců.',
    ).map((f) => f.id)
    expect(found).toContain('stale-defect-presumption-six-months')
  })

  it('leaves the correct wording alone', () => {
    const correct = `Reklamaci je nutné vyřídit a kupujícího o tom informovat do 30 dnů
      ode dne uplatnění. Projeví-li se vada do jednoho roku od převzetí, má se za to,
      že věc byla vadná už při převzetí. Po marném uplynutí lhůty může kupující
      od smlouvy odstoupit nebo požadovat přiměřenou slevu.`
    expect(findStaleLaw(correct)).toEqual([])
  })

  it('does not fire on six months where it has nothing to do with defects', () => {
    expect(findStaleLaw('Nájem se sjednává na dobu šesti měsíců.')).toEqual([])
  })
})

describe('the audit on a real complaint', () => {
  it('accepts a complete one', () => {
    const complete = `REKLAMACE
      Reklamuji myčku nádobí zakoupenou dne 3. 3. 2026, objednávka č. 2026/114.
      Vada se projevila 12. 8. 2026 — přístroj se po deseti minutách samovolně vypne.
      Požaduji odstranění vady opravou věci.
      Uplatňuji rovněž náhradu nákladů na poštovné.
      Reklamaci vyřiďte do 30 dnů ode dne jejího uplatnění.
      Reklamace se zasílá doporučeně na adresu provozovny.
      Kontakt pro vyrozumění: jan.novak@example.cz`
    const missing = auditContract(complete, 'complaint').notFound.map((f) => f.ruleId)
    expect(missing).toEqual([])
  })

  it('notices a complaint that describes nothing', () => {
    const bare = 'REKLAMACE\nReklamuji, protože jsem nespokojen.'
    const missing = auditContract(bare, 'complaint').notFound.map((f) => f.ruleId)
    expect(missing).toContain('complaint-zvoleny-narok')
  })
})

describe('the schema warns the drafter off the stale numbers', () => {
  const schema = getSchema('reklamace-v1')

  it('bans the statutory-warranty phrasing outright', () => {
    expect(schema.metadata.aiInstructions).toMatch(/NIKDY nepiš o „zákonné záruce 24 měsíců"/)
  })

  it('bans the three-working-day deadline', () => {
    expect(schema.metadata.aiInstructions).toMatch(/tří pracovních dnů — ta v zákoně není/)
  })

  it('bans the material-breach framing', () => {
    expect(schema.metadata.aiInstructions).toMatch(/NEOZNAČUJ za podstatné porušení/)
  })

  it('is one-sided and signed only by the buyer', () => {
    expect(schema.metadata.documentKind).toBe('unilateral')
    expect(schema.metadata.aiInstructions).toMatch(/POUZE u kupujícího/)
  })

  it('asks for the § 2171 ground whenever money is demanded', () => {
    const narok = schema.sections.find((s) => s.id === 'narok')
    const ground = narok?.fields.find((f) => f.id === 'groundFor2171')
    expect(ground?.conditional?.value).toEqual(['sleva', 'odstoupeni'])
  })
})
