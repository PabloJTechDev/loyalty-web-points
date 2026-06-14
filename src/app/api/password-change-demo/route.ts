import { NextResponse } from 'next/server';
import {
  businessTransactionsTotal,
  observeRequest,
} from '@pablojtech/loyalty-shared-web/metrics';
import { defaultLocale, isLocale } from '@pablojtech/loyalty-shared-web/i18n';

const bffBaseUrl = process.env.BFF_POINTS_BASE_URL ?? 'http://localhost:3002';

export async function POST(request: Request) {
  const startedAt = performance.now();
  const route = '/api/password-change-demo';
  const formData = await request.formData();
  const rawLocale = String(formData.get('locale') ?? defaultLocale);
  const locale = isLocale(rawLocale) ? rawLocale : defaultLocale;
  const transactionId = String(formData.get('transactionId') ?? '').trim();

  if (!transactionId) {
    const redirect = NextResponse.redirect(new URL(`/${locale}/password-change?status=missing-transaction`, request.url));
    observeRequest({ method: 'POST', route, statusCode: redirect.status, durationSeconds: (performance.now() - startedAt) / 1000 });
    businessTransactionsTotal.inc({ flow: 'password_change', outcome: 'controlled_error' });
    return redirect;
  }

  try {
    const response = await fetch(`${bffBaseUrl}/api/v1/customer/password-change`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
      body: JSON.stringify({ transactionId }),
    });

    if (response.status === 404) {
      const redirect = NextResponse.redirect(
        new URL(`/${locale}/password-change?status=enrollment-not-found&transactionId=${encodeURIComponent(transactionId)}`, request.url),
      );
      observeRequest({ method: 'POST', route, statusCode: redirect.status, durationSeconds: (performance.now() - startedAt) / 1000 });
      businessTransactionsTotal.inc({ flow: 'password_change', outcome: 'controlled_error' });
      return redirect;
    }

    if (!response.ok) {
      const redirect = NextResponse.redirect(
        new URL(`/${locale}/password-change?status=error&transactionId=${encodeURIComponent(transactionId)}`, request.url),
      );
      observeRequest({ method: 'POST', route, statusCode: redirect.status, durationSeconds: (performance.now() - startedAt) / 1000 });
      businessTransactionsTotal.inc({ flow: 'password_change', outcome: 'error' });
      return redirect;
    }

    const payload = (await response.json()) as {
      requestId: string;
      transactionId: string;
    };

    const url = new URL(`/${locale}/password-change/success`, request.url);
    url.searchParams.set('requestId', payload.requestId);
    url.searchParams.set('transactionId', payload.transactionId);

    const redirect = NextResponse.redirect(url);
    observeRequest({ method: 'POST', route, statusCode: redirect.status, durationSeconds: (performance.now() - startedAt) / 1000 });
    businessTransactionsTotal.inc({ flow: 'password_change', outcome: 'success' });
    return redirect;
  } catch {
    const redirect = NextResponse.redirect(
      new URL(`/${locale}/password-change?status=error&transactionId=${encodeURIComponent(transactionId)}`, request.url),
    );
    observeRequest({ method: 'POST', route, statusCode: redirect.status, durationSeconds: (performance.now() - startedAt) / 1000 });
    businessTransactionsTotal.inc({ flow: 'password_change', outcome: 'error' });
    return redirect;
  }
}
