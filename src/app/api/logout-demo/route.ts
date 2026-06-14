import { NextResponse } from 'next/server';
import { DEMO_SESSION_COOKIE } from '@pablojtech/loyalty-shared-web/auth';
import { observeRequest } from '@pablojtech/loyalty-shared-web/metrics';
import { defaultLocale, isLocale } from '@pablojtech/loyalty-shared-web/i18n';

export async function POST(request: Request) {
  const startedAt = performance.now();
  const route = '/api/logout-demo';
  const formData = await request.formData();
  const rawLocale = String(formData.get('locale') ?? defaultLocale);
  const locale = isLocale(rawLocale) ? rawLocale : defaultLocale;

  const url = new URL(`/${locale}/login`, request.url);
  url.searchParams.set('status', 'logged-out');

  const response = NextResponse.redirect(url);
  response.cookies.set(DEMO_SESSION_COOKIE, '', {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 0,
  });

  observeRequest({ method: 'POST', route, statusCode: response.status, durationSeconds: (performance.now() - startedAt) / 1000 });
  return response;
}
