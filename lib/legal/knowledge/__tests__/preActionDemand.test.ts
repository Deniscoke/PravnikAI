/**
 * A předžalobní výzva is cheap to write and expensive to get wrong: miss the
 * seven-day gap and the creditor wins the case but pays their own lawyer.
 *
 * These pin the three things people believe about it that are not true — that
 * it is a precondition of suing, that it stops limitation running, and that the
 * default interest rate is a number you can look up once.
 *
 * Checked against the statute text on 2026-08-23.
 */

import { describe, it, expect } from 'vitest'
import { CONTRACT_PROFILES, resolveContractFamily, renderKnowledgeForDrafting } from '../index'
import { auditContract } from '@/lib/review/structuralAudit'
import { getSchema } from '@/lib/contracts/contractSchemas'
import {
  DEFAULT_INTEREST_SPREAD_POINTS,
  LATE_PAYMENT_MIN_COSTS_CZK,
  formatCzk,
} from '@/lib/legal/czechLegalFacts'

const profile = CONTRACT_PROFILES['pre-action-demand']
const rule = (id: string) => profile.rules.find((r) => r.id === id)

describe('detection', () => {
  it('recognises the demand', () => {
    expect(
      resolveContractFamily('PŘEDŽALOBNÍ VÝZVA K PLNĚNÍ\nVyzývám Vás k úhradě dlužné částky.'),
    ).toBe('pre-action-demand')
  })

  it('wins over the contract the debt arose from', () => {
    const letter =
      'Předžalobní výzva — z kupní smlouvy ze dne 1. 6. 2026 dlužíte jistinu 48 000 Kč.'
    expect(resolveContractFamily(letter)).toBe('pre-action-demand')
  })

  it('does not claim every "výzva k plnění"', () => {
    // An odstoupení quotes the demand it had to send first under § 2003, so the
    // bare phrase belongs to no one type.
    const withdrawal =
      'ODSTOUPENÍ OD SMLOUVY\nOdstupuji od smlouvy o dílo ze dne 1. 6. 2026 poté, ' +
      'co marně uplynula dodatečná lhůta poskytnutá ve výzvě k plnění.'
    expect(resolveContractFamily(withdrawal)).toBe('withdrawal')
  })
})

describe('what the letter is actually for', () => {
  it('ties the seven days to the costs, not to the right to sue', () => {
    const r = rule('demand-lhuta-7-dnu')
    expect(r?.requirement).toMatch(/SEDM DNŮ/)
    expect(r?.law).toMatch(/142a/)
    expect(r?.reviewCheck).toMatch(/náhradu nákladů řízení/)
  })

  it('says outright that a claim can be filed without it', () => {
    const r = rule('demand-jen-naklady')
    expect(r?.requirement).toMatch(/nikoli podmínkou žaloby/)
    expect(r?.reviewCheck).toMatch(/nelze podat žalobu/)
  })

  it('says the letter does not stop limitation', () => {
    const r = rule('demand-nestaci-na-promlceni')
    expect(r?.requirement).toMatch(/NEZASTAVUJE/)
    expect(r?.law).toMatch(/648/)
    expect(r?.law).toMatch(/639/)
  })

  it('remembers § 143 — the debtor who pays and then claims costs', () => {
    expect(rule('demand-zaplatil-hned')?.law).toMatch(/143/)
  })
})

