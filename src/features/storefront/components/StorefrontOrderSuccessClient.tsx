'use client';

import Link from 'next/link';
import type { Locale } from '@/lib/i18n/config';
import { formatPoints } from '@/lib/i18n/format';
import type { StorefrontOrderResponse } from '@/lib/storefront/order';

interface StorefrontOrderSuccessClientProps {
  locale: Locale;
  order: StorefrontOrderResponse;
}

function formatUsd(amount: number, locale: Locale) {
  return new Intl.NumberFormat(locale === 'es' ? 'es-CL' : 'en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

function formatDateTime(value: string, locale: Locale) {
  return new Intl.DateTimeFormat(locale === 'es' ? 'es-CL' : 'en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
}

export function StorefrontOrderSuccessClient({ locale, order }: StorefrontOrderSuccessClientProps) {
  const copy = locale === 'es'
    ? {
        successKicker: 'Order placement mock',
        successTitle: 'Orden colocada correctamente',
        successDescription: 'Cerraste el flujo completo quote → reserve → confirm → place order con una respuesta mock coherente.',
        orderId: 'orderId',
        reservationId: 'reservationId',
        createdAt: 'Creada en',
        source: 'Fuente',
        lines: 'Detalle de la orden',
        quantity: 'Cantidad',
        unitPrice: 'Precio unitario',
        lineSubtotal: 'Subtotal línea',
        summary: 'Resumen final',
        requestedPoints: 'Puntos solicitados',
        reservedPoints: 'Puntos aplicados',
        coveredAmount: 'Monto cubierto',
        payableAmount: 'Monto pagado',
        viewHistory: 'Ver historial de órdenes',
        viewOrder: 'Ver detalle de la orden',
        backToShop: 'Volver a la tienda',
      }
    : {
        successKicker: 'Mock order placement',
        successTitle: 'Order placed successfully',
        successDescription: 'You completed the full quote → reserve → confirm → place order flow with a coherent mock response.',
        orderId: 'orderId',
        reservationId: 'reservationId',
        createdAt: 'Created at',
        source: 'Source',
        lines: 'Order detail',
        quantity: 'Quantity',
        unitPrice: 'Unit price',
        lineSubtotal: 'Line subtotal',
        summary: 'Final summary',
        requestedPoints: 'Requested points',
        reservedPoints: 'Applied points',
        coveredAmount: 'Covered amount',
        payableAmount: 'Paid amount',
        viewHistory: 'View order history',
        viewOrder: 'View order detail',
        backToShop: 'Back to shop',
      };

  return (
    <section className="grid grid--two store-cart-layout">
      <div className="stack">
        <div className="customer-card customer-card--soft">
          <div className="stack stack--sm">
            <span className="section-kicker">{copy.successKicker}</span>
            <h2 className="section-title">{copy.successTitle}</h2>
            <p className="muted">{copy.successDescription}</p>
            <div className="data-list">
              <div className="data-row">
                <span className="data-label">{copy.orderId}</span>
                <span className="data-value">{order.orderId}</span>
              </div>
              <div className="data-row">
                <span className="data-label">{copy.reservationId}</span>
                <span className="data-value">{order.reservationId}</span>
              </div>
              <div className="data-row">
                <span className="data-label">{copy.createdAt}</span>
                <span className="data-value">{formatDateTime(order.createdAt, locale)}</span>
              </div>
              <div className="data-row">
                <span className="data-label">{copy.source}</span>
                <span className="data-value">{order.source}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="customer-card customer-card--default">
          <div className="stack stack--sm">
            <span className="section-kicker">{copy.lines}</span>
            {order.lines.map((line) => (
              <div key={`${line.productId}-${line.sku}`} className="cart-line">
                <div className="cart-line__meta">
                  {line.categoryName ? <span className="info-chip">{line.categoryName}</span> : null}
                  <strong>{line.name}</strong>
                  <small className="muted">SKU: {line.sku}</small>
                </div>
                <div className="cart-line__controls cart-line__controls--summary">
                  <small className="muted">{copy.quantity}: {line.quantity}</small>
                  <small className="muted">{copy.unitPrice}: {formatUsd(line.unitPriceUsd, locale)}</small>
                  <strong>{copy.lineSubtotal}: {formatUsd(line.lineSubtotalUsd, locale)}</strong>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <aside className="stack">
        <div className="customer-card customer-card--default">
          <div className="stack stack--sm">
            <span className="section-kicker">{copy.summary}</span>
            <div className="data-list">
              <div className="data-row">
                <span className="data-label">Subtotal USD</span>
                <span className="data-value">{formatUsd(order.summary.subtotalUsd, locale)}</span>
              </div>
              <div className="data-row">
                <span className="data-label">{copy.requestedPoints}</span>
                <span className="data-value">{formatPoints(order.summary.requestedPoints, locale)} pts</span>
              </div>
              <div className="data-row">
                <span className="data-label">{copy.reservedPoints}</span>
                <span className="data-value">{formatPoints(order.summary.reservedPoints, locale)} pts</span>
              </div>
              <div className="data-row">
                <span className="data-label">{copy.coveredAmount}</span>
                <span className="data-value">-{formatUsd(order.summary.coveredUsd, locale)}</span>
              </div>
              <div className="data-row">
                <span className="data-label">{copy.payableAmount}</span>
                <span className="data-value data-value--strong">{formatUsd(order.summary.payableUsd, locale)}</span>
              </div>
            </div>
            <div className="hero-actions">
              <Link href={`/${locale}/shop/orders`} className="button button--primary">
                {copy.viewHistory}
              </Link>
              <Link href={`/${locale}/shop/orders/${order.orderId}`} className="button button--secondary">
                {copy.viewOrder}
              </Link>
              <Link href={`/${locale}/shop`} className="button button--ghost">
                {copy.backToShop}
              </Link>
            </div>
          </div>
        </div>
      </aside>
    </section>
  );
}
