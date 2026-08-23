/**
 * The two sides of an employment notice are not symmetric, and the 2025
 * flexinovela moved two numbers that every older template still has wrong.
 *
 * An employee may leave without giving a reason. An employer may not: the
 * ground must come from § 52, be described factually rather than by reference,
 * and cannot be swapped later if it fails to hold. A generator that treats the
 * two the same produces a notice that will not survive being challenged.
 */

import { describe, it, expect } from 'vitest'
import {
  CONTRACT_PROFILES,
  getContractProfile,
  renderKnowledgeForDrafting,
  resolveContractFamily,
} from '../index'
import { findStaleLaw, hasStaleLaw } from '@/lib/legal/staleLawGuard'
import { auditContract } from '@/lib/review/structuralAudit'
import { getSchema } from '@/lib/contracts/contractSchemas'

const EMPLOYER_NOTICE = `VÝPOVĚĎ Z PRACOVNÍHO POMĚRU
Zaměstnavatel dává zaměstnanci výpověď z pracovního poměru založeného pracovní
smlouvou ze dne 1. 3. 2024.
Důvod: nadbytečnost podle § 52 písm. c) — rozhodnutím jednatele byla zrušena pozice.
Výpovědní doba činí dva měsíce a běží ode dne doručení této výpovědi.
Výpověď se doručuje osobně proti podpisu.`

describe('type detection', () => {
  it('recognises a notice rather than the contract it quotes', () => {
    expect(resolveContractFamily(EMPLOYER_NOTICE)).toBe('employment-notice')
  })

  it('still recognises an actual pracovní smlouva', () => {
    expect(resolveContractFamily('PRACOVNÍ SMLOUVA\nDruh práce: účetní')).toBe('employment')
  })

  it('does not swallow a dohoda, which has its own termination regime', () => {
    expect(resolveContractFamily('DOHODA O PROVEDENÍ PRÁCE')).toBe('employment-agreement')
  })

  it('survives a photo that lost its diacritics', () => {
    expect(resolveContractFamily('VYPOVED Z PRACOVNIHO POMERU')).toBe('employment-notice')
  })
})

describe('what only an employer owes', () => {
  const profile = CONTRACT_PROFILES['employment-notice']

  it('requires a ground, and only from the employer', () => {
    const rule = profile.rules.find((r) => r.id === 'enotice-duvod-zamestnavatel')
    expect(rule?.kind).toBe('essential')
    expect(rule?.consequence).toBe('neplatnost')
    expect(rule?.appliesWhen).toMatch(/zaměstnavatel/i)
  })

  it('insists the ground be described, not merely cited', () => {
    const rule = profile.rules.find((r) => r.id === 'enotice-duvod-zamestnavatel')
    expect(rule?.requirement).toMatch(/skutkově/)
    expect(rule?.reviewCheck).toMatch(/odkazem na paragraf/)
  })

  it('tells the reviewer not to demand a ground from an employee', () => {
    const rule = profile.rules.find((r) => r.id === 'enotice-zamestnanec-bez-duvodu')
    expect(rule?.reviewCheck).toMatch(/NEHLAS jako chybějící/)
  })

  it('refuses a ground swapped after the fact', () => {
    const rule = profile.rules.find((r) => r.id === 'enotice-duvod-nelze-menit')
    expect(rule?.consequence).toBe('neplatnost')
    expect(rule?.law).toMatch(/50 odst. 4/)
  })

  it('carries the protected periods', () => {
    const rule = profile.rules.find((r) => r.id === 'enotice-ochranna-doba')
    expect(rule?.law).toMatch(/§ 53/)
    expect(rule?.requirement).toMatch(/neschopnosti|těhotenství/)
  })
})

