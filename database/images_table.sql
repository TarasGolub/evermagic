-- ─────────────────────────────────────────────────────────────
-- EverMagic — Images table
-- Run this in Supabase SQL Editor
-- ─────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS images (
  id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id      TEXT NOT NULL,
  image_type    TEXT NOT NULL,          -- 'character_ref', 'scene_1'..'scene_5', 'cover', 'coloring'
  prompt        TEXT,                    -- the exact prompt sent to Flux
  file_path     TEXT,                    -- path in Supabase Storage
  file_url      TEXT,                    -- public/signed URL
  model         TEXT DEFAULT 'flux-1.1', -- model used
  status        TEXT DEFAULT 'pending',  -- pending, generated, failed
  created_at    TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_images_order ON images (order_id);
CREATE INDEX idx_images_order_type ON images (order_id, image_type);

-- ─────────────────────────────────────────────────────────────
-- Usage:
-- ─────────────────────────────────────────────────────────────
-- INSERT INTO images (order_id, image_type, prompt, file_path, file_url, status)
-- VALUES ('EM-20260228-HD2W', 'scene_1', 'Pixar-style 3D...', 'images/EM-.../scene_1.png', 'https://...', 'generated');
--
-- Get all images for an order:
-- SELECT * FROM images WHERE order_id = 'EM-...' ORDER BY image_type;
--
-- Check if all scenes are generated:
-- SELECT COUNT(*) FROM images WHERE order_id = 'EM-...' AND status = 'generated' AND image_type LIKE 'scene_%';
