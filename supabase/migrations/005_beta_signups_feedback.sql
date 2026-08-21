-- ============================================================================
-- Migration 005: Beta waitlist + product feedback
--
--   Both tables are written only by the server (service role). RLS is enabled
--   with no policies, so anonymous and authenticated clients cannot read or
--   write them; the Supabase dashboard uses the service role and shows them
--   normally in the Table Editor.
-- ============================================================================

-- ── Beta waitlist ───────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.beta_signups (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email       TEXT NOT NULL,
  -- Where the address came from: 'homepage', 'kontrola-smluv', 'vzory', …
  source      TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- One row per address; a repeat submission updates the existing row instead
-- of creating a duplicate.
CREATE UNIQUE INDEX IF NOT EXISTS idx_beta_signups_email
  ON public.beta_signups (lower(email));

CREATE INDEX IF NOT EXISTS idx_beta_signups_created
  ON public.beta_signups (created_at DESC);

COMMENT ON TABLE public.beta_signups IS
  'Beta waitlist addresses collected before paid launch. Server-write only.';

ALTER TABLE public.beta_signups ENABLE ROW LEVEL SECURITY;
-- No policies on purpose: only the service role may touch this table.

-- ── Product feedback ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.feedback (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message     TEXT NOT NULL,
  -- Optional: the user may leave an address for a reply
  email       TEXT,
  -- Page the feedback was sent from, for context
  page_url    TEXT,
  -- SET NULL keeps the feedback if the account is later deleted
  user_id     UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_feedback_created
  ON public.feedback (created_at DESC);

COMMENT ON TABLE public.feedback IS
  'In-app product feedback during beta. Server-write only.';

ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;
-- No policies on purpose: only the service role may touch this table.
