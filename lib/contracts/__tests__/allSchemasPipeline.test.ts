/**
 * Every schema, through the whole pipeline, with plausible data.
 *
 * Ten contract types were added in quick succession and each was checked
 * against its own unit tests. None had been run end to end: validation →
 * readiness → prompt assembly → integrity. A schema can pass every unit test
 * and still produce a prompt that contradicts itself, or a required field the
 * form can never satisfy, and nobody would find out until a user did.
 *
 * These tests are generic on purpose. They assert properties that must hold for
 * any contract type, so the eleventh one is covered the day it is registered
 * rather than the day somebody remembers to write tests for it.
 */

import { describe, it, expect } from 'vitest'
import { SCHEMA_REGISTRY } from '../contractSchemas'
import { buildPrompt } from '../promptBuilder'
import { runIntegrityCheck } from '../integrityValidator'
import {
  validateUI,
  validateBusinessLegal,
  assessGenerationReadiness,
} from '../validators'
import { getContractProfile } from '@/lib/legal/knowledge'
import type { ContractSchema, NormalizedFormData } from '../types'

const SCHEMAS = Object.values(SCHEMA_REGISTRY)

/**
 * Fills every field with something type-appropriate, so readiness reports a
 * complete document rather than a wall of missing values.
 */
function fillCompletely(schema: ContractSchema): NormalizedFormData {
  const parties = schema.parties.map((party) => {
    const fields: Record<string, string> = {}
    for (const field of [...party.requiredFields, ...party.optionalFields]) {
      fields[field.id] = sampleForPartyField(field.id)
    }
    return { partyId: party.id, fields }
  })

  const sections: Record<string, Record<string, string>> = {}
  for (const section of schema.sections) {
    const values: Record<string, string> = {}
    for (const field of section.fields) {
      values[field.id] = sampleForField(field)
    }
    sections[section.id] = values
  }

  return { schemaId: schema.metadata.schemaId, parties, sections }
}

function sampleForPartyField(id: string): string {
  if (id === 'ico') return '05007984'
  if (id === 'birthNumber') return '1. 1. 1990'
  if (id === 'email') return 'test@example.cz'
  if (id === 'phone') return '+420123456789'
  if (id === 'bankAccount') return '3166094143/0800'
  if (id === 'address') return 'Dlouhá 12, 110 00 Praha 1'
  return 'Jan Novák'
}

function sampleForField(field: ContractSchema['sections'][number]['fields'][number]): string {
  switch (field.type) {
    case 'date':
      return '2026-09-01'
    case 'number': {
      // Respect the field's own bounds — a value outside them would make the
      // business-legal layer report a conflict that says nothing about wiring.
      const min = field.validation?.min ?? 1
      const max = field.validation?.max ?? min + 1000
      return String(Math.min(Math.max(min, 1000), max))
    }
    case 'select':
      return field.options?.[0]?.value ?? ''
    default:
      return 'Testovací hodnota pro účely kontroly zapojení schématu'
  }
}

describe('registry', () => {
  it('holds every schema under its own id', () => {
    for (const [key, schema] of Object.entries(SCHEMA_REGISTRY)) {
      expect(key).toBe(schema.metadata.schemaId)
    }
  })

  it('has no duplicate names in the picker', () => {
    const names = SCHEMAS.map((s) => s.metadata.name)
    expect(new Set(names).size).toBe(names.length)
  })
})

