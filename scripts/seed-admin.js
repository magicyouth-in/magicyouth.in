/**
 * scripts/seed-admin.js
 * One-time admin seeder. Creates the single administrator account.
 *
 * Usage:
 *   node scripts/seed-admin.js
 *
 * Reads ADMIN_EMAIL and ADMIN_PASSWORD from .env.
 * If an admin already exists, it updates the existing record.
 */

require('dotenv').config({ path: require('path').resolve(__dirname, '..', '.env') });

const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');

const MONGODB_URI    = process.env.MONGODB_URI;
const ADMIN_EMAIL    = process.env.ADMIN_EMAIL;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

if (!MONGODB_URI || !ADMIN_EMAIL || !ADMIN_PASSWORD) {
  console.error('\n[SEED ERROR] Missing required environment variables.');
  console.error('  Ensure MONGODB_URI, ADMIN_EMAIL, and ADMIN_PASSWORD are set in .env\n');
  process.exit(1);
}

async function seed() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('[SEED] Connected to MongoDB Atlas.');

    const AdminUser = require('../database/models/AdminUser');

    const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 12);

    const result = await AdminUser.findOneAndUpdate(
      {},  // match any (there should only ever be one)
      {
        username:     ADMIN_EMAIL.split('@')[0],
        email:        ADMIN_EMAIL,
        passwordHash: passwordHash,
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    console.log('\n╔════════════════════════════════════════════════╗');
    console.log('║   MAGIC Youth — Administrator Seeded          ║');
    console.log('╠════════════════════════════════════════════════╣');
    console.log(`║  Email:    ${ADMIN_EMAIL.padEnd(35)}║`);
    console.log(`║  Username: ${result.username.padEnd(35)}║`);
    console.log('║  Password: (from .env ADMIN_PASSWORD)         ║');
    console.log('╚════════════════════════════════════════════════╝\n');

  } catch (err) {
    console.error('[SEED ERROR]', err.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
  }
}

seed();
