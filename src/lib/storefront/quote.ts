import type { StorefrontCatalogItem } from '@/lib/mocks/storefront-catalog';

export const STOREFRONT_QUOTE_MIN_POINTS = 500;
export const STOREFRONT_QUOTE_CAP_PERCENTAGE = 30;

export interface StorefrontQuoteLineInput {
  productId: string;
  quantity: number;
}

export interface StorefrontQuoteLine {
  productId: string;
  sku: string;
  name: string;
  quantity: number;
  unitPriceUsd: number;
  lineSubtotalUsd: number;
  equivalentPoints: number;
}

export interface StorefrontQuoteSummary {
  subtotalUsd: number;
  equivalentPoints: number;
  availablePoints: number;
  requestedPoints: number;
  appliedPoints: number;
  appliedUsd: number;
  remainingUsd: number;
  minRedeemablePoints: number;
  maxRedeemablePoints: number;
  capPercentage: number;
  canRedeem: boolean;
  ruleMessages: string[];
}

export interface StorefrontQuoteResponse {
  source: string;
  lines: StorefrontQuoteLine[];
  summary: StorefrontQuoteSummary;
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

function roundUsd(value: number) {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

function sanitizeQuantity(quantity: number) {
  if (!Number.isFinite(quantity) || quantity <= 0) return 0;
  return Math.max(0, Math.floor(quantity));
}

export function buildStorefrontFallbackQuote(
  products: StorefrontCatalogItem[],
  rawLines: StorefrontQuoteLineInput[],
  options?: {
    availablePoints?: number;
    requestedPoints?: number;
    source?: string;
    integration?: StorefrontQuoteResponse['integrations']['storefront'];
  },
): StorefrontQuoteResponse {
  const productMap = new Map(products.map((product) => [product.id, product]));
  const lines = rawLines.reduce<StorefrontQuoteLine[]>((acc, line) => {
    const quantity = sanitizeQuantity(line.quantity);
    if (!quantity) return acc;

    const product = productMap.get(line.productId);
    if (!product) return acc;

    acc.push({
      productId: product.id,
      sku: product.sku,
      name: product.name,
      quantity,
      unitPriceUsd: product.priceUsd,
      lineSubtotalUsd: roundUsd(product.priceUsd * quantity),
      equivalentPoints: product.pointsFrom * quantity,
    });

    return acc;
  }, []);

  const subtotalUsd = roundUsd(lines.reduce((sum, line) => sum + line.lineSubtotalUsd, 0));
  const equivalentPoints = lines.reduce((sum, line) => sum + line.equivalentPoints, 0);
  const availablePoints = Math.max(0, Math.floor(options?.availablePoints ?? 0));
  const requestedPoints = Math.max(0, Math.floor(options?.requestedPoints ?? 0));
  const capPoints = Math.floor((equivalentPoints * STOREFRONT_QUOTE_CAP_PERCENTAGE) / 100);
  const maxRedeemablePoints = Math.max(0, Math.min(availablePoints, equivalentPoints, capPoints));
  const canRedeem = equivalentPoints >= STOREFRONT_QUOTE_MIN_POINTS && maxRedeemablePoints >= STOREFRONT_QUOTE_MIN_POINTS;

  let appliedPoints = 0;
  if (canRedeem) {
    appliedPoints = Math.min(requestedPoints || maxRedeemablePoints, maxRedeemablePoints);
    if (appliedPoints < STOREFRONT_QUOTE_MIN_POINTS) {
      appliedPoints = 0;
    }
  }

  const appliedUsd = equivalentPoints > 0
    ? roundUsd(subtotalUsd * (appliedPoints / equivalentPoints))
    : 0;
  const remainingUsd = roundUsd(Math.max(0, subtotalUsd - appliedUsd));

  const ruleMessages: string[] = [];
  if (!lines.length) {
    ruleMessages.push('empty-cart');
  }
  if (equivalentPoints > 0 && equivalentPoints < STOREFRONT_QUOTE_MIN_POINTS) {
    ruleMessages.push('below-minimum-equivalence');
  }
  if (availablePoints > 0 && availablePoints < STOREFRONT_QUOTE_MIN_POINTS) {
    ruleMessages.push('balance-below-minimum');
  }
  if (requestedPoints > maxRedeemablePoints) {
    ruleMessages.push('requested-points-clamped');
  }
  if (capPoints < equivalentPoints) {
    ruleMessages.push('cap-applied');
  }

  return {
    source: options?.source ?? 'mock-storefront-quote',
    lines,
    summary: {
      subtotalUsd,
      equivalentPoints,
      availablePoints,
      requestedPoints,
      appliedPoints,
      appliedUsd,
      remainingUsd,
      minRedeemablePoints: STOREFRONT_QUOTE_MIN_POINTS,
      maxRedeemablePoints,
      capPercentage: STOREFRONT_QUOTE_CAP_PERCENTAGE,
      canRedeem,
      ruleMessages,
    },
    integrations: {
      storefront: {
        available: options?.integration?.available ?? false,
        baseUrl: options?.integration?.baseUrl,
        checkedAt: options?.integration?.checkedAt ?? new Date().toISOString(),
        path: options?.integration?.path,
        error: options?.integration?.error,
      },
    },
  };
}
