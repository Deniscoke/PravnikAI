-- ============================================================================
-- PrávníkAI — Accounts & History Schema
-- Jurisdiction: Czech Republic (CZ)
-- ============================================================================
--
-- DESIGN DECISIONS:
--
-- 1. IDENTITY: Supabase auth.users.id (UUID) is the sole identity key.
--    Email is profile data, NOT an identity anchor. Users can change emails;
--    the UUID is immutable.
--
-- 2. GDPR: All user-facing tables live in the `public` schema (PostgREST-accessible)
--    with strict RLS. Internal-only tables live in `private` schema (not exposed
--    to PostgREST). No raw IP addresses stored — only hashed.
--
-- 3. SOFT DELETE: History tables use nullable deleted_at for soft-delete.
--    RLS policies exclude soft-deleted rows by default. Future retention
--    policy can purge soft-deleted rows after N days.
--
-- 4. DATA SEPARATION: Heavy content (contract_text, review_result) is stored
--    inline for simplicity but could be moved to a separate table or storage
--    if row sizes become a concern.
--
-- 5. BILLING READY: user_preferences.subscription_tier prepares for Stripe
--    integration without coupling to a billing provider.
--
-- 6. TEAM READY: All tables use user_id FK. Future workspace/team feature
--    can add a team_id column + team-based RLS policies without restructuring.
--
-- EU DEPLOYMENT: Configure your Supabase project in an EU region (e.g., eu-central-1).
-- This migration is region-agnostic — the region is set at project creation time.
-- ============================================================================

-- ── Private schema for internal-only tables ──────────────────────────────────
-- PostgREST only exposes `public` by default. Tables in `private` are
-- accessible only via server-side functions or the service role key.
CREATE SCHEMA IF NOT EXISTS private;

-- ============================================================================
-- 1. PROFILES
-- ============================================================================
-- Extends auth.users with app-specific data. Auto-created via trigger.
-- We do NOT duplicate email here — Supabase auth.users already stores it.

