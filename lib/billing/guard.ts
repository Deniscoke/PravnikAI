/**
 * Billing guard — PrávníkAI
 *
 * Route-level billing enforcement. Determines whether a user can perform
 * a billable action (generate, review, export) based on their subscription
 * state and current-period usage.
 *
 * Authorization flow:
 *   1. Authenticate via getUser() (server-validated JWT, not getSession())
 *   2. Read active subscription from `subscriptions` table (source of truth)
 *   3. Derive tier from stripe_price_id via mapStripePriceToPlan()
 *   4. Count current-period usage from existing history tables + export_log
 *   5. Compare against TIER_LIMITS
 *
 * Key design decisions:
 *   - Tier is ALWAYS derived from subscriptions table, never from
 *     user_preferences.subscription_tier (which is just a UI cache)
 *   - Unauthenticated users pass through (preserves backward compat)
 *   - past_due subscriptions retain paid-tier access (Stripe is retrying)
 *   - Unknown price IDs → free tier (fail safe, not fail open)
 */

import { NextResponse } from 'next/server'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { User } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/server'
import {
  type SubscriptionTier,
  TIER_LIMITS,
  type TierLimits,
  PLAN_INFO,
  mapStripePriceToPlan,
} from './plans'
import type { Subscription, SubscriptionStatus } from '@/lib/supabase/types'

// ─── Types ───────────────────────────────────────────────────────────────────

export type BillingAction = 'generate' | 'review' | 'export'

export interface FullUsageCounts {
  generations: number
  reviews: number
  exports: number
}

export interface BillingAccessResult {
  allowed: boolean
  plan: SubscriptionTier
  status: string  // 'active' | 'trialing' | 'past_due' | 'free'
  reason?: string
  code?: string
  limits: TierLimits
  usage: FullUsageCounts
}

/** Returned by assertBillingAccess — discriminated union for clean route integration */
export type BillingGuardResult =
  | { allowed: true; user: User | null; billing: BillingAccessResult | null }
  | { allowed: false; response: NextResponse }

// ─── Subscription statuses that grant paid-tier access ───────────────────────

const PAID_ACCESS_STATUSES: SubscriptionStatus[] = [
  'active', 'trialing', 'past_due',
]

// ─── assertBillingAccess ─────────────────────────────────────────────────────
/**
 * Top-level guard for API route handlers.
 *
 * Usage in a route:
 *   const guard = await assertBillingAccess('generate')
 *   if (!guard.allowed) return guard.response
 *   // guard.user is available (null for unauthenticated)
 *
 * Behavior:
 *   - Unauthenticated: returns allowed=true with user=null, billing=null
 *     (preserves backward compat — anonymous users can still use the app)
 *   - Authenticated + within limits: returns allowed=true with billing state
 *   - Authenticated + over limit: returns allowed=false with 402 JSON response
 */
export async function assertBillingAccess(
  action: BillingAction,
): Promise<BillingGuardResult> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Unauthenticated: allow (backward compat — no billing to enforce)
  if (!user) {
    return { allowed: true, user: null, billing: null }
  }

  const billing = await getBillingAccessForUser(supabase, user.id, action)

  if (!billing.allowed) {
    return {
      allowed: false,
      response: NextResponse.json(
        {
          error: billing.reason,
          code: billing.code,
          plan: billing.plan,
          usage: billing.usage,
          limits: billing.limits,
        },
        { status: 402 },
      ),
    }
  }

  return { allowed: true, user, billing }
}

// ─── getBillingAccessForUser ─────────────────────────────────────────────────
/**
 * Core billing logic. Determines if a specific action is allowed.
 *
 * This is the lower-level function — use assertBillingAccess() in routes
 * for the full auth + billing check.
 *
 * @param supabase - User-scoped client (RLS applies)
 * @param userId   - Authenticated user ID
 * @param action   - The billable action to check
 */
