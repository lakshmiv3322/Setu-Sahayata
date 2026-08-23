import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

function getSupabaseClient(): SupabaseClient {
  if (!supabaseUrl || !supabaseAnonKey) {
    const missing = [
      !supabaseUrl && 'NEXT_PUBLIC_SUPABASE_URL',
      !supabaseAnonKey && 'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    ]
      .filter(Boolean)
      .join(' and ');
    throw new Error(
      `[Setu Sahayata] Missing environment variable(s): ${missing}. Please set them in your .env file or hosting platform settings (Vercel/Netlify).`
    );
  }
  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  });
}

let _supabaseInstance: SupabaseClient | null = null;

/**
 * Lazy Supabase client proxy.
 * Prevents build-time module evaluation failures during `next build` static page collection
 * while still throwing loudly at runtime if environment variables are missing when called.
 */
export const supabase: SupabaseClient = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    if (!_supabaseInstance) {
      _supabaseInstance = getSupabaseClient();
    }
    const value = (_supabaseInstance as any)[prop];
    return typeof value === 'function' ? value.bind(_supabaseInstance) : value;
  },
});
