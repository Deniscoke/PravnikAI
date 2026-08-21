/**
 * Distributed rate limiter — Právo365
 *
 * Production (Vercel): FAIL-CLOSED when Upstash Redis is missing.
 * Set RATE_LIMIT_ALLOW_WITHOUT_REDIS=1 only for emergency bypass.
 */

import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'
import { NextResponse } from 'next/server'

interface RateLimitOptions {
  max: number
  windowMs: number
  /**
   * Behaviour in production when the limiter itself is unavailable (Redis missing,
   * misconfigured, or erroring).
   *
   * 'block'  (default) — refuse the request. Correct for expensive AI routes, where
   *                      an unmetered burst costs real money.
   * 'allow'           — serve the request anyway. Correct for auth-gated routes that
   *                      cost nothing per call (checkout, portal, exports): losing
   *                      rate limiting must never take payments or downloads offline.
   */
  whenUnavailable?: 'block' | 'allow'
}

export interface RateLimitResult {
  allowed: boolean
  remaining: number
  resetAt: number
  /** True when production blocked the request because Redis is not configured */
  failClosed?: boolean
}

const instances = new Map<string, Ratelimit>()

export function isProductionDeployment(): boolean {
  return process.env.NODE_ENV === 'production' && process.env.VERCEL === '1'
}

/**
 * Reads the Upstash REST credentials.
 *
 * Accepts both namings: the Upstash defaults and the KV_* pair that Vercel's
 * marketplace integration injects. Values are trimmed and stripped of wrapping
 * quotes — a pasted `"https://…"` is otherwise rejected by the client and takes
 * every rate-limited route down.
 *
 * Note the REST pair is required; a `redis://` connection string (REDIS_URL)
 * cannot be used by the HTTP client.
 */
export function readRedisRestConfig(): { url: string; token: string } | null {
  const clean = (v: string | undefined): string =>
    (v ?? '').trim().replace(/^['"]|['"]$/g, '').trim()

  const url = clean(process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL)
  const token = clean(process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN)

  if (!url || !token) return null
  return { url, token }
}

function getInstance(max: number, windowMs: number): Ratelimit | null {
  const config = readRedisRestConfig()
  if (!config) return null
  const { url, token } = config

  const cacheKey = `${max}:${windowMs}`
  if (instances.has(cacheKey)) return instances.get(cacheKey)!

  try {
    const limiter = new Ratelimit({
      redis: new Redis({ url, token }),
      limiter: Ratelimit.slidingWindow(max, `${windowMs} ms`),
      analytics: false,
      prefix: 'pravo365:rl',
    })
    instances.set(cacheKey, limiter)
    return limiter
  } catch (err) {
    // Malformed URL/token (e.g. stray quotes in the env value) makes the Upstash
    // client throw at construction. Degrade to null so checkRateLimit's
    // fail-closed path returns a clean 503 instead of an uncaught 500.
    console.error(
      '[rateLimit] Invalid Upstash config — check UPSTASH_REDIS_REST_URL/TOKEN format:',
      err instanceof Error ? err.message : err,
    )
    return null
  }
}

export async function checkRateLimit(
  key: string,
  { max, windowMs, whenUnavailable = 'block' }: RateLimitOptions,
): Promise<RateLimitResult> {
  const limiter = getInstance(max, windowMs)
  const bypassed = process.env.RATE_LIMIT_ALLOW_WITHOUT_REDIS === '1'
  /** Only expensive routes are taken offline when the limiter cannot be reached. */
  const shouldBlock =
    isProductionDeployment() && !bypassed && whenUnavailable === 'block'
  const degraded = (): RateLimitResult =>
    shouldBlock
      ? { allowed: false, remaining: 0, resetAt: Date.now() + windowMs, failClosed: true }
      : { allowed: true, remaining: max - 1, resetAt: Date.now() + windowMs }

  if (!limiter) {
    if (isProductionDeployment()) {
      console.error(
        `[rateLimit] Upstash not configured in production — ${shouldBlock ? 'FAIL-CLOSED' : 'serving unmetered'} (key=${key}).`,
      )
    }
    return degraded()
  }

  try {
    const result = await limiter.limit(key)
    return {
      allowed: result.success,
      remaining: result.remaining,
      resetAt: result.reset,
    }
  } catch (err) {
    console.error('[rateLimit] Upstash request failed:', err instanceof Error ? err.message : err)
    return degraded()
  }
}

export function rateLimitResponse(
  result: RateLimitResult,
  message: string,
): NextResponse {
  if (result.failClosed) {
    return NextResponse.json(
      { error: 'Služba dočasně nedostupná (ochrana proti zneužití). Zkuste to později.', code: 'RATE_LIMIT_UNAVAILABLE' },
      { status: 503 },
    )
  }
  return NextResponse.json(
    { error: message, code: 'RATE_LIMITED' },
    {
      status: 429,
      headers: { 'Retry-After': String(Math.ceil((result.resetAt - Date.now()) / 1000)) },
    },
  )
}

export function getClientIp(headers: Headers): string {
  return (
    headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    headers.get('x-real-ip') ||
    'unknown'
  )
}
