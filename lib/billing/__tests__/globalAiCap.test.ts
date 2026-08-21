/**
 * Platform-wide AI cap — the ceiling that bounds the beta's API bill no matter
 * how many accounts sign up.
 */

import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest'

const createServiceClient = vi.fn()
vi.mock('@/lib/supabase/server', () => ({
  createServiceClient: () => createServiceClient(),
}))

import { checkGlobalDailyAiCap, isAiAction } from '../globalAiCap'

/** Stub: from().select().gte() → terminal count promise, per table. */
function clientWithCounts(generations: unknown, reviews: unknown) {
  return {
    from(table: string) {
      const terminal = table === 'contract_generations_history' ? generations : reviews
      const builder: Record<string, unknown> = {}
      builder.select = () => builder
      builder.gte = () => terminal
      return builder
    },
  }
}

beforeEach(() => {
  createServiceClient.mockReset()
})
afterEach(() => vi.unstubAllEnvs())

describe('isAiAction', () => {
  it('covers the actions that cost an AI call', () => {
    expect(isAiAction('generate')).toBe(true)
    expect(isAiAction('review')).toBe(true)
    expect(isAiAction('export')).toBe(false)
  })
})

describe('checkGlobalDailyAiCap', () => {
  it('allows exports without counting anything', async () => {
    const r = await checkGlobalDailyAiCap('export')
    expect(r.allowed).toBe(true)
    expect(createServiceClient).not.toHaveBeenCalled()
  })

  it('sums generations and reviews across all accounts', async () => {
    vi.stubEnv('AI_GLOBAL_DAILY_CAP', '10')
    createServiceClient.mockResolvedValue(
      clientWithCounts(Promise.resolve({ count: 4 }), Promise.resolve({ count: 3 })),
    )
    const r = await checkGlobalDailyAiCap('generate')
    expect(r.used).toBe(7)
    expect(r.limit).toBe(10)
    expect(r.allowed).toBe(true)
  })

  it('blocks once the combined total reaches the cap', async () => {
    vi.stubEnv('AI_GLOBAL_DAILY_CAP', '10')
    createServiceClient.mockResolvedValue(
      clientWithCounts(Promise.resolve({ count: 6 }), Promise.resolve({ count: 4 })),
    )
    const r = await checkGlobalDailyAiCap('review')
    expect(r.used).toBe(10)
    expect(r.allowed).toBe(false)
  })

  it('fails open when counting errors — never takes the product offline', async () => {
    vi.stubEnv('AI_GLOBAL_DAILY_CAP', '10')
    createServiceClient.mockResolvedValue(
      clientWithCounts(
        Promise.resolve({ count: null, error: { message: 'db down' } }),
        Promise.resolve({ count: 0 }),
      ),
    )
    const r = await checkGlobalDailyAiCap('generate')
    expect(r.allowed).toBe(true)
  })

  it('fails open when the service client is unavailable', async () => {
    createServiceClient.mockRejectedValue(new Error('no service role key'))
    const r = await checkGlobalDailyAiCap('generate')
    expect(r.allowed).toBe(true)
  })
})
