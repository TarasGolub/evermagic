-- ─────────────────────────────────────────────────────────────
-- EverMagic — Images table
-- Run this in Supabase SQL Editor
-- ─────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS images (
  id                UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id          TEXT NOT NULL,
  image_type        TEXT NOT NULL,          -- 'cover', 'scene_1'..'scene_5', 'coloring'
  prompt            TEXT,                    -- the exact prompt sent to PuLID/Flux
  theme             TEXT,                    -- 'SPACE_HERO', 'PRINCESS', etc.
  scene_title       TEXT,                    -- human-readable: 'The Call', 'The Launch', etc.
  face_photo_url    TEXT,                    -- child's main reference photo URL
  extra_photo_url   TEXT,                    -- child's extra reference photo URL (optional)
  generation_params JSONB,                   -- PuLID API params snapshot for debugging
  file_path         TEXT,                    -- path in Supabase Storage
  file_url          TEXT,                    -- public/signed URL of generated image
  model             TEXT DEFAULT 'openai/gpt-image-1.5', -- model used
  status            TEXT DEFAULT 'pending',  -- pending, generating, completed, failed, needs_revision
  error_message     TEXT,                    -- error details if status = 'failed'
  created_at        TIMESTAMPTZ DEFAULT now(),
  updated_at        TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_images_order ON images (order_id);
CREATE INDEX idx_images_order_type ON images (order_id, image_type);
CREATE INDEX idx_images_status ON images (status);

-- ─────────────────────────────────────────────────────────────
-- Usage:
-- ─────────────────────────────────────────────────────────────
-- Insert a prompt (from n8n after generation):
-- INSERT INTO images (order_id, image_type, prompt, theme, scene_title, face_photo_url, generation_params, status)
-- VALUES ('EM-20260301-W19E', 'scene_1', '3D animated...', 'SPACE_HERO', 'The Call', 'https://...', '{"width":1024}', 'pending');
--
-- Get all images for an order:
-- SELECT * FROM images WHERE order_id = 'EM-...' ORDER BY image_type;
--
-- Check pipeline status:
-- SELECT order_id, image_type, status FROM images WHERE order_id = 'EM-...' ORDER BY image_type;
--
-- Find failed generations:
-- SELECT * FROM images WHERE status = 'failed';
