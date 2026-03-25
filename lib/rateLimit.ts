/**
 * Distributed rate limiter — PrávníkAI
 *
 * Uses Upstash Redis + @upstash/ratelimit for consistent rate limiting
 * across all Vercel serverless function instances.
 *
 * Falls back to a no-op (allow all) if env vars are not configured so that
 * local development and CI work without a Redis connection.
 *
 * Required env vars (add to .env.local and Vercel project settings):
 *   UPSTASH_REDIS_REST_URL   — from Upstash console → your database → REST API
 *   UPSTASH_REDIS_REST_TOKEN — from Upstash console → your database → REST API
 *
 * Usage in a route:
 *   const { allowed, remaining, resetAt } = await checkRateLimit(ip, { max: 10, windowMs: 60_000 })
 *   if (!allowed) return NextResponse.json({ error: '...' }, { status: 429 })
 */

import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

interface RateLimitOptions {
  /** Maximum requests per window */
  max: number
  /** Window duration in milliseconds */
  windowMs: number
}

interface RateLimitResult {
  allowed: boolean
  remaining: number
  resetAt: number
}

// Cache instances keyed by "max:windowMs" to avoid recreating per request
const instances = new Map<string, Ratelimit>()

function getInstance(max: number, windowMs: number): Ratelimit | null {
  const url = process.env.UPSTASH_REDIS_REST_URL
  const token = process.env.UPSTASH_REDIS_REST_TOKEN
  if (!url || !token) return null

  const cacheKey = `${max}:${windowMs}`
  if (instances.has(cacheKey)) return instances.get(cacheKey)!

  const limiter = new Ratelimit({
    redis: new Redis({ url, token }),
    limiter: Ratelimit.slidingWindow(max, `${windowMs} ms`),
    analytics: false,
    prefix: 'pravnik:rl',
  })

  instances.set(cacheKey, limiter)
  return limiter
}

/**
 * Check and increment rate limit for a given key (usually IP address).
 * Returns whether the request is allowed and how many requests remain.
 *
 * This function is async — await it before using the result.
 * Falls back to allow-all when Upstash env vars are not configured.
 */
export async function checkRateLimit(
  key: string,
  { max, windowMs }: RateLimitOptions,
): Promise<RateLimitResult> {
  const limiter = getInstance(max, windowMs)

  // No Redis configured — allow all (local dev / CI)
  if (!limiter) {
    return { allowed: true, remaining: max - 1, resetAt: Date.now() + windowMs }
  }

  const result = await limiter.limit(key)
  return {
    allowed: result.success,
    remaining: result.remaining,
    resetAt: result.reset,
  }
}

/**
 * Extract client IP from Next.js request headers.
 * Vercel sets x-forwarded-for; falls back to x-real-ip or 'unknown'.
 */
export function getClientIp(headers: Headers): string {
  return (
    headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    headers.get('x-real-ip') ||
    'unknown'
  )
}
