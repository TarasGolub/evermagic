-- ─────────────────────────────────────────────────────────────
-- EverMagic — Error Handling Schema
-- Run this in Supabase SQL Editor (once)
-- ─────────────────────────────────────────────────────────────

-- ── orders table ─────────────────────────────────────────────

ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS retry_count       INT          NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS is_retry          BOOLEAN      NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS original_order_id TEXT,
  ADD COLUMN IF NOT EXISTS error_stage       TEXT,
  ADD COLUMN IF NOT EXISTS error_message     TEXT,
  ADD COLUMN IF NOT EXISTS error_at          TIMESTAMPTZ;

-- New status values used by the Error Notifier:
--   error_retrying     — failed; retry token issued, waiting for customer resubmission
--   error_admin_review — failed; retry limit reached, needs manual admin action

-- ── intake_tokens table ───────────────────────────────────────

ALTER TABLE public.intake_tokens
  ADD COLUMN IF NOT EXISTS retry_of             TEXT,
  ADD COLUMN IF NOT EXISTS retry_count_at_issue INT;

-- retry_of             → order_id of the original failed order this token was issued for
-- retry_count_at_issue → snapshot of retry_count at time of issue (prevents double-issuing)
