import { cookies } from 'next/headers';
import type { Locale } from '@/lib/i18n/config';
import {
  getStorefrontCatalogFallback,
  type StorefrontCatalogCategory,
  type StorefrontCatalogItem,
  type StorefrontCatalogResponse,
} from '@/lib/mocks/storefront-catalog';
import {
  buildStorefrontFallbackQuote,
  type StorefrontQuoteLineInput,
  type StorefrontQuoteResponse,
} from '@/lib/storefront/quote';
import {
  buildStorefrontFallbackReservation,
  buildStorefrontFallbackReservationAction,
  hasActiveStorefrontReservation,
  type StorefrontReservationAction,
  type StorefrontReservationActionResponse,
  type StorefrontReserveResponse,
} from '@/lib/storefront/reserve';
import {
  buildStorefrontFallbackOrder,
  canPlaceStorefrontOrder,
  type StorefrontOrderLine,
  type StorefrontOrderResponse,
  type StorefrontPlaceOrderInput,
} from '@/lib/storefront/order';
import {
  decodeOrderHistory,
  getOrderFromHistory,
  STOREFRONT_ORDER_HISTORY_COOKIE,
} from '@/lib/storefront/order-history';

const customerBaseUrl = process.env.BFF_CUSTOMER_BASE_URL ?? 'http://localhost:3002';
const storefrontBaseUrl = process.env.BFF_STOREFRONT_BASE_URL ?? customerBaseUrl;
const configuredCatalogPath = process.env.BFF_STOREFRONT_CATALOG_PATH;
const configuredProductPath = process.env.BFF_STOREFRONT_PRODUCT_PATH;
const configuredQuotePath = process.env.BFF_STOREFRONT_QUOTE_PATH;
const configuredReservePath = process.env.BFF_STOREFRONT_RESERVE_PATH;
const configuredConfirmPath = process.env.BFF_STOREFRONT_CONFIRM_PATH;
const configuredCancelPath = process.env.BFF_STOREFRONT_CANCEL_PATH;
const configuredOrderPath = process.env.BFF_STOREFRONT_ORDER_PATH;
const configuredOrderDetailPath = process.env.BFF_STOREFRONT_ORDER_DETAIL_PATH;

const defaultCatalogPaths = configuredCatalogPath
  ? [configuredCatalogPath]
  : ['/api/v1/storefront/catalog', '/v1/storefront/catalog', '/api/v1/redemptions/catalog', '/v1/redemptions/catalog'];

const defaultProductPaths = configuredProductPath
  ? [configuredProductPath]
  : ['/api/v1/storefront/products/{productId}', '/v1/storefront/products/{productId}'];

const defaultQuotePaths = configuredQuotePath
  ? [configuredQuotePath]
  : ['/api/v1/storefront/quote', '/v1/storefront/quote', '/api/v1/redemptions/quote', '/v1/redemptions/quote', '/api/v1/storefront/cart/quote', '/v1/storefront/cart/quote'];

const defaultReservePaths = configuredReservePath
  ? [configuredReservePath]
  : ['/api/v1/storefront/reserve', '/v1/storefront/reserve', '/api/v1/redemptions/reserve', '/v1/redemptions/reserve', '/api/v1/storefront/cart/reserve', '/v1/storefront/cart/reserve'];

const defaultConfirmPaths = configuredConfirmPath
  ? [configuredConfirmPath]
  : ['/api/v1/storefront/confirm', '/v1/storefront/confirm', '/api/v1/redemptions/confirm', '/v1/redemptions/confirm', '/api/v1/storefront/cart/confirm', '/v1/storefront/cart/confirm'];

const defaultCancelPaths = configuredCancelPath
  ? [configuredCancelPath]
  : ['/api/v1/storefront/cancel', '/v1/storefront/cancel', '/api/v1/redemptions/cancel', '/v1/redemptions/cancel', '/api/v1/storefront/cart/cancel', '/v1/storefront/cart/cancel'];

const defaultOrderPaths = configuredOrderPath
  ? [configuredOrderPath]
  : ['/api/v1/storefront/orders', '/v1/storefront/orders'];

const defaultOrderDetailPaths = configuredOrderDetailPath
  ? [configuredOrderDetailPath]
  : ['/api/v1/storefront/orders/{orderId}', '/v1/storefront/orders/{orderId}'];

interface StorefrontCatalogFetchResult {
  payload: StorefrontCatalogResponse;
  path?: string;
}

