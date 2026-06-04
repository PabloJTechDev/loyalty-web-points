vi.mock('@/lib/api/storefront', () => ({
  getStorefrontQuote: vi.fn(),
  applyStorefrontReservationAction: vi.fn(),
}));

import {
  applyStorefrontReservationAction,
  getStorefrontQuote,
} from '@/lib/api/storefront';
import { POST } from './route';

function buildRequest(fields: Record<string, string>) {
  const formData = new FormData();

  for (const [key, value] of Object.entries(fields)) {
    formData.append(key, value);
  }

  return new Request('https://example.com/api/storefront-reservation-action', {
    method: 'POST',
    body: formData,
  });
}

describe('POST /api/storefront-reservation-action', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('redirects to checkout with confirmation details', async () => {
    vi.mocked(getStorefrontQuote).mockResolvedValue({
      source: 'mock-storefront-quote',
      lines: [{ productId: 'sku_headphones', quantity: 1 }],
      summary: {
        subtotalUsd: 129,
        equivalentPoints: 8900,
        availablePoints: 15200,
        requestedPoints: 2000,
        appliedPoints: 2000,
        appliedUsd: 29,
        remainingUsd: 100,
        minRedeemablePoints: 500,
        maxRedeemablePoints: 2670,
        capPercentage: 30,
        canRedeem: true,
        ruleMessages: [],
      },
      integrations: { storefront: { available: false } },
    });

    vi.mocked(applyStorefrontReservationAction).mockResolvedValue({
      source: 'mock-storefront-confirm',
      action: 'confirm',
      status: 'confirmed',
      reservationId: 'sim-123',
      requestedPoints: 2000,
      reservedPoints: 2000,
      coveredUsd: 29,
      payableUsd: 100,
      quote: {
        source: 'mock-storefront-quote',
        lines: [],
        summary: {
          subtotalUsd: 129,
          equivalentPoints: 8900,
          availablePoints: 15200,
          requestedPoints: 2000,
          appliedPoints: 2000,
          appliedUsd: 29,
          remainingUsd: 100,
          minRedeemablePoints: 500,
          maxRedeemablePoints: 2670,
          capPercentage: 30,
          canRedeem: true,
          ruleMessages: [],
        },
        integrations: { storefront: { available: false } },
      },
      message: 'Confirm API not available. Reservation marked as confirmed using the current checkout data.',
      integrations: { storefront: { available: false, error: 'missing endpoint' } },
    });

    const response = await POST(
      buildRequest({
        locale: 'es',
        action: 'confirm',
        items: JSON.stringify([{ productId: 'sku_headphones', quantity: 1 }]),
        availablePoints: '15200',
        requestedPoints: '2000',
        reserveStatus: 'simulated',
        reservedPoints: '2000',
        coveredUsd: '29',
        payableUsd: '100',
        source: 'mock-storefront-reserve',
        reservationId: 'sim-123',
        message: 'Reserve API not available. Simulated reservation created using the current quote.',
      }),
    );

    expect(response.headers.get('location')).toBe(
      'https://example.com/es/shop/checkout?reserveStatus=confirmed&reservedPoints=2000&coveredUsd=29.00&payableUsd=100.00&requestedPoints=2000&source=mock-storefront-confirm&message=Confirm+API+not+available.+Reservation+marked+as+confirmed+using+the+current+checkout+data.&actionStatus=confirmed&actionType=confirm&actionMessage=Confirm+API+not+available.+Reservation+marked+as+confirmed+using+the+current+checkout+data.&reservationId=sim-123&integrationError=missing+endpoint',
    );
  });

  it('redirects to checkout with cancellation details', async () => {
    vi.mocked(getStorefrontQuote).mockResolvedValue({
      source: 'mock-storefront-quote',
      lines: [{ productId: 'sku_headphones', quantity: 1 }],
      summary: {
        subtotalUsd: 129,
        equivalentPoints: 8900,
        availablePoints: 15200,
        requestedPoints: 2000,
        appliedPoints: 2000,
        appliedUsd: 29,
        remainingUsd: 100,
        minRedeemablePoints: 500,
        maxRedeemablePoints: 2670,
        capPercentage: 30,
        canRedeem: true,
        ruleMessages: [],
      },
      integrations: { storefront: { available: false } },
    });

    vi.mocked(applyStorefrontReservationAction).mockResolvedValue({
      source: 'mock-storefront-cancel',
      action: 'cancel',
      status: 'cancelled',
      reservationId: 'sim-123',
      requestedPoints: 2000,
      reservedPoints: 0,
      coveredUsd: 0,
      payableUsd: 129,
      releasedPoints: 2000,
      quote: {
        source: 'mock-storefront-quote',
        lines: [],
        summary: {
          subtotalUsd: 129,
          equivalentPoints: 8900,
          availablePoints: 15200,
          requestedPoints: 2000,
          appliedPoints: 2000,
          appliedUsd: 29,
          remainingUsd: 100,
          minRedeemablePoints: 500,
          maxRedeemablePoints: 2670,
          capPercentage: 30,
          canRedeem: true,
          ruleMessages: [],
        },
        integrations: { storefront: { available: false } },
      },
      message: 'Cancel API not available. Reservation released locally using the current checkout data.',
      integrations: { storefront: { available: false } },
    });

    const response = await POST(
      buildRequest({
        locale: 'es',
        action: 'cancel',
        items: JSON.stringify([{ productId: 'sku_headphones', quantity: 1 }]),
        availablePoints: '15200',
        requestedPoints: '2000',
        reserveStatus: 'simulated',
        reservedPoints: '2000',
        coveredUsd: '29',
        payableUsd: '100',
        source: 'mock-storefront-reserve',
        reservationId: 'sim-123',
        message: 'Reserve API not available. Simulated reservation created using the current quote.',
      }),
    );

    expect(response.headers.get('location')).toBe(
      'https://example.com/es/shop/checkout?reserveStatus=cancelled&reservedPoints=0&coveredUsd=0.00&payableUsd=129.00&requestedPoints=2000&source=mock-storefront-cancel&message=Cancel+API+not+available.+Reservation+released+locally+using+the+current+checkout+data.&actionStatus=cancelled&actionType=cancel&actionMessage=Cancel+API+not+available.+Reservation+released+locally+using+the+current+checkout+data.&reservationId=sim-123&releasedPoints=2000',
    );
  });

  it('rejects unsupported actions', async () => {
    const response = await POST(
      buildRequest({
        locale: 'es',
        action: 'archive',
      }),
    );

    expect(response.headers.get('location')).toBe(
      'https://example.com/es/shop/checkout?actionStatus=rejected&actionMessage=Unsupported+reservation+action.',
    );
  });
});
