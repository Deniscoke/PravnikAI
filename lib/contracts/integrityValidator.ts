/**
 * Deterministic Contract Integrity Validator — multi-jurisdiction (CZ / DE / UK)
 *
 * Runs non-LLM checks on the GENERATED contract text to catch issues
 * that the LLM quality gate may have missed. Complements Stage 2 —
 * does NOT replace it.
 *
 * All checks (placeholders, review markers, signature blocks, consumer-risk
 * patterns) are aware of the schema's jurisdiction so the right tokens and
 * heuristics are applied. Placeholder/review tokens come from the prompt
 * bundle (lib/contracts/prompts/{cz,de,uk}.ts).
 *
 * Routing rules (never-upgrade applies here too):
 *   - Unresolved placeholders > 0 in 'complete' mode → downgrade to 'draft'
 *   - Unresolved placeholders > 0 in 'draft' mode    → keep 'draft'
 *   - Review markers > 0                              → keep/force 'review-needed'
 *   - Missing signature block (error-level)           → at least 'draft'
 *   - Missing essential keyword (error-level)         → at least 'draft'
 *   - Consumer posture + suspicious clause            → 'review-needed'
 */

import type { GenerationMode, DraftingPosture, Jurisdiction } from './types'
import { getPromptBundle } from './prompts'

// ─── Public types ─────────────────────────────────────────────────────────────

export interface IntegrityIssue {
  code: string
  message: string
  severity: 'warning' | 'error'
}

export interface IntegrityResult {
  severity: 'pass' | 'warn' | 'block'
  unresolvedPlaceholders: number
  unresolvedReviewMarkers: number
  missingEssentialKeywords: string[]
  hasSignatureBlock: boolean
  issues: IntegrityIssue[]
}

// ─── Essential keyword registry (per jurisdiction & schema) ──────────────────

interface KeywordCheck {
  /** Lowercase substring or simple pattern to search for (case-insensitive) */
  term: string
  /** Human-readable description used in warnings (in jurisdiction language) */
  description: string
  /** 'error' = missing is a hard problem; 'warning' = notable but not blocking */
  severity: 'error' | 'warning'
}

/**
 * Lookup key: `${jurisdiction}:${schemaId}`. A generic per-jurisdiction
 * fallback is applied for unknown schemas.
 */
