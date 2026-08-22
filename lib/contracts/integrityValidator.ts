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
import {
  COMMON_PROFILE,
  getContractProfile,
  type LegalRule,
  type RuleKind,
} from '@/lib/legal/knowledge'
import { getSchemaOrNull } from './contractSchemas'

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

// ─── Checks derived from the knowledge base ──────────────────────────────────

/**
 * What a document of this type must contain, and what it must not.
 *
 * Derived from lib/legal/knowledge rather than kept here. This file used to
 * hold its own hand-written list of required terms per schema, which was a
 * second source of truth about the same question the profiles already answer.
 * Two lists drift, and when they do nobody can tell which one is right — the
 * same failure that put a two-year-old minimum wage into production.
 *
 * Deriving also means a new contract type gets integrity checking for free
 * rather than needing a fifth place to be registered.
 */

interface KeywordCheck {
  /** Pattern that finds the element in the finished text. */
  pattern: RegExp
  /** Short human name used in the warning. */
  description: string
  /** 'error' = missing is a hard problem; 'warning' = notable but not blocking */
  severity: 'error' | 'warning'
}

/** Kinds whose absence is a real defect rather than a missed opportunity. */
const REQUIRED_KINDS = new Set<RuleKind>(['essential', 'form', 'mandatory'])

const GENERIC_CZ_FALLBACK: KeywordCheck[] = [
  { pattern: /smluvní\s+stran/i, description: 'identifikace smluvních stran', severity: 'error' },
  { pattern: /předmět/i, description: 'předmět smlouvy', severity: 'error' },
]

/**
 * Rules whose absence makes the generated document defective.
 *
 * Deliberately only the required kinds. Integrity asks whether the model
 * produced a legally sound document, not whether it produced a maximally
 * complete one — a missing recommended clause is something for the review to
 * raise with the user, not a defect in generation. Including advisory rules
 * here made 'pass' effectively unreachable and drained the warnings of meaning.
 */
function getKeywords(schemaId: string, jurisdiction: Jurisdiction): KeywordCheck[] {
  const required = checkableRules(schemaId, jurisdiction).filter((rule) =>
    REQUIRED_KINDS.has(rule.kind),
  )
  if (required.length === 0) return GENERIC_CZ_FALLBACK

  return required.map((rule) => ({
    pattern: rule.detect,
    description: rule.label ?? rule.id,
    severity: 'error' as const,
  }))
}

/** Rules describing a clause the law strikes out, so its presence is the defect. */
function getProhibitedRules(schemaId: string, jurisdiction: Jurisdiction): DetectableRule[] {
  return checkableRules(schemaId, jurisdiction).filter((rule) => rule.kind === 'prohibited')
}

type DetectableRule = LegalRule & { detect: RegExp }

function checkableRules(schemaId: string, jurisdiction: Jurisdiction): DetectableRule[] {
  if (jurisdiction !== 'CZ') return []
  const family = getSchemaOrNull(schemaId)?.metadata.contractFamily
  if (!family) return []

  // Common rules ride along: a consumer arbitration clause is void whatever
  // kind of contract it sits in, so checking it per type would mean repeating
  // it in every profile.
  return [...getContractProfile(family).rules, ...COMMON_PROFILE.rules].filter(
    (rule): rule is DetectableRule => rule.detect instanceof RegExp,
  )
}

/** A global regex carries lastIndex between calls; rebuild without the flag. */
function matches(pattern: RegExp, text: string): boolean {
  return new RegExp(pattern.source, pattern.flags.replace('g', '')).test(text)
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
    if (!matches(kw.pattern, text)) {
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

  // ── 7. Clauses the law strikes out ────────────────────────────────────────
  // Presence is the defect here, not absence. A conditional rule (consumer
  // only, real estate only) drops to a warning because nothing here can verify
  // the condition holds.
  for (const rule of getProhibitedRules(schemaId, jurisdiction)) {
    if (!matches(rule.detect, text)) continue

    issues.push({
      code: 'PROHIBITED_CLAUSE_PRESENT',
      message:
        `Text obsahuje ustanovení, které zákon vylučuje: ${rule.requirement} (${rule.law})`,
      severity: rule.appliesWhen ? 'warning' : 'error',
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
    (i) => i.code === 'SUPERSEDED_LAW' || i.code === 'PROHIBITED_CLAUSE_PRESENT',
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
