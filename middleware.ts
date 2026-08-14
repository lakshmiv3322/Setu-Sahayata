import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const PROTECTED_ROUTES = ['/dashboard', '/discover', '/apply', '/de-jargonifier'];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const isProtected = PROTECTED_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(route + '/')
  );

  if (!isProtected) return NextResponse.next();

  // Hackathon Demo Mode: Bypass Supabase auth cookie check
  // so the judges can click through the demo without needing a real database.
  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/discover/:path*', '/apply/:path*', '/de-jargonifier/:path*'],
};
