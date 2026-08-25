/**
 * Guards the two things that let the content pages be prerendered.
 *
 * Reading cookies or headers in the root layout opts the WHOLE application out
 * of static generation. It was in that state for a long time and the build
 * output said so on every line — every route marked "server-rendered on
 * demand", including twenty-four guides and five comparisons made of nothing
 * but text. It is an easy thing to reintroduce, because adding `await
 * headers()` to a layout looks local and is not.
 */

import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { ACTIVE_LOCALES, DEFAULT_LOCALE } from '@/lib/contracts/types'

const rootLayout = readFileSync(join(process.cwd(), 'app', 'layout.tsx'), 'utf8')

describe('the root layout stays static', () => {
  it('does not read headers', () => {
    expect(rootLayout, 'await headers() in the root layout makes every page dynamic').not.toMatch(
      /from ['"]next\/headers['"]/,
    )
  })

  it('does not read the signed-in user', () => {
    // The user is read by ServerAuthProvider on the surfaces that show auth UI.
    expect(rootLayout, 'reading cookies here makes every page dynamic').not.toMatch(
      /supabase\/server|auth\.getUser/,
    )
  })

  it('seeds the auth context empty, so the context is still defined', () => {
    expect(rootLayout).toMatch(/initialUser=\{null\}/)
  })
})

describe('the hardcoded html lang is honest', () => {
  it('is only hardcoded while a single locale is live', () => {
    // The root layout resolves the language from DEFAULT_LOCALE rather than
    // from the request. That is correct exactly as long as one locale ships.
    // Switch a second one on and this fails, which is the intended alarm.
    expect(
      ACTIVE_LOCALES,
      'a second locale is active — the root layout must resolve lang per request again',
    ).toEqual([DEFAULT_LOCALE])
  })
})
