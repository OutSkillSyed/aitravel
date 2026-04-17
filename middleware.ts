import { NextResponse, type NextRequest } from 'next/server';

import { SESSION_COOKIE } from '@/lib/auth/cookie';

const PROTECTED_PREFIXES = ['/profile', '/checkout'];

export function middleware(req: NextRequest) {
  const needsAuth = PROTECTED_PREFIXES.some((p) => req.nextUrl.pathname.startsWith(p));
  if (!needsAuth) return NextResponse.next();

  const hasSession = Boolean(req.cookies.get(SESSION_COOKIE)?.value);
  if (hasSession) return NextResponse.next();

  const url = req.nextUrl.clone();
  url.pathname = '/sign-in';
  url.searchParams.set('next', req.nextUrl.pathname);
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ['/profile/:path*', '/checkout/:path*'],
};
