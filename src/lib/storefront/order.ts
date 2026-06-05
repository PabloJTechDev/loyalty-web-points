import type { StorefrontQuoteResponse } from '@/lib/storefront/quote';
import type { StorefrontReservationVisibleStatus } from '@/lib/storefront/reserve';

interface StorefrontOrderIntegration {
  available: boolean;
  baseUrl?: string;
  checkedAt?: string;
  path?: string;
  error?: string;
}

export interface StorefrontOrderLine {
  productId: string;
  sku: string;
  name: string;
  quantity: number;
  unitPriceUsd: number;
  lineSubtotalUsd: number;
  categoryId?: string;
  categoryName?: string;
}

export interface StorefrontOrderSummary {
  itemCount: number;
  subtotalUsd: number;
  requestedPoints: number;
  reservedPoints: number;
  coveredUsd: number;
  payableUsd: number;
}

export interface StorefrontOrderResponse {
  source: string;
  orderId: string;
  reservationId: string;
  status: 'placed';
  currency: 'USD';
  createdAt: string;
  lines: StorefrontOrderLine[];
  summary: StorefrontOrderSummary;
  message: string;
  integrations: {
    storefront: StorefrontOrderIntegration;
  };
}

export interface StorefrontPlaceOrderInput {
  reservationId?: string;
  reservationStatus?: StorefrontReservationVisibleStatus;
  requestedPoints: number;
  reservedPoints: number;
  coveredUsd: number;
  payableUsd: number;
  quote: StorefrontQuoteResponse;
}

export function canPlaceStorefrontOrder(input: StorefrontPlaceOrderInput) {
  return Boolean(
    input.reservationId
      && input.reservationStatus === 'confirmed'
      && input.quote.lines.length > 0,
  );
}

export function buildStorefrontFallbackOrder(
  input: StorefrontPlaceOrderInput,
  options?: {
    source?: string;
    integration?: StorefrontOrderResponse['integrations']['storefront'];
    now?: Date;
  },
): StorefrontOrderResponse {
  const now = options?.now ?? new Date();

  if (!canPlaceStorefrontOrder(input)) {
    throw new Error('A confirmed reservation with quote lines is required before placing an order.');
  }

  return {
    source: options?.source ?? 'mock-storefront-order',
    orderId: `ord-${now.getTime()}`,
    reservationId: input.reservationId!,
    status: 'placed',
    currency: 'USD',
    createdAt: now.toISOString(),
    lines: input.quote.lines.map((line) => ({
      productId: line.productId,
      sku: line.sku,
      name: line.name,
      quantity: line.quantity,
      unitPriceUsd: line.unitPriceUsd,
      lineSubtotalUsd: line.lineSubtotalUsd,
    })),
    summary: {
      itemCount: input.quote.lines.reduce((sum, line) => sum + line.quantity, 0),
      subtotalUsd: input.quote.summary.subtotalUsd,
      requestedPoints: input.requestedPoints,
      reservedPoints: input.reservedPoints,
      coveredUsd: input.coveredUsd,
      payableUsd: input.payableUsd,
    },
    message: 'Order API not available. Order placed locally using the confirmed reservation and current checkout data.',
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
