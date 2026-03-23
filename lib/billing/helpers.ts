/**
 * Billing helper functions — PrávníkAI
 *
 * Reusable server-side helpers for Stripe billing operations.
 * All functions run on the server only (they import the Stripe secret client).
 *
 * Pattern: Each function takes a Supabase client (user or service) as needed.
 * The caller decides which client to pass — this keeps the helpers testable
 * and explicit about privilege level.
 */

import type { SupabaseClient } from '@supabase/supabase-js'
import { stripe } from './stripe'
import {
  type SubscriptionTier,
  TIER_LIMITS,
  type TierLimits,
  mapStripePriceToPlan,
} from './plans'
import type { Subscription, SubscriptionStatus } from '@/lib/supabase/types'

// ─── Types ───────────────────────────────────────────────────────────────────

export interface BillingState {
  tier: SubscriptionTier
  subscription: Subscription | null
  usage: UsageCounts
  limits: TierLimits
  periodStart: string  // ISO 8601
  periodEnd: string | null  // null for free tier (calendar month)
}

export interface UsageCounts {
  generations: number
  reviews: number
}

export interface UsageCheckResult {
  allowed: boolean
  tier: SubscriptionTier
  used: number
  limit: number  // -1 = unlimited
  remaining: number  // Infinity for unlimited, but serialized as -1 in JSON
}

// ─── Active subscription statuses ────────────────────────────────────────────

const ACTIVE_STATUSES: SubscriptionStatus[] = [
  'active', 'trialing', 'past_due',
]

// ─── getOrCreateStripeCustomerForUser ────────────────────────────────────────
/**
 * Ensures the user has a Stripe Customer ID. Creates one if missing.
 *
 * Uses serviceClient for the DB write (bypasses RLS) because:
 *   - profiles RLS may not permit updating stripe_customer_id
 *   - the caller has already validated user identity
 *
 * Stores `supabase_user_id` in Stripe Customer metadata so webhooks
 * can resolve the Supabase user from any Stripe object.
 */
export async function getOrCreateStripeCustomerForUser(opts: {
  userId: string
  email: string
  displayName: string | null
  serviceClient: SupabaseClient
}): Promise<string> {
  const { userId, email, displayName, serviceClient } = opts

  // 1. Check if we already have a Stripe customer ID
  const { data: profile } = await serviceClient
    .from('profiles')
    .select('stripe_customer_id')
    .eq('id', userId)
    .single()

  if (profile?.stripe_customer_id) {
    return profile.stripe_customer_id
  }

  // 2. Create Stripe customer with our user ID in metadata
  const customer = await stripe.customers.create({
    email,
    name: displayName ?? undefined,
    metadata: {
      supabase_user_id: userId,
    },
  })

  // 3. Store mapping back in our DB
  const { error } = await serviceClient
    .from('profiles')
    .update({ stripe_customer_id: customer.id })
    .eq('id', userId)

  if (error) {
    // Customer was created in Stripe but DB write failed.
    // Log the orphan so it can be reconciled. Don't throw —
    // the Stripe customer ID is still valid for this session.
    console.error(
      `[billing] Failed to save stripe_customer_id for user ${userId}:`,
      error.message,
      `Orphaned Stripe customer: ${customer.id}`,
    )
  }

  return customer.id
}

// ─── getUsageCounts ──────────────────────────────────────────────────────────
/**
 * Counts billable actions since `periodStart` by querying existing history tables.
 * No separate usage_tracking table needed — history IS the usage log.
 *
 * Uses `{ count: 'exact', head: true }` for a COUNT-only query (no row data).
 * The partial indexes (idx_gen_history_billing, idx_review_history_billing)
 * make this an index-only scan — fast even at thousands of rows.
 */
export async function getUsageCounts(
  supabase: SupabaseClient,
  userId: string,
  periodStart: string,
): Promise<UsageCounts> {
  const [genResult, revResult] = await Promise.all([
    supabase
      .from('contract_generations_history')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId)
      .gte('created_at', periodStart)
      .is('deleted_at', null),
    supabase
      .from('contract_reviews_history')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId)
      .gte('created_at', periodStart)
      .is('deleted_at', null),
  ])

  return {
    generations: genResult.count ?? 0,
    reviews: revResult.count ?? 0,
  }
}

// ─── getBillingStateForUser ──────────────────────────────────────────────────
/**
 * Returns the complete billing state for a user: tier, subscription details,
 * current usage counts, and limits.
 *
 * This is the "one call to rule them all" for billing UI and guards.
 *
 * @param supabase - User-scoped client (RLS applies for subscription SELECT)
 * @param userId   - The authenticated user's ID
 */
export async function getBillingStateForUser(
  supabase: SupabaseClient,
  userId: string,
): Promise<BillingState> {
  // 1. Fetch subscription + preferences in parallel
  const [subResult, prefResult] = await Promise.all([
    supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .in('status', ACTIVE_STATUSES)
      .limit(1)
      .maybeSingle(),
    supabase
      .from('user_preferences')
      .select('subscription_tier')
      .eq('user_id', userId)
      .single(),
  ])

  const subscription: Subscription | null = subResult.data
  const tier: SubscriptionTier =
    (prefResult.data?.subscription_tier as SubscriptionTier) ?? 'free'

  // 2. Determine billing period
  //    Paid: use Stripe's current_period_start
  //    Free: use 1st of current calendar month UTC
  const periodStart = subscription?.current_period_start
    ?? getCalendarMonthStart()
  const periodEnd = subscription?.current_period_end ?? null

  // 3. Count usage in current period
  const usage = await getUsageCounts(supabase, userId, periodStart)

  return {
    tier,
    subscription,
    usage,
    limits: TIER_LIMITS[tier],
    periodStart,
    periodEnd,
  }
}

// ─── checkUsageLimit ─────────────────────────────────────────────────────────
/**
 * Quick check: can the user perform one more action of the given type?
 * Used as a guard before generate/review/export API calls.
 *
 * @param supabase - User-scoped client
 * @param userId   - The authenticated user's ID
 * @param action   - The billable action type
 */
export async function checkUsageLimit(
  supabase: SupabaseClient,
  userId: string,
  action: 'generate' | 'review',
): Promise<UsageCheckResult> {
  const state = await getBillingStateForUser(supabase, userId)

  const limitKey = action === 'generate' ? 'generations' : 'reviews'
  const limit = state.limits[limitKey]
  const used = state.usage[action === 'generate' ? 'generations' : 'reviews']

  if (limit === -1) {
    return { allowed: true, tier: state.tier, used, limit: -1, remaining: -1 }
  }

  const remaining = Math.max(0, limit - used)
  return {
    allowed: used < limit,
    tier: state.tier,
    used,
    limit,
    remaining,
  }
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Returns ISO 8601 timestamp for the 1st of the current month at 00:00:00 UTC.
 * Used as the billing period start for free-tier users.
 */
function getCalendarMonthStart(): string {
  const now = new Date()
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1))
    .toISOString()
}
