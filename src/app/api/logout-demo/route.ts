import { NextResponse } from 'next/server';
import { DEMO_SESSION_COOKIE } from '@/lib/auth/session';
import { defaultLocale, isLocale } from '@/lib/i18n/config';

export async function POST(request: Request) {
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

  return response;
}
