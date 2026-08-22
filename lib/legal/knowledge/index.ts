/**
 * Czech contract-law knowledge base — public entry point
 *
 * One body of rules, two audiences. The drafting prompt needs to know what the
 * document must contain; the review prompt needs to know what to look for in a
 * document somebody else wrote. Rendering those separately keeps each prompt to
 * the half it can act on, which matters because these strings are sent on every
 * single request — and the token bill is the running cost of this product.
 *
 * See docs/PRAVNI_ZDROJE.md for sources and the maintenance schedule.
 */

import type { ContractFamily } from '@/lib/contracts/types'
import type { ContractLegalProfile, LegalProfileKey, LegalRule, RuleKind } from './types'
import { CONSEQUENCE_LABEL } from './types'
import { COMMON_PROFILE } from './common'
import { SALE_PROFILE } from './profiles/sale'
import { TENANCY_PROFILE } from './profiles/tenancy'
import { EMPLOYMENT_PROFILE } from './profiles/employment'
import { SERVICES_PROFILE } from './profiles/services'
import { NDA_PROFILE } from './profiles/nda'
import { EMPLOYMENT_AGREEMENT_PROFILE } from './profiles/employmentAgreement'

export * from './types'
export { COMMON_PROFILE }

// ─── Registry ─────────────────────────────────────────────────────────────────

export const CONTRACT_PROFILES: Record<LegalProfileKey, ContractLegalProfile> = {
  sale: SALE_PROFILE,
  tenancy: TENANCY_PROFILE,
  employment: EMPLOYMENT_PROFILE,
  services: SERVICES_PROFILE,
  nda: NDA_PROFILE,
  'employment-agreement': EMPLOYMENT_AGREEMENT_PROFILE,
}

export const ALL_PROFILES: ReadonlyArray<ContractLegalProfile> = Object.values(CONTRACT_PROFILES)

export function getContractProfile(family: LegalProfileKey): ContractLegalProfile {
  return CONTRACT_PROFILES[family]
}

// ─── Type detection from free text ────────────────────────────────────────────

/**
 * How a contract type is recognised in free text.
 *
 * Two tiers, because scoring alone got this wrong in production. A real dohoda
 * o provedeni prace was classified as employment: it says "zamestnanec",
 * "zamestnavatel" and "mzda" three times over, and names its own type once.
 * Scoring handed it the pracovni-smlouva checklist, which then reported lawful
 * clauses as breaches of provisions that do not apply to it.
 *
 * A `decisive` phrase is a document naming itself. Nothing outscores that.
 * `supporting` phrases only break ties among documents that never said what
 * they were.
 */
interface FamilySignals {
  family: LegalProfileKey
  /** Phrases that settle the question outright, checked in list order. */
  decisive: string[]
  /** Weaker vocabulary, scored only when no decisive phrase appears. */
  supporting: string[]
}

const FAMILY_SIGNALS: ReadonlyArray<FamilySignals> = [
  {
    // Before 'employment' — a dohoda shares almost all of its vocabulary.
    family: 'employment-agreement',
    decisive: [
      'dohoda o provedení práce',
      'dohoda o pracovní činnosti',
      'dohody o provedení práce',
      'dohody o pracovní činnosti',
    ],
    supporting: ['dpp', 'dpč'],
  },
  {
    family: 'employment',
    // 'pracovní poměr' is deliberately NOT decisive: a dohoda routinely
    // contains the phrase in order to deny it ("nezakládá pracovní poměr").
    decisive: ['pracovní smlouva', 'pracovní smlouvu'],
    supporting: ['pracovní poměr', 'zaměstnanec', 'zaměstnavatel', 'zkušební doba', 'mzda'],
  },
  {
    family: 'tenancy',
    decisive: ['nájemní smlouva', 'nájemní smlouvu', 'smlouva o nájmu'],
    supporting: ['nájemce', 'pronajímatel', 'nájemné', 'podnájem', 'jistota', 'kauce'],
  },
  {
    family: 'nda',
    decisive: ['dohoda o mlčenlivosti', 'smlouva o mlčenlivosti', 'non-disclosure'],
    supporting: ['mlčenlivost', 'nda', 'důvěrné informace', 'obchodní tajemství'],
  },
  {
    family: 'services',
    decisive: ['smlouva o dílo', 'smlouvu o dílo'],
    supporting: ['zhotovitel', 'objednatel', 'dílo'],
  },
  {
    family: 'sale',
    decisive: ['kupní smlouva', 'kupní smlouvu'],
    supporting: ['prodávající', 'kupující', 'kupní cena'],
  },
]

/**
 * Best-effort mapping from a user-supplied type hint (or raw contract text) to a
 * known profile. Returns null when nothing matches clearly — the review then
 * falls back to the common rules, which is always safe. Guessing wrong is not:
 * the wrong checklist reports lawful clauses as defects.
 */
/**
 * Lowercases and strips diacritics.
 *
 * Transcription from a photograph loses accents when the image is poor, and a
 * document that reads "dohoda o provedeni prace" is still a dohoda. Comparing
 * both sides stripped costs nothing and removes a whole class of misreads.
 */
function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '') // combining marks left by NFD
}

/**
 * True when the phrase appears at the start of a word.
 *
 * A plain substring search put "nda" inside "kalendarnim" and classified a
 * dohoda as an NDA. Anchoring the front stops that; leaving the back open keeps
 * Czech inflection working, so "zamestnanec" still matches "zamestnancem".
 */
