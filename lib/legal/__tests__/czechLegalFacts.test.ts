/**
 * These tests do not prove the law — they make drift visible.
 *
 * Every statutory value carries the date a human last checked it. When that date
 * goes stale the suite starts warning, which is the whole point: the app once
 * shipped a two-year-old minimum wage because nothing ever asked.
 */

import { describe, it, expect } from 'vitest'
import {
  ALL_LEGAL_FACTS,
  MINIMUM_MONTHLY_WAGE_CZK,
  PROBATION_MAX_MONTHS,
  PROBATION_MAX_MONTHS_MANAGER,
  RENT_DEPOSIT_MAX_MULTIPLE,
  formatCzk,
} from '../czechLegalFacts'

/** Beyond this, a value is old enough that nobody should trust it silently. */
const STALE_AFTER_DAYS = 365

function daysSince(iso: string): number {
  return (Date.now() - new Date(iso).getTime()) / (1000 * 60 * 60 * 24)
}

describe('legal facts bookkeeping', () => {
  it('every fact records its provision, effective date, verification date and source', () => {
    for (const { key, fact } of ALL_LEGAL_FACTS) {
      expect(fact.law, `${key} is missing its provision`).toBeTruthy()
      expect(fact.source, `${key} is missing a source`).toBeTruthy()
      expect(Number.isNaN(Date.parse(fact.effectiveFrom)), `${key} effectiveFrom`).toBe(false)
      expect(Number.isNaN(Date.parse(fact.lastVerified)), `${key} lastVerified`).toBe(false)
    }
  })

  it('no fact was verified in the future', () => {
    for (const { key, fact } of ALL_LEGAL_FACTS) {
      expect(daysSince(fact.lastVerified), `${key} claims a future verification`).toBeGreaterThanOrEqual(-1)
    }
  })

  it('flags any fact that has not been re-checked within a year', () => {
    const stale = ALL_LEGAL_FACTS.filter(({ fact }) => daysSince(fact.lastVerified) > STALE_AFTER_DAYS)
      .map(({ key, fact }) => `${key} (naposledy ověřeno ${fact.lastVerified})`)

    expect(
      stale,
      `Tyto právní hodnoty je třeba znovu ověřit — viz docs/PRAVNI_ZDROJE.md:\n${stale.join('\n')}`,
    ).toEqual([])
  })
})

describe('current values', () => {
  it('minimum wage matches the value the validators enforce', () => {
    // Guards against an edit that changes one copy and not the other.
    expect(MINIMUM_MONTHLY_WAGE_CZK.value).toBe(22_400)
  })

  it('probation limits reflect the 2025 flexinovela, not the pre-2025 rule', () => {
    expect(PROBATION_MAX_MONTHS.value).toBe(4)
    expect(PROBATION_MAX_MONTHS_MANAGER.value).toBe(8)
  })

  it('rent deposit ceiling is three months', () => {
    expect(RENT_DEPOSIT_MAX_MULTIPLE.value).toBe(3)
  })
})

describe('formatCzk', () => {
  it('formats amounts the way the UI writes them', () => {
    expect(formatCzk(22_400).replace(/ /g, ' ')).toBe('22 400 Kč')
  })
})
