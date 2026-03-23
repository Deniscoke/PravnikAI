/**
 * POST /api/billing/portal
 *
 * Creates a Stripe Customer Portal session for the authenticated user.
 * The portal lets users manage subscriptions, update payment methods,
 * view invoices, and cancel — all hosted by Stripe (PCI-safe).
 *
 * Auth: Required
 * Input: {} (empty body or no body)
 * Output: { url: string } — Stripe Portal redirect URL
 *
 * Prerequisites:
 *   - User must have a stripe_customer_id (must have gone through checkout at least once)
 *   - Stripe Customer Portal must be configured in Stripe Dashboard:
 *     dashboard.stripe.com/settings/billing/portal
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'

import { stripe } from '@/lib/billing/stripe'

export const runtime = 'nodejs'

export async function POST(req: NextRequest): Promise<NextResponse> {
  // ── 1. Authenticate ────────────────────────────────────────────────────────
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json(
      { error: 'Pro správu předplatného se musíte přihlásit.' },
      { status: 401 },
    )
  }

  // ── 2. Lookup Stripe customer ID ───────────────────────────────────────────
  // Use service client to read stripe_customer_id (profiles RLS may not expose it)
  const serviceClient = await createServiceClient()
  const { data: profile } = await serviceClient
    .from('profiles')
    .select('stripe_customer_id')
    .eq('id', user.id)
    .single()

  if (!profile?.stripe_customer_id) {
    return NextResponse.json(
      { error: 'Nemáte aktivní fakturační účet. Nejprve si zakupte předplatné.' },
      { status: 400 },
    )
  }

  // ── 3. Create Portal session ───────────────────────────────────────────────
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

  try {
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: profile.stripe_customer_id,
      return_url: `${appUrl}/dashboard`,
    })

    return NextResponse.json({ url: portalSession.url })
  } catch (err) {
    console.error('[portal] Stripe portal session creation failed:', err)
    return NextResponse.json(
      { error: 'Nepodařilo se otevřít fakturační portál. Zkuste to znovu.' },
      { status: 502 },
    )
  }
}
