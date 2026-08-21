/**
 * Unit tests for the rate limiter contract.
 *
 *  - rateLimitResponse: 503 RATE_LIMIT_UNAVAILABLE when fail-closed, else 429 RATE_LIMITED + Retry-After
 *  - checkRateLimit: fail-CLOSED in production without Redis, bypass via env, fail-open in dev/CI
 */

import { describe, it, expect, vi, afterEach } from 'vitest'
import { rateLimitResponse, checkRateLimit, readRedisRestConfig } from '../rateLimit'

afterEach(() => vi.unstubAllEnvs())

describe('rateLimitResponse', () => {
  it('returns 503 RATE_LIMIT_UNAVAILABLE when the result is fail-closed', async () => {
    const res = rateLimitResponse(
      { allowed: false, remaining: 0, resetAt: Date.now() + 60_000, failClosed: true },
      'ignored message',
    )
    expect(res.status).toBe(503)
    const body = await res.json()
    expect(body.code).toBe('RATE_LIMIT_UNAVAILABLE')
  })

  it('returns 429 RATE_LIMITED with a Retry-After header otherwise', async () => {
    const res = rateLimitResponse(
      { allowed: false, remaining: 0, resetAt: Date.now() + 30_000 },
      'Příliš mnoho požadavků. Zkuste to za chvíli.',
    )
    expect(res.status).toBe(429)
    expect(res.headers.get('Retry-After')).toBeTruthy()
    const body = await res.json()
    expect(body.code).toBe('RATE_LIMITED')
    expect(body.error).toContain('Příliš')
  })
})

describe('checkRateLimit without Redis configured', () => {
  function clearRedisEnv() {
    vi.stubEnv('UPSTASH_REDIS_REST_URL', '')
    vi.stubEnv('UPSTASH_REDIS_REST_TOKEN', '')
  }

  it('fails CLOSED in production (no bypass)', async () => {
    vi.stubEnv('NODE_ENV', 'production')
    vi.stubEnv('VERCEL', '1')
    vi.stubEnv('RATE_LIMIT_ALLOW_WITHOUT_REDIS', '')
    clearRedisEnv()
    const r = await checkRateLimit('k', { max: 5, windowMs: 60_000 })
    expect(r.allowed).toBe(false)
    expect(r.failClosed).toBe(true)
  })

  it('bypasses (allows) in production with RATE_LIMIT_ALLOW_WITHOUT_REDIS=1', async () => {
    vi.stubEnv('NODE_ENV', 'production')
    vi.stubEnv('VERCEL', '1')
    vi.stubEnv('RATE_LIMIT_ALLOW_WITHOUT_REDIS', '1')
    clearRedisEnv()
    const r = await checkRateLimit('k', { max: 5, windowMs: 60_000 })
    expect(r.allowed).toBe(true)
    expect(r.failClosed).toBeFalsy()
  })

  it("stays online in production for whenUnavailable: 'allow' routes (checkout, exports)", async () => {
    vi.stubEnv('NODE_ENV', 'production')
    vi.stubEnv('VERCEL', '1')
    vi.stubEnv('RATE_LIMIT_ALLOW_WITHOUT_REDIS', '')
    clearRedisEnv()
    const r = await checkRateLimit('k', { max: 5, windowMs: 60_000, whenUnavailable: 'allow' })
    expect(r.allowed).toBe(true)
    expect(r.failClosed).toBeFalsy()
  })

  it('fails OPEN in non-production (dev/CI)', async () => {
    vi.stubEnv('NODE_ENV', 'test')
    vi.stubEnv('VERCEL', '')
    clearRedisEnv()
    const r = await checkRateLimit('k', { max: 5, windowMs: 60_000 })
    expect(r.allowed).toBe(true)
    expect(r.failClosed).toBeFalsy()
  })
})

describe('readRedisRestConfig', () => {
  function clearAll() {
    for (const k of ['UPSTASH_REDIS_REST_URL', 'UPSTASH_REDIS_REST_TOKEN', 'KV_REST_API_URL', 'KV_REST_API_TOKEN']) {
      vi.stubEnv(k, '')
    }
  }

  it('reads the Upstash pair', () => {
    clearAll()
    vi.stubEnv('UPSTASH_REDIS_REST_URL', 'https://a.upstash.io')
    vi.stubEnv('UPSTASH_REDIS_REST_TOKEN', 'tok')
    expect(readRedisRestConfig()).toEqual({ url: 'https://a.upstash.io', token: 'tok' })
  })

  it('falls back to the KV_* pair injected by the Vercel integration', () => {
    clearAll()
    vi.stubEnv('KV_REST_API_URL', 'https://kv.upstash.io')
    vi.stubEnv('KV_REST_API_TOKEN', 'kvtok')
    expect(readRedisRestConfig()).toEqual({ url: 'https://kv.upstash.io', token: 'kvtok' })
  })

  it('strips wrapping quotes and whitespace pasted into the dashboard', () => {
    clearAll()
    vi.stubEnv('UPSTASH_REDIS_REST_URL', ' "https://quoted.upstash.io" ')
    vi.stubEnv('UPSTASH_REDIS_REST_TOKEN', "'tok'")
    expect(readRedisRestConfig()).toEqual({ url: 'https://quoted.upstash.io', token: 'tok' })
  })

  it('returns null when either half is missing', () => {
    clearAll()
    vi.stubEnv('UPSTASH_REDIS_REST_URL', 'https://a.upstash.io')
    expect(readRedisRestConfig()).toBeNull()
  })
})

describe('checkRateLimit with a malformed Upstash config', () => {
  it('fails CLOSED (does not throw) when the URL is invalid in production', async () => {
    // Reproduces the incident: env value with stray surrounding quotes.
    vi.stubEnv('NODE_ENV', 'production')
    vi.stubEnv('VERCEL', '1')
    vi.stubEnv('RATE_LIMIT_ALLOW_WITHOUT_REDIS', '')
    vi.stubEnv('UPSTASH_REDIS_REST_URL', '"https://x.upstash.io"')
    vi.stubEnv('UPSTASH_REDIS_REST_TOKEN', 'token')
    // Unique max/windowMs → fresh cache key, forces client construction.
    const r = await checkRateLimit('mk', { max: 7, windowMs: 30_000 })
    expect(r.allowed).toBe(false)
    expect(r.failClosed).toBe(true)
  })
})
