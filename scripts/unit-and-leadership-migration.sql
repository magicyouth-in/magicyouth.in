-- ============================================================
-- MAGIC Youth — Unit & Leadership Dynamic System Migration
-- Run this in Supabase SQL Editor
-- ============================================================

-- 1. Ensure units table has is_default and all necessary fields
ALTER TABLE IF EXISTS units 
  ADD COLUMN IF NOT EXISTS is_default BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS institution TEXT DEFAULT '',
  ADD COLUMN IF NOT EXISTS location TEXT DEFAULT '',
  ADD COLUMN IF NOT EXISTS description TEXT DEFAULT '',
  ADD COLUMN IF NOT EXISTS contact_email TEXT DEFAULT '',
  ADD COLUMN IF NOT EXISTS contact_phone TEXT DEFAULT '';

-- Make sure at least one unit is default (e.g. ALIET if exists, or the first active unit)
UPDATE units SET is_default = TRUE WHERE id = (
  SELECT id FROM units WHERE status = 'Active' ORDER BY (CASE WHEN code ILIKE '%ALIET%' THEN 0 ELSE 1 END), name ASC LIMIT 1
) AND NOT EXISTS (SELECT 1 FROM units WHERE is_default = TRUE);

-- 2. Configurable Leadership Roles table
CREATE TABLE IF NOT EXISTS leadership_roles (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name          TEXT UNIQUE NOT NULL,
  display_order INT DEFAULT 0,
  is_active     BOOLEAN DEFAULT TRUE,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- Seed the 9 official roles if table is empty
INSERT INTO leadership_roles (name, display_order, is_active)
VALUES
  ('First Lead', 1, TRUE),
  ('Second Lead', 2, TRUE),
  ('Secretary', 3, TRUE),
  ('Deputy Secretary', 4, TRUE),
  ('Procurator', 5, TRUE),
  ('Social Media Coordinator', 6, TRUE),
  ('Event Coordinator', 7, TRUE),
  ('Volunteer Coordinator', 8, TRUE),
  ('Cultural Coordinator', 9, TRUE)
ON CONFLICT (name) DO NOTHING;

-- 3. Update join_requests table with leadership nomination fields
ALTER TABLE IF EXISTS join_requests
  ADD COLUMN IF NOT EXISTS membership_type TEXT DEFAULT 'MEMBER',
  ADD COLUMN IF NOT EXISTS preferred_leadership_role TEXT,
  ADD COLUMN IF NOT EXISTS election_status TEXT DEFAULT 'PENDING',
  ADD COLUMN IF NOT EXISTS assigned_role TEXT;

-- 4. Update members table with leadership and role fields
ALTER TABLE IF EXISTS members
  ADD COLUMN IF NOT EXISTS membership_type TEXT DEFAULT 'MEMBER',
  ADD COLUMN IF NOT EXISTS preferred_leadership_role TEXT,
  ADD COLUMN IF NOT EXISTS election_status TEXT DEFAULT 'PENDING',
  ADD COLUMN IF NOT EXISTS assigned_role TEXT;

-- 5. Indexes for fast lookups
CREATE INDEX IF NOT EXISTS idx_units_is_default ON units(is_default);
CREATE INDEX IF NOT EXISTS idx_join_requests_unit_id ON join_requests(unit_id);
CREATE INDEX IF NOT EXISTS idx_join_requests_mem_type ON join_requests(membership_type);
CREATE INDEX IF NOT EXISTS idx_join_requests_election ON join_requests(election_status);
CREATE INDEX IF NOT EXISTS idx_leadership_roles_order ON leadership_roles(display_order);
