/**
 * Structured Legal Quality Gate — Stage 2 of the generation pipeline.
 *
 * Instead of a freeform text self-check, Stage 2 now returns a machine-readable
 * JSON verdict that drives hard routing decisions:
 *   - pass    → mode stays as-is
 *   - warn    → mode may be downgraded to 'draft'
 *   - block   → mode forced to 'review-needed'
 *
 * Each contract type has an essential-clause checklist. The LLM review
 * compares the generated draft against that checklist and reports findings.
 */

import type { GenerationMode } from './types'

// ─── Quality Gate Result Schema ──────────────────────────────────────────────

export type QualityStatus = 'pass' | 'warn' | 'block'

export interface QualityGateResult {
  /** Overall verdict: pass / warn / block */
  status: QualityStatus
  /** What mode the quality gate recommends */
  recommendedMode: GenerationMode
  /** Short Czech summary of findings */
  summary: string
  /** Essential facts that were NOT in the input but the contract needs */
  missingEssentialFacts: string[]
  /** Key clauses required for this contract type that are absent */
  missingEssentialClauses: string[]
  /** Formulations that allow multiple interpretations */
  ambiguities: string[]
  /** Clauses that contradict each other */
  contradictions: string[]
  /** Defined terms used inconsistently or left undefined */
  undefinedOrInconsistentTerms: string[]
  /** Assumptions the model inserted that were not in the input */
  riskyAssumptions: string[]
  /** Practical enforceability / execution risks */
  executionRisks: string[]
  /** Czech-law-specific regulatory or statutory risks */
  czechLawSpecificRisks: string[]
  /** Consumer protection or regulatory compliance flags */
  consumerOrRegulatoryFlags: string[]
  /** Concrete fixes the model suggests */
  suggestedFixes: string[]
  /** The corrected contract text (if model made improvements) */
  correctedText?: string
}

// ─── Essential Clause Checklists (per contract type) ─────────────────────────

/**
 * Each entry lists the clauses that MUST be present in a valid draft.
 * The quality gate prompt instructs the LLM to check the draft against these.
 * If a clause is missing, it's reported in missingEssentialClauses.
 */
export const ESSENTIAL_CLAUSES: Record<string, string[]> = {
  'kupni-smlouva-v1': [
    'Identifikace smluvních stran (prodávající + kupující)',
    'Předmět koupě — dostatečně určitý popis',
    'Kupní cena — přesná výše a způsob úhrady',
    'Přechod vlastnického práva',
    'Předání předmětu koupě',
    'Odpovědnost za vady (§ 2099–2112 NOZ)',
    'Přechod nebezpečí škody na věci (§ 2121 NOZ)',
    'Závěrečná ustanovení a rozhodné právo',
    'Podpisové bloky',
  ],

  'pracovni-smlouva-v1': [
    'Identifikace zaměstnavatele (firma, IČO, sídlo)',
    'Identifikace zaměstnance (jméno, bydliště, datum narození)',
    'Druh práce (§ 34 odst. 1 písm. a) ZP)',
    'Místo výkonu práce (§ 34 odst. 1 písm. b) ZP)',
    'Den nástupu do práce (§ 34 odst. 1 písm. c) ZP)',
    'Mzda / plat — výše a způsob výplaty',
    'Pracovní doba',
    'Výpovědní doba',
    'Podpisové bloky',
  ],

  'najemni-smlouva-byt-v1': [
    'Identifikace pronajímatele a nájemce',
    'Označení bytu — adresa, dispozice, podlaží',
    'Výše měsíčního nájemného',
    'Splatnost a způsob platby nájemného',
    'Jistota (kauce) — max. trojnásobek měsíčního nájemného (§ 2254 NOZ)',
    'Doba trvání nájmu (určitá / neurčitá)',
    'Výpovědní podmínky (§ 2287–2291 NOZ)',
    'Práva a povinnosti stran (§ 2257–2267 NOZ)',
    'Podpisové bloky',
  ],

  'smlouva-o-dilo-v1': [
    'Identifikace objednatele a zhotovitele',
    'Předmět díla — dostatečně určitý popis (§ 2587 NOZ)',
    'Cena díla — pevná / odhadní / hodinová sazba',
    'Termín zhotovení',
    'Předání a převzetí díla',
    'Odpovědnost za vady díla (§ 2615 NOZ)',
    'Platební podmínky',
    'Závěrečná ustanovení a rozhodné právo',
    'Podpisové bloky',
  ],

  'nda-smlouva-v1': [
    'Identifikace smluvních stran (poskytovatel + příjemce)',
    'Účel smlouvy — důvod sdílení důvěrných informací',
    'Definice důvěrných informací (odkaz na § 504 NOZ)',
    'Výjimky z důvěrnosti',
    'Povinnosti přijímající strany',
    'Doba trvání závazku mlčenlivosti',
    'Sankce za porušení (smluvní pokuta)',
    'Vrácení / zničení materiálů po ukončení',
    'Závěrečná ustanovení a rozhodné právo',
    'Podpisové bloky',
  ],
}

