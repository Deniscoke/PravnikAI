'use server'

/**
 * Server Actions — PrávníkAI
 *
 * Mutations that run on the server with the user's session.
 * RLS policies apply — users can only modify their own data.
 *
 * These are called from client components via React Server Actions.
 */

import { createClient } from './server'
import type { ContractGenerationInsert, ContractReviewInsert } from './types'

// ─── Onboarding ──────────────────────────────────────────────────────────────

export async function completeOnboarding(opts: { marketingConsent: boolean }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const now = new Date().toISOString()

  // Update profile
  const { error: profileError } = await supabase
    .from('profiles')
    .update({
      onboarding_completed: true,
      terms_accepted_at: now,
      privacy_accepted_at: now,
    })
    .eq('id', user.id)

  if (profileError) throw new Error('Failed to update profile')

  // Update preferences (marketing consent)
  if (opts.marketingConsent) {
    await supabase
      .from('user_preferences')
      .update({
        marketing_consent: true,
        marketing_consent_at: now,
      })
      .eq('user_id', user.id)
  }
}

// ─── History: Delete ─────────────────────────────────────────────────────────

export async function deleteHistoryItem(
  id: string,
  type: 'generation' | 'review',
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const table =
    type === 'generation'
      ? 'contract_generations_history'
      : 'contract_reviews_history'

  const { error } = await supabase
    .from(table)
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', id)
    .eq('user_id', user.id) // Extra safety on top of RLS

  if (error) throw new Error('Failed to delete history item')
  return { success: true }
}

// ─── History: Save (called from API routes) ──────────────────────────────────

/**
 * Saves a contract generation to history. Best-effort — failures are logged
 * but don't block the API response.
 */
export async function saveGenerationToHistory(data: ContractGenerationInsert) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return // Not authenticated — skip silently

    const { error } = await supabase
      .from('contract_generations_history')
      .insert({ ...data, user_id: user.id })

    if (error) {
      console.error('[history] Failed to save generation:', error.message)
    }
  } catch (err) {
    console.error('[history] Unexpected error saving generation:', err)
  }
}

/**
 * Saves a contract review to history. Best-effort — failures are logged
 * but don't block the API response.
 */
export async function saveReviewToHistory(data: ContractReviewInsert) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return // Not authenticated — skip silently

    const { error } = await supabase
      .from('contract_reviews_history')
      .insert({ ...data, user_id: user.id })

    if (error) {
      console.error('[history] Failed to save review:', error.message)
    }
  } catch (err) {
    console.error('[history] Unexpected error saving review:', err)
  }
}
