/**
 * Shape of the Czech contract-law knowledge base — Právo365
 *
 * WHY THIS EXISTS
 *
 * Legal knowledge used to live in three places that did not know about each
 * other: a hand-written checklist inside every schema's `aiInstructions`, a
 * handful of numeric checks in the validators, and nothing at all on the review
 * side — the reviewer prompt was entirely generic. That is why a contract this
 * app generated could be flagged by this app's own review: the drafter and the
 * reviewer were working from different assumptions.
 *
 * This module is the shared source. Both prompts render from it, so a rule
 * written once applies to drafting and to review at the same time.
 *
 * THE CONSEQUENCE TAXONOMY IS THE POINT
 *
 * The model repeatedly conflated invalidity, withdrawal and statutory
 * disregard. Those are three different institutes with three different
 * triggers, and getting them wrong produces advice that sounds authoritative
 * and is simply wrong. Encoding the consequence as a closed union rather than
 * free text means the wording is supplied, not invented.
 */

import type { ContractFamily } from '@/lib/contracts/types'

/**
 * Key for a body of legal rules.
 *
 * Currently identical to ContractFamily, and kept as its own name because the
 * two answer different questions: a family is something the generator offers,
 * a profile is something the review can recognise. Review has to cope with
 * whatever people upload, so the day a type is worth recognising but not worth
 * generating, it is added here alone.
 */
export type LegalProfileKey = ContractFamily

/**
 * What happens when a rule is not respected.
 *
 * Ordered from most to least severe. The string values are deliberately
 * Czech-facing labels — they are rendered straight into prompts and into the
 * review output, so the model never has to phrase the consequence itself.
 */
export type LegalConsequence =
  /** The contract never came into existence — an essential element is absent (§ 1726 NOZ). */
  | 'nevznikne'
  /** The provision (or the contract) is invalid — a defect at formation (§ 580, § 588 NOZ). */
  | 'neplatnost'
  /** The law disregards the clause even though the parties agreed on it (e.g. § 2239 NOZ). */
  | 'neprihlizi-se'
  /** Valid and enforceable, but materially disadvantageous or disputable. */
  | 'riziko'
  /** Not required by law; established practice that prevents disputes. */
  | 'doporuceni'

/** Human-readable explanation of each consequence, rendered into prompts. */
export const CONSEQUENCE_LABEL: Record<LegalConsequence, string> = {
  nevznikne: 'BEZ TOHOTO SMLOUVA NEVZNIKNE (podstatná náležitost)',
  neplatnost: 'NEPLATNÉ USTANOVENÍ',
  'neprihlizi-se': 'ZÁKON K TOMU NEPŘIHLÍŽÍ (i když si to strany ujednaly)',
  riziko: 'PLATNÉ, ALE RIZIKOVÉ',
  doporuceni: 'DOPORUČENO (není zákonná povinnost)',
}

/** What kind of requirement this is — drives how it renders in each prompt. */
export type RuleKind =
  /** Podstatná náležitost — without it there is no contract. */
  | 'essential'
  /** Form requirement (writing, one deed, authenticated signatures). */
  | 'form'
  /** A clause that must not appear, or that the law strikes out. */
  | 'prohibited'
  /** A mandatory floor or ceiling the parties cannot contract around. */
  | 'mandatory'
  /** A statutory default that applies unless the parties agree otherwise. */
  | 'default'
  /** Established drafting practice. */
  | 'recommended'

export interface LegalRule {
  /** Stable identifier — referenced by tests and by review output. */
  id: string
  kind: RuleKind
  /** The requirement itself, in Czech, phrased for a lay reader. */
  requirement: string
  consequence: LegalConsequence
  /** Provision this follows from. Always cite; never leave empty. */
  law: string
  /**
   * What to look for when reviewing somebody else's contract. Present only
   * where the rule is actually checkable in a finished text — a rule without
   * this is drafting guidance, not a review item.
   */
  reviewCheck?: string
  /**
   * Limits the rule to a subset of cases (e.g. only real estate, only
   * consumers). Rendered verbatim so the model does not over-apply it.
   */
  appliesWhen?: string
  /**
   * Pattern that finds this element in a finished contract, letting the
   * deterministic audit answer "is it there?" without asking the model.
   *
   * Present only where a match is genuinely reliable. A loose pattern is worse
   * than none: the audit is presented to the model as established fact, so a
   * false negative becomes a confidently reported missing clause.
   */
  detect?: RegExp
}

/**
 * A provision that specifically does NOT govern this contract type.
 *
 * Exists because the damaging failure is not a missing citation but a
 * plausible wrong one. A review of a dohoda cited § 213 and § 51 — real
 * provisions, correctly quoted, and simply not applicable — and reported a
 * lawful contract as defective twice over. Listing them lets that be caught
 * deterministically.
 */
export interface InapplicableProvision {
  /** Section number as it appears in citations, e.g. '213'. */
  section: string
  /** Act the section belongs to, e.g. '262/2006'. */
  law: string
  /** Shown to the user when a finding rests on it. */
  why: string
}

export interface ContractLegalProfile {
  family: LegalProfileKey
  /** Czech name, as it appears to users. */
  label: string
  /** Statutory home of this contract type. */
  primaryLaw: string
  /** One-line description of what distinguishes this type. */
  characterisation: string
  rules: LegalRule[]
  /** Provisions that do not govern this type, however plausible they look. */
  inapplicable?: InapplicableProvision[]
  /** Where the rules were verified. */
  sources: string[]
  /** Date a human last checked this profile against the sources (ISO). */
  lastVerified: string
}

/** Rules that apply to every contract regardless of type. */
export interface CommonLegalProfile {
  rules: LegalRule[]
  sources: string[]
  lastVerified: string
}