const ESSENTIAL_KEYWORDS: Record<string, KeywordCheck[]> = {
  // ── Czech Republic ─────────────────────────────────────────────────────
  'CZ:kupni-smlouva-v1': [
    { term: 'kupní cena',  description: 'kupní cena',                severity: 'error' },
    { term: 'předmět',     description: 'předmět koupě',             severity: 'error' },
    { term: 'vlastnick',   description: 'přechod vlastnického práva', severity: 'error' },
    { term: 'vad',         description: 'odpovědnost za vady',        severity: 'error' },
    { term: 'podpis',      description: 'podpisový blok',             severity: 'warning' },
  ],
  'CZ:pracovni-smlouva-v1': [
    { term: 'druh práce',  description: 'druh práce',                severity: 'error' },
    { term: 'místo výkonu',description: 'místo výkonu práce',         severity: 'error' },
    { term: 'nástup',      description: 'den nástupu do práce',       severity: 'error' },
    { term: 'mzd',         description: 'mzda / plat',                severity: 'error' },
    { term: 'výpovědn',    description: 'výpovědní doba',             severity: 'error' },
    { term: 'podpis',      description: 'podpisový blok',             severity: 'warning' },
  ],
  'CZ:najemni-smlouva-byt-v1': [
    { term: 'nájemn',      description: 'výše nájemného',             severity: 'error' },
    { term: 'byt',         description: 'označení bytu',              severity: 'error' },
    { term: 'jistot',      description: 'jistota / kauce',            severity: 'warning' },
    { term: 'výpovědn',    description: 'výpovědní podmínky',         severity: 'error' },
    { term: 'podpis',      description: 'podpisový blok',             severity: 'warning' },
  ],
  'CZ:smlouva-o-dilo-v1': [
    { term: 'předmět díla',description: 'předmět díla',               severity: 'error' },
    { term: 'cen',         description: 'cena díla',                  severity: 'error' },
    { term: 'termín',      description: 'termín zhotovení',           severity: 'error' },
    { term: 'vad',         description: 'odpovědnost za vady díla',   severity: 'error' },
    { term: 'podpis',      description: 'podpisový blok',             severity: 'warning' },
  ],
  'CZ:nda-smlouva-v1': [
    { term: 'důvěrn',      description: 'definice důvěrných informací', severity: 'error' },
    { term: 'mlčenlivost', description: 'povinnost mlčenlivosti',       severity: 'error' },
    { term: 'pokut',       description: 'smluvní pokuta',               severity: 'warning' },
    { term: 'podpis',      description: 'podpisový blok',               severity: 'warning' },
  ],

  // ── Germany ─────────────────────────────────────────────────────────────
  'DE:kaufvertrag-v1': [
    { term: 'kaufpreis',   description: 'Kaufpreis',                  severity: 'error' },
    { term: 'vertragsgegenstand', description: 'Vertragsgegenstand',  severity: 'error' },
    { term: 'eigentum',    description: 'Eigentumsübergang',          severity: 'error' },
    { term: 'mängel',      description: 'Mängelhaftung',              severity: 'error' },
    { term: 'unterschrift',description: 'Unterschriftsblock',         severity: 'warning' },
  ],
  'DE:arbeitsvertrag-v1': [
    { term: 'tätigkeit',   description: 'Tätigkeitsbeschreibung',     severity: 'error' },
    { term: 'arbeitsort',  description: 'Arbeitsort',                 severity: 'error' },
    { term: 'beginn',      description: 'Beginn des Arbeitsverhältnisses', severity: 'error' },
    { term: 'vergütung',   description: 'Vergütung',                  severity: 'error' },
    { term: 'kündigung',   description: 'Kündigungsfrist',            severity: 'error' },
    { term: 'urlaub',      description: 'Urlaubsanspruch',            severity: 'warning' },
    { term: 'unterschrift',description: 'Unterschriftsblock',         severity: 'warning' },
  ],
  'DE:mietvertrag-v1': [
    { term: 'miete',       description: 'Miete (Höhe)',               severity: 'error' },
    { term: 'wohnung',     description: 'Beschreibung der Mietsache', severity: 'error' },
    { term: 'kaution',     description: 'Kaution',                    severity: 'warning' },
    { term: 'kündigung',   description: 'Kündigungsbedingungen',      severity: 'error' },
    { term: 'unterschrift',description: 'Unterschriftsblock',         severity: 'warning' },
  ],
  'DE:werkvertrag-v1': [
    { term: 'werkbeschreibung', description: 'Werkbeschreibung',      severity: 'error' },
    { term: 'vergütung',   description: 'Vergütung',                  severity: 'error' },
    { term: 'fertigstellung', description: 'Fertigstellungstermin',   severity: 'error' },
    { term: 'abnahme',     description: 'Abnahme',                    severity: 'error' },
    { term: 'mängel',      description: 'Mängelrechte',               severity: 'error' },
    { term: 'unterschrift',description: 'Unterschriftsblock',         severity: 'warning' },
  ],
  'DE:de-nda-v1': [
    { term: 'vertrauliche', description: 'vertrauliche Informationen', severity: 'error' },
    { term: 'geheimhaltung', description: 'Geheimhaltungsverpflichtung', severity: 'error' },
    { term: 'vertragsstrafe', description: 'Vertragsstrafe',           severity: 'warning' },
    { term: 'unterschrift', description: 'Unterschriftsblock',         severity: 'warning' },
  ],

  // ── United Kingdom ─────────────────────────────────────────────────────
  'UK:sale-of-goods-v1': [
    { term: 'goods',       description: 'description of the goods',   severity: 'error' },
    { term: 'price',       description: 'price',                      severity: 'error' },
    { term: 'delivery',    description: 'delivery terms',             severity: 'error' },
    { term: 'title',       description: 'passing of title / property',severity: 'error' },
    { term: 'governing law', description: 'governing law',            severity: 'error' },
    { term: 'signed',      description: 'execution block',            severity: 'warning' },
  ],
  'UK:employment-contract-v1': [
    { term: 'job title',   description: 'job title',                  severity: 'error' },
    { term: 'duties',      description: 'duties',                     severity: 'error' },
    { term: 'place of work', description: 'place of work',            severity: 'error' },
    { term: 'start date',  description: 'start date',                 severity: 'error' },
    { term: 'salary',      description: 'pay / salary',               severity: 'error' },
    { term: 'notice',      description: 'notice period',              severity: 'error' },
    { term: 'holiday',     description: 'holiday entitlement',        severity: 'warning' },
    { term: 'signed',      description: 'execution block',            severity: 'warning' },
  ],
  'UK:tenancy-ast-v1': [
    { term: 'rent',        description: 'rent amount',                severity: 'error' },
    { term: 'premises',    description: 'description of the premises', severity: 'error' },
    { term: 'deposit',     description: 'tenancy deposit',            severity: 'warning' },
    { term: 'term',        description: 'term of the tenancy',        severity: 'error' },
    { term: 'notice',      description: 'termination notice',         severity: 'error' },
    { term: 'signed',      description: 'execution block',            severity: 'warning' },
  ],
  'UK:services-agreement-v1': [
    { term: 'services',    description: 'scope of services',          severity: 'error' },
    { term: 'fees',        description: 'fees',                       severity: 'error' },
    { term: 'governing law', description: 'governing law',            severity: 'error' },
    { term: 'limitation of liability', description: 'limitation of liability', severity: 'warning' },
    { term: 'signed',      description: 'execution block',            severity: 'warning' },
  ],
  'UK:uk-nda-v1': [
    { term: 'confidential information', description: 'definition of Confidential Information', severity: 'error' },
    { term: 'purpose',     description: 'purpose of disclosure',      severity: 'error' },
    { term: 'governing law', description: 'governing law',            severity: 'error' },
    { term: 'signed',      description: 'execution block',            severity: 'warning' },
  ],
}

