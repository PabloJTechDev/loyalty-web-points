import { buildStorefrontFallbackOrder, canPlaceStorefrontOrder } from './order';

describe('storefront order fallback', () => {
  const input = {
    reservationId: 'rsv-123',
    reservationStatus: 'confirmed' as const,
    requestedPoints: 2000,
    reservedPoints: 2000,
    coveredUsd: 20,
    payableUsd: 109,
    quote: {
      source: 'mock-storefront-quote',
      lines: [
        {
          productId: 'sku_headphones',
          sku: 'sku_headphones',
          name: 'Wireless headphones',
          quantity: 1,
          unitPriceUsd: 129,
          lineSubtotalUsd: 129,
          equivalentPoints: 8900,
        },
      ],
      summary: {
        subtotalUsd: 129,
        equivalentPoints: 8900,
        availablePoints: 15200,
        requestedPoints: 2000,
        appliedPoints: 2000,
        appliedUsd: 20,
        remainingUsd: 109,
        minRedeemablePoints: 500,
        maxRedeemablePoints: 2670,
        capPercentage: 30,
        canRedeem: true,
        ruleMessages: [],
      },
      integrations: {
        storefront: {
          available: false,
        },
      },
    },
  };

  it('allows placing an order only with a confirmed reservation', () => {
    expect(canPlaceStorefrontOrder(input)).toBe(true);
    expect(
      canPlaceStorefrontOrder({
        ...input,
        reservationStatus: 'reserved',
      }),
    ).toBe(false);
  });

  it('builds a coherent fallback order payload', () => {
    const result = buildStorefrontFallbackOrder(input, {
      now: new Date('2026-06-05T12:00:00.000Z'),
      integration: {
        available: false,
        error: 'missing endpoint',
      },
    });

    expect(result).toMatchObject({
      source: 'mock-storefront-order',
      reservationId: 'rsv-123',
      status: 'placed',
      currency: 'USD',
      createdAt: '2026-06-05T12:00:00.000Z',
      summary: {
        itemCount: 1,
        subtotalUsd: 129,
        requestedPoints: 2000,
        reservedPoints: 2000,
        coveredUsd: 20,
        payableUsd: 109,
      },
      integrations: {
        storefront: {
          available: false,
          error: 'missing endpoint',
        },
      },
    });
    expect(result.orderId).toMatch(/^ord-/);
    expect(result.lines).toHaveLength(1);
  });

  it('throws when trying to place without a confirmed reservation', () => {
    expect(() =>
      buildStorefrontFallbackOrder({
        ...input,
        reservationStatus: 'cancelled',
      }),
    ).toThrow('A confirmed reservation with quote lines is required before placing an order.');
  });
});
