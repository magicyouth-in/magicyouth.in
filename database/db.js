/**
 * database/db.js
 * SQLite database connection, schema initialization, and admin seed.
 * Uses better-sqlite3 for synchronous, simple database operations.
 */

const Database = require('better-sqlite3');
const bcrypt = require('bcryptjs');
const path = require('path');
const fs = require('fs');

// Ensure the data directory exists
const dataDir = path.join(__dirname, '..', 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const DB_PATH = path.join(dataDir, 'magicyouth.db');

// Open (or create) the database file
const db = new Database(DB_PATH);

// Enable WAL mode for better performance and concurrent access
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

/**
 * Initialize all database tables.
 * Uses CREATE TABLE IF NOT EXISTS so it's safe to run on every startup.
 */
function initializeDatabase() {

  // --- Admin Users ---
  db.exec(`
    CREATE TABLE IF NOT EXISTS admin_users (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      username    TEXT    NOT NULL UNIQUE,
      email       TEXT,
      password_hash TEXT  NOT NULL,
      created_at  DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // --- Events ---
  db.exec(`
    CREATE TABLE IF NOT EXISTS events (
      id           INTEGER PRIMARY KEY AUTOINCREMENT,
      title        TEXT    NOT NULL,
      date         TEXT,
      venue        TEXT,
      description  TEXT,
      organizers   TEXT,
      status       TEXT    DEFAULT 'upcoming',   -- 'upcoming' | 'completed'
      poster_image TEXT,
      academic_year TEXT,
      created_at   DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at   DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // --- Gallery ---
  db.exec(`
    CREATE TABLE IF NOT EXISTS gallery (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      event_id    INTEGER REFERENCES events(id) ON DELETE SET NULL,
      event_name  TEXT    NOT NULL,
      filename    TEXT    NOT NULL,
      caption     TEXT,
      academic_year TEXT,
      created_at  DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // --- Documents / Reports ---
  db.exec(`
    CREATE TABLE IF NOT EXISTS documents (
      id              INTEGER PRIMARY KEY AUTOINCREMENT,
      title           TEXT    NOT NULL,
      event_name      TEXT,
      event_date      TEXT,
      filename        TEXT    NOT NULL,
      description     TEXT,
      category        TEXT    DEFAULT 'Event Reports',
      -- Category: 'Event Reports' | 'Annual Reports' | 'Magazines' | 'Certificates' | 'Letters/Documents'
      academic_year   TEXT,
      is_downloadable INTEGER DEFAULT 1,   -- 1 = public download, 0 = view only
      created_at      DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // --- Team Members ---
  db.exec(`
    CREATE TABLE IF NOT EXISTS team_members (
      id           INTEGER PRIMARY KEY AUTOINCREMENT,
      name         TEXT    NOT NULL,
      position     TEXT,
      photo        TEXT,
      department   TEXT,
      batch_year   TEXT,
      contact      TEXT,
      social_links TEXT,   -- JSON string: { instagram, linkedin, email }
      team_year    TEXT,   -- e.g. '2025-26'
      is_current   INTEGER DEFAULT 1,   -- 1 = current team
      display_order INTEGER DEFAULT 0,
      created_at   DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // --- Announcements ---
  db.exec(`
    CREATE TABLE IF NOT EXISTS announcements (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      title       TEXT    NOT NULL,
      content     TEXT,
      priority    TEXT    DEFAULT 'normal',   -- 'high' | 'normal' | 'low'
      is_active   INTEGER DEFAULT 1,
      created_at  DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at  DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // --- Activity Timeline ---
  db.exec(`
    CREATE TABLE IF NOT EXISTS timeline (
      id            INTEGER PRIMARY KEY AUTOINCREMENT,
      event_id      INTEGER REFERENCES events(id) ON DELETE SET NULL,
      event_name    TEXT    NOT NULL,
      event_date    TEXT,
      description   TEXT,
      photos        TEXT,   -- JSON array of filenames
      document_id   INTEGER REFERENCES documents(id) ON DELETE SET NULL,
      academic_year TEXT,
      created_at    DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // --- Contact Messages ---
  db.exec(`
    CREATE TABLE IF NOT EXISTS contact_messages (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      name       TEXT,
      email      TEXT,
      phone      TEXT,
      query      TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // --- About Page Content ---
  // Stores editable sections of the About page (title, description, vision, etc.)
  db.exec(`
    CREATE TABLE IF NOT EXISTS about_content (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      section_key TEXT    NOT NULL UNIQUE,  -- e.g. 'hero', 'vision', 'mission_text', 'custom_1'
      title       TEXT,
      content     TEXT,
      icon        TEXT,                     -- emoji or icon code
      display_order INTEGER DEFAULT 0,
      is_active   INTEGER DEFAULT 1,
      updated_at  DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // --- Notifications ---
  // Pop-up or banner notifications shown to website visitors
  db.exec(`
    CREATE TABLE IF NOT EXISTS notifications (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      title       TEXT    NOT NULL,
      message     TEXT,
      type        TEXT    DEFAULT 'info',   -- 'info' | 'success' | 'warning' | 'urgent'
      link_text   TEXT,                     -- CTA button text (optional)
      link_url    TEXT,                     -- CTA button URL  (optional)
      show_popup  INTEGER DEFAULT 0,        -- 1 = show as popup on page load
      is_active   INTEGER DEFAULT 1,
      expires_at  TEXT,                     -- optional expiry date
      created_at  DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  console.log('[DB] Tables initialized.');

  // Seed default admin user if none exists
  seedDefaultAdmin();

  // Seed sample events from existing static website
  seedSampleData();
}

/**
 * Seed the default admin account on first run.
 * Credentials can be changed from the admin dashboard.
 */
function seedDefaultAdmin() {
  const existingAdmin = db.prepare('SELECT id FROM admin_users WHERE username = ?').get('admin');
  if (!existingAdmin) {
    const hash = bcrypt.hashSync('MagicYouth@2025', 12);
    db.prepare(`
      INSERT INTO admin_users (username, email, password_hash)
      VALUES (?, ?, ?)
    `).run('admin', 'admin@magicyouth.in', hash);
    console.log('[DB] Default admin user created. Username: admin, Password: MagicYouth@2025');
  }
}

/**
 * Seed sample events from the existing static website so the
 * public pages have content immediately on first run.
 */
function seedSampleData() {
  const eventCount = db.prepare('SELECT COUNT(*) as count FROM events').get().count;
  if (eventCount > 0) return; // Already seeded

  const insertEvent = db.prepare(`
    INSERT INTO events (title, date, venue, description, status, academic_year)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  const events = [
    {
      title: 'Chess Tournament',
      date: '2024-10-15',
      venue: 'Andhra Loyola College, Vijayawada',
      description: 'A battle of strategy and focus! Our Chess event brought together sharp minds and friendly competition. Students showcased brilliant tactics and teamwork throughout the matches.',
      status: 'completed',
      year: '2024-25'
    },
    {
      title: 'French Impression',
      date: '2024-11-20',
      venue: 'Andhra Loyola College, Vijayawada',
      description: 'An artistic event inspired by French Impressionism, showcasing creativity and cultural appreciation through various performances and displays.',
      status: 'completed',
      year: '2024-25'
    },
    {
      title: 'French Impressions — Suicide Awareness',
      date: '2024-12-05',
      venue: 'Andhra Loyola College, Vijayawada',
      description: 'A heartfelt campaign highlighting mental health awareness through creative expression, performances, and emotional stories under the theme "French Impressions".',
      status: 'completed',
      year: '2024-25'
    },
    {
      title: "Teachers' Day Celebration",
      date: '2024-09-05',
      venue: 'Andhra Loyola College, Vijayawada',
      description: "A day of gratitude! Magic Youth celebrated Teachers' Day with games, speeches, and heartfelt performances, honoring the mentors who inspire and guide us every day.",
      status: 'completed',
      year: '2024-25'
    }
  ];

  for (const e of events) {
    insertEvent.run(e.title, e.date, e.venue, e.description, e.status, e.year);
  }

  // Seed sample announcements
  db.prepare(`
    INSERT INTO announcements (title, content, priority, is_active)
    VALUES (?, ?, ?, ?)
  `).run(
    'Welcome to MAGIC Youth Digital Platform!',
    'Our new digital platform is live. Stay tuned for upcoming events, gallery updates, and announcements.',
    'high',
    1
  );

  // Seed default about page content sections
  const aboutSections = [
    { key: 'hero_title',   title: 'About Magic Youth',  content: 'Magic Youth is a student-driven movement at ALIET that inspires creativity, service, and leadership. We create events, programs, and outreach activities that bring transformation and unity among youth.', icon: '✨', order: 1 },
    { key: 'vision',       title: 'Our Vision',          content: 'To nurture a generation of compassionate, creative, and responsible youth leaders who drive positive change in society.', icon: '🎯', order: 2 },
    { key: 'values',       title: 'Our Values',          content: 'Integrity, Creativity, Service, Unity, and Leadership — these are the pillars that guide every action and decision of MAGIC Youth.', icon: '💎', order: 3 },
    { key: 'story',        title: 'Our Story',           content: 'MAGIC Youth was founded at Andhra Loyola Institute of Engineering and Technology, Vijayawada, with the mission to create meaningful youth experiences beyond the classroom.', icon: '📖', order: 4 },
  ];

  const insertAbout = db.prepare(`
    INSERT OR IGNORE INTO about_content (section_key, title, content, icon, display_order, is_active)
    VALUES (?, ?, ?, ?, ?, 1)
  `);
  for (const s of aboutSections) {
    insertAbout.run(s.key, s.title, s.content, s.icon, s.order);
  }

  console.log('[DB] Sample data seeded.');
}

// Run initialization immediately when module is loaded
initializeDatabase();

module.exports = db;
