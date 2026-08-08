/**
 * utils/supabaseClient.js
 * Server-side Supabase client for MAGIC Youth Express backend.
 * Uses SUPABASE_SERVICE_ROLE_KEY for administrative backend database & storage operations.
 * NEVER import this client in React frontend code.
 */

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!supabaseUrl || !supabaseServiceKey) {
  console.warn('[Supabase] ⚠ Warning: SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY missing in environment variables.');
}

const supabase = createClient(
  supabaseUrl,
  supabaseServiceKey,
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  }
);

module.exports = supabase;
