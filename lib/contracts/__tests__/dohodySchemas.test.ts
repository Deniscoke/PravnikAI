/**
 * DPP and DPČ are the two most common Czech work documents and the easiest to
 * get wrong, because they look like an employment contract and are not one.
 *
 * These tests pin the distinctions that a copy-paste between the two schemas
 * would quietly erase: the annual ceiling belongs to DPP only, the weekly
 * average belongs to DPČ only, and neither may drift back toward the
 * pracovní-smlouva rules on notice periods and leave.
 */

import { describe, it, expect } from 'vitest'
import { getSchema, getSchemasForJurisdiction } from '../contractSchemas'
import { renderKnowledgeForDrafting } from '@/lib/legal/knowledge'
import { MINIMUM_HOURLY_WAGE_CZK } from '@/lib/legal/czechLegalFacts'

const DPP = getSchema('dohoda-o-provedeni-prace-v1')
const DPC = getSchema('dohoda-o-pracovni-cinnosti-v1')

function field(schema: typeof DPP, sectionId: string, fieldId: string) {
  return schema.sections.find((s) => s.id === sectionId)?.fields.find((f) => f.id === fieldId)
}

describe('registration', () => {
  it('both appear in the Czech generator', () => {
    const names = getSchemasForJurisdiction('CZ').map((s) => s.metadata.schemaId)
    expect(names).toContain('dohoda-o-provedeni-prace-v1')
    expect(names).toContain('dohoda-o-pracovni-cinnosti-v1')
  })

  it('both belong to the dohoda family, not to employment', () => {
    // Routing them to 'employment' is what made the review check a lawful
    // dohoda against pracovní-smlouva rules.
    expect(DPP.metadata.contractFamily).toBe('employment-agreement')
    expect(DPC.metadata.contractFamily).toBe('employment-agreement')
  })
})

describe('what separates the two', () => {
  it('DPP caps the year at 300 hours', () => {
    const hours = field(DPP, 'doba-rozsah', 'maxHours')
    expect(hours?.validation?.max).toBe(300)
    expect(hours?.legalNote).toMatch(/§ 75/)
  })

  it('DPČ has no annual ceiling but caps the weekly average at 20 hours', () => {
    expect(field(DPC, 'doba-rozsah', 'maxHours')).toBeUndefined()
    const weekly = field(DPC, 'doba-rozsah', 'weeklyHours')
    expect(weekly?.validation?.max).toBe(20)
    expect(weekly?.legalNote).toMatch(/§ 76/)
  })

  it('DPČ says outright that the 300-hour limit is not its own', () => {
    expect(field(DPC, 'doba-rozsah', 'weeklyHours')?.legalNote).toMatch(/300 hodin/)
    expect(DPC.metadata.aiInstructions).toMatch(/300 hodin/)
  })

  it('DPP requires an end date, DPČ does not', () => {
    // A DPP is agreed for a task; a DPČ may run indefinitely (§ 76 odst. 5).
    expect(field(DPP, 'doba-rozsah', 'endDate')?.required).toBe(true)
    expect(field(DPC, 'doba-rozsah', 'endDate')?.required).toBe(false)
  })
})

describe('what both must never become', () => {
  for (const [label, schema] of [['DPP', DPP], ['DPČ', DPC]] as const) {
    it(`${label} tells the model it is not a pracovní smlouva`, () => {
      expect(schema.metadata.aiInstructions).toMatch(/NENÍ pracovní smlouva/)
      expect(schema.metadata.aiInstructions).toMatch(/§ 51/)
      expect(schema.metadata.aiInstructions).toMatch(/§ 213/)
    })

    it(`${label} asks for "odměna", not "mzda"`, () => {
      expect(schema.metadata.aiInstructions).toMatch(/odměna z dohody/)
    })

    it(`${label} enforces the hourly minimum wage`, () => {
      const rate = field(schema, 'odmena', 'hourlyRate')
      expect(rate?.validation?.min).toBe(MINIMUM_HOURLY_WAGE_CZK.value)
    })

    it(`${label} receives the dohoda profile when drafting`, () => {
      const requirements = renderKnowledgeForDrafting(schema.metadata.contractFamily)
      expect(requirements).toContain('Dohoda o provedení práce')
      expect(requirements).toMatch(/§ 74–77/)
    })

    it(`${label} keeps review-only instructions out of the drafting prompt`, () => {
      // "NEHLAS jako chybějící" tells a reviewer what not to report. Sent to the
      // drafter it is noise at best and confusing at worst.
      expect(renderKnowledgeForDrafting(schema.metadata.contractFamily)).not.toContain('NEHLAS')
    })
  }
})

describe('payment terms', () => {
  it('defaults to a date earlier than the statutory ceiling', () => {
    // The ceiling is the end of the following month. Defaulting to it would
    // hand the employee the worst lawful outcome.
    for (const schema of [DPP, DPC]) {
      const term = field(schema, 'odmena', 'paymentTerm')
      expect(term?.defaultValue).not.toBe('konec')
    }
  })

  it('says which option is the statutory maximum', () => {
    const options = field(DPP, 'odmena', 'paymentTerm')?.options ?? []
    expect(options.find((o) => o.value === 'konec')?.label).toMatch(/maximum/)
  })
})
