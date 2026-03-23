/**
 * In-memory rate limiter — PrávníkAI
 *
 * Simple sliding-window rate limiter for Vercel serverless functions.
 * Each function instance maintains its own counter map — not distributed,
 * but effective against single-source abuse (bots, scripts).
 *
 * For distributed rate limiting across all instances, upgrade to:
 * @upstash/ratelimit + Upstash Redis (drop-in replacement).
 *
 * Usage in a route:
 *   const { allowed, remaining } = checkRateLimit(ip, { max: 10, windowMs: 60_000 })
 *   if (!allowed) return NextResponse.json({ error: '...' }, { status: 429 })
 */

interface RateLimitEntry {
  count: number
  resetAt: number
}

const store = new Map<string, RateLimitEntry>()

// Periodic cleanup to prevent memory leaks in long-lived instances
const CLEANUP_INTERVAL = 5 * 60_000 // 5 minutes
let lastCleanup = Date.now()

function cleanup() {
  const now = Date.now()
  if (now - lastCleanup < CLEANUP_INTERVAL) return
  lastCleanup = now
  for (const [key, entry] of store) {
    if (entry.resetAt <= now) store.delete(key)
  }
}

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

/**
 * Check and increment rate limit for a given key (usually IP address).
 * Returns whether the request is allowed and how many requests remain.
 */
export function checkRateLimit(
  key: string,
  { max, windowMs }: RateLimitOptions,
): RateLimitResult {
  cleanup()

  const now = Date.now()
  const entry = store.get(key)

  // New window or expired window
  if (!entry || entry.resetAt <= now) {
    const resetAt = now + windowMs
    store.set(key, { count: 1, resetAt })
    return { allowed: true, remaining: max - 1, resetAt }
  }

  // Within existing window
  entry.count++

  if (entry.count > max) {
    return { allowed: false, remaining: 0, resetAt: entry.resetAt }
  }

  return { allowed: true, remaining: max - entry.count, resetAt: entry.resetAt }
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
