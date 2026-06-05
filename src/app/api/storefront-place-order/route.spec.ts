vi.mock('@/lib/api/storefront', () => ({
  getStorefrontQuote: vi.fn(),
  placeStorefrontOrder: vi.fn(),
}));

import { getStorefrontQuote, placeStorefrontOrder } from '@/lib/api/storefront';
import { POST } from './route';

function buildRequest(fields: Record<string, string>) {
  const formData = new FormData();

  for (const [key, value] of Object.entries(fields)) {
    formData.append(key, value);
  }

  return new Request('https://example.com/api/storefront-place-order', {
    method: 'POST',
    body: formData,
  });
}

describe('POST /api/storefront-place-order', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('redirects to success page when order placement succeeds', async () => {
    vi.mocked(getStorefrontQuote).mockResolvedValue({
      source: 'mock-storefront-quote',
      lines: [{ productId: 'sku_headphones', quantity: 1 }],
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
      integrations: { storefront: { available: false } },
    });

    vi.mocked(placeStorefrontOrder).mockResolvedValue({
      source: 'mock-storefront-order',
      orderId: 'ord-123',
      reservationId: 'rsv-123',
      status: 'placed',
      currency: 'USD',
      createdAt: '2026-06-05T12:00:00.000Z',
      lines: [],
      summary: {
        itemCount: 1,
        subtotalUsd: 129,
        requestedPoints: 2000,
        reservedPoints: 2000,
        coveredUsd: 20,
        payableUsd: 109,
      },
      message: 'ok',
      integrations: { storefront: { available: false } },
    });

    const response = await POST(
      buildRequest({
        locale: 'es',
        items: JSON.stringify([{ productId: 'sku_headphones', quantity: 1 }]),
        availablePoints: '15200',
        requestedPoints: '2000',
        reservedPoints: '2000',
        coveredUsd: '20',
        payableUsd: '109',
        reserveStatus: 'confirmed',
        reservationId: 'rsv-123',
      }),
    );

    expect(response.headers.get('location')).toBe(
      'https://example.com/es/shop/checkout/success?orderId=ord-123',
    );
  });

  it('redirects back to checkout when order placement fails', async () => {
    vi.mocked(getStorefrontQuote).mockResolvedValue({
      source: 'mock-storefront-quote',
      lines: [{ productId: 'sku_headphones', quantity: 1 }],
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
      integrations: { storefront: { available: false } },
    });

    vi.mocked(placeStorefrontOrder).mockRejectedValue(
      new Error('A confirmed reservation with quote lines is required before placing an order.'),
    );

    const response = await POST(
      buildRequest({
        locale: 'es',
        items: JSON.stringify([{ productId: 'sku_headphones', quantity: 1 }]),
        availablePoints: '15200',
        requestedPoints: '2000',
        reservedPoints: '2000',
        coveredUsd: '20',
        payableUsd: '109',
        reserveStatus: 'reserved',
        reservationId: 'rsv-123',
      }),
    );

    expect(response.headers.get('location')).toBe(
      'https://example.com/es/shop/checkout?actionStatus=rejected&actionMessage=A+confirmed+reservation+with+quote+lines+is+required+before+placing+an+order.',
    );
  });
});
