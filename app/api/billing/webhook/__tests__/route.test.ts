/**
 * BR-2: Stripe webhook idempotency claim-release behaviour.
 *
 * Variant (A): the handler always returns 200; on a handler error the claim is
 * released ONLY when it was claimed as 'new', so a future redelivery of the same
 * event.id can reprocess. Never released on duplicate / unavailable / unsupported.
 *
 * To force a deterministic handler error we use a checkout.session.completed event
 * whose handler reaches stripe.subscriptions.retrieve (mocked to reject) → the
 * switch body throws → the outer catch fires. This does not depend on the DB layer.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { NextRequest } from 'next/server'

vi.mock('@/lib/billing/stripe', () => ({
  stripe: {
    webhooks: { constructEvent: vi.fn() },
    subscriptions: { retrieve: vi.fn() },
  },
}))
vi.mock('@/lib/supabase/server', () => ({
  createServiceClient: vi.fn(),
}))
vi.mock('@/lib/billing/webhookIdempotency', () => ({
  claimStripeWebhookEvent: vi.fn(),
  releaseStripeWebhookEventClaim: vi.fn(),
}))
vi.mock('@/lib/rateLimit', () => ({
  checkRateLimit: vi.fn().mockResolvedValue({ allowed: true }),
  getClientIp: vi.fn().mockReturnValue('127.0.0.1'),
  rateLimitResponse: vi.fn(),
}))

import { POST } from '@/app/api/billing/webhook/route'
import { stripe } from '@/lib/billing/stripe'
import { createServiceClient } from '@/lib/supabase/server'
import { claimStripeWebhookEvent, releaseStripeWebhookEventClaim } from '@/lib/billing/webhookIdempotency'

/** A checkout.session.completed object whose handler reaches stripe.subscriptions.retrieve. */
const THROWING_EVENT = { client_reference_id: 'user-123', subscription: 'sub_123' }

function makeReq(): NextRequest {
  return new NextRequest('http://localhost/api/billing/webhook', {
    method: 'POST',
    headers: { 'stripe-signature': 'sig_test' },
    body: '{}',
  })
}

function setEvent(type: string, object: Record<string, unknown> = {}, id = 'evt_1') {
  vi.mocked(stripe.webhooks.constructEvent).mockReturnValue({ id, type, data: { object } } as never)
}

beforeEach(() => {
  vi.clearAllMocks()
  vi.stubEnv('STRIPE_WEBHOOK_SECRET', 'whsec_test')
  vi.mocked(createServiceClient).mockResolvedValue({} as never)
  vi.mocked(stripe.subscriptions.retrieve).mockRejectedValue(new Error('stripe unavailable'))
})

afterEach(() => vi.unstubAllEnvs())

describe('POST /api/billing/webhook — BR-2 claim release', () => {
  it('releases the claim when claimed as "new" and the handler throws (still 200)', async () => {
    setEvent('checkout.session.completed', THROWING_EVENT)
    vi.mocked(claimStripeWebhookEvent).mockResolvedValue('new')

    const res = await POST(makeReq())

    expect(res.status).toBe(200)
    expect(releaseStripeWebhookEventClaim).toHaveBeenCalledTimes(1)
    expect(releaseStripeWebhookEventClaim).toHaveBeenCalledWith(expect.anything(), 'evt_1')
  })

  it('does NOT release on a duplicate event', async () => {
    setEvent('checkout.session.completed', THROWING_EVENT)
    vi.mocked(claimStripeWebhookEvent).mockResolvedValue('duplicate')

    const res = await POST(makeReq())

    expect(res.status).toBe(200)
    expect((await res.json()).duplicate).toBe(true)
    expect(releaseStripeWebhookEventClaim).not.toHaveBeenCalled()
  })

  it('does NOT release when idempotency was "unavailable" even if the handler throws', async () => {
    setEvent('checkout.session.completed', THROWING_EVENT)
    vi.mocked(claimStripeWebhookEvent).mockResolvedValue('unavailable')

    const res = await POST(makeReq())

    expect(res.status).toBe(200)
    expect(releaseStripeWebhookEventClaim).not.toHaveBeenCalled()
  })

  it('does NOT release for an unsupported event type (claimed "new", no throw)', async () => {
    setEvent('payment_intent.created')
    vi.mocked(claimStripeWebhookEvent).mockResolvedValue('new')

    const res = await POST(makeReq())

    expect(res.status).toBe(200)
    expect(releaseStripeWebhookEventClaim).not.toHaveBeenCalled()
  })
})
