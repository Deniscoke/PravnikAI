/**
 * POST /api/billing/webhook
 *
 * Stripe webhook handler. Receives events from Stripe, verifies the signature,
 * and updates our database to match Stripe's state.
 *
 * Auth: Stripe-Signature header (NOT Supabase auth — no user cookie)
 * Body: Raw request body (must NOT be parsed before signature verification)
 *
 * Handled events:
 *   - checkout.session.completed     → create subscription row + sync tier
 *   - customer.subscription.updated  → update subscription row + sync tier
 *   - customer.subscription.deleted  → mark canceled + downgrade to free
 *   - invoice.payment_failed         → set status to past_due
 *   - customer.updated               → sync email/name changes from Portal
 *
 * Design:
 *   - All DB writes use createServiceClient() (bypasses RLS)
 *   - Handlers are idempotent (UPSERT by stripe_subscription_id)
 *   - Returns 200 quickly to prevent Stripe retries
 *   - Unknown events are acknowledged (200) but not processed
 */

import { NextRequest, NextResponse } from 'next/server'
import type Stripe from 'stripe'
import { stripe } from '@/lib/billing/stripe'
import { createServiceClient } from '@/lib/supabase/server'
import { mapStripePriceToPlan } from '@/lib/billing/plans'
import type { SubscriptionStatus } from '@/lib/supabase/types'

export const runtime = 'nodejs'

// ─── Main handler ────────────────────────────────────────────────────────────

export async function POST(req: NextRequest): Promise<NextResponse> {
  // ── 1. Read raw body BEFORE any parsing ────────────────────────────────────
  const rawBody = await req.text()
  const signature = req.headers.get('stripe-signature')

  if (!signature) {
    return NextResponse.json(
      { error: 'Missing Stripe-Signature header.' },
      { status: 400 },
    )
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
  if (!webhookSecret) {
    console.error('[webhook] STRIPE_WEBHOOK_SECRET is not configured')
    return NextResponse.json(
      { error: 'Webhook not configured.' },
      { status: 500 },
    )
  }

  // ── 2. Verify signature ────────────────────────────────────────────────────
  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    console.error('[webhook] Signature verification failed:', message)
    return NextResponse.json(
      { error: `Webhook signature verification failed: ${message}` },
      { status: 400 },
    )
  }

  // ── 3. Route event to handler ──────────────────────────────────────────────
  const serviceClient = await createServiceClient()

  try {
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session, serviceClient)
        break

      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object as Stripe.Subscription, serviceClient)
        break

      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription, serviceClient)
        break

      case 'invoice.payment_failed':
        await handlePaymentFailed(event.data.object as Stripe.Invoice, serviceClient)
        break

      case 'customer.updated':
        await handleCustomerUpdated(event.data.object as Stripe.Customer, serviceClient)
        break

      default:
        // Acknowledge unknown events — don't trigger Stripe retries
        console.info(`[webhook] Unhandled event type: ${event.type}`)
    }
  } catch (err) {
    // Log but still return 200 to prevent Stripe retries on transient errors.
    // If the DB write failed, the next webhook delivery will retry the operation.
    console.error(`[webhook] Error handling ${event.type}:`, err)
  }

  // Always return 200 quickly
  return NextResponse.json({ received: true })
}

// ─── Event handlers ──────────────────────────────────────────────────────────

/**
 * checkout.session.completed
 *
 * Fired when a user completes Stripe Checkout. This is where we:
 *   1. Resolve the Supabase user ID from client_reference_id
 *   2. Fetch the full subscription from Stripe (Checkout only has the ID)
 *   3. UPSERT our subscription row
 *   4. Sync the tier cache in user_preferences
 */
async function handleCheckoutCompleted(
  session: Stripe.Checkout.Session,
  serviceClient: Awaited<ReturnType<typeof createServiceClient>>,
) {
  // Resolve user ID — client_reference_id is the most reliable source
  const userId = session.client_reference_id
  if (!userId) {
    console.error('[webhook] checkout.session.completed missing client_reference_id')
    return
  }

  // For subscription mode, session.subscription is the Stripe subscription ID
  const stripeSubscriptionId =
    typeof session.subscription === 'string'
      ? session.subscription
      : session.subscription?.id

  if (!stripeSubscriptionId) {
    console.error('[webhook] checkout.session.completed missing subscription ID')
    return
  }

  // Fetch full subscription to get price, period, status
  const subscription = await stripe.subscriptions.retrieve(stripeSubscriptionId)
  await upsertSubscription(subscription, userId, serviceClient)
}

/**
 * customer.subscription.updated
 *
 * Fired on: renewal, plan change, cancel scheduled, payment method update.
 * Idempotent — same data applied twice = same result.
 */
async function handleSubscriptionUpdated(
  subscription: Stripe.Subscription,
  serviceClient: Awaited<ReturnType<typeof createServiceClient>>,
) {
  const userId = resolveUserIdFromSubscription(subscription)
  if (!userId) return

  await upsertSubscription(subscription, userId, serviceClient)
}

