/**
 * Deterministic audit of a contract against its statutory profile.
 *
 * WHY NOT JUST ASK THE MODEL
 *
 * "What is missing from this contract?" is an open question, and an open
 * question is where a language model is most inclined to produce a plausible
 * answer rather than a true one. Half of that question does not need a model at
 * all: the knowledge base already knows which elements a given contract type
 * must contain and which clauses the law strikes out, so their presence can be
 * established by searching the text.
 *
 * The audit runs first and its result is handed to the review as fact —
 * "this was not found, verify it" rather than "tell me what is missing". A
 * finding that starts from a verified observation is much harder to invent.
 *
 * PRECISION OVER COVERAGE
 *
 * Only rules carrying a `detect` pattern are audited, and patterns are added
 * only where a match is genuinely reliable. A loose pattern is worse than no
 * pattern: because the result is presented as established, a false negative
 * turns into a confidently reported missing clause — exactly the failure this
 * module exists to prevent.
 */

import {
  COMMON_PROFILE,
  getContractProfile,
  type LegalProfileKey,
  type LegalRule,
} from '@/lib/legal/knowledge'

export interface AuditFinding {
  ruleId: string
  requirement: string
  law: string
  /** Only set where the rule is conditional, so the model can rule it out. */
  appliesWhen?: string
}

export interface StructuralAudit {
  /** Required elements whose pattern did not match anywhere in the text. */
  notFound: AuditFinding[]
  /** Clauses the law strikes out whose pattern did match. */
  prohibitedPresent: AuditFinding[]
  /** How many rules could be checked at all — the rest have no pattern. */
  checked: number
}

/** Kinds whose absence is worth reporting. Practice notes are not. */
const REQUIRED_KINDS = new Set(['essential', 'form', 'mandatory'])

function toFinding(rule: LegalRule): AuditFinding {
  return {
    ruleId: rule.id,
    requirement: rule.requirement,
    law: rule.law,
    ...(rule.appliesWhen ? { appliesWhen: rule.appliesWhen } : {}),
  }
}

/**
 * Runs every checkable rule for this contract type against the text.
 *
 * An unknown type audits against the common rules alone, which is always safe:
 * they apply whatever the document turns out to be.
 */
export function auditContract(text: string, family: LegalProfileKey | null): StructuralAudit {
  const rules = [
    ...(family ? getContractProfile(family).rules : []),
    ...COMMON_PROFILE.rules,
  ].filter((rule): rule is LegalRule & { detect: RegExp } => rule.detect instanceof RegExp)

  const notFound: AuditFinding[] = []
  const prohibitedPresent: AuditFinding[] = []

  for (const rule of rules) {
    // A global regex carries lastIndex between calls; rebuild without the flag.
    const pattern = new RegExp(rule.detect.source, rule.detect.flags.replace('g', ''))
    const matched = pattern.test(text)

    if (rule.kind === 'prohibited') {
      if (matched) prohibitedPresent.push(toFinding(rule))
    } else if (REQUIRED_KINDS.has(rule.kind) && !matched) {
      notFound.push(toFinding(rule))
    }
  }

  return { notFound, prohibitedPresent, checked: rules.length }
}

/**
 * Renders the audit for the review prompt.
 *
 * Deliberately worded as an observation to verify, not a conclusion to repeat.
 * A pattern search cannot tell a missing clause from one phrased unusually, and
 * the model can see the text.
 */
export function renderAudit(audit: StructuralAudit): string {
  if (audit.checked === 0) return ''

  const lines = [
    '## Automatická kontrola textu (provedena strojově, nikoli modelem)',
    '',
    `Následující zjištění vznikla vyhledáním v textu smlouvy, ne úvahou. ` +
      `Zkontrolováno ${audit.checked} ustanovení.`,
    '',
  ]

  if (audit.prohibitedPresent.length > 0) {
    lines.push('### V textu NALEZENO — ustanovení, která zákon vylučuje', '')
    for (const finding of audit.prohibitedPresent) {
      lines.push(`- ${finding.requirement}`)
      if (finding.appliesWhen) lines.push(`  Platí jen když: ${finding.appliesWhen}`)
      lines.push(`  ${finding.law}`)
    }
    lines.push('')
  }

  if (audit.notFound.length > 0) {
    lines.push('### V textu NENALEZENO — ověř, zda skutečně chybí', '')
    for (const finding of audit.notFound) {
      lines.push(`- ${finding.requirement}`)
      if (finding.appliesWhen) lines.push(`  Platí jen když: ${finding.appliesWhen}`)
      lines.push(`  ${finding.law}`)
    }
    lines.push('')
  }

  if (audit.prohibitedPresent.length === 0 && audit.notFound.length === 0) {
    lines.push(
      'Strojová kontrola nenašla žádný problém. To neznamená, že smlouva je v pořádku — ' +
        'ověřuje jen přítomnost vyjmenovaných prvků.',
      '',
    )
  }

  lines.push(
    '**Jak s tím naložit:** vyhledávání pozná přítomnost formulace, ne její správnost. ' +
      'Než označíš nenalezený prvek za chybějící, ověř v textu, zda tam není vyjádřen jinými slovy. ' +
      'Podmíněná pravidla („Platí jen když…") uplatni jen tehdy, když podmínka skutečně nastala.',
  )

  return lines.join('\n')
}
