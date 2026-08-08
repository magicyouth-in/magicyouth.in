/**
 * scripts/seed-admin.js
 * One-time script to create the MAIN_ADMIN account.
 *
 * Usage:
 *   node scripts/seed-admin.js
 *
 * Requirements:
 *   ADMIN_NAME    (optional, defaults to 'Main Administrator')
 *   ADMIN_EMAIL   - Main admin email address
 *   ADMIN_PASSWORD - Main admin initial password
 *   JWT_SECRET    - Required for server JWT signing (not used here, but validated)
 *   MONGODB_URI   - MongoDB connection string
 */

require('dotenv').config();
const mongoose  = require('mongoose');
const bcrypt    = require('bcryptjs');
const AdminUser = require('../database/models/AdminUser');

async function seedMainAdmin() {
  const uri           = process.env.MONGODB_URI;
  const adminEmail    = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;
  const adminName     = process.env.ADMIN_NAME || 'Main Administrator';

  if (!uri)           { console.error('[SEED] ERROR: MONGODB_URI is not set.'); process.exit(1); }
  if (!adminEmail)    { console.error('[SEED] ERROR: ADMIN_EMAIL is not set.'); process.exit(1); }
  if (!adminPassword) { console.error('[SEED] ERROR: ADMIN_PASSWORD is not set.'); process.exit(1); }

  await mongoose.connect(uri, { serverSelectionTimeoutMS: 10000 });
  console.log('[SEED] Connected to MongoDB.');

  // Check if a MAIN_ADMIN already exists
  const existing = await AdminUser.findOne({ role: 'MAIN_ADMIN' });
  if (existing) {
    console.log(`[SEED] MAIN_ADMIN already exists: ${existing.email}`);
    console.log('[SEED] To change the Main Admin email/password, manually update the database or use change-password.');
    await mongoose.disconnect();
    return;
  }

  // Check if email is already taken by a sub-admin
  const emailTaken = await AdminUser.findOne({ email: adminEmail.toLowerCase().trim() });
  if (emailTaken) {
    console.error(`[SEED] ERROR: Email "${adminEmail}" is already in use by another account (role: ${emailTaken.role}).`);
    await mongoose.disconnect();
    process.exit(1);
  }

  const passwordHash = await bcrypt.hash(adminPassword, 12);
  const admin = await AdminUser.create({
    name:         adminName,
    email:        adminEmail.toLowerCase().trim(),
    passwordHash,
    role:         'MAIN_ADMIN',
    assignedUnitIds: [],
    status:       'Active',
  });

  console.log('[SEED] ✓ MAIN_ADMIN created successfully.');
  console.log(`[SEED]   Name:  ${admin.name}`);
  console.log(`[SEED]   Email: ${admin.email}`);
  console.log('[SEED]   Password: (as set in ADMIN_PASSWORD)');
  console.log('[SEED] ⚠ Keep your .env credentials secure and never commit them to version control.');

  await mongoose.disconnect();
}

seedMainAdmin().catch(err => {
  console.error('[SEED] Fatal error:', err.message);
  process.exit(1);
});
