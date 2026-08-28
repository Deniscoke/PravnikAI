/**
 * Locks the light theme's text colours to WCAG AA.
 *
 * These tokens were already carrying a comment saying they had been darkened
 * for AA. They had been — just not far enough, and nothing checked, so the
 * claim sat in the file for months while Lighthouse reported the contrast
 * failure on every page. A comment is a hope; this is the check.
 *
 * Contrast is the accessibility rule that regresses most easily, because the
 * pressure runs one way: a lighter grey always looks more elegant in a design
 * review, and the person who lightens it is not the person who cannot read it.
 *
 * The dark theme is measured too. It passes today with room to spare, and the
 * point of including it is that a future edit to those tokens gets the same
 * treatment rather than being trusted.
 */

import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

const css = readFileSync(join(process.cwd(), 'app', 'globals.css'), 'utf8')

type Rgb = readonly [number, number, number]

function relativeLuminance([r, g, b]: Rgb): number {
  const channel = (v: number) => {
    const s = v / 255
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4)
  }
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b)
}

function contrast(a: Rgb, b: Rgb): number {
  const [l1, l2] = [relativeLuminance(a), relativeLuminance(b)]
  return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05)
}

/** Flattens a translucent colour onto an opaque one, the way a browser does. */
function flatten(fg: readonly [number, number, number, number], bg: Rgb): Rgb {
  const a = fg[3]
  return [fg[0] * a + bg[0] * (1 - a), fg[1] * a + bg[1] * (1 - a), fg[2] * a + bg[2] * (1 - a)]
}

function hex(value: string): Rgb {
  return [
    parseInt(value.slice(1, 3), 16),
    parseInt(value.slice(3, 5), 16),
    parseInt(value.slice(5, 7), 16),
  ]
}

/**
 * Reads a custom property out of a specific block of globals.css.
 *
 * Every one of these names is declared twice — once for dark, once under
 * [data-theme=light] — so a naive search would silently measure whichever came
 * first and report the wrong theme as passing.
 */
function token(theme: 'dark' | 'light', name: string): string {
  const block =
    theme === 'light'
      ? css.slice(css.indexOf('[data-theme="light"]'))
      : css.slice(css.indexOf(':root'), css.indexOf('[data-theme="light"]'))
  const match = block.match(new RegExp(`--${name}:\\s*([^;]+);`))
  if (!match) throw new Error(`token --${name} not found in the ${theme} block`)
  return match[1].trim()
}

/** Parses either notation the stylesheet uses: #rrggbb or rgb()/rgba(). */
function rgba(value: string): readonly [number, number, number, number] {
  if (value.startsWith('#')) {
    const [r, g, b] = hex(value)
    return [r, g, b, 1]
  }
  const parts = value.match(/[\d.]+/g)
  if (!parts) throw new Error(`cannot parse colour: ${value}`)
  return [Number(parts[0]), Number(parts[1]), Number(parts[2]), parts[3] ? Number(parts[3]) : 1]
}

const AA_BODY = 4.5

describe('light theme text is readable', () => {
  // The page background, not the card. Cards sit on white glass and so are
  // lighter, which only helps dark text — measuring against the darkest
  // surface the text can land on is the conservative choice.
  const pageBg = hex(token('light', 'color-bg'))

  it.each([['color-text'], ['color-text-muted'], ['color-text-subtle']])(
    '--%s clears AA for body text',
    (name) => {
      const ratio = contrast(flatten(rgba(token('light', name)), pageBg), pageBg)
      expect(ratio, `--${name} is ${ratio.toFixed(2)}:1, needs ${AA_BODY}:1`).toBeGreaterThanOrEqual(
        AA_BODY,
      )
    },
  )

  it.each([['accent-aqua'], ['accent-violet'], ['accent-rose'], ['accent-amber']])(
    '--%s clears AA when used as text',
    (name) => {
      const ratio = contrast(flatten(rgba(token('light', name)), pageBg), pageBg)
      expect(ratio, `--${name} is ${ratio.toFixed(2)}:1, needs ${AA_BODY}:1`).toBeGreaterThanOrEqual(
        AA_BODY,
      )
    },
  )
})

describe('text sitting on an accent clears AA', () => {
  /**
   * --on-accent is the colour of anything painted over the aqua-to-violet
   * gradient: the primary button, the step badges, the pricing pills. Both
   * stops have to clear it on their own, because a gradient hides a failure
   * that exists across only half of it — which is precisely how the light
   * theme shipped white on a 3.68:1 cyan for months.
   *
   * It has to invert with the theme. Several inline styles hardcoded the
   * dark-theme value, so the pills and the Pro button carried near-black text
   * on a deep cyan in light mode at 3.59:1.
   */
  for (const theme of ['light', 'dark'] as const) {
    it.each([['accent-aqua'], ['accent-violet']])(
      `--on-accent on --%s clears AA in the ${theme} theme`,
      (name) => {
        const onAccent = hex(token(theme, 'on-accent'))
        const ratio = contrast(onAccent, hex(token(theme, name)))
        expect(
          ratio,
          `--on-accent on --${name} (${theme}) is ${ratio.toFixed(2)}:1`,
        ).toBeGreaterThanOrEqual(AA_BODY)
      },
    )
  }
})

describe('dark theme text is readable', () => {
  const pageBg = hex(token('dark', 'color-bg'))

  it.each([['color-text'], ['color-text-muted'], ['color-text-subtle']])(
    '--%s clears AA for body text',
    (name) => {
      const ratio = contrast(flatten(rgba(token('dark', name)), pageBg), pageBg)
      expect(ratio, `--${name} is ${ratio.toFixed(2)}:1`).toBeGreaterThanOrEqual(AA_BODY)
    },
  )

  it.each([['accent-aqua'], ['accent-violet'], ['accent-rose'], ['accent-amber']])(
    '--%s clears AA when used as text',
    (name) => {
      const ratio = contrast(flatten(rgba(token('dark', name)), pageBg), pageBg)
      expect(ratio, `--${name} is ${ratio.toFixed(2)}:1`).toBeGreaterThanOrEqual(AA_BODY)
    },
  )
})