interface RawStorefrontReservationResponse {
  source?: string;
  action?: unknown;
  status?: unknown;
  reservationId?: unknown;
  requestedPoints?: unknown;
  reservedPoints?: unknown;
  coveredUsd?: unknown;
  payableUsd?: unknown;
  releasedPoints?: unknown;
  quote?: unknown;
  summary?: {
    requestedPoints?: unknown;
    reservedPoints?: unknown;
    coveredUsd?: unknown;
    payableUsd?: unknown;
    releasedPoints?: unknown;
  };
  message?: unknown;
  integrations?: {
    storefront?: {
      available?: boolean;
      baseUrl?: string;
      checkedAt?: string;
      path?: string;
      error?: string;
    };
  };
}

interface RawStorefrontOrderLine {
  productId?: unknown;
  sku?: unknown;
  name?: unknown;
  title?: unknown;
  quantity?: unknown;
  unitPriceUsd?: unknown;
  priceUsd?: unknown;
  lineSubtotalUsd?: unknown;
  subtotalUsd?: unknown;
  categoryId?: unknown;
  categoryName?: unknown;
}

interface RawStorefrontOrderListResponse {
  source?: string;
  total?: unknown;
  orders?: unknown[];
  items?: unknown[];
  integrations?: {
    storefront?: {
      available?: boolean;
      baseUrl?: string;
      checkedAt?: string;
      path?: string;
      error?: string;
    };
  };
}

interface RawStorefrontOrderResponse {
  source?: string;
  orderId?: unknown;
  reservationId?: unknown;
  status?: unknown;
  currency?: unknown;
  createdAt?: unknown;
  lines?: unknown[];
  items?: unknown[];
  summary?: {
    itemCount?: unknown;
    subtotalUsd?: unknown;
    requestedPoints?: unknown;
    reservedPoints?: unknown;
    coveredUsd?: unknown;
    payableUsd?: unknown;
  };
  message?: unknown;
  integrations?: {
    storefront?: {
      available?: boolean;
      baseUrl?: string;
      checkedAt?: string;
      path?: string;
      error?: string;
    };
  };
}

interface RawStorefrontCatalogResponse {
  source?: string;
  product?: unknown;
  products?: unknown[];
  item?: unknown;
  items?: unknown[];
  categories?: unknown[];
  lines?: unknown[];
  summary?: {
    subtotalUsd?: unknown;
    equivalentPoints?: unknown;
    requestedPoints?: unknown;
    appliedPoints?: unknown;
    appliedUsd?: unknown;
    remainingUsd?: unknown;
    minRedeemablePoints?: unknown;
    maxRedeemablePoints?: unknown;
    capPercentage?: unknown;
    canRedeem?: unknown;
    ruleMessages?: unknown[];
  };
  integrations?: {
    storefront?: {
      available?: boolean;
      baseUrl?: string;
      checkedAt?: string;
      path?: string;
      error?: string;
    };
  };
}

interface RawStorefrontItem {
  id?: unknown;
  sku?: unknown;
  productId?: unknown;
  name?: unknown;
  title?: unknown;
  categoryId?: unknown;
  categoryName?: unknown;
  category?: unknown;
  priceUsd?: unknown;
  usdPrice?: unknown;
  price?: unknown;
  pointsFrom?: unknown;
  redeemFromPoints?: unknown;
  shortDescription?: unknown;
  description?: unknown;
  note?: unknown;
  eligibilityNote?: unknown;
}

interface RawStorefrontCategory {
  id?: unknown;
  code?: unknown;
  name?: unknown;
  title?: unknown;
  description?: unknown;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function asString(value: unknown): string | undefined {
  return typeof value === 'string' && value.trim().length ? value.trim() : undefined;
}

function asNumber(value: unknown): number | undefined {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string') {
    const normalized = Number(value.replace(/[^0-9.-]/g, ''));
    return Number.isFinite(normalized) ? normalized : undefined;
  }
  return undefined;
}

function asBoolean(value: unknown): boolean | undefined {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') {
    if (value === 'true') return true;
    if (value === 'false') return false;
  }
  return undefined;
}

function normalizeCategory(value: unknown): StorefrontCatalogCategory | null {
  if (!isRecord(value)) return null;

  const category = value as RawStorefrontCategory;
  const name = asString(category.name) ?? asString(category.title);
  if (!name) return null;

  return {
    id: asString(category.id) ?? asString(category.code) ?? name.toLowerCase().replace(/\s+/g, '-'),
    name,
    description: asString(category.description) ?? name,
  };
}

