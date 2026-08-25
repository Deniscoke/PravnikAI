/**
 * Shape of a /porovnani page.
 *
 * WHY THESE EXIST SEPARATELY FROM THE GUIDES
 *
 * A guide answers "what must this document contain". A comparison answers the
 * question that comes first and that people actually type: "which of these two
 * do I need". Those are different searches with different intent, and a guide
 * written to satisfy both does neither well.
 *
 * They also earn their place internally. Every comparison links to both guides
 * and both guides link back, so the twenty-four landing pages stop being a flat
 * list and become a graph a reader can move around in.
 *
 * Editorial rules are the guides' rules plus one: a comparison must state its
 * answer. A page that lays out a table and leaves the reader to work it out has
 * not answered the question they asked.
 */

import type { GuideFaq, GuideSection } from '../guides/types'

/** One line of the side-by-side table. */
export interface ComparisonRow {
  /** What is being compared — "Rozsah práce", "Kdy vztah končí". */
  criterion: string
  left: string
  right: string
  /** Provision the row follows from, shown as a small tag. */
  law?: string
}

/** When to pick this side, in the reader's terms rather than the law's. */
export interface ComparisonChoice {
  title: string
  bullets: string[]
}

export interface Comparison {
  /** URL segment: /cs/porovnani/<slug> */
  slug: string
  /** Guides being compared. Both must exist — a test enforces it. */
  leftGuideSlug: string
  rightGuideSlug: string
  /** Short names used in the table header and throughout the prose. */
  leftLabel: string
  rightLabel: string

  metaTitle: string
  metaDescription: string
  h1: string
  perex: string
  legalBasis: string

  /**
   * The answer, in one or two sentences, placed before the table.
   *
   * This is the whole point of the page. A reader who reads nothing else must
   * leave knowing which document they need.
   */
  verdict: string

  rows: ComparisonRow[]
  chooseLeft: ComparisonChoice
  chooseRight: ComparisonChoice
  /** Mistakes that come specifically from picking the wrong one. */
  pitfalls: GuideSection[]
  faq: GuideFaq[]
}
