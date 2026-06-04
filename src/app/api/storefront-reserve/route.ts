import { NextResponse } from 'next/server';
import { defaultLocale, isLocale } from '@/lib/i18n/config';
import { getStorefrontQuote, reserveStorefrontQuote } from '@/lib/api/storefront';

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

export async function POST(request: Request) {
  const formData = await request.formData();
  const rawLocale = String(formData.get('locale') ?? defaultLocale);
  const locale = isLocale(rawLocale) ? rawLocale : defaultLocale;
  const rawItems = String(formData.get('items') ?? '[]');
  const availablePoints = Number(formData.get('availablePoints') ?? 0);
  const requestedPoints = Number(formData.get('requestedPoints') ?? 0);

  const items = parseItems(rawItems);
  const quote = await getStorefrontQuote(locale, items, {
    availablePoints: Number.isFinite(availablePoints) ? availablePoints : 0,
    requestedPoints: Number.isFinite(requestedPoints) ? requestedPoints : 0,
  });

  const reservation = await reserveStorefrontQuote(locale, quote);
  const redirectUrl = new URL(`/${locale}/shop/checkout`, request.url);

  redirectUrl.searchParams.set('reserveStatus', reservation.status);
  redirectUrl.searchParams.set('reservedPoints', String(reservation.reservedPoints));
  redirectUrl.searchParams.set('coveredUsd', reservation.coveredUsd.toFixed(2));
  redirectUrl.searchParams.set('payableUsd', reservation.payableUsd.toFixed(2));
  redirectUrl.searchParams.set('requestedPoints', String(reservation.requestedPoints));
  redirectUrl.searchParams.set('message', reservation.message);
  redirectUrl.searchParams.set('source', reservation.source);
  redirectUrl.searchParams.delete('actionStatus');
  redirectUrl.searchParams.delete('actionType');
  redirectUrl.searchParams.delete('actionMessage');
  redirectUrl.searchParams.delete('releasedPoints');

  if (reservation.reservationId) {
    redirectUrl.searchParams.set('reservationId', reservation.reservationId);
  }

  if (reservation.integrations.storefront.error) {
    redirectUrl.searchParams.set('integrationError', reservation.integrations.storefront.error);
  }

  return NextResponse.redirect(redirectUrl);
}
