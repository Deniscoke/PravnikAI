/**
 * The instruction under § 2286 odst. 2 is the reason this profile exists.
 *
 * A landlord's notice that omits the sentence telling the tenant they may
 * object and ask a court to review it is void — however well-founded the
 * ground. People lose possession cases on that one omission, and it is exactly
 * the kind of thing a downloaded template leaves out.
 */

import { describe, it, expect } from 'vitest'
import {
  CONTRACT_PROFILES,
  getContractProfile,
  renderKnowledgeForDrafting,
  resolveContractFamily,
} from '../index'
import { auditContract } from '@/lib/review/structuralAudit'
import { getSchema } from '@/lib/contracts/contractSchemas'
import { buildPrompt } from '@/lib/contracts/promptBuilder'

const LANDLORD_NOTICE_MISSING_INSTRUCTION = `VÝPOVĚĎ Z NÁJMU BYTU
Pronajímatel vypovídá nájemní smlouvu ze dne 1. 3. 2025 k bytu č. 4.
Důvod: hrubé porušení povinností nájemce.
Výpovědní doba činí tři měsíce.`

const LANDLORD_NOTICE_COMPLETE = `${LANDLORD_NOTICE_MISSING_INSTRUCTION}
Nájemce má právo vznést proti této výpovědi námitky a navrhnout přezkoumání
její oprávněnosti soudem. Výpověď se doručuje doporučeně s dodejkou.`

describe('type detection', () => {
  it('recognises a notice rather than the lease it quotes', () => {
    // The notice names the lease it terminates, so scoring on lease vocabulary
    // would check it against the rules for the lease itself.
    expect(resolveContractFamily(LANDLORD_NOTICE_MISSING_INSTRUCTION)).toBe('tenancy-notice')
  })

  it('still recognises an actual lease', () => {
    expect(resolveContractFamily('NÁJEMNÍ SMLOUVA na byt č. 4')).toBe('tenancy')
  })

  it('survives a photo that lost its diacritics', () => {
    expect(resolveContractFamily('VYPOVED Z NAJMU BYTU')).toBe('tenancy-notice')
  })
})

describe('the instruction that voids a notice when missing', () => {
  const rule = CONTRACT_PROFILES['tenancy-notice'].rules.find(
    (r) => r.id === 'notice-poucen-namitky',
  )

  it('is essential and makes the notice invalid, not merely risky', () => {
    expect(rule?.kind).toBe('essential')
    expect(rule?.consequence).toBe('neplatnost')
    expect(rule?.law).toMatch(/2286/)
  })

  it('applies only to a landlord', () => {
    expect(rule?.appliesWhen).toMatch(/pronajímatel/i)
  })

  it('is flagged when a landlord notice omits it', () => {
    const audit = auditContract(LANDLORD_NOTICE_MISSING_INSTRUCTION, 'tenancy-notice')
    expect(audit.notFound.map((f) => f.ruleId)).toContain('notice-poucen-namitky')
  })

  it('is not flagged when the notice carries it', () => {
    const audit = auditContract(LANDLORD_NOTICE_COMPLETE, 'tenancy-notice')
    expect(audit.notFound.map((f) => f.ruleId)).not.toContain('notice-poucen-namitky')
  })
})

describe('what a tenant does not owe', () => {
  it('says the ground and the instruction bind only the landlord', () => {
    const rule = CONTRACT_PROFILES['tenancy-notice'].rules.find(
      (r) => r.id === 'notice-najemce-neurcita',
    )
    expect(rule?.reviewCheck).toMatch(/NEHLAS jako chybějící/)
  })
})

describe('the notice period rule the flexinovela did not touch', () => {
  it('keeps the lease rule and warns against importing the employment one', () => {
    const rule = CONTRACT_PROFILES['tenancy-notice'].rules.find(
      (r) => r.id === 'notice-vypovedni-doba-start',
    )
    expect(rule?.requirement).toMatch(/prvního dne kalendářního měsíce následujícího/)
    expect(rule?.reviewCheck).toMatch(/pracovního poměru/)
  })
})

describe('the schema drafts a one-sided document', () => {
  const schema = getSchema('vypoved-z-najmu-bytu-v1')

  it('is marked unilateral', () => {
    expect(schema.metadata.documentKind).toBe('unilateral')
  })

  it('overrides the contract-shaped drafting instructions', () => {
    const { systemPrompt } = buildPrompt({
      schema,
      data: { schemaId: schema.metadata.schemaId, parties: [], sections: {} },
      mode: 'draft',
      missingFields: [],
    })
    expect(systemPrompt).toMatch(/TENTO DOKUMENT NENÍ SMLOUVA/)
    expect(systemPrompt).toMatch(/Adresát dokument nepodepisuje/)
  })

  it('leaves ordinary contract instructions untouched', () => {
    const { systemPrompt } = buildPrompt({
      schema: getSchema('kupni-smlouva-v1'),
      data: { schemaId: schema.metadata.schemaId, parties: [], sections: {} },
      mode: 'draft',
      missingFields: [],
    })
    expect(systemPrompt).not.toMatch(/TENTO DOKUMENT NENÍ SMLOUVA/)
  })

  it('tells the drafter the instruction is the most important sentence', () => {
    expect(schema.metadata.aiInstructions).toMatch(/NEPLATNÁ/)
    expect(schema.metadata.aiInstructions).toMatch(/2286/)
  })

  it('warns against importing the employment notice-period rule', () => {
    expect(schema.metadata.aiInstructions).toMatch(/pracovního poměru, nikoli nájmu/)
  })
})

describe('profile integrity', () => {
  it('is registered and reachable', () => {
    const profile = getContractProfile('tenancy-notice')
    expect(profile.family).toBe('tenancy-notice')
    expect(profile.rules.length).toBeGreaterThan(8)
  })

  it('does not send lease requirements to a notice', () => {
    // A deposit and a rent amount have no business in a document that ends a
    // tenancy — asking for them would produce a notice full of dead clauses.
    const requirements = renderKnowledgeForDrafting('tenancy-notice')
    expect(requirements).not.toMatch(/jistota|kauce/i)
  })
})
