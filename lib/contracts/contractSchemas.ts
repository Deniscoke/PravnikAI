/**
 * Contract Schema Registry — Czech law (CZ)
 *
 * The ONLY file the API route, form renderer, and validator need to import.
 * To add a new contract type:
 *   1. Create lib/contracts/schemas/cz/myNewSchema.ts
 *   2. Import it here and add one entry to SCHEMA_REGISTRY
 *   Zero changes needed anywhere else.
 *
 * DE/UK schemas were deactivated in Phase 2A (CZ-only product focus).
 * Schema files remain on disk but are not imported or registered.
 * Historical records referencing DE/UK schema IDs use getSchemaOrNull()
 * for graceful fallback instead of throwing.
 */

import type { ContractSchema, Jurisdiction } from './types'

// ── CZ schemas ──────────────────────────────────────────────────────────────
import { kupniSmlouva } from './schemas/cz/kupniSmlouva'
import { pracovniSmlouva } from './schemas/cz/pracovniSmlouva'
import { najemniSmlouva } from './schemas/cz/najemniSmlouva'
import { smlouvaODilo } from './schemas/cz/smlouvaODilo'
import { ndaSmlouva } from './schemas/cz/ndaSmlouva'
import { dohodaOProvedeniPrace } from './schemas/cz/dohodaOProvedeniPrace'
import { dohodaOPracovniCinnosti } from './schemas/cz/dohodaOPracovniCinnosti'
import { smlouvaOZapujcce } from './schemas/cz/smlouvaOZapujcce'
import { darovaciSmlouva } from './schemas/cz/darovaciSmlouva'
import { vypovedZNajmu } from './schemas/cz/vypovedZNajmu'
import { plnaMoc } from './schemas/cz/plnaMoc'
import { zpracovatelskaSmlouva } from './schemas/cz/zpracovatelskaSmlouva'
import { vypovedZPracovnihoPomeru } from './schemas/cz/vypovedZPracovnihoPomeru'
import { zruseniDohody } from './schemas/cz/zruseniDohody'
import { odstoupeniOdSmlouvy } from './schemas/cz/odstoupeniOdSmlouvy'
import { reklamace } from './schemas/cz/reklamace'
import { predzalobniVyzva } from './schemas/cz/predzalobniVyzva'
import { smlouvaOPoskytovaniSluzeb } from './schemas/cz/smlouvaOPoskytovaniSluzeb'

// ─── Registry ────────────────────────────────────────────────────────────────

/**
 * Map of schemaId → ContractSchema. Currently CZ-only.
 * Use getSchemasForJurisdiction('CZ') or getSchemasByCategory('CZ') for UI.
 */
export const SCHEMA_REGISTRY: Record<string, ContractSchema> = {
  [kupniSmlouva.metadata.schemaId]: kupniSmlouva,
  [pracovniSmlouva.metadata.schemaId]: pracovniSmlouva,
  [najemniSmlouva.metadata.schemaId]: najemniSmlouva,
  [smlouvaODilo.metadata.schemaId]: smlouvaODilo,
  [ndaSmlouva.metadata.schemaId]: ndaSmlouva,
  [dohodaOProvedeniPrace.metadata.schemaId]: dohodaOProvedeniPrace,
  [dohodaOPracovniCinnosti.metadata.schemaId]: dohodaOPracovniCinnosti,
  [smlouvaOZapujcce.metadata.schemaId]: smlouvaOZapujcce,
  [darovaciSmlouva.metadata.schemaId]: darovaciSmlouva,
  [vypovedZNajmu.metadata.schemaId]: vypovedZNajmu,
  [plnaMoc.metadata.schemaId]: plnaMoc,
  [zpracovatelskaSmlouva.metadata.schemaId]: zpracovatelskaSmlouva,
  [vypovedZPracovnihoPomeru.metadata.schemaId]: vypovedZPracovnihoPomeru,
  [zruseniDohody.metadata.schemaId]: zruseniDohody,
  [odstoupeniOdSmlouvy.metadata.schemaId]: odstoupeniOdSmlouvy,
  [reklamace.metadata.schemaId]: reklamace,
  [predzalobniVyzva.metadata.schemaId]: predzalobniVyzva,
  [smlouvaOPoskytovaniSluzeb.metadata.schemaId]: smlouvaOPoskytovaniSluzeb,
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

/**
 * Tolerant lookup — returns null instead of throwing for unknown IDs.
 * Use for historical records that may reference deactivated DE/UK schemas.
 */
export function getSchemaOrNull(schemaId: string): ContractSchema | null {
  return SCHEMA_REGISTRY[schemaId] ?? null
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