describe('the interest rate is a formula, not a number', () => {
  it('stores only the spread, and says why', () => {
    expect(DEFAULT_INTEREST_SPREAD_POINTS.value).toBe(8)
    expect(DEFAULT_INTEREST_SPREAD_POINTS.note).toMatch(/nikdy ji sem nezmrazuj/)
  })

  it('forbids inventing a percentage', () => {
    const r = rule('demand-urok-sazba-neurcuj')
    expect(r?.requirement).toMatch(/NEUVÁDĚJ konkrétní procento/)
    expect(r?.requirement).toMatch(/V NĚMŽ DOŠLO K PRODLENÍ/)
  })

  it('never puts a bare rate in the drafting prompt', () => {
    // A percentage in the knowledge base would end up in every letter and be
    // wrong twice a year. The spread in "8 procentních bodů" is not a rate.
    const drafting = renderKnowledgeForDrafting('pre-action-demand')
    expect(drafting).not.toMatch(/\d+(,\d+)?\s*%\s*(ročně|p\.\s?a\.)/)
    expect(drafting).toMatch(/repo sazb/)
  })

  it('keeps the interest due even without a contractual clause', () => {
    const r = rule('demand-urok-naleza')
    expect(r?.law).toMatch(/1970/)
    expect(r?.reviewCheck).toMatch(/považuje za ujednanou/)
  })

  it('carries the business-to-business flat cost', () => {
    expect(LATE_PAYMENT_MIN_COSTS_CZK.value).toBe(1200)
    const r = rule('demand-naklady-1200')
    expect(r?.requirement).toContain(formatCzk(LATE_PAYMENT_MIN_COSTS_CZK.value))
    expect(r?.appliesWhen).toMatch(/podnikatel/)
  })
})

describe('tone', () => {
  it('rules out threats that do not belong in the letter', () => {
    const r = rule('demand-nevyhrozuj')
    expect(r?.requirement).toMatch(/trestním oznámením/)
    expect(r?.requirement).toMatch(/exekucí bez exekučního titulu/)
  })
})

describe('the audit on a real demand', () => {
  it('accepts a complete one', () => {
    const complete = `PŘEDŽALOBNÍ VÝZVA K PLNĚNÍ
      Na základě smlouvy o dílo ze dne 3. 3. 2026 jsem provedl a předal dílo.
      Faktura č. 2026/114, jistina 48 000 Kč, byla splatná dne 17. 3. 2026.
      Vyzývám Vás k úhradě dlužné částky na účet č. 123456789/0800 do 14 dnů.
      Nebude-li částka uhrazena, bude vymáhána soudní cestou.
      Výzva se zasílá doporučeně na adresu pro doručování.`
    const missing = auditContract(complete, 'pre-action-demand').notFound.map((f) => f.ruleId)
    expect(missing).toEqual([])
  })

  it('notices a letter that never asks for the money', () => {
    const vague = `PŘEDŽALOBNÍ VÝZVA
      Faktura č. 2026/114 byla splatná dne 17. 3. 2026 a dosud nebyla uhrazena.`
    const missing = auditContract(vague, 'pre-action-demand').notFound.map((f) => f.ruleId)
    expect(missing).toContain('demand-vyzva-k-plneni')
  })
})

describe('the schema protects the seven days', () => {
  const schema = getSchema('predzalobni-vyzva-v1')

  it('cannot offer a period shorter than the statute needs', () => {
    const vyzva = schema.sections.find((s) => s.id === 'vyzva')
    const days = vyzva?.fields.find((f) => f.id === 'paymentDays')
    expect(days?.validation?.min).toBe(7)
    expect(days?.defaultValue).toBe('14')
  })

  it('asks whether the rate is known instead of assuming it', () => {
    const prislusenstvi = schema.sections.find((s) => s.id === 'prislusenstvi')
    const known = prislusenstvi?.fields.find((f) => f.id === 'interestRateKnown')
    const rate = prislusenstvi?.fields.find((f) => f.id === 'interestRate')
    expect(known?.defaultValue).toBe('ne')
    expect(rate?.conditional).toEqual({ fieldId: 'interestRateKnown', value: 'ano' })
  })

  it('tells the drafter not to compute anything', () => {
    expect(schema.metadata.aiInstructions).toMatch(/Nikdy nepočítej výši úroku/)
    expect(schema.metadata.aiInstructions).toMatch(/NEVYHROŽUJ/)
    expect(schema.metadata.aiInstructions).toMatch(/nestaví/)
  })

  it('is one-sided and signed only by the creditor', () => {
    expect(schema.metadata.documentKind).toBe('unilateral')
    expect(schema.metadata.aiInstructions).toMatch(/POUZE u věřitele/)
  })
})
