/**
 * Deterministic Contract Integrity Validator — Czech law (CZ)
 *
 * Runs non-LLM checks on the GENERATED contract text to catch issues
 * that the LLM quality gate may have missed. Complements Stage 2 —
 * does NOT replace it.
 *
 * All checks (placeholders, review markers, signature blocks, consumer-risk
 * patterns) use Czech tokens and heuristics. Placeholder/review tokens come
 * from the CZ prompt bundle (lib/contracts/prompts/cz.ts).
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
import { findStaleLaw } from '@/lib/legal/staleLawGuard'

/** Schemas that are residential leases, where § 2239 NOZ applies. */
const TENANCY_SCHEMA_IDS = new Set(['najemni-smlouva-byt-v1'])

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

// ─── Essential keyword registry (CZ) ───────────────────────────────────────

interface KeywordCheck {
  /** Lowercase substring or simple pattern to search for (case-insensitive) */
  term: string
  /** Human-readable description used in warnings */
  description: string
  /** 'error' = missing is a hard problem; 'warning' = notable but not blocking */
  severity: 'error' | 'warning'
}

const ESSENTIAL_KEYWORDS: Record<string, KeywordCheck[]> = {
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
}

const GENERIC_CZ_FALLBACK: KeywordCheck[] = [
  { term: 'smluvní stran', description: 'identifikace smluvních stran', severity: 'error' },
  { term: 'předmět',       description: 'předmět smlouvy',              severity: 'error' },
  { term: 'podpis',        description: 'podpisový blok',               severity: 'warning' },
]

function getKeywords(schemaId: string, jurisdiction: Jurisdiction): KeywordCheck[] {
  const key = `${jurisdiction}:${schemaId}`
  if (ESSENTIAL_KEYWORDS[key]) return ESSENTIAL_KEYWORDS[key]
  if (jurisdiction === 'CZ' && ESSENTIAL_KEYWORDS[schemaId]) return ESSENTIAL_KEYWORDS[schemaId]
  return GENERIC_CZ_FALLBACK
}

// ─── Signature block detection ────────────────────────────────────────────────

