# Contract Generator — Design Document
**Date:** 2026-03-18 · **Last updated:** 2026-03-25
**Status:** Production
**Jurisdiction:** Czech Republic (CZ)
**Stack:** Next.js 15 App Router · TypeScript · OpenAI API · Supabase · Stripe

---

## 1. Problem Statement

Czech/Slovak lawyers need to generate legally sound contracts in minutes, not hours. The system must:
- Produce contracts grounded exclusively in Czech law (NOZ, ZP, ZOK)
- Adapt the form UI to the selected contract type (different contracts need different fields)
- Validate data at three layers before sending anything to an LLM
- Run a structured legal quality gate (Stage 2) to catch hallucinations, contradictions, and missing clauses
- Run deterministic integrity checks (Stage 3b) for guaranteed factual correctness
- Return structured output — never raw text — so the frontend can display warnings and generation status

---

## 2. Architecture: Section-Driven Schema

`ContractSchema` is the single source of truth. Every module reads from it — nothing is hard-coded elsewhere.

```
ContractSchema
     │
     ├── DynamicContractForm   (schema → rendered form)
     ├── validators             (schema → 3-layer validation)
     ├── promptBuilder          (schema + data → LLM prompt, 7 sections A–G)
     └── /api/generate-contract (3-stage orchestration endpoint)
               │
               ├── Stage 1: Draft generation   (gpt-5.4)
               ├── Stage 2: Quality gate        (gpt-5.4, jsonMode, structured verdict)
               ├── Stage 3 (opt): Premium polish (gpt-5.4-pro)
               └── Stage 3b: Integrity check    (deterministic, no LLM)
```

**Why section-driven over flat registry or JSON Schema?**
- Flat registry: loses type safety, no compile-time guarantees on field names
- JSON Schema interpreter: high runtime overhead, poor DX for Czech-law-specific constraints
- Section-driven: TypeScript interfaces enforce correctness at compile time; Czech-law constraints live as first-class fields on `ContractField`, not in a separate rules layer

---

## 3. Data Model

### 3.1 Schema Metadata

```typescript
interface SchemaMetadata {
  schemaId: string          // e.g. "kupni-smlouva-v1"
  name: string              // "Kupní smlouva"
  version: string           // semver: "1.0.0"
  jurisdiction: 'CZ'        // hard-coded — no SK, no EU generic
  legalBasis: string[]      // e.g. ["§ 2079 NOZ", "zák. č. 89/2012 Sb."]
  sensitivity: SchemaSensitivity  // 'standard' | 'sensitive' | 'regulated'
  outputStructure: OutputStructure
  aiInstructions: string    // appended verbatim to system prompt for this type
  description: string       // shown in UI select/chip grid
  category: 'občanské' | 'obchodní' | 'pracovní' | 'nemovitosti'
}
```

### 3.2 Party Definition

Parties are defined per-schema, not hard-coded as partyA/partyB. Supports 2-party (most common), 3-party agreements, and named roles (prodávající/kupující, zaměstnavatel/zaměstnanec).

```typescript
interface ContractParty {
  id: string           // "prodavajici" | "kupujici" | custom
  label: string        // "Prodávající" (displayed in form)
  role: string         // legal role description
  requiredFields: PartyField[]
  optionalFields: PartyField[]
}
```

### 3.3 Field Types

`FieldType`: `text | textarea | select | date | number | checkbox | email | phone`

`FieldSensitivity`:
- `public` — safe to log
- `personal` — jméno, adresa, IČO — log minimally
- `regulated` — rodné číslo, bankovní účet — never log, requires legal basis
- `sensitive` — zdravotní stav, biometrika — GDPR special category

### 3.4 Three-Layer Validation

```
Layer 1 — UI          Real-time, per-field. Required checks, type coercion, regex.
Layer 2 — Business    On blur/submit. Cross-field constraints with Czech law basis.
                      e.g. "contractDate must be before handoverDate (§ 2090 NOZ)"
Layer 3 — Generation  Pre-API gate. Produces GenerationMode: complete | draft | review-needed
```

### 3.5 Drafting Posture

Optional field on `GenerateContractRequest` that controls clause selection and wording strategy:

```typescript
interface DraftingPosture {
  draftingSide?: string           // party ID whose interests to optimize
  riskTolerance?: 'conservative' | 'balanced' | 'aggressive'
  negotiationPosture?: 'client-protective' | 'neutral' | 'compromise'
  transactionContext?: 'B2B' | 'consumer' | 'employment' | 'other'
  mustIncludeClauses?: string[]   // verbatim or by description
  mustAvoidClauses?: string[]     // patterns to exclude
  specialCommercialNotes?: string // free-text commercial context
}
```

