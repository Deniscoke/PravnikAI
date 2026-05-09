/**
 * Tests for Next.js Proxy (Middleware) — PrávníkAI
 *
 * Covers:
 *   1. Locale negotiation: locale-less paths are redirected to /{locale}/...
 *   2. Locale persistence via cookie
 *   3. Protected routes redirect to /{locale}/login when unauthenticated
 *   4. Protected routes pass through when authenticated
 *   5. /{locale}/login redirects to /{locale}/dashboard when already authenticated
 *   6. Public routes pass through and have x-locale header set
 *   7. Redirect preserves the intended destination in ?redirect param
 *
 * Run:
 *   npx vitest run proxy.test.ts
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'

// ── Mock Supabase SSR ────────────────────────────────────────────────────────

const mockGetUser = vi.fn()

vi.mock('@supabase/ssr', () => ({
  createServerClient: vi.fn(() => ({
    auth: {
      getUser: () => mockGetUser(),
    },
  })),
}))

import { proxy, LOCALE_COOKIE } from './proxy'

// ─── Helpers ─────────────────────────────────────────────────────────────────

function makeRequest(path: string, opts?: { acceptLanguage?: string; localeCookie?: string }): NextRequest {
  const headers: Record<string, string> = {}
  if (opts?.acceptLanguage) headers['accept-language'] = opts.acceptLanguage

  const req = new NextRequest(new URL(`http://localhost${path}`), { headers })
  if (opts?.localeCookie) {
    req.cookies.set(LOCALE_COOKIE, opts.localeCookie)
  }
  return req
}

function mockAuthenticated() {
  mockGetUser.mockResolvedValue({ data: { user: { id: 'user-123' } } })
}

function mockUnauthenticated() {
  mockGetUser.mockResolvedValue({ data: { user: null } })
}

// ─── Tests ───────────────────────────────────────────────────────────────────

beforeEach(() => {
  vi.clearAllMocks()
  process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co'
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key'
})

describe('proxy — locale negotiation', () => {
  it('redirects "/" to "/{negotiated-locale}" using accept-language header', async () => {
    mockUnauthenticated()
    const res = await proxy(makeRequest('/', { acceptLanguage: 'de-DE,de;q=0.9,en;q=0.5' }))
    expect(res.status).toBe(307)
    expect(new URL(res.headers.get('location')!).pathname).toBe('/de')
  })

  it('redirects "/" to "/cs" by default when no signal is present', async () => {
    mockUnauthenticated()
    const res = await proxy(makeRequest('/'))
    expect(res.status).toBe(307)
    expect(new URL(res.headers.get('location')!).pathname).toBe('/cs')
  })

  it('honours the locale cookie over accept-language', async () => {
    mockUnauthenticated()
    const res = await proxy(
      makeRequest('/generator', { acceptLanguage: 'de-DE', localeCookie: 'en' }),
    )
    expect(res.status).toBe(307)
    expect(new URL(res.headers.get('location')!).pathname).toBe('/en/generator')
  })

  it('preserves the path when redirecting to a locale prefix', async () => {
    mockUnauthenticated()
    const res = await proxy(makeRequest('/review', { acceptLanguage: 'cs' }))
    expect(new URL(res.headers.get('location')!).pathname).toBe('/cs/review')
  })

  it('does not redirect API or auth routes', async () => {
    mockUnauthenticated()
    const res = await proxy(makeRequest('/api/health'))
    expect(res.status).toBe(200)
  })
})

describe('proxy — auth gating with locale prefixes', () => {
  it('redirects /{locale}/dashboard to /{locale}/login when unauthenticated', async () => {
    mockUnauthenticated()
    const res = await proxy(makeRequest('/cs/dashboard'))
    expect(res.status).toBe(307)
    const location = new URL(res.headers.get('location')!)
    expect(location.pathname).toBe('/cs/login')
    expect(location.searchParams.get('redirect')).toBe('/cs/dashboard')
  })

  it('keeps the locale when redirecting unauthenticated /de/dashboard', async () => {
    mockUnauthenticated()
    const res = await proxy(makeRequest('/de/dashboard'))
    expect(new URL(res.headers.get('location')!).pathname).toBe('/de/login')
  })

  it('allows /{locale}/dashboard when authenticated', async () => {
    mockAuthenticated()
    const res = await proxy(makeRequest('/cs/dashboard'))
    expect(res.status).toBe(200)
  })

  it('redirects /{locale}/login to /{locale}/dashboard when authenticated', async () => {
    mockAuthenticated()
    const res = await proxy(makeRequest('/de/login'))
    expect(res.status).toBe(307)
    expect(new URL(res.headers.get('location')!).pathname).toBe('/de/dashboard')
  })

  it('allows /{locale}/login when unauthenticated', async () => {
    mockUnauthenticated()
    const res = await proxy(makeRequest('/cs/login'))
    expect(res.status).toBe(200)
  })

  it('allows public routes for unauthenticated users', async () => {
    mockUnauthenticated()
    for (const path of ['/cs', '/cs/generator', '/cs/review', '/en/generator', '/de']) {
      const res = await proxy(makeRequest(path))
      expect(res.status).toBe(200)
    }
  })

  it('preserves redirect path when redirecting to login', async () => {
    mockUnauthenticated()
    const res = await proxy(makeRequest('/cs/dashboard/some-page'))
    const location = new URL(res.headers.get('location')!)
    expect(location.searchParams.get('redirect')).toBe('/cs/dashboard/some-page')
  })

  it('sets x-locale header on pass-through responses', async () => {
    mockUnauthenticated()
    const res = await proxy(makeRequest('/de/generator'))
    expect(res.status).toBe(200)
    expect(res.headers.get('x-locale')).toBe('de')
  })
})
