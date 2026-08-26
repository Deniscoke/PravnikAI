/**
 * Content for the /porovnani/* pages.
 *
 * These answer the question that comes before "what must this contract
 * contain" — namely "which of these two do I need". It is a different search
 * with different intent, and it is the one people type first.
 *
 * Every comparison names two guides, and those guides link back to it, so the
 * landing pages form a graph rather than a flat list.
 */

export type { Comparison, ComparisonRow, ComparisonChoice } from './types'

import type { Comparison } from './types'
import { DPP_NEBO_DPC } from './dppNeboDpc'
import { VYPOVED_NEBO_DOHODA } from './vypovedNeboDohoda'
import { ODSTOUPENI_NEBO_VYPOVED } from './odstoupeniNeboVypoved'
import { DILO_NEBO_SLUZBY } from './diloNeboSluzby'
import { REKLAMACE_NEBO_ODSTOUPENI } from './reklamaceNeboOdstoupeni'
import { NAJEM_BYTU_NEBO_PROSTORU } from './najemBytuNeboProstoru'

export const COMPARISONS: ReadonlyArray<Comparison> = [
  DPP_NEBO_DPC,
  VYPOVED_NEBO_DOHODA,
  ODSTOUPENI_NEBO_VYPOVED,
  DILO_NEBO_SLUZBY,
  REKLAMACE_NEBO_ODSTOUPENI,
  NAJEM_BYTU_NEBO_PROSTORU,
]

/** Looks a comparison up by its URL segment. */
export function getComparison(slug: string): Comparison | undefined {
  return COMPARISONS.find((comparison) => comparison.slug === slug)
}

/**
 * Comparisons that mention a given guide, so the guide can link back.
 *
 * The link has to run both ways. A comparison that points at two guides while
 * neither points back leaves the reader who arrived at the guide first with no
 * idea the comparison exists — and it is usually the page that answers their
 * actual question.
 */
export function comparisonsForGuide(guideSlug: string): ReadonlyArray<Comparison> {
  return COMPARISONS.filter(
    (comparison) =>
      comparison.leftGuideSlug === guideSlug || comparison.rightGuideSlug === guideSlug,
  )
}
