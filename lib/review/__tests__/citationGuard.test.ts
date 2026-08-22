/**
 * Guards against the exact review that shipped: a lawful dohoda o provedení
 * práce reported as defective twice over, on provisions that do not govern it.
 *
 * The tests that matter most here are the ones asserting nothing is dropped.
 * A guard that silences correct findings is worse than the bug it fixes —
 * it would quietly turn a real warning into silence, and nobody would see it.
 */

import { describe, it, expect, vi, afterEach } from 'vitest'
import {
  findInapplicableCitations,
  dropInapplicableFindings,
  filterLegalBasis,
} from '../citationGuard'

afterEach(() => {
  vi.restoreAllMocks()
})

/** The two findings the live review actually produced. */
const REAL_FALSE_POSITIVES = [
  {
    title: 'Dovolená',
    explanation:
      'Smlouva uvádí, že zaměstnanec má nárok na dovolenou pouze v případě, že jeho ' +
      'pracovní poměr trval alespoň 28 kalendářních dní. To je v rozporu s § 213 zák. ' +
      'č. 262/2006 Sb., kde je stanoveno, že dovolená činí nejméně 4 týdny.',
  },
  {
    title: 'Výpovědní doba',
    explanation:
      'Smlouva neuvádí výpovědní dobu, což je v rozporu s § 51 zák. č. 262/2006 Sb., ' +
      'kde je stanovena minimální výpovědní doba pro obě strany.',
  },
]

describe('findInapplicableCitations', () => {
  it('catches § 213 cited against a dohoda', () => {
    const issues = findInapplicableCitations(
      REAL_FALSE_POSITIVES[0].explanation,
      'employment-agreement',
    )
    expect(issues.map((i) => i.section)).toContain('213')
    expect(issues[0].why).toMatch(/§ 77 odst. 8/)
  })

  it('catches § 51 cited against a dohoda', () => {
    const issues = findInapplicableCitations(
      REAL_FALSE_POSITIVES[1].explanation,
      'employment-agreement',
    )
    expect(issues.map((i) => i.section)).toContain('51')
  })

  it('leaves the provisions that DO govern a dohoda alone', () => {
    const sound =
      'Odměna nesmí být nižší než minimální mzda podle § 111 zák. č. 262/2006 Sb. ' +
      'Zrušení dohody se řídí § 77 odst. 4 téhož zákona.'
    expect(findInapplicableCitations(sound, 'employment-agreement')).toEqual([])
  })

  it('does not fire on the same section numbers in a different act', () => {
    // § 51 of the civil code has nothing to do with notice periods. Matching on
    // the number alone would flag a perfectly sound lease finding.
    const civil = 'Postup podle § 51 zák. č. 89/2012 Sb. se uplatní přiměřeně.'
    expect(findInapplicableCitations(civil, 'employment-agreement')).toEqual([])
  })

  it('says nothing about a contract type with no exclusions listed', () => {
    expect(findInapplicableCitations('§ 213 zák. č. 262/2006 Sb.', 'tenancy')).toEqual([])
  })

  it('says nothing when the type could not be determined', () => {
    // Without a known type there is no basis for calling a citation wrong.
    expect(findInapplicableCitations('§ 213 zák. č. 262/2006 Sb.', null)).toEqual([])
  })

  it('handles a section with a paragraph breakdown', () => {
    const issues = findInapplicableCitations(
      'v rozporu s § 213 odst. 1 zák. č. 262/2006 Sb.',
      'employment-agreement',
    )
    expect(issues).toHaveLength(1)
  })
})

describe('dropInapplicableFindings', () => {
  it('removes both findings the live review got wrong', () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {})
    const kept = dropInapplicableFindings(
      REAL_FALSE_POSITIVES,
      'employment-agreement',
      'risky clause',
    )
    expect(kept).toEqual([])
  })

  it('keeps a genuine finding about the same contract', () => {
    const genuine = [
      {
        title: 'Odměna pod minimální mzdou',
        explanation:
          'Sjednaná odměna 90 Kč za hodinu je nižší než minimální hodinová mzda ' +
          'podle § 111 zák. č. 262/2006 Sb.',
      },
    ]
    expect(dropInapplicableFindings(genuine, 'employment-agreement', 'risky clause')).toEqual(
      genuine,
    )
  })

  it('keeps everything when the contract type is unknown', () => {
    const findings = [{ title: 'Cokoli', explanation: 'v rozporu s § 213 zák. č. 262/2006 Sb.' }]
    expect(dropInapplicableFindings(findings, null, 'risky clause')).toEqual(findings)
  })

  it('scans the reason field of a missing-clause finding too', () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {})
    const missing = [
      { title: 'Dovolená', reason: 'Podle § 213 zák. č. 262/2006 Sb. náleží 4 týdny.' },
    ]
    expect(dropInapplicableFindings(missing, 'employment-agreement', 'missing clause')).toEqual([])
  })

  it('logs what it discarded rather than dropping it silently', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    dropInapplicableFindings([REAL_FALSE_POSITIVES[0]], 'employment-agreement', 'risky clause')
    expect(warn).toHaveBeenCalledOnce()
    expect(warn.mock.calls[0][0]).toMatch(/213/)
  })
})

describe('filterLegalBasis', () => {
  it('strips an inapplicable provision from the cited basis', () => {
    const basis = [
      '§ 34 odst. 1 písm. a) zák. č. 262/2006 Sb.',
      '§ 213 zák. č. 262/2006 Sb.',
      '§ 77 odst. 4 zák. č. 262/2006 Sb.',
    ]
    expect(filterLegalBasis(basis, 'employment-agreement')).toEqual([
      '§ 77 odst. 4 zák. č. 262/2006 Sb.',
    ])
  })

  it('leaves a sound basis untouched', () => {
    const basis = ['§ 2079 zák. č. 89/2012 Sb.', '§ 2099 zák. č. 89/2012 Sb.']
    expect(filterLegalBasis(basis, 'sale')).toEqual(basis)
  })
})
