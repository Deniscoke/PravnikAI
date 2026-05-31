/**
 * Structured Legal Quality Gate — Stage 2 of the generation pipeline.
 * Czech law (CZ).
 *
 * Stage 2 returns a machine-readable JSON verdict that drives hard routing decisions:
 *   - pass    → mode stays as-is
 *   - warn    → mode may be downgraded to 'draft'
 *   - block   → mode forced to 'review-needed'
 *
 * Each contract type has an essential-clause checklist.
 * The Stage 2 LLM compares the generated draft against that checklist and
 * reports findings. Warning labels come from the CZ prompt bundle.
 */

import type { GenerationMode, Jurisdiction } from './types'
import { getPromptBundle } from './prompts'

// ─── Quality Gate Result Schema ──────────────────────────────────────────────

export type QualityStatus = 'pass' | 'warn' | 'block'

export interface QualityGateResult {
  status: QualityStatus
  recommendedMode: GenerationMode
  summary: string
  missingEssentialFacts: string[]
  missingEssentialClauses: string[]
  ambiguities: string[]
  contradictions: string[]
  undefinedOrInconsistentTerms: string[]
  riskyAssumptions: string[]
  executionRisks: string[]
  /** Jurisdiction-specific statutory or regulatory risks. */
  jurisdictionSpecificRisks: string[]
  consumerOrRegulatoryFlags: string[]
  suggestedFixes: string[]
  /** The corrected contract text (if model made improvements). */
  correctedText?: string
}

// ─── Essential Clause Checklists (CZ) ───────────────────────────────────────

/**
 * Each entry lists the clauses that MUST be present in a valid draft.
 * Lookup key: `CZ:${schemaId}`.
 */