function normalizeItem(value: unknown): StorefrontCatalogItem | null {
  if (!isRecord(value)) return null;

  const item = value as RawStorefrontItem;
  const name = asString(item.name) ?? asString(item.title);
  const categoryName = asString(item.categoryName) ?? asString(item.category) ?? 'General';
  const priceUsd = asNumber(item.priceUsd) ?? asNumber(item.usdPrice) ?? asNumber(item.price);
  const pointsFrom = asNumber(item.pointsFrom) ?? asNumber(item.redeemFromPoints);

  if (!name || priceUsd === undefined || pointsFrom === undefined) {
    return null;
  }

  const categoryId = asString(item.categoryId) ?? categoryName.toLowerCase().replace(/\s+/g, '-');

  return {
    id: asString(item.id) ?? asString(item.productId) ?? asString(item.sku) ?? name.toLowerCase().replace(/\s+/g, '-'),
    sku: asString(item.sku) ?? asString(item.productId) ?? asString(item.id) ?? name.toLowerCase().replace(/\s+/g, '-'),
    name,
    categoryId,
    categoryName,
    priceUsd,
    pointsFrom,
    shortDescription: asString(item.shortDescription) ?? asString(item.note) ?? asString(item.description) ?? name,
    eligibilityNote: asString(item.eligibilityNote) ?? asString(item.note) ?? asString(item.description) ?? name,
  };
}

function normalizeCatalogResponse(raw: unknown, path: string): StorefrontCatalogResponse | null {
  if (!isRecord(raw)) return null;

  const payload = raw as RawStorefrontCatalogResponse;
  const itemsSource = Array.isArray(payload.items)
    ? payload.items
    : Array.isArray(payload.products)
      ? payload.products
      : [];
  const normalizedItems = itemsSource.map(normalizeItem).filter((item): item is StorefrontCatalogItem => Boolean(item));

  if (!normalizedItems.length) {
    return null;
  }

  const explicitCategories = Array.isArray(payload.categories)
    ? payload.categories.map(normalizeCategory).filter((category): category is StorefrontCatalogCategory => Boolean(category))
    : [];

  const derivedCategories = normalizedItems.reduce<StorefrontCatalogCategory[]>((acc, item) => {
    if (acc.some((category) => category.id === item.categoryId)) {
      return acc;
    }

    acc.push({
      id: item.categoryId,
      name: item.categoryName,
      description: item.categoryName,
    });

    return acc;
  }, []);

  return {
    items: normalizedItems,
    categories: explicitCategories.length ? explicitCategories : derivedCategories,
    source: asString(payload.source) ?? 'storefront-bff',
    integrations: {
      storefront: {
        available: payload.integrations?.storefront?.available ?? true,
        baseUrl: payload.integrations?.storefront?.baseUrl ?? storefrontBaseUrl,
        checkedAt: payload.integrations?.storefront?.checkedAt ?? new Date().toISOString(),
        path: payload.integrations?.storefront?.path ?? path,
        error: payload.integrations?.storefront?.error,
      },
    },
  };
}

async function tryFetchCatalog(path: string): Promise<StorefrontCatalogFetchResult | null> {
  const response = await fetch(`${storefrontBaseUrl}${path}`, {
    cache: 'no-store',
  });

  if (!response.ok) {
    return null;
  }

  const data = await response.json();
  const normalized = normalizeCatalogResponse(data, path);

  return normalized ? { payload: normalized, path } : null;
}

function replaceProductPath(pathTemplate: string, productId: string) {
  return pathTemplate.includes('{productId}')
    ? pathTemplate.replace('{productId}', encodeURIComponent(productId))
    : `${pathTemplate.replace(/\/$/, '')}/${encodeURIComponent(productId)}`;
}

async function tryFetchProduct(pathTemplate: string, productId: string): Promise<StorefrontCatalogItem | null> {
  const path = replaceProductPath(pathTemplate, productId);
  const response = await fetch(`${storefrontBaseUrl}${path}`, { cache: 'no-store' });

  if (!response.ok) {
    return null;
  }

  const data = (await response.json()) as RawStorefrontCatalogResponse;
  return normalizeItem(data.product ?? data.item ?? data);
}