/** Returns essential clauses for a schema, or a generic fallback. */
export function getEssentialClauses(schemaId: string): string[] {
  return ESSENTIAL_CLAUSES[schemaId] ?? [
    'Identifikace smluvních stran',
    'Předmět smlouvy',
    'Práva a povinnosti stran',
    'Závěrečná ustanovení',
    'Podpisové bloky',
  ]
}

// ─── Structured Quality Gate System Prompt ───────────────────────────────────

/**
 * Builds the system prompt for Stage 2 structured review.
 * The essential clause checklist is injected per-schema.
 */
export function buildQualityGatePrompt(schemaId: string, schemaName: string): string {
  const clauses = getEssentialClauses(schemaId)
  const clauseList = clauses.map((c, i) => `  ${i + 1}. ${c}`).join('\n')

  return `Jsi zkušený český transakční právník provádějící strukturovanou kontrolu kvality návrhu smlouvy.

## Tvůj úkol

Dostaneš návrh české smlouvy typu „${schemaName}". Proveď důkladnou kontrolu a vrať výsledek jako JSON objekt.

## Kontrolní body

### 1. Chybějící esenciální fakta
- Vložil model vymyšlená data (jména, adresy, data, částky), která NEBYLA v zadání?
- Chybí údaje, bez kterých smlouva nemůže fungovat?

### 2. Rizikové domněnky
- Předpokládá model fakta, která mu nebyla sdělena?
- Jsou v textu formulace typu „jak bylo dohodnuto", „dle dohody stran" bez konkrétního obsahu?

### 3. Konzistence definovaných pojmů
- Jsou definované pojmy (s velkým písmenem) definovány při prvním použití?
- Jsou používány konzistentně v celém dokumentu?
- Nejsou použity nedefinované pojmy?

### 4. Vnitřní rozpory
- Protiřečí si některé klauzule?
- Jsou data, částky, lhůty a termíny konzistentní?

### 5. Esenciální klauzule pro typ „${schemaName}"
Zkontroluj přítomnost těchto klauzulí:
${clauseList}

### 6. Nejednoznačnosti
- Existují formulace připouštějící více výkladů?
- Je text příliš vágní pro profesionální použití?

### 7. Vymahatelnost a realizace
- Je smlouva prakticky realizovatelná?
- Jsou mechanismy porušení a nápravy dostatečné?

### 8. Rizika dle českého práva
- Jsou zákonné citace (§) správné?
- Jsou dodržena kogentní ustanovení?
- Existují spotřebitelská nebo regulatorní rizika?

## Pravidla pro hodnocení

- **status = "pass"**: Žádné závažné problémy. Smlouva je profesionálně použitelná.
- **status = "warn"**: Drobné nedostatky nebo chybějící doplňkové klauzule. Smlouva je použitelná jako návrh.
- **status = "block"**: Závažné problémy — chybějící esenciální data, vnitřní rozpory, hallucinations, nebo chybějící klíčové klauzule. Smlouva NESMÍ být vrácena jako hotová.

## Pravidla pro recommendedMode

- Pokud status = "pass" → recommendedMode = "complete"
- Pokud status = "warn" → recommendedMode = "draft"
- Pokud status = "block" → recommendedMode = "review-needed"

## Oprava textu

Pokud nalezneš problémy, které lze opravit BEZ vymýšlení dat:
- Oprav je a vlož opravený text do pole "correctedText"
- NIKDY nevymýšlej chybějící údaje — místo toho vlož [DOPLNIT: popis]

Pokud je text v pořádku, pole "correctedText" vynech.

## Výstupní formát — STRIKTNĚ JSON

Vrať POUZE platný JSON objekt s touto strukturou (žádný text před ani za JSON):

{
  "status": "pass | warn | block",
  "recommendedMode": "complete | draft | review-needed",
  "summary": "Stručné české shrnutí nálezů (1–3 věty)",
  "missingEssentialFacts": [],
  "missingEssentialClauses": [],
  "ambiguities": [],
  "contradictions": [],
  "undefinedOrInconsistentTerms": [],
  "riskyAssumptions": [],
  "executionRisks": [],
  "czechLawSpecificRisks": [],
  "consumerOrRegulatoryFlags": [],
  "suggestedFixes": [],
  "correctedText": "opravený text smlouvy (pouze pokud byly provedeny opravy)"
}

Pole, která nemají nálezy, vrať jako prázdné pole [].
NIKDY nevymýšlej problémy, které neexistují.
Piš všechny textové hodnoty v češtině.`
}

