import { createBrowserClient } from '@supabase/ssr';
import type { SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://gzhcmypgymyxevzhszlz.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_z8reSTx6hAYl6fyuu4FVaA_vEReJAL7';

function getBrowserClient(): SupabaseClient {
  return createBrowserClient(supabaseUrl, supabaseAnonKey);
}

let _browserInstance: SupabaseClient | null = null;

export function getSupabaseBrowserClient(): SupabaseClient {
  if (typeof window === 'undefined') {
    return getBrowserClient();
  }
  if (!_browserInstance) {
    _browserInstance = getBrowserClient();
  }
  return _browserInstance;
}

export const supabaseBrowser: SupabaseClient = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    const instance = getSupabaseBrowserClient();
    const value = (instance as any)[prop];
    return typeof value === 'function' ? value.bind(instance) : value;
  },
});
