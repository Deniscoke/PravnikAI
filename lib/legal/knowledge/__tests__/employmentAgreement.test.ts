/**
 * Regression tests from a real production failure.
 *
 * A user photographed a genuine dohoda o provedení práce and ran it through the
 * review. The type detector scored it as `employment`, so it was checked against
 * the pracovní-smlouva profile, and it returned two high-severity findings that
 * were both wrong:
 *
 *   - "no four weeks' leave, contrary to § 213" — § 213 does not apply to a
 *     dohoda; leave follows § 77 odst. 8 and the contract had it right
 *   - "no notice period, contrary to § 51" — § 51 does not apply either;
 *     termination follows § 77 odst. 4
 *
 * It also suggested adding an unlimited employee liability clause, which § 257
 * caps and § 4a forbids expanding.
 *
 * Telling somebody their lawful contract is defective is the worst way this
 * product can fail, so the fixture below is the real document's vocabulary.
 */

import { describe, it, expect } from 'vitest'
import {
  CONTRACT_PROFILES,
  getContractProfile,
  renderKnowledgeForReview,
  resolveContractFamily,
} from '../index'

/** Condensed from the contract that produced the wrong review. */
const REAL_DPP = `DOHODA O PROVEDENÍ PRÁCE

Zaměstnavatel: Základní škola Na Radosti, IČO: 05007984,
zaměstnanec: Mgr. Denis Mitrovič, datum narození: 4. 10. 1993

uzavírají tuto dohodu o provedení práce podle zákona č. 262/2006 Sb., zákoník práce.

1. Sjednaná práce bude provedena v období od 7. 9. 2026 do 31. 7. 2027
2. Sjednaná práce – učitel pro 2. stupeň
3. Místo výkonu práce: ZŠ Na Radosti
4. Zaměstnavatel se zavazuje zaplatit odměnu 450 Kč za hodinu, mzda bude
   vyplacena na základě měsíčního pracovního výkazu
5. Zaměstnavatel se zavazuje rozvrhnout zaměstnanci pracovní dobu v písemném
   rozvrhu a seznámit s ním zaměstnance nejpozději 1 den předem, rozsah práce
   v kalendářním roce nepřesáhne 300 hodin; poskytnout zaměstnanci dovolenou,
   pokud pracovněprávní vztah v kalendářním roce nepřetržitě trval po dobu
   alespoň 28 kalendářních dní a zaměstnanec odpracoval minimálně 80 hodin.`

describe('type detection', () => {
  it('recognises a dohoda o provedení práce as its own type', () => {
    expect(resolveContractFamily(REAL_DPP)).toBe('employment-agreement')
  })

  it('is not outvoted by employment vocabulary', () => {
    // The real document says "zaměstnanec", "zaměstnavatel" and "mzda" several
    // times and names its own type once. Scoring alone handed it to
    // `employment`; naming yourself has to win.
    const employmentHeavy =
      'zaměstnanec zaměstnavatel mzda zkušební doba ' +
      'dohoda o provedení práce'
    expect(resolveContractFamily(employmentHeavy)).toBe('employment-agreement')
  })

  it('still recognises a genuine pracovní smlouva', () => {
    expect(resolveContractFamily('PRACOVNÍ SMLOUVA\nZaměstnavatel a zaměstnanec…')).toBe(
      'employment',
    )
  })

  it('recognises a dohoda o pracovní činnosti', () => {
    expect(resolveContractFamily('DOHODA O PRACOVNÍ ČINNOSTI')).toBe('employment-agreement')
  })

  it('prefers the type a document names over the vocabulary it uses', () => {
    // A lease that mentions an employee is still a lease.
    const lease = 'NÁJEMNÍ SMLOUVA — nájemce je zaměstnanec pronajímatele, mzda 30000'
    expect(resolveContractFamily(lease)).toBe('tenancy')
  })
})

describe('the checklist sent for a dohoda', () => {
  const checklist = renderKnowledgeForReview('employment-agreement')

  it('is the dohoda checklist, not the pracovní smlouva one', () => {
    expect(checklist).toContain('Dohoda o provedení práce')
    expect(checklist).toContain('§ 74–77')
  })

  it('tells the reviewer not to demand § 213 leave', () => {
    expect(checklist).toMatch(/NEHLAS jako chybějící/)
    expect(checklist).toMatch(/§ 213/)
  })

  it('tells the reviewer not to demand a § 51 notice period', () => {
    expect(checklist).toMatch(/§ 51/)
    expect(checklist).toMatch(/patnáctidenní/)
  })

  it('states that the 28-day / 80-hour leave clause is correct, not a defect', () => {
    const rule = CONTRACT_PROFILES['employment-agreement'].rules.find(
      (r) => r.id === 'dpp-dovolena',
    )
    expect(rule?.reviewCheck).toMatch(/ZÁKONNĚ SPRÁVNÉ/)
  })

  it('states that a schedule notice shorter than three days is lawful if agreed', () => {
    // The contract said one day, which § 74 odst. 2 expressly permits by
    // agreement. Flagging it would be another false positive.
    const rule = CONTRACT_PROFILES['employment-agreement'].rules.find(
      (r) => r.id === 'dpp-rozvrh-pracovni-doby',
    )
    expect(rule?.reviewCheck).toMatch(/PŘÍPUSTNÁ/)
  })

  it('forbids suggesting an unlimited employee liability clause', () => {
    const rule = CONTRACT_PROFILES['employment-agreement'].rules.find(
      (r) => r.id === 'dpp-odpovednost-za-skodu',
    )
    expect(rule?.reviewCheck).toMatch(/NENAVRHUJ/)
    expect(rule?.law).toMatch(/257/)
  })

  it('carries the 300-hour ceiling', () => {
    expect(checklist).toMatch(/300 hodin/)
  })

  it('checks the hourly minimum wage, not the monthly one', () => {
    expect(checklist).toMatch(/134,4 Kč za hodinu|134,4/)
  })
})

describe('profile integrity', () => {
  it('is registered and reachable', () => {
    const profile = getContractProfile('employment-agreement')
    expect(profile.family).toBe('employment-agreement')
    expect(profile.rules.length).toBeGreaterThan(8)
  })

  it('says in its own characterisation that it is not a pracovní poměr', () => {
    expect(getContractProfile('employment-agreement').characterisation).toMatch(
      /mimo pracovní poměr/,
    )
  })
})