const GENERIC_FALLBACK: Record<Jurisdiction, KeywordCheck[]> = {
  CZ: [
    { term: 'smluvní stran', description: 'identifikace smluvních stran', severity: 'error' },
    { term: 'předmět',       description: 'předmět smlouvy',              severity: 'error' },
    { term: 'podpis',        description: 'podpisový blok',               severity: 'warning' },
  ],
  DE: [
    { term: 'vertragsparte', description: 'Identifikation der Vertragsparteien', severity: 'error' },
    { term: 'vertragsgegenstand', description: 'Vertragsgegenstand',     severity: 'error' },
    { term: 'unterschrift',  description: 'Unterschriftsblock',          severity: 'warning' },
  ],
  UK: [
    { term: 'parties',       description: 'identification of the parties', severity: 'error' },
    { term: 'subject matter',description: 'subject matter',              severity: 'error' },
    { term: 'signed',        description: 'execution block',             severity: 'warning' },
  ],
}

function getKeywords(schemaId: string, jurisdiction: Jurisdiction): KeywordCheck[] {
  const key = `${jurisdiction}:${schemaId}`
  if (ESSENTIAL_KEYWORDS[key]) return ESSENTIAL_KEYWORDS[key]
  // Backward compat for legacy CZ-only keys
  if (jurisdiction === 'CZ' && ESSENTIAL_KEYWORDS[schemaId]) return ESSENTIAL_KEYWORDS[schemaId]
  return GENERIC_FALLBACK[jurisdiction]
}

// ─── Signature block detection ────────────────────────────────────────────────

function detectSignatureBlock(text: string, jurisdiction: Jurisdiction): boolean {
  const lower = text.toLowerCase()

  if (jurisdiction === 'DE') {
    return (
      lower.includes('unterschrift') ||
      lower.includes('für den arbeitgeber') ||
      lower.includes('für den vermieter') ||
      lower.includes('für den verkäufer') ||
      /_{5,}/.test(text)
    )
  }

  if (jurisdiction === 'UK') {
    return (
      lower.includes('signed') ||
      lower.includes('signature of') ||
      lower.includes('for and on behalf of') ||
      lower.includes('executed as a deed') ||
      /_{5,}/.test(text)
    )
  }

  // CZ default
  return (
    lower.includes('podpis') ||
    lower.includes('za objednatel') ||
    lower.includes('za prodáva') ||
    lower.includes('za nájemce') ||
    lower.includes('za zaměstna') ||
    /_{5,}/.test(text)
  )
}

