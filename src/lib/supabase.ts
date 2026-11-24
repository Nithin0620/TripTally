// ============================================
// Supabase Client
// ============================================

import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Client-side Supabase instance (browser safe)
export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder'
);

let _supabaseAdmin: SupabaseClient | null = null;

/**
 * Lazily initialize server-side Supabase admin client.
 * This ensures client-side bundles importing this module will not crash
 * due to missing SUPABASE_SERVICE_ROLE_KEY.
 */
export const getSupabaseAdmin = (): SupabaseClient => {
  if (!_supabaseAdmin) {
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!serviceRoleKey) {
      throw new Error('Missing env.SUPABASE_SERVICE_ROLE_KEY (server-only)');
    }
    _supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);
  }
  return _supabaseAdmin;
};

// Export proxy for backwards-compatibility with `supabaseAdmin.from(...)`, `supabaseAdmin.rpc(...)`
export const supabaseAdmin = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    const admin = getSupabaseAdmin();
    const value = (admin as any)[prop];
    if (typeof value === 'function') {
      return value.bind(admin);
    }
    return value;
  },
});

export default supabase;