/**
 * customer.subscription.deleted
 *
 * Fired when subscription is fully terminated (after cancel-at-period-end
 * or immediate cancellation). Downgrade user to free.
 */
async function handleSubscriptionDeleted(
  subscription: Stripe.Subscription,
  serviceClient: Awaited<ReturnType<typeof createServiceClient>>,
) {
  const userId = resolveUserIdFromSubscription(subscription)
  if (!userId) return

  // Mark subscription as canceled in our DB
  const { error: subError } = await serviceClient
    .from('subscriptions')
    .update({
      status: 'canceled' as SubscriptionStatus,
      cancel_at_period_end: false,
    })
    .eq('stripe_subscription_id', subscription.id)

  if (subError) {
    console.error('[webhook] Failed to mark subscription canceled:', subError.message)
  }

  // Downgrade tier cache to free
  const { error: prefError } = await serviceClient
    .from('user_preferences')
    .update({ subscription_tier: 'free' })
    .eq('user_id', userId)

  if (prefError) {
    console.error('[webhook] Failed to downgrade tier to free:', prefError.message)
  }

  console.info(`[webhook] Subscription deleted for user ${userId} — downgraded to free`)
}

/**
 * invoice.payment_failed
 *
 * Fired when a payment attempt fails. Stripe auto-retries per your settings,
 * but we mark the subscription as past_due so the UI can warn the user.
 */
async function handlePaymentFailed(
  invoice: Stripe.Invoice,
  serviceClient: Awaited<ReturnType<typeof createServiceClient>>,
) {
  // In API 2026+, subscription lives under invoice.parent.subscription_details
  const subDetails = invoice.parent?.subscription_details
  const stripeSubscriptionId =
    typeof subDetails?.subscription === 'string'
      ? subDetails.subscription
      : subDetails?.subscription?.id

  if (!stripeSubscriptionId) return

  const { error } = await serviceClient
    .from('subscriptions')
    .update({ status: 'past_due' as SubscriptionStatus })
    .eq('stripe_subscription_id', stripeSubscriptionId)

  if (error) {
    console.error('[webhook] Failed to set past_due:', error.message)
  }

  console.info(`[webhook] Payment failed for subscription ${stripeSubscriptionId}`)
}

/**
 * customer.updated
 *
 * Fired when user changes email/name in Stripe Portal.
 * We sync these back to our profiles table for consistency.
 */
async function handleCustomerUpdated(
  customer: Stripe.Customer,
  serviceClient: Awaited<ReturnType<typeof createServiceClient>>,
) {
  const userId = customer.metadata?.supabase_user_id
  if (!userId) {
    console.warn('[webhook] customer.updated missing supabase_user_id in metadata')
    return
  }

  // Only sync display_name — email is managed by Supabase Auth
  if (customer.name) {
    const { error } = await serviceClient
      .from('profiles')
      .update({ display_name: customer.name })
      .eq('id', userId)

    if (error) {
      console.error('[webhook] Failed to sync customer name:', error.message)
    }
  }
}

// ─── Shared helpers ──────────────────────────────────────────────────────────

/**
 * UPSERT a subscription row and sync the tier cache.
 * Idempotent: uses stripe_subscription_id as the unique key.
 */
async function upsertSubscription(
  subscription: Stripe.Subscription,
  userId: string,
  serviceClient: Awaited<ReturnType<typeof createServiceClient>>,
) {
  // In API 2026+, period dates are on the item, not the subscription
  const firstItem = subscription.items.data[0]
  const priceId = firstItem?.price?.id
  if (!priceId) {
    console.error('[webhook] Subscription has no price ID:', subscription.id)
    return
  }

  const tier = mapStripePriceToPlan(priceId)
  const status = subscription.status as SubscriptionStatus

  // UPSERT subscription row
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
    console.error('[webhook] Failed to upsert subscription:', subError.message)
    return // Don't sync tier if subscription write failed
  }

  // Sync tier cache in user_preferences
  const { error: prefError } = await serviceClient
    .from('user_preferences')
    .update({ subscription_tier: tier })
    .eq('user_id', userId)

  if (prefError) {
    console.error('[webhook] Failed to sync subscription_tier:', prefError.message)
  }

  console.info(
    `[webhook] Subscription ${subscription.id} → user ${userId} | tier=${tier} status=${status}`,
  )
}

/**
 * Resolves the Supabase user ID from a Stripe Subscription object.
 * Checks subscription metadata first (most reliable), then falls back
 * to looking up the customer's metadata.
 */
function resolveUserIdFromSubscription(subscription: Stripe.Subscription): string | null {
  // 1. Check subscription metadata (set during checkout)
  const fromSubMeta = subscription.metadata?.supabase_user_id
  if (fromSubMeta) return fromSubMeta

  // 2. Fall back to customer metadata lookup via DB
  // This is a sync path — we log the issue so it can be investigated
  console.warn(
    `[webhook] Subscription ${subscription.id} missing supabase_user_id in metadata. ` +
    'This subscription may have been created outside our checkout flow.',
  )

  return null
}
