/**
 * Supabase Connection Diagnostic Script
 * Run this to test your Supabase connection: node scripts/test-supabase.js
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

  // Step 1: Check environment variables
  log(colors.cyan, '1️⃣  Checking environment variables...');
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl) {
    log(colors.red, '❌ NEXT_PUBLIC_SUPABASE_URL is missing!');
    log(colors.yellow, '   Add it to your .env.local file');
    return;
  }
  log(colors.green, `✅ NEXT_PUBLIC_SUPABASE_URL: ${supabaseUrl}`);

  if (!supabaseAnonKey) {
    log(colors.red, '❌ NEXT_PUBLIC_SUPABASE_ANON_KEY is missing!');
    return;
  }
  log(colors.green, '✅ NEXT_PUBLIC_SUPABASE_ANON_KEY: [SET]');

  if (supabaseServiceKey) {
    log(colors.green, '✅ SUPABASE_SERVICE_ROLE_KEY: [SET]');
  } else {
    log(colors.yellow, '⚠️  SUPABASE_SERVICE_ROLE_KEY: [NOT SET - using ANON_KEY]');
  }

  // Step 2: Test URL format
  log(colors.cyan, '\n2️⃣  Validating URL format...');
  
  if (!supabaseUrl.includes('supabase.co')) {
    log(colors.red, '❌ Invalid Supabase URL format!');
    log(colors.yellow, '   Expected format: https://YOUR-PROJECT.supabase.co');
    return;
  }
  
  const projectId = supabaseUrl.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1];
  if (projectId) {
    log(colors.green, `✅ Project ID: ${projectId}`);
  }

  // Step 3: Test connection with ANON key
  log(colors.cyan, '\n3️⃣  Testing connection with ANON key...');
  
  try {
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    
    const { data, error } = await supabase
      .from('places')
      .select('id, name')
      .limit(1);

    if (error) {
      // Check if it's an HTML error (SSL/Cloudflare)
      const errorStr = error.message || String(error);
      if (errorStr.includes('<!DOCTYPE html>') || errorStr.includes('<html')) {
        log(colors.red, '❌ SSL HANDSHAKE FAILED (Error 525)');
        log(colors.yellow, '\n📋 Possible causes:');
        log(colors.yellow, '   1. Supabase project is PAUSED (common on free tier)');
        log(colors.yellow, '   2. Invalid project URL');
        log(colors.yellow, '   3. Temporary Supabase outage');
        log(colors.cyan, '\n🔧 Solutions:');
        log(colors.cyan, '   • Visit https://supabase.com/dashboard');
        log(colors.cyan, '   • Check if your project is paused');
        log(colors.cyan, '   • Restore/resume the project if needed');
        log(colors.cyan, '   • Verify the project URL matches your .env.local');
        return;
      }

      log(colors.red, `❌ Query failed: ${error.message}`);
      console.error(error);
      return;
    }

    if (data) {
      log(colors.green, `✅ Successfully connected! Found ${data.length} place(s)`);
      if (data.length > 0) {
        log(colors.green, `   Example: ${data[0].name} (ID: ${data[0].id})`);
      }
    }
  } catch (error) {
    const errorStr = error.message || String(error);
    
    if (errorStr.includes('<!DOCTYPE html>')) {
      log(colors.red, '❌ SSL CONNECTION ERROR');
      log(colors.yellow, '\nYour Supabase project appears to be paused or inactive.');
      log(colors.cyan, '\nAction required:');
      log(colors.cyan, '1. Go to https://supabase.com/dashboard');
      log(colors.cyan, '2. Find your project: ' + projectId);
      log(colors.cyan, '3. Resume/restore the project if paused');
    } else {
      log(colors.red, '❌ Connection error: ' + error.message);
      console.error(error);
    }
    return;
  }

  // Step 4: Test SERVICE_ROLE key if available
  if (supabaseServiceKey) {
    log(colors.cyan, '\n4️⃣  Testing connection with SERVICE ROLE key...');
    
    try {
      const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
      
      const { data, error } = await supabaseAdmin
        .from('places')
        .select('count')
        .limit(1);

      if (error) {
        log(colors.red, `❌ Service role query failed: ${error.message}`);
      } else {
        log(colors.green, '✅ Service role key works!');
      }
    } catch (error) {
      log(colors.red, '❌ Service role error: ' + error.message);
    }
  }

  // Summary
  log(colors.green, '\n✨ Diagnostic complete!');
  log(colors.cyan, '\nIf you see SSL errors above, your Supabase project needs attention.');
  log(colors.cyan, 'Otherwise, your configuration is working correctly.\n');
}

// Run the test
testSupabaseConnection().catch((error) => {
  log(colors.red, '\n💥 Unexpected error:');
  console.error(error);
  process.exit(1);
});