export async function getBillingAccessForUser(
  supabase: SupabaseClient,
  userId: string,
  action: BillingAction,
): Promise<BillingAccessResult> {
  // 1. Get active subscription (source of truth — NOT user_preferences)
  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('user_id', userId)
    .in('status', PAID_ACCESS_STATUSES)
    .limit(1)
    .maybeSingle()

  // 2. Derive tier from subscription, not cache
  const tier: SubscriptionTier = subscription
    ? mapStripePriceToPlan(subscription.stripe_price_id)
    : 'free'

  const status = subscription?.status ?? 'free'
  const limits = TIER_LIMITS[tier]

  // 3. Determine billing period window
  const periodStart = subscription?.current_period_start
    ?? getCalendarMonthStart()

  // 4. Count usage across all action types in current period
  const usage = await getFullUsageCounts(supabase, userId, periodStart)

  // 5. Check limit for the requested action
  const limitKey = actionToLimitKey(action)
  const limit = limits[limitKey]
  const used = usage[limitKey]

  // Unlimited: always allowed
  if (limit === -1) {
    return { allowed: true, plan: tier, status, limits, usage }
  }

  // Over limit: blocked
  if (used >= limit) {
    const planName = PLAN_INFO[tier].name
    return {
      allowed: false,
      plan: tier,
      status,
      reason: billingBlockMessage(action, planName),
      code: 'BILLING_LIMIT_REACHED',
      limits,
      usage,
    }
  }

  // Within limits: allowed
  return { allowed: true, plan: tier, status, limits, usage }
}

// ─── getCurrentUsageForUser ──────────────────────────────────────────────────
/**
 * Public accessor for current usage counts. Used by billing UI endpoints.
 * Derives the period from the subscription (or calendar month for free).
 */
export async function getCurrentUsageForUser(
  supabase: SupabaseClient,
  userId: string,
): Promise<{ usage: FullUsageCounts; periodStart: string; tier: SubscriptionTier }> {
  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('stripe_price_id, current_period_start, status')
    .eq('user_id', userId)
    .in('status', PAID_ACCESS_STATUSES)
    .limit(1)
    .maybeSingle()

  const tier: SubscriptionTier = subscription
    ? mapStripePriceToPlan(subscription.stripe_price_id)
    : 'free'

  const periodStart = subscription?.current_period_start
    ?? getCalendarMonthStart()

  const usage = await getFullUsageCounts(supabase, userId, periodStart)

  return { usage, periodStart, tier }
}

// ─── recordExport ────────────────────────────────────────────────────────────
/**
 * Records a successful export in export_log for billing counting.
 * Called AFTER the DOCX is successfully generated, not before.
 *
 * Best-effort: failures are logged but don't block the response.
 */
export async function recordExport(
  supabase: SupabaseClient,
  userId: string,
): Promise<void> {
  const { error } = await supabase
    .from('export_log')
    .insert({ user_id: userId })

  if (error) {
    console.error('[billing] Failed to record export:', error.message)
  }
}

// ─── Internal helpers ────────────────────────────────────────────────────────

/**
 * Counts all billable actions in the current period.
 * Uses existing history tables for generate/review, export_log for exports.
 * All three queries run in parallel for minimal latency.
 */
async function getFullUsageCounts(
  supabase: SupabaseClient,
  userId: string,
  periodStart: string,
): Promise<FullUsageCounts> {
  const [genResult, revResult, expResult] = await Promise.all([
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
    supabase
      .from('export_log')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId)
      .gte('created_at', periodStart),
  ])

  return {
    generations: genResult.count ?? 0,
    reviews: revResult.count ?? 0,
    exports: expResult.count ?? 0,
  }
}

function actionToLimitKey(action: BillingAction): keyof TierLimits {
  switch (action) {
    case 'generate': return 'generations'
    case 'review': return 'reviews'
    case 'export': return 'exports'
  }
}

function billingBlockMessage(action: BillingAction, planName: string): string {
  const actionLabel: Record<BillingAction, string> = {
    generate: 'generování smluv',
    review: 'AI kontroly smluv',
    export: 'exporty do DOCX',
  }
  return `Byl dosažen měsíční limit pro ${actionLabel[action]} v tarifu ${planName}. Přejděte na vyšší tarif pro více možností. Potřebujete pomoc? Kontaktujte nás na info.indiweb@gmail.com.`
}

function getCalendarMonthStart(): string {
  const now = new Date()
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1))
    .toISOString()
}
