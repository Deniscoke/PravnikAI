/**
 * PrávnikAI — Contract Generator Type System
 * Jurisdiction: Czech Republic (CZ)
 * All modules import from this file.
 */

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

export interface SchemaMetadata {
  /** Stable, versioned ID — never change once deployed: "kupni-smlouva-v1" */
  schemaId: string
  /** Human-readable name: "Kupní smlouva" */
  name: string
  /** SemVer — bump minor for new optional fields, major for breaking changes */
  version: string
  /** Always 'CZ' — this system never generates SK or generic EU contracts */
  jurisdiction: 'CZ'
  /** Primary statutory basis with section numbers */
  legalBasis: string[]
  sensitivity: SchemaSensitivity
  outputStructure: OutputStructure
  /** Appended verbatim to the system prompt when generating this contract type */
  aiInstructions: string
  /** Short description shown in UI select / chip grid */
  description: string
  /** Category for grouping in the UI */
  category: 'občanské' | 'obchodní' | 'pracovní' | 'nemovitosti'
}

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

export interface GenerateContractRequest {
  schemaId: string
  formData: NormalizedFormData
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
  code: 'VALIDATION_FAILED' | 'SCHEMA_NOT_FOUND' | 'LLM_ERROR' | 'RATE_LIMITED'
  issues?: ValidationIssue[]
}
