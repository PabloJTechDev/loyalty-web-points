vi.mock('@/lib/api/storefront', () => ({
  getStorefrontQuote: vi.fn(),
  reserveStorefrontQuote: vi.fn(),
}));

import { getStorefrontQuote, reserveStorefrontQuote } from '@/lib/api/storefront';
import { POST } from './route';

function buildRequest(fields: Record<string, string>) {
  const formData = new FormData();

  for (const [key, value] of Object.entries(fields)) {
    formData.append(key, value);
  }

  return new Request('https://example.com/api/storefront-reserve', {
    method: 'POST',
    body: formData,
  });
}

describe('POST /api/storefront-reserve', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('redirects to checkout with reservation details', async () => {
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

    vi.mocked(reserveStorefrontQuote).mockResolvedValue({
      source: 'mock-storefront-reserve',
      status: 'simulated',
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
      message: 'Reserve API not available. Simulated reservation created using the current quote.',
      integrations: { storefront: { available: false, error: 'missing endpoint' } },
    });

    const response = await POST(
      buildRequest({
        locale: 'es',
        items: JSON.stringify([{ productId: 'sku_headphones', quantity: 1 }]),
        availablePoints: '15200',
        requestedPoints: '2000',
      }),
    );

    expect(response.headers.get('location')).toBe(
      'https://example.com/es/shop/checkout?reserveStatus=simulated&reservedPoints=2000&coveredUsd=29.00&payableUsd=100.00&requestedPoints=2000&message=Reserve+API+not+available.+Simulated+reservation+created+using+the+current+quote.&source=mock-storefront-reserve&reservationId=sim-123&integrationError=missing+endpoint',
    );
  });

  it('falls back to default locale when locale is invalid', async () => {
    vi.mocked(getStorefrontQuote).mockResolvedValue({
      source: 'mock-storefront-quote',
      lines: [],
      summary: {
        subtotalUsd: 0,
        equivalentPoints: 0,
        availablePoints: 0,
        requestedPoints: 0,
        appliedPoints: 0,
        appliedUsd: 0,
        remainingUsd: 0,
        minRedeemablePoints: 500,
        maxRedeemablePoints: 0,
        capPercentage: 30,
        canRedeem: false,
        ruleMessages: ['empty-cart'],
      },
      integrations: { storefront: { available: false } },
    });

    vi.mocked(reserveStorefrontQuote).mockResolvedValue({
      source: 'mock-storefront-reserve',
      status: 'rejected',
      requestedPoints: 0,
      reservedPoints: 0,
      coveredUsd: 0,
      payableUsd: 0,
      quote: {
        source: 'mock-storefront-quote',
        lines: [],
        summary: {
          subtotalUsd: 0,
          equivalentPoints: 0,
          availablePoints: 0,
          requestedPoints: 0,
          appliedPoints: 0,
          appliedUsd: 0,
          remainingUsd: 0,
          minRedeemablePoints: 500,
          maxRedeemablePoints: 0,
          capPercentage: 30,
          canRedeem: false,
          ruleMessages: ['empty-cart'],
        },
        integrations: { storefront: { available: false } },
      },
      message: 'Cart is empty. Add at least one item before reserving points.',
      integrations: { storefront: { available: false } },
    });

    const response = await POST(
      buildRequest({
        locale: 'pt-BR',
        items: 'invalid-json',
        availablePoints: '0',
        requestedPoints: '0',
      }),
    );

    expect(response.headers.get('location')).toContain('https://example.com/es/shop/checkout?');
  });
});
