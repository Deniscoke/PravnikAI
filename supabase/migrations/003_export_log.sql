-- ============================================================================
-- Migration 003: Export Log for Billing
-- ============================================================================
-- Minimal table to count DOCX exports per user for billing enforcement.
--
-- Why a new table instead of extending existing ones:
--   - contract_generations_history tracks LLM generations, not exports
--   - contract_reviews_history tracks AI reviews, not exports
--   - exports are a separate billable action with their own limits
--   - this is the "smallest safe solution" — 3 columns, no JSONB, no text
--
-- Design:
--   - Write happens after successful export (not before)
--   - User client can INSERT own rows (RLS)
--   - COUNT query uses the same partial-index pattern as billing indexes
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.export_log (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.export_log
  IS 'Lightweight export counter for billing. One row per DOCX export.';

-- Index for billing COUNT queries
CREATE INDEX IF NOT EXISTS idx_export_log_billing
  ON public.export_log(user_id, created_at);

-- RLS: users can read and insert their own rows
ALTER TABLE public.export_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "export_log_select_own"
  ON public.export_log FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "export_log_insert_own"
  ON public.export_log FOR INSERT
  WITH CHECK (auth.uid() = user_id);
