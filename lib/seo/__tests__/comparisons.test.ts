/**
 * A comparison page has one job: tell the reader which of two documents they
 * need. These check it actually does that — that the verdict exists, that both
 * guides it names are real, and that the links run in both directions.
 *
 * The last one matters most. A comparison that points at two guides while
 * neither points back leaves the reader who arrived at a guide first with no
 * idea the page answering their real question exists.
 */

import { describe, it, expect } from 'vitest'
import { COMPARISONS, comparisonsForGuide, getComparison } from '../comparisons'
import { CONTRACT_GUIDES, getContractGuide } from '../guides'

describe('every comparison points at real guides', () => {
  it.each(COMPARISONS.map((c) => [c.slug, c] as const))('%s names two existing guides', (_s, c) => {
    expect(getContractGuide(c.leftGuideSlug), `left: ${c.leftGuideSlug}`).toBeDefined()
    expect(getContractGuide(c.rightGuideSlug), `right: ${c.rightGuideSlug}`).toBeDefined()
    expect(c.leftGuideSlug).not.toBe(c.rightGuideSlug)
  })

  it('has unique, URL-safe slugs', () => {
    const slugs = COMPARISONS.map((c) => c.slug)
    expect(new Set(slugs).size).toBe(slugs.length)
    for (const slug of slugs) expect(slug).toMatch(/^[a-z0-9-]+$/)
  })

  it('is reachable by slug', () => {
    for (const comparison of COMPARISONS) {
      expect(getComparison(comparison.slug)).toBe(comparison)
    }
  })
})

describe('the links run both ways', () => {
  it('lets each named guide find the comparison again', () => {
    for (const comparison of COMPARISONS) {
      for (const guideSlug of [comparison.leftGuideSlug, comparison.rightGuideSlug]) {
        const back = comparisonsForGuide(guideSlug).map((c) => c.slug)
        expect(back, `${guideSlug} cannot reach ${comparison.slug}`).toContain(comparison.slug)
      }
    }
  })

  it('never returns a comparison for a guide it does not name', () => {
    const named = new Set(
      COMPARISONS.flatMap((c) => [c.leftGuideSlug, c.rightGuideSlug]),
    )
    for (const guide of CONTRACT_GUIDES) {
      if (named.has(guide.slug)) continue
      expect(comparisonsForGuide(guide.slug)).toEqual([])
    }
  })
})

describe('a comparison answers the question', () => {
  it.each(COMPARISONS.map((c) => [c.slug, c] as const))('%s states a verdict', (_s, c) => {
    // The whole point of the page. A table without an answer makes the reader
    // do the work they came here to avoid.
    expect(c.verdict.length).toBeGreaterThan(80)
  })

  it.each(COMPARISONS.map((c) => [c.slug, c] as const))('%s compares enough to be useful', (_s, c) => {
    expect(c.rows.length).toBeGreaterThanOrEqual(6)
    expect(c.chooseLeft.bullets.length).toBeGreaterThanOrEqual(3)
    expect(c.chooseRight.bullets.length).toBeGreaterThanOrEqual(3)
    expect(c.pitfalls.length).toBeGreaterThanOrEqual(4)
    expect(c.faq.length).toBeGreaterThanOrEqual(5)
  })

  it.each(COMPARISONS.map((c) => [c.slug, c] as const))('%s fills both sides of every row', (_s, c) => {
    for (const row of c.rows) {
      expect(row.criterion.length, `${c.slug}: empty criterion`).toBeGreaterThan(2)
      expect(row.left.length, `${c.slug}/${row.criterion}: empty left`).toBeGreaterThan(0)
      expect(row.right.length, `${c.slug}/${row.criterion}: empty right`).toBeGreaterThan(0)
    }
  })

  it.each(COMPARISONS.map((c) => [c.slug, c] as const))('%s cites the law it rests on', (_s, c) => {
    expect(c.legalBasis).toMatch(/§|zák\. č\./)
    const cited = c.rows.filter((row) => row.law).length
    expect(cited, `${c.slug} cites too few rows`).toBeGreaterThanOrEqual(
      Math.ceil(c.rows.length / 2),
    )
  })

  it.each(COMPARISONS.map((c) => [c.slug, c] as const))('%s has meta that fits a result', (_s, c) => {
    expect(c.metaTitle.length, `${c.slug} title too long`).toBeLessThanOrEqual(70)
    expect(c.metaDescription.length, `${c.slug} description too long`).toBeLessThanOrEqual(170)
    expect(c.metaDescription.length).toBeGreaterThan(70)
  })

  it.each(COMPARISONS.map((c) => [c.slug, c] as const))('%s answers its own questions', (_s, c) => {
    for (const faq of c.faq) {
      expect(faq.question).toMatch(/\?$/)
      expect(faq.answer.length, `"${faq.question}" answered too thinly`).toBeGreaterThan(40)
    }
  })

  it('never uses Slovak terminology', () => {
    const slovakisms = /\bzmluv|\bnájomn|\bvýpoveď\b|\bzákonník\b|\bposkytovateľ/i
    for (const c of COMPARISONS) {
      const text = [
        c.perex,
        c.verdict,
        ...c.rows.flatMap((r) => [r.left, r.right]),
        ...c.pitfalls.map((p) => p.body),
        ...c.faq.map((f) => f.answer),
      ].join(' ')
      expect(text, `${c.slug} contains Slovak wording`).not.toMatch(slovakisms)
    }
  })
})
