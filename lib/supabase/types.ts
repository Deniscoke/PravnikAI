/**
 * Supabase Database Types — PrávníkAI
 *
 * Manually defined to match supabase/migrations/001_accounts_history.sql.
 * Regenerate with `npx supabase gen types typescript` once connected to a live project.
 *
 * IMPORTANT: Keep these in sync with the migration. If you change a column,
 * update both the migration AND this file.
 */

// ─── Profiles ────────────────────────────────────────────────────────────────

export interface Profile {
  id: string              // uuid, references auth.users(id)
  display_name: string | null
  avatar_url: string | null
  onboarding_completed: boolean
  terms_accepted_at: string | null    // ISO 8601
  privacy_accepted_at: string | null  // ISO 8601
  stripe_customer_id: string | null   // NULL until first billing interaction
  created_at: string
  updated_at: string
}

// ─── Contract Generations History ────────────────────────────────────────────

export interface ContractGenerationHistory {
  id: string              // uuid
  user_id: string         // uuid, references auth.users(id)
  schema_id: string       // e.g., "kupni-smlouva-v1"
  title: string           // Derived from schema + parties
  mode: 'complete' | 'draft' | 'review-needed'
  contract_text: string | null
  form_data_snapshot: Record<string, unknown> | null  // jsonb
  warnings: Array<{ code: string; message: string }> | null  // jsonb
  legal_basis: string[]
  status: 'completed' | 'failed'
  created_at: string
  updated_at: string
  deleted_at: string | null  // soft delete
}

// ─── Contract Reviews History ────────────────────────────────────────────────

export interface ContractReviewHistory {
  id: string
  user_id: string
  detected_contract_type: string | null
  title: string
  overall_risk: 'low' | 'medium' | 'high'
  summary: string
  review_result: Record<string, unknown>  // Full ReviewContractResponse as jsonb
  input_text_preview: string | null        // First ~200 chars for display
  status: 'completed' | 'failed'
  created_at: string
  updated_at: string
  deleted_at: string | null
}

// ─── User Preferences ───────────────────────────────────────────────────────

export interface UserPreferences {
  user_id: string
  preferred_language: string            // default 'cs'
  email_notifications: boolean
  marketing_consent: boolean
  marketing_consent_at: string | null   // Separate timestamp for GDPR
  subscription_tier: 'free' | 'pro' | 'team'  // Prepared for Stripe billing
  created_at: string
  updated_at: string
}

// ─── Subscriptions (Stripe-synced) ───────────────────────────────────────────

export type SubscriptionStatus =
  | 'active'
  | 'canceled'
  | 'past_due'
  | 'incomplete'
  | 'incomplete_expired'
  | 'trialing'
  | 'paused'
  | 'unpaid'

export interface Subscription {
  id: string                          // uuid
  user_id: string                     // uuid, references auth.users(id)
  stripe_subscription_id: string
  stripe_price_id: string
  status: SubscriptionStatus
  current_period_start: string | null // ISO 8601
  current_period_end: string | null   // ISO 8601
  cancel_at_period_end: boolean
  created_at: string
  updated_at: string
}

export type SubscriptionUpsert = Omit<Subscription, 'id' | 'created_at' | 'updated_at'>

// ─── Export Log (Billing) ────────────────────────────────────────────────────

export interface ExportLog {
  id: string
  user_id: string
  created_at: string
}

// ─── Convenience types for inserts (omit server-generated fields) ────────────

export type ContractGenerationInsert = Omit<ContractGenerationHistory,
  'id' | 'created_at' | 'updated_at' | 'deleted_at'
>

export type ContractReviewInsert = Omit<ContractReviewHistory,
  'id' | 'created_at' | 'updated_at' | 'deleted_at'
>
