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
import { LOAN_PROFILE } from './profiles/loan'
import { GIFT_PROFILE } from './profiles/gift'
import { TENANCY_NOTICE_PROFILE } from './profiles/tenancyNotice'
import { POWER_OF_ATTORNEY_PROFILE } from './profiles/powerOfAttorney'
import { DATA_PROCESSING_PROFILE } from './profiles/dataProcessing'
import { EMPLOYMENT_NOTICE_PROFILE } from './profiles/employmentNotice'
import { AGREEMENT_TERMINATION_PROFILE } from './profiles/agreementTermination'
import { WITHDRAWAL_PROFILE } from './profiles/withdrawal'
import { COMPLAINT_PROFILE } from './profiles/complaint'
import { PRE_ACTION_DEMAND_PROFILE } from './profiles/preActionDemand'

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
  loan: LOAN_PROFILE,
  gift: GIFT_PROFILE,
  'tenancy-notice': TENANCY_NOTICE_PROFILE,
  'power-of-attorney': POWER_OF_ATTORNEY_PROFILE,
  'data-processing': DATA_PROCESSING_PROFILE,
  'employment-notice': EMPLOYMENT_NOTICE_PROFILE,
  'agreement-termination': AGREEMENT_TERMINATION_PROFILE,
  withdrawal: WITHDRAWAL_PROFILE,
  complaint: COMPLAINT_PROFILE,
  'pre-action-demand': PRE_ACTION_DEMAND_PROFILE,
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
  /**
   * Families this one overrides when both name themselves in the same text.
   *
   * Some documents necessarily quote another type: a notice of termination
   * identifies the lease it ends, so both "výpověď z nájmu" and "nájemní
   * smlouva" appear. That is nesting, not ambiguity, and treating it as
   * ambiguity would drop the review back to the generic rules on exactly the
   * documents where the specific ones matter most.
   */
  beats?: LegalProfileKey[]
}

const FAMILY_SIGNALS: ReadonlyArray<FamilySignals> = [
  {
    // Before 'employment-agreement' — a termination quotes the dohoda it ends.
    family: 'agreement-termination',
    decisive: [
      'výpověď dohody',
      'zrušení dohody o provedení práce',
      'zrušení dohody o pracovní činnosti',
      'vypovídám dohodu o provedení práce',
      'vypovídám dohodu o pracovní činnosti',
    ],
    supporting: [],
    beats: ['employment-agreement'],
  },
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
    // Before 'employment' — a notice quotes the contract it terminates.
    family: 'employment-notice',
    decisive: [
      'výpověď z pracovního poměru',
      'výpovědi z pracovního poměru',
      'vypovídám pracovní poměr',
    ],
    supporting: [],
    beats: ['employment'],
  },
  {
    family: 'employment',
    // 'pracovní poměr' is deliberately NOT decisive: a dohoda routinely
    // contains the phrase in order to deny it ("nezakládá pracovní poměr").
    decisive: ['pracovní smlouva', 'pracovní smlouvu'],
    supporting: ['pracovní poměr', 'zaměstnanec', 'zaměstnavatel', 'zkušební doba', 'mzda'],
  },
  {
    // Before 'tenancy' — a notice quotes the lease it terminates and would
    // otherwise be checked against the rules for the lease itself.
    family: 'tenancy-notice',
    decisive: ['výpověď z nájmu', 'výpověď nájmu', 'vypovídá nájem', 'výpovědi z nájmu'],
    supporting: ['výpověď'],
    beats: ['tenancy'],
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
  {
    family: 'loan',
    decisive: ['smlouva o zápůjčce', 'smlouvu o zápůjčce', 'smlouva o půjčce', 'smlouvu o půjčce'],
    supporting: ['zapůjčitel', 'vydlužitel', 'zápůjčk', 'zapůjč'],
  },
  {
    family: 'gift',
    decisive: ['darovací smlouva', 'darovací smlouvu'],
    supporting: ['dárce', 'obdarovan', 'darování', 'bezplatně převádí'],
  },
  {
    // Beats every contract type: a withdrawal names the contract it cancels, so
    // otherwise the review would check it against that contract's own rules.
    family: 'withdrawal',
    decisive: ['odstoupení od smlouvy', 'odstupuji od smlouvy', 'odstoupení od kupní smlouvy'],
    supporting: [],
    beats: ['sale', 'services', 'tenancy', 'loan', 'gift', 'nda', 'employment'],
  },
  {
    // Decisive keywords are all first person. A kupni smlouva routinely carries
    // an article headed "Reklamace", so the bare noun would drag every purchase
    // contract into this profile; "reklamuji" only ever appears in the letter.
    // Beats 'withdrawal' because § 2171 is the special rule for walking away
    // from a consumer sale over a defect — § 2001 is the general one.
    family: 'complaint',
    decisive: [
      'reklamuji',
      'reklamujeme',
      'uplatnuji reklamaci',
      'uplatnujeme reklamaci',
      'vytykam vadu',
      'vytykame vadu',
      'uplatnuji prava z vadneho plneni',
    ],
    supporting: ['reklamac', 'vadneho plneni', 'vytknut', 'odstraneni vady'],
    beats: ['sale', 'services', 'withdrawal'],
  },
  {
    // "Výzva k plnění" alone would collide with an odstoupení, which quotes the
    // demand it had to send first under § 2003. "Předžalobní" collides with
    // nothing — no other document uses the word.
    family: 'pre-action-demand',
    decisive: ['předžalobní', 'předžalobní výzva', 'výzva před podáním žaloby'],
    supporting: ['dlužná částka', 'úrok z prodlení', 'jistina', 'věřitel', 'dlužník'],
    beats: ['sale', 'services', 'loan'],
  },
  {
    family: 'power-of-attorney',
    decisive: ['plná moc', 'plnou moc', 'plné moci'],
    supporting: ['zmocnitel', 'zmocněnec', 'zmocňuji'],
  },
  {
    // Before 'nda' — a DPA routinely contains a confidentiality article, and
    // being checked against the NDA profile would miss every Article 28 item.
    family: 'data-processing',
    decisive: [
      'zpracovatelská smlouva',
      'zpracovatelskou smlouvu',
      'smlouva o zpracování osobních údajů',
      'zpracování osobních údajů podle čl. 28',
    ],
    supporting: ['zpracovatel', 'správce osobních údajů', 'gdpr', 'subjekt údajů'],
    beats: ['nda'],
  },
]

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

/**
 * Best-effort mapping from a user-supplied type hint (or raw contract text) to a
 * known profile. Returns null when nothing matches clearly — the review then
 * falls back to the common rules, which is always safe. Guessing wrong is not:
 * the wrong checklist reports lawful clauses as defects.
 */
export function resolveContractFamily(text: string): LegalProfileKey | null {
  if (!text) return null
  const haystack = normalize(text)

  // A document that names its own type has answered the question — unless two
  // of them do, which is genuine ambiguity rather than a race won by list order.
  const named = FAMILY_SIGNALS.filter(({ decisive }) =>
    decisive.some((phrase) => containsPhrase(haystack, normalize(phrase))),
  )

  // Drop any family that a more specific one explicitly overrides. What remains
  // is either a single answer or genuine ambiguity.
  const overridden = new Set(named.flatMap(({ beats }) => beats ?? []))
  const surviving = named.filter(({ family }) => !overridden.has(family))

  if (surviving.length === 1) return surviving[0].family
  if (surviving.length > 1) return null

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
