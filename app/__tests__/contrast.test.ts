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

/**
 * The two surfaces text actually lands on.
 *
 * Measuring only the page background is not enough, and that gap shipped
 * twice: amber cleared AA on the glass card and failed on the bare page, and
 * the dark theme's subtle grey did the reverse — fine on the page, 4.11:1 on
 * a card. Glass lightens a dark background and darkens a light one, so
 * neither surface is universally the harder case. Both get checked.
 */
function surfaces(theme: 'dark' | 'light'): ReadonlyArray<readonly [string, Rgb]> {
  const page = hex(token(theme, 'color-bg'))
  const card = flatten(rgba(token(theme, 'glass-white')), page)
  return [
    ['page', page],
    ['card', card],
  ]
}

const TEXT_TOKENS = [['color-text'], ['color-text-muted'], ['color-text-subtle']]
const ACCENT_TOKENS = [['accent-aqua'], ['accent-violet'], ['accent-rose'], ['accent-amber']]

describe('light theme text is readable', () => {
  for (const [where, bg] of surfaces('light')) {
    it.each([...TEXT_TOKENS, ...ACCENT_TOKENS])(`--%s clears AA on the ${where}`, (name) => {
      const ratio = contrast(flatten(rgba(token('light', name)), bg), bg)
      expect(
        ratio,
        `--${name} is ${ratio.toFixed(2)}:1 on the ${where}, needs ${AA_BODY}:1`,
      ).toBeGreaterThanOrEqual(AA_BODY)
    })
  }
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
  for (const [where, bg] of surfaces('dark')) {
    it.each([...TEXT_TOKENS, ...ACCENT_TOKENS])(`--%s clears AA on the ${where}`, (name) => {
      const ratio = contrast(flatten(rgba(token('dark', name)), bg), bg)
      expect(
        ratio,
        `--${name} is ${ratio.toFixed(2)}:1 on the ${where}, needs ${AA_BODY}:1`,
      ).toBeGreaterThanOrEqual(AA_BODY)
    })
  }
})

describe('no link rule repaints a button', () => {
  /**
   * The bug this guards is a cascade collision, not a colour choice, so the
   * token checks above cannot see it.
   *
   * `.legal-card a { color: var(--accent-aqua) }` is a class plus an element,
   * which outranks `.glass-btn--primary`'s single class. It repainted the call
   * to action in accent-aqua — also the opening stop of that button's own
   * gradient — so the label came out the exact colour of what it sat on. The
   * measured ratio was 1.00:1 on the primary button of every guide and
   * comparison page: not low contrast, but literally invisible text.
   *
   * Any descendant-`a` colour rule can do this again, so each one has to be
   * listed here with a reason. Adding a rule without thinking about buttons
   * fails the test rather than shipping.
   */
  const REVIEWED: ReadonlyArray<{ selector: string; why: string }> = [
    {
      selector: '.legal-card a:not(.glass-btn)',
      why: 'guide and comparison pages render primary buttons inside the card',
    },
    { selector: '.footer-links a', why: 'the footer contains prose links only' },
    { selector: '.footer-links a:hover', why: 'same, hover state' },
    {
      selector: '.cookie-banner__text a',
      why: 'the banner button is a <button>, not an <a>, so it is unaffected',
    },
  ]

  /** Selectors of the form `.something a…` that set a colour. */
  function descendantLinkColourRules(): string[] {
    const found: string[] = []
    const pattern = /(^|\})\s*(\.[a-z][\w-]*\s+a[^{,]*)\{([^}]*)\}/gim
    let match: RegExpExecArray | null
    while ((match = pattern.exec(css)) !== null) {
      if (/(^|[^-])color\s*:/.test(match[3])) found.push(match[2].trim())
    }
    return found
  }

  it('every descendant link colour rule has been reviewed', () => {
    const reviewed = new Set(REVIEWED.map((r) => r.selector))
    const unreviewed = descendantLinkColourRules().filter((s) => !reviewed.has(s))
    expect(
      unreviewed,
      'these set a link colour and are not in REVIEWED. If one can contain a ' +
        '.glass-btn, exclude it with :not(.glass-btn) — otherwise add it to the ' +
        'list with a reason.',
    ).toEqual([])
  })

  it('still finds the rules it is meant to be watching', () => {
    // A regex that silently matches nothing would make the check above pass
    // for the wrong reason.
    expect(descendantLinkColourRules().length).toBeGreaterThan(0)
  })

  it('the legal card excludes buttons from its link colour', () => {
    expect(css, 'the rule that shipped invisible button text must stay excluded').toMatch(
      /\.legal-card a:not\(\.glass-btn\)\s*\{/,
    )
  })
})
