/**
 * Two ways out of a contract that are constantly confused with each other and
 * with the employment rules that govern neither.
 *
 * Withdrawal cancels the obligation from the beginning and needs a ground.
 * Notice ends things going forward and, for a dohoda, needs none. A document
 * that mixes them produces effects nobody intended: a "withdrawal" with a
 * notice period cancels nothing, and a dohoda terminated on § 52 grounds cites
 * a provision that does not reach it.
 */

import { describe, it, expect } from 'vitest'
import { CONTRACT_PROFILES, renderKnowledgeForDrafting, resolveContractFamily } from '../index'
import { auditContract } from '@/lib/review/structuralAudit'
import { getSchema } from '@/lib/contracts/contractSchemas'

describe('zrušení dohody — what it must not borrow', () => {
  const profile = CONTRACT_PROFILES['agreement-termination']

  it('is recognised ahead of the dohoda it terminates', () => {
    expect(resolveContractFamily('VÝPOVĚĎ DOHODY o provedení práce ze dne 1. 9. 2026')).toBe(
      'agreement-termination',
    )
  })

  it('still leaves an actual dohoda to its own profile', () => {
    expect(resolveContractFamily('DOHODA O PROVEDENÍ PRÁCE\nOdměna 450 Kč za hodinu')).toBe(
      'employment-agreement',
    )
  })

  it('runs fifteen days from delivery, not two months', () => {
    const rule = profile.rules.find((r) => r.id === 'atermination-15-dni')
    expect(rule?.requirement).toMatch(/patnáct/)
    expect(rule?.reviewCheck).toMatch(/dvouměsíční/)
  })

  it('tells the reviewer not to demand employment machinery', () => {
    const rule = profile.rules.find((r) => r.id === 'atermination-bez-duvodu')
    expect(rule?.reviewCheck).toMatch(/NEHLAS jako chybějící/)
    expect(rule?.reviewCheck).toMatch(/§ 52/)
    expect(rule?.reviewCheck).toMatch(/§ 67/)
  })

  it('keeps the DPP drafting requirements out of a termination', () => {
    // A document ending a dohoda has no business asking for a 300-hour cap.
    const requirements = renderKnowledgeForDrafting('agreement-termination')
    expect(requirements).not.toMatch(/300 hodin/)
  })

  it('warns the drafter off § 52, § 53 and § 67', () => {
    const schema = getSchema('zruseni-dohody-v1')
    expect(schema.metadata.aiInstructions).toMatch(/§ 52/)
    expect(schema.metadata.aiInstructions).toMatch(/§ 53/)
    expect(schema.metadata.aiInstructions).toMatch(/§ 67/)
    expect(schema.metadata.documentKind).toBe('unilateral')
  })

  it('asks first what the dohoda itself says', () => {
    // § 77 odst. 4 is a default; the agreement may have set its own regime.
    const rule = profile.rules.find((r) => r.id === 'atermination-prednost-dohody')
    expect(rule?.kind).toBe('essential')
    expect(rule?.requirement).toMatch(/nesjednaly-li/)
  })
})

describe('odstoupení — not a notice, and never groundless', () => {
  const profile = CONTRACT_PROFILES.withdrawal

  it('is recognised ahead of the contract it cancels', () => {
    // Otherwise a withdrawal from a purchase would be checked as a purchase.
    expect(resolveContractFamily('ODSTOUPENÍ OD SMLOUVY — kupní smlouva ze dne 1. 6. 2026')).toBe(
      'withdrawal',
    )
  })

  it('treats a missing ground as fatal', () => {
    const rule = profile.rules.find((r) => r.id === 'withdrawal-duvod')
    expect(rule?.kind).toBe('essential')
    expect(rule?.consequence).toBe('nevznikne')
    expect(rule?.law).toMatch(/2001/)
  })

  it('says outright that the obligation is cancelled from the beginning', () => {
    const rule = profile.rules.find((r) => r.id === 'withdrawal-od-pocatku')
    expect(rule?.requirement).toMatch(/OD POČÁTKU/)
    expect(rule?.reviewCheck).toMatch(/zaměňuje odstoupení a výpověď/)
  })

  it('refuses a withdrawal that behaves like a notice', () => {
    const rule = profile.rules.find((r) => r.id === 'withdrawal-neni-vypoved')
    expect(rule?.kind).toBe('prohibited')
    expect(rule?.reviewCheck).toMatch(/výpovědní dobou/)
  })

  it('requires a prior demand for a non-substantial breach', () => {
    const rule = profile.rules.find((r) => r.id === 'withdrawal-nepodstatne-poruseni')
    expect(rule?.consequence).toBe('neplatnost')
    expect(rule?.reviewCheck).toMatch(/nejčastější důvod/)
  })

  it('keeps the consumer fourteen-day right separate and reason-free', () => {
    const rule = profile.rules.find((r) => r.id === 'withdrawal-spotrebitel-14-dni')
    expect(rule?.requirement).toMatch(/BEZ UDÁNÍ DŮVODU/)
    expect(rule?.law).toMatch(/1829/)
    expect(rule?.appliesWhen).toMatch(/distančně/)
  })

  it('says what survives the withdrawal', () => {
    const rule = profile.rules.find((r) => r.id === 'withdrawal-co-prezije')
    expect(rule?.requirement).toMatch(/smluvní pokuty/)
    expect(rule?.law).toMatch(/2005/)
  })

  it('tells the drafter both of the things that go wrong', () => {
    const schema = getSchema('odstoupeni-od-smlouvy-v1')
    expect(schema.metadata.aiInstructions).toMatch(/OD POČÁTKU/)
    expect(schema.metadata.aiInstructions).toMatch(/§ 2003/)
    expect(schema.metadata.documentKind).toBe('unilateral')
  })
})

describe('the audit on real documents', () => {
  it('flags a withdrawal that gives no ground and identifies no contract', () => {
    const bare = 'ODSTOUPENÍ OD SMLOUVY\nTímto od smlouvy odstupuji.'
    const missing = auditContract(bare, 'withdrawal').notFound.map((f) => f.ruleId)
    expect(missing).toContain('withdrawal-oznaceni-smlouvy')
  })

  it('accepts a complete withdrawal', () => {
    const complete = `ODSTOUPENÍ OD SMLOUVY
      Odstupuji od smlouvy o dílo ze dne 1. 6. 2026 z důvodu podstatného porušení —
      dílo nebylo dokončeno ani do 15. 8. 2026.
      Žádám o vrácení uhrazené zálohy na účet.
      Odstoupení se doručuje doporučeně s dodejkou.`
    const missing = auditContract(complete, 'withdrawal').notFound.map((f) => f.ruleId)
    expect(missing).not.toContain('withdrawal-duvod')
    expect(missing).not.toContain('withdrawal-oznaceni-smlouvy')
    expect(missing).not.toContain('withdrawal-vraceni-plneni')
  })

  it('accepts a complete dohoda termination', () => {
    const complete = `VÝPOVĚĎ DOHODY
      Vypovídám dohodu o provedení práce ze dne 1. 9. 2026.
      Výpovědní doba činí patnáct dnů a běží ode dne doručení.
      Výpověď se doručuje osobně proti podpisu.`
    const missing = auditContract(complete, 'agreement-termination').notFound.map((f) => f.ruleId)
    expect(missing).toEqual([])
  })
})
