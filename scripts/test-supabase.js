/**
 * Supabase Connection Diagnostic Script
 * Run: node scripts/test-supabase.js
 */

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
};

function log(color, message) {
  console.log(`${color}${message}${colors.reset}`);
}

async function testSupabaseConnection() {
  log(colors.cyan, '\n🔍 Testing Supabase Connection...\n');

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    log(colors.red, '❌ Missing required environment variables.');
    process.exit(1);
  }

  log(colors.green, `✅ URL: ${supabaseUrl}`);
  log(colors.green, `✅ ANON KEY: [SET]`);
  if (supabaseServiceKey) {
    log(colors.green, `✅ SERVICE ROLE KEY: [SET]`);
  }

  // Force IPv4 to avoid Node TLS/IPv6 edge issues
  process.env.NODE_OPTIONS = '--dns-result-order=ipv4first';

  log(colors.cyan, '\n2️⃣ Testing ANON connection...');

  try {
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: { persistSession: false }
    });

    const { data, error } = await supabase
      .from('places')
      .select('id')
      .limit(1);

    if (error) {
      log(colors.red, `❌ Query error: ${error.message}`);
      return;
    }

    log(colors.green, '✅ ANON key connection successful.');
  } catch (err) {
    log(colors.red, `❌ Connection failed: ${err.message}`);
    return;
  }

  if (supabaseServiceKey) {
    log(colors.cyan, '\n3️⃣ Testing SERVICE ROLE connection...');

    try {
      const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
        auth: { persistSession: false }
      });

      const { error } = await supabaseAdmin
        .from('places')
        .select('id')
        .limit(1);

      if (error) {
        log(colors.red, `❌ Service role error: ${error.message}`);
        return;
      }

      log(colors.green, '✅ SERVICE ROLE key works.');
    } catch (err) {
      log(colors.red, `❌ Service role connection failed: ${err.message}`);
      return;
    }
  }

  log(colors.green, '\n✨ Supabase connection is working properly.\n');
}

testSupabaseConnection().catch((err) => {
  log(colors.red, 'Unexpected error:');
  console.error(err);
  process.exit(1);
});