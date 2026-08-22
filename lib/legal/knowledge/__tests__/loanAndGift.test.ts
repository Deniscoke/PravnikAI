/**
 * Two traps that circulating templates routinely miss, pinned here because the
 * whole value of these types is catching them.
 *
 * A zápůjčka is a real contract — signing it creates nothing, handing the money
 * over does. A template without a handover clause documents a debt that cannot
 * be proved to exist.
 *
 * A gift is not final. The donor may revoke it for hardship or ingratitude, and
 * cannot waive that in advance. Templates that call donation irreversible
 * mislead both sides about what they signed.
 */

import { describe, it, expect } from 'vitest'
import {
  CONTRACT_PROFILES,
  getContractProfile,
  renderKnowledgeForDrafting,
  renderKnowledgeForReview,
  resolveContractFamily,
} from '../index'
import { auditContract } from '@/lib/review/structuralAudit'

describe('type detection', () => {
  it('recognises a zápůjčka, including the colloquial "půjčka"', () => {
    expect(resolveContractFamily('SMLOUVA O ZÁPŮJČCE')).toBe('loan')
    expect(resolveContractFamily('Smlouva o půjčce mezi bratry')).toBe('loan')
  })

  it('recognises a darovací smlouva', () => {
    expect(resolveContractFamily('DAROVACÍ SMLOUVA')).toBe('gift')
  })

  it('recognises them from party names alone', () => {
    expect(resolveContractFamily('Zapůjčitel přenechává vydlužiteli částku')).toBe('loan')
    expect(resolveContractFamily('Dárce bezplatně převádí, obdarovaný přijímá')).toBe('gift')
  })

  it('does not confuse a gift of money with a loan', () => {
    // Both involve handing money to someone; only one expects it back.
    expect(resolveContractFamily('DAROVACÍ SMLOUVA — dárce daruje 50 000 Kč')).toBe('gift')
  })

  it('survives a photo that lost its diacritics', () => {
    expect(resolveContractFamily('SMLOUVA O ZAPUJCCE')).toBe('loan')
    expect(resolveContractFamily('DAROVACI SMLOUVA')).toBe('gift')
  })
})

describe('zápůjčka — the handover is the contract', () => {
  const rule = CONTRACT_PROFILES.loan.rules.find((r) => r.id === 'loan-predani')

  it('treats a missing handover as fatal, not cosmetic', () => {
    // Without it there is no zápůjčka at all — § 2390.
    expect(rule?.kind).toBe('essential')
    expect(rule?.consequence).toBe('nevznikne')
  })

  it('explains why it matters rather than just naming the rule', () => {
    expect(rule?.reviewCheck).toMatch(/nepodaří vymoci|prokázat/)
  })

  it('flags a loan agreement with no evidence of handover', () => {
    const noHandover = `SMLOUVA O ZÁPŮJČCE
      Zapůjčitel poskytuje vydlužiteli částku 100 000 Kč.
      Vydlužitel se zavazuje částku vrátit do 31. 12. 2027.`
    const audit = auditContract(noHandover, 'loan')
    expect(audit.notFound.map((f) => f.ruleId)).toContain('loan-predani')
  })

  it('accepts a loan agreement that documents the transfer', () => {
    const withHandover = `SMLOUVA O ZÁPŮJČCE
      Zapůjčitel poskytuje vydlužiteli částku 100 000 Kč, která byla poukázána
      na účet vydlužitele dne 1. 9. 2026. Vydlužitel se zavazuje ji vrátit.`
    const audit = auditContract(withHandover, 'loan')
    expect(audit.notFound.map((f) => f.ruleId)).not.toContain('loan-predani')
  })
})

