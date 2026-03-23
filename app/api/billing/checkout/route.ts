/**
 * POST /api/billing/checkout
 *
 * Creates a Stripe Checkout Session for the authenticated user.
 * Redirects to Stripe-hosted payment page — we never touch card data.
 *
 * Auth: Required (uses getUser() for server-validated identity)
 * Input: { priceId: string } or { tier: string, interval?: 'monthly' | 'yearly' }
 * Output: { url: string } — Stripe Checkout redirect URL
 *
 * Security notes:
 *   - getUser() validates JWT with Supabase server (not just cookie read)
 *   - Stripe Customer created lazily via getOrCreateStripeCustomerForUser()
 *   - supabase_user_id stored in 3 places: Customer metadata,
 *     client_reference_id, and subscription_data.metadata
 *   - service client used only for writing stripe_customer_id to profiles
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { stripe } from '@/lib/billing/stripe'
import { getOrCreateStripeCustomerForUser } from '@/lib/billing/helpers'
import { getStripePriceId, type SubscriptionTier, type BillingInterval } from '@/lib/billing/plans'

/** Allowlist of valid Stripe price IDs from environment. Rejects arbitrary priceId injection. */
function isAllowedPriceId(id: string): boolean {
  const allowed = new Set([
    process.env.STRIPE_PRO_MONTHLY_PRICE_ID,
    process.env.STRIPE_PRO_YEARLY_PRICE_ID,
    process.env.STRIPE_TEAM_MONTHLY_PRICE_ID,
  ].filter(Boolean))
  return allowed.has(id)
}

/** Validate tier at runtime — TypeScript types are erased. */
const VALID_PAID_TIERS = new Set<string>(['pro', 'team'])

export const runtime = 'nodejs'

export async function POST(req: NextRequest): Promise<NextResponse> {
  // ── 1. Authenticate ────────────────────────────────────────────────────────
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user || !user.email) {
    return NextResponse.json(
      { error: 'Pro nákup předplatného se musíte přihlásit.' },
      { status: 401 },
    )
  }

  // ── 2. Parse & validate request ────────────────────────────────────────────
  let body: { priceId?: string; tier?: SubscriptionTier; interval?: BillingInterval }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json(
      { error: 'Neplatný JSON v těle požadavku.' },
      { status: 400 },
    )
  }

  // Validate tier at runtime (TS types are erased)
  if (body.tier && !VALID_PAID_TIERS.has(body.tier)) {
    return NextResponse.json(
      { error: 'Neplatný tarif. Povolené hodnoty: pro, team.' },
      { status: 400 },
    )
  }

  // Accept either a direct priceId or a tier + interval → resolve to priceId
  const priceId = body.priceId
    ?? (body.tier ? getStripePriceId(body.tier, body.interval ?? 'monthly') : null)

  if (!priceId) {
    return NextResponse.json(
      { error: 'Chybí priceId nebo tier v požadavku.' },
      { status: 400 },
    )
  }

  // Reject arbitrary priceIds — only allow our known product prices
  if (!isAllowedPriceId(priceId)) {
    return NextResponse.json(
      { error: 'Neplatný cenový plán.' },
      { status: 400 },
    )
  }

  // ── 3. Get or create Stripe customer ───────────────────────────────────────
  const serviceClient = await createServiceClient()

  // Fetch display_name for Stripe customer creation
  const { data: profile } = await serviceClient
    .from('profiles')
    .select('display_name')
    .eq('id', user.id)
    .single()

  let stripeCustomerId: string
  try {
    stripeCustomerId = await getOrCreateStripeCustomerForUser({
      userId: user.id,
      email: user.email,
      displayName: profile?.display_name ?? null,
      serviceClient,
    })
  } catch (err) {
    console.error('[checkout] Failed to get/create Stripe customer:', err)
    return NextResponse.json(
      { error: 'Nepodařilo se vytvořit fakturační účet. Zkuste to znovu.' },
      { status: 502 },
    )
  }

  // ── 4. Create Checkout Session ─────────────────────────────────────────────
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

  try {
    const session = await stripe.checkout.sessions.create({
      customer: stripeCustomerId,
      mode: 'subscription',
      line_items: [{ price: priceId, quantity: 1 }],

      // client_reference_id: available in checkout.session.completed
      // without needing to fetch the customer object
      client_reference_id: user.id,

      // Persist supabase_user_id on the subscription itself
      // so every future webhook event carries it in metadata
      subscription_data: {
        metadata: {
          supabase_user_id: user.id,
        },
      },

      // Redirect URLs
      success_url: `${appUrl}/dashboard?billing=success`,
      cancel_url: `${appUrl}/dashboard?billing=canceled`,

      // Prefill email (already known from auth)
      customer_email: undefined, // Not needed — customer already set

      // Allow promotion codes if configured in Stripe
      allow_promotion_codes: true,
    })

    if (!session.url) {
      throw new Error('Stripe returned session without URL')
    }

    return NextResponse.json({ url: session.url })
  } catch (err) {
    console.error('[checkout] Stripe session creation failed:', err)
    return NextResponse.json(
      { error: 'Nepodařilo se vytvořit platební relaci. Zkuste to znovu.' },
      { status: 502 },
    )
  }
}