export const ESSENTIAL_CLAUSES: Record<string, string[]> = {
  'CZ:kupni-smlouva-v1': [
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
  'CZ:pracovni-smlouva-v1': [
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
  'CZ:najemni-smlouva-byt-v1': [
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
  'CZ:smlouva-o-dilo-v1': [
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
  'CZ:nda-smlouva-v1': [
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

/** Returns essential clauses for a schema; falls back to generic CZ list. */
export function getEssentialClauses(schemaId: string, jurisdiction: Jurisdiction = 'CZ'): string[] {
  const key = `${jurisdiction}:${schemaId}`
  if (ESSENTIAL_CLAUSES[key]) return ESSENTIAL_CLAUSES[key]
  // Backward compatibility — older callers passed only schemaId for CZ
  if (jurisdiction === 'CZ' && ESSENTIAL_CLAUSES[schemaId]) return ESSENTIAL_CLAUSES[schemaId]
  return getPromptBundle(jurisdiction).genericEssentialClauses
}

// ─── Structured Quality Gate System Prompt ───────────────────────────────────

/**
 * Builds the Czech system prompt for Stage 2 structured review.
 * Jurisdiction parameter kept for backward compatibility.
 */
export function buildQualityGatePrompt(
  schemaId: string,
  schemaName: string,
  jurisdiction: Jurisdiction = 'CZ',
): string {
  const clauses = getEssentialClauses(schemaId, jurisdiction)
  const clauseList = clauses.map((c, i) => `  ${i + 1}. ${c}`).join('\n')
  return buildCzQualityPrompt(schemaName, clauseList)
}

function buildCzQualityPrompt(schemaName: string, clauseList: string): string {
  return `Jsi zkušený český transakční právník provádějící strukturovanou kontrolu kvality návrhu smlouvy.

## Tvůj úkol

Dostaneš návrh české smlouvy typu „${schemaName}". Proveď důkladnou kontrolu a vrať výsledek jako JSON objekt.

## Kontrolní body

### 1. Chybějící esenciální fakta — vymyšlená data, chybějící údaje bez kterých smlouva nefunguje.
### 2. Rizikové domněnky — předpokládá model nesdělená fakta? Vágní formulace?
### 3. Konzistence definovaných pojmů — definice + důsledné použití.
### 4. Vnitřní rozpory — protiřečí si klauzule, data, částky, lhůty?
### 5. Esenciální klauzule pro typ „${schemaName}"
Zkontroluj přítomnost těchto klauzulí:
${clauseList}
### 6. Nejednoznačnosti — formulace připouštějící více výkladů?
### 7. Vymahatelnost a realizace — je smlouva prakticky proveditelná?
### 8. Rizika dle českého práva — § citace správně? Kogentní ustanovení? Spotřebitel?

## Pravidla pro hodnocení

- **status = "pass"**: Žádné závažné problémy. Smlouva profesionálně použitelná.
- **status = "warn"**: Drobné nedostatky nebo chybějící doplňkové klauzule. Použitelná jako návrh.
- **status = "block"**: Závažné problémy — chybějící esenciální data, vnitřní rozpory, hallucinations, chybějící klíčové klauzule.

## Pravidla pro recommendedMode

- pass → "complete"
- warn → "draft"
- block → "review-needed"

## Oprava textu

Pokud nalezneš opravitelné problémy (BEZ vymýšlení dat) — oprav je a vlož opravený text do "correctedText".
NIKDY nevymýšlej chybějící údaje — místo toho vlož [DOPLNIT: popis].

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
  "jurisdictionSpecificRisks": [],
  "consumerOrRegulatoryFlags": [],
  "suggestedFixes": [],
  "correctedText": "opravený text smlouvy (pouze pokud byly provedeny opravy)"
}

Pole bez nálezů vrať jako prázdné []. NIKDY nevymýšlej problémy. Piš všechny textové hodnoty v češtině.`
}

// ─── Decision Logic ──────────────────────────────────────────────────────────

export function applyQualityGateDecision(
  originalMode: GenerationMode,
  gate: QualityGateResult,
): GenerationMode {
  const PRIORITY: Record<GenerationMode, number> = {
    'complete': 0,
    'draft': 1,
    'review-needed': 2,
  }

  const gateSuggestedMode = gate.recommendedMode
  const effectiveMode = PRIORITY[gateSuggestedMode] > PRIORITY[originalMode]
    ? gateSuggestedMode
    : originalMode

  return effectiveMode
}

/**
 * Extracts warnings from the quality gate result to surface to the user.
 * Labels come from the CZ prompt bundle.
 */
export function extractQualityWarnings(
  gate: QualityGateResult,
  jurisdiction: Jurisdiction = 'CZ',
): Array<{ code: string; message: string }> {
  const warnings: Array<{ code: string; message: string }> = []
  const lang = getPromptBundle(jurisdiction).qualityGateLang

  if (gate.missingEssentialFacts.length > 0) {
    warnings.push({
      code: 'QUALITY_MISSING_FACTS',
      message: `${lang.missingFactsLabel}: ${gate.missingEssentialFacts.join('; ')}`,
    })
  }

  if (gate.missingEssentialClauses.length > 0) {
    warnings.push({
      code: 'QUALITY_MISSING_CLAUSES',
      message: `${lang.missingClausesLabel}: ${gate.missingEssentialClauses.join('; ')}`,
    })
  }

  if (gate.contradictions.length > 0) {
    warnings.push({
      code: 'QUALITY_CONTRADICTIONS',
      message: `${lang.contradictionsLabel}: ${gate.contradictions.join('; ')}`,
    })
  }

  if (gate.undefinedOrInconsistentTerms.length > 0) {
    warnings.push({
      code: 'QUALITY_TERMS',
      message: `${lang.termsLabel}: ${gate.undefinedOrInconsistentTerms.join('; ')}`,
    })
  }

  if (gate.riskyAssumptions.length > 0) {
    warnings.push({
      code: 'QUALITY_ASSUMPTIONS',
      message: `${lang.assumptionsLabel}: ${gate.riskyAssumptions.join('; ')}`,
    })
  }

  if (gate.jurisdictionSpecificRisks.length > 0) {
    warnings.push({
      code: 'QUALITY_LEGAL_RISKS',
      message: `${lang.legalRisksLabel}: ${gate.jurisdictionSpecificRisks.join('; ')}`,
    })
  }

  if (gate.consumerOrRegulatoryFlags.length > 0) {
    warnings.push({
      code: 'QUALITY_REGULATORY',
      message: `${lang.regulatoryLabel}: ${gate.consumerOrRegulatoryFlags.join('; ')}`,
    })
  }

  return warnings
}

// ─── Response Parsing ────────────────────────────────────────────────────────

function makeFallback(jurisdiction: Jurisdiction): QualityGateResult {
  return {
    status: 'warn',
    recommendedMode: 'draft',
    summary: getPromptBundle(jurisdiction).qualityGateLang.fallbackSummary,
    missingEssentialFacts: [],
    missingEssentialClauses: [],
    ambiguities: [],
    contradictions: [],
    undefinedOrInconsistentTerms: [],
    riskyAssumptions: [],
    executionRisks: [],
    jurisdictionSpecificRisks: [],
    consumerOrRegulatoryFlags: [],
    suggestedFixes: [],
  }
}

/**
 * Parses the raw LLM JSON response into a typed QualityGateResult.
 * Defensively normalizes all fields — garbage in, safe defaults out.
 *
 * Backward compatible: legacy responses with `czechLawSpecificRisks`
 * are mapped onto `jurisdictionSpecificRisks`.
 */
export function parseQualityGateResponse(raw: string, jurisdiction: Jurisdiction = 'CZ'): QualityGateResult {
  const fallback = makeFallback(jurisdiction)

  let parsed: Record<string, unknown>
  try {
    const cleaned = raw.replace(/^```json?\s*\n?/i, '').replace(/\n?```\s*$/i, '').trim()
    parsed = JSON.parse(cleaned)
  } catch {
    return fallback
  }

  if (typeof parsed !== 'object' || parsed === null) {
    return fallback
  }

  const status = validateStatus(parsed.status)
  const recommendedMode = validateMode(parsed.recommendedMode)

  const jurisdictionSpecificRisks = safeStringArray(
    parsed.jurisdictionSpecificRisks ?? parsed.czechLawSpecificRisks,
  )

  return {
    status,
    recommendedMode,
    summary: typeof parsed.summary === 'string' ? parsed.summary : fallback.summary,
    missingEssentialFacts: safeStringArray(parsed.missingEssentialFacts),
    missingEssentialClauses: safeStringArray(parsed.missingEssentialClauses),
    ambiguities: safeStringArray(parsed.ambiguities),
    contradictions: safeStringArray(parsed.contradictions),
    undefinedOrInconsistentTerms: safeStringArray(parsed.undefinedOrInconsistentTerms),
    riskyAssumptions: safeStringArray(parsed.riskyAssumptions),
    executionRisks: safeStringArray(parsed.executionRisks),
    jurisdictionSpecificRisks,
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
  return 'warn'
}

function validateMode(v: unknown): GenerationMode {
  if (v === 'complete' || v === 'draft' || v === 'review-needed') return v
  return 'draft'
}

function safeStringArray(v: unknown): string[] {
  if (!Array.isArray(v)) return []
  return v.filter((item): item is string => typeof item === 'string' && item.trim().length > 0)
}
