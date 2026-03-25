/**
 * Deterministic Contract Integrity Validator
 *
 * Runs non-LLM checks on the GENERATED contract text to catch issues
 * that the LLM quality gate may have missed. Complements Stage 2 —
 * does NOT replace it.
 *
 * Reliable deterministic checks (no LLM required):
 *   1. Unresolved placeholder count  → [DOPLNIT found in output
 *   2. ZKONTROLOVAT marker count     → ⚠️ ZKONTROLOVAT in output
 *   3. Essential keyword presence    → per-schema required terms
 *   4. Signature block presence      → structural check
 *   5. Defined-term consistency      → terms defined but never reused
 *   6. Consumer posture conflict     → B2C context flags
 *
 * Routing rules (never-upgrade applies here too):
 *   - Unresolved placeholders > 0 in 'complete' mode → downgrade to 'draft'
 *   - Unresolved placeholders > 0 in 'draft' mode    → keep 'draft'
 *   - ZKONTROLOVAT markers > 0                        → keep/force 'review-needed'
 *   - Missing signature block (error-level)           → at least 'draft'
 *   - Missing essential keyword (error-level)         → at least 'draft'
 *   - Consumer posture + suspicious clause            → 'review-needed'
 */

import type { GenerationMode, DraftingPosture } from './types'

// ─── Public types ─────────────────────────────────────────────────────────────

export interface IntegrityIssue {
  code: string
  message: string
  severity: 'warning' | 'error'
}

export interface IntegrityResult {
  /** Overall verdict: pass / warn / block — mirrors quality gate convention */
  severity: 'pass' | 'warn' | 'block'
  /** Raw count of [DOPLNIT occurrences in the generated text */
  unresolvedPlaceholders: number
  /** Raw count of ⚠️ ZKONTROLOVAT occurrences */
  unresolvedReviewMarkers: number
  /** Essential keyword descriptions that were NOT found in the text */
  missingEssentialKeywords: string[]
  /** Whether a signature block was detected */
  hasSignatureBlock: boolean
  /** Structured findings for warning injection */
  issues: IntegrityIssue[]
}

// ─── Essential keyword registry ──────────────────────────────────────────────

interface KeywordCheck {
  /** Lowercase substring or simple pattern to search for (case-insensitive) */
  term: string
  /** Human-readable description used in warnings */
  description: string
  /** 'error' = missing is a hard problem; 'warning' = notable but not blocking */
  severity: 'error' | 'warning'
}

/**
 * Per-schema keyword checks. Each term is checked case-insensitively.
 * A generic fallback is applied for unknown schemas.
 */
const ESSENTIAL_KEYWORDS: Record<string, KeywordCheck[]> = {
  'kupni-smlouva-v1': [
    { term: 'kupní cena',        description: 'kupní cena',                      severity: 'error' },
    { term: 'předmět',           description: 'předmět koupě',                   severity: 'error' },
    { term: 'vlastnick',         description: 'přechod vlastnického práva',       severity: 'error' },
    { term: 'vad',               description: 'odpovědnost za vady',              severity: 'error' },
    { term: 'podpis',            description: 'podpisový blok',                   severity: 'warning' },
  ],
  'pracovni-smlouva-v1': [
    { term: 'druh práce',        description: 'druh práce',                       severity: 'error' },
    { term: 'místo výkonu',      description: 'místo výkonu práce',               severity: 'error' },
    { term: 'nástup',            description: 'den nástupu do práce',             severity: 'error' },
    { term: 'mzd',               description: 'mzda / plat',                      severity: 'error' },
    { term: 'výpovědn',          description: 'výpovědní doba',                   severity: 'error' },
    { term: 'podpis',            description: 'podpisový blok',                   severity: 'warning' },
  ],
  'najemni-smlouva-byt-v1': [
    { term: 'nájemn',            description: 'výše nájemného',                   severity: 'error' },
    { term: 'byt',               description: 'označení bytu',                    severity: 'error' },
    { term: 'jistot',            description: 'jistota / kauce',                  severity: 'warning' },
    { term: 'výpovědn',          description: 'výpovědní podmínky',               severity: 'error' },
    { term: 'podpis',            description: 'podpisový blok',                   severity: 'warning' },
  ],
  'smlouva-o-dilo-v1': [
    { term: 'předmět díla',      description: 'předmět díla',                     severity: 'error' },
    { term: 'cen',               description: 'cena díla',                        severity: 'error' },
    { term: 'termín',            description: 'termín zhotovení',                 severity: 'error' },
    { term: 'vad',               description: 'odpovědnost za vady díla',         severity: 'error' },
    { term: 'podpis',            description: 'podpisový blok',                   severity: 'warning' },
  ],
  'nda-smlouva-v1': [
    { term: 'důvěrn',            description: 'definice důvěrných informací',     severity: 'error' },
    { term: 'mlčenlivost',       description: 'povinnost mlčenlivosti',            severity: 'error' },
    { term: 'pokut',             description: 'smluvní pokuta za porušení',       severity: 'warning' },
    { term: 'podpis',            description: 'podpisový blok',                   severity: 'warning' },
  ],
}

