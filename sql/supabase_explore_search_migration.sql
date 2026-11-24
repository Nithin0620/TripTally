-- ============================================
-- TRIPTALLY EXPLORE SEARCH SCALING MIGRATION
-- ============================================
-- Run this in Supabase SQL Editor
-- Adds production-safe indexing for search and dedupe support.

-- 1) Enable trigram extension for efficient ILIKE search
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- 2) Keep category pagination fast
CREATE INDEX IF NOT EXISTS idx_places_category_created_at
  ON places (category, created_at DESC);

-- 3) Speed up case-insensitive search on name/description
CREATE INDEX IF NOT EXISTS idx_places_name_trgm
  ON places USING GIN (lower(name) gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_places_description_trgm
  ON places USING GIN (lower(description) gin_trgm_ops);

-- 4) Optional dedupe helper key (safe additive change)
ALTER TABLE places
  ADD COLUMN IF NOT EXISTS normalized_name TEXT GENERATED ALWAYS AS (lower(trim(name))) STORED;

CREATE INDEX IF NOT EXISTS idx_places_normalized_name
  ON places (normalized_name);
