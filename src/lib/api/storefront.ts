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
  type StorefrontReserveResponse,
} from '@/lib/storefront/reserve';

const customerBaseUrl = process.env.BFF_CUSTOMER_BASE_URL ?? 'http://localhost:3002';
const storefrontBaseUrl = process.env.BFF_STOREFRONT_BASE_URL ?? customerBaseUrl;
const configuredCatalogPath = process.env.BFF_STOREFRONT_CATALOG_PATH;
const configuredProductPath = process.env.BFF_STOREFRONT_PRODUCT_PATH;
const configuredQuotePath = process.env.BFF_STOREFRONT_QUOTE_PATH;
const configuredReservePath = process.env.BFF_STOREFRONT_RESERVE_PATH;

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

interface StorefrontCatalogFetchResult {
  payload: StorefrontCatalogResponse;
  path?: string;
}

interface RawStorefrontReservationResponse {
  source?: string;
  status?: unknown;
  reservationId?: unknown;
  requestedPoints?: unknown;
  reservedPoints?: unknown;
  coveredUsd?: unknown;
  payableUsd?: unknown;
  quote?: unknown;
  summary?: {
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
      currency: 'USD',
      lines: quote.lines.map((line) => ({
        productId: line.productId,
        quantity: line.quantity,
      })),
      requestedPoints: quote.summary.requestedPoints,
      appliedPoints: quote.summary.appliedPoints,
      availablePoints: quote.summary.availablePoints,
      subtotalUsd: quote.summary.subtotalUsd,
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