function containsPhrase(haystack: string, phrase: string): boolean {
  const escaped = phrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  return new RegExp(`\\b${escaped}`).test(haystack)
}

export function resolveContractFamily(text: string): LegalProfileKey | null {
  if (!text) return null
  const haystack = normalize(text)

  // A document that names its own type has answered the question — unless two
  // of them do, which is genuine ambiguity rather than a race won by list order.
  const named = FAMILY_SIGNALS.filter(({ decisive }) =>
    decisive.some((phrase) => containsPhrase(haystack, normalize(phrase))),
  )
  if (named.length === 1) return named[0].family
  if (named.length > 1) return null

  const scores = FAMILY_SIGNALS.map(({ family, supporting }) => ({
    family,
    score: supporting.reduce(
      (total, kw) => (containsPhrase(haystack, normalize(kw)) ? total + 1 : total),
      0,
    ),
  })).filter((entry) => entry.score > 0)

  if (scores.length === 0) return null

  scores.sort((a, b) => b.score - a.score)

  // A single weak signal shared by several types is not enough to commit.
  if (scores.length > 1 && scores[0].score === scores[1].score) return null

  return scores[0].family
}

// ─── Rendering: drafting ──────────────────────────────────────────────────────

/** Kinds the drafter must satisfy, in the order they matter. */
const DRAFTING_KINDS: RuleKind[] = ['essential', 'form', 'prohibited', 'mandatory', 'default', 'recommended']

const KIND_HEADING: Record<RuleKind, string> = {
  essential: 'PODSTATNÉ NÁLEŽITOSTI — bez nich smlouva nevznikne',
  form: 'FORMA',
  prohibited: 'CO SMLOUVA NESMÍ OBSAHOVAT',
  mandatory: 'KOGENTNÍ LIMITY — nelze se od nich odchýlit',
  default: 'ZÁKONNÁ PRAVIDLA, KTERÁ PLATÍ I BEZ UJEDNÁNÍ',
  recommended: 'DOPORUČENÁ UJEDNÁNÍ',
}

function renderRule(rule: LegalRule, includeCheck: boolean): string {
  const parts = [`- ${rule.requirement}`]
  if (rule.appliesWhen) parts.push(`  Platí jen když: ${rule.appliesWhen}`)
  parts.push(`  Následek: ${CONSEQUENCE_LABEL[rule.consequence]} — ${rule.law}`)
  if (includeCheck && rule.reviewCheck) parts.push(`  Na co se dívat: ${rule.reviewCheck}`)
  return parts.join('\n')
}

function renderGrouped(rules: LegalRule[], includeCheck: boolean): string {
  const blocks: string[] = []

  for (const kind of DRAFTING_KINDS) {
    const inKind = rules.filter((r) => r.kind === kind)
    if (inKind.length === 0) continue
    blocks.push(
      `### ${KIND_HEADING[kind]}\n\n` + inKind.map((r) => renderRule(r, includeCheck)).join('\n'),
    )
  }

  return blocks.join('\n\n')
}

/**
 * Legal requirements for drafting a contract of this type. Omits the review
 * checks — the drafter has no use for them and they would double the size.
 */
export function renderKnowledgeForDrafting(family: ContractFamily): string {
  const profile = getContractProfile(family)

  return [
    `## Právní požadavky — ${profile.label}`,
    '',
    `Právní základ: ${profile.primaryLaw}`,
    `Podstata: ${profile.characterisation}`,
    '',
    renderGrouped(profile.rules, false),
    '',
    '### Obecná pravidla platná pro každou smlouvu',
    '',
    renderGrouped(
      COMMON_PROFILE.rules.filter((r) => r.kind !== 'recommended'),
      false,
    ),
  ].join('\n')
}

// ─── Rendering: review ────────────────────────────────────────────────────────

/**
 * Checklist for reviewing an existing contract. Only rules that are actually
 * checkable in a finished text — a rule without a `reviewCheck` is drafting
 * guidance and would only invite the model to report it as "missing".
 */
export function renderKnowledgeForReview(family: LegalProfileKey | null): string {
  const commonCheckable = COMMON_PROFILE.rules.filter((r) => r.reviewCheck)

  if (!family) {
    return [
      '## Kontrolní seznam — obecná pravidla českého smluvního práva',
      '',
      'Typ smlouvy se nepodařilo spolehlivě určit. Použij pouze obecná pravidla ' +
        'a nedomýšlej požadavky specifické pro konkrétní smluvní typ.',
      '',
      renderGrouped(commonCheckable, true),
    ].join('\n')
  }

  const profile = getContractProfile(family)
  const typeCheckable = profile.rules.filter((r) => r.reviewCheck)

  return [
    `## Kontrolní seznam — ${profile.label}`,
    '',
    `Právní základ: ${profile.primaryLaw}`,
    '',
    'Projdi tento seznam bod po bodu. U každého zjištění použij přesně ten následek, ' +
      'který je zde uveden — nezaměňuj neplatnost, nepřihlížení a odstoupení od smlouvy.',
    '',
    renderGrouped(typeCheckable, true),
    '',
    '### Obecná pravidla platná pro každou smlouvu',
    '',
    renderGrouped(commonCheckable, true),
  ].join('\n')
}
