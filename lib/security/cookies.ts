/**
 * Secure cookie defaults for middleware / client-facing cookies.
 * Auth session cookies are managed by @supabase/ssr (httpOnly, secure in prod).
 */

import type { ResponseCookie } from 'next/dist/compiled/@edge-runtime/cookies'

const IS_PRODUCTION = process.env.NODE_ENV === 'production'

/** Shared options for non-auth preference cookies (locale, etc.). */
export function secureCookieOptions(
  overrides: Partial<ResponseCookie> = {},
): Partial<ResponseCookie> {
  return {
    path: '/',
    sameSite: 'lax',
    secure: IS_PRODUCTION,
    httpOnly: false,
    ...overrides,
  }
}