`transactionContext: 'consumer'` always activates mandatory Czech consumer-protection framing (§ 1810–1867 NOZ).

### 3.6 Structured API Response

```typescript
interface GenerateContractResponse {
  schemaId: string
  mode: GenerationMode            // 'complete' | 'draft' | 'review-needed'
  contractText: string
  warnings: ContractWarning[]     // structured findings from all 3 stages
  missingFields: string[]         // composite field IDs (sectionId.fieldId)
  legalBasis: string[]            // schema-level Czech statute citations
  generatedAt: string             // ISO 8601
}
```

---

## 4. Module Map

| File | Responsibility |
|------|---------------|
| `lib/contracts/types.ts` | All TypeScript interfaces — single import for entire system |
| `lib/contracts/schemas/kupniSmlouva.ts` | Kupní smlouva (§ 2079 NOZ) |
| `lib/contracts/schemas/pracovniSmlouva.ts` | Pracovní smlouva (§ 33 ZP) |
| `lib/contracts/schemas/najemniSmlouva.ts` | Nájemní smlouva (§ 2235 NOZ) |
| `lib/contracts/schemas/smlouvaODilo.ts` | Smlouva o dílo (§ 2586 NOZ) |
| `lib/contracts/schemas/ndaSmlouva.ts` | NDA / Smlouva o mlčenlivosti (§ 504 NOZ) |
| `lib/contracts/contractSchemas.ts` | Registry — maps schemaId → ContractSchema; resolves legacy slugs |
| `lib/contracts/systemPrompt.ts` | Czech-law-only system prompt + `SELF_CHECK_SYSTEM_PROMPT` |
| `lib/contracts/promptBuilder.ts` | 7-section prompt builder (A–G); `buildPrompt()` is the public API |
| `lib/contracts/validators.ts` | All 3 validation layers; `runFullValidation()` |
| `lib/contracts/qualityGate.ts` | Stage 2: structured JSON quality verdict, per-schema essential clause checklists |
| `lib/contracts/integrityValidator.ts` | Stage 3b: deterministic text-level integrity checks (no LLM) |
| `lib/llm/openaiClient.ts` | Provider-agnostic LLM wrapper; `generateText()` |
| `app/api/generate-contract/route.ts` | 3-stage orchestration endpoint |
| `app/api/review-contract/route.ts` | Contract review endpoint |
| `app/api/export-docx/route.ts` | DOCX export endpoint |
| `lib/billing/guard.ts` | Billing access guard — called at route entry |
| `lib/billing/plans.ts` | Plan definitions (free / pro tiers) |
| `lib/billing/stripe.ts` | Stripe client |
| `lib/rateLimit.ts` | IP-based rate limiter (10 req/min default) |
| `lib/supabase/actions.ts` | `saveGenerationToHistory()` — fire-and-forget history persistence |
| `components/contract/DynamicContractForm.tsx` | Schema → rendered form (client component) |

---

## 5. Generation Pipeline — `/api/generate-contract`

```
0a. Rate limit check (10 req/60s per IP)
0b. Billing guard (assertBillingAccess)
1.  Parse & validate request body
2.  Resolve schemaId (handles legacy slugs)
3.  Three-layer validation → GenerationMode
4.  Build prompts via buildPrompt() (sections A–G)

5.  STAGE 1: Draft generation
    └── gpt-5.4, temperature=0.1, max_tokens=16384, reasoning=high

6.  STAGE 2: Structured quality gate
    ├── gpt-5.4, jsonMode=true, reasoning=medium
    ├── Returns: QualityGateResult { status: pass|warn|block, ... }
    ├── Applies corrected text if provided
    └── Downgrades mode if block/warn (never upgrades)

7.  STAGE 3 (optional, premium=true): Final polish
    └── gpt-5.4-pro, SELF_CHECK_SYSTEM_PROMPT

7b. Integrity check (deterministic, always runs)
    ├── Counts [DOPLNIT] placeholders
    ├── Counts ⚠️ ZKONTROLOVAT markers
    ├── Checks essential keyword presence (per schema)
    ├── Checks signature block presence
    ├── Checks defined-term consistency
    ├── Checks consumer posture conflicts (§ 1813 NOZ)
    └── Downgrades mode if findings (never upgrades)

8.  Build warnings (validation + quality gate + integrity)
9.  Build response
10. Save to history (fire-and-forget, Supabase, non-blocking)
```

### Mode downgrade rules (never-upgrade invariant)

```
PRIORITY: complete(0) < draft(1) < review-needed(2)

Quality gate:
  block → review-needed
  warn  → complete becomes draft, draft/review-needed stay

Integrity validator:
  ZKONTROLOVAT markers > 0      → review-needed
  [DOPLNIT] > 2 in any mode     → review-needed
  [DOPLNIT] > 0 in complete     → draft
  error-level issues             → at least draft
```