async function tryFetchQuote(
  path: string,
  locale: Locale,
  lines: StorefrontQuoteLineInput[],
  options: { availablePoints?: number; requestedPoints?: number },
): Promise<StorefrontQuoteResponse | null> {
  const response = await fetch(`${storefrontBaseUrl}${path}`, {
    method: 'POST',
    cache: 'no-store',
    headers: {
      'content-type': 'application/json',
      'accept-language': locale,
    },
    body: JSON.stringify({
      locale,
      currency: 'USD',
      lines,
      availablePoints: options.availablePoints,
      requestedPoints: options.requestedPoints,
    }),
  });

  if (!response.ok) {
    return null;
  }

  const data = (await response.json()) as RawStorefrontCatalogResponse;
  if (!Array.isArray(data.lines) || !isRecord(data.summary)) {
    return null;
  }

  const normalizedLines = data.lines
    .map((line) => {
      if (!isRecord(line)) return null;

      const productId = asString(line.productId) ?? asString(line.id);
      const sku = asString(line.sku);
      const name = asString(line.name) ?? asString(line.title);
      const quantity = asNumber(line.quantity);
      const unitPriceUsd = asNumber(line.unitPriceUsd) ?? asNumber(line.priceUsd);
      const lineSubtotalUsd = asNumber(line.lineSubtotalUsd) ?? asNumber(line.subtotalUsd);
      const equivalentPoints = asNumber(line.equivalentPoints) ?? asNumber(line.pointsEquivalent);

      if (!productId || !sku || !name || quantity === undefined || unitPriceUsd === undefined || lineSubtotalUsd === undefined || equivalentPoints === undefined) {
        return null;
      }

      return {
        productId,
        sku,
        name,
        quantity,
        unitPriceUsd,
        lineSubtotalUsd,
        equivalentPoints,
      };
    })
    .filter((line): line is NonNullable<typeof line> => Boolean(line));

  if (!normalizedLines.length) {
    return null;
  }

  const summary = data.summary;
  const subtotalUsd = asNumber(summary.subtotalUsd);
  const equivalentPoints = asNumber(summary.equivalentPoints);
  const requestedPoints = asNumber(summary.requestedPoints);
  const appliedPoints = asNumber(summary.appliedPoints);
  const appliedUsd = asNumber(summary.appliedUsd);
  const remainingUsd = asNumber(summary.remainingUsd);
  const minRedeemablePoints = asNumber(summary.minRedeemablePoints);
  const maxRedeemablePoints = asNumber(summary.maxRedeemablePoints);
  const capPercentage = asNumber(summary.capPercentage);
  const canRedeem = asBoolean(summary.canRedeem);

  if (
    subtotalUsd === undefined ||
    equivalentPoints === undefined ||
    requestedPoints === undefined ||
    appliedPoints === undefined ||
    appliedUsd === undefined ||
    remainingUsd === undefined ||
    minRedeemablePoints === undefined ||
    maxRedeemablePoints === undefined ||
    capPercentage === undefined ||
    canRedeem === undefined
  ) {
    return null;
  }

  return {
    source: asString(data.source) ?? 'storefront-bff-quote',
    lines: normalizedLines,
    summary: {
      subtotalUsd,
      equivalentPoints,
      availablePoints: options.availablePoints ?? 0,
      requestedPoints,
      appliedPoints,
      appliedUsd,
      remainingUsd,
      minRedeemablePoints,
      maxRedeemablePoints,
      capPercentage,
      canRedeem,
      ruleMessages: Array.isArray(summary.ruleMessages)
        ? summary.ruleMessages.map(asString).filter((message): message is string => Boolean(message))
        : [],
    },
    integrations: {
      storefront: {
        available: data.integrations?.storefront?.available ?? true,
        baseUrl: data.integrations?.storefront?.baseUrl ?? storefrontBaseUrl,
        checkedAt: data.integrations?.storefront?.checkedAt ?? new Date().toISOString(),
        path: data.integrations?.storefront?.path ?? path,
        error: data.integrations?.storefront?.error,
      },
    },
  };
}

function buildReservationPayload(quote: StorefrontQuoteResponse) {
  return {
    currency: 'USD',
    lines: quote.lines.map((line) => ({
      productId: line.productId,
      quantity: line.quantity,
    })),
    requestedPoints: quote.summary.requestedPoints,
    appliedPoints: quote.summary.appliedPoints,
    availablePoints: quote.summary.availablePoints,
    subtotalUsd: quote.summary.subtotalUsd,
  };
}

