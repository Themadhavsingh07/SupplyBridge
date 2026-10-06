import { createClient, SupabaseClient } from '@supabase/supabase-js';

if (typeof window !== 'undefined') {
  throw new Error(
    'SECURITY ALERT: src/lib/supabase/admin.ts (SUPABASE_SERVICE_ROLE_KEY) MUST NEVER BE IMPORTED INTO BROWSER CLIENT CODE.'
  );
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

const isConfigured =
  supabaseUrl.startsWith('http') &&
  serviceRoleKey.length > 10 &&
  !serviceRoleKey.includes('your-supabase-service-role-key');

export function createAdminSupabaseClient(): SupabaseClient | null {
  if (!isConfigured) {
    return null;
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

export const supabaseAdmin = createAdminSupabaseClient();
