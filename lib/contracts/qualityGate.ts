/**
 * Structured Legal Quality Gate — Stage 2 of the generation pipeline.
 * Multi-jurisdiction (CZ / DE / UK).
 *
 * Stage 2 returns a machine-readable JSON verdict that drives hard routing decisions:
 *   - pass    → mode stays as-is
 *   - warn    → mode may be downgraded to 'draft'
 *   - block   → mode forced to 'review-needed'
 *
 * Each contract type has an essential-clause checklist *per jurisdiction*.
 * The Stage 2 LLM compares the generated draft against that checklist and
 * reports findings. Prompts and warning labels are localized via the prompt
 * bundle (lib/contracts/prompts/{cz,de,uk}.ts).
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

// ─── Essential Clause Checklists (per contract type & jurisdiction) ──────────

/**
 * Each entry lists the clauses that MUST be present in a valid draft.
 * Lookup key: `${jurisdiction}:${schemaId}`.
 */
export const ESSENTIAL_CLAUSES: Record<string, string[]> = {
  // ── Czech Republic (CZ) ─────────────────────────────────────────────────
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

  // ── Germany (DE) ────────────────────────────────────────────────────────
  'DE:kaufvertrag-v1': [
    'Identifikation der Vertragsparteien (Verkäufer + Käufer)',
    'Vertragsgegenstand — hinreichend bestimmte Beschreibung (§ 433 BGB)',
    'Kaufpreis — Höhe und Zahlungsweise',
    'Eigentumsübergang (§ 929 BGB)',
    'Übergabe der Kaufsache',
    'Mängelhaftung (§§ 434–442 BGB)',
    'Gefahrübergang (§ 446 BGB)',
    'Schlussbestimmungen und Rechtswahl',
    'Unterschriftsblöcke',
  ],
  'DE:arbeitsvertrag-v1': [
    'Identifikation des Arbeitgebers (Firma, HRB, Sitz)',
    'Identifikation des Arbeitnehmers (Name, Wohnsitz, Geburtsdatum)',
    'Tätigkeit / Stellenbeschreibung (§ 2 NachwG)',
    'Arbeitsort (§ 2 NachwG)',
    'Beginn des Arbeitsverhältnisses',
    'Vergütung — Höhe und Auszahlungsweise (MiLoG-Konformität)',
    'Arbeitszeit',
    'Probezeit und Kündigungsfristen (§ 622 BGB)',
    'Urlaubsanspruch (BUrlG)',
    'Unterschriftsblöcke',
  ],
  'DE:mietvertrag-v1': [
    'Identifikation der Vertragsparteien (Vermieter + Mieter)',
    'Beschreibung der Mietsache — Adresse, Wohnungsgröße, Lage',
    'Höhe der Miete (Kalt-/Warmmiete)',
    'Fälligkeit und Zahlungsweise',
    'Kaution — höchstens drei Monatsmieten (§ 551 BGB)',
    'Mietdauer (befristet / unbefristet)',
    'Kündigung (§§ 568, 573, 573c BGB)',
    'Betriebskosten (BetrKV)',
    'Unterschriftsblöcke',
  ],
  'DE:werkvertrag-v1': [
    'Identifikation der Vertragsparteien (Besteller + Unternehmer)',
    'Werkbeschreibung — hinreichend bestimmte Leistung (§ 631 BGB)',
    'Vergütung — Pauschal- / Einheitspreis / Stundensatz',
    'Fertigstellungstermin',
    'Abnahme (§ 640 BGB)',
    'Mängelrechte und Gewährleistung (§§ 633–639 BGB)',
    'Zahlungsbedingungen',
    'Schlussbestimmungen und Rechtswahl',
    'Unterschriftsblöcke',
  ],
  'DE:de-nda-v1': [
    'Identifikation der Vertragsparteien (Offenlegender + Empfänger)',
    'Zweck der Vereinbarung — Anlass der Informationsweitergabe',
    'Definition vertraulicher Informationen (Bezug auf GeschGehG)',
    'Ausnahmen von der Vertraulichkeit',
    'Pflichten der empfangenden Partei',
    'Dauer der Geheimhaltungsverpflichtung',
    'Vertragsstrafe bei Verstoß',
    'Rückgabe / Vernichtung der Materialien nach Beendigung',
    'Schlussbestimmungen und Rechtswahl',
    'Unterschriftsblöcke',
  ],

  // ── United Kingdom (UK / E&W) ───────────────────────────────────────────
  'UK:sale-of-goods-v1': [
    'Identification of the parties (seller + buyer)',
    'Description of the goods — clear identification (s.13 Sale of Goods Act 1979)',
    'Price and payment terms',
    'Passing of property (Part III SGA 1979)',
    'Delivery — date, place, method',
    'Implied terms as to quality and fitness (s.14 SGA 1979 / Part 1 CRA 2015)',
    'Risk and insurance',
    'Boilerplate (governing law, jurisdiction, notices, severance)',
    'Execution blocks',
  ],
  'UK:employment-contract-v1': [
    'Identification of employer (registered name, company number, registered office)',
    'Identification of employee (full name, address, date of birth)',
    'Job title and duties',
    'Place of work',
    'Start date and continuous service date',
    'Pay — amount and payment frequency (NMW compliance)',
    'Hours of work and Working Time Regulations 1998',
    'Holiday entitlement',
    'Notice periods (s.86 Employment Rights Act 1996 minimums)',
    'Section 1 ERA 1996 written statement particulars',
    'Execution blocks',
  ],
  'UK:tenancy-ast-v1': [
    'Identification of landlord and tenant',
    'Description of the premises — full address',
    'Rent amount and payment terms',
    'Deposit — protected via an authorised tenancy deposit scheme (Housing Act 2004)',
    'Term of the tenancy (fixed term + statutory periodic)',
    'Termination — landlord notices under ss.8 & 21 Housing Act 1988',
    'Repair obligations (s.11 Landlord and Tenant Act 1985)',
    'Boilerplate (governing law, jurisdiction)',
    'Execution blocks',
  ],
  'UK:services-agreement-v1': [
    'Identification of the parties (customer + supplier)',
    'Scope of services — sufficiently described (s.13 Supply of Goods and Services Act 1982)',
    'Fees — fixed / time-and-materials / milestones',
    'Performance dates and milestones',
    'Acceptance and remedies',
    'Warranties and limitation of liability (UCTA 1977 reasonableness)',
    'Payment terms',
    'Boilerplate (governing law, jurisdiction, notices, severance)',
    'Execution blocks',
  ],
  'UK:uk-nda-v1': [
    'Identification of the parties (disclosing + receiving)',
    'Purpose — reason for sharing the confidential information',
    'Definition of Confidential Information',
    'Permitted exceptions (public domain, prior knowledge, compelled disclosure)',
    'Obligations of the receiving party',
    'Term — duration of the confidentiality undertakings',
    'Remedies for breach (injunctive relief, damages)',
    'Return / destruction of materials on termination',
    'Boilerplate (governing law, jurisdiction)',
    'Execution blocks',
  ],
}