/** Generic fallback for unknown schema types. */
const GENERIC_KEYWORDS: KeywordCheck[] = [
  { term: 'smluvní stran',   description: 'identifikace smluvních stran', severity: 'error' },
  { term: 'předmět',         description: 'předmět smlouvy',              severity: 'error' },
  { term: 'podpis',          description: 'podpisový blok',               severity: 'warning' },
]

function getKeywords(schemaId: string): KeywordCheck[] {
  return ESSENTIAL_KEYWORDS[schemaId] ?? GENERIC_KEYWORDS
}

// ─── Signature block detection ────────────────────────────────────────────────

/**
 * Checks for signature-block patterns in the generated text.
 * Looks for Czech signature line conventions: underscores, "Podpis", "Za ..."
 */
function detectSignatureBlock(text: string): boolean {
  const lower = text.toLowerCase()
  return (
    lower.includes('podpis') ||
    lower.includes('za objednatel') ||
    lower.includes('za prodáva') ||
    lower.includes('za nájemce') ||
    lower.includes('za zaměstna') ||
    /_{5,}/.test(text)          // five or more underscores = signature line
  )
}

// ─── Defined-term consistency check ──────────────────────────────────────────

/**
 * Extracts terms defined with Czech legal convention („TermName") and
 * checks if they appear at least once after their definition point.
 * Only terms defined in a clearly definitional context are checked.
 */
function checkDefinedTermConsistency(text: string): string[] {
  // Match patterns like „SomeTerm" or "SomeTerm" used in definitions
  // Czech convention: Strany se dohodly na definici pojmu „Dílo" takto...
  const definedTermPattern = /[„"]([A-ZÁČĎÉĚÍŇÓŘŠŤÚŮÝŽ][a-záčďéěíňóřšťúůýž]+(?:\s[A-ZÁČĎÉĚÍŇÓŘŠŤÚŮÝŽ][a-záčďéěíňóřšťúůýž]*)*)["""]/g

  const inconsistentTerms: string[] = []
  const seen = new Set<string>()
  let match: RegExpExecArray | null

  while ((match = definedTermPattern.exec(text)) !== null) {
    const term = match[1]
    if (seen.has(term)) continue
    seen.add(term)

    // Check the term appears at least once AFTER the definition location
    const afterDefinition = text.slice(match.index + match[0].length)
    // Look for bare use (not in quotes) — simple heuristic
    if (!afterDefinition.includes(term)) {
      inconsistentTerms.push(term)
    }
  }

  return inconsistentTerms
}

// ─── Consumer posture check ───────────────────────────────────────────────────

/**
 * When transactionContext='consumer', checks for patterns that suggest
 * clauses prohibited by § 1813 NOZ (unfair terms in consumer contracts).
 * This is a conservative heuristic — flags for human review, not auto-block.
 */
