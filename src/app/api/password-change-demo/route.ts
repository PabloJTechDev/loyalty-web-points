import { NextResponse } from 'next/server';
import { defaultLocale, isLocale } from '@/lib/i18n/config';

const bffBaseUrl = process.env.BFF_CUSTOMER_BASE_URL ?? 'http://localhost:3002';

export async function POST(request: Request) {
  const formData = await request.formData();
  const rawLocale = String(formData.get('locale') ?? defaultLocale);
  const locale = isLocale(rawLocale) ? rawLocale : defaultLocale;
  const transactionId = String(formData.get('transactionId') ?? '').trim();

  if (!transactionId) {
    return NextResponse.redirect(new URL(`/${locale}/password-change?status=missing-transaction`, request.url));
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
      return NextResponse.redirect(
        new URL(`/${locale}/password-change?status=enrollment-not-found&transactionId=${encodeURIComponent(transactionId)}`, request.url),
      );
    }

    if (!response.ok) {
      return NextResponse.redirect(
        new URL(`/${locale}/password-change?status=error&transactionId=${encodeURIComponent(transactionId)}`, request.url),
      );
    }

    const payload = (await response.json()) as {
      requestId: string;
      transactionId: string;
    };

    const url = new URL(`/${locale}/password-change/success`, request.url);
    url.searchParams.set('requestId', payload.requestId);
    url.searchParams.set('transactionId', payload.transactionId);

    return NextResponse.redirect(url);
  } catch {
    return NextResponse.redirect(
      new URL(`/${locale}/password-change?status=error&transactionId=${encodeURIComponent(transactionId)}`, request.url),
    );
  }
}
