-- ─────────────────────────────────────────────────────────────
-- EverMagic — Intake Token System
-- Step 3.5: Single-use tokens to restrict form submissions
--
-- Run this in Supabase SQL Editor (once)
-- ─────────────────────────────────────────────────────────────

-- ─────────────────────────────────────────────────────────────
-- 1. intake_tokens table
-- ─────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.intake_tokens (
  token         TEXT PRIMARY KEY,
  status        TEXT        NOT NULL DEFAULT 'unused',  -- unused | used
  source        TEXT,                                   -- etsy | direct | etc.
  etsy_order_id TEXT,                                   -- original Etsy/channel order number
  order_id      TEXT,                                   -- EM-... filled when token is consumed
  used_at       TIMESTAMPTZ,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS — only accessible via service-role key (used in n8n)
ALTER TABLE public.intake_tokens ENABLE ROW LEVEL SECURITY;

-- ─────────────────────────────────────────────────────────────
-- 2. orders table — add source + order_no columns
-- ─────────────────────────────────────────────────────────────

ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS source   TEXT,   -- channel: etsy | direct | test | etc.
  ADD COLUMN IF NOT EXISTS order_no TEXT;   -- external order number (e.g. Etsy order ID)

-- ─────────────────────────────────────────────────────────────
-- 3. Seed – 100 random single-use tokens
-- ─────────────────────────────────────────────────────────────

INSERT INTO public.intake_tokens (token)
SELECT 'EVRM-' || upper(substr(md5(random()::text || clock_timestamp()::text), 1, 8))
FROM generate_series(1, 100)
ON CONFLICT (token) DO NOTHING;

-- ─────────────────────────────────────────────────────────────
-- Notes:
--   • Cheat token "EVRM-DEV" is handled entirely in n8n code —
--     it skips the DB lookup, so no row is needed here.
--   • To top up the pool, run the INSERT block again as needed.
--   • To pick a token for an Etsy order:
--       SELECT token FROM intake_tokens WHERE status = 'unused' LIMIT 1;
--     Then copy that token and build the Tally URL:
--       https://tally.so/r/FORM_ID?source=etsy&orderNo=ETSY_ORDER_ID&token=TOKEN
-- ─────────────────────────────────────────────────────────────
