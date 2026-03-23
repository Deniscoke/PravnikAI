/**
 * Tests for Next.js middleware — PrávníkAI
 *
 * What is tested:
 *   1. Protected routes redirect to /login when unauthenticated
 *   2. Protected routes pass through when authenticated
 *   3. /login redirects to /dashboard when already authenticated
 *   4. Public routes (/, /generator, /review) pass through for everyone
 *   5. Redirect preserves the intended destination in ?redirect param
 *
 * Run:
 *   npx vitest run middleware.test.ts
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

import { middleware } from './middleware'

// ─── Helpers ─────────────────────────────────────────────────────────────────

function makeRequest(path: string): NextRequest {
  return new NextRequest(new URL(`http://localhost${path}`))
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
  // Set required env vars for the mock
  process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co'
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key'
})

describe('middleware', () => {
  it('redirects /dashboard to /login when unauthenticated', async () => {
    mockUnauthenticated()
    const res = await middleware(makeRequest('/dashboard'))
    expect(res.status).toBe(307)
    const location = new URL(res.headers.get('location')!)
    expect(location.pathname).toBe('/login')
    expect(location.searchParams.get('redirect')).toBe('/dashboard')
  })

  it('allows /dashboard when authenticated', async () => {
    mockAuthenticated()
    const res = await middleware(makeRequest('/dashboard'))
    // Should NOT redirect — pass through
    expect(res.status).toBe(200)
  })

  it('redirects /login to /dashboard when already authenticated', async () => {
    mockAuthenticated()
    const res = await middleware(makeRequest('/login'))
    expect(res.status).toBe(307)
    expect(new URL(res.headers.get('location')!).pathname).toBe('/dashboard')
  })

  it('allows /login when unauthenticated', async () => {
    mockUnauthenticated()
    const res = await middleware(makeRequest('/login'))
    expect(res.status).toBe(200)
  })

  it('allows public routes for unauthenticated users', async () => {
    mockUnauthenticated()
    for (const path of ['/', '/generator', '/review']) {
      const res = await middleware(makeRequest(path))
      expect(res.status).toBe(200)
    }
  })

  it('allows public routes for authenticated users', async () => {
    mockAuthenticated()
    for (const path of ['/', '/generator', '/review']) {
      const res = await middleware(makeRequest(path))
      expect(res.status).toBe(200)
    }
  })

  it('preserves redirect path when redirecting to login', async () => {
    mockUnauthenticated()
    const res = await middleware(makeRequest('/dashboard/some-page'))
    const location = new URL(res.headers.get('location')!)
    expect(location.searchParams.get('redirect')).toBe('/dashboard/some-page')
  })
})
