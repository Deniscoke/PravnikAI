/**
 * Unit tests for daily AI cost caps.
 *
 *  - tierHasDailyCap: only paid tiers (pro/team)
 *  - checkDailyAiCap: allowed (used < limit), exceeded (used >= limit),
 *    non-capped tier / export action → always allowed without querying
 *  - getDailyUsageCount: fail-open (returns 0) on DB error (BR-4)
 */

import { describe, it, expect, vi, afterEach } from 'vitest'
import type { SupabaseClient } from '@supabase/supabase-js'
import { checkDailyAiCap, tierHasDailyCap } from '../dailyLimits'

/** Stub the count-query chain: from().select().eq().gte().is() → terminal promise. */
function countStub(terminal: Promise<{ count?: number | null; error?: unknown }>) {
  const builder: Record<string, unknown> = {}
  builder.select = () => builder
  builder.eq = () => builder
  builder.gte = () => builder
  builder.is = () => terminal
  const from = vi.fn(() => builder)
  return { client: { from } as unknown as SupabaseClient, from }
}

afterEach(() => vi.unstubAllEnvs())

describe('tierHasDailyCap', () => {
  it('is true for paid tiers, false for free', () => {
    expect(tierHasDailyCap('pro')).toBe(true)
    expect(tierHasDailyCap('team')).toBe(true)
    expect(tierHasDailyCap('free')).toBe(false)
  })
})

describe('checkDailyAiCap', () => {
  it('always allows the free tier without querying usage', async () => {
    const { client, from } = countStub(Promise.resolve({ count: 0 }))
    const r = await checkDailyAiCap(client, 'u1', 'free', 'review')
    expect(r.allowed).toBe(true)
    expect(r.limit).toBe(-1)
    expect(from).not.toHaveBeenCalled()
  })

  it('always allows the export action without querying usage', async () => {
    const { client, from } = countStub(Promise.resolve({ count: 0 }))
    const r = await checkDailyAiCap(client, 'u1', 'pro', 'export')
    expect(r.allowed).toBe(true)
    expect(from).not.toHaveBeenCalled()
  })

  it('allows a paid user under the daily limit', async () => {
    vi.stubEnv('AI_DAILY_CAP_REVIEW', '5')
    const { client } = countStub(Promise.resolve({ count: 4 }))
    const r = await checkDailyAiCap(client, 'u1', 'pro', 'review')
    expect(r.allowed).toBe(true)
    expect(r.used).toBe(4)
    expect(r.limit).toBe(5)
  })

  it('blocks a paid user at or above the daily limit', async () => {
    vi.stubEnv('AI_DAILY_CAP_REVIEW', '5')
    const { client } = countStub(Promise.resolve({ count: 5 }))
    const r = await checkDailyAiCap(client, 'u1', 'pro', 'review')
    expect(r.allowed).toBe(false)
    expect(r.used).toBe(5)
    expect(r.limit).toBe(5)
  })

  it('fails open (allows) when the usage query returns an error — BR-4', async () => {
    vi.stubEnv('AI_DAILY_CAP_REVIEW', '5')
    const { client } = countStub(Promise.resolve({ count: null, error: { message: 'db down' } }))
    const r = await checkDailyAiCap(client, 'u1', 'pro', 'review')
    expect(r.allowed).toBe(true)
    expect(r.used).toBe(0)
  })

  it('fails open (allows) when the usage query throws — BR-4', async () => {
    vi.stubEnv('AI_DAILY_CAP_GENERATE', '5')
    const { client } = countStub(Promise.reject(new Error('connection reset')))
    const r = await checkDailyAiCap(client, 'u1', 'pro', 'generate')
    expect(r.allowed).toBe(true)
    expect(r.used).toBe(0)
  })
})
