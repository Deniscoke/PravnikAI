/**
 * Shape of a /vzory/* landing page.
 *
 * Editorial rules, which are the same honesty the rest of the product follows:
 *   - describe what the law requires, never advise on a specific case
 *   - cite the provision so the reader can verify it
 *   - always end at "a working draft, have a lawyer check it"
 */

export interface GuideSection {
  title: string
  body: string
  /** Statutory reference shown as a small tag, e.g. "§ 2079 NOZ" */
  law?: string
}

export interface GuideFaq {
  question: string
  answer: string
}

export interface ContractGuide {
  /** URL segment: /cs/vzory/<slug> */
  slug: string
  /** Contract type in the generator this page sends people to */
  generatorHint: string
  /** <title> */
  metaTitle: string
  metaDescription: string
  h1: string
  perex: string
  legalBasis: string
  mustContain: GuideSection[]
  pitfalls: GuideSection[]
  faq: GuideFaq[]
}
