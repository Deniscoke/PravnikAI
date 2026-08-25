/**
 * Content for the /vzory/* landing pages.
 *
 * These pages target what people actually search for ("kupni smlouva vzor",
 * "co musi obsahovat kupni smlouva") and route that traffic into the
 * generator. One module per guide: they were a single file until it passed a
 * thousand lines and every new contract type added another hundred.
 */

export type { ContractGuide, GuideSection, GuideFaq } from './types'

import type { ContractGuide } from './types'
import { getAllSchemas } from '@/lib/contracts/contractSchemas'
import type { ContractCategory } from '@/lib/contracts/types'
import { CONTRACT_PROFILES } from '@/lib/legal/knowledge'
import { KUPNI_SMLOUVA } from './kupniSmlouva'
import { NAJEMNI_SMLOUVA } from './najemniSmlouva'
import { SMLOUVA_O_DILO } from './smlouvaODilo'
import { NDA_SMLOUVA } from './ndaSmlouva'
import { PRACOVNI_SMLOUVA } from './pracovniSmlouva'
import { KUPNI_SMLOUVA_AUTO } from './kupniSmlouvaAuto'
import { DOHODA_O_PROVEDENI_PRACE } from './dohodaOProvedeniPrace'
import { DOHODA_O_PRACOVNI_CINNOSTI } from './dohodaOPracovniCinnosti'
import { SMLOUVA_O_ZAPUJCCE } from './smlouvaOZapujcce'
import { DAROVACI_SMLOUVA } from './darovaciSmlouva'
import { PLNA_MOC } from './plnaMoc'
import { ZPRACOVATELSKA_SMLOUVA } from './zpracovatelskaSmlouva'
import { VYPOVED_Z_PRACOVNIHO_POMERU } from './vypovedZPracovnihoPomeru'
import { VYPOVED_Z_NAJMU } from './vypovedZNajmu'
import { ZRUSENI_DOHODY } from './zruseniDohody'
import { ODSTOUPENI_OD_SMLOUVY } from './odstoupeniOdSmlouvy'
import { REKLAMACE } from './reklamace'
import { PREDZALOBNI_VYZVA } from './predzalobniVyzva'
import { SMLOUVA_O_POSKYTOVANI_SLUZEB } from './smlouvaOPoskytovaniSluzeb'
import { UZNANI_DLUHU } from './uznaniDluhu'
import { DOHODA_O_ROZVAZANI } from './dohodaORozvazani'
import { NAJEM_PROSTORU_PODNIKANI } from './najemProstoruPodnikani'
import { SMLOUVA_O_SMLOUVE_BUDOUCI } from './smlouvaOSmlouveBudouci'
import { LICENCNI_SMLOUVA } from './licencniSmlouva'

export const CONTRACT_GUIDES: ReadonlyArray<ContractGuide> = [
  KUPNI_SMLOUVA,
  NAJEMNI_SMLOUVA,
  SMLOUVA_O_DILO,
  NDA_SMLOUVA,
  PRACOVNI_SMLOUVA,
  KUPNI_SMLOUVA_AUTO,
  DOHODA_O_PROVEDENI_PRACE,
  DOHODA_O_PRACOVNI_CINNOSTI,
  SMLOUVA_O_ZAPUJCCE,
  DAROVACI_SMLOUVA,
  PLNA_MOC,
  ZPRACOVATELSKA_SMLOUVA,
  VYPOVED_Z_PRACOVNIHO_POMERU,
  VYPOVED_Z_NAJMU,
  ZRUSENI_DOHODY,
  ODSTOUPENI_OD_SMLOUVY,
  REKLAMACE,
  PREDZALOBNI_VYZVA,
  SMLOUVA_O_POSKYTOVANI_SLUZEB,
  UZNANI_DLUHU,
  DOHODA_O_ROZVAZANI,
  NAJEM_PROSTORU_PODNIKANI,
  SMLOUVA_O_SMLOUVE_BUDOUCI,
  LICENCNI_SMLOUVA,
]

