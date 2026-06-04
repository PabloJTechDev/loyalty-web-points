import { getStorefrontCatalogFallback } from '@/lib/mocks/storefront-catalog';
import { buildStorefrontFallbackQuote } from '@/lib/storefront/quote';

const catalog = getStorefrontCatalogFallback('es').items;

describe('buildStorefrontFallbackQuote', () => {
  it('caps redemption at 30% of the equivalent points', () => {
    const quote = buildStorefrontFallbackQuote(
      catalog,
      [{ productId: 'sku_headphones', quantity: 1 }],
      { availablePoints: 50_000, requestedPoints: 8_900 },
    );

    expect(quote.summary.equivalentPoints).toBe(8_900);
    expect(quote.summary.maxRedeemablePoints).toBe(2_670);
    expect(quote.summary.appliedPoints).toBe(2_670);
    expect(quote.summary.remainingUsd).toBeCloseTo(90.3, 2);
    expect(quote.summary.ruleMessages).toContain('cap-applied');
    expect(quote.summary.ruleMessages).toContain('requested-points-clamped');
  });

  it('blocks redemption when available balance is below the 500 point minimum', () => {
    const quote = buildStorefrontFallbackQuote(
      catalog,
      [{ productId: 'sku_backpack', quantity: 1 }],
      { availablePoints: 320, requestedPoints: 320 },
    );

    expect(quote.summary.canRedeem).toBe(false);
    expect(quote.summary.maxRedeemablePoints).toBe(320);
    expect(quote.summary.appliedPoints).toBe(0);
    expect(quote.summary.ruleMessages).toContain('balance-below-minimum');
  });

  it('returns an empty quote for invalid or missing lines', () => {
    const quote = buildStorefrontFallbackQuote(
      catalog,
      [{ productId: 'missing', quantity: 1 }, { productId: 'sku_backpack', quantity: 0 }],
      { availablePoints: 10_000, requestedPoints: 1_000 },
    );

    expect(quote.lines).toHaveLength(0);
    expect(quote.summary.subtotalUsd).toBe(0);
    expect(quote.summary.equivalentPoints).toBe(0);
    expect(quote.summary.appliedPoints).toBe(0);
    expect(quote.summary.ruleMessages).toContain('empty-cart');
  });
});
