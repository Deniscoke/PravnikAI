-- ============================================================================
-- Migration 002: Billing Infrastructure
-- ============================================================================
-- Adds Stripe billing support to PrávníkAI.
--
-- Design decisions:
--   1. stripe_customer_id is NULLABLE — created lazily at first checkout,
--      not on signup. Avoids wasting Stripe API calls for free users.
--   2. No usage_tracking table — existing history tables already record
--      every billable action. COUNT queries with partial indexes are fast.
--   3. No DB trigger for subscription rows — rows are created by webhook
--      handler only when a real Stripe subscription exists.
--   4. subscriptions table is webhook-only writable — RLS allows user
--      SELECT but no INSERT/UPDATE/DELETE for authenticated role.
--   5. user_preferences.subscription_tier remains as a denormalized cache
--      for fast UI reads. Webhook handler updates BOTH tables atomically.
-- ============================================================================

-- ── 1. Add stripe_customer_id to profiles ──────────────────────────────────

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT UNIQUE;

COMMENT ON COLUMN public.profiles.stripe_customer_id
  IS 'Stripe Customer ID. NULL until user initiates first billing action. Set by checkout endpoint.';

-- ── 2. Subscriptions table ─────────────────────────────────────────────────
-- Source of truth for Stripe subscription state (webhook-synced).
-- One active subscription per user enforced by unique partial index.

CREATE TABLE IF NOT EXISTS public.subscriptions (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id               UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  stripe_subscription_id TEXT UNIQUE NOT NULL,
  stripe_price_id       TEXT NOT NULL,
  status                TEXT NOT NULL DEFAULT 'active'
    CHECK (status IN (
      'active', 'canceled', 'past_due', 'incomplete',
      'incomplete_expired', 'trialing', 'paused', 'unpaid'
    )),
  current_period_start  TIMESTAMPTZ,
  current_period_end    TIMESTAMPTZ,
  cancel_at_period_end  BOOLEAN NOT NULL DEFAULT FALSE,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.subscriptions
  IS 'Stripe subscription cache. Written ONLY by webhook handler via service role. Users can SELECT own row.';

-- Enforce: at most one non-terminal subscription per user.
-- Canceled/expired subscriptions are kept as history.
CREATE UNIQUE INDEX IF NOT EXISTS idx_subscriptions_active_per_user
  ON public.subscriptions(user_id)
  WHERE status IN ('active', 'trialing', 'past_due', 'incomplete');

-- Fast lookup by Stripe subscription ID (webhook handler uses this)
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_id
  ON public.subscriptions(stripe_subscription_id);

-- ── 3. RLS for subscriptions ───────────────────────────────────────────────
-- Users can read their own subscription. Only service_role can write.

ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "subscriptions_select_own"
  ON public.subscriptions FOR SELECT
  USING (auth.uid() = user_id);

-- No INSERT/UPDATE/DELETE policies for authenticated role.
-- Webhook handler uses createServiceClient() which bypasses RLS.

-- ── 4. Indexes for usage counting on existing history tables ───────────────
-- These support the COUNT queries in billing guards.
-- Partial index excludes soft-deleted rows → smaller, faster.

CREATE INDEX IF NOT EXISTS idx_gen_history_billing
  ON public.contract_generations_history(user_id, created_at)
  WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_review_history_billing
  ON public.contract_reviews_history(user_id, created_at)
  WHERE deleted_at IS NULL;

-- ── 5. Updated_at trigger for subscriptions ────────────────────────────────

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Only create trigger if it doesn't exist (idempotent)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'trg_subscriptions_updated_at'
  ) THEN
    CREATE TRIGGER trg_subscriptions_updated_at
      BEFORE UPDATE ON public.subscriptions
      FOR EACH ROW
      EXECUTE FUNCTION public.set_updated_at();
  END IF;
END;
$$;
