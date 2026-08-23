/**
 * The only document here whose signer is usually the party it hurts.
 *
 * Signing reverses the burden of proof, restarts limitation at ten years, and —
 * where the debt was already time-barred — hands back a claim the creditor had
 * permanently lost. These tests exist to make sure the product says so, every
 * time, rather than producing a tidy declaration that quietly costs the user
 * their best defence.
 *
 * Checked against the statute text on 2026-08-23.
 */

import { describe, it, expect } from 'vitest'
import { CONTRACT_PROFILES, resolveContractFamily, renderKnowledgeForDrafting } from '../index'
import { auditContract } from '@/lib/review/structuralAudit'
import { getSchema } from '@/lib/contracts/contractSchemas'

const profile = CONTRACT_PROFILES['debt-acknowledgment']
const rule = (id: string) => profile.rules.find((r) => r.id === id)

describe('detection', () => {
  it('recognises an acknowledgment', () => {
    expect(
      resolveContractFamily('UZNÁNÍ DLUHU\nUznávám tímto svůj dluh co do důvodu i výše.'),
    ).toBe('debt-acknowledgment')
  })

  it('wins over the zápůjčka the debt came from', () => {
    const letter =
      'UZNÁNÍ DLUHU\nUznávám dluh ze smlouvy o zápůjčce ze dne 3. 3. 2026 ve výši 60 000 Kč.'
    expect(resolveContractFamily(letter)).toBe('debt-acknowledgment')
  })

  it('wins over a demand it answers', () => {
    // Acknowledgments are very often written in reply to one and say so.
    const letter =
      'UZNÁNÍ DLUHU\nV návaznosti na předžalobní výzvu ze dne 1. 8. 2026 uznávám svůj dluh.'
    expect(resolveContractFamily(letter)).toBe('debt-acknowledgment')
  })
})

describe('what makes the acknowledgment work at all', () => {
  it('needs written form', () => {
    const r = rule('debtack-pisemna-forma')
    expect(r?.consequence).toBe('nevznikne')
    expect(r?.requirement).toMatch(/PÍSEMNOU FORMU/)
  })

  it('needs the ground and the amount, not just the words', () => {
    for (const id of ['debtack-duvod', 'debtack-vyse', 'debtack-prohlaseni']) {
      expect(rule(id)?.kind, id).toBe('essential')
      expect(rule(id)?.consequence, id).toBe('nevznikne')
    }
    expect(rule('debtack-duvod')?.law).toMatch(/2053/)
  })
})

describe('the consequences the signer must be told about', () => {
  it('states that the burden of proof flips', () => {
    const r = rule('debtack-domnenka')
    expect(r?.requirement).toMatch(/VYVRATITELNÁ DOMNĚNKA/)
    expect(r?.requirement).toMatch(/obrací důkazní břemeno/)
  })

  it('keeps the presumption rebuttable', () => {
    expect(rule('debtack-domnenka')?.reviewCheck).toMatch(/nevyvratitelné|vzdává\s+námitek/)
  })

  it('puts limitation at ten years, running from the stated payment date', () => {
    const r = rule('debtack-deset-let')
    expect(r?.requirement).toMatch(/DESET LET/)
    expect(r?.requirement).toMatch(/posledního dne/)
    expect(r?.law).toMatch(/639/)
  })

  it('warns that acknowledging a time-barred debt revives it', () => {
    const r = rule('debtack-promlceny-dluh')
    expect(r?.requirement).toMatch(/OBNOVÍ/)
    expect(r?.law).toMatch(/653/)
    expect(r?.reviewCheck).toMatch(/Chybí upozornění na promlčení/)
  })

  it('does not let a partial payment revive a barred claim', () => {
    // § 2054 odst. 3 excludes it, and the opposite belief is common.
    const r = rule('debtack-konkludentni-uznani')
    expect(r?.requirement).toMatch(/NEVZTAHUJE/)
    expect(r?.law).toMatch(/2054/)
  })

  it('never renders the warnings as optional advice in the drafting prompt', () => {
    const drafting = renderKnowledgeForDrafting('debt-acknowledgment')
    expect(drafting).toMatch(/UPOZORNI DLUŽNÍKA/)
    expect(drafting).toMatch(/DESET LET/)
  })
})

