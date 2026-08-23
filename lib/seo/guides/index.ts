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
]

/** Looks a guide up by its URL segment. */
export function getContractGuide(slug: string): ContractGuide | undefined {
  return CONTRACT_GUIDES.find((guide) => guide.slug === slug)
}
