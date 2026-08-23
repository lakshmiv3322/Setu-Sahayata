import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const PROTECTED_ROUTES = ['/dashboard', '/discover', '/apply', '/de-jargonifier'];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const isProtected = PROTECTED_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(route + '/')
  );

  if (!isProtected) return NextResponse.next();

  // Supabase auth stores session tokens in cookies starting with sb- or containing auth-token
  const allCookies = req.cookies.getAll();
  const hasAuthCookie = allCookies.some(
    (cookie) => cookie.name.startsWith('sb-') || cookie.name.includes('auth-token')
  );

  if (!hasAuthCookie) {
    const loginUrl = req.nextUrl.clone();
    loginUrl.pathname = '/login';
    loginUrl.searchParams.set('next', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/discover/:path*', '/apply/:path*', '/de-jargonifier/:path*'],
};
