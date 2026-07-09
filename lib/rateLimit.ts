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

function getInstance(max: number, windowMs: number): Ratelimit | null {
  const url = process.env.UPSTASH_REDIS_REST_URL
  const token = process.env.UPSTASH_REDIS_REST_TOKEN
  if (!url || !token) return null

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
  { max, windowMs }: RateLimitOptions,
): Promise<RateLimitResult> {
  const limiter = getInstance(max, windowMs)

  if (!limiter) {
    const allowBypass = process.env.RATE_LIMIT_ALLOW_WITHOUT_REDIS === '1'
    if (isProductionDeployment() && !allowBypass) {
      console.error(
        '[rateLimit] FAIL-CLOSED: UPSTASH_REDIS_REST_URL/TOKEN missing in production.',
      )
      return { allowed: false, remaining: 0, resetAt: Date.now() + windowMs, failClosed: true }
    }
    if (isProductionDeployment() && allowBypass) {
      console.warn('[rateLimit] BYPASS: RATE_LIMIT_ALLOW_WITHOUT_REDIS=1 — rate limiting disabled.')
    }
    return { allowed: true, remaining: max - 1, resetAt: Date.now() + windowMs }
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
    if (isProductionDeployment() && process.env.RATE_LIMIT_ALLOW_WITHOUT_REDIS !== '1') {
      return { allowed: false, remaining: 0, resetAt: Date.now() + windowMs, failClosed: true }
    }
    return { allowed: true, remaining: max - 1, resetAt: Date.now() + windowMs }
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