/** Returns essential clauses for a schema in a jurisdiction; falls back per-jurisdiction. */
export function getEssentialClauses(schemaId: string, jurisdiction: Jurisdiction = 'CZ'): string[] {
  const key = `${jurisdiction}:${schemaId}`
  if (ESSENTIAL_CLAUSES[key]) return ESSENTIAL_CLAUSES[key]
  // Backward compatibility — older callers passed only schemaId for CZ
  if (jurisdiction === 'CZ' && ESSENTIAL_CLAUSES[schemaId]) return ESSENTIAL_CLAUSES[schemaId]
  return getPromptBundle(jurisdiction).genericEssentialClauses
}

// ─── Structured Quality Gate System Prompt ───────────────────────────────────

/**
 * Builds the system prompt for Stage 2 structured review.
 * The essential clause checklist is injected per-schema and per-jurisdiction,
 * and the prompt copy is localized.
 */
export function buildQualityGatePrompt(
  schemaId: string,
  schemaName: string,
  jurisdiction: Jurisdiction = 'CZ',
): string {
  const clauses = getEssentialClauses(schemaId, jurisdiction)
  const clauseList = clauses.map((c, i) => `  ${i + 1}. ${c}`).join('\n')

  if (jurisdiction === 'DE') return buildDeQualityPrompt(schemaName, clauseList)
  if (jurisdiction === 'UK') return buildUkQualityPrompt(schemaName, clauseList)
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

function buildDeQualityPrompt(schemaName: string, clauseList: string): string {
  return `Du bist ein erfahrener deutscher Wirtschaftsanwalt, der eine strukturierte Qualitätsprüfung eines Vertragsentwurfs durchführt.

## Deine Aufgabe

Du erhältst den Entwurf eines deutschen Vertrages vom Typ „${schemaName}". Führe eine gründliche Prüfung durch und liefere das Ergebnis als JSON-Objekt zurück.

## Prüfungspunkte

### 1. Fehlende wesentliche Tatsachen — erfundene Daten, ohne die der Vertrag nicht funktioniert.
### 2. Risikobehaftete Annahmen — nimmt das Modell ungeklärte Tatsachen an? Vage Formulierungen?
### 3. Konsistenz definierter Begriffe — Definition + konsequente Verwendung.
### 4. Innere Widersprüche — widersprüchliche Klauseln, Daten, Beträge, Fristen?
### 5. Wesentliche Klauseln für „${schemaName}" — prüfe die Existenz folgender Klauseln:
${clauseList}
### 6. Mehrdeutigkeiten — Formulierungen mit mehreren Auslegungen?
### 7. Durchsetzbarkeit und Erfüllung — ist der Vertrag praktisch durchführbar?
### 8. Risiken nach deutschem Recht — sind §-Zitate korrekt? Zwingende Vorschriften? Verbraucherbezug? AGB-Kontrolle (§§ 307–309 BGB)?

## Bewertungsregeln

- **status = "pass"**: Keine ernsthaften Probleme. Vertrag professionell einsetzbar.
- **status = "warn"**: Kleinere Mängel oder fehlende ergänzende Klauseln. Als Entwurf einsetzbar.
- **status = "block"**: Ernste Probleme — fehlende wesentliche Daten, innere Widersprüche, Halluzinationen, fehlende Schlüsselklauseln.

## Regeln für recommendedMode

- pass → "complete"
- warn → "draft"
- block → "review-needed"

## Textkorrektur

Wenn korrigierbare Probleme (OHNE Daten zu erfinden) gefunden werden — korrigiere sie und füge den korrigierten Text in "correctedText" ein.
Erfinde NIEMALS fehlende Angaben — füge stattdessen [BITTE ERGÄNZEN: Beschreibung] ein.

## Ausgabeformat — STRIKT JSON

Gib AUSSCHLIESSLICH ein gültiges JSON-Objekt mit dieser Struktur zurück (kein Text davor/danach):

{
  "status": "pass | warn | block",
  "recommendedMode": "complete | draft | review-needed",
  "summary": "Kurze deutsche Zusammenfassung (1–3 Sätze)",
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
  "correctedText": "korrigierter Vertragstext (nur falls Korrekturen vorgenommen)"
}

Felder ohne Befunde als leeres [] zurückgeben. Erfinde NIEMALS Probleme. Alle Textwerte auf Deutsch.`
}

function buildUkQualityPrompt(schemaName: string, clauseList: string): string {
  return `You are an experienced English transactional solicitor running a structured quality review of a contract draft.

## Your task

You will receive an English-law contract draft of type "${schemaName}". Run a thorough review and return the result as a JSON object.

## Checks

### 1. Missing essential facts — invented data, missing items without which the contract cannot work.
### 2. Risky assumptions — has the model assumed undisclosed facts? Vague wording?
### 3. Defined-term consistency — definition on first use + consistent use thereafter.
### 4. Internal inconsistencies — contradictory clauses, dates, sums, deadlines?
### 5. Essential clauses for "${schemaName}" — verify the presence of:
${clauseList}
### 6. Ambiguity — wording open to multiple interpretations?
### 7. Practical enforceability — is the contract performable and enforceable?
### 8. English-law-specific risks — are statutory citations correct and current? Mandatory rules respected? UCTA 1977 / CRA 2015 compliance?

## Evaluation rules

- **status = "pass"**: No serious issues. Contract is fit for professional use.
- **status = "warn"**: Minor issues or missing supplementary clauses. Usable as a draft.
- **status = "block"**: Serious issues — missing essential data, internal contradictions, hallucinations, missing key clauses.

## recommendedMode rules

- pass → "complete"
- warn → "draft"
- block → "review-needed"

## Text correction

If you find fixable issues (WITHOUT inventing data) — fix them and place the corrected text in "correctedText".
NEVER invent missing items — substitute [TO COMPLETE: description] instead.

## Output format — STRICTLY JSON

Return ONLY a valid JSON object with this structure (no text before/after):

{
  "status": "pass | warn | block",
  "recommendedMode": "complete | draft | review-needed",
  "summary": "Short English summary (1–3 sentences)",
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
  "correctedText": "corrected contract text (only if corrections were made)"
}

Empty fields as []. NEVER invent issues. All string values in English.`
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
 * Labels are localized via the prompt bundle.
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