/**
 * The contract type a guide sends people to.
 *
 * Guides and schemas are joined by name rather than by id — the guides test
 * guarantees every generatorHint matches one — so this lookup is total in
 * practice and returns undefined only while a guide is being written.
 */
function schemaFor(guide: ContractGuide) {
  return getAllSchemas().find((s) => s.metadata.name === guide.generatorHint)
}

/** Category a guide belongs to, taken from the contract type it leads to. */
export function guideCategory(guide: ContractGuide): ContractCategory {
  return schemaFor(guide)?.metadata.category ?? 'civil'
}

/**
 * Guides grouped for the /vzory hub, in a fixed order.
 *
 * The order is deliberate rather than alphabetical: civil law covers the
 * documents most people arrive looking for, and putting employment third keeps
 * the two lease-shaped categories away from each other.
 */
export const GUIDE_CATEGORY_ORDER: ReadonlyArray<ContractCategory> = [
  'civil',
  'employment',
  'realestate',
  'commercial',
]

export function guidesByCategory(): ReadonlyArray<{
  category: ContractCategory
  guides: ReadonlyArray<ContractGuide>
}> {
  return GUIDE_CATEGORY_ORDER.map((category) => ({
    category,
    guides: CONTRACT_GUIDES.filter((guide) => guideCategory(guide) === category),
  })).filter((group) => group.guides.length > 0)
}

/**
 * Other guides worth linking from this one.
 *
 * Same category first, because that is where a reader's next question usually
 * lives — someone reading about a notice of termination is more likely to want
 * the contract it ends than a licence agreement. Without this every guide is an
 * island: a crawler reaching one has no path to the other twenty-two, and a
 * reader who landed on the wrong one has to go back to search.
 */
export function relatedGuides(guide: ContractGuide, limit = 4): ReadonlyArray<ContractGuide> {
  const category = guideCategory(guide)
  const sameCategory = CONTRACT_GUIDES.filter(
    (other) => other.slug !== guide.slug && guideCategory(other) === category,
  )
  const rest = CONTRACT_GUIDES.filter(
    (other) => other.slug !== guide.slug && guideCategory(other) !== category,
  )
  return [...sameCategory, ...rest].slice(0, limit)
}

/**
 * When the law behind a guide was last checked against the statute.
 *
 * Used as the sitemap's lastModified. It is the honest answer to "when did
 * this page's content last change": the prose follows the profile, and the
 * profile records the date a human read the provision. Falling back to the
 * deploy date would claim a change that did not happen.
 */
export function guideLastVerified(guide: ContractGuide): Date | undefined {
  const family = schemaFor(guide)?.metadata.contractFamily
  const verified = family ? CONTRACT_PROFILES[family]?.lastVerified : undefined
  return verified ? new Date(verified) : undefined
}

/** Looks a guide up by its URL segment. */
export function getContractGuide(slug: string): ContractGuide | undefined {
  return CONTRACT_GUIDES.find((guide) => guide.slug === slug)
}

/**
 * Wording for a page that may not be about a contract at all.
 *
 * A reklamace, a výpověď and a plná moc are one-sided acts, so a button reading
 * "Vytvořit návrh smlouvy" is simply wrong on a third of these pages. The
 * schema already records which is which via documentKind, and the guides test
 * guarantees generatorHint names a real one — so derive it rather than letting
 * each page guess.
 */
export function guideCopy(guide: ContractGuide): {
  generateCta: string
  reviewCta: string
  pickTypeStep: string
} {
  const schema = getAllSchemas().find((s) => s.metadata.name === guide.generatorHint)

  if (schema?.metadata.documentKind === 'unilateral') {
    return {
      generateCta: 'Vytvořit dokument',
      reviewCta: 'Zkontrolovat existující dokument',
      pickTypeStep: 'Vyberte typ dokumentu',
    }
  }

  return {
    generateCta: 'Vytvořit návrh smlouvy',
    reviewCta: 'Zkontrolovat existující smlouvu',
    pickTypeStep: 'Vyberte typ smlouvy',
  }
}
