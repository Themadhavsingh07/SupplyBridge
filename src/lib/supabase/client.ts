import { createBrowserSupabaseClient, supabaseBrowser } from './browser';

export function getSupabaseBrowserClient() {
  return createBrowserSupabaseClient() || (supabaseBrowser as any);
}
