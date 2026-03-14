-- Phase 3.3: PDF Assembly
-- Run in Supabase SQL Editor before activating the PDF Assembly workflow

CREATE TABLE IF NOT EXISTS pdfs (
  id              UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id        TEXT        NOT NULL REFERENCES orders(order_id),
  pdf_type        TEXT        NOT NULL, -- storybook | coloring_book | certificate
  file_path       TEXT,                 -- path in Supabase Storage: pdfs/{order_id}/{pdf_type}.pdf
  file_url        TEXT,                 -- public URL
  status          TEXT        NOT NULL DEFAULT 'pending', -- pending | completed | failed
  error_message   TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Also add pdfshift_api_key to envs table:
-- INSERT INTO envs (key, value) VALUES ('pdfshift_api_key', 'your_key_here');
