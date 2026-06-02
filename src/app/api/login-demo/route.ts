import { NextResponse } from 'next/server';
import {
  DEMO_SESSION_COOKIE,
  DEMO_SESSION_MAX_AGE_SECONDS,
  encodeDemoSession,
} from '@/lib/auth/session';
import { defaultLocale, isLocale } from '@/lib/i18n/config';

const bffBaseUrl = process.env.BFF_CUSTOMER_BASE_URL ?? 'http://localhost:3002';

export async function POST(request: Request) {
  const formData = await request.formData();
  const rawLocale = String(formData.get('locale') ?? defaultLocale);
  const locale = isLocale(rawLocale) ? rawLocale : defaultLocale;
  const requestId = String(formData.get('requestId') ?? '').trim();

  if (!requestId) {
    return NextResponse.redirect(new URL(`/${locale}/login?status=missing-request`, request.url));
  }

  try {
    const response = await fetch(`${bffBaseUrl}/api/v1/customer/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
      body: JSON.stringify({ requestId }),
    });

    if (response.status === 404) {
      return NextResponse.redirect(
        new URL(`/${locale}/login?status=password-change-not-found&requestId=${encodeURIComponent(requestId)}`, request.url),
      );
    }

    if (!response.ok) {
      return NextResponse.redirect(
        new URL(`/${locale}/login?status=error&requestId=${encodeURIComponent(requestId)}`, request.url),
      );
    }

    const payload = (await response.json()) as {
      loginId: string;
      requestId: string;
      transactionId: string;
      customerSnapshot?: {
        customerId?: string;
        fullName?: string;
        maskedEmail?: string;
        tierName?: string;
      };
    };

    const url = new URL(`/${locale}/login/success`, request.url);
    url.searchParams.set('loginId', payload.loginId);
    url.searchParams.set('requestId', payload.requestId);
    url.searchParams.set('transactionId', payload.transactionId);

    const responseRedirect = NextResponse.redirect(url);
    responseRedirect.cookies.set(DEMO_SESSION_COOKIE, encodeDemoSession({
      loginId: payload.loginId,
      fullName: payload.customerSnapshot?.fullName ?? 'Customer Demo',
      tier: payload.customerSnapshot?.tierName ?? 'Unknown tier',
      customerId: payload.customerSnapshot?.customerId,
      maskedEmail: payload.customerSnapshot?.maskedEmail,
    }), {
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
      secure: process.env.NODE_ENV === 'production',
      maxAge: DEMO_SESSION_MAX_AGE_SECONDS,
    });

    return responseRedirect;
  } catch {
    return NextResponse.redirect(
      new URL(`/${locale}/login?status=error&requestId=${encodeURIComponent(requestId)}`, request.url),
    );
  }
}
