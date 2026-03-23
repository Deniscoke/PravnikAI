/**
 * Next.js Middleware — PrávníkAI
 *
 * Responsibilities:
 *   1. Refresh Supabase auth session on every matched request (prevents stale JWTs)
 *   2. Protect /dashboard/* and /account/* — redirect to /login if unauthenticated
 *   3. Redirect /login to /dashboard if already authenticated
 *
 * Runs on the Edge Runtime. Keep it fast — no database queries, no heavy logic.
 */

import { NextResponse, type NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          // Update request cookies so downstream Server Components see the fresh session
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          )
          // Rebuild response with updated cookies
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

  const { pathname } = request.nextUrl

  // ── Protected routes: require authentication ────────────────────────────
  const isProtectedRoute =
    pathname.startsWith('/dashboard') ||
    pathname.startsWith('/account') ||
    pathname.startsWith('/onboarding')

  if (isProtectedRoute && !user) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    url.searchParams.set('redirect', pathname)
    return NextResponse.redirect(url)
  }

  // ── Login: redirect to dashboard if already signed in ──────────────────
  if (pathname === '/login' && user) {
    const redirect = request.nextUrl.searchParams.get('redirect') || '/dashboard'
    const url = request.nextUrl.clone()
    url.pathname = redirect
    url.searchParams.delete('redirect')
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    // Match all routes except static assets, images, and favicon
    '/((?!_next/static|_next/image|favicon\\.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
  ],
}
