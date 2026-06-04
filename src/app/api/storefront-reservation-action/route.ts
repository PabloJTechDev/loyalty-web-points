import { NextResponse } from 'next/server';
import { defaultLocale, isLocale } from '@/lib/i18n/config';
import {
  applyStorefrontReservationAction,
  getStorefrontQuote,
} from '@/lib/api/storefront';
import type { StorefrontReserveResponse } from '@/lib/storefront/reserve';

function parseItems(rawItems: string) {
  try {
    const parsed = JSON.parse(rawItems) as Array<{ productId?: string; quantity?: number }>;
    return Array.isArray(parsed)
      ? parsed
          .map((item) => ({
            productId: String(item?.productId ?? '').trim(),
            quantity: Number(item?.quantity ?? 0),
          }))
          .filter((item) => item.productId.length > 0 && Number.isFinite(item.quantity) && item.quantity > 0)
      : [];
  } catch {
    return [];
  }
}

function parseReservation(formData: FormData, quote: Awaited<ReturnType<typeof getStorefrontQuote>>): StorefrontReserveResponse {
  return {
    source: String(formData.get('source') ?? 'checkout-feedback').trim() || 'checkout-feedback',
    status: String(formData.get('reserveStatus') ?? '').trim() as StorefrontReserveResponse['status'],
    reservationId: String(formData.get('reservationId') ?? '').trim() || undefined,
    requestedPoints: Number(formData.get('requestedPoints') ?? quote.summary.requestedPoints) || 0,
    reservedPoints: Number(formData.get('reservedPoints') ?? quote.summary.appliedPoints) || 0,
    coveredUsd: Number(formData.get('coveredUsd') ?? quote.summary.appliedUsd) || 0,
    payableUsd: Number(formData.get('payableUsd') ?? quote.summary.remainingUsd) || 0,
    quote,
    message: String(formData.get('message') ?? '').trim() || 'Checkout reservation loaded from current feedback.',
    integrations: {
      storefront: {
        available: false,
        error: String(formData.get('integrationError') ?? '').trim() || undefined,
      },
    },
  };
}

export async function POST(request: Request) {
  const formData = await request.formData();
  const rawLocale = String(formData.get('locale') ?? defaultLocale);
  const locale = isLocale(rawLocale) ? rawLocale : defaultLocale;
  const action = String(formData.get('action') ?? '').trim();
  const rawItems = String(formData.get('items') ?? '[]');
  const availablePoints = Number(formData.get('availablePoints') ?? 0);
  const requestedPoints = Number(formData.get('requestedPoints') ?? 0);
  const redirectUrl = new URL(`/${locale}/shop/checkout`, request.url);

  if (action !== 'confirm' && action !== 'cancel') {
    redirectUrl.searchParams.set('actionStatus', 'rejected');
    redirectUrl.searchParams.set('actionMessage', 'Unsupported reservation action.');
    return NextResponse.redirect(redirectUrl);
  }

  const items = parseItems(rawItems);
  const quote = await getStorefrontQuote(locale, items, {
    availablePoints: Number.isFinite(availablePoints) ? availablePoints : 0,
    requestedPoints: Number.isFinite(requestedPoints) ? requestedPoints : 0,
  });

  const reservation = parseReservation(formData, quote);
  const result = await applyStorefrontReservationAction(locale, action, reservation);

  redirectUrl.searchParams.set('reserveStatus', result.status);
  redirectUrl.searchParams.set('reservedPoints', String(result.reservedPoints));
  redirectUrl.searchParams.set('coveredUsd', result.coveredUsd.toFixed(2));
  redirectUrl.searchParams.set('payableUsd', result.payableUsd.toFixed(2));
  redirectUrl.searchParams.set('requestedPoints', String(result.requestedPoints));
  redirectUrl.searchParams.set('source', result.source);
  redirectUrl.searchParams.set('message', result.message);
  redirectUrl.searchParams.set('actionStatus', result.status);
  redirectUrl.searchParams.set('actionType', result.action);
  redirectUrl.searchParams.set('actionMessage', result.message);

  if (result.reservationId) {
    redirectUrl.searchParams.set('reservationId', result.reservationId);
  } else {
    redirectUrl.searchParams.delete('reservationId');
  }

  if (typeof result.releasedPoints === 'number') {
    redirectUrl.searchParams.set('releasedPoints', String(result.releasedPoints));
  } else {
    redirectUrl.searchParams.delete('releasedPoints');
  }

  if (result.integrations.storefront.error) {
    redirectUrl.searchParams.set('integrationError', result.integrations.storefront.error);
  } else {
    redirectUrl.searchParams.delete('integrationError');
  }

  return NextResponse.redirect(redirectUrl);
}
