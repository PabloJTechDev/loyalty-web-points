import type { StorefrontQuoteResponse } from '@/lib/storefront/quote';

export type StorefrontReserveStatus = 'reserved' | 'simulated' | 'rejected';
export type StorefrontReservationVisibleStatus = StorefrontReserveStatus | 'confirmed' | 'cancelled';
export type StorefrontReservationAction = 'confirm' | 'cancel';
export type StorefrontReservationActionStatus = 'confirmed' | 'cancelled' | 'rejected';

interface StorefrontReservationIntegration {
  available: boolean;
  baseUrl?: string;
  checkedAt?: string;
  path?: string;
  error?: string;
}

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
    storefront: StorefrontReservationIntegration;
  };
}

export interface StorefrontReservationActionResponse {
  source: string;
  action: StorefrontReservationAction;
  status: StorefrontReservationActionStatus;
  reservationId?: string;
  requestedPoints: number;
  reservedPoints: number;
  coveredUsd: number;
  payableUsd: number;
  releasedPoints?: number;
  quote: StorefrontQuoteResponse;
  message: string;
  integrations: {
    storefront: StorefrontReservationIntegration;
  };
}

export function canReserveStorefrontQuote(quote: StorefrontQuoteResponse) {
  return quote.lines.length > 0 && quote.summary.appliedPoints >= quote.summary.minRedeemablePoints;
}

export function hasActiveStorefrontReservation(
  reservation: Pick<StorefrontReserveResponse, 'status'> | Pick<StorefrontReservationActionResponse, 'status'>,
) {
  return reservation.status === 'reserved' || reservation.status === 'simulated';
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

export function buildStorefrontFallbackReservationAction(
  action: StorefrontReservationAction,
  reservation: StorefrontReserveResponse,
  options?: {
    source?: string;
    integration?: StorefrontReservationActionResponse['integrations']['storefront'];
    now?: Date;
  },
): StorefrontReservationActionResponse {
  const now = options?.now ?? new Date();
  const integration = {
    available: options?.integration?.available ?? false,
    baseUrl: options?.integration?.baseUrl,
    checkedAt: options?.integration?.checkedAt ?? now.toISOString(),
    path: options?.integration?.path,
    error: options?.integration?.error,
  };

  if (!hasActiveStorefrontReservation(reservation)) {
    return {
      source: options?.source ?? `mock-storefront-${action}`,
      action,
      status: 'rejected',
      reservationId: reservation.reservationId,
      requestedPoints: reservation.requestedPoints,
      reservedPoints: reservation.reservedPoints,
      coveredUsd: reservation.coveredUsd,
      payableUsd: reservation.payableUsd,
      quote: reservation.quote,
      message: action === 'confirm'
        ? 'There is no active reservation available to confirm.'
        : 'There is no active reservation available to cancel.',
      integrations: {
        storefront: integration,
      },
    };
  }

  if (action === 'confirm') {
    return {
      source: options?.source ?? 'mock-storefront-confirm',
      action,
      status: 'confirmed',
      reservationId: reservation.reservationId,
      requestedPoints: reservation.requestedPoints,
      reservedPoints: reservation.reservedPoints,
      coveredUsd: reservation.coveredUsd,
      payableUsd: reservation.payableUsd,
      quote: reservation.quote,
      message: 'Confirm API not available. Reservation marked as confirmed using the current checkout data.',
      integrations: {
        storefront: integration,
      },
    };
  }

  return {
    source: options?.source ?? 'mock-storefront-cancel',
    action,
    status: 'cancelled',
    reservationId: reservation.reservationId,
    requestedPoints: reservation.requestedPoints,
    reservedPoints: 0,
    coveredUsd: 0,
    payableUsd: reservation.quote.summary.subtotalUsd,
    releasedPoints: reservation.reservedPoints,
    quote: reservation.quote,
    message: 'Cancel API not available. Reservation released locally using the current checkout data.',
    integrations: {
      storefront: integration,
    },
  };
}
