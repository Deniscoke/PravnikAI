/**
 * Unit tests for Stripe webhook idempotency helpers.
 *
 *  - claimStripeWebhookEvent: 'new' (insert ok), 'duplicate' (23505), 'unavailable' (other error)
 *  - releaseStripeWebhookEventClaim: deletes the claimed row by event_id (BR-2 reprocessing path)
 */

import { describe, it, expect, vi } from 'vitest'
import type { SupabaseClient } from '@supabase/supabase-js'
import { claimStripeWebhookEvent, releaseStripeWebhookEventClaim } from '../webhookIdempotency'

/** Stub: serviceClient.schema('private').from(table).insert(row) → { error } */
function insertStub(error: unknown): SupabaseClient {
  const from = { insert: () => Promise.resolve({ error }) }
  const schema = { from: () => from }
  return { schema: () => schema } as unknown as SupabaseClient
}

describe('claimStripeWebhookEvent', () => {
  it('returns "new" when the insert succeeds', async () => {
    const r = await claimStripeWebhookEvent(insertStub(null), 'evt_1', 'customer.subscription.updated')
    expect(r).toBe('new')
  })

  it('returns "duplicate" on unique violation (23505)', async () => {
    const r = await claimStripeWebhookEvent(insertStub({ code: '23505' }), 'evt_1', 'customer.subscription.updated')
    expect(r).toBe('duplicate')
  })

  it('returns "unavailable" on any other error (e.g. table missing)', async () => {
    const r = await claimStripeWebhookEvent(
      insertStub({ code: '42P01', message: 'relation does not exist' }),
      'evt_1',
      'customer.subscription.updated',
    )
    expect(r).toBe('unavailable')
  })
})

describe('releaseStripeWebhookEventClaim', () => {
  it('deletes the claimed row filtered by event_id', async () => {
    const eq = vi.fn().mockResolvedValue({ error: null })
    const del = { eq }
    const from = { delete: () => del }
    const schema = { from: vi.fn(() => from) }
    const client = { schema: vi.fn(() => schema) } as unknown as SupabaseClient

    await releaseStripeWebhookEventClaim(client, 'evt_42')

    expect(schema.from).toHaveBeenCalledWith('stripe_webhook_events')
    expect(eq).toHaveBeenCalledWith('event_id', 'evt_42')
  })

  it('does not throw when the delete returns an error (logged, best-effort)', async () => {
    const eq = vi.fn().mockResolvedValue({ error: { message: 'db down' } })
    const from = { delete: () => ({ eq }) }
    const client = { schema: () => ({ from: () => from }) } as unknown as SupabaseClient

    await expect(releaseStripeWebhookEventClaim(client, 'evt_1')).resolves.toBeUndefined()
  })
})