function buildOrderPayload(input: StorefrontPlaceOrderInput) {
  return {
    currency: 'USD',
    reservationId: input.reservationId,
    lines: input.quote.lines.map((line) => ({
      productId: line.productId,
      quantity: line.quantity,
    })),
    requestedPoints: input.requestedPoints,
    reservedPoints: input.reservedPoints,
    coveredUsd: input.coveredUsd,
    payableUsd: input.payableUsd,
  };
}

function normalizeOrderLine(value: unknown): StorefrontOrderLine | null {
  if (!isRecord(value)) return null;

  const line = value as RawStorefrontOrderLine;
  const productId = asString(line.productId);
  const sku = asString(line.sku);
  const name = asString(line.name) ?? asString(line.title);
  const quantity = asNumber(line.quantity);
  const unitPriceUsd = asNumber(line.unitPriceUsd) ?? asNumber(line.priceUsd);
  const lineSubtotalUsd = asNumber(line.lineSubtotalUsd) ?? asNumber(line.subtotalUsd);

  if (!productId || !sku || !name || quantity === undefined || unitPriceUsd === undefined || lineSubtotalUsd === undefined) {
    return null;
  }

  return {
    productId,
    sku,
    name,
    quantity,
    unitPriceUsd,
    lineSubtotalUsd,
    categoryId: asString(line.categoryId),
    categoryName: asString(line.categoryName),
  };
}

async function tryFetchReserve(
  path: string,
  locale: Locale,
  quote: StorefrontQuoteResponse,
): Promise<StorefrontReserveResponse | null> {
  const response = await fetch(`${storefrontBaseUrl}${path}`, {
    method: 'POST',
    cache: 'no-store',
    headers: {
      'content-type': 'application/json',
      'accept-language': locale,
    },
    body: JSON.stringify({
      locale,
      ...buildReservationPayload(quote),
    }),
  });

  if (!response.ok) {
    return null;
  }

  const data = (await response.json()) as RawStorefrontReservationResponse;
  const status = asString(data.status);
  const requestedPoints = asNumber(data.requestedPoints) ?? asNumber(data.summary?.requestedPoints);
  const reservedPoints = asNumber(data.reservedPoints) ?? asNumber(data.summary?.reservedPoints);
  const coveredUsd = asNumber(data.coveredUsd) ?? asNumber(data.summary?.coveredUsd);
  const payableUsd = asNumber(data.payableUsd) ?? asNumber(data.summary?.payableUsd);
  const message = asString(data.message);

  if (
    (status !== 'reserved' && status !== 'simulated' && status !== 'rejected') ||
    requestedPoints === undefined ||
    reservedPoints === undefined ||
    coveredUsd === undefined ||
    payableUsd === undefined ||
    !message
  ) {
    return null;
  }

  return {
    source: asString(data.source) ?? 'storefront-bff-reserve',
    status,
    reservationId: asString(data.reservationId),
    requestedPoints,
    reservedPoints,
    coveredUsd,
    payableUsd,
    quote,
    message,
    integrations: {
      storefront: {
        available: data.integrations?.storefront?.available ?? true,
        baseUrl: data.integrations?.storefront?.baseUrl ?? storefrontBaseUrl,
        checkedAt: data.integrations?.storefront?.checkedAt ?? new Date().toISOString(),
        path: data.integrations?.storefront?.path ?? path,
        error: data.integrations?.storefront?.error,
      },
    },
  };
}

