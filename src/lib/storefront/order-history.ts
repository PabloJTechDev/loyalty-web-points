import { createHmac, timingSafeEqual } from 'node:crypto';
import type { StorefrontOrderResponse } from '@/lib/storefront/order';

export const STOREFRONT_ORDER_HISTORY_COOKIE = 'loyalty_storefront_order_history';
const STOREFRONT_ORDER_HISTORY_MAX_ITEMS = 15;

function getOrderHistorySecret(): string {
  return process.env.AUTH_DEMO_COOKIE_SECRET ?? 'loyalty-storefront-order-history-dev-secret';
}

function signPayload(payload: string): string {
  return createHmac('sha256', getOrderHistorySecret())
    .update(payload)
    .digest('base64url');
}

export function encodeOrderHistory(orders: StorefrontOrderResponse[]): string {
  const payload = Buffer.from(JSON.stringify(orders), 'utf8').toString('base64url');
  const signature = signPayload(payload);
  return `${payload}.${signature}`;
}

export function decodeOrderHistory(value: string | undefined): StorefrontOrderResponse[] {
  if (!value) return [];

  const [payload, signature] = value.split('.');
  if (!payload || !signature) return [];

  const expectedSignature = signPayload(payload);
  const provided = Buffer.from(signature, 'utf8');
  const expected = Buffer.from(expectedSignature, 'utf8');

  if (provided.length !== expected.length || !timingSafeEqual(provided, expected)) {
    return [];
  }

  try {
    const parsed = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8')) as unknown;

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.filter((order): order is StorefrontOrderResponse => {
      return Boolean(
        order
        && typeof order === 'object'
        && typeof (order as StorefrontOrderResponse).orderId === 'string'
        && typeof (order as StorefrontOrderResponse).reservationId === 'string'
        && typeof (order as StorefrontOrderResponse).createdAt === 'string',
      );
    });
  } catch {
    return [];
  }
}

export function upsertOrderInHistory(
  orders: StorefrontOrderResponse[],
  order: StorefrontOrderResponse,
): StorefrontOrderResponse[] {
  const deduped = orders.filter((candidate) => candidate.orderId !== order.orderId);
  return [order, ...deduped]
    .sort((left, right) => right.createdAt.localeCompare(left.createdAt))
    .slice(0, STOREFRONT_ORDER_HISTORY_MAX_ITEMS);
}

export function getOrderFromHistory(
  orders: StorefrontOrderResponse[],
  orderId: string,
): StorefrontOrderResponse | null {
  return orders.find((order) => order.orderId === orderId) ?? null;
}