// ─── Decision Logic ──────────────────────────────────────────────────────────

/**
 * Applies hard routing rules to the quality gate result.
 * Returns the effective mode after downgrade (never upgrades).
 *
 * Rules:
 *   1. block → always force 'review-needed'
 *   2. warn → downgrade 'complete' to 'draft', leave 'draft' or 'review-needed' as-is
 *   3. pass → keep the original mode from Stage 1 validation
 *   4. Never upgrade: if Stage 1 said 'review-needed', quality gate cannot make it 'complete'
 */
export function applyQualityGateDecision(
  originalMode: GenerationMode,
  gate: QualityGateResult,
): GenerationMode {
  // Priority order: review-needed > draft > complete
  const PRIORITY: Record<GenerationMode, number> = {
    'complete': 0,
    'draft': 1,
    'review-needed': 2,
  }

  // The gate can only downgrade, never upgrade
  const gateSuggestedMode = gate.recommendedMode
  const effectiveMode = PRIORITY[gateSuggestedMode] > PRIORITY[originalMode]
    ? gateSuggestedMode
    : originalMode

  return effectiveMode
}

/**
 * Extracts warnings from the quality gate result to surface to the user.
 * Only includes non-empty findings.
 */
export function extractQualityWarnings(gate: QualityGateResult): Array<{ code: string; message: string }> {
  const warnings: Array<{ code: string; message: string }> = []

  if (gate.missingEssentialFacts.length > 0) {
    warnings.push({
      code: 'QUALITY_MISSING_FACTS',
      message: `Chybějící esenciální údaje: ${gate.missingEssentialFacts.join('; ')}`,
    })
  }

  if (gate.missingEssentialClauses.length > 0) {
    warnings.push({
      code: 'QUALITY_MISSING_CLAUSES',
      message: `Chybějící klíčové klauzule: ${gate.missingEssentialClauses.join('; ')}`,
    })
  }

  if (gate.contradictions.length > 0) {
    warnings.push({
      code: 'QUALITY_CONTRADICTIONS',
      message: `Nalezené rozpory: ${gate.contradictions.join('; ')}`,
    })
  }

  if (gate.undefinedOrInconsistentTerms.length > 0) {
    warnings.push({
      code: 'QUALITY_TERMS',
      message: `Nekonzistentní pojmy: ${gate.undefinedOrInconsistentTerms.join('; ')}`,
    })
  }

  if (gate.riskyAssumptions.length > 0) {
    warnings.push({
      code: 'QUALITY_ASSUMPTIONS',
      message: `Rizikové domněnky modelu: ${gate.riskyAssumptions.join('; ')}`,
    })
  }

  if (gate.czechLawSpecificRisks.length > 0) {
    warnings.push({
      code: 'QUALITY_LEGAL_RISKS',
      message: `Právní rizika: ${gate.czechLawSpecificRisks.join('; ')}`,
    })
  }

  if (gate.consumerOrRegulatoryFlags.length > 0) {
    warnings.push({
      code: 'QUALITY_REGULATORY',
      message: `Regulatorní upozornění: ${gate.consumerOrRegulatoryFlags.join('; ')}`,
    })
  }

  return warnings
}

