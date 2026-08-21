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
import { getStripePriceId, TEAM_CHECKOUT_ENABLED, type SubscriptionTier, type BillingInterval } from '@/lib/billing/plans'
import { checkRateLimit, getClientIp, rateLimitResponse } from '@/lib/rateLimit'
import { DEFAULT_LOCALE, type Locale } from '@/lib/contracts/types'
import { isValidLocale } from '@/lib/i18n'
import { getSiteUrl } from '@/lib/seo/site'
import { getBillingConfigStatus } from '@/lib/billing/configCheck'

/** Allowlist of valid Stripe price IDs from environment. Rejects arbitrary priceId injection. */
function getConfiguredPriceIds(): string[] {
  return [
    process.env.STRIPE_PRO_MONTHLY_PRICE_ID,
    process.env.STRIPE_PRO_YEARLY_PRICE_ID,
    process.env.STRIPE_TEAM_MONTHLY_PRICE_ID,
  ].filter((id): id is string => Boolean(id))
}

/** Validate tier at runtime — TypeScript types are erased. */
const VALID_PAID_TIERS = new Set<string>(['pro', 'team'])

export const runtime = 'nodejs'

export async function POST(req: NextRequest): Promise<NextResponse> {
  const ip = getClientIp(req.headers)
  const rl = await checkRateLimit(`checkout:${ip}`, { max: 5, windowMs: 60_000, whenUnavailable: 'allow' })
  if (!rl.allowed) {
    return rateLimitResponse(rl, 'Příliš mnoho pokusů o platbu. Zkuste to za chvíli.')
  }

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
  let body: {
    priceId?: string
    tier?: SubscriptionTier
    interval?: BillingInterval
    locale?: string
  }
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

  if (body.tier === 'team' && !TEAM_CHECKOUT_ENABLED) {
    return NextResponse.json(
      { error: 'Tarif Tým zatím není k dispozici — týmové funkce připravujeme. Zvolte Pro.', code: 'TEAM_NOT_AVAILABLE' },
      { status: 403 },
    )
  }

  // Validate server billing config before calling Stripe
  const configStatus = getBillingConfigStatus()
  if (configStatus.checks.secretKey !== 'ok' || configStatus.checks.priceIds === 0) {
    console.error('[checkout] Billing config invalid:', configStatus.issues)
    return NextResponse.json(
      { error: configStatus.issues[0] ?? 'Platební systém není nakonfigurován.', issues: configStatus.issues },
      { status: 503 },
    )
  }

  const configuredPrices = getConfiguredPriceIds()
  if (configuredPrices.length === 0) {
    console.error('[checkout] No STRIPE_*_PRICE_ID env vars configured')
    const { issues } = getBillingConfigStatus()
    return NextResponse.json(
      { error: issues[0] ?? 'Platební systém není nakonfigurován. Kontaktujte podporu.', issues },
      { status: 503 },
    )
  }

  const locale: Locale =
    body.locale && isValidLocale(body.locale) ? body.locale : DEFAULT_LOCALE

  // Team tier is monthly-only — ignore yearly interval for checkout
  const interval: BillingInterval =
    body.tier === 'team' ? 'monthly' : (body.interval ?? 'monthly')

  // Accept either a direct priceId or a tier + interval → resolve to priceId
  const priceId = body.priceId
    ?? (body.tier ? getStripePriceId(body.tier, interval) : null)

  if (!priceId) {
    return NextResponse.json(
      { error: 'Chybí priceId nebo tier v požadavku.' },
      { status: 400 },
    )
  }

  // Reject arbitrary priceIds — only allow our known product prices
  if (!configuredPrices.includes(priceId)) {
    return NextResponse.json(
      { error: 'Neplatný cenový plán.' },
      { status: 400 },
    )
  }

  // ── 3. Get or create Stripe customer ───────────────────────────────────────
  const serviceClient = await createServiceClient()

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
  const appUrl = getSiteUrl()

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

      // Redirect URLs (locale-aware)
      success_url: `${appUrl}/${locale}/dashboard?billing=success`,
      cancel_url: `${appUrl}/${locale}/dashboard?billing=canceled`,

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
    const message = err instanceof Error ? err.message : ''
    const hint = message.includes('pk_') || message.includes('Secret key')
      ? 'Stripe Secret key (sk_live_...) je v env nastavený špatně — použijte Secret key, ne Publishable key (pk_).'
      : 'Nepodařilo se vytvořit platební relaci. Zkuste to znovu.'
    return NextResponse.json({ error: hint }, { status: 502 })
  }
}
