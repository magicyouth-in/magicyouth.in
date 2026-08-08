/**
 * scripts/apply-supabase-schema.js
 * Applies the 001_initial_schema.sql migration to your Supabase PostgreSQL project.
 */

require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { Client } = require('pg');
const supabase = require('../utils/supabaseClient');

async function applySchema() {
  console.log('=== APPLYING SUPABASE POSTGRESQL MIGRATION SCHEMA ===\n');

  const sqlFile = path.join(__dirname, '..', 'supabase', 'migrations', '001_initial_schema.sql');
  const sql = fs.readFileSync(sqlFile, 'utf8');

  console.log('Testing connection to Supabase PostgreSQL...');

  const dbUrl = process.env.DATABASE_URL || process.env.SUPABASE_DB_URL;
  if (!dbUrl) {
    console.error('DATABASE_URL is not set in environment variables.');
    return;
  }

  let client;
  try {
    client = new Client({
      connectionString: dbUrl,
      ssl: { rejectUnauthorized: false }
    });
    await client.connect();
    console.log('[PostgreSQL] Connected to Supabase DB via pg ✓');
    await client.query(sql);
    console.log('[PostgreSQL] Successfully executed 001_initial_schema.sql ✓');
    await client.end();
    return;
  } catch (pgErr) {
    console.warn('[PostgreSQL pg Direct Note]', pgErr.message);
    if (client) await client.end().catch(() => {});
  }

  console.log('Executing schema table creation queries via Supabase REST client...');

  const statements = sql
    .split(';')
    .map(s => s.trim())
    .filter(s => s.length > 0 && !s.startsWith('--'));

  for (const stmt of statements) {
    try {
      await supabase.rpc('exec_sql', { query: stmt });
    } catch (e) {
      // Ignore individually
    }
  }

  console.log('Schema application attempt completed.');
}

applySchema().catch(err => {
  console.error('[SCHEMA APPLY ERROR]', err.message);
});