function checkConsumerPostureConflict(text: string): IntegrityIssue[] {
  const issues: IntegrityIssue[] = []
  const lower = text.toLowerCase()

  // Patterns that are forbidden or heavily restricted in consumer contracts
  const riskyPatterns: Array<{ pattern: string; message: string }> = [
    {
      pattern: 'vzdává se',
      message: 'Text obsahuje formulaci „vzdává se" — spotřebitel se nemůže vzdát zákonných práv (§ 1813 NOZ)',
    },
    {
      pattern: 'rozhodčí doložk',
      message: 'Spotřebitelská smlouva obsahuje rozhodčí doložku — silně omezená přípustnost (§ 2 zák. č. 216/1994 Sb.)',
    },
    {
      pattern: 'bez nároku na náhradu',
      message: 'Formulace „bez nároku na náhradu" může být nepřípustným omezením práv spotřebitele (§ 1813 NOZ)',
    },
  ]

  for (const { pattern, message } of riskyPatterns) {
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
 * @param text         - The generated contract text (Stage 1 or Stage 2 output)
 * @param schemaId     - Canonical schema identifier
 * @param mode         - Current generation mode (used for severity calibration)
 * @param posture      - Optional drafting posture for context-aware checks
 */
export function runIntegrityCheck(
  text: string,
  schemaId: string,
  mode: GenerationMode,
  posture?: DraftingPosture,
): IntegrityResult {
  const issues: IntegrityIssue[] = []
  const lower = text.toLowerCase()

  // ── 1. Unresolved placeholders ────────────────────────────────────────────
  const unresolvedPlaceholders = (text.match(/\[DOPLNIT/g) ?? []).length
  const unresolvedReviewMarkers = (text.match(/⚠️ ZKONTROLOVAT/g) ?? []).length

  if (unresolvedPlaceholders > 0) {
    const sev = mode === 'complete' ? 'error' : 'warning'
    issues.push({
      code: 'UNRESOLVED_PLACEHOLDERS',
      message: `Text obsahuje ${unresolvedPlaceholders} nevyplněný${unresolvedPlaceholders === 1 ? '' : 'ch'} placeholder${unresolvedPlaceholders === 1 ? '' : 'ů'} [DOPLNIT]`,
      severity: sev,
    })
  }

  if (unresolvedReviewMarkers > 0) {
    issues.push({
      code: 'UNRESOLVED_REVIEW_MARKERS',
      message: `Text obsahuje ${unresolvedReviewMarkers} marker${unresolvedReviewMarkers === 1 ? '' : 'ů'} ⚠️ ZKONTROLOVAT`,
      severity: 'error',
    })
  }

  // ── 2. Essential keyword checks ───────────────────────────────────────────
  const keywords = getKeywords(schemaId)
  const missingEssentialKeywords: string[] = []

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
    const consumerIssues = checkConsumerPostureConflict(text)
    issues.push(...consumerIssues)
  }

  // ── Compute overall severity ──────────────────────────────────────────────
  const hasErrors = issues.some((i) => i.severity === 'error')
  const hasWarnings = issues.some((i) => i.severity === 'warning')

  // Severity escalation: any error-level issue → at least 'warn'
  // Unresolved placeholders in complete mode or ZKONTROLOVAT present → 'block'
  let severity: IntegrityResult['severity'] = 'pass'

  if (hasErrors || hasWarnings) {
    severity = 'warn'
  }

  if (
    (unresolvedPlaceholders > 0 && mode === 'complete') ||
    unresolvedReviewMarkers > 0 ||
    (unresolvedPlaceholders > 2)  // More than 2 unresolved in any mode is a block
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

/**
 * Applies integrity validator findings to the current mode.
 * Never upgrades — only downgrades.
 *
 * Rules:
 *   - ZKONTROLOVAT markers in text → force 'review-needed'
 *   - Placeholders > 0 in 'complete' mode → downgrade to 'draft'
 *   - Placeholders > 2 in any mode → force 'review-needed'
 *   - Error-level issues → at least 'draft'
 *   - Warning-level issues only → keep current mode
 */
export function applyIntegrityDecision(
  mode: GenerationMode,
  result: IntegrityResult,
): GenerationMode {
  const PRIORITY: Record<GenerationMode, number> = {
    'complete': 0,
    'draft': 1,
    'review-needed': 2,
  }

  let forcedMode: GenerationMode = mode

  // ZKONTROLOVAT markers → must be review-needed
  if (result.unresolvedReviewMarkers > 0) {
    forcedMode = maxMode(forcedMode, 'review-needed', PRIORITY)
  }

  // More than 2 unresolved placeholders → review-needed
  if (result.unresolvedPlaceholders > 2) {
    forcedMode = maxMode(forcedMode, 'review-needed', PRIORITY)
  }

  // Any unresolved placeholder in complete mode → at least draft
  if (result.unresolvedPlaceholders > 0 && forcedMode === 'complete') {
    forcedMode = maxMode(forcedMode, 'draft', PRIORITY)
  }

  // Error-level issues → at least draft
  const hasErrors = result.issues.some((i) => i.severity === 'error')
  if (hasErrors) {
    forcedMode = maxMode(forcedMode, 'draft', PRIORITY)
  }

  return forcedMode
}

/** Returns the higher-priority (worse) of two modes. Never upgrades. */
function maxMode(
  current: GenerationMode,
  candidate: GenerationMode,
  priority: Record<GenerationMode, number>,
): GenerationMode {
  return priority[candidate] > priority[current] ? candidate : current
}

// ─── Warning extraction ───────────────────────────────────────────────────────

/**
 * Converts integrity result into ContractWarning-compatible objects.
 * Only includes non-trivial findings (error + warning severity).
 */
export function extractIntegrityWarnings(
  result: IntegrityResult,
): Array<{ code: string; message: string }> {
  return result.issues.map((issue) => ({
    code: issue.code,
    message: issue.message,
  }))
}