describe('the two numbers the flexinovela moved', () => {
  it('says the notice period runs from delivery', () => {
    const rule = CONTRACT_PROFILES['employment-notice'].rules.find(
      (r) => r.id === 'enotice-doba-bezi-od-doruceni',
    )
    expect(rule?.requirement).toMatch(/ode dne doručení/)
    expect(rule?.reviewCheck).toMatch(/31\. 5\. 2025/)
  })

  it('limits twelvefold severance to maximum permissible exposure', () => {
    const rule = CONTRACT_PROFILES['employment-notice'].rules.find(
      (r) => r.id === 'enotice-odstupne-expozice',
    )
    expect(rule?.requirement).toMatch(/nejvyšší přípustné expozice/)
    expect(rule?.law).toMatch(/67 odst. 3/)
  })

  it('catches a template still promising twelvefold severance for a work injury', () => {
    const stale = findStaleLaw(
      'Zaměstnanci náleží odstupné ve výši dvanáctinásobku průměrného výdělku, ' +
        'skončil-li pracovní poměr pro pracovní úraz.',
    )
    expect(stale.map((f) => f.id)).toContain('stale-severance-twelve-injury')
    expect(stale[0].correction).toMatch(/expozice/)
  })

  it('leaves lawful organisational severance alone', () => {
    // 1x, 2x and 3x under § 67 odst. 1 were untouched.
    expect(
      hasStaleLaw(
        'Zaměstnanci náleží odstupné ve výši trojnásobku průměrného výdělku ' +
          'z důvodu nadbytečnosti.',
      ),
    ).toBe(false)
  })

  it('does not fire on exposure-based severance, which is still twelvefold', () => {
    expect(
      hasStaleLaw(
        'Odstupné ve výši dvanáctinásobku náleží při dosažení nejvyšší přípustné expozice.',
      ),
    ).toBe(false)
  })
})

describe('the audit on a real notice', () => {
  it('accepts a complete employer notice', () => {
    const audit = auditContract(EMPLOYER_NOTICE, 'employment-notice')
    const missing = audit.notFound.map((f) => f.ruleId)
    expect(missing).not.toContain('enotice-duvod-zamestnavatel')
    expect(missing).not.toContain('enotice-forma')
    expect(missing).not.toContain('enotice-delka-doby')
  })

  it('flags a notice with no ground and no delivery', () => {
    const bare = 'VÝPOVĚĎ Z PRACOVNÍHO POMĚRU\nDávám vám výpověď.'
    const missing = auditContract(bare, 'employment-notice').notFound.map((f) => f.ruleId)
    expect(missing).toContain('enotice-duvod-zamestnavatel')
    expect(missing).toContain('enotice-forma')
  })
})

describe('the schema', () => {
  const schema = getSchema('vypoved-z-pracovniho-pomeru-v1')

  it('is a one-sided document', () => {
    expect(schema.metadata.documentKind).toBe('unilateral')
  })

  it('offers all eight statutory grounds', () => {
    const grounds = schema.sections
      .find((s) => s.id === 'duvod')
      ?.fields.find((f) => f.id === 'employerGround')
    expect(grounds?.options).toHaveLength(8)
  })

  it('shows the grounds only to an employer', () => {
    const grounds = schema.sections
      .find((s) => s.id === 'duvod')
      ?.fields.find((f) => f.id === 'employerGround')
    expect(grounds?.conditional).toEqual({ fieldId: 'noticeGiver', value: 'zamestnavatel' })
  })

  it('warns the drafter against both superseded rules', () => {
    expect(schema.metadata.aiInstructions).toMatch(/31\. 5\. 2025/)
    expect(schema.metadata.aiInstructions).toMatch(/dvanáctinásobné odstupné/)
  })

  it('demands the ground be described factually', () => {
    expect(schema.metadata.aiInstructions).toMatch(/SKUTKOVĚ/)
  })

  it('does not send pracovní smlouva requirements to a notice', () => {
    // A notice has no business asking for a probation period or a wage clause.
    const requirements = renderKnowledgeForDrafting('employment-notice')
    expect(requirements).not.toMatch(/zkušební doba/i)
  })

  it('has a profile with enough rules to be useful', () => {
    expect(getContractProfile('employment-notice').rules.length).toBeGreaterThan(8)
  })
})
