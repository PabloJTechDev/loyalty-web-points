import type { StorefrontQuoteResponse } from '@/lib/storefront/quote';

export type StorefrontReserveStatus = 'reserved' | 'simulated' | 'rejected';

export interface StorefrontReserveResponse {
  source: string;
  status: StorefrontReserveStatus;
  reservationId?: string;
  requestedPoints: number;
  reservedPoints: number;
  coveredUsd: number;
  payableUsd: number;
  quote: StorefrontQuoteResponse;
  message: string;
  integrations: {
    storefront: {
      available: boolean;
      baseUrl?: string;
      checkedAt?: string;
      path?: string;
      error?: string;
    };
  };
}

export function canReserveStorefrontQuote(quote: StorefrontQuoteResponse) {
  return quote.lines.length > 0 && quote.summary.appliedPoints >= quote.summary.minRedeemablePoints;
}

export function buildStorefrontFallbackReservation(
  quote: StorefrontQuoteResponse,
  options?: {
    source?: string;
    integration?: StorefrontReserveResponse['integrations']['storefront'];
    now?: Date;
  },
): StorefrontReserveResponse {
  const now = options?.now ?? new Date();

  if (!canReserveStorefrontQuote(quote)) {
    return {
      source: options?.source ?? 'mock-storefront-reserve',
      status: 'rejected',
      requestedPoints: quote.summary.requestedPoints,
      reservedPoints: 0,
      coveredUsd: 0,
      payableUsd: quote.summary.subtotalUsd,
      quote,
      message: !quote.lines.length
        ? 'Cart is empty. Add at least one item before reserving points.'
        : `At least ${quote.summary.minRedeemablePoints} points must be applied before reserving.`,
      integrations: {
        storefront: {
          available: options?.integration?.available ?? false,
          baseUrl: options?.integration?.baseUrl,
          checkedAt: options?.integration?.checkedAt ?? now.toISOString(),
          path: options?.integration?.path,
          error: options?.integration?.error,
        },
      },
    };
  }

  return {
    source: options?.source ?? 'mock-storefront-reserve',
    status: 'simulated',
    reservationId: `sim-${now.getTime()}`,
    requestedPoints: quote.summary.requestedPoints,
    reservedPoints: quote.summary.appliedPoints,
    coveredUsd: quote.summary.appliedUsd,
    payableUsd: quote.summary.remainingUsd,
    quote,
    message: 'Reserve API not available. Simulated reservation created using the current quote.',
    integrations: {
      storefront: {
        available: options?.integration?.available ?? false,
        baseUrl: options?.integration?.baseUrl,
        checkedAt: options?.integration?.checkedAt ?? now.toISOString(),
        path: options?.integration?.path,
        error: options?.integration?.error,
      },
    },
  };
}