describe.each(SCHEMAS.map((s) => [s.metadata.name, s] as const))('%s', (_name, schema) => {
  const data = fillCompletely(schema)
  const { schemaId, contractFamily, jurisdiction } = schema.metadata

  it('has a legal profile behind it', () => {
    // Without one the drafting prompt carries no statutory requirements at all.
    const profile = getContractProfile(contractFamily)
    expect(profile, `${schemaId} has no profile`).toBeDefined()
    expect(profile.rules.length).toBeGreaterThan(4)
  })

  it('declares at least one party and one section', () => {
    expect(schema.parties.length).toBeGreaterThan(0)
    expect(schema.sections.length).toBeGreaterThan(0)
  })

  it('gives every field a unique id within its section', () => {
    for (const section of schema.sections) {
      const ids = section.fields.map((f) => f.id)
      expect(new Set(ids).size, `${schemaId}/${section.id} repeats a field id`).toBe(ids.length)
    }
  })

  it('never points a conditional at a field that does not exist', () => {
    // A dangling conditional hides the field forever, so a required value can
    // never be supplied and generation is stuck on "missing" with no way out.
    const known = new Set(schema.sections.flatMap((s) => s.fields.map((f) => f.id)))
    for (const section of schema.sections) {
      for (const field of section.fields) {
        if (!field.conditional) continue
        expect(known, `${schemaId}/${field.id} depends on unknown ${field.conditional.fieldId}`)
          .toContain(field.conditional.fieldId)
      }
    }
  })

  it('never makes a conditional field required', () => {
    // Required plus hidden is unsatisfiable: readiness would demand a value the
    // form refuses to show.
    for (const section of schema.sections) {
      for (const field of section.fields) {
        if (!field.conditional) continue
        expect(field.required, `${schemaId}/${field.id} is required but conditional`).toBe(false)
      }
    }
  })

  it('offers a valid default for every select', () => {
    for (const section of schema.sections) {
      for (const field of section.fields) {
        if (field.type !== 'select' || !field.defaultValue) continue
        const values = (field.options ?? []).map((o) => o.value)
        expect(values, `${schemaId}/${field.id} defaults outside its options`).toContain(
          field.defaultValue,
        )
      }
    }
  })

  it('reaches complete readiness when every field is filled', () => {
    const ui = validateUI(schema, data)
    const business = validateBusinessLegal(schema, data)
    const readiness = assessGenerationReadiness(schema, data, ui, business)

    expect(
      readiness.mode,
      `${schemaId}: ${readiness.missingRequired?.join(', ') ?? ''}`,
    ).not.toBe('review-needed')
  })

  it('builds a prompt carrying its own statutory requirements', () => {
    const { systemPrompt, userPrompt } = buildPrompt({
      schema,
      data,
      mode: 'complete',
      missingFields: [],
    })

    expect(systemPrompt.length).toBeGreaterThan(500)
    expect(userPrompt).toContain(schema.metadata.name)
    if (jurisdiction === 'CZ') {
      expect(userPrompt).toContain('Právní požadavky')
      expect(userPrompt).toContain(getContractProfile(contractFamily).label)
    }
  })

  it('keeps review-only instructions out of the drafting prompt', () => {
    const { userPrompt } = buildPrompt({ schema, data, mode: 'complete', missingFields: [] })
    expect(userPrompt).not.toContain('NEHLAS')
    expect(userPrompt).not.toContain('Na co se dívat')
  })

  it('tells a one-sided document that it is not a contract', () => {
    const { systemPrompt } = buildPrompt({ schema, data, mode: 'complete', missingFields: [] })
    const expected = schema.metadata.documentKind === 'unilateral'
    expect(systemPrompt.includes('TENTO DOKUMENT NENÍ SMLOUVA')).toBe(expected)
  })

  it('flags an empty document rather than passing it', () => {
    const result = runIntegrityCheck('Prázdný dokument.', schemaId, jurisdiction, 'complete')
    expect(result.missingEssentialKeywords.length).toBeGreaterThan(0)
  })

  it('does not flag its own well-formed output', () => {
    // Built from each rule's own detectSample, so the document genuinely
    // contains what the profile looks for. Anything still reported missing
    // means a pattern cannot find the very phrase it was written against.
    const profile = getContractProfile(contractFamily)
    const synthetic = profile.rules
      .filter((r) => r.detect && r.detectSample && r.kind !== 'prohibited')
      .map((r) => r.detectSample)
      .join('. ')

    const result = runIntegrityCheck(
      `${schema.metadata.name}\n${synthetic}\nPodpis: _______`,
      schemaId,
      jurisdiction,
      'complete',
    )

    expect(
      result.missingEssentialKeywords,
      `${schemaId} cannot recognise its own elements`,
    ).toEqual([])
  })
})
