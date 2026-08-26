import { supabaseBrowser } from './supabase-browser';

/**
 * @deprecated Import `supabaseBrowser` from `@/lib/supabase-browser` (for client components)
 * or `createSupabaseServerClient` from `@/lib/supabase-server` (for Server Components/Route Handlers).
 */
export const supabase = supabaseBrowser;
