/**
 * POST /api/billing/sync
 *
 * Reconciles the signed-in user's subscription state with Stripe.
 *
 * Webhooks can be missed — a wrong endpoint URL, a rotated signing secret or a
 * few minutes of downtime are enough for a paying customer to stay on the free
 * tier. This route lets the app repair itself: the dashboard calls it after a
 * successful checkout, and the account page exposes it as a manual action.
 *
 * Stripe stays the source of truth; nothing here grants a tier on its own.
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { checkRateLimit, getClientIp, rateLimitResponse } from '@/lib/rateLimit'
import { syncUserSubscriptionFromStripe } from '@/lib/billing/subscriptionSync'

export const runtime = 'nodejs'

export async function POST(req: NextRequest): Promise<NextResponse> {
  const ip = getClientIp(req.headers)
  const rl = await checkRateLimit(`billing-sync:${ip}`, {
    max: 10,
    windowMs: 60_000,
    whenUnavailable: 'allow',
  })
  if (!rl.allowed) {
    return rateLimitResponse(rl, 'Příliš mnoho požadavků. Zkuste to za chvíli.')
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json(
      { error: 'Pro ověření předplatného se musíte přihlásit.' },
      { status: 401 },
    )
  }

  try {
    const serviceClient = await createServiceClient()
    const result = await syncUserSubscriptionFromStripe(serviceClient, user.id, user.email)

    return NextResponse.json({
      tier: result.tier,
      status: result.status ?? null,
      synced: result.synced,
    })
  } catch (err) {
    console.error('[billing-sync] Failed to reconcile subscription:', err)
    return NextResponse.json(
      { error: 'Stav předplatného se nepodařilo ověřit. Zkuste to prosím znovu.' },
      { status: 502 },
    )
  }
}
