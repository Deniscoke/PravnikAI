/**
 * Rejects review findings that rest on a provision which does not govern the
 * contract being reviewed.
 *
 * THE FAILURE THIS EXISTS FOR
 *
 * A real dohoda o provedení práce came back with two high-severity findings:
 * no four weeks' leave, contrary to § 213, and no notice period, contrary to
 * § 51. Both provisions are real, both were quoted correctly, and neither
 * governs a dohoda — leave follows § 77 odst. 8 and termination § 77 odst. 4.
 * The contract was lawful and the review said it was broken, twice.
 *
 * That is the worst way this product can fail, and it is not a hallucination in
 * the usual sense: nothing was made up. The model reached for the most familiar
 * provision on the topic. Prompt instructions reduce it; only a check removes it.
 *
 * Deliberately narrow. It fires only on provisions a profile explicitly lists
 * as inapplicable, never on unfamiliar ones — a citation this codebase does not
 * recognise is far more likely to be knowledge we lack than an error.
 */

import { getContractProfile, type LegalProfileKey } from '@/lib/legal/knowledge'

export interface CitationIssue {
  /** Section as cited, e.g. '213'. */
  section: string
  /** Act it belongs to, e.g. '262/2006'. */
  law: string
  /** Why it does not apply here — written for the log, not the user. */
  why: string
}

/**
 * Finds section references in Czech legal prose.
 *
 * Matches "§ 213", "§ 77 odst. 8", "§ 2079 a násl.". The section number is all
 * that matters; the paragraph breakdown never changes which act applies.
 */
const SECTION_PATTERN = /§\s*(\d+)([a-z])?/gi

/** Matches an act reference: "zák. č. 262/2006 Sb." or a bare "262/2006". */
const ACT_PATTERN = /(\d{1,3}\/\d{4})/g

/**
 * True when the text cites a provision the profile rules out.
 *
 * Requires the act to be named somewhere in the text, or to be the only act the
 * profile declares inapplicable — otherwise "§ 51" in a lease review, where the
 * number belongs to an entirely different code, would be flagged wrongly.
 */
export function findInapplicableCitations(
  text: string,
  family: LegalProfileKey | null,
): CitationIssue[] {
  if (!text || !family) return []

  const inapplicable = getContractProfile(family).inapplicable
  if (!inapplicable || inapplicable.length === 0) return []

  const citedSections = new Set(
    Array.from(text.matchAll(SECTION_PATTERN)).map((match) => match[1]),
  )
  if (citedSections.size === 0) return []

  const citedActs = new Set(Array.from(text.matchAll(ACT_PATTERN)).map((match) => match[1]))

  return inapplicable.filter((entry) => {
    if (!citedSections.has(entry.section)) return false
    // If the text names any act at all, it has to be the one this rule is about.
    if (citedActs.size > 0 && !citedActs.has(entry.law)) return false
    return true
  })
}

interface Discardable {
  title?: string
  explanation?: string
  reason?: string
}

/** Everything a finding says, joined for scanning. */
function findingText(finding: Discardable): string {
  return [finding.title, finding.explanation, finding.reason].filter(Boolean).join(' ')
}

/**
 * Drops findings built on an inapplicable provision.
 *
 * Dropping rather than annotating, because there is nothing salvageable: the
 * reasoning starts from a rule that does not apply, so the conclusion does not
 * survive removing it. Leaving it in with a caveat would still tell the user
 * their lawful contract has a defect.
 */
export function dropInapplicableFindings<T extends Discardable>(
  findings: T[],
  family: LegalProfileKey | null,
  label: string,
): T[] {
  if (!family) return findings

  return findings.filter((finding) => {
    const issues = findInapplicableCitations(findingText(finding), family)
    if (issues.length === 0) return true

    console.warn(
      `[review] Discarded ${label} "${finding.title ?? '?'}" — rests on ` +
        issues.map((i) => `§ ${i.section} (${i.law})`).join(', ') +
        `, which does not govern this contract type`,
    )
    return false
  })
}

/** Removes inapplicable provisions from the cited legal basis. */
export function filterLegalBasis(
  legalBasis: string[],
  family: LegalProfileKey | null,
): string[] {
  if (!family) return legalBasis
  return legalBasis.filter((citation) => findInapplicableCitations(citation, family).length === 0)
}
