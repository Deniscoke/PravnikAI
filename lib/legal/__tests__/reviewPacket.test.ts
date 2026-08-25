/**
 * Keeps the lawyer packet honest.
 *
 * The previous review checklist was written by hand and said "pět profilů"
 * long after the app had twenty-three. A lawyer reading it would have quoted
 * for a fraction of the work and reviewed a fraction of the claims, and both
 * sides would have thought the thing was checked. So the packet is generated,
 * and this test fails the moment the committed file stops matching the code.
 *
 * To refresh it: UPDATE_DOCS=1 npx vitest run lib/legal/__tests__/reviewPacket
 */

import { describe, it, expect } from 'vitest'
import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { join } from 'node:path'
import { buildLawyerReviewPacket } from '../reviewPacket'
import { ALL_LEGAL_FACTS } from '../czechLegalFacts'
import { ALL_PROFILES } from '../knowledge'

const PACKET_PATH = join(process.cwd(), 'docs', 'PRAVNI_REVIZE_PODKLAD.md')

describe('the committed packet matches the code', () => {
  it('is up to date', () => {
    const generated = buildLawyerReviewPacket()

    if (process.env.UPDATE_DOCS === '1') {
      writeFileSync(PACKET_PATH, generated, 'utf8')
    }

    expect(existsSync(PACKET_PATH), `${PACKET_PATH} is missing — run with UPDATE_DOCS=1`).toBe(true)
    expect(
      readFileSync(PACKET_PATH, 'utf8').replace(/\r\n/g, '\n'),
      'docs/PRAVNI_REVIZE_PODKLAD.md is stale — rerun with UPDATE_DOCS=1',
    ).toBe(generated)
  })
})

describe('the packet covers what it promises to cover', () => {
  const packet = buildLawyerReviewPacket()

  it('lists every statutory value', () => {
    for (const { key } of ALL_LEGAL_FACTS) {
      expect(packet, `${key} is missing from the packet`).toContain(key)
    }
  })

  it('lists every contract type', () => {
    for (const profile of ALL_PROFILES) {
      expect(packet, `${profile.label} is missing from the packet`).toContain(profile.label)
    }
  })

  it('carries every provision we tell the reviewer to ignore', () => {
    // Part 3 is the silent-failure section: a wrong entry suppresses a real
    // finding instead of producing an error, so none may be omitted here.
    for (const profile of ALL_PROFILES) {
      for (const item of profile.inapplicable ?? []) {
        expect(packet, `§ ${item.section} (${profile.label}) is missing`).toContain(
          `§ ${item.section} zák. č. ${item.law} Sb.`,
        )
      }
    }
  })

  it('leaves advisory rules out, so they do not consume billed hours', () => {
    const recommendedOnly = ALL_PROFILES.flatMap((p) =>
      p.rules.filter((r) => r.kind === 'recommended' && r.consequence === 'doporuceni'),
    )
    expect(recommendedOnly.length).toBeGreaterThan(0)
    // Their requirement text must not appear — only hard claims are billed for.
    const sample = recommendedOnly[0]
    expect(packet).not.toContain(sample.requirement.slice(0, 60))
  })

  it('says plainly that it is not for publication', () => {
    expect(packet).toMatch(/Není určen k publikaci/)
  })

  it('gives the reviewer somewhere to write on every hard claim', () => {
    const hardClaims = ALL_PROFILES.reduce(
      (total, p) =>
        total +
        p.rules.filter((r) =>
          ['nevznikne', 'neplatnost', 'neprihlizi-se'].includes(r.consequence),
        ).length,
      0,
    )
    const boxes = packet.match(/Souhlasí\? ☐ ano ☐ OPRAVIT/g) ?? []
    expect(boxes.length).toBeGreaterThanOrEqual(hardClaims)
  })
})
