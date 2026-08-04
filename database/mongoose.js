/**
 * database/mongoose.js
 * MongoDB connection using Mongoose.
 * Connects once on startup, handles reconnection automatically.
 * Seeds default admin + sample data on first run.
 */

const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');

const AdminUser    = require('./models/AdminUser');
const Event        = require('./models/Event');
const Announcement = require('./models/Announcement');
const AboutContent = require('./models/AboutContent');

/**
 * Connect to MongoDB Atlas.
 * Must be called (and awaited) before starting the Express server.
 */
async function connectDB() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error('MONGODB_URI environment variable is not set.');
  }

  await mongoose.connect(uri, {
    serverSelectionTimeoutMS: 10000,   // 10 s — fail fast on bad network
    connectTimeoutMS:         10000,
    socketTimeoutMS:          45000,
    maxPoolSize:              10,
    retryWrites:              true,
    w:                        'majority',
  });

  console.log('[DB] Connected to MongoDB Atlas ✓');

  // Seed data on first run
  await seedDefaultAdmin();
  await seedSampleData();
}

/**
 * Seed the default admin account if none exists.
 */
async function seedDefaultAdmin() {
  const count = await AdminUser.countDocuments();
  if (count > 0) return;

  const hash = await bcrypt.hash('MagicYouth@2025', 12);
  await AdminUser.create({
    username:     'admin',
    email:        'admin@magicyouth.in',
    passwordHash: hash,
  });
  console.log('[DB] Default admin created — username: admin, password: MagicYouth@2025');
}

/**
 * Seed sample events and announcements on first run.
 */
async function seedSampleData() {
  const eventCount = await Event.countDocuments();
  if (eventCount > 0) return;

  await Event.insertMany([
    {
      title:        'Chess Tournament',
      date:         '2024-10-15',
      venue:        'Andhra Loyola College, Vijayawada',
      description:  'A battle of strategy and focus! Our Chess event brought together sharp minds and friendly competition.',
      status:       'completed',
      academicYear: '2024-25',
    },
    {
      title:        'French Impression',
      date:         '2024-11-20',
      venue:        'Andhra Loyola College, Vijayawada',
      description:  'An artistic event inspired by French Impressionism, showcasing creativity and cultural appreciation.',
      status:       'completed',
      academicYear: '2024-25',
    },
    {
      title:        'French Impressions — Suicide Awareness',
      date:         '2024-12-05',
      venue:        'Andhra Loyola College, Vijayawada',
      description:  'A heartfelt campaign highlighting mental health awareness through creative expression and performances.',
      status:       'completed',
      academicYear: '2024-25',
    },
    {
      title:        "Teachers' Day Celebration",
      date:         '2024-09-05',
      venue:        'Andhra Loyola College, Vijayawada',
      description:  "Magic Youth celebrated Teachers' Day with games, speeches, and heartfelt performances.",
      status:       'completed',
      academicYear: '2024-25',
    },
  ]);

  await Announcement.create({
    title:    'Welcome to MAGIC Youth Digital Platform!',
    content:  'Our new digital platform is live. Stay tuned for upcoming events, gallery updates, and announcements.',
    priority: 'high',
    isActive: true,
  });

  await AboutContent.insertMany([
    { sectionKey: 'hero_title', title: 'About Magic Youth',  content: 'Magic Youth is a student-driven movement at ALIET that inspires creativity, service, and leadership.', icon: '✨', displayOrder: 1 },
    { sectionKey: 'vision',     title: 'Our Vision',         content: 'To nurture a generation of compassionate, creative, and responsible youth leaders who drive positive change.', icon: '🎯', displayOrder: 2 },
    { sectionKey: 'values',     title: 'Our Values',         content: 'Integrity, Creativity, Service, Unity, and Leadership — the pillars guiding every action of MAGIC Youth.', icon: '💎', displayOrder: 3 },
    { sectionKey: 'story',      title: 'Our Story',          content: 'MAGIC Youth was founded at Andhra Loyola Institute of Engineering and Technology, Vijayawada.', icon: '📖', displayOrder: 4 },
  ]);

  console.log('[DB] Sample data seeded ✓');
}

module.exports = { connectDB };
