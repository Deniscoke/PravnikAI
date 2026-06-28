/**
 * Stripe webhook idempotency — dedupe by event.id in private.stripe_webhook_events.
 * Requires migration 004_production_hardening.sql applied in Supabase.
 */

import type { SupabaseClient } from '@supabase/supabase-js'

export async function claimStripeWebhookEvent(
  serviceClient: SupabaseClient,
  eventId: string,
  eventType: string,
): Promise<'new' | 'duplicate' | 'unavailable'> {
  const { error } = await serviceClient
    .schema('private')
    .from('stripe_webhook_events')
    .insert({ event_id: eventId, event_type: eventType })

  if (!error) return 'new'

  // Postgres unique violation
  if (error.code === '23505') return 'duplicate'

  // Table missing or schema not exposed — log and process anyway (best-effort)
  console.error('[webhook] Idempotency insert failed:', error.message)
  return 'unavailable'
}

/**
 * Release a previously-claimed event so a future Stripe redelivery of the SAME
 * event.id can reprocess it. Call this ONLY when the event was claimed as 'new'
 * and the handler subsequently threw — never on 'duplicate'/'unavailable'.
 */
export async function releaseStripeWebhookEventClaim(
  serviceClient: SupabaseClient,
  eventId: string,
): Promise<void> {
  const { error } = await serviceClient
    .schema('private')
    .from('stripe_webhook_events')
    .delete()
    .eq('event_id', eventId)

  if (error) {
    console.error('[webhook] Failed to release claimed event for reprocessing:', error.message)
  }
}