---

## 6. PromptBuilder — 7 sections

| Section | Purpose |
|---------|---------|
| A) Kontext smlouvy | Contract type, legal basis, party roles |
| B) Vyplněné údaje | All provided values with legal notes; conditionals honoured |
| C) Chybějící údaje | CRITICAL (required) and SUPPLEMENTARY (optional) missing fields with `[DOPLNIT]` markers |
| D) Pokyny k generování | Mode-specific instructions + 5 inviolable safety rules |
| E) Požadovaná struktura | Required document sections in order + formatting rules |
| F) Závěrečná kontrola | Self-QA checklist (7–8 points) the model must run before finalizing |
| G) Zastoupení a strategie | DraftingPosture — only injected if posture has content; never overrides Section D safety rules |

---

## 7. Quality Gate — Stage 2

### Per-schema essential clause checklists (`qualityGate.ts`)

Each schema has a list of clauses the LLM must verify are present. Missing clauses → `missingEssentialClauses` in the result.

| Schema | Key required clauses |
|--------|---------------------|
| `kupni-smlouva-v1` | Přechod vlastnického práva, Odpovědnost za vady (§ 2099 NOZ), Přechod nebezpečí škody (§ 2121 NOZ) |
| `pracovni-smlouva-v1` | Druh práce (§ 34 ZP), Místo výkonu, Den nástupu, Mzda, Výpovědní doba |
| `najemni-smlouva-byt-v1` | Jistota max. 3× nájem (§ 2254 NOZ), Výpovědní podmínky (§ 2287–2291 NOZ) |
| `smlouva-o-dilo-v1` | Předmět díla (§ 2587 NOZ), Odpovědnost za vady (§ 2615 NOZ) |
| `nda-smlouva-v1` | Definice důvěrných informací (§ 504 NOZ), Sankce, Vrácení materiálů |

### QualityGateResult shape

```typescript
interface QualityGateResult {
  status: 'pass' | 'warn' | 'block'
  recommendedMode: GenerationMode
  summary: string
  missingEssentialFacts: string[]
  missingEssentialClauses: string[]
  ambiguities: string[]
  contradictions: string[]
  undefinedOrInconsistentTerms: string[]
  riskyAssumptions: string[]
  executionRisks: string[]
  czechLawSpecificRisks: string[]
  consumerOrRegulatoryFlags: string[]
  suggestedFixes: string[]
  correctedText?: string          // only if model made improvements
}
```

---

## 8. LLM Configuration

| Parameter | Value | Reason |
|-----------|-------|--------|
| Default model | `gpt-5.4` | Contract generation + quality gate JSON |
| Premium model | `gpt-5.4-pro` | Final text polish only (never for JSON) |
| Temperature | `0.1` | Legal text must be deterministic, not creative |
| Max tokens | `16384` | Supports thorough, complete contracts |
| Reasoning (Stage 1) | `high` | Maximum precision for legal drafting |
| Reasoning (Stage 2) | `medium` | Balanced for structured review |

---

## 9. Czech Law Grounding

All schemas reference explicit statutory sections. The system prompt enforces:
- Primary: zák. č. 89/2012 Sb. (NOZ)
- Labour: zák. č. 262/2006 Sb. (ZP)
- Corporate: zák. č. 90/2012 Sb. (ZOK)
- Consumer: zák. č. 634/1992 Sb.
- Interpretation: judikatury NS ČR + ÚS ČR
- Explicit prohibition: never use Slovak terminology, Slovak statutes, or Slovak contract templates

---

## 10. Security, GDPR & Billing

- Fields tagged `sensitivity: 'regulated'` (rodné číslo, bankovní účet) are never logged
- Fields tagged `sensitivity: 'sensitive'` are never logged
- API key lives server-side only — never reaches the browser
- Rate limiting: 10 requests per 60s per IP; responds with 429 + `Retry-After`
- Billing guard (`assertBillingAccess`) runs before all processing
- Generation history saved to Supabase (fire-and-forget, non-blocking)

---

## 11. Future Extensibility

- **New contract type:** create `lib/contracts/schemas/newType.ts` + register in `contractSchemas.ts` + add entry to `ESSENTIAL_CLAUSES` in `qualityGate.ts` + add entry to `ESSENTIAL_KEYWORDS` in `integrityValidator.ts`. Zero changes to the form renderer, validator, or API route.
- **Multi-language:** add `labelCs`/`labelEn` to `ContractField`, swap in `DynamicContractForm` based on locale
- **PDF export:** consume `contractText` from the response in a separate `/api/export-pdf` route (DOCX export already live at `/api/export-docx`)
- **Version migration:** `schemaId` carries version; registry can maintain multiple versions simultaneously
