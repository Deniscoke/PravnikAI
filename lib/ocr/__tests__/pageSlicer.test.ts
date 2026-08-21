/**
 * Slice geometry.
 *
 * Every one of these guards against silently losing lines of a contract. A
 * slice that starts below where the previous one ended drops the text in
 * between, and nothing downstream can tell — the transcription just comes back
 * shorter, reads fluently, and is missing a clause.
 */

import { describe, it, expect } from 'vitest'
import { planSlices } from '../pageSlicer'

/** The API downsamples anything taller, which is what this module avoids. */
const MAX_SLICE_HEIGHT = 768
/** Working slice height the planner aims for. */
const SLICE_HEIGHT = 700
const OVERLAP = 70

describe('planSlices', () => {
  it('leaves a short image whole', () => {
    // Slicing a screenshot would only add seams to stitch back together.
    expect(planSlices(500)).toEqual([{ top: 0, height: 500 }])
    expect(planSlices(768)).toEqual([{ top: 0, height: 768 }])
  })

  it('cuts a full page into several slices', () => {
    const plans = planSlices(1960)
    expect(plans.length).toBeGreaterThan(1)
    expect(plans[0].top).toBe(0)
  })

  it('never leaves a gap between consecutive slices', () => {
    // The property that actually matters: no row of pixels goes unphotographed.
    for (const height of [800, 1200, 1960, 2400, 3000]) {
      const plans = planSlices(height)
      for (let i = 1; i < plans.length; i += 1) {
        const previousBottom = plans[i - 1].top + plans[i - 1].height
        expect(plans[i].top, `gap at slice ${i} of a ${height}px page`).toBeLessThanOrEqual(
          previousBottom,
        )
      }
    }
  })

  it('overlaps adjacent slices so a line on a cut survives whole', () => {
    const plans = planSlices(1960)
    for (let i = 1; i < plans.length; i += 1) {
      const previousBottom = plans[i - 1].top + plans[i - 1].height
      expect(previousBottom - plans[i].top).toBeGreaterThanOrEqual(OVERLAP - 1)
    }
  })

  it('reaches the bottom of the page', () => {
    for (const height of [800, 1960, 2400]) {
      const plans = planSlices(height)
      const last = plans[plans.length - 1]
      expect(last.top + last.height, `${height}px page was truncated`).toBe(height)
    }
  })

  it('never plans a slice taller than the API threshold', () => {
    // A slice over 768px gets downscaled by the API, which is the whole problem
    // this module exists to avoid.
    for (const height of [800, 1960, 1980, 3000, 5000]) {
      for (const plan of planSlices(height)) {
        expect(plan.height, `${height}px page produced an oversized slice`).toBeLessThanOrEqual(
          MAX_SLICE_HEIGHT,
        )
      }
    }
  })

  it('absorbs a trailing offcut instead of spending an image on it', () => {
    // An A4 photo divides into three slices plus about 20px. Emitting that as a
    // fourth image costs a full row of tiles to carry half a line of margin.
    const plans = planSlices(1980)
    expect(plans).toHaveLength(3)
    expect(plans[plans.length - 1].height).toBeGreaterThan(700)
  })

  it('never emits a zero-height sliver at the end', () => {
    for (const height of [SLICE_HEIGHT * 2, SLICE_HEIGHT * 3, 1890, 1891]) {
      for (const plan of planSlices(height)) {
        expect(plan.height, `zero-height slice for ${height}px`).toBeGreaterThan(0)
      }
    }
  })

  it('caps a very tall image rather than billing for it forever', () => {
    // A panorama or an accidental scroll capture must not turn into fifty
    // billable images.
    expect(planSlices(100_000).length).toBeLessThanOrEqual(6)
  })

  it('produces three slices for a typical A4 photo', () => {
    // 1400px wide at A4 proportions is ~1980px tall. Three slices is the
    // budget the cost estimates in the route assume.
    expect(planSlices(1980)).toHaveLength(3)
  })
})
