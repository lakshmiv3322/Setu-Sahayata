import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

/**
 * Routes that require a valid session. A missing or expired session redirects
 * to /login?next=<path> so the user lands back here after signing in.
 */
const PROTECTED_ROUTES = [
  '/dashboard',
  '/discover',
  '/apply',
  '/de-jargonifier',
  '/appeal',
  '/settings',
  '/admin',
];

/**
 * Routes that additionally require is_admin === true on the user's profile.
 * Non-admins with a valid session are redirected to /dashboard with a query
 * param that the dashboard reads to surface an access-denied toast.
 */
const ADMIN_ROUTES = ['/admin'];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const isProtected = PROTECTED_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(route + '/')
  );

  const isAdminRoute = ADMIN_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(route + '/')
  );

  let res = NextResponse.next({
    request: {
      headers: req.headers,
    },
  });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    if (!isProtected) return res;
    const loginUrl = req.nextUrl.clone();
    loginUrl.pathname = '/login';
    loginUrl.searchParams.set('next', pathname);
    return NextResponse.redirect(loginUrl);
  }

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      get(name: string) {
        return req.cookies.get(name)?.value;
      },
      set(name: string, value: string, options: CookieOptions) {
        req.cookies.set({ name, value, ...options });
        res = NextResponse.next({
          request: {
            headers: req.headers,
          },
        });
        res.cookies.set({ name, value, ...options });
      },
      remove(name: string, options: CookieOptions) {
        req.cookies.set({ name, value: '', ...options });
        res = NextResponse.next({
          request: {
            headers: req.headers,
          },
        });
        res.cookies.set({ name, value: '', ...options });
      },
    },
  });

  const { data: { session } } = await supabase.auth.getSession();

  // --- 1. Session guard (all protected routes) ---
  if (isProtected && !session) {
    const loginUrl = req.nextUrl.clone();
    loginUrl.pathname = '/login';
    loginUrl.searchParams.set('next', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // --- 2. Admin role guard (server-side, not just client-side) ---
  if (isAdminRoute && session) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('user_id', session.user.id)
      .maybeSingle();

    if (!profile?.is_admin) {
      const dashboardUrl = req.nextUrl.clone();
      dashboardUrl.pathname = '/dashboard';
      dashboardUrl.searchParams.set('toast', 'access_denied');
      return NextResponse.redirect(dashboardUrl);
    }
  }

  return res;
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/discover/:path*',
    '/apply/:path*',
    '/de-jargonifier/:path*',
    '/appeal/:path*',
    '/settings/:path*',
    '/admin/:path*',
  ],
};
