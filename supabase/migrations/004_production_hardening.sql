-- ============================================================================
-- Migration 004: Production hardening
--   - Stripe webhook idempotency (private schema, service-role only)
-- ============================================================================

CREATE TABLE IF NOT EXISTS private.stripe_webhook_events (
  event_id     TEXT PRIMARY KEY,
  event_type   TEXT NOT NULL,
  processed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE private.stripe_webhook_events IS
  'Processed Stripe webhook event IDs — prevents duplicate side effects on retries.';

CREATE INDEX IF NOT EXISTS idx_stripe_webhook_events_processed
  ON private.stripe_webhook_events (processed_at DESC);
