/**
 * Next.js Proxy (Middleware) — PrávníkAI
 *
 * Responsibilities:
 *   1. Locale negotiation — every UI route lives under /{locale}/. This middleware
 *      detects the user's preferred locale (URL → cookie → Accept-Language)
 *      and redirects locale-less paths to the correct locale.
 *   2. Refresh Supabase auth session on every matched request (prevents stale JWTs).
 *   3. Protect /{locale}/dashboard, /{locale}/account, /{locale}/onboarding —
 *      redirect to /{locale}/login if unauthenticated.
 *   4. Redirect /{locale}/login to /{locale}/dashboard if already authenticated.
 *   5. Inject x-locale header so server components can read the active locale.
 *
 * Runs on the Edge Runtime. Keep it fast — no database queries, no heavy logic.
 */

import { NextResponse, type NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import {
  ALL_LOCALES,
  ACTIVE_LOCALES,
  DEFAULT_LOCALE,
  type Locale,
} from '@/lib/contracts/types'
import {
  coerceLocale,
  isValidLocale,
  negotiateLocaleFromHeader,
} from '@/lib/i18n'
import { secureCookieOptions } from '@/lib/security/cookies'

const LOCALE_COOKIE = 'pravnikai-locale'
const LOCALE_COOKIE_MAX_AGE = 60 * 60 * 24 * 365 // 1 year

/** Paths that bypass locale negotiation (API, auth callback, static assets, etc.). */
const NON_LOCALIZED_PATHS = [
  '/api',
  '/auth',
  '/monitoring',
  '/_next',
  '/favicon',
  '/sitemap',
  '/robots',
  '/opengraph-image',
]

function isNonLocalizedPath(pathname: string): boolean {
  if (pathname === '/') return false
  return NON_LOCALIZED_PATHS.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`) || pathname.startsWith(`${prefix}.`),
  )
}

/** Returns the locale prefix from a pathname like "/cs/foo" → "cs", or null. */
function extractLocaleFromPath(pathname: string): Locale | null {
  const seg = pathname.split('/')[1]
  return isValidLocale(seg) ? seg : null
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // ── 1. Locale negotiation & redirects ─────────────────────────────────────
  if (!isNonLocalizedPath(pathname)) {
    const localeFromPath = extractLocaleFromPath(pathname)

    if (!localeFromPath) {
      // Path has no locale prefix → always redirect to default (cs)
      const url = request.nextUrl.clone()
      url.pathname = pathname === '/' ? `/${DEFAULT_LOCALE}` : `/${DEFAULT_LOCALE}${pathname}`
      const redirectResponse = NextResponse.redirect(url)
      redirectResponse.cookies.set(LOCALE_COOKIE, DEFAULT_LOCALE, secureCookieOptions({
        maxAge: LOCALE_COOKIE_MAX_AGE,
      }))
      return redirectResponse
    }

    // Redirect inactive locales (/de/*, /en/*) → /cs/* preserving the logical path
    if (!(ACTIVE_LOCALES as readonly string[]).includes(localeFromPath)) {
      const prefix = `/${localeFromPath}`
      const tail = pathname === prefix ? '' : pathname.slice(prefix.length)
      const url = request.nextUrl.clone()
      url.pathname = `/${DEFAULT_LOCALE}${tail}` || `/${DEFAULT_LOCALE}`
      const redirectResponse = NextResponse.redirect(url, 308)
      redirectResponse.cookies.set(LOCALE_COOKIE, DEFAULT_LOCALE, secureCookieOptions({
        maxAge: LOCALE_COOKIE_MAX_AGE,
      }))
      return redirectResponse
    }

    // Path has an active locale prefix → continue
  }

  // ── 2. Supabase session refresh + auth guards ────────────────────────────
  let supabaseResponse = NextResponse.next({
    request: {
      headers: new Headers(request.headers),
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          )
        },
      },
    },
  )

  // Refresh session — this calls Supabase to verify/refresh the JWT.
  // IMPORTANT: Do NOT use getSession() here. getUser() actually validates
  // the JWT with the server, while getSession() only reads the local cookie.
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Determine the active locale for downstream usage (header injection + redirects)
  const activeLocale: Locale =
    extractLocaleFromPath(pathname) ??
    coerceLocale(request.cookies.get(LOCALE_COOKIE)?.value) ??
    DEFAULT_LOCALE

  // Strip the locale prefix to evaluate the logical route
  const localePrefix = `/${activeLocale}`
  const logicalPath = pathname === localePrefix
    ? '/'
    : pathname.startsWith(`${localePrefix}/`)
      ? pathname.slice(localePrefix.length)
      : pathname

  // ── 3. Protected routes: require authentication ──────────────────────────
  const isProtectedRoute =
    logicalPath.startsWith('/dashboard') ||
    logicalPath.startsWith('/account') ||
    logicalPath.startsWith('/onboarding')

  if (isProtectedRoute && !user) {
    const url = request.nextUrl.clone()
    url.pathname = `${localePrefix}/login`
    url.searchParams.set('redirect', pathname)
    return NextResponse.redirect(url)
  }

  // ── 4. Login: redirect to dashboard if already signed in ────────────────
  if (logicalPath === '/login' && user) {
    const rawRedirect = request.nextUrl.searchParams.get('redirect') || `${localePrefix}/dashboard`
    // Validate redirect to prevent open-redirect attacks
    const redirect = (rawRedirect.startsWith('/') && !rawRedirect.startsWith('//'))
      ? rawRedirect
      : `${localePrefix}/dashboard`
    const url = request.nextUrl.clone()
    url.pathname = redirect
    url.searchParams.delete('redirect')
    return NextResponse.redirect(url)
  }

  // ── 5. Inject x-locale header for downstream server components ──────────
  supabaseResponse.headers.set('x-locale', activeLocale)
  // Also persist the cookie if we just resolved a fresh locale
  if (request.cookies.get(LOCALE_COOKIE)?.value !== activeLocale) {
    supabaseResponse.cookies.set(LOCALE_COOKIE, activeLocale, secureCookieOptions({
      maxAge: LOCALE_COOKIE_MAX_AGE,
    }))
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    // Match all routes except static assets, images, favicon, and Sentry tunnel
    '/((?!_next/static|_next/image|favicon\\.ico|monitoring|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
  ],
}

// Re-export the locale constants for tests
export { ALL_LOCALES, ACTIVE_LOCALES, LOCALE_COOKIE }
