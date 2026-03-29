-- ─────────────────────────────────────────────────────────────
-- EverMagic — Execution Log Table
-- Maps n8n execution_id → order context for error handling.
--
-- Each main workflow inserts one row at startup.
-- The Error Notifier looks up by execution_id to get order details.
--
-- Run this in Supabase SQL Editor (once)
-- ─────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.execution_log (
  execution_id   TEXT        PRIMARY KEY,
  order_id       TEXT        NOT NULL,
  workflow_name  TEXT,
  stage          TEXT,        -- script_generation | image_generation | scenario_expansion | pdf_assembly
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_execution_log_order ON public.execution_log (order_id);

-- Auto-cleanup: delete rows older than 30 days (optional, run as a scheduled job)
-- DELETE FROM execution_log WHERE created_at < now() - interval '30 days';
