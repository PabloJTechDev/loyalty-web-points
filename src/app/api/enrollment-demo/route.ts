import { NextResponse } from 'next/server';
import {
  DEMO_SESSION_COOKIE,
  DEMO_SESSION_MAX_AGE_SECONDS,
  encodeDemoSession,
} from '@pablojtech/loyalty-shared-web/auth';
import {
  businessTransactionsTotal,
  observeRequest,
} from '@pablojtech/loyalty-shared-web/metrics';
import { defaultLocale, isLocale } from '@pablojtech/loyalty-shared-web/i18n';

const bffBaseUrl = process.env.BFF_POINTS_BASE_URL ?? 'http://localhost:3002';

export async function POST(request: Request) {
  const startedAt = performance.now();
  const route = '/api/enrollment-demo';
  const formData = await request.formData();
  const rawLocale = String(formData.get('locale') ?? defaultLocale);
  const locale = isLocale(rawLocale) ? rawLocale : defaultLocale;
  const email = String(formData.get('email') ?? '').trim();
  const password = String(formData.get('password') ?? '');
  const confirmPassword = String(formData.get('confirmPassword') ?? '');

  try {
    const response = await fetch(`${bffBaseUrl}/api/v1/customer/enrollment`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
      body: JSON.stringify({ email, password, confirmPassword }),
    });

    if (!response.ok) {
      const redirect = NextResponse.redirect(new URL(`/${locale}/enroll?status=error`, request.url));
      observeRequest({ method: 'POST', route, statusCode: redirect.status, durationSeconds: (performance.now() - startedAt) / 1000 });
      businessTransactionsTotal.inc({ flow: 'enrollment', outcome: 'error' });
      return redirect;
    }

    const payload = (await response.json()) as {
      transactionId: string;
      verification?: { emailHash?: string };
      passwordSetup?: { requestId?: string };
    };

    const requestId = payload.passwordSetup?.requestId?.trim();

    if (!requestId) {
      const url = new URL(`/${locale}/enroll/success`, request.url);
      url.searchParams.set('transactionId', payload.transactionId);
      if (payload.verification?.emailHash) {
        url.searchParams.set('emailHash', payload.verification.emailHash);
      }
      const redirect = NextResponse.redirect(url);
      observeRequest({ method: 'POST', route, statusCode: redirect.status, durationSeconds: (performance.now() - startedAt) / 1000 });
      businessTransactionsTotal.inc({ flow: 'enrollment', outcome: 'success_without_login' });
      return redirect;
    }

    const loginResponse = await fetch(`${bffBaseUrl}/api/v1/customer/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
      body: JSON.stringify({ requestId }),
    });

    if (!loginResponse.ok) {
      const url = new URL(`/${locale}/enroll/success`, request.url);
      url.searchParams.set('transactionId', payload.transactionId);
      if (payload.verification?.emailHash) {
        url.searchParams.set('emailHash', payload.verification.emailHash);
      }
      url.searchParams.set('requestId', requestId);
      const redirect = NextResponse.redirect(url);
      observeRequest({ method: 'POST', route, statusCode: redirect.status, durationSeconds: (performance.now() - startedAt) / 1000 });
      businessTransactionsTotal.inc({ flow: 'enrollment', outcome: 'success_login_pending' });
      return redirect;
    }

    const loginPayload = (await loginResponse.json()) as {
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

    const url = new URL(`/${locale}/enroll/success`, request.url);
    url.searchParams.set('transactionId', payload.transactionId);
    url.searchParams.set('requestId', loginPayload.requestId);
    url.searchParams.set('loginId', loginPayload.loginId);
    if (payload.verification?.emailHash) {
      url.searchParams.set('emailHash', payload.verification.emailHash);
    }

    const redirect = NextResponse.redirect(url);
    redirect.cookies.set(DEMO_SESSION_COOKIE, encodeDemoSession({
      loginId: loginPayload.loginId,
      fullName: loginPayload.customerSnapshot?.fullName ?? 'Customer Demo',
      tier: loginPayload.customerSnapshot?.tierName ?? 'Unknown tier',
      customerId: loginPayload.customerSnapshot?.customerId,
      maskedEmail: loginPayload.customerSnapshot?.maskedEmail,
    }), {
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
      secure: process.env.NODE_ENV === 'production',
      maxAge: DEMO_SESSION_MAX_AGE_SECONDS,
    });

    observeRequest({ method: 'POST', route, statusCode: redirect.status, durationSeconds: (performance.now() - startedAt) / 1000 });
    businessTransactionsTotal.inc({ flow: 'enrollment', outcome: 'success_auto_login' });
    return redirect;
  } catch {
    const redirect = NextResponse.redirect(new URL(`/${locale}/enroll?status=error`, request.url));
    observeRequest({ method: 'POST', route, statusCode: redirect.status, durationSeconds: (performance.now() - startedAt) / 1000 });
    businessTransactionsTotal.inc({ flow: 'enrollment', outcome: 'error' });
    return redirect;
  }
}