describe('what does not belong in a one-sided declaration', () => {
  it('marks instalment acceleration inapplicable', () => {
    const sections = (profile.inapplicable ?? []).map((p) => p.section)
    expect(sections).toContain('1931')
  })

  it('explains why, and names the deadline creditors miss', () => {
    const r = rule('debtack-splatky-nejsou-dohoda')
    expect(r?.requirement).toMatch(/UJEDNÁNÍM stran/)
    expect(r?.requirement).toMatch(/nejbližší\s+příští splátky/)
  })

  it('is signed by the debtor alone', () => {
    expect(rule('debtack-podpis-dluznika')?.reviewCheck).toMatch(/strany se dohodly/)
  })

  it('remembers the deed has to come back', () => {
    expect(rule('debtack-vraceni-upisu')?.law).toMatch(/1952/)
  })
})

describe('the audit on a real acknowledgment', () => {
  it('accepts a complete one', () => {
    const complete = `UZNÁNÍ DLUHU
      Dluh vznikl na základě smlouvy o zápůjčce ze dne 3. 3. 2026.
      Uznávám tímto svůj dluh co do důvodu i výše, a to jistinu 60 000 Kč.
      Dluh uhradím nejpozději do 31. 12. 2026.
      Jsem si vědom, že dluh není promlčen a že uznáním běží nová desetiletá lhůta.
      V Brně dne 3. 9. 2026, vlastnoruční podpis dlužníka.`
    const missing = auditContract(complete, 'debt-acknowledgment').notFound.map((f) => f.ruleId)
    expect(missing).toEqual([])
  })

  it('notices a description of a debt that never acknowledges it', () => {
    const bare = `UZNÁNÍ DLUHU
      Ze smlouvy o zápůjčce ze dne 3. 3. 2026 zbývá uhradit 60 000 Kč.
      V Brně dne 3. 9. 2026, podpis.`
    const missing = auditContract(bare, 'debt-acknowledgment').notFound.map((f) => f.ruleId)
    expect(missing).toContain('debtack-prohlaseni')
  })
})

describe('the schema puts the risk in front of the user', () => {
  const schema = getSchema('uznani-dluhu-v1')

  it('asks outright whether limitation was checked', () => {
    const promlceni = schema.sections.find((s) => s.id === 'promlceni')
    const checked = promlceni?.fields.find((f) => f.id === 'limitationChecked')
    expect(checked?.required).toBe(true)
    // Defaults to "don't know", so the honest answer takes no effort and the
    // reassuring one is a deliberate click.
    expect(checked?.defaultValue).toBe('nevim')
    expect(checked?.legalNote).toMatch(/653/)
  })

  it('includes the warning in the document by default', () => {
    const promlceni = schema.sections.find((s) => s.id === 'promlceni')
    expect(promlceni?.fields.find((f) => f.id === 'limitationWarning')?.defaultValue).toBe('ano')
  })

  it('forbids dropping the statutory warning', () => {
    expect(schema.metadata.aiInstructions).toMatch(/Toto\s+poučení nevynechávej ani nezkracuj/)
  })

  it('offers no acceleration field at all', () => {
    const ids = schema.sections.flatMap((s) => s.fields.map((f) => f.id))
    for (const banned of ['accelerationClause', 'lossOfInstalments', 'ztrataVyhody']) {
      expect(ids).not.toContain(banned)
    }
    expect(schema.metadata.aiInstructions).toMatch(/NEVKLÁDEJ ztrátu výhody splátek/)
  })

  it('is one-sided and signed only by the debtor', () => {
    expect(schema.metadata.documentKind).toBe('unilateral')
    expect(schema.metadata.aiInstructions).toMatch(/POUZE u dlužníka/)
  })
})