async function tryFetchReservationAction(
  action: StorefrontReservationAction,
  path: string,
  locale: Locale,
  reservation: StorefrontReserveResponse,
): Promise<StorefrontReservationActionResponse | null> {
  const response = await fetch(`${storefrontBaseUrl}${path}`, {
    method: 'POST',
    cache: 'no-store',
    headers: {
      'content-type': 'application/json',
      'accept-language': locale,
    },
    body: JSON.stringify({
      locale,
      reservationId: reservation.reservationId,
      ...buildReservationPayload(reservation.quote),
      reservedPoints: reservation.reservedPoints,
      coveredUsd: reservation.coveredUsd,
      payableUsd: reservation.payableUsd,
    }),
  });

  if (!response.ok) {
    return null;
  }

  const data = (await response.json()) as RawStorefrontReservationResponse;
  const status = asString(data.status);
  const requestedPoints = asNumber(data.requestedPoints) ?? asNumber(data.summary?.requestedPoints);
  const reservedPoints = asNumber(data.reservedPoints) ?? asNumber(data.summary?.reservedPoints);
  const coveredUsd = asNumber(data.coveredUsd) ?? asNumber(data.summary?.coveredUsd);
  const payableUsd = asNumber(data.payableUsd) ?? asNumber(data.summary?.payableUsd);
  const releasedPoints = asNumber(data.releasedPoints) ?? asNumber(data.summary?.releasedPoints);
  const message = asString(data.message);

  if (
    (status !== 'confirmed' && status !== 'cancelled' && status !== 'rejected') ||
    requestedPoints === undefined ||
    reservedPoints === undefined ||
    coveredUsd === undefined ||
    payableUsd === undefined ||
    !message
  ) {
    return null;
  }

  return {
    source: asString(data.source) ?? `storefront-bff-${action}`,
    action,
    status,
    reservationId: asString(data.reservationId) ?? reservation.reservationId,
    requestedPoints,
    reservedPoints,
    coveredUsd,
    payableUsd,
    releasedPoints,
    quote: reservation.quote,
    message,
    integrations: {
      storefront: {
        available: data.integrations?.storefront?.available ?? true,
        baseUrl: data.integrations?.storefront?.baseUrl ?? storefrontBaseUrl,
        checkedAt: data.integrations?.storefront?.checkedAt ?? new Date().toISOString(),
        path: data.integrations?.storefront?.path ?? path,
        error: data.integrations?.storefront?.error,
      },
    },
  };
}

function buildNormalizedOrderResponse(
  data: RawStorefrontOrderResponse,
  fallbackPath: string,
  fallbackOrderId?: string,
): StorefrontOrderResponse | null {
  const orderId = asString(data.orderId) ?? fallbackOrderId;
  const reservationId = asString(data.reservationId);
  const status = asString(data.status);
  const currency = asString(data.currency);
  const createdAt = asString(data.createdAt);
  const linesSource = Array.isArray(data.lines)
    ? data.lines
    : Array.isArray(data.items)
      ? data.items
      : [];
  const lines = linesSource.map(normalizeOrderLine).filter((line): line is StorefrontOrderLine => Boolean(line));
  const summary = data.summary;
  const message = asString(data.message);

  if (!orderId || !reservationId || status !== 'placed' || currency !== 'USD' || !createdAt || !isRecord(summary) || !message || !lines.length) {
    return null;
  }

  const itemCount = asNumber(summary.itemCount);
  const subtotalUsd = asNumber(summary.subtotalUsd);
  const requestedPoints = asNumber(summary.requestedPoints);
  const reservedPoints = asNumber(summary.reservedPoints);
  const coveredUsd = asNumber(summary.coveredUsd);
  const payableUsd = asNumber(summary.payableUsd);

  if (
    itemCount === undefined ||
    subtotalUsd === undefined ||
    requestedPoints === undefined ||
    reservedPoints === undefined ||
    coveredUsd === undefined ||
    payableUsd === undefined
  ) {
    return null;
  }

  return {
    source: asString(data.source) ?? 'storefront-bff-order',
    orderId,
    reservationId,
    status: 'placed',
    currency: 'USD',
    createdAt,
    lines,
    summary: {
      itemCount,
      subtotalUsd,
      requestedPoints,
      reservedPoints,
      coveredUsd,
      payableUsd,
    },
    message,
    integrations: {
      storefront: {
        available: data.integrations?.storefront?.available ?? true,
        baseUrl: data.integrations?.storefront?.baseUrl ?? storefrontBaseUrl,
        checkedAt: data.integrations?.storefront?.checkedAt ?? new Date().toISOString(),
        path: data.integrations?.storefront?.path ?? fallbackPath,
        error: data.integrations?.storefront?.error,
      },
    },
  };
}

async function tryFetchOrder(
  path: string,
  locale: Locale,
  input: StorefrontPlaceOrderInput,
): Promise<StorefrontOrderResponse | null> {
  const response = await fetch(`${storefrontBaseUrl}${path}`, {
    method: 'POST',
    cache: 'no-store',
    headers: {
      'content-type': 'application/json',
      'accept-language': locale,
    },
    body: JSON.stringify({
      locale,
      ...buildOrderPayload(input),
    }),
  });

  if (!response.ok) {
    return null;
  }

  const data = (await response.json()) as RawStorefrontOrderResponse;
  return buildNormalizedOrderResponse(data, path);
}

