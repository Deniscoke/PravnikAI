/**
 * The landing pages are the front door: they rank, they get read, and they end
 * with "open the generator and pick <generatorHint>". If that hint names no
 * real contract type, the page sends the reader looking for something that
 * isn't in the list — a dead end no build error would ever catch.
 *
 * The rest of these are the editorial rules from types.ts turned into checks,
 * so that a guide added in a hurry cannot quietly drop the statutory citation
 * that makes the claim verifiable.
 */

import { describe, it, expect } from 'vitest'
import { CONTRACT_GUIDES, getContractGuide } from '../guides'
import { getAllSchemas } from '@/lib/contracts/contractSchemas'

const schemaNames = new Set(getAllSchemas().map((schema) => schema.metadata.name))

describe('every guide leads somewhere', () => {
  it.each(CONTRACT_GUIDES.map((guide) => [guide.slug, guide] as const))(
    '%s points at a contract type that exists',
    (_slug, guide) => {
      expect(schemaNames, `"${guide.generatorHint}" is in no schema`).toContain(
        guide.generatorHint,
      )
    },
  )

  it('has no duplicate slugs', () => {
    const slugs = CONTRACT_GUIDES.map((guide) => guide.slug)
    expect(new Set(slugs).size).toBe(slugs.length)
  })

  it('uses slugs that survive a URL', () => {
    for (const guide of CONTRACT_GUIDES) {
      expect(guide.slug, `${guide.slug} is not URL-safe`).toMatch(/^[a-z0-9-]+$/)
    }
  })

  it('is reachable by slug', () => {
    for (const guide of CONTRACT_GUIDES) {
      expect(getContractGuide(guide.slug)).toBe(guide)
    }
  })
})

describe('editorial rules hold', () => {
  it.each(CONTRACT_GUIDES.map((guide) => [guide.slug, guide] as const))(
    '%s cites the law it rests on',
    (_slug, guide) => {
      expect(guide.legalBasis).toMatch(/§|zák\. č\./)

      // A pitfall is a claim about what goes wrong. Readers deserve to be able
      // to look it up, so most of them carry the provision.
      const cited = guide.pitfalls.filter((pitfall) => pitfall.law).length
      expect(cited, `${guide.slug} cites too few pitfalls`).toBeGreaterThanOrEqual(
        Math.ceil(guide.pitfalls.length / 2),
      )
    },
  )

  it.each(CONTRACT_GUIDES.map((guide) => [guide.slug, guide] as const))(
    '%s says enough to be worth ranking',
    (_slug, guide) => {
      expect(guide.mustContain.length).toBeGreaterThanOrEqual(4)
      expect(guide.pitfalls.length).toBeGreaterThanOrEqual(4)
      expect(guide.faq.length).toBeGreaterThanOrEqual(4)
      expect(guide.perex.length).toBeGreaterThan(120)
    },
  )

  it.each(CONTRACT_GUIDES.map((guide) => [guide.slug, guide] as const))(
    '%s has meta that fits in a search result',
    (_slug, guide) => {
      // Google truncates around these lengths; overrunning wastes the snippet.
      expect(guide.metaTitle.length, `${guide.slug} title too long`).toBeLessThanOrEqual(70)
      expect(guide.metaDescription.length, `${guide.slug} description too long`).toBeLessThanOrEqual(
        170,
      )
      expect(guide.metaDescription.length).toBeGreaterThan(70)
    },
  )

  it.each(CONTRACT_GUIDES.map((guide) => [guide.slug, guide] as const))(
    '%s answers its own questions',
    (_slug, guide) => {
      for (const faq of guide.faq) {
        expect(faq.question).toMatch(/\?$/)
        expect(faq.answer.length, `"${faq.question}" is answered too thinly`).toBeGreaterThan(40)
      }
    },
  )

  it('never uses Slovak terminology', () => {
    // The generator is guarded against this; the guides are read by more people.
    const slovakisms = /\bzmluv|\bnájomn|\bvýpoveď\b|\bzákonník\b|\bposkytovateľ/i
    for (const guide of CONTRACT_GUIDES) {
      const text = [
        guide.perex,
        guide.legalBasis,
        ...guide.mustContain.map((s) => s.body),
        ...guide.pitfalls.map((s) => s.body),
        ...guide.faq.map((f) => f.answer),
      ].join(' ')
      expect(text, `${guide.slug} contains Slovak wording`).not.toMatch(slovakisms)
    }
  })
})
