/**
 * Contract Schema Registry
 *
 * The ONLY file the API route, form renderer, and validator need to import.
 * To add a new contract type:
 *   1. Create lib/contracts/schemas/myNewSmlouva.ts
 *   2. Import it here and add one entry to SCHEMA_REGISTRY
 *   Zero changes needed anywhere else.
 */

import type { ContractSchema } from './types'

import { kupniSmlouva } from './schemas/kupniSmlouva'
import { pracovniSmlouva } from './schemas/pracovniSmlouva'
import { najemniSmlouva } from './schemas/najemniSmlouva'
import { smlouvaODilo } from './schemas/smlouvaODilo'
import { ndaSmlouva } from './schemas/ndaSmlouva'

// ─── Registry ────────────────────────────────────────────────────────────────

/**
 * Map of schemaId → ContractSchema.
 * schemaIds are versioned (e.g. "kupni-smlouva-v1") so multiple versions
 * of the same contract type can coexist during migrations.
 */
export const SCHEMA_REGISTRY: Record<string, ContractSchema> = {
  [kupniSmlouva.metadata.schemaId]: kupniSmlouva,
  [pracovniSmlouva.metadata.schemaId]: pracovniSmlouva,
  [najemniSmlouva.metadata.schemaId]: najemniSmlouva,
  [smlouvaODilo.metadata.schemaId]: smlouvaODilo,
  [ndaSmlouva.metadata.schemaId]: ndaSmlouva,
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Returns the schema or throws a typed error if not found. */
export function getSchema(schemaId: string): ContractSchema {
  const schema = SCHEMA_REGISTRY[schemaId]
  if (!schema) {
    throw new Error(`Schema not found: "${schemaId}". Known schemas: ${Object.keys(SCHEMA_REGISTRY).join(', ')}`)
  }
  return schema
}

/** Returns all schemas grouped by category for the UI select/chip grid. */
export function getSchemasByCategory(): Record<string, ContractSchema[]> {
  const groups: Record<string, ContractSchema[]> = {}
  for (const schema of Object.values(SCHEMA_REGISTRY)) {
    const cat = schema.metadata.category
    if (!groups[cat]) groups[cat] = []
    groups[cat].push(schema)
  }
  return groups
}

/** Flat list of all schemas — useful for search and chip grid rendering. */
export function getAllSchemas(): ContractSchema[] {
  return Object.values(SCHEMA_REGISTRY)
}

/**
 * Maps legacy HTML form values (Slovak slugs from index-cz.html)
 * to current schemaIds. Keeps backend stable when UI changes.
 */
export const LEGACY_SLUG_MAP: Record<string, string> = {
  'kupna-zmluva': 'kupni-smlouva-v1',
  'zmluva-o-dielo': 'smlouva-o-dilo-v1',
  'najomna-zmluva-byt': 'najemni-smlouva-byt-v1',
  'pracovna-zmluva': 'pracovni-smlouva-v1',
  'zmluva-o-mlcanlivosti': 'nda-smlouva-v1',
}

/** Resolves both current schemaIds and legacy slugs. */
export function resolveSchemaId(idOrSlug: string): string {
  if (SCHEMA_REGISTRY[idOrSlug]) return idOrSlug
  const resolved = LEGACY_SLUG_MAP[idOrSlug]
  if (resolved) return resolved
  throw new Error(`Unknown schema ID or slug: "${idOrSlug}"`)
}
