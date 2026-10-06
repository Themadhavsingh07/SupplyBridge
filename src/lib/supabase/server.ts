import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

const isConfigured =
  supabaseUrl.startsWith('http') &&
  supabaseAnonKey.length > 10 &&
  !supabaseUrl.includes('your-supabase-project');

export function createServerSupabaseClient(): SupabaseClient | null {
  if (!isConfigured) {
    return null;
  }

  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false,
    },
  });
}

export const supabaseServer = createServerSupabaseClient();
