/**
 * Tests for Supabase server actions — PrávníkAI
 *
 * What is tested:
 *   1. deleteHistoryItem — deletes own item (soft-delete)
 *   2. deleteHistoryItem — rejects unauthenticated calls
 *   3. saveGenerationToHistory — saves when authenticated
 *   4. saveGenerationToHistory — skips silently when not authenticated
 *   5. saveReviewToHistory — saves when authenticated
 *   6. completeOnboarding — updates profile and preferences
 *   7. completeOnboarding — rejects unauthenticated calls
 *
 * All Supabase calls are mocked — no real database.
 *
 * Run:
 *   npx vitest run lib/supabase/__tests__/actions.test.ts
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'

// ── Mock Supabase server client ──────────────────────────────────────────────

const mockUpdate = vi.fn().mockReturnValue({ eq: vi.fn().mockReturnValue({ eq: vi.fn().mockResolvedValue({ error: null }) }) })
const mockInsert = vi.fn().mockResolvedValue({ error: null })
const mockFrom = vi.fn().mockReturnValue({
  update: mockUpdate,
  insert: mockInsert,
})
const mockGetUser = vi.fn()

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn().mockResolvedValue({
    auth: {
      getUser: () => mockGetUser(),
    },
    from: (...args: unknown[]) => mockFrom(...args),
  }),
}))

import {
  deleteHistoryItem,
  saveGenerationToHistory,
  saveReviewToHistory,
  completeOnboarding,
} from '../actions'

// ─── Helpers ─────────────────────────────────────────────────────────────────

function mockAuthenticatedUser(id = 'user-123') {
  mockGetUser.mockResolvedValue({ data: { user: { id } } })
}

function mockUnauthenticatedUser() {
  mockGetUser.mockResolvedValue({ data: { user: null } })
}

// ─── Tests ───────────────────────────────────────────────────────────────────

beforeEach(() => {
  vi.clearAllMocks()
  // Reset chain mocks
  mockUpdate.mockReturnValue({
    eq: vi.fn().mockReturnValue({
      eq: vi.fn().mockResolvedValue({ error: null }),
    }),
  })
  mockInsert.mockResolvedValue({ error: null })
})

describe('deleteHistoryItem', () => {
  it('soft-deletes a generation history item for authenticated user', async () => {
    mockAuthenticatedUser()
    const result = await deleteHistoryItem('item-1', 'generation')
    expect(result).toEqual({ success: true })
    expect(mockFrom).toHaveBeenCalledWith('contract_generations_history')
  })

  it('soft-deletes a review history item for authenticated user', async () => {
    mockAuthenticatedUser()
    const result = await deleteHistoryItem('item-2', 'review')
    expect(result).toEqual({ success: true })
    expect(mockFrom).toHaveBeenCalledWith('contract_reviews_history')
  })

  it('throws when user is not authenticated', async () => {
    mockUnauthenticatedUser()
    await expect(deleteHistoryItem('item-1', 'generation')).rejects.toThrow('Unauthorized')
  })
})

describe('saveGenerationToHistory', () => {
  const generationData = {
    user_id: '',
    schema_id: 'kupni-smlouva-v1',
    title: 'Kupní smlouva',
    mode: 'complete' as const,
    contract_text: 'KUPNÍ SMLOUVA...',
    form_data_snapshot: { parties: [] },
    warnings: [],
    legal_basis: ['§ 2079 NOZ'],
    status: 'completed' as const,
  }

  it('saves to history when user is authenticated', async () => {
    mockAuthenticatedUser('user-abc')
    await saveGenerationToHistory(generationData)
    expect(mockFrom).toHaveBeenCalledWith('contract_generations_history')
    expect(mockInsert).toHaveBeenCalled()
  })

  it('skips silently when user is not authenticated', async () => {
    mockUnauthenticatedUser()
    await saveGenerationToHistory(generationData)
    // from() should still be called (via createClient), but insert should not
    // because the action returns early when user is null
    expect(mockInsert).not.toHaveBeenCalled()
  })
})

describe('saveReviewToHistory', () => {
  const reviewData = {
    user_id: '',
    detected_contract_type: 'Kupní smlouva',
    title: 'Kontrola: Kupní smlouva',
    overall_risk: 'medium' as const,
    summary: 'Smlouva má rizika.',
    review_result: { overallRisk: 'medium' },
    input_text_preview: 'Text smlouvy...',
    status: 'completed' as const,
  }

  it('saves to history when user is authenticated', async () => {
    mockAuthenticatedUser()
    await saveReviewToHistory(reviewData)
    expect(mockFrom).toHaveBeenCalledWith('contract_reviews_history')
    expect(mockInsert).toHaveBeenCalled()
  })

  it('skips silently when user is not authenticated', async () => {
    mockUnauthenticatedUser()
    await saveReviewToHistory(reviewData)
    expect(mockInsert).not.toHaveBeenCalled()
  })
})

describe('completeOnboarding', () => {
  it('updates profile and preferences for authenticated user', async () => {
    mockAuthenticatedUser('user-xyz')
    await completeOnboarding({ marketingConsent: true })
    // Should call from('profiles') and from('user_preferences')
    expect(mockFrom).toHaveBeenCalledWith('profiles')
    expect(mockFrom).toHaveBeenCalledWith('user_preferences')
  })

  it('throws when user is not authenticated', async () => {
    mockUnauthenticatedUser()
    await expect(completeOnboarding({ marketingConsent: false })).rejects.toThrow('Unauthorized')
  })
})
