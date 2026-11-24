import { supabase, supabaseAdmin } from '@/lib/supabase';

// Re-export standard clients to avoid duplicate configs
export const supabaseClient = supabase;
export { supabaseAdmin };

export type Database = any;

