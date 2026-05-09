/**
 * Contract Schema Registry — multi-jurisdiction (CZ / DE / UK)
 *
 * The ONLY file the API route, form renderer, and validator need to import.
 * To add a new contract type:
 *   1. Create lib/contracts/schemas/{cz|de|uk}/myNewSchema.ts
 *   2. Import it here and add one entry to SCHEMA_REGISTRY
 *   Zero changes needed anywhere else.
 *
 * Schema IDs are jurisdiction-specific (e.g. "kupni-smlouva-v1" for CZ,
 * "kaufvertrag-v1" for DE, "sale-of-goods-v1" for UK). The registry can be
 * filtered by jurisdiction so the UI only shows schemas relevant to the
 * user's chosen locale.
 */

import type { ContractSchema, Jurisdiction } from './types'

// ── CZ schemas ──────────────────────────────────────────────────────────────
import { kupniSmlouva } from './schemas/cz/kupniSmlouva'
import { pracovniSmlouva } from './schemas/cz/pracovniSmlouva'
import { najemniSmlouva } from './schemas/cz/najemniSmlouva'
import { smlouvaODilo } from './schemas/cz/smlouvaODilo'
import { ndaSmlouva } from './schemas/cz/ndaSmlouva'

// ── DE schemas ──────────────────────────────────────────────────────────────
import { ndaDe } from './schemas/de/nda'
import { kaufvertrag } from './schemas/de/kaufvertrag'
import { arbeitsvertrag } from './schemas/de/arbeitsvertrag'
import { mietvertrag } from './schemas/de/mietvertrag'
import { werkvertrag } from './schemas/de/werkvertrag'

// ── UK schemas ──────────────────────────────────────────────────────────────
import { ndaUk } from './schemas/uk/nda'
import { saleOfGoods } from './schemas/uk/saleOfGoods'
import { employmentContract } from './schemas/uk/employmentContract'
import { tenancyAst } from './schemas/uk/tenancyAst'
import { servicesAgreement } from './schemas/uk/servicesAgreement'

// ─── Registry ────────────────────────────────────────────────────────────────

/**
 * Map of schemaId → ContractSchema. Cross-jurisdictional — each schema is
 * tagged with `metadata.jurisdiction`. Use getSchemasForJurisdiction() to
 * filter for the active locale.
 */
export const SCHEMA_REGISTRY: Record<string, ContractSchema> = {
  // CZ
  [kupniSmlouva.metadata.schemaId]: kupniSmlouva,
  [pracovniSmlouva.metadata.schemaId]: pracovniSmlouva,
  [najemniSmlouva.metadata.schemaId]: najemniSmlouva,
  [smlouvaODilo.metadata.schemaId]: smlouvaODilo,
  [ndaSmlouva.metadata.schemaId]: ndaSmlouva,
  // DE
  [ndaDe.metadata.schemaId]: ndaDe,
  [kaufvertrag.metadata.schemaId]: kaufvertrag,
  [arbeitsvertrag.metadata.schemaId]: arbeitsvertrag,
  [mietvertrag.metadata.schemaId]: mietvertrag,
  [werkvertrag.metadata.schemaId]: werkvertrag,
  // UK
  [ndaUk.metadata.schemaId]: ndaUk,
  [saleOfGoods.metadata.schemaId]: saleOfGoods,
  [employmentContract.metadata.schemaId]: employmentContract,
  [tenancyAst.metadata.schemaId]: tenancyAst,
  [servicesAgreement.metadata.schemaId]: servicesAgreement,
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

/** Returns all schemas for a single jurisdiction. */
export function getSchemasForJurisdiction(jurisdiction: Jurisdiction): ContractSchema[] {
  return Object.values(SCHEMA_REGISTRY).filter(
    (s) => s.metadata.jurisdiction === jurisdiction,
  )
}

/**
 * Returns schemas grouped by category for a single jurisdiction.
 * If no jurisdiction provided, defaults to all (legacy behaviour).
 */
export function getSchemasByCategory(jurisdiction?: Jurisdiction): Record<string, ContractSchema[]> {
  const groups: Record<string, ContractSchema[]> = {}
  const schemas = jurisdiction
    ? getSchemasForJurisdiction(jurisdiction)
    : Object.values(SCHEMA_REGISTRY)

  for (const schema of schemas) {
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
 * Maps legacy HTML form values (Slovak slugs from index-cz.html) to current
 * schemaIds. Keeps backend stable when UI changes.
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
