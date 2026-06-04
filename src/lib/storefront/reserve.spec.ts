import { getStorefrontCatalogFallback } from '@/lib/mocks/storefront-catalog';
import { buildStorefrontFallbackQuote } from '@/lib/storefront/quote';
import { buildStorefrontFallbackReservation, canReserveStorefrontQuote } from '@/lib/storefront/reserve';

const catalog = getStorefrontCatalogFallback('es').items;

describe('storefront reserve fallback', () => {
  it('simulates a reservation when quote already applies enough points', () => {
    const quote = buildStorefrontFallbackQuote(
      catalog,
      [{ productId: 'sku_headphones', quantity: 1 }],
      { availablePoints: 50_000, requestedPoints: 2_000 },
    );

    expect(canReserveStorefrontQuote(quote)).toBe(true);

    const reserve = buildStorefrontFallbackReservation(quote, {
      now: new Date('2026-06-04T17:00:00.000Z'),
    });

    expect(reserve.status).toBe('simulated');
    expect(reserve.reservedPoints).toBe(2_000);
    expect(reserve.coveredUsd).toBeCloseTo(28.99, 2);
    expect(reserve.payableUsd).toBeCloseTo(100.01, 2);
    expect(reserve.reservationId).toBe('sim-1780592400000');
  });

  it('rejects reservation when applied points are below the minimum', () => {
    const quote = buildStorefrontFallbackQuote(
      catalog,
      [{ productId: 'sku_backpack', quantity: 1 }],
      { availablePoints: 320, requestedPoints: 320 },
    );

    expect(canReserveStorefrontQuote(quote)).toBe(false);

    const reserve = buildStorefrontFallbackReservation(quote);

    expect(reserve.status).toBe('rejected');
    expect(reserve.reservedPoints).toBe(0);
    expect(reserve.message).toContain('500');
  });
});
