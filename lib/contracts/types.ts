/**
 * PrávnikAI — Contract Generator Type System
 * Multi-jurisdiction: CZ (Czech Republic), DE (Germany), UK (United Kingdom)
 * All modules import from this file.
 */

// ─── Jurisdiction & Locale ───────────────────────────────────────────────────

/**
 * Legal jurisdiction the contract is governed by.
 * Each schema is bound to exactly one jurisdiction — its legal basis,
 * required clauses, and statutory citations are jurisdiction-specific.
 */
export type Jurisdiction = 'CZ' | 'DE' | 'UK'

/**
 * UI locale — what the user sees on screen.
 * Locale ↔ jurisdiction is 1:1 by default (see localeToJurisdiction()).
 */
export type Locale = 'cs' | 'de' | 'en'

/** Currency used for monetary fields in this jurisdiction. */
export type Currency = 'CZK' | 'EUR' | 'GBP'

/** Maps a UI locale to its default legal jurisdiction. */
export function localeToJurisdiction(locale: Locale): Jurisdiction {
  if (locale === 'de') return 'DE'
  if (locale === 'en') return 'UK'
  return 'CZ'
}

/** Maps a jurisdiction to its primary UI locale. */
export function jurisdictionToLocale(jurisdiction: Jurisdiction): Locale {
  if (jurisdiction === 'DE') return 'de'
  if (jurisdiction === 'UK') return 'en'
  return 'cs'
}

/** Returns the currency code used in a jurisdiction. */
export function jurisdictionCurrency(jurisdiction: Jurisdiction): Currency {
  if (jurisdiction === 'DE') return 'EUR'
  if (jurisdiction === 'UK') return 'GBP'
  return 'CZK'
}

export const ALL_LOCALES: readonly Locale[] = ['cs', 'de', 'en'] as const
export const DEFAULT_LOCALE: Locale = 'cs'

// ─── Field Types ─────────────────────────────────────────────────────────────

export type FieldType =
  | 'text'
  | 'textarea'
  | 'select'
  | 'date'
  | 'number'
  | 'checkbox'
  | 'email'
  | 'phone'

/**
 * GDPR-aware sensitivity classification.
 * - public     : non-personal, safe to log
 * - personal   : jméno, adresa, IČO — log minimally
 * - regulated  : rodné číslo, bankovní účet — log never, requires legal basis
 * - sensitive  : zdravotní stav, biometrika — full GDPR special category
 */
export type FieldSensitivity = 'public' | 'personal' | 'regulated' | 'sensitive'

export type SchemaSensitivity = 'standard' | 'sensitive' | 'regulated'

// ─── Field Definition ────────────────────────────────────────────────────────

export interface SelectOption {
  value: string
  label: string
}

export interface FieldValidation {
  min?: number
  max?: number
  minLength?: number
  maxLength?: number
  pattern?: string        // regex string
  customMessage?: string  // shown to user on violation
}

export interface ConditionalRule {
  /** ID of the controlling field */
  fieldId: string
  /** The value that activates this section/field */
  value: string | boolean
}

export interface ContractField {
  id: string
  label: string
  type: FieldType
  required: boolean
  sensitivity: FieldSensitivity
  /** Czech-law annotation shown as helper text, e.g. "§ 2081 NOZ — písemná forma" */
  legalNote?: string
  placeholder?: string
  defaultValue?: string
  options?: SelectOption[]
  validation?: FieldValidation
  /** Hide/show field based on another field's value */
  conditional?: ConditionalRule
}

// ─── Party Definition ────────────────────────────────────────────────────────

export type PartyFieldId =
  | 'name'
  | 'ico'
  | 'birthNumber'  // rodné číslo — regulated
  | 'address'
  | 'representative'
  | 'bankAccount'
  | 'email'
  | 'phone'

export interface PartyField {
  id: PartyFieldId
  label: string
  required: boolean
  sensitivity: FieldSensitivity
  legalNote?: string
}

