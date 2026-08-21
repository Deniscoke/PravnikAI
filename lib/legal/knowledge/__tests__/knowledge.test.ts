/**
 * These tests do not check that the law is stated correctly — no test can do
 * that, only a lawyer can. They check the things that silently rot: a rule that
 * loses its citation, an id that collides so two findings look like one, a
 * consequence that drifts to something milder than the institute allows, and a
 * profile nobody has re-read in over a year.
 *
 * The last one is meant to fail eventually. That is its job.
 */

import { describe, it, expect } from 'vitest'
import {
  ALL_PROFILES,
  COMMON_PROFILE,
  CONTRACT_PROFILES,
  getContractProfile,
  renderKnowledgeForDrafting,
  renderKnowledgeForReview,
  resolveContractFamily,
} from '../index'
import type { LegalRule } from '../types'

const STALE_AFTER_DAYS = 365

function daysSince(iso: string): number {
  return (Date.now() - new Date(iso).getTime()) / (1000 * 60 * 60 * 24)
}

const ALL_RULES: LegalRule[] = [
  ...COMMON_PROFILE.rules,
  ...ALL_PROFILES.flatMap((p) => p.rules),
]

describe('rule bookkeeping', () => {
  it('every rule cites a provision and states a requirement', () => {
    for (const rule of ALL_RULES) {
      expect(rule.requirement.trim(), `${rule.id} has no requirement`).not.toBe('')
      expect(rule.law.trim(), `${rule.id} cites no provision`).not.toBe('')
    }
  })

  it('rule ids are unique across the whole knowledge base', () => {
    const seen = new Set<string>()
    const duplicates: string[] = []

    for (const rule of ALL_RULES) {
      if (seen.has(rule.id)) duplicates.push(rule.id)
      seen.add(rule.id)
    }

    expect(duplicates, `Duplicate rule ids: ${duplicates.join(', ')}`).toEqual([])
  })

  it('covers every contract family the app can generate', () => {
    const families = ['sale', 'tenancy', 'employment', 'services', 'nda'] as const
    for (const family of families) {
      const profile = getContractProfile(family)
      expect(profile, `no profile for ${family}`).toBeDefined()
      expect(profile.family).toBe(family)
      expect(profile.rules.length, `${family} has too few rules to be useful`).toBeGreaterThan(5)
    }
  })

  it('flags any profile that has not been re-checked within a year', () => {
    const stale = [
      { key: 'COMMON', lastVerified: COMMON_PROFILE.lastVerified },
      ...ALL_PROFILES.map((p) => ({ key: p.family, lastVerified: p.lastVerified })),
    ]
      .filter((entry) => daysSince(entry.lastVerified) > STALE_AFTER_DAYS)
      .map((entry) => `${entry.key} (naposledy ověřeno ${entry.lastVerified})`)

    expect(
      stale,
      `Tyto právní profily je třeba znovu ověřit — viz docs/PRAVNI_ZDROJE.md:\n${stale.join('\n')}`,
    ).toEqual([])
  })

  it('every profile names the sources it was verified against', () => {
    for (const profile of ALL_PROFILES) {
      expect(profile.sources.length, `${profile.family} lists no sources`).toBeGreaterThan(0)
    }
  })
})

describe('consequence discipline', () => {
  it('an essential element can never be merely recommended', () => {
    // Without a podstatná náležitost the contract does not come into existence.
    // Labelling one 'doporuceni' would tell a user something legally false.
    const wrong = ALL_RULES.filter(
      (r) => r.kind === 'essential' && !['nevznikne', 'neprihlizi-se'].includes(r.consequence),
    )
    expect(wrong.map((r) => r.id)).toEqual([])
  })

  it('a prohibited clause always carries a real sanction', () => {
    const wrong = ALL_RULES.filter(
      (r) =>
        r.kind === 'prohibited' &&
        !['neplatnost', 'neprihlizi-se'].includes(r.consequence),
    )
    expect(wrong.map((r) => r.id)).toEqual([])
  })

  it('states outright that non-payment does not make a contract invalid', () => {
    // The single error the model produced most often before this existed.
    const rule = COMMON_PROFILE.rules.find((r) => r.id === 'common-neplaceni-neni-neplatnost')
    expect(rule).toBeDefined()
    expect(rule?.requirement).toMatch(/odstoupit/)
  })

  it('never hardcodes the statutory default interest rate', () => {
    // It follows the ČNB repo rate and moves every six months, so any fixed
    // percentage in the knowledge base would be wrong within months.
    const rule = COMMON_PROFILE.rules.find((r) => r.id === 'common-urok-z-prodleni')
    expect(rule?.requirement).toMatch(/repo/)
    expect(rule?.requirement).not.toMatch(/\d+(,\d+)?\s*%/)
  })
})