CREATE TABLE public.profiles (
  id             UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name   TEXT,
  avatar_url     TEXT,

  -- Onboarding: user must acknowledge legal disclaimers before using the app.
  -- This is a legal requirement for an AI-assisted legal tool.
  onboarding_completed BOOLEAN NOT NULL DEFAULT FALSE,
  terms_accepted_at    TIMESTAMPTZ,    -- When they accepted Terms of Service
  privacy_accepted_at  TIMESTAMPTZ,    -- When they accepted Privacy Policy

  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.profiles IS 'User profile — extends auth.users with app-specific data. One row per user.';
COMMENT ON COLUMN public.profiles.onboarding_completed IS 'Must be TRUE before user can access dashboard. Set after legal acknowledgment.';

-- RLS: Users can only read and update their own profile.
-- Insert is handled by the trigger (SECURITY DEFINER).
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "profiles_select_own"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "profiles_update_own"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- ============================================================================
-- 2. CONTRACT GENERATIONS HISTORY
-- ============================================================================

CREATE TABLE public.contract_generations_history (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- What was generated
  schema_id         TEXT NOT NULL,         -- e.g., "kupni-smlouva-v1"
  title             TEXT NOT NULL,         -- Derived label for display
  mode              TEXT NOT NULL,         -- 'complete' | 'draft' | 'review-needed'
  contract_text     TEXT,                  -- The generated contract (heavy content)
  form_data_snapshot JSONB,               -- Form data used for generation (for re-editing)
  warnings          JSONB DEFAULT '[]'::JSONB,
  legal_basis       TEXT[] DEFAULT '{}',

  -- Status
  status            TEXT NOT NULL DEFAULT 'completed',  -- 'completed' | 'failed'

  -- Timestamps
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at        TIMESTAMPTZ           -- Soft delete: NULL = active, set = deleted
);

COMMENT ON TABLE public.contract_generations_history IS 'History of AI-generated contracts. Soft-deletable.';
COMMENT ON COLUMN public.contract_generations_history.form_data_snapshot IS 'Snapshot of form data at generation time. Enables re-editing.';
COMMENT ON COLUMN public.contract_generations_history.deleted_at IS 'Soft delete. RLS excludes non-null deleted_at from SELECT.';

-- Index for dashboard queries: user's active history, newest first
CREATE INDEX idx_generations_user_active
  ON public.contract_generations_history (user_id, created_at DESC)
  WHERE deleted_at IS NULL;

ALTER TABLE public.contract_generations_history ENABLE ROW LEVEL SECURITY;

-- SELECT: user can see own active (non-deleted) rows
CREATE POLICY "generations_select_own"
  ON public.contract_generations_history FOR SELECT
  USING (auth.uid() = user_id AND deleted_at IS NULL);

-- INSERT: user can only insert rows with their own user_id
CREATE POLICY "generations_insert_own"
  ON public.contract_generations_history FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- UPDATE: user can update own rows (for soft-delete via deleted_at)
CREATE POLICY "generations_update_own"
  ON public.contract_generations_history FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ============================================================================
-- 3. CONTRACT REVIEWS HISTORY
-- ============================================================================

CREATE TABLE public.contract_reviews_history (
  id                     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- What was reviewed
  detected_contract_type TEXT,                    -- AI-detected type, e.g. "Kupní smlouva"
  title                  TEXT NOT NULL,           -- Derived label for display
  overall_risk           TEXT NOT NULL,           -- 'low' | 'medium' | 'high'
  summary                TEXT NOT NULL,           -- 2-4 sentence summary
  review_result          JSONB NOT NULL,          -- Full ReviewContractResponse (heavy content)
  input_text_preview     TEXT,                    -- First ~200 chars for dashboard display

  -- Status
  status                 TEXT NOT NULL DEFAULT 'completed',

  -- Timestamps
  created_at             TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at             TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at             TIMESTAMPTZ
);

COMMENT ON TABLE public.contract_reviews_history IS 'History of AI contract reviews. Soft-deletable.';
COMMENT ON COLUMN public.contract_reviews_history.review_result IS 'Full ReviewContractResponse as JSONB. Heavy content — query selectively.';

CREATE INDEX idx_reviews_user_active
  ON public.contract_reviews_history (user_id, created_at DESC)
  WHERE deleted_at IS NULL;

ALTER TABLE public.contract_reviews_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "reviews_select_own"
  ON public.contract_reviews_history FOR SELECT
  USING (auth.uid() = user_id AND deleted_at IS NULL);

CREATE POLICY "reviews_insert_own"
  ON public.contract_reviews_history FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "reviews_update_own"
  ON public.contract_reviews_history FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ============================================================================
-- 4. USER PREFERENCES
-- ============================================================================

CREATE TABLE public.user_preferences (
  user_id              UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,

  preferred_language   TEXT NOT NULL DEFAULT 'cs',
  email_notifications  BOOLEAN NOT NULL DEFAULT FALSE,

  -- GDPR: marketing consent is SEPARATE from terms/privacy acceptance.
  -- Must be opt-in (not pre-checked), with its own timestamp.
  marketing_consent    BOOLEAN NOT NULL DEFAULT FALSE,
  marketing_consent_at TIMESTAMPTZ,       -- When consent was given/withdrawn

  -- Billing: prepared for Stripe integration
  subscription_tier    TEXT NOT NULL DEFAULT 'free',  -- 'free' | 'pro' | 'team'

  created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.user_preferences IS 'Per-user settings. One row per user, auto-created by trigger.';
COMMENT ON COLUMN public.user_preferences.marketing_consent IS 'GDPR: must be opt-in, separate from terms acceptance.';
COMMENT ON COLUMN public.user_preferences.subscription_tier IS 'Prepared for Stripe billing. Default free.';

ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "preferences_select_own"
  ON public.user_preferences FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "preferences_update_own"
  ON public.user_preferences FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ============================================================================
-- 5. AUDIT EVENTS (Private Schema — Not Exposed to PostgREST)
-- ============================================================================
-- Minimal, privacy-aware audit log. Stores hashed IPs, not raw.
-- Accessible only via service role or database functions.

CREATE TABLE private.audit_events (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID REFERENCES auth.users(id) ON DELETE SET NULL,  -- SET NULL: keep audit trail even if user is deleted
  event_type  TEXT NOT NULL,        -- e.g., 'account.created', 'history.deleted', 'terms.accepted'
  metadata    JSONB DEFAULT '{}'::JSONB,
  ip_hash     TEXT,                 -- SHA-256 hash of IP, NOT raw IP (GDPR)
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE private.audit_events IS 'Privacy-aware audit log. In private schema — not accessible via PostgREST API.';
COMMENT ON COLUMN private.audit_events.ip_hash IS 'SHA-256 of client IP. Never store raw IPs.';
COMMENT ON COLUMN private.audit_events.user_id IS 'SET NULL on user deletion — preserves audit trail without PII.';

CREATE INDEX idx_audit_user ON private.audit_events (user_id, created_at DESC);
CREATE INDEX idx_audit_type ON private.audit_events (event_type, created_at DESC);

-- ============================================================================
-- 6. AUTO-CREATE PROFILE + PREFERENCES ON SIGN-UP
-- ============================================================================
-- SECURITY DEFINER: runs with the function creator's privileges,
-- not the calling user's. This is necessary because the user doesn't
-- have INSERT on profiles (only the trigger does).

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Create profile from Google OAuth metadata
  INSERT INTO public.profiles (id, display_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', ''),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', NEW.raw_user_meta_data->>'picture', '')
  );

  -- Create default preferences
  INSERT INTO public.user_preferences (user_id)
  VALUES (NEW.id);

  -- Audit log
  INSERT INTO private.audit_events (user_id, event_type, metadata)
  VALUES (NEW.id, 'account.created', jsonb_build_object(
    'provider', NEW.raw_app_meta_data->>'provider',
    'created_at', NOW()
  ));

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger: fires after every new auth.users row
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ============================================================================
-- 7. UPDATED_AT AUTO-REFRESH
-- ============================================================================

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER generations_updated_at
  BEFORE UPDATE ON public.contract_generations_history
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER reviews_updated_at
  BEFORE UPDATE ON public.contract_reviews_history
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER preferences_updated_at
  BEFORE UPDATE ON public.user_preferences
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============================================================================
-- FUTURE: Data Retention & Account Deletion
-- ============================================================================
-- TODO: Add a scheduled function to purge soft-deleted rows after 30 days:
--   DELETE FROM public.contract_generations_history
--   WHERE deleted_at IS NOT NULL AND deleted_at < NOW() - INTERVAL '30 days';
--
-- TODO: Add account deletion function that:
--   1. Deletes all user data from public tables (CASCADE handles this)
--   2. Keeps anonymized audit trail (user_id SET NULL)
--   3. Calls supabase.auth.admin.deleteUser(userId)
--   4. Returns a GDPR data export before deletion
--
-- TODO: Add data export function that:
--   1. Collects all user data from profiles, history, preferences
--   2. Returns as JSON for GDPR Article 15 (right of access)
-- ============================================================================
