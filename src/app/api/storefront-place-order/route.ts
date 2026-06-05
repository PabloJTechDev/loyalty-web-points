import { NextResponse } from 'next/server';
import { defaultLocale, isLocale } from '@/lib/i18n/config';
import { getStorefrontQuote, placeStorefrontOrder } from '@/lib/api/storefront';

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
  const reservedPoints = Number(formData.get('reservedPoints') ?? 0);
  const coveredUsd = Number(formData.get('coveredUsd') ?? 0);
  const payableUsd = Number(formData.get('payableUsd') ?? 0);
  const reservationStatus = String(formData.get('reserveStatus') ?? '').trim();
  const reservationId = String(formData.get('reservationId') ?? '').trim();

  const items = parseItems(rawItems);
  const quote = await getStorefrontQuote(locale, items, {
    availablePoints: Number.isFinite(availablePoints) ? availablePoints : 0,
    requestedPoints: Number.isFinite(requestedPoints) ? requestedPoints : 0,
  });

  const redirectUrl = new URL(`/${locale}/shop/checkout`, request.url);

  try {
    const order = await placeStorefrontOrder(locale, {
      reservationId: reservationId || undefined,
      reservationStatus: reservationStatus as 'confirmed' | 'reserved' | 'cancelled' | 'rejected' | 'simulated' | undefined,
      requestedPoints: Number.isFinite(requestedPoints) ? requestedPoints : 0,
      reservedPoints: Number.isFinite(reservedPoints) ? reservedPoints : 0,
      coveredUsd: Number.isFinite(coveredUsd) ? coveredUsd : 0,
      payableUsd: Number.isFinite(payableUsd) ? payableUsd : quote.summary.remainingUsd,
      quote,
    });

    return NextResponse.redirect(
      new URL(`/${locale}/shop/checkout/success?orderId=${encodeURIComponent(order.orderId)}`, request.url),
    );
  } catch (error) {
    redirectUrl.searchParams.set('actionStatus', 'rejected');
    redirectUrl.searchParams.set(
      'actionMessage',
      error instanceof Error
        ? error.message
        : 'Order could not be placed with the current checkout state.',
    );
    return NextResponse.redirect(redirectUrl);
  }
}
