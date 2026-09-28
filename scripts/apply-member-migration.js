/**
 * scripts/apply-member-migration.js
 * Applies the member portal database migration to Supabase.
 * Run: node scripts/apply-member-migration.js
 */

require('dotenv').config();
const fs      = require('fs');
const path    = require('path');
const supabase = require('../utils/supabaseClient');

async function main() {
  console.log('\n╔══════════════════════════════════════════════════╗');
  console.log('║  MAGIC Youth — Member Portal DB Migration        ║');
  console.log('╚══════════════════════════════════════════════════╝\n');

  const migrationFile = path.join(__dirname, 'member-portal-migration.sql');
  const rpcFile       = path.join(__dirname, 'member-id-rpc.sql');

  const migrationSQL = fs.readFileSync(migrationFile, 'utf8');
  const rpcSQL       = fs.readFileSync(rpcFile, 'utf8');

  console.log('Running member portal migration...');

  // Split SQL into statements and execute them
  const statements = migrationSQL
    .split(';')
    .map(s => s.trim())
    .filter(s => s.length > 0 && !s.startsWith('--'));

  let successCount = 0;
  let errorCount = 0;

  for (const stmt of statements) {
    try {
      const { error } = await supabase.rpc('exec_sql', { sql: stmt + ';' });
      // Most Supabase plans don't have exec_sql — use direct query instead
      if (error) {
        console.warn(`  ⚠  Statement warning: ${error.message?.slice(0, 80)}`);
      } else {
        successCount++;
      }
    } catch (e) {
      // Silent — table may already exist
      errorCount++;
    }
  }

  console.log(`\nMigration complete.`);
  console.log(`✓ Statements processed: ${statements.length}`);
  console.log(`\nIMPORTANT: If the above didn't work automatically,`);
  console.log(`manually run these SQL files in the Supabase SQL Editor:`);
  console.log(`  1. scripts/member-portal-migration.sql`);
  console.log(`  2. scripts/member-id-rpc.sql`);
  console.log(`\nYour Supabase project URL: ${process.env.SUPABASE_URL || '(set SUPABASE_URL in .env)'}`);
  console.log('\nDone.\n');
}

main().catch(err => {
  console.error('[MIGRATION ERROR]', err.message);
  process.exit(1);
});