describe('zápůjčka — other rules that shipped wrong elsewhere', () => {
  it('says a loan is interest-free unless agreed', () => {
    const rule = CONTRACT_PROFILES.loan.rules.find((r) => r.id === 'loan-uroky')
    expect(rule?.requirement).toMatch(/bezúročná/)
    expect(rule?.law).toMatch(/2392/)
  })

  it('warns against conflating loan interest with default interest', () => {
    const rule = CONTRACT_PROFILES.loan.rules.find((r) => r.id === 'loan-uroky')
    expect(rule?.reviewCheck).toMatch(/úrok z prodlení/)
  })

  it('flags business lending to consumers as regulated activity', () => {
    const rule = CONTRACT_PROFILES.loan.rules.find((r) => r.id === 'loan-spotrebitelsky-uver')
    expect(rule?.law).toMatch(/257\/2016/)
    // Must not fire on an ordinary loan between two private people.
    expect(rule?.appliesWhen).toMatch(/podnikání/)
  })
})

describe('darovací smlouva — a gift is not irreversible', () => {
  it('carries both grounds for revoking a gift', () => {
    const ids = CONTRACT_PROFILES.gift.rules.map((r) => r.id)
    expect(ids).toContain('gift-odvolani-nouze')
    expect(ids).toContain('gift-odvolani-nevdek')
  })

  it('says outright that calling a gift irrevocable misleads both sides', () => {
    const rule = CONTRACT_PROFILES.gift.rules.find((r) => r.id === 'gift-odvolani-nevdek')
    expect(rule?.reviewCheck).toMatch(/neodvolateln/)
  })

  it('tells the drafter not to write that it is irrevocable', () => {
    expect(renderKnowledgeForDrafting('gift')).toMatch(/2072/)
  })
})

describe('darovací smlouva — form and gratuitousness', () => {
  it('requires writing only where the law does', () => {
    const rule = CONTRACT_PROFILES.gift.rules.find((r) => r.id === 'gift-forma')
    expect(rule?.requirement).toMatch(/veřejného seznamu/)
    expect(rule?.requirement).toMatch(/ústně/)
  })

  it('treats a gift with consideration as not a gift at all', () => {
    const rule = CONTRACT_PROFILES.gift.rules.find((r) => r.id === 'gift-bezplatnost')
    expect(rule?.consequence).toBe('nevznikne')
    expect(rule?.requirement).toMatch(/protiplnění/)
  })

  it('flags a gift text that never says it is gratuitous', () => {
    const vague = 'DAROVACÍ SMLOUVA\nDárce převádí obdarovanému vozidlo VIN TMB123.'
    const audit = auditContract(vague, 'gift')
    const missing = audit.notFound.map((f) => f.ruleId)
    expect(missing).toContain('gift-bezplatnost')
    expect(missing).toContain('gift-prijeti')
  })

  it('accepts a properly worded gift', () => {
    const proper = `DAROVACÍ SMLOUVA
      Dárce bezplatně převádí obdarovanému vozidlo VIN TMB123 a obdarovaný
      tento dar přijímá.`
    const audit = auditContract(proper, 'gift')
    const missing = audit.notFound.map((f) => f.ruleId)
    expect(missing).not.toContain('gift-bezplatnost')
    expect(missing).not.toContain('gift-prijeti')
  })

  it('catches a gift dressed up as an inheritance', () => {
    const rule = CONTRACT_PROFILES.gift.rules.find((r) => r.id === 'gift-pro-pripad-smrti')
    expect(rule?.consequence).toBe('neplatnost')
    expect(rule?.reviewCheck).toMatch(/smrtí dárce/)
  })
})

describe('profile integrity', () => {
  for (const family of ['loan', 'gift'] as const) {
    it(`${family} is registered with sources and enough rules to be useful`, () => {
      const profile = getContractProfile(family)
      expect(profile.family).toBe(family)
      expect(profile.rules.length).toBeGreaterThan(8)
      expect(profile.sources.length).toBeGreaterThan(0)
    })

    it(`${family} renders a review checklist`, () => {
      expect(renderKnowledgeForReview(family)).toContain('Kontrolní seznam')
    })
  }
})
