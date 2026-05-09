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
  DEFAULT_LOCALE,
  type Locale,
} from '@/lib/contracts/types'
import {
  coerceLocale,
  isValidLocale,
  negotiateLocaleFromHeader,
} from '@/lib/i18n'

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
      // Path has no locale prefix → choose one and redirect
      const cookieLocale = request.cookies.get(LOCALE_COOKIE)?.value
      const headerLocale = request.headers.get('accept-language')
      const locale: Locale = cookieLocale && isValidLocale(cookieLocale)
        ? cookieLocale
        : negotiateLocaleFromHeader(headerLocale)

      const url = request.nextUrl.clone()
      url.pathname = pathname === '/' ? `/${locale}` : `/${locale}${pathname}`
      const redirectResponse = NextResponse.redirect(url)
      // Persist preference so the next visit lands directly
      redirectResponse.cookies.set(LOCALE_COOKIE, locale, {
        maxAge: LOCALE_COOKIE_MAX_AGE,
        path: '/',
        sameSite: 'lax',
      })
      return redirectResponse
    }

    // Path already has a locale prefix → continue, set x-locale header below
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
    supabaseResponse.cookies.set(LOCALE_COOKIE, activeLocale, {
      maxAge: LOCALE_COOKIE_MAX_AGE,
      path: '/',
      sameSite: 'lax',
    })
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
export { ALL_LOCALES, LOCALE_COOKIE }
