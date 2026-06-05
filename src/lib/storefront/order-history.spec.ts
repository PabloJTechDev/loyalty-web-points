import {
  decodeOrderHistory,
  encodeOrderHistory,
  getOrderFromHistory,
  upsertOrderInHistory,
} from './order-history';
import type { StorefrontOrderResponse } from './order';

const orderA: StorefrontOrderResponse = {
  source: 'mock-storefront-order',
  orderId: 'ord-1',
  reservationId: 'rsv-1',
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
};

const orderB: StorefrontOrderResponse = {
  ...orderA,
  orderId: 'ord-2',
  reservationId: 'rsv-2',
  createdAt: '2026-06-05T13:00:00.000Z',
};

describe('storefront order history cookie helper', () => {
  it('encodes and decodes a valid cookie payload', () => {
    const encoded = encodeOrderHistory([orderA]);
    const decoded = decodeOrderHistory(encoded);

    expect(decoded).toEqual([orderA]);
  });

  it('tolerates invalid cookie content', () => {
    expect(decodeOrderHistory('broken')).toEqual([]);
  });

  it('upserts new orders to the front sorted by createdAt desc', () => {
    const result = upsertOrderInHistory([orderA], orderB);

    expect(result[0].orderId).toBe('ord-2');
    expect(result[1].orderId).toBe('ord-1');
  });

  it('deduplicates orders by orderId', () => {
    const updated = { ...orderA, message: 'updated' };
    const result = upsertOrderInHistory([orderA], updated);

    expect(result).toHaveLength(1);
    expect(result[0].message).toBe('updated');
  });

  it('retrieves a specific order from history', () => {
    const found = getOrderFromHistory([orderA, orderB], 'ord-2');

    expect(found?.orderId).toBe('ord-2');
    expect(getOrderFromHistory([orderA], 'missing')).toBeNull();
  });
});
