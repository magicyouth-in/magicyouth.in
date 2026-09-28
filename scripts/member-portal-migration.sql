-- ============================================================
-- MAGIC Youth Member Portal — Supabase SQL Migration
-- Run this in Supabase SQL Editor
-- ============================================================

-- ─── MEMBERS ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS members (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id         TEXT UNIQUE NOT NULL,          -- e.g. MAGIC-ALIET-0001
  join_request_id   UUID REFERENCES join_requests(id) ON DELETE SET NULL,
  unit_id           UUID REFERENCES units(id) ON DELETE SET NULL,
  academic_year_id  UUID REFERENCES academic_years(id) ON DELETE SET NULL,

  -- Personal
  name              TEXT NOT NULL,
  email             TEXT NOT NULL,
  phone             TEXT,
  gender            TEXT,
  dob               DATE,
  college           TEXT,
  department        TEXT,
  year              TEXT,
  city              TEXT,
  address           TEXT,
  profile_photo     TEXT,                          -- URL

  -- Membership
  status            TEXT NOT NULL DEFAULT 'Active' CHECK (status IN ('Active','Suspended','Expired','Deactivated')),
  role_label        TEXT DEFAULT 'Member',
  joined_at         TIMESTAMPTZ DEFAULT NOW(),
  valid_until       DATE,

  -- Auth
  password_hash     TEXT NOT NULL,
  last_login_at     TIMESTAMPTZ,

  -- Extra
  interests         TEXT[],
  bio               TEXT,
  skills            TEXT[],

  created_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW()
);

-- Unit sequence counter for Member ID generation
CREATE TABLE IF NOT EXISTS member_id_sequences (
  unit_code   TEXT PRIMARY KEY,
  next_seq    INTEGER NOT NULL DEFAULT 1
);

-- ─── EVENT REGISTRATIONS ────────────────────────────────────
CREATE TABLE IF NOT EXISTS event_registrations (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id    UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  member_id   UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  unit_id     UUID REFERENCES units(id) ON DELETE SET NULL,
  status      TEXT NOT NULL DEFAULT 'Registered' CHECK (status IN ('Registered','Attended','Cancelled')),
  registered_at TIMESTAMPTZ DEFAULT NOW(),
  notes       TEXT,
  UNIQUE(event_id, member_id)
);

-- ─── UNIT ANNOUNCEMENTS ─────────────────────────────────────
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

-- ─── MEMBER CERTIFICATES ────────────────────────────────────
CREATE TABLE IF NOT EXISTS member_certificates (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id   UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  unit_id     UUID REFERENCES units(id) ON DELETE SET NULL,
  event_id    UUID REFERENCES events(id) ON DELETE SET NULL,
  title       TEXT NOT NULL,
  description TEXT,
  file_url    TEXT,                                -- Supabase Storage URL
  issued_at   TIMESTAMPTZ DEFAULT NOW(),
  issued_by   UUID REFERENCES admin_users(id) ON DELETE SET NULL,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ─── VOLUNTEER OPPORTUNITIES ────────────────────────────────
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

-- ─── INDEXES ────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_members_unit_id       ON members(unit_id);
CREATE INDEX IF NOT EXISTS idx_members_status        ON members(status);
CREATE INDEX IF NOT EXISTS idx_members_member_id     ON members(member_id);
CREATE INDEX IF NOT EXISTS idx_event_regs_event      ON event_registrations(event_id);
CREATE INDEX IF NOT EXISTS idx_event_regs_member     ON event_registrations(member_id);
CREATE INDEX IF NOT EXISTS idx_unit_ann_unit         ON unit_announcements(unit_id);
CREATE INDEX IF NOT EXISTS idx_member_certs_member   ON member_certificates(member_id);

-- ─── RLS (Row Level Security — disable for server-side JWT auth) ─
-- The Express server uses a service-role key; RLS not needed for API routes.
-- If you use Supabase client-side auth separately, enable RLS per table.

-- ─── HELPFUL VIEW ────────────────────────────────────────────
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
    m.role_label,
    m.profile_photo,
    m.joined_at,
    m.valid_until,
    u.name   AS unit_name,
    u.code   AS unit_code,
    ay.year  AS academic_year
  FROM members m
  LEFT JOIN units u         ON m.unit_id = u.id
  LEFT JOIN academic_years ay ON m.academic_year_id = ay.id;
