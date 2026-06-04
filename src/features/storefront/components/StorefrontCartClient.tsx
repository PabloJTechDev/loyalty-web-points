'use client';

import { useMemo, useState } from 'react';
import type { Locale } from '@/lib/i18n/config';
import type { StorefrontCatalogItem } from '@/lib/mocks/storefront-catalog';
import { useDemoCart } from '@/features/storefront/hooks/useDemoCart';
import { buildStorefrontFallbackQuote } from '@/lib/storefront/quote';

interface StorefrontCartClientProps {
  locale: Locale;
  products: StorefrontCatalogItem[];
  availablePoints: number;
}

function formatUsd(amount: number, locale: Locale) {
  return new Intl.NumberFormat(locale === 'es' ? 'es-CL' : 'en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

function formatPoints(value: number, locale: Locale) {
  return new Intl.NumberFormat(locale === 'es' ? 'es-CL' : 'en-US').format(value);
}

export function StorefrontCartClient({ locale, products, availablePoints }: StorefrontCartClientProps) {
  const { items, setQuantity, removeItem, clear, isHydrated } = useDemoCart();
  const [requestedPoints, setRequestedPoints] = useState(0);

  const safeRequestedPoints = useMemo(() => {
    const normalized = Math.max(0, Math.floor(requestedPoints));

    if (!items.length) return 0;

    const unrestrictedQuote = buildStorefrontFallbackQuote(products, items, {
      availablePoints,
      requestedPoints: 0,
    });

    if (!unrestrictedQuote.summary.canRedeem) {
      return 0;
    }

    return Math.min(normalized, unrestrictedQuote.summary.maxRedeemablePoints);
  }, [availablePoints, items, products, requestedPoints]);

  const quote = useMemo(
    () => buildStorefrontFallbackQuote(products, items, { availablePoints, requestedPoints: safeRequestedPoints }),
    [availablePoints, items, products, safeRequestedPoints],
  );

  const itemView = useMemo(() => {
    const productMap = new Map(products.map((product) => [product.id, product]));

    return items
      .map((item) => {
        const product = productMap.get(item.productId);
        if (!product) return null;

        return {
          ...item,
          product,
        };
      })
      .filter((item): item is NonNullable<typeof item> => Boolean(item));
  }, [items, products]);

  const copy = locale === 'es'
    ? {
      emptyTitle: 'Tu carrito demo está vacío',
      emptyDescription: 'Agrega productos desde la tienda o el PDP para probar quote, subtotal y canje parcial.',
      qty: 'Cantidad',
      remove: 'Quitar',
      clear: 'Vaciar carrito',
      available: 'Saldo disponible',
      requested: 'Puntos a usar',
      min: 'Mínimo',
      cap: 'Tope',
      subtotal: 'Subtotal USD',
      equivalent: 'Equivalencia total',
      applied: 'Puntos aplicados',
      appliedUsd: 'Descuento estimado',
      due: 'Total a pagar en USD',
      helper: 'Regla demo: mínimo 500 pts y máximo 30% de la equivalencia total del carrito.',
      noRedeem: 'Todavía no cumples las reglas para canjear puntos en este carrito.',
      hydrate: 'Cargando carrito…',
      quote: 'Quote actual',
      clamp: 'Si pides más puntos de los permitidos, el sistema los ajusta automáticamente.',
    }
    : {
      emptyTitle: 'Your demo cart is empty',
      emptyDescription: 'Add products from the storefront or PDP to validate quote, subtotal, and partial redemption.',
      qty: 'Quantity',
      remove: 'Remove',
      clear: 'Clear cart',
      available: 'Available balance',
      requested: 'Points to apply',
      min: 'Minimum',
      cap: 'Cap',
      subtotal: 'USD subtotal',
      equivalent: 'Total points equivalent',
      applied: 'Applied points',
      appliedUsd: 'Estimated discount',
      due: 'USD due',
      helper: 'Demo rule: minimum 500 pts and maximum 30% of the cart total equivalent.',
      noRedeem: 'This cart does not meet the current redemption rules yet.',
      hydrate: 'Loading cart…',
      quote: 'Current quote',
      clamp: 'If you request more points than allowed, the system will clamp them automatically.',
    };

  if (!isHydrated) {
    return <p className="muted">{copy.hydrate}</p>;
  }

  if (!itemView.length) {
    return (
      <div className="empty-trace-panel">
        <strong>{copy.emptyTitle}</strong>
        <p>{copy.emptyDescription}</p>
      </div>
    );
  }

  return (
    <div className="grid grid--two store-cart-layout">
      <div className="stack">
        <div className="customer-card customer-card--default">
          <div className="stack stack--sm">
            {itemView.map(({ product, quantity }) => (
              <div key={product.id} className="cart-line">
                <div className="cart-line__meta">
                  <span className="info-chip">{product.categoryName}</span>
                  <strong>{product.name}</strong>
                  <p className="muted">{product.shortDescription}</p>
                  <small className="muted">
                    {formatUsd(product.priceUsd, locale)} · {formatPoints(product.pointsFrom, locale)} pts eq.
                  </small>
                </div>
                <div className="cart-line__controls">
                  <label className="field field--compact">
                    <span>{copy.qty}</span>
                    <input
                      type="number"
                      min={0}
                      value={quantity}
                      onChange={(event) => setQuantity(product.id, Number(event.target.value))}
                    />
                  </label>
                  <button type="button" className="button button--secondary button--compact" onClick={() => removeItem(product.id)}>
                    {copy.remove}
                  </button>
                </div>
              </div>
            ))}

            <button type="button" className="button button--ghost button--compact button--fit" onClick={clear}>
              {copy.clear}
            </button>
          </div>
        </div>
      </div>

      <aside className="stack">
        <div className="customer-card customer-card--soft">
          <div className="stack stack--sm">
            <span className="section-kicker">{copy.quote}</span>
            <div className="data-list">
              <div className="data-row">
                <span className="data-label">{copy.available}</span>
                <span className="data-value">{formatPoints(availablePoints, locale)} pts</span>
              </div>
              <div className="data-row">
                <span className="data-label">{copy.min}</span>
                <span className="data-value">{formatPoints(quote.summary.minRedeemablePoints, locale)} pts</span>
              </div>
              <div className="data-row">
                <span className="data-label">{copy.cap}</span>
                <span className="data-value">{quote.summary.capPercentage}% · {formatPoints(quote.summary.maxRedeemablePoints, locale)} pts</span>
              </div>
              <div className="data-row">
                <span className="data-label">{copy.requested}</span>
                <input
                  className="field-input"
                  type="number"
                  min={0}
                  step={100}
                  value={safeRequestedPoints}
                  onChange={(event) => setRequestedPoints(Math.max(0, Number(event.target.value) || 0))}
                />
              </div>
            </div>
            <p className="muted">{copy.helper}</p>
            <p className="muted">{copy.clamp}</p>
            {!quote.summary.canRedeem ? <p className="trace-note">{copy.noRedeem}</p> : null}
          </div>
        </div>

        <div className="customer-card customer-card--default">
          <div className="data-list">
            <div className="data-row">
              <span className="data-label">{copy.subtotal}</span>
              <span className="data-value">{formatUsd(quote.summary.subtotalUsd, locale)}</span>
            </div>
            <div className="data-row">
              <span className="data-label">{copy.equivalent}</span>
              <span className="data-value">{formatPoints(quote.summary.equivalentPoints, locale)} pts</span>
            </div>
            <div className="data-row">
              <span className="data-label">{copy.applied}</span>
              <span className="data-value">{formatPoints(quote.summary.appliedPoints, locale)} pts</span>
            </div>
            <div className="data-row">
              <span className="data-label">{copy.appliedUsd}</span>
              <span className="data-value">-{formatUsd(quote.summary.appliedUsd, locale)}</span>
            </div>
            <div className="data-row">
              <span className="data-label">{copy.due}</span>
              <span className="data-value data-value--strong">{formatUsd(quote.summary.remainingUsd, locale)}</span>
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
}