async function tryFetchOrderDetail(pathTemplate: string, orderId: string): Promise<StorefrontOrderResponse | null> {
  const path = replaceProductPath(pathTemplate, orderId);
  const response = await fetch(`${storefrontBaseUrl}${path}`, { cache: 'no-store' });

  if (!response.ok) {
    return null;
  }

  const data = (await response.json()) as RawStorefrontOrderResponse;
  return buildNormalizedOrderResponse(data, pathTemplate, orderId);
}

async function tryFetchOrders(path: string): Promise<StorefrontOrderResponse[] | null> {
  const response = await fetch(`${storefrontBaseUrl}${path}`, { cache: 'no-store' });

  if (!response.ok) {
    return null;
  }

  const data = (await response.json()) as RawStorefrontOrderListResponse | RawStorefrontOrderResponse[];
  const itemsSource: unknown[] = Array.isArray(data)
    ? data
    : Array.isArray((data as RawStorefrontOrderListResponse).orders)
      ? (data as RawStorefrontOrderListResponse).orders ?? []
      : Array.isArray((data as RawStorefrontOrderListResponse).items)
        ? (data as RawStorefrontOrderListResponse).items ?? []
        : [];

  const orders = itemsSource
    .map((item) => buildNormalizedOrderResponse(item as RawStorefrontOrderResponse, path))
    .filter((order): order is StorefrontOrderResponse => Boolean(order));

  return orders.length ? orders : null;
}

export async function getStorefrontCatalog(locale: Locale): Promise<StorefrontCatalogResponse> {
  const fallback = getStorefrontCatalogFallback(locale);
  let lastError: string | undefined;

  for (const path of defaultCatalogPaths) {
    try {
      const result = await tryFetchCatalog(path);
      if (result) {
        return result.payload;
      }
      lastError = `No compatible storefront payload found at ${path}`;
    } catch (error) {
      lastError = error instanceof Error ? error.message : `Storefront request failed at ${path}`;
    }
  }

  return {
    ...fallback,
    integrations: {
      storefront: {
        ...fallback.integrations.storefront,
        baseUrl: storefrontBaseUrl,
        checkedAt: new Date().toISOString(),
        path: configuredCatalogPath ?? defaultCatalogPaths.join(', '),
        error: lastError,
      },
    },
  };
}

export async function getStorefrontProductById(locale: Locale, productId: string): Promise<StorefrontCatalogItem | null> {
  for (const path of defaultProductPaths) {
    try {
      const product = await tryFetchProduct(path, productId);
      if (product) {
        return product;
      }
    } catch {
      // Fall back to catalog lookup below.
    }
  }

  const catalog = await getStorefrontCatalog(locale);
  return catalog.items.find((item) => item.id === productId || item.sku === productId) ?? null;
}

export async function getStorefrontQuote(
  locale: Locale,
  lines: StorefrontQuoteLineInput[],
  options: { availablePoints?: number; requestedPoints?: number } = {},
): Promise<StorefrontQuoteResponse> {
  let lastError: string | undefined;

  for (const path of defaultQuotePaths) {
    try {
      const quote = await tryFetchQuote(path, locale, lines, options);
      if (quote) {
        return quote;
      }
      lastError = `No compatible storefront quote payload found at ${path}`;
    } catch (error) {
      lastError = error instanceof Error ? error.message : `Storefront quote request failed at ${path}`;
    }
  }

  const catalog = await getStorefrontCatalog(locale);
  return buildStorefrontFallbackQuote(catalog.items, lines, {
    availablePoints: options.availablePoints,
    requestedPoints: options.requestedPoints,
    source: 'mock-storefront-quote',
    integration: {
      available: false,
      baseUrl: storefrontBaseUrl,
      checkedAt: new Date().toISOString(),
      path: configuredQuotePath ?? defaultQuotePaths.join(', '),
      error: lastError ?? catalog.integrations.storefront.error,
    },
  });
}

