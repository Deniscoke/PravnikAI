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
import { KUPNI_SMLOUVA } from './kupniSmlouva'
import { NAJEMNI_SMLOUVA } from './najemniSmlouva'
import { SMLOUVA_O_DILO } from './smlouvaODilo'
import { NDA_SMLOUVA } from './ndaSmlouva'
import { PRACOVNI_SMLOUVA } from './pracovniSmlouva'
import { KUPNI_SMLOUVA_AUTO } from './kupniSmlouvaAuto'
import { DOHODA_O_PROVEDENI_PRACE } from './dohodaOProvedeniPrace'
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

export const CONTRACT_GUIDES: ReadonlyArray<ContractGuide> = [
  KUPNI_SMLOUVA,
  NAJEMNI_SMLOUVA,
  SMLOUVA_O_DILO,
  NDA_SMLOUVA,
  PRACOVNI_SMLOUVA,
  KUPNI_SMLOUVA_AUTO,
  DOHODA_O_PROVEDENI_PRACE,
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
]

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
