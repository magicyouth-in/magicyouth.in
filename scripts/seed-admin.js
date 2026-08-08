/**
 * scripts/seed-admin.js
 * Dedicated one-time seed script for single MAIN_ADMIN account in Supabase.
 * Reads ADMIN_EMAIL and ADMIN_PASSWORD from .env.
 */

require('dotenv').config();
const bcrypt = require('bcryptjs');
const supabase = require('../utils/supabaseClient');

async function seedAdmin() {
  console.log('--- MAGIC YOUTH MAIN ADMIN SEEDING ---');

  const email = (process.env.ADMIN_EMAIL || 'admin@magicyouth.in').toLowerCase().trim();
  const password = process.env.ADMIN_PASSWORD || 'MagicYouth@Admin2026';
  const name = process.env.ADMIN_NAME || 'Main Admin';

  if (!email || !password) {
    console.error('[SEED ERROR] ADMIN_EMAIL and ADMIN_PASSWORD must be defined in .env');
    process.exit(1);
  }

  // Check if main admin already exists
  const { data: existingAdmin, error: fetchError } = await supabase
    .from('admin_users')
    .select('id, email, role')
    .eq('email', email)
    .single();

  if (existingAdmin) {
    console.log(`[SEED] Admin account (${email}) already exists in Supabase. Skipping seed.`);
    process.exit(0);
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const { data: newAdmin, error: insertError } = await supabase
    .from('admin_users')
    .insert([{
      name,
      email,
      password_hash: passwordHash,
      role: 'MAIN_ADMIN',
      status: 'Active',
    }])
    .select()
    .single();

  if (insertError) {
    console.error('[SEED ERROR] Failed to seed main admin:', insertError.message);
    process.exit(1);
  }

  console.log(`[SEED SUCCESS] Seeded MAIN_ADMIN account (${newAdmin.email}) ✓`);
  process.exit(0);
}

seedAdmin().catch(err => {
  console.error('[SEED FATAL]', err.message);
  process.exit(1);
});
