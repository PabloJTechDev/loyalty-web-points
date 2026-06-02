import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { DEMO_SESSION_COOKIE } from '@/lib/auth/session';
import { defaultLocale, isLocale } from '@/lib/i18n/config';

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  const segments = pathname.split('/').filter(Boolean);
  const first = segments[0];

  if (first && isLocale(first)) {
    const second = segments[1];
    const protectedRoutes = new Set(['authenticated']);

    if (second && protectedRoutes.has(second) && !request.cookies.get(DEMO_SESSION_COOKIE)?.value) {
      const url = request.nextUrl.clone();
      url.pathname = `/${first}/login`;
      url.searchParams.set('status', 'auth-required');
      return NextResponse.redirect(url);
    }

    return NextResponse.next();
  }

  const url = request.nextUrl.clone();
  url.pathname = `/${defaultLocale}${pathname === '/' ? '' : pathname}`;
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ['/((?!_next|.*\\..*).*)'],
};
