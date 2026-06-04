import { getStorefrontCatalogFallback } from '@/lib/mocks/storefront-catalog';
import { buildStorefrontFallbackQuote } from '@/lib/storefront/quote';
import {
  buildStorefrontFallbackReservation,
  buildStorefrontFallbackReservationAction,
  canReserveStorefrontQuote,
} from '@/lib/storefront/reserve';

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

  it('confirms an active fallback reservation', () => {
    const quote = buildStorefrontFallbackQuote(
      catalog,
      [{ productId: 'sku_headphones', quantity: 1 }],
      { availablePoints: 50_000, requestedPoints: 2_000 },
    );

    const reservation = buildStorefrontFallbackReservation(quote, {
      now: new Date('2026-06-04T17:00:00.000Z'),
    });

    const result = buildStorefrontFallbackReservationAction('confirm', reservation, {
      now: new Date('2026-06-04T17:05:00.000Z'),
    });

    expect(result.status).toBe('confirmed');
    expect(result.reservedPoints).toBe(2_000);
    expect(result.coveredUsd).toBeCloseTo(28.99, 2);
    expect(result.payableUsd).toBeCloseTo(100.01, 2);
  });

  it('cancels an active fallback reservation and releases points', () => {
    const quote = buildStorefrontFallbackQuote(
      catalog,
      [{ productId: 'sku_headphones', quantity: 1 }],
      { availablePoints: 50_000, requestedPoints: 2_000 },
    );

    const reservation = buildStorefrontFallbackReservation(quote, {
      now: new Date('2026-06-04T17:00:00.000Z'),
    });

    const result = buildStorefrontFallbackReservationAction('cancel', reservation, {
      now: new Date('2026-06-04T17:05:00.000Z'),
    });

    expect(result.status).toBe('cancelled');
    expect(result.reservedPoints).toBe(0);
    expect(result.releasedPoints).toBe(2_000);
    expect(result.payableUsd).toBe(129);
  });
});