describe('rules that shipped wrong before', () => {
  it('treats a contractual penalty against a residential tenant as disregarded', () => {
    const rule = CONTRACT_PROFILES.tenancy.rules.find((r) => r.id === 'tenancy-smluvni-pokuta')
    expect(rule?.consequence).toBe('neprihlizi-se')
    expect(rule?.law).toMatch(/2239/)
  })

  it('states the post-flexinovela probation limit, not the pre-2025 one', () => {
    const rule = CONTRACT_PROFILES.employment.rules.find((r) => r.id === 'employment-zkusebni-doba')
    expect(rule?.requirement).toMatch(/4 měsíce/)
    expect(rule?.requirement).toMatch(/8 měsíců/)
  })

  it('states that the notice period runs from delivery', () => {
    const rule = CONTRACT_PROFILES.employment.rules.find((r) => r.id === 'employment-vypovedni-doba')
    expect(rule?.requirement).toMatch(/doručení/)
  })

  it('does not treat a missing price in a smlouva o dílo as fatal', () => {
    // The amount is not an essential element — only the fact of payment is.
    const rule = CONTRACT_PROFILES.services.rules.find((r) => r.id === 'services-uplatnost')
    expect(rule?.requirement).toMatch(/obvyklá/)
  })
})

describe('resolveContractFamily', () => {
  it('recognises each type from its characteristic vocabulary', () => {
    expect(resolveContractFamily('Nájemní smlouva k bytu')).toBe('tenancy')
    expect(resolveContractFamily('Pracovní smlouva')).toBe('employment')
    expect(resolveContractFamily('Smlouva o dílo')).toBe('services')
    expect(resolveContractFamily('Dohoda o mlčenlivosti')).toBe('nda')
    expect(resolveContractFamily('Kupní smlouva na automobil')).toBe('sale')
  })

  it('is case-insensitive', () => {
    expect(resolveContractFamily('KUPNÍ SMLOUVA')).toBe('sale')
  })

  it('returns null rather than guessing when nothing matches', () => {
    expect(resolveContractFamily('')).toBeNull()
    expect(resolveContractFamily('Zápis z jednání představenstva')).toBeNull()
  })

  it('returns null when two types are equally indicated', () => {
    // Applying an employment checklist to a lease produces confident nonsense,
    // so an ambiguous document gets the common rules only.
    expect(resolveContractFamily('pracovní smlouva a nájemní smlouva')).toBeNull()
  })
})

describe('rendering', () => {
  it('keeps review checks out of the drafting prompt', () => {
    const drafting = renderKnowledgeForDrafting('tenancy')
    expect(drafting).toContain('Právní požadavky')
    expect(drafting).not.toContain('Na co se dívat')
  })

  it('gives the reviewer only rules that are checkable in a finished text', () => {
    const review = renderKnowledgeForReview('tenancy')
    expect(review).toContain('Na co se dívat')

    const uncheckable = CONTRACT_PROFILES.tenancy.rules.filter((r) => !r.reviewCheck)
    for (const rule of uncheckable) {
      expect(review, `${rule.id} has no reviewCheck and should not be rendered`).not.toContain(
        rule.requirement,
      )
    }
  })

  it('falls back to common rules alone when the type is unknown', () => {
    const review = renderKnowledgeForReview(null)
    expect(review).toContain('obecná pravidla')
    expect(review).not.toContain('Nájemní smlouva')
  })

  it('renders the consequence label next to every rule', () => {
    const review = renderKnowledgeForReview('employment')
    expect(review).toContain('Následek:')
  })
})
