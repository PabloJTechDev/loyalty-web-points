import { NextResponse } from 'next/server';
import { defaultLocale, isLocale } from '@/lib/i18n/config';

const bffBaseUrl = process.env.BFF_CUSTOMER_BASE_URL ?? 'http://localhost:3002';

export async function POST(request: Request) {
  const formData = await request.formData();
  const rawLocale = String(formData.get('locale') ?? defaultLocale);
  const locale = isLocale(rawLocale) ? rawLocale : defaultLocale;
  const email = String(formData.get('email') ?? '').trim();

  try {
    const response = await fetch(`${bffBaseUrl}/api/v1/customer/enrollment`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
      body: JSON.stringify({ email }),
    });

    if (!response.ok) {
      return NextResponse.redirect(new URL(`/${locale}/enroll?status=error`, request.url));
    }

    const payload = (await response.json()) as {
      transactionId: string;
      verification?: { emailHash?: string };
    };

    const url = new URL(`/${locale}/enroll/success`, request.url);
    url.searchParams.set('transactionId', payload.transactionId);
    if (payload.verification?.emailHash) {
      url.searchParams.set('emailHash', payload.verification.emailHash);
    }

    return NextResponse.redirect(url);
  } catch {
    return NextResponse.redirect(new URL(`/${locale}/enroll?status=error`, request.url));
  }
}