function detectSignatureBlock(text: string): boolean {
  const lower = text.toLowerCase()
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

const CZ_CONSUMER_PATTERNS: ConsumerPattern[] = [
  { pattern: 'vzdává se',
    message: 'Text obsahuje formulaci „vzdává se" — spotřebitel se nemůže vzdát zákonných práv (§ 1813 NOZ)' },
  { pattern: 'rozhodčí doložk',
    message: 'Spotřebitelská smlouva obsahuje rozhodčí doložku — silně omezená přípustnost (§ 2 zák. č. 216/1994 Sb.)' },
  { pattern: 'bez nároku na náhradu',
    message: 'Formulace „bez nároku na náhradu" může být nepřípustným omezením práv spotřebitele (§ 1813 NOZ)' },
]

function checkConsumerPostureConflict(text: string): IntegrityIssue[] {
  const issues: IntegrityIssue[] = []
  const lower = text.toLowerCase()

  for (const { pattern, message } of CZ_CONSUMER_PATTERNS) {
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
 * (without an explicit jurisdiction, defaulting to 'CZ'). The canonical
 * signature includes jurisdiction:
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
  const placeholders = getPromptBundle(jurisdiction).placeholders

  // ── 1. Unresolved placeholders & review markers ──────────────────────────
  const placeholderRegex = new RegExp(escapeForRegex(placeholders.fillToken), 'g')
  const reviewRegex = new RegExp(escapeForRegex(placeholders.reviewToken), 'g')
  const unresolvedPlaceholders = (text.match(placeholderRegex) ?? []).length
  const unresolvedReviewMarkers = (text.match(reviewRegex) ?? []).length

  if (unresolvedPlaceholders > 0) {
    const sev = mode === 'complete' ? 'error' : 'warning'
    issues.push({
      code: 'UNRESOLVED_PLACEHOLDERS',
      message: `Text obsahuje ${unresolvedPlaceholders} nevyplněný${unresolvedPlaceholders === 1 ? '' : 'ch'} placeholder${unresolvedPlaceholders === 1 ? '' : 'ů'} ${placeholders.fillToken}]`,
      severity: sev,
    })
  }

  if (unresolvedReviewMarkers > 0) {
    issues.push({
      code: 'UNRESOLVED_REVIEW_MARKERS',
      message: `Text obsahuje ${unresolvedReviewMarkers} marker${unresolvedReviewMarkers === 1 ? '' : 'ů'} ${placeholders.reviewToken}`,
      severity: 'error',
    })
  }

  // ── 2. Essential keyword checks ───────────────────────────────────────────
  const keywords = getKeywords(schemaId, jurisdiction)
  const missingEssentialKeywords: string[] = []
  const lower = text.toLowerCase()

  for (const kw of keywords) {
    if (!lower.includes(kw.term.toLowerCase())) {
      missingEssentialKeywords.push(kw.description)
      issues.push({
        code: 'MISSING_ESSENTIAL_KEYWORD',
        message: `Chybí esenciální prvek: ${kw.description}`,
        severity: kw.severity,
      })
    }
  }

  // ── 3. Signature block ────────────────────────────────────────────────────
  const hasSignatureBlock = detectSignatureBlock(text)
  if (!hasSignatureBlock) {
    issues.push({
      code: 'MISSING_SIGNATURE_BLOCK',
      message: 'Nebyl nalezen podpisový blok — smlouva neobsahuje prostor pro podpisy stran',
      severity: 'warning',
    })
  }

  // ── 4. Defined-term consistency ───────────────────────────────────────────
  const inconsistentTerms = checkDefinedTermConsistency(text)
  for (const term of inconsistentTerms) {
    issues.push({
      code: 'DEFINED_TERM_UNUSED',
      message: `Definovaný pojem „${term}" je definován, ale dále v textu nepoužit`,
      severity: 'warning',
    })
  }

  // ── 5. Consumer posture conflict ──────────────────────────────────────────
  if (posture?.transactionContext === 'consumer') {
    issues.push(...checkConsumerPostureConflict(text))
  }

  // ── 6. Superseded law ─────────────────────────────────────────────────────
  // The model has read the pre-2025 Czech internet far more often than the
  // current one, so it reaches for repealed wording even when the prompt
  // carries the right value. This catches it in the output.
  if (jurisdiction === 'CZ') {
    for (const stale of findStaleLaw(text)) {
      issues.push({
        code: 'SUPERSEDED_LAW',
        message: `Text uvádí překonanou úpravu: ${stale.claim} ${stale.correction}`,
        severity: 'error',
      })
    }
  }

  // ── 7. Contractual penalty against a residential tenant ───────────────────
  // § 2239 NOZ disregards it outright. A generated lease containing one gives
  // the landlord a clause that does nothing and the tenant a false worry.
  if (jurisdiction === 'CZ' && TENANCY_SCHEMA_IDS.has(schemaId) && /smluvn[íi]\s+pokut/i.test(text)) {
    issues.push({
      code: 'TENANCY_PENALTY_CLAUSE',
      message:
        'Smlouva obsahuje smluvní pokutu k tíži nájemce — podle § 2239 zák. č. 89/2012 Sb. ' +
        'se k takovému ujednání nepřihlíží. Pronajímateli zůstává zákonný úrok z prodlení.',
      severity: 'error',
    })
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

  // A missing essential element — the purchase price, the subject, transfer of
  // title, the wage clause — means the model did not return a usable contract.
  // That is never a working draft: it must be flagged for review so nobody
  // mistakes a hollow document for something they can build on.
  const missingEssential = result.issues.some(
    (i) => i.severity === 'error' && i.code === 'MISSING_ESSENTIAL_KEYWORD',
  )
  if (missingEssential) {
    forcedMode = maxMode(forcedMode, 'review-needed', PRIORITY)
  }

  // A contract quoting repealed law, or carrying a clause the law disregards,
  // is not a draft somebody can tidy up — it is wrong on the merits. Labelling
  // it 'draft' would understate that.
  const legallyUnsound = result.issues.some(
    (i) => i.code === 'SUPERSEDED_LAW' || i.code === 'TENANCY_PENALTY_CLAUSE',
  )
  if (legallyUnsound) {
    forcedMode = maxMode(forcedMode, 'review-needed', PRIORITY)
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
