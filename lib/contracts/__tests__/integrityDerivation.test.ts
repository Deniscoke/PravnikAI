/**
 * The integrity validator used to keep its own list of what each contract type
 * must contain — a second answer to a question the legal profiles already
 * answered. Two lists drift, and when they do nobody can tell which is right;
 * that is how a two-year-old minimum wage stayed in production.
 *
 * These tests pin the property that replaced it: checks are derived, so adding
 * a contract type cannot leave it unchecked, and a rule written once is
 * enforced in generation and in review alike.
 */

import { describe, it, expect } from 'vitest'
import { runIntegrityCheck } from '../integrityValidator'
import { SCHEMA_REGISTRY } from '../contractSchemas'
import { getContractProfile } from '@/lib/legal/knowledge'

const ALL_SCHEMAS = Object.values(SCHEMA_REGISTRY)

describe('every contract type is checked without being registered anywhere', () => {
  it('covers all nine schemas', () => {
    expect(ALL_SCHEMAS.length).toBeGreaterThanOrEqual(9)
  })

  for (const schema of ALL_SCHEMAS) {
    const { schemaId, name, contractFamily } = schema.metadata

    it(`${name} inherits checks from its legal profile`, () => {
      // An empty document must fail on whatever that type actually requires.
      const result = runIntegrityCheck('Prázdný dokument.', schemaId, 'CZ', 'complete')
      expect(result.missingEssentialKeywords.length).toBeGreaterThan(0)
    })

    it(`${name} reports elements by name, not by rule id`, () => {
      // The message reaches the user, so "kupní cena" beats "sale-cena".
      const result = runIntegrityCheck('Prázdný dokument.', schemaId, 'CZ', 'complete')
      for (const missing of result.missingEssentialKeywords) {
        expect(missing, `${schemaId} leaked a rule id`).not.toMatch(/^[a-z-]+-[a-z-]+$/)
      }
    })

    it(`${name} only demands what its own profile demands`, () => {
      const profileLabels = getContractProfile(contractFamily)
        .rules.filter((r) => r.detect)
        .map((r) => r.label ?? r.id)

      const result = runIntegrityCheck('Prázdný dokument.', schemaId, 'CZ', 'complete')
      for (const missing of result.missingEssentialKeywords) {
        expect(profileLabels, `${schemaId} demanded something outside its profile`).toContain(
          missing,
        )
      }
    })
  }
})

describe('a clause the law strikes out is caught by presence, not absence', () => {
  it('flags a blanket ban on keeping animals in a residential lease', () => {
    // This used to use a contractual penalty, which § 2239 disregarded until
    // zák. č. 163/2020 Sb. struck those words out on 1 July 2020. The animal
    // ban is the example that is still law: § 2258 gives the tenant the right
    // outright, so a clause removing it is disregarded whatever was signed.
    const lease = `NÁJEMNÍ SMLOUVA
      Byt č. 4. Nájemné činí 18 000 Kč. Jistota činí trojnásobek nájemného.
      Výpovědní doba tři měsíce.
      Nájemci se zakazuje chovat v bytě jakákoli zvířata.`
    const result = runIntegrityCheck(lease, 'najemni-smlouva-byt-v1', 'CZ', 'complete')
    const issue = result.issues.find((i) => i.code === 'PROHIBITED_CLAUSE_PRESENT')
    expect(issue?.message).toMatch(/2258/)
    expect(issue?.severity).toBe('error')
  })

  it('leaves a contractual penalty in a lease alone', () => {
    // The mirror of the rule above, and the reason it was worth rewriting: a
    // penalty is lawful here since 1 July 2020 and merely shares § 2254's
    // ceiling with the deposit. Flagging it would tell a tenant a clause is
    // void when it binds them.
    const lease = `NÁJEMNÍ SMLOUVA
      Byt č. 4. Nájemné činí 18 000 Kč.
      Při prodlení se sjednává smluvní pokuta 0,5 % denně.`
    const result = runIntegrityCheck(lease, 'najemni-smlouva-byt-v1', 'CZ', 'complete')
    expect(result.issues.some((i) => i.code === 'PROHIBITED_CLAUSE_PRESENT')).toBe(false)
  })

  it('does not flag an animal ban in a sale contract', () => {
    const sale = `KUPNÍ SMLOUVA
      Předmět koupě: notebook. Kupní cena 50 000 Kč.
      Kupujícímu se zakazuje chovat zvířata.`
    const result = runIntegrityCheck(sale, 'kupni-smlouva-v1', 'CZ', 'complete')
    expect(result.issues.some((i) => i.code === 'PROHIBITED_CLAUSE_PRESENT')).toBe(false)
  })

  it('drops a conditional prohibition to a warning', () => {
    // The arbitration ban applies to consumers. Nothing here can tell whether a
    // party is one, so the finding is raised without asserting a breach.
    const sale = `KUPNÍ SMLOUVA
      Předmět koupě: notebook. Kupní cena 50 000 Kč.
      Spory se řeší v rozhodčím řízení.`
    const result = runIntegrityCheck(sale, 'kupni-smlouva-v1', 'CZ', 'complete')
    const issue = result.issues.find((i) => i.code === 'PROHIBITED_CLAUSE_PRESENT')
    expect(issue?.severity).toBe('warning')
  })
})

describe('unknown schemas still get something', () => {
  it('falls back to generic checks rather than passing everything', () => {
    const result = runIntegrityCheck('Nějaký text.', 'neexistujici-schema-v9', 'CZ', 'complete')
    expect(result.missingEssentialKeywords.length).toBeGreaterThan(0)
  })
})