// ─── Defined-term consistency check ──────────────────────────────────────────

function checkDefinedTermConsistency(text: string): string[] {
  // Czech/German style „Term", and English "Term" (curly + straight)
  const definedTermPattern = /[„""]([A-ZÁČĎÉĚÍŇÓŘŠŤÚŮÝŽÄÖÜ][a-záčďéěíňóřšťúůýžäöüß]+(?:\s[A-ZÁČĎÉĚÍŇÓŘŠŤÚŮÝŽÄÖÜ][a-záčďéěíňóřšťúůýžäöüß]*)*)["""]/g

  const inconsistentTerms: string[] = []
  const seen = new Set<string>()
  let match: RegExpExecArray | null

  while ((match = definedTermPattern.exec(text)) !== null) {
    const term = match[1]
    if (seen.has(term)) continue
    seen.add(term)

    const afterDefinition = text.slice(match.index + match[0].length)
    if (!afterDefinition.includes(term)) {
      inconsistentTerms.push(term)
    }
  }

  return inconsistentTerms
}

// ─── Consumer posture check ───────────────────────────────────────────────────

interface ConsumerPattern {
  pattern: string
  message: string
}

const CONSUMER_PATTERNS: Record<Jurisdiction, ConsumerPattern[]> = {
  CZ: [
    { pattern: 'vzdává se',
      message: 'Text obsahuje formulaci „vzdává se" — spotřebitel se nemůže vzdát zákonných práv (§ 1813 NOZ)' },
    { pattern: 'rozhodčí doložk',
      message: 'Spotřebitelská smlouva obsahuje rozhodčí doložku — silně omezená přípustnost (§ 2 zák. č. 216/1994 Sb.)' },
    { pattern: 'bez nároku na náhradu',
      message: 'Formulace „bez nároku na náhradu" může být nepřípustným omezením práv spotřebitele (§ 1813 NOZ)' },
  ],
  DE: [
    { pattern: 'verzichtet auf',
      message: 'Formulierung „verzichtet auf" — der Verbraucher kann auf gesetzliche Rechte i. d. R. nicht verzichten (§§ 307–309 BGB)' },
    { pattern: 'jeglicher haftung',
      message: 'Pauschaler Haftungsausschluss verstößt typischerweise gegen § 309 Nr. 7 BGB (Verschulden bei Personenschäden)' },
    { pattern: 'schiedsgericht',
      message: 'Schiedsklausel in Verbrauchervertrag — eingeschränkte Zulässigkeit (§ 1031 Abs. 5 ZPO)' },
  ],
  UK: [
    { pattern: 'waives',
      message: '"Waives" wording — consumer cannot waive statutory rights under the Consumer Rights Act 2015' },
    { pattern: 'binding arbitration',
      message: 'Binding arbitration in a consumer contract is restricted under s.91 Arbitration Act 1996 if the dispute is below the small-claims threshold' },
    { pattern: 'as is',
      message: '"As is" sale of goods to a consumer is incompatible with the satisfactory-quality term implied by Part 1 CRA 2015' },
  ],
}

function checkConsumerPostureConflict(text: string, jurisdiction: Jurisdiction): IntegrityIssue[] {
  const issues: IntegrityIssue[] = []
  const lower = text.toLowerCase()

  for (const { pattern, message } of CONSUMER_PATTERNS[jurisdiction]) {
    if (lower.includes(pattern)) {
      issues.push({ code: 'CONSUMER_RISKY_CLAUSE', message, severity: 'warning' })
    }
  }

  return issues
}

// ─── Main validator ───────────────────────────────────────────────────────────

/**
 * Runs all deterministic integrity checks on a generated contract text.
 *
 * Backwards-compatible signature: legacy callers may invoke this as
 *   runIntegrityCheck(text, schemaId, mode, posture?)
 * (without an explicit jurisdiction, defaulting to 'CZ'). The new canonical
 * signature requires jurisdiction:
 *   runIntegrityCheck(text, schemaId, jurisdiction, mode, posture?)
 */
export function runIntegrityCheck(
  text: string,
  schemaId: string,
  jurisdictionOrMode: Jurisdiction | GenerationMode,
  modeOrPosture?: GenerationMode | DraftingPosture,
  posture?: DraftingPosture,
): IntegrityResult {
  // ── Resolve overloaded args ─────────────────────────────────────────────
  let jurisdiction: Jurisdiction
  let mode: GenerationMode
  let actualPosture: DraftingPosture | undefined

  if (jurisdictionOrMode === 'CZ' || jurisdictionOrMode === 'DE' || jurisdictionOrMode === 'UK') {
    jurisdiction = jurisdictionOrMode
    mode = modeOrPosture as GenerationMode
    actualPosture = posture
  } else {
    // Legacy 4-arg call: (text, schemaId, mode, posture?)
    jurisdiction = 'CZ'
    mode = jurisdictionOrMode as GenerationMode
    actualPosture = modeOrPosture as DraftingPosture | undefined
  }

  return runIntegrityCheckCore(text, schemaId, jurisdiction, mode, actualPosture)
}

function runIntegrityCheckCore(
  text: string,
  schemaId: string,
  jurisdiction: Jurisdiction,
  mode: GenerationMode,
  posture?: DraftingPosture,
): IntegrityResult {
  const issues: IntegrityIssue[] = []
  const lower = text.toLowerCase()
  const placeholders = getPromptBundle(jurisdiction).placeholders

  // ── 1. Unresolved placeholders & review markers ──────────────────────────
  const placeholderRegex = new RegExp(escapeForRegex(placeholders.fillToken), 'g')
  const reviewRegex = new RegExp(escapeForRegex(placeholders.reviewToken), 'g')
  const unresolvedPlaceholders = (text.match(placeholderRegex) ?? []).length
  const unresolvedReviewMarkers = (text.match(reviewRegex) ?? []).length

  if (unresolvedPlaceholders > 0) {
    const sev = mode === 'complete' ? 'error' : 'warning'
    const msg =
      jurisdiction === 'DE'
        ? `Text enthält ${unresolvedPlaceholders} unausgefüllte Platzhalter ${placeholders.fillToken}]`
        : jurisdiction === 'UK'
          ? `Text contains ${unresolvedPlaceholders} unresolved placeholder${unresolvedPlaceholders === 1 ? '' : 's'} ${placeholders.fillToken}]`
          : `Text obsahuje ${unresolvedPlaceholders} nevyplněný${unresolvedPlaceholders === 1 ? '' : 'ch'} placeholder${unresolvedPlaceholders === 1 ? '' : 'ů'} ${placeholders.fillToken}]`
    issues.push({ code: 'UNRESOLVED_PLACEHOLDERS', message: msg, severity: sev })
  }

  if (unresolvedReviewMarkers > 0) {
    const msg =
      jurisdiction === 'DE'
        ? `Text enthält ${unresolvedReviewMarkers} ${placeholders.reviewToken}-Marker zur anwaltlichen Prüfung`
        : jurisdiction === 'UK'
          ? `Text contains ${unresolvedReviewMarkers} ${placeholders.reviewToken} marker${unresolvedReviewMarkers === 1 ? '' : 's'} requiring solicitor attention`
          : `Text obsahuje ${unresolvedReviewMarkers} marker${unresolvedReviewMarkers === 1 ? '' : 'ů'} ${placeholders.reviewToken}`
    issues.push({ code: 'UNRESOLVED_REVIEW_MARKERS', message: msg, severity: 'error' })
  }

  // ── 2. Essential keyword checks ───────────────────────────────────────────
  const keywords = getKeywords(schemaId, jurisdiction)
  const missingEssentialKeywords: string[] = []

  for (const kw of keywords) {
    if (!lower.includes(kw.term.toLowerCase())) {
      missingEssentialKeywords.push(kw.description)
      const prefix =
        jurisdiction === 'DE' ? 'Fehlendes wesentliches Element'
        : jurisdiction === 'UK' ? 'Missing essential element'
        : 'Chybí esenciální prvek'
      issues.push({
        code: 'MISSING_ESSENTIAL_KEYWORD',
        message: `${prefix}: ${kw.description}`,
        severity: kw.severity,
      })
    }
  }

  // ── 3. Signature block ────────────────────────────────────────────────────
  const hasSignatureBlock = detectSignatureBlock(text, jurisdiction)
  if (!hasSignatureBlock) {
    const msg =
      jurisdiction === 'DE'
        ? 'Es wurde kein Unterschriftsblock gefunden — der Vertrag bietet keinen Platz für die Unterschriften der Parteien'
        : jurisdiction === 'UK'
          ? 'No execution block detected — the contract does not provide signature lines for the parties'
          : 'Nebyl nalezen podpisový blok — smlouva neobsahuje prostor pro podpisy stran'
    issues.push({ code: 'MISSING_SIGNATURE_BLOCK', message: msg, severity: 'warning' })
  }

  // ── 4. Defined-term consistency ───────────────────────────────────────────
  const inconsistentTerms = checkDefinedTermConsistency(text)
  for (const term of inconsistentTerms) {
    const msg =
      jurisdiction === 'DE'
        ? `Definierter Begriff „${term}" ist definiert, wird aber im weiteren Text nicht verwendet`
        : jurisdiction === 'UK'
          ? `Defined term "${term}" is defined but never used afterwards`
          : `Definovaný pojem „${term}" je definován, ale dále v textu nepoužit`
    issues.push({ code: 'DEFINED_TERM_UNUSED', message: msg, severity: 'warning' })
  }

  // ── 5. Consumer posture conflict ──────────────────────────────────────────
  if (posture?.transactionContext === 'consumer') {
    issues.push(...checkConsumerPostureConflict(text, jurisdiction))
  }

  // ── Compute overall severity ──────────────────────────────────────────────
  const hasErrors = issues.some((i) => i.severity === 'error')
  const hasWarnings = issues.some((i) => i.severity === 'warning')

  let severity: IntegrityResult['severity'] = 'pass'
  if (hasErrors || hasWarnings) severity = 'warn'

  if (
    (unresolvedPlaceholders > 0 && mode === 'complete') ||
    unresolvedReviewMarkers > 0 ||
    unresolvedPlaceholders > 2
  ) {
    severity = 'block'
  }

  return {
    severity,
    unresolvedPlaceholders,
    unresolvedReviewMarkers,
    missingEssentialKeywords,
    hasSignatureBlock,
    issues,
  }
}

// ─── Decision logic ───────────────────────────────────────────────────────────

export function applyIntegrityDecision(mode: GenerationMode, result: IntegrityResult): GenerationMode {
  const PRIORITY: Record<GenerationMode, number> = {
    'complete': 0,
    'draft': 1,
    'review-needed': 2,
  }

  let forcedMode: GenerationMode = mode

  if (result.unresolvedReviewMarkers > 0) {
    forcedMode = maxMode(forcedMode, 'review-needed', PRIORITY)
  }

  if (result.unresolvedPlaceholders > 2) {
    forcedMode = maxMode(forcedMode, 'review-needed', PRIORITY)
  }

  if (result.unresolvedPlaceholders > 0 && forcedMode === 'complete') {
    forcedMode = maxMode(forcedMode, 'draft', PRIORITY)
  }

  const hasErrors = result.issues.some((i) => i.severity === 'error')
  if (hasErrors) {
    forcedMode = maxMode(forcedMode, 'draft', PRIORITY)
  }

  return forcedMode
}

function maxMode(
  current: GenerationMode,
  candidate: GenerationMode,
  priority: Record<GenerationMode, number>,
): GenerationMode {
  return priority[candidate] > priority[current] ? candidate : current
}

// ─── Warning extraction ───────────────────────────────────────────────────────

export function extractIntegrityWarnings(
  result: IntegrityResult,
): Array<{ code: string; message: string }> {
  return result.issues.map((issue) => ({
    code: issue.code,
    message: issue.message,
  }))
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function escapeForRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}
