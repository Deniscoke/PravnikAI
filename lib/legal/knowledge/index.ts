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
import type { ContractLegalProfile, LegalRule, RuleKind } from './types'
import { CONSEQUENCE_LABEL } from './types'
import { COMMON_PROFILE } from './common'
import { SALE_PROFILE } from './profiles/sale'
import { TENANCY_PROFILE } from './profiles/tenancy'
import { EMPLOYMENT_PROFILE } from './profiles/employment'
import { SERVICES_PROFILE } from './profiles/services'
import { NDA_PROFILE } from './profiles/nda'

export * from './types'
export { COMMON_PROFILE }

// ─── Registry ─────────────────────────────────────────────────────────────────

export const CONTRACT_PROFILES: Record<ContractFamily, ContractLegalProfile> = {
  sale: SALE_PROFILE,
  tenancy: TENANCY_PROFILE,
  employment: EMPLOYMENT_PROFILE,
  services: SERVICES_PROFILE,
  nda: NDA_PROFILE,
}

export const ALL_PROFILES: ReadonlyArray<ContractLegalProfile> = Object.values(CONTRACT_PROFILES)

export function getContractProfile(family: ContractFamily): ContractLegalProfile {
  return CONTRACT_PROFILES[family]
}

// ─── Type detection from free text ────────────────────────────────────────────

/**
 * Keywords that identify a contract type in Czech. Order matters: the first
 * family whose keywords appear wins, so the more specific terms come first.
 *
 * Deliberately conservative. Guessing wrong is worse than not guessing — an
 * employment checklist applied to a lease produces confident nonsense — so
 * anything ambiguous returns null and the review falls back to the common rules.
 */
const FAMILY_KEYWORDS: ReadonlyArray<{ family: ContractFamily; keywords: string[] }> = [
  { family: 'employment', keywords: ['pracovní smlouva', 'pracovní poměr', 'zaměstnanec', 'zaměstnavatel', 'zkušební doba', 'mzda'] },
  { family: 'tenancy', keywords: ['nájemní smlouva', 'nájemce', 'pronajímatel', 'nájemné', 'podnájem', 'jistota', 'kauce'] },
  { family: 'nda', keywords: ['mlčenlivost', 'nda', 'důvěrné informace', 'obchodní tajemství', 'non-disclosure'] },
  { family: 'services', keywords: ['smlouva o dílo', 'zhotovitel', 'objednatel', 'dílo'] },
  { family: 'sale', keywords: ['kupní smlouva', 'prodávající', 'kupující', 'kupní cena'] },
]

/**
 * Best-effort mapping from a user-supplied type hint (or raw contract text) to a
 * known family. Returns null when nothing matches clearly.
 */
export function resolveContractFamily(text: string): ContractFamily | null {
  if (!text) return null
  const haystack = text.toLowerCase()

  const scores = FAMILY_KEYWORDS.map(({ family, keywords }) => ({
    family,
    score: keywords.reduce((total, kw) => (haystack.includes(kw) ? total + 1 : total), 0),
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
export function renderKnowledgeForReview(family: ContractFamily | null): string {
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
