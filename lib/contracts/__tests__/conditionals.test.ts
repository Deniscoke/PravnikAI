/**
 * A conditional whose controlling field lives in a different section.
 *
 * Four copies of this lookup existed — form renderer, prompt builder, and twice
 * in the validators — and every field-level one searched only its own section
 * while every section-level one searched everywhere. No schema had crossed a
 * section boundary before, so the difference was invisible.
 *
 * When one finally did, the dependent field never appeared in the form, never
 * reached the prompt and was never reported as missing: unfillable, and silent
 * about it. On a notice of termination the field concerned was the statutory
 * ground, without which § 2288 makes the notice void.
 */

import { describe, it, expect } from 'vitest'
import { resolveControlValue, isConditionMet } from '../conditionals'
import { getSchema } from '../contractSchemas'
import { buildPrompt } from '../promptBuilder'
import type { NormalizedFormData } from '../types'

const DATA: NormalizedFormData = {
  schemaId: 'test',
  parties: [],
  sections: {
    'section-a': { control: 'ano', shared: 'z A' },
    'section-b': { other: 'x', shared: 'z B' },
  },
}

describe('resolveControlValue', () => {
  it('finds a field in another section', () => {
    expect(resolveControlValue(DATA, 'control', 'section-b')).toBe('ano')
  })

  it('prefers the current section when a name appears twice', () => {
    // Two sections may reuse a field name; the nearer one is what the author
    // of the conditional meant.
    expect(resolveControlValue(DATA, 'shared', 'section-b')).toBe('z B')
    expect(resolveControlValue(DATA, 'shared', 'section-a')).toBe('z A')
  })

  it('honours an explicitly qualified id over the current section', () => {
    expect(resolveControlValue(DATA, 'section-a.shared', 'section-b')).toBe('z A')
  })

  it('returns empty for an unknown field rather than throwing', () => {
    expect(resolveControlValue(DATA, 'neexistuje', 'section-a')).toBe('')
  })
})

describe('isConditionMet', () => {
  it('is satisfied when there is no condition', () => {
    expect(isConditionMet(undefined, DATA)).toBe(true)
  })

  it('compares as strings, since form data always is', () => {
    const numeric: NormalizedFormData = {
      schemaId: 't',
      parties: [],
      sections: { s: { count: '3' } },
    }
    expect(isConditionMet({ fieldId: 'count', value: 3 }, numeric, 's')).toBe(true)
  })

  it('is not satisfied when the control has another value', () => {
    expect(isConditionMet({ fieldId: 'control', value: 'ne' }, DATA, 'section-b')).toBe(false)
  })
})

describe('the notice of termination, which is where this surfaced', () => {
  const schema = getSchema('vypoved-z-najmu-bytu-v1')

  /** Landlord giving notice — the branch that needs a statutory ground. */
  const landlordData: NormalizedFormData = {
    schemaId: schema.metadata.schemaId,
    parties: schema.parties.map((p) => ({
      partyId: p.id,
      fields: { name: 'Jan Novák', address: 'Dlouhá 12, Praha' },
    })),
    sections: {
      'kdo-vypovida': { noticeGiver: 'pronajimatel', leaseTerm: 'neurcita' },
      najem: { apartment: 'byt č. 4', leaseDate: '2025-03-01' },
      duvod: {
        landlordGround: 'hrube-poruseni',
        groundDetail: 'Nájemce neplatil nájemné tři měsíce.',
      },
      'doba-predani': { deliveryMethod: 'dorucenka', withoutNoticePeriod: 'ne' },
      zaverecna: { noticeDate: '2026-09-01' },
    },
  }

  it('shows the ground field to a landlord even though the control is elsewhere', () => {
    const ground = schema.sections
      .find((s) => s.id === 'duvod')
      ?.fields.find((f) => f.id === 'landlordGround')

    expect(ground?.conditional?.fieldId).toBe('noticeGiver')
    expect(isConditionMet(ground?.conditional, landlordData, 'duvod')).toBe(true)
  })

  it('carries the ground into the prompt', () => {
    // The whole point: a value the user filled in has to reach the model.
    const { userPrompt } = buildPrompt({
      schema,
      data: landlordData,
      mode: 'complete',
      missingFields: [],
    })
    expect(userPrompt).toContain('Nájemce neplatil nájemné tři měsíce.')
  })

  it('hides the ground from a tenant, who owes none', () => {
    const tenantData: NormalizedFormData = {
      ...landlordData,
      sections: {
        ...landlordData.sections,
        'kdo-vypovida': { noticeGiver: 'najemce', leaseTerm: 'neurcita' },
      },
    }

    const ground = schema.sections
      .find((s) => s.id === 'duvod')
      ?.fields.find((f) => f.id === 'landlordGround')

    expect(isConditionMet(ground?.conditional, tenantData, 'duvod')).toBe(false)
  })

  it('keeps a tenant-only field out of a landlord notice', () => {
    const changed = schema.sections
      .find((s) => s.id === 'duvod')
      ?.fields.find((f) => f.id === 'changedCircumstances')

    // Only relevant on a fixed-term lease.
    expect(isConditionMet(changed?.conditional, landlordData, 'duvod')).toBe(false)
  })
})

describe('the gift schema, which crosses sections too', () => {
  const schema = getSchema('darovaci-smlouva-v1')

  it('asks who files with the land registry only for real estate', () => {
    const filing = schema.sections
      .find((s) => s.id === 'predani')
      ?.fields.find((f) => f.id === 'cadastreFiling')

    const realEstate: NormalizedFormData = {
      schemaId: schema.metadata.schemaId,
      parties: [],
      sections: { 'predmet-daru': { giftType: 'nemovitost' }, predani: {} },
    }
    const money: NormalizedFormData = {
      schemaId: schema.metadata.schemaId,
      parties: [],
      sections: { 'predmet-daru': { giftType: 'penize' }, predani: {} },
    }

    expect(isConditionMet(filing?.conditional, realEstate, 'predani')).toBe(true)
    expect(isConditionMet(filing?.conditional, money, 'predani')).toBe(false)
  })
})
