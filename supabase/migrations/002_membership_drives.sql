-- ==============================================================================
-- MAGIC YOUTH — MEMBERSHIP DRIVES & ACADEMIC YEAR INTEGRATION MIGRATION (002)
-- Run in Supabase SQL Editor (https://supabase.com/dashboard)
-- Idempotent & Fully RLS-Hardened
-- ==============================================================================

-- ─── 1. MEMBERSHIP DRIVES TABLE ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS membership_drives (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name                TEXT NOT NULL,
  unit_id             UUID NOT NULL REFERENCES units(id) ON DELETE CASCADE,
  academic_year_id    UUID REFERENCES academic_years(id) ON DELETE SET NULL,
  start_date          DATE,
  end_date            DATE,
  status              TEXT NOT NULL DEFAULT 'DRAFT' CHECK (status IN ('DRAFT', 'UPCOMING', 'OPEN', 'CLOSED')),
  id_format           TEXT NOT NULL DEFAULT 'MAGIC-{UNIT}-{NUMBER}',
  start_number        INTEGER NOT NULL DEFAULT 1,
  next_number         INTEGER NOT NULL DEFAULT 1,
  padding_digits      INTEGER NOT NULL DEFAULT 3,
  description         TEXT DEFAULT '',
  created_at          TIMESTAMPTZ DEFAULT NOW(),
  updated_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_membership_drives_unit ON membership_drives(unit_id);
CREATE INDEX IF NOT EXISTS idx_membership_drives_status ON membership_drives(status);
CREATE INDEX IF NOT EXISTS idx_membership_drives_ay ON membership_drives(academic_year_id);

-- Enable RLS on membership_drives
ALTER TABLE membership_drives ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read of active/open membership drives" ON membership_drives;
CREATE POLICY "Allow public read of active/open membership drives" ON membership_drives
  FOR SELECT USING (status IN ('OPEN', 'UPCOMING'));


-- ─── 2. LINK MEMBERSHIP DRIVE TO JOIN_REQUESTS AND MEMBERS ────────────────────
ALTER TABLE IF EXISTS join_requests
  ADD COLUMN IF NOT EXISTS membership_drive_id UUID REFERENCES membership_drives(id) ON DELETE SET NULL;

ALTER TABLE IF EXISTS members
  ADD COLUMN IF NOT EXISTS membership_drive_id UUID REFERENCES membership_drives(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_join_requests_drive ON join_requests(membership_drive_id);
CREATE INDEX IF NOT EXISTS idx_members_drive ON members(membership_drive_id);


-- ─── 3. ATOMIC MEMBERSHIP DRIVE SEQUENCE RPC ──────────────────────────────────
CREATE OR REPLACE FUNCTION increment_drive_member_seq(p_drive_id UUID)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_num INTEGER;
BEGIN
  UPDATE membership_drives
    SET next_number = next_number + 1,
        updated_at = NOW()
    WHERE id = p_drive_id
    RETURNING next_number - 1 INTO v_num;

  RETURN v_num;
END;
$$;


-- ─── 4. SEED INITIAL MEMBERSHIP DRIVES FOR EXISTING UNITS ─────────────────────
-- If no drive exists for active units, create an OPEN 2026-27 drive
INSERT INTO membership_drives (name, unit_id, academic_year_id, status, id_format, start_number, next_number, padding_digits, start_date, end_date)
SELECT 
  u.name || ' Membership Drive 2026–27',
  u.id,
  (SELECT id FROM academic_years WHERE unit_id = u.id ORDER BY year DESC LIMIT 1),
  'OPEN',
  'MAGIC-' || UPPER(REGEXP_REPLACE(u.code, '[^A-Za-z0-9]', '', 'g')) || '-{NUMBER}',
  1,
  1,
  3,
  '2026-04-01',
  '2027-03-31'
FROM units u
WHERE (u.status ILIKE 'Active' OR u.status IS NULL)
  AND NOT EXISTS (SELECT 1 FROM membership_drives WHERE unit_id = u.id);

-- ─── 5. RELOAD SCHEMA CACHE ──────────────────────────────────────────────────
NOTIFY pgrst, 'reload schema';
