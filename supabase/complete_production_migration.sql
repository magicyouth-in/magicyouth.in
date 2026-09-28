-- ==============================================================================
-- MAGIC YOUTH — COMPLETE MASTER PRODUCTION DATABASE MIGRATION (WITH RLS)
-- Run this in the Supabase SQL Editor (https://supabase.com/dashboard)
-- Fully Idempotent & Production-Hardened with Row Level Security (RLS)
-- ==============================================================================

-- ─── 1. UNITS EXTENSION & DEFAULT UNIT ─────────────────────────────────────────
ALTER TABLE IF EXISTS units 
  ADD COLUMN IF NOT EXISTS is_default BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS institution TEXT DEFAULT '',
  ADD COLUMN IF NOT EXISTS location TEXT DEFAULT '',
  ADD COLUMN IF NOT EXISTS description TEXT DEFAULT '',
  ADD COLUMN IF NOT EXISTS contact_email TEXT DEFAULT '',
  ADD COLUMN IF NOT EXISTS contact_phone TEXT DEFAULT '';

-- Set default unit if none is currently marked as default
UPDATE units SET is_default = TRUE WHERE id = (
  SELECT id FROM units WHERE status ILIKE 'Active' OR status IS NULL 
  ORDER BY (CASE WHEN code ILIKE '%ALIET%' THEN 0 ELSE 1 END), name ASC LIMIT 1
) AND NOT EXISTS (SELECT 1 FROM units WHERE is_default = TRUE);

CREATE INDEX IF NOT EXISTS idx_units_is_default ON units(is_default);

-- Enable RLS on units
ALTER TABLE units ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read of active units" ON units;
CREATE POLICY "Allow public read of active units" ON units
  FOR SELECT USING (status ILIKE 'Active' OR status IS NULL);


-- ─── 2. LEADERSHIP ROLES TABLE (9 Configurable Roles) ─────────────────────────
CREATE TABLE IF NOT EXISTS leadership_roles (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name          TEXT UNIQUE NOT NULL,
  display_order INT DEFAULT 0,
  is_active     BOOLEAN DEFAULT TRUE,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

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

CREATE INDEX IF NOT EXISTS idx_leadership_roles_order ON leadership_roles(display_order);

-- Enable RLS on leadership_roles
ALTER TABLE leadership_roles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read of active leadership roles" ON leadership_roles;
CREATE POLICY "Allow public read of active leadership roles" ON leadership_roles
  FOR SELECT USING (is_active = TRUE);


-- ─── 3. JOIN REQUESTS TABLE UPDATES ───────────────────────────────────────────
ALTER TABLE IF EXISTS join_requests
  ADD COLUMN IF NOT EXISTS membership_type TEXT DEFAULT 'MEMBER',
  ADD COLUMN IF NOT EXISTS preferred_leadership_role TEXT,
  ADD COLUMN IF NOT EXISTS election_status TEXT DEFAULT 'PENDING',
  ADD COLUMN IF NOT EXISTS assigned_role TEXT;

CREATE INDEX IF NOT EXISTS idx_join_requests_unit_id ON join_requests(unit_id);
CREATE INDEX IF NOT EXISTS idx_join_requests_mem_type ON join_requests(membership_type);
CREATE INDEX IF NOT EXISTS idx_join_requests_election ON join_requests(election_status);

-- Enable RLS on join_requests (Backend service-role handles all access)
ALTER TABLE join_requests ENABLE ROW LEVEL SECURITY;


-- ─── 4. MEMBERS TABLE ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS members (
  id                        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id                 TEXT UNIQUE NOT NULL,          -- e.g. MAGIC-ALIET-0001
  join_request_id           UUID REFERENCES join_requests(id) ON DELETE SET NULL,
  unit_id                   UUID REFERENCES units(id) ON DELETE SET NULL,
  academic_year_id          UUID REFERENCES academic_years(id) ON DELETE SET NULL,

  -- Personal
  name                      TEXT NOT NULL,
  email                     TEXT NOT NULL,
  phone                     TEXT,
  gender                    TEXT,
  dob                       DATE,
  college                   TEXT,
  department                TEXT,
  year                      TEXT,
  city                      TEXT,
  address                   TEXT,
  profile_photo             TEXT,

  -- Membership & Leadership
  membership_type           TEXT NOT NULL DEFAULT 'MEMBER', -- 'MEMBER' | 'LEADERSHIP'
  preferred_leadership_role TEXT,
  election_status           TEXT DEFAULT 'PENDING',        -- 'PENDING' | 'SHORTLISTED' | 'SELECTED' | 'REJECTED'
  assigned_role             TEXT,                          -- Official role assigned by Admin
  role_label                TEXT DEFAULT 'Member',
  status                    TEXT NOT NULL DEFAULT 'Active' CHECK (status IN ('Active','Suspended','Expired','Deactivated')),
  joined_at                 TIMESTAMPTZ DEFAULT NOW(),
  valid_until               DATE,

  -- Auth
  password_hash             TEXT NOT NULL,
  last_login_at             TIMESTAMPTZ,

  -- Extra
  interests                 TEXT[],
  bio                       TEXT,
  skills                    TEXT[],

  created_at                TIMESTAMPTZ DEFAULT NOW(),
  updated_at                TIMESTAMPTZ DEFAULT NOW()
);

-- Ensure all columns exist if table was previously created
ALTER TABLE IF EXISTS members
  ADD COLUMN IF NOT EXISTS membership_type TEXT DEFAULT 'MEMBER',
  ADD COLUMN IF NOT EXISTS preferred_leadership_role TEXT,
  ADD COLUMN IF NOT EXISTS election_status TEXT DEFAULT 'PENDING',
  ADD COLUMN IF NOT EXISTS assigned_role TEXT;

CREATE INDEX IF NOT EXISTS idx_members_unit_id         ON members(unit_id);
CREATE INDEX IF NOT EXISTS idx_members_status          ON members(status);
CREATE INDEX IF NOT EXISTS idx_members_member_id       ON members(member_id);
CREATE INDEX IF NOT EXISTS idx_members_membership_type ON members(membership_type);

-- Enable RLS on members (Protected backend service-role only)
ALTER TABLE members ENABLE ROW LEVEL SECURITY;


-- ─── 5. MEMBER ID SEQUENCE TRACKING ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS member_id_sequences (
  unit_code   TEXT PRIMARY KEY,
  next_seq    INTEGER NOT NULL DEFAULT 1
);

-- Enable RLS on member_id_sequences
ALTER TABLE member_id_sequences ENABLE ROW LEVEL SECURITY;


-- ─── 6. ATOMIC MEMBER ID SEQUENCE RPC FUNCTION ────────────────────────────────
CREATE OR REPLACE FUNCTION increment_member_seq(p_unit_code TEXT)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_seq INTEGER;
BEGIN
  INSERT INTO member_id_sequences (unit_code, next_seq)
    VALUES (p_unit_code, 2)
    ON CONFLICT (unit_code)
    DO UPDATE SET next_seq = member_id_sequences.next_seq + 1
    RETURNING next_seq - 1 INTO v_seq;

  RETURN v_seq;
END;
$$;


-- ─── 7. EVENT REGISTRATIONS ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS event_registrations (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id      UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  member_id     UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  unit_id       UUID REFERENCES units(id) ON DELETE SET NULL,
  status        TEXT NOT NULL DEFAULT 'Registered' CHECK (status IN ('Registered','Attended','Cancelled')),
  registered_at TIMESTAMPTZ DEFAULT NOW(),
  notes         TEXT,
  UNIQUE(event_id, member_id)
);

CREATE INDEX IF NOT EXISTS idx_event_regs_event  ON event_registrations(event_id);
CREATE INDEX IF NOT EXISTS idx_event_regs_member ON event_registrations(member_id);

-- Enable RLS on event_registrations
ALTER TABLE event_registrations ENABLE ROW LEVEL SECURITY;


-- ─── 8. UNIT ANNOUNCEMENTS ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS unit_announcements (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  unit_id     UUID REFERENCES units(id) ON DELETE CASCADE,   -- NULL = Global
  title       TEXT NOT NULL,
  content     TEXT,
  priority    TEXT NOT NULL DEFAULT 'normal' CHECK (priority IN ('high','normal','low')),
  is_active   BOOLEAN NOT NULL DEFAULT TRUE,
  is_global   BOOLEAN NOT NULL DEFAULT FALSE,
  created_by  UUID REFERENCES admin_users(id) ON DELETE SET NULL,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_unit_ann_unit ON unit_announcements(unit_id);

-- Enable RLS on unit_announcements
ALTER TABLE unit_announcements ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read of active announcements" ON unit_announcements;
CREATE POLICY "Allow public read of active announcements" ON unit_announcements
  FOR SELECT USING (is_active = TRUE);


-- ─── 9. MEMBER CERTIFICATES ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS member_certificates (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id   UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  unit_id     UUID REFERENCES units(id) ON DELETE SET NULL,
  event_id    UUID REFERENCES events(id) ON DELETE SET NULL,
  title       TEXT NOT NULL,
  description TEXT,
  file_url    TEXT,
  issued_at   TIMESTAMPTZ DEFAULT NOW(),
  issued_by   UUID REFERENCES admin_users(id) ON DELETE SET NULL,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_member_certs_member ON member_certificates(member_id);

-- Enable RLS on member_certificates
ALTER TABLE member_certificates ENABLE ROW LEVEL SECURITY;


-- ─── 10. VOLUNTEER OPPORTUNITIES & APPLICATIONS ───────────────────────────────
CREATE TABLE IF NOT EXISTS volunteer_opportunities (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  unit_id       UUID REFERENCES units(id) ON DELETE CASCADE,
  title         TEXT NOT NULL,
  description   TEXT,
  location      TEXT,
  date          DATE,
  deadline      DATE,
  slots         INTEGER,
  status        TEXT NOT NULL DEFAULT 'Open' CHECK (status IN ('Open','Closed','Cancelled')),
  created_by    UUID REFERENCES admin_users(id) ON DELETE SET NULL,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS volunteer_applications (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  opportunity_id  UUID NOT NULL REFERENCES volunteer_opportunities(id) ON DELETE CASCADE,
  member_id       UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  status          TEXT NOT NULL DEFAULT 'Applied' CHECK (status IN ('Applied','Accepted','Rejected')),
  applied_at      TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(opportunity_id, member_id)
);

-- Enable RLS on volunteer tables
ALTER TABLE volunteer_opportunities ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read of open volunteer opportunities" ON volunteer_opportunities;
CREATE POLICY "Allow public read of open volunteer opportunities" ON volunteer_opportunities
  FOR SELECT USING (status = 'Open');

ALTER TABLE volunteer_applications ENABLE ROW LEVEL SECURITY;


-- ─── 11. MEMBERSHIP DRIVES ───────────────────────────────────────────────────
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
  number_padding      INTEGER NOT NULL DEFAULT 3,
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

-- Add membership_drive_id to join_requests and members
ALTER TABLE IF EXISTS join_requests
  ADD COLUMN IF NOT EXISTS membership_drive_id UUID REFERENCES membership_drives(id) ON DELETE SET NULL;

ALTER TABLE IF EXISTS members
  ADD COLUMN IF NOT EXISTS membership_drive_id UUID REFERENCES membership_drives(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_join_requests_drive ON join_requests(membership_drive_id);
CREATE INDEX IF NOT EXISTS idx_members_drive ON members(membership_drive_id);

-- Atomic sequence increment for membership drive
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


-- ─── 12. MEMBER OVERVIEW VIEW ─────────────────────────────────────────────────
CREATE OR REPLACE VIEW member_overview AS
  SELECT
    m.id,
    m.member_id,
    m.name,
    m.email,
    m.phone,
    m.college,
    m.department,
    m.year,
    m.status,
    m.membership_type,
    m.preferred_leadership_role,
    m.assigned_role,
    m.role_label,
    m.profile_photo,
    m.joined_at,
    m.valid_until,
    m.membership_drive_id,
    md.name  AS drive_name,
    u.name   AS unit_name,
    u.code   AS unit_code,
    ay.year  AS academic_year
  FROM members m
  LEFT JOIN units u               ON m.unit_id = u.id
  LEFT JOIN academic_years ay       ON m.academic_year_id = ay.id
  LEFT JOIN membership_drives md   ON m.membership_drive_id = md.id;
