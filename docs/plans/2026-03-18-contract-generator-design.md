# Contract Generator — Design Document
**Date:** 2026-03-18
**Status:** Approved
**Jurisdiction:** Czech Republic (CZ)
**Stack:** Next.js 14 App Router · TypeScript · Claude API

---

## 1. Problem Statement

Slovak/Czech lawyers need to generate legally sound contracts in minutes, not hours. The system must:
- Produce contracts grounded exclusively in Czech law (NOZ, ZP, ZOK)
- Adapt the form UI to the selected contract type (different contracts need different fields)
- Validate data at three layers before sending anything to an LLM
- Return structured output — not raw text — so the frontend can act on warnings, missing fields, and generation status

---

## 2. Approved Architecture: Approach B — Section-Driven Schema

The `ContractSchema` is the single source of truth. Every other module (form renderer, validator, prompt builder, API route) reads from it — nothing is hard-coded elsewhere.

```
ContractSchema
     │
     ├── DynamicContractForm   (schema → rendered form)
     ├── validators             (schema → 3-layer validation)
     ├── promptBuilder          (schema + data → LLM prompt)
     └── /api/generate-contract (orchestration endpoint)
```

**Why B over A (flat registry) or C (JSON Schema)?**
- A (flat registry): loses type safety, no compile-time guarantees on field names
- C (JSON Schema interpreter): high runtime overhead, poor DX for Czech-law-specific constraints
- B: TypeScript interfaces enforce correctness at compile time; Czech-law constraints live as first-class fields on `ContractField`, not in a separate rules layer

---

## 3. Data Model

### 3.1 Schema Metadata

Each schema carries metadata to drive routing, auditing, and prompt tuning:

```typescript
interface SchemaMetadata {
  schemaId: string          // e.g. "kupni-smlouva-v1"
  version: string           // semver: "1.0.0"
  jurisdiction: 'CZ'        // hard-coded — no SK, no EU generic
  legalBasis: string[]      // e.g. ["§ 2079 NOZ", "zák. č. 89/2012 Sb."]
  sensitivity: SchemaSensitivity  // 'standard' | 'sensitive' | 'regulated'
  outputStructure: OutputStructure
  aiInstructions: string    // appended verbatim to system prompt for this type
}
```

### 3.2 Party Definition (scalable)

Parties are defined per-schema, not hard-coded as partyA/partyB. This allows:
- 2-party contracts (most common)
- 3-party contracts (e.g., pledge agreements with creditor/debtor/pledger)
- Named roles: `prodavajici`/`kupujici`, `zamestnavatel`/`zamestnanec`, etc.

```typescript
interface ContractParty {
  id: string           // "prodavajici" | "kupujici" | custom
  label: string        // "Prodávající" (displayed in form)
  role: string         // legal role description
  requiredFields: PartyField[]
  optionalFields: PartyField[]
}
```

### 3.3 Section & Field

```typescript
interface ContractSection {
  id: string
  title: string
  fields: ContractField[]
  conditional?: ConditionalRule   // show section only if field X has value Y
}

interface ContractField {
  id: string
  label: string
  type: FieldType        // text | textarea | select | date | number | checkbox
  required: boolean
  sensitivity: FieldSensitivity   // public | personal | regulated | sensitive
  legalNote?: string     // e.g. "Dle § 2081 NOZ musí být sjednána písemně"
  placeholder?: string
  options?: SelectOption[]        // for type: 'select'
  validation?: FieldValidation    // min/max, regex, custom message
}
```

### 3.4 Three-Layer Validation

```
Layer 1 — UI          Real-time, per-field. Required checks, type coercion, regex.
Layer 2 — Business    On blur/submit. Cross-field constraints with Czech law basis.
                      e.g. "contractDate must be before handoverDate (§ 2090 NOZ)"
Layer 3 — Generation  Pre-API gate. Decides generation mode:
                      complete | draft | review-needed
```

`GenerationReadiness` is what the API returns alongside the contract text — it tells the frontend whether to show a warning banner.

### 3.5 Structured API Response

The endpoint returns a typed object, never raw text:

```typescript
interface GenerateContractResponse {
  schemaId: string
  mode: GenerationMode            // 'complete' | 'draft' | 'review-needed'
  contractText: string
  warnings: ContractWarning[]     // e.g. missing optional clauses
  missingFields: string[]         // field IDs that would improve the contract
  legalBasis: string[]            // citations extracted from the generation
  generatedAt: string             // ISO timestamp
}
```

---

## 4. Module Map

| File | Responsibility |
|------|---------------|
| `lib/contracts/types.ts` | All TypeScript interfaces — single import for entire system |
| `lib/contracts/schemas/kupniSmlouva.ts` | Kúpní smlouva (§ 2079 NOZ) |
| `lib/contracts/schemas/pracovniSmlouva.ts` | Pracovní smlouva (§ 33 ZP) |
| `lib/contracts/schemas/najemniSmlouva.ts` | Nájemní smlouva (§ 2235 NOZ) |
| `lib/contracts/schemas/smlouvaODilo.ts` | Smlouva o dílo (§ 2586 NOZ) |
| `lib/contracts/schemas/ndaSmlouva.ts` | NDA / Smlouva o mlčenlivosti (§ 504 NOZ) |
| `lib/contracts/contractSchemas.ts` | Registry — maps schemaId → ContractSchema |
| `lib/contracts/systemPrompt.ts` | Czech-law-only system prompt constant |
| `lib/contracts/promptBuilder.ts` | Normalized data + schema → LLM user prompt |
| `lib/contracts/validators.ts` | All 3 validation layers |
| `app/api/generate-contract/route.ts` | Next.js App Router POST endpoint |
| `components/contract/DynamicContractForm.tsx` | Schema → rendered form (client component) |

---

## 5. PromptBuilder Modes

| Mode | Trigger | Behaviour |
|------|---------|-----------|
| `complete` | All required + key optional fields filled | Full contract, all clauses present |
| `draft` | All required fields filled, some optional missing | Contract with `[DOPLNIT]` placeholders |
| `review-needed` | Required fields missing or conflicting | Skeleton + inline `⚠️ ZKONTROLOVAT` markers |

The mode is determined by Layer 3 validation before the LLM call. The prompt builder uses the mode to set the appropriate LLM instruction prefix.

---

## 6. Czech Law Grounding

All schemas reference explicit statutory sections. The system prompt in `systemPrompt.ts` enforces:
- Primary: zák. č. 89/2012 Sb. (NOZ)
- Labour: zák. č. 262/2006 Sb. (ZP)
- Corporate: zák. č. 90/2012 Sb. (ZOK)
- Interpretation: judikatury Nejvyššího soudu ČR
- Explicit prohibition: never use Slovak terminology, Slovak statutes, or Slovak contract templates

---

## 7. Security & GDPR

- Fields tagged `sensitivity: 'personal'` (rodné číslo, IČO, address) are logged with reduced verbosity
- Fields tagged `sensitivity: 'sensitive'` are never logged
- No PII stored in API logs beyond schema ID and generation mode
- Server-side only: API key never reaches the browser

---

## 8. Future Extensibility

- Add new contract type: create `lib/contracts/schemas/newType.ts` + register in `contractSchemas.ts`. Zero changes to the form renderer, validator, or API route.
- Multi-language support: add `labelCs`/`labelEn` to `ContractField`, swap in DynamicContractForm based on locale
- PDF export: consume `contractText` from the response in a separate `/api/export-pdf` route
- Version migration: `schemaId` carries version, registry can maintain multiple versions simultaneously
