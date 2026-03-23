/**
 * Tests for OAuth callback route — PrávníkAI
 *
 * What is tested:
 *   1. Successful code exchange → redirect to /dashboard
 *   2. Successful code exchange with custom redirect → redirect to custom path
 *   3. Missing code → redirect to /login?error=auth_failed
 *   4. Failed code exchange → redirect to /login?error=auth_failed
 *
 * Run:
 *   npx vitest run app/auth/__tests__/callback.test.ts
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'

// ── Mock Supabase server client ──────────────────────────────────────────────

const mockExchangeCode = vi.fn()

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn().mockResolvedValue({
    auth: {
      exchangeCodeForSession: (...args: unknown[]) => mockExchangeCode(...args),
    },
  }),
}))

import { GET } from '@/app/auth/callback/route'

// ─── Helpers ─────────────────────────────────────────────────────────────────

function makeRequest(params: Record<string, string>): NextRequest {
  const url = new URL('http://localhost/auth/callback')
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value)
  }
  return new NextRequest(url)
}

// ─── Tests ───────────────────────────────────────────────────────────────────

beforeEach(() => {
  vi.clearAllMocks()
})

describe('GET /auth/callback', () => {
  it('redirects to /dashboard on successful code exchange', async () => {
    mockExchangeCode.mockResolvedValue({ error: null })
    const res = await GET(makeRequest({ code: 'valid-code' }))
    expect(res.status).toBe(307) // NextResponse.redirect
    expect(new URL(res.headers.get('location')!).pathname).toBe('/dashboard')
  })

  it('redirects to custom path when redirect param is provided', async () => {
    mockExchangeCode.mockResolvedValue({ error: null })
    const res = await GET(makeRequest({ code: 'valid-code', redirect: '/generator' }))
    expect(new URL(res.headers.get('location')!).pathname).toBe('/generator')
  })

  it('redirects to /login?error=auth_failed when code is missing', async () => {
    const res = await GET(makeRequest({}))
    const location = new URL(res.headers.get('location')!)
    expect(location.pathname).toBe('/login')
    expect(location.searchParams.get('error')).toBe('auth_failed')
  })

  it('redirects to /login?error=auth_failed when code exchange fails', async () => {
    mockExchangeCode.mockResolvedValue({ error: new Error('Invalid code') })
    const res = await GET(makeRequest({ code: 'bad-code' }))
    const location = new URL(res.headers.get('location')!)
    expect(location.pathname).toBe('/login')
    expect(location.searchParams.get('error')).toBe('auth_failed')
  })
})
