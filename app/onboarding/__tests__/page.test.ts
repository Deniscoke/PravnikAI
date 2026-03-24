/**
 * Onboarding page — redirect behavior tests
 *
 * Tests that:
 *   1. Already-onboarded user is redirected to /dashboard
 *   2. Non-onboarded user is NOT redirected (sees the form)
 *   3. Unauthenticated user is redirected to /login
 *
 * Run:
 *   npx vitest run app/onboarding/__tests__/page.test.ts
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'

// ── Mock next/navigation ─────────────────────────────────────────────────────
const mockRedirect = vi.fn()
vi.mock('next/navigation', () => ({ redirect: (url: string) => mockRedirect(url) }))

// ── Mock Supabase server client ───────────────────────────────────────────────
const mockGetUser = vi.fn()
const mockSingle = vi.fn()
const mockEq = vi.fn().mockReturnValue({ single: () => mockSingle() })
const mockSelect = vi.fn().mockReturnValue({ eq: () => mockEq() })
const mockFrom = vi.fn().mockReturnValue({ select: () => mockSelect() })

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn().mockResolvedValue({
    auth: { getUser: () => mockGetUser() },
    from: () => mockFrom(),
  }),
}))

import OnboardingPage from '../page'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function setupUser(onboardingCompleted: boolean) {
  mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
  mockSingle.mockResolvedValue({ data: { onboarding_completed: onboardingCompleted } })
}

function setupUnauthenticated() {
  mockGetUser.mockResolvedValue({ data: { user: null } })
}

// ─── Tests ────────────────────────────────────────────────────────────────────

beforeEach(() => vi.clearAllMocks())

describe('OnboardingPage routing', () => {
  it('redirects already-onboarded user to /dashboard', async () => {
    setupUser(true)
    // The page is an async Server Component — call it directly
    try { await OnboardingPage() } catch { /* redirect throws in test env */ }
    expect(mockRedirect).toHaveBeenCalledWith('/dashboard')
  })

  it('does NOT redirect a non-onboarded authenticated user', async () => {
    setupUser(false)
    try { await OnboardingPage() } catch { /* ignore */ }
    expect(mockRedirect).not.toHaveBeenCalledWith('/dashboard')
  })

  it('redirects unauthenticated user to /login', async () => {
    setupUnauthenticated()
    try { await OnboardingPage() } catch { /* redirect throws in test env */ }
    expect(mockRedirect).toHaveBeenCalledWith('/login')
  })
})