export async function reserveStorefrontQuote(
  locale: Locale,
  quote: StorefrontQuoteResponse,
): Promise<StorefrontReserveResponse> {
  let lastError: string | undefined;

  for (const path of defaultReservePaths) {
    try {
      const reservation = await tryFetchReserve(path, locale, quote);
      if (reservation) {
        return reservation;
      }
      lastError = `No compatible storefront reserve payload found at ${path}`;
    } catch (error) {
      lastError = error instanceof Error ? error.message : `Storefront reserve request failed at ${path}`;
    }
  }

  return buildStorefrontFallbackReservation(quote, {
    source: 'mock-storefront-reserve',
    integration: {
      available: false,
      baseUrl: storefrontBaseUrl,
      checkedAt: new Date().toISOString(),
      path: configuredReservePath ?? defaultReservePaths.join(', '),
      error: lastError,
    },
  });
}

export async function applyStorefrontReservationAction(
  locale: Locale,
  action: StorefrontReservationAction,
  reservation: StorefrontReserveResponse,
): Promise<StorefrontReservationActionResponse> {
  if (!hasActiveStorefrontReservation(reservation)) {
    return buildStorefrontFallbackReservationAction(action, reservation, {
      source: `mock-storefront-${action}`,
      integration: {
        available: false,
        baseUrl: storefrontBaseUrl,
        checkedAt: new Date().toISOString(),
        path: action === 'confirm'
          ? configuredConfirmPath ?? defaultConfirmPaths.join(', ')
          : configuredCancelPath ?? defaultCancelPaths.join(', '),
        error: 'Reservation is not active anymore.',
      },
    });
  }

  const actionPaths = action === 'confirm' ? defaultConfirmPaths : defaultCancelPaths;
  const configuredActionPath = action === 'confirm' ? configuredConfirmPath : configuredCancelPath;
  let lastError: string | undefined;

  for (const path of actionPaths) {
    try {
      const response = await tryFetchReservationAction(action, path, locale, reservation);
      if (response) {
        return response;
      }
      lastError = `No compatible storefront ${action} payload found at ${path}`;
    } catch (error) {
      lastError = error instanceof Error ? error.message : `Storefront ${action} request failed at ${path}`;
    }
  }

  return buildStorefrontFallbackReservationAction(action, reservation, {
    source: `mock-storefront-${action}`,
    integration: {
      available: false,
      baseUrl: storefrontBaseUrl,
      checkedAt: new Date().toISOString(),
      path: configuredActionPath ?? actionPaths.join(', '),
      error: lastError,
    },
  });
}

async function getStorefrontOrderHistoryFromCookie(): Promise<StorefrontOrderResponse[]> {
  const cookieStore = await cookies();
  return decodeOrderHistory(cookieStore.get(STOREFRONT_ORDER_HISTORY_COOKIE)?.value);
}

export async function placeStorefrontOrder(
  locale: Locale,
  input: StorefrontPlaceOrderInput,
): Promise<StorefrontOrderResponse> {
  if (!canPlaceStorefrontOrder(input)) {
    throw new Error('A confirmed reservation with quote lines is required before placing an order.');
  }

  let lastError: string | undefined;

  for (const path of defaultOrderPaths) {
    try {
      const order = await tryFetchOrder(path, locale, input);
      if (order) {
        return order;
      }
      lastError = `No compatible storefront order payload found at ${path}`;
    } catch (error) {
      lastError = error instanceof Error ? error.message : `Storefront order request failed at ${path}`;
    }
  }

  return buildStorefrontFallbackOrder(input, {
    source: 'mock-storefront-order',
    integration: {
      available: false,
      baseUrl: storefrontBaseUrl,
      checkedAt: new Date().toISOString(),
      path: configuredOrderPath ?? defaultOrderPaths.join(', '),
      error: lastError,
    },
  });
}

export async function getStorefrontOrders(): Promise<StorefrontOrderResponse[]> {
  for (const path of defaultOrderPaths) {
    try {
      const orders = await tryFetchOrders(path);
      if (orders) {
        return orders;
      }
    } catch {
      // Fall back to cookie history below.
    }
  }

  return getStorefrontOrderHistoryFromCookie();
}

export async function getStorefrontOrderById(orderId: string): Promise<StorefrontOrderResponse | null> {
  for (const path of defaultOrderDetailPaths) {
    try {
      const order = await tryFetchOrderDetail(path, orderId);
      if (order) {
        return order;
      }
    } catch {
      // Fall through to cookie history below.
    }
  }

  const history = await getStorefrontOrderHistoryFromCookie();
  return getOrderFromHistory(history, orderId);
}