// ─── Response Parsing ────────────────────────────────────────────────────────

/** Default fallback when Stage 2 parsing fails entirely. */
const FALLBACK_RESULT: QualityGateResult = {
  status: 'warn',
  recommendedMode: 'draft',
  summary: 'Kontrola kvality nebyla provedena — vrácen jako návrh z bezpečnostních důvodů.',
  missingEssentialFacts: [],
  missingEssentialClauses: [],
  ambiguities: [],
  contradictions: [],
  undefinedOrInconsistentTerms: [],
  riskyAssumptions: [],
  executionRisks: [],
  czechLawSpecificRisks: [],
  consumerOrRegulatoryFlags: [],
  suggestedFixes: [],
}

/**
 * Parses the raw LLM JSON response into a typed QualityGateResult.
 * Defensively normalizes all fields — garbage in, safe defaults out.
 * Returns the fallback result if parsing fails entirely.
 */
export function parseQualityGateResponse(raw: string): QualityGateResult {
  let parsed: Record<string, unknown>
  try {
    // Handle possible markdown code fences around JSON
    const cleaned = raw.replace(/^```json?\s*\n?/i, '').replace(/\n?```\s*$/i, '').trim()
    parsed = JSON.parse(cleaned)
  } catch {
    return { ...FALLBACK_RESULT }
  }

  if (typeof parsed !== 'object' || parsed === null) {
    return { ...FALLBACK_RESULT }
  }

  const status = validateStatus(parsed.status)
  const recommendedMode = validateMode(parsed.recommendedMode)

  return {
    status,
    recommendedMode,
    summary: typeof parsed.summary === 'string' ? parsed.summary : FALLBACK_RESULT.summary,
    missingEssentialFacts: safeStringArray(parsed.missingEssentialFacts),
    missingEssentialClauses: safeStringArray(parsed.missingEssentialClauses),
    ambiguities: safeStringArray(parsed.ambiguities),
    contradictions: safeStringArray(parsed.contradictions),
    undefinedOrInconsistentTerms: safeStringArray(parsed.undefinedOrInconsistentTerms),
    riskyAssumptions: safeStringArray(parsed.riskyAssumptions),
    executionRisks: safeStringArray(parsed.executionRisks),
    czechLawSpecificRisks: safeStringArray(parsed.czechLawSpecificRisks),
    consumerOrRegulatoryFlags: safeStringArray(parsed.consumerOrRegulatoryFlags),
    suggestedFixes: safeStringArray(parsed.suggestedFixes),
    ...(typeof parsed.correctedText === 'string' && parsed.correctedText.trim().length > 50
      ? { correctedText: parsed.correctedText }
      : {}),
  }
}

// ─── Internal Helpers ────────────────────────────────────────────────────────

function validateStatus(v: unknown): QualityStatus {
  if (v === 'pass' || v === 'warn' || v === 'block') return v
  return 'warn' // safe default — not pass, not block
}

function validateMode(v: unknown): GenerationMode {
  if (v === 'complete' || v === 'draft' || v === 'review-needed') return v
  return 'draft' // safe default
}

function safeStringArray(v: unknown): string[] {
  if (!Array.isArray(v)) return []
  return v.filter((item): item is string => typeof item === 'string' && item.trim().length > 0)
}