/**
 * A named party in a contract. Scalable — schemas can define any number.
 * Preferred over hard-coded partyA/partyB to support 3-party agreements,
 * named roles (prodávající/kupující), and future extensions.
 */
export interface ContractParty {
  /** Stable identifier used in form field names: "prodavajici", "kupujici" */
  id: string
  /** Display label in Czech: "Prodávající", "Kupující" */
  label: string
  /** Short legal role description for the prompt */
  role: string
  requiredFields: PartyField[]
  optionalFields: PartyField[]
}

// ─── Section Definition ──────────────────────────────────────────────────────

export interface ContractSection {
  id: string
  title: string
  fields: ContractField[]
  /** Render section only when another field matches a value */
  conditional?: ConditionalRule
}

// ─── Output Structure ────────────────────────────────────────────────────────

export interface OutputStructure {
  /** Numbered sections in the generated document */
  sections: string[]
  /** Whether the contract must be signed by all parties (usually true) */
  requiresSignature: boolean
  /** Governs which court system handles disputes */
  defaultJurisdictionClause?: string
}

// ─── Schema Metadata ─────────────────────────────────────────────────────────

/**
 * Stable contract category. Display label is resolved per locale via i18n
 * messages. We keep canonical English IDs so the schema files stay locale-neutral.
 */
export type ContractCategory = 'civil' | 'commercial' | 'employment' | 'realestate'

export interface SchemaMetadata {
  /** Stable, versioned ID — never change once deployed: "kupni-smlouva-v1", "kaufvertrag-v1", "sale-of-goods-v1" */
  schemaId: string
  /** Stable cross-jurisdiction family ID — same value across CZ/DE/UK variants of the same contract type ("nda", "sale", "employment", "tenancy", "services"). */
  contractFamily: ContractFamily
  /** Human-readable name in the schema's native language. */
  name: string
  /** SemVer — bump minor for new optional fields, major for breaking changes */
  version: string
  /** Legal jurisdiction the schema is bound to. */
  jurisdiction: Jurisdiction
  /** Currency used for monetary fields. */
  currency: Currency
  /** Primary statutory basis with section numbers (in the jurisdiction's language). */
  legalBasis: string[]
  sensitivity: SchemaSensitivity
  outputStructure: OutputStructure
  /** Appended verbatim to the system prompt when generating this contract type */
  aiInstructions: string
  /** Short description shown in UI select / chip grid (native language). */
  description: string
  /** Stable category — UI label resolved via i18n messages. */
  category: ContractCategory
}

/**
 * Stable contract family identifier shared across jurisdictions.
 * Allows the UI to group "the same" contract type (e.g. NDA) across CZ/DE/UK
 * even though each has its own jurisdiction-specific schema.
 */
export type ContractFamily = 'nda' | 'sale' | 'employment' | 'tenancy' | 'services'

// ─── Top-Level Schema ─────────────────────────────────────────────────────────

/**
 * ContractSchema is the single source of truth.
 * The form renderer, validator, and prompt builder all read from this object.
 */
export interface ContractSchema {
  metadata: SchemaMetadata
  parties: ContractParty[]
  sections: ContractSection[]
}

// ─── Normalized Form Data ────────────────────────────────────────────────────

/**
 * After the form submits, data is normalized to this shape before validation
 * and before the prompt builder consumes it.
 */
export interface NormalizedPartyData {
  partyId: string
  fields: Record<PartyFieldId, string>
}

export interface NormalizedFormData {
  schemaId: string
  parties: NormalizedPartyData[]
  /** section.id → field.id → value */
  sections: Record<string, Record<string, string>>
}

// ─── Validation ──────────────────────────────────────────────────────────────

export type ValidationSeverity = 'error' | 'warning' | 'info'

export interface ValidationIssue {
  fieldId: string
  partyId?: string
  message: string
  severity: ValidationSeverity
  /** Czech statutory basis for the constraint, if applicable */
  legalBasis?: string
}

