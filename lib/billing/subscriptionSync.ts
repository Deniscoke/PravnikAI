/**
 * Subscription state reconciliation — Právo365
 *
 * Stripe is the source of truth; this module writes that truth into our tables.
 *
 * Two entry points share the same write path so both can never drift:
 *   - applySubscriptionToDb()          — used by the Stripe webhook
 *   - syncUserSubscriptionFromStripe() — pulls state on demand (after checkout,
 *                                        or to repair an account whose webhook
 *                                        never arrived)
 *
 * Writes use UPSERT, never UPDATE: a plain UPDATE against a missing row reports
 * no error and changes nothing, which is how a paid customer could keep looking
 * like a free one.
 */

import type { SupabaseClient } from '@supabase/supabase-js'
import type Stripe from 'stripe'
import { stripe } from './stripe'
import { mapStripePriceToPlan, type SubscriptionTier } from './plans'
import type { SubscriptionStatus } from '@/lib/supabase/types'

/** Statuses that still entitle the user to their paid tier. */
const PAID_STATUSES: readonly SubscriptionStatus[] = ['active', 'trialing', 'past_due']

export interface AppliedSubscription {
  tier: SubscriptionTier
  status: SubscriptionStatus
}

/**
 * Persist a Stripe subscription and the resulting tier for `userId`.
 * Returns null when the subscription could not be written.
 */
export async function applySubscriptionToDb(
  serviceClient: SupabaseClient,
  subscription: Stripe.Subscription,
  userId: string,
): Promise<AppliedSubscription | null> {
  // In API 2026+, period dates live on the item, not the subscription
  const firstItem = subscription.items.data[0]
  const priceId = firstItem?.price?.id
  if (!priceId) {
    console.error('[billing] Subscription has no price ID:', subscription.id)
    return null
  }

  const status = subscription.status as SubscriptionStatus
  const tier = mapStripePriceToPlan(priceId)
  const effectiveTier: SubscriptionTier = PAID_STATUSES.includes(status) ? tier : 'free'

  const { error: subError } = await serviceClient
    .from('subscriptions')
    .upsert(
      {
        user_id: userId,
        stripe_subscription_id: subscription.id,
        stripe_price_id: priceId,
        status,
        current_period_start: new Date(firstItem.current_period_start * 1000).toISOString(),
        current_period_end: new Date(firstItem.current_period_end * 1000).toISOString(),
        cancel_at_period_end: subscription.cancel_at_period_end,
      },
      { onConflict: 'stripe_subscription_id' },
    )

  if (subError) {
    // Bookkeeping failed, but entitlement must not depend on it: the tier is what
    // grants access, while this row only supplies billing-period dates (usage
    // counting falls back to the calendar month without it).
    console.error('[billing] Failed to upsert subscription row:', subError.message)
  }

  const { error: prefError } = await serviceClient
    .from('user_preferences')
    .upsert({ user_id: userId, subscription_tier: effectiveTier }, { onConflict: 'user_id' })

  if (prefError) {
    console.error('[billing] Failed to sync subscription_tier:', prefError.message)
  }

  console.info(
    `[billing] Subscription ${subscription.id} → user ${userId} | tier=${effectiveTier} status=${status}`,
  )

  return { tier: effectiveTier, status }
}

export interface SyncResult {
  tier: SubscriptionTier
  status?: SubscriptionStatus
  customerId: string | null
  /** True when a Stripe subscription was found and written to our tables. */
  synced: boolean
}

/**
 * Pull the user's subscription state from Stripe and store it.
 *
 * Safe to call repeatedly — it is the repair path when a webhook was never
 * delivered (wrong endpoint, bad signing secret, downtime).
 */
export async function syncUserSubscriptionFromStripe(
  serviceClient: SupabaseClient,
  userId: string,
  email?: string,
): Promise<SyncResult> {
  const { data: profile } = await serviceClient
    .from('profiles')
    .select('stripe_customer_id')
    .eq('id', userId)
    .maybeSingle()

  let customerId: string | null = profile?.stripe_customer_id ?? null

  if (!customerId) {
    customerId = await findStripeCustomerId(userId, email)
    if (customerId) {
      // Restore the mapping the checkout route failed to persist
      const { error } = await serviceClient
        .from('profiles')
        .upsert({ id: userId, stripe_customer_id: customerId }, { onConflict: 'id' })
      if (error) {
        console.error('[billing] Failed to store stripe_customer_id:', error.message)
      }
    }
  }

  if (!customerId) {
    return { tier: 'free', customerId: null, synced: false }
  }

  let subscriptions: Stripe.Subscription[]
  try {
    const list = await stripe.subscriptions.list({ customer: customerId, status: 'all', limit: 10 })
    subscriptions = list.data
  } catch (err) {
    console.error('[billing] Failed to list Stripe subscriptions:', err instanceof Error ? err.message : err)
    return { tier: 'free', customerId, synced: false }
  }

  const relevant =
    subscriptions.find((s) => PAID_STATUSES.includes(s.status as SubscriptionStatus)) ?? subscriptions[0]

  if (!relevant) {
    return { tier: 'free', customerId, synced: false }
  }

  const applied = await applySubscriptionToDb(serviceClient, relevant, userId)
  if (!applied) {
    return { tier: 'free', customerId, synced: false }
  }

  return { tier: applied.tier, status: applied.status, customerId, synced: true }
}

/**
 * Locate the Stripe customer for a user: first by the metadata we set at
 * creation, then by e-mail (the search index lags a little behind writes).
 */
async function findStripeCustomerId(userId: string, email?: string): Promise<string | null> {
  try {
    const byMetadata = await stripe.customers.search({
      query: `metadata['supabase_user_id']:'${userId}'`,
      limit: 1,
    })
    if (byMetadata.data[0]) return byMetadata.data[0].id
  } catch (err) {
    console.error('[billing] Stripe customer search failed:', err instanceof Error ? err.message : err)
  }

  if (email) {
    try {
      const byEmail = await stripe.customers.list({ email, limit: 1 })
      if (byEmail.data[0]) return byEmail.data[0].id
    } catch (err) {
      console.error('[billing] Stripe customer lookup by e-mail failed:', err instanceof Error ? err.message : err)
    }
  }

  return null
}