export interface ValidationResult {
  valid: boolean
  issues: ValidationIssue[]
}

/**
 * Layer 1 — UI validation: real-time, per-field
 * Layer 2 — Business-legal: cross-field, Czech-law constraints
 * Layer 3 — Generation readiness: determines generation mode
 */
export interface ThreeLayerValidationResult {
  ui: ValidationResult
  businessLegal: ValidationResult
  generationReadiness: GenerationReadinessResult
}

// ─── Generation Mode ─────────────────────────────────────────────────────────

/**
 * - complete      : All required + key optional fields present. Full contract.
 * - draft         : Required fields present, optionals missing. [DOPLNIT] placeholders.
 * - review-needed : Required fields missing or conflicting. ⚠️ ZKONTROLOVAT markers.
 */
export type GenerationMode = 'complete' | 'draft' | 'review-needed'

export interface GenerationReadinessResult {
  mode: GenerationMode
  missingRequired: string[]
  missingOptional: string[]
  conflicts: ValidationIssue[]
}

// ─── Prompt Builder ──────────────────────────────────────────────────────────

export interface PromptBuilderInput {
  schema: ContractSchema
  data: NormalizedFormData
  mode: GenerationMode
  /** Field IDs that are present and will be included in the prompt */
  visibleFields: string[]
  /** Field IDs that are absent — prompt builder adds [DOPLNIT] markers */
  missingFields: string[]
}

// ─── API Request / Response ──────────────────────────────────────────────────

// ─── Drafting Posture ────────────────────────────────────────────────────────

/**
 * Controls how the contract is drafted — whose interests to protect,
 * how aggressively, and what the commercial context is.
 * All fields are optional; omitting posture produces neutral output.
 */
export interface DraftingPosture {
  /**
   * Party ID whose interests to optimize (e.g. "prodavajici", "kupujici").
   * Must match one of the party IDs in the schema.
   */
  draftingSide?: string
  /** How risk-protective the clauses should be for the represented party. */
  riskTolerance?: 'conservative' | 'balanced' | 'aggressive'
  /** Tactical posture — how hard to push for the represented party. */
  negotiationPosture?: 'client-protective' | 'neutral' | 'compromise'
  /**
   * Legal nature of the transaction.
   * 'consumer' triggers mandatory Czech consumer-protection framing.
   */
  transactionContext?: 'B2B' | 'consumer' | 'employment' | 'other'
  /** Clauses the drafter requires in the output — verbatim or by description. */
  mustIncludeClauses?: string[]
  /** Clause patterns to keep out of the output (e.g. "arbitration clause"). */
  mustAvoidClauses?: string[]
  /** Free-text commercial context the model should consider when drafting. */
  specialCommercialNotes?: string
}

export interface GenerateContractRequest {
  schemaId: string
  formData: NormalizedFormData
  /** Request premium polish pass with GPT-5.4-pro (final text only) */
  premium?: boolean
  /** Drafting posture controls clause selection and wording strategy. */
  posture?: DraftingPosture
}

export interface ContractWarning {
  code: string
  message: string
  fieldId?: string
  legalBasis?: string
}

export interface GenerateContractResponse {
  schemaId: string
  mode: GenerationMode
  contractText: string
  warnings: ContractWarning[]
  /** Field IDs that would improve the generated contract if provided */
  missingFields: string[]
  /** Czech statute sections cited in this generation */
  legalBasis: string[]
  generatedAt: string  // ISO 8601
}

export interface GenerateContractError {
  error: string
  code:
    | 'VALIDATION_FAILED'
    | 'SCHEMA_NOT_FOUND'
    | 'LLM_ERROR'
    | 'RATE_LIMITED'
    | 'UNSUPPORTED_JURISDICTION'
  /** User-safe secondary line (e.g. OpenAI status / model / quota) — optional */
  hint?: string
  issues?: ValidationIssue[]
}
