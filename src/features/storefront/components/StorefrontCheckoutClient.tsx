'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import type { Locale } from '@/lib/i18n/config';
import { formatPoints } from '@/lib/i18n/format';
import type { StorefrontCatalogItem } from '@/lib/mocks/storefront-catalog';
import { useDemoCart } from '@/features/storefront/hooks/useDemoCart';
import { buildStorefrontFallbackQuote } from '@/lib/storefront/quote';

interface ReservationFeedback {
  status?: 'reserved' | 'simulated' | 'rejected' | 'confirmed' | 'cancelled';
  reservedPoints?: number;
  coveredUsd?: number;
  payableUsd?: number;
  requestedPoints?: number;
  reservationId?: string;
  message?: string;
  source?: string;
  integrationError?: string;
  actionStatus?: 'confirmed' | 'cancelled' | 'rejected';
  actionType?: 'confirm' | 'cancel';
  actionMessage?: string;
  releasedPoints?: number;
}

interface StorefrontCheckoutClientProps {
  locale: Locale;
  products: StorefrontCatalogItem[];
  availablePoints: number;
  feedback?: ReservationFeedback;
}

function formatUsd(amount: number, locale: Locale) {
  return new Intl.NumberFormat(locale === 'es' ? 'es-CL' : 'en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

function hasActiveReservation(status?: ReservationFeedback['status']) {
  return status === 'reserved' || status === 'simulated';
}

export function StorefrontCheckoutClient({
  locale,
  products,
  availablePoints,
  feedback,
}: StorefrontCheckoutClientProps) {
  const { items, isHydrated } = useDemoCart();
  const [requestedPoints, setRequestedPoints] = useState(feedback?.requestedPoints ?? 0);

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
        loading: 'Cargando checkout…',
        emptyTitle: 'No hay productos para resumir todavía',
        emptyDescription: 'Vuelve al carrito, agrega productos y luego continúa con checkout summary.',
        backToCart: 'Volver al carrito',
        continueShopping: 'Seguir comprando',
        orderSummary: 'Resumen de checkout',
        orderLines: 'Productos en checkout',
        subtotal: 'Subtotal USD',
        pointsToReserve: 'Puntos a reservar',
        coveredAmount: 'Monto cubierto',
        payableAmount: 'Monto a pagar',
        equivalent: 'Equivalencia total',
        walletBalance: 'Saldo wallet',
        reserveRules: 'Reglas de reserva',
        minRule: 'Mínimo 500 pts aplicados para reservar.',
        capRule: 'Tope 30% del equivalente total del carrito.',
        clampRule: 'Si pides más puntos de los permitidos, el quote los ajusta automáticamente.',
        reserveButton: 'Reservar puntos',
        reserveDisabled: 'Aún no cumples las reglas para reservar puntos.',
        checkoutReady: 'Checkout listo para BFF',
        checkoutDescription:
          'Este summary usa el carrito actual y deja lista la llamada de reserva. Si el endpoint no existe aún, la UI cae a un fallback controlado.',
        quantity: 'Cantidad',
        reserveSource: 'Fuente reserva',
        reserveResult: 'Resultado reserva',
        reservationState: 'Estado visible',
        requestedVisible: 'Puntos solicitados',
        releasedVisible: 'Puntos liberados',
        statePending: 'Pendiente de confirmación',
        stateConfirmed: 'Confirmada',
        stateCancelled: 'Cancelada',
        stateRejected: 'No disponible',
        simulated: 'Reserva simulada',
        reserved: 'Reserva confirmada en BFF',
        confirmed: 'Reserva confirmada en checkout',
        cancelled: 'Reserva cancelada en checkout',
        rejected: 'Reserva rechazada',
        reservationId: 'reservationId',
        integrationError: 'Último error integración',
        confirmButton: 'Confirmar reserva',
        cancelButton: 'Cancelar reserva',
        actionResult: 'Acción aplicada',
        actionConfirm: 'Confirmación ejecutada',
        actionCancel: 'Cancelación ejecutada',
        noReservationActions: 'Primero necesitas una reserva activa para confirmar o cancelar.',
        reservationPanelTitle: 'Estado de la reserva',
        reservationPanelDescription: 'El checkout deja visible el estado actual y ofrece acciones de confirmación/cancelación sobre la reserva más reciente.',
      }
    : {
        loading: 'Loading checkout…',
        emptyTitle: 'There are no products to summarize yet',
        emptyDescription: 'Go back to the cart, add products, and then continue to the checkout summary.',
        backToCart: 'Back to cart',
        continueShopping: 'Continue shopping',
        orderSummary: 'Checkout summary',
        orderLines: 'Products in checkout',
        subtotal: 'USD subtotal',
        pointsToReserve: 'Points to reserve',
        coveredAmount: 'Covered amount',
        payableAmount: 'Amount to pay',
        equivalent: 'Total equivalent',
        walletBalance: 'Wallet balance',
        reserveRules: 'Reservation rules',
        minRule: 'Minimum 500 applied pts required before reserving.',
        capRule: '30% cap based on the cart total equivalent.',
        clampRule: 'If you request more points than allowed, the quote clamps them automatically.',
        reserveButton: 'Reserve points',
        reserveDisabled: 'This cart does not meet the current rules to reserve points yet.',
        checkoutReady: 'Checkout ready for BFF',
        checkoutDescription:
          'This summary uses the current cart and keeps the reserve call ready. If the endpoint does not exist yet, the UI falls back in a controlled way.',
        quantity: 'Quantity',
        reserveSource: 'Reserve source',
        reserveResult: 'Reserve result',
        reservationState: 'Visible state',
        requestedVisible: 'Requested points',
        releasedVisible: 'Released points',
        statePending: 'Pending confirmation',
        stateConfirmed: 'Confirmed',
        stateCancelled: 'Cancelled',
        stateRejected: 'Unavailable',
        simulated: 'Simulated reservation',
        reserved: 'Reservation confirmed by BFF',
        confirmed: 'Reservation confirmed in checkout',
        cancelled: 'Reservation cancelled in checkout',
        rejected: 'Reservation rejected',
        reservationId: 'reservationId',
        integrationError: 'Latest integration error',
        confirmButton: 'Confirm reservation',
        cancelButton: 'Cancel reservation',
        actionResult: 'Action result',
        actionConfirm: 'Confirmation executed',
        actionCancel: 'Cancellation executed',
        noReservationActions: 'You need an active reservation first before confirming or cancelling.',
        reservationPanelTitle: 'Reservation state',
        reservationPanelDescription: 'Checkout keeps the latest reservation visible and exposes confirm/cancel actions on top of it.',
      };

  const activeReservation = hasActiveReservation(feedback?.status);

  const feedbackTone = feedback?.status === 'rejected' || feedback?.actionStatus === 'rejected'
    ? 'trace-notice trace-notice--error'
    : feedback?.status || feedback?.actionStatus
      ? 'trace-notice trace-notice--success'
      : '';

  const feedbackTitle = feedback?.status === 'reserved'
    ? copy.reserved
    : feedback?.status === 'rejected'
      ? copy.rejected
      : feedback?.status === 'simulated'
        ? copy.simulated
        : feedback?.status === 'confirmed'
          ? copy.confirmed
          : feedback?.status === 'cancelled'
            ? copy.cancelled
            : null;

  const actionTitle = feedback?.actionType === 'confirm'
    ? copy.actionConfirm
    : feedback?.actionType === 'cancel'
      ? copy.actionCancel
      : null;

  const visibleStateLabel = feedback?.status === 'confirmed'
    ? copy.stateConfirmed
    : feedback?.status === 'cancelled'
      ? copy.stateCancelled
      : feedback?.status === 'rejected'
        ? copy.stateRejected
        : activeReservation
          ? copy.statePending
          : copy.stateRejected;

  if (!isHydrated) {
    return <p className="muted">{copy.loading}</p>;
  }

  if (!itemView.length) {
    return (
      <div className="empty-trace-panel">
        <strong>{copy.emptyTitle}</strong>
        <p>{copy.emptyDescription}</p>
        <div className="hero-actions">
          <Link href={`/${locale}/shop/cart`} className="button button--secondary">
            {copy.backToCart}
          </Link>
          <Link href={`/${locale}/shop`} className="button button--ghost">
            {copy.continueShopping}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid--two store-cart-layout">
      <div className="stack">
        <div className="customer-card customer-card--default">
          <div className="stack stack--sm">
            <span className="section-kicker">{copy.orderLines}</span>
            {itemView.map(({ product, quantity }) => (
              <div key={product.id} className="cart-line">
                <div className="cart-line__meta">
                  <span className="info-chip">{product.categoryName}</span>
                  <strong>{product.name}</strong>
                  <p className="muted">{product.shortDescription}</p>
                  <small className="muted">
                    {copy.quantity}: {quantity} · {formatUsd(product.priceUsd, locale)} · {formatPoints(product.pointsFrom, locale)} pts eq.
                  </small>
                </div>
                <div className="cart-line__controls cart-line__controls--summary">
                  <strong>{formatUsd(product.priceUsd * quantity, locale)}</strong>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="customer-card customer-card--soft">
          <div className="stack stack--sm storefront-reservation-state">
            <span className="section-kicker">{copy.reservationPanelTitle}</span>
            <p className="muted">{copy.reservationPanelDescription}</p>
            <div className="data-list">
              <div className="data-row">
                <span className="data-label">{copy.reservationState}</span>
                <span className="data-value">
                  <span className={`info-chip ${activeReservation ? 'info-chip--success' : ''}`}>{visibleStateLabel}</span>
                </span>
              </div>
              <div className="data-row">
                <span className="data-label">{copy.requestedVisible}</span>
                <span className="data-value">{formatPoints(feedback?.requestedPoints ?? quote.summary.appliedPoints, locale)} pts</span>
              </div>
              <div className="data-row">
                <span className="data-label">{copy.pointsToReserve}</span>
                <span className="data-value">{formatPoints(feedback?.reservedPoints ?? quote.summary.appliedPoints, locale)} pts</span>
              </div>
              {typeof feedback?.releasedPoints === 'number' ? (
                <div className="data-row">
                  <span className="data-label">{copy.releasedVisible}</span>
                  <span className="data-value">{formatPoints(feedback.releasedPoints, locale)} pts</span>
                </div>
              ) : null}
              {feedback?.reservationId ? (
                <div className="data-row">
                  <span className="data-label">{copy.reservationId}</span>
                  <span className="data-value">{feedback.reservationId}</span>
                </div>
              ) : null}
            </div>
          </div>
        </div>

        {feedbackTitle && feedback?.message ? (
          <div className={feedbackTone}>
            <strong>{copy.reserveResult}: {feedbackTitle}</strong>
            <p>{feedback.message}</p>
            {feedback.reservationId ? <p>{copy.reservationId}: {feedback.reservationId}</p> : null}
            {feedback.source ? <p>{copy.reserveSource}: {feedback.source}</p> : null}
            {feedback.integrationError ? <p>{copy.integrationError}: {feedback.integrationError}</p> : null}
          </div>
        ) : null}

        {actionTitle && feedback?.actionMessage ? (
          <div className={feedbackTone}>
            <strong>{copy.actionResult}: {actionTitle}</strong>
            <p>{feedback.actionMessage}</p>
            {typeof feedback.releasedPoints === 'number' ? (
              <p>{copy.releasedVisible}: {formatPoints(feedback.releasedPoints, locale)} pts</p>
            ) : null}
            {feedback.integrationError ? <p>{copy.integrationError}: {feedback.integrationError}</p> : null}
          </div>
        ) : null}
      </div>

      <aside className="stack">
        <div className="customer-card customer-card--soft">
          <div className="stack stack--sm">
            <span className="section-kicker">{copy.checkoutReady}</span>
            <p className="muted">{copy.checkoutDescription}</p>
            <div className="data-list">
              <div className="data-row">
                <span className="data-label">{copy.walletBalance}</span>
                <span className="data-value">{formatPoints(availablePoints, locale)} pts</span>
              </div>
              <div className="data-row">
                <span className="data-label">{copy.equivalent}</span>
                <span className="data-value">{formatPoints(quote.summary.equivalentPoints, locale)} pts</span>
              </div>
              <div className="data-row">
                <span className="data-label">{copy.pointsToReserve}</span>
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
            <div className="empty-trace-panel">
              <strong>{copy.reserveRules}</strong>
              <p>{copy.minRule}</p>
              <p>{copy.capRule}</p>
              <p>{copy.clampRule}</p>
            </div>
          </div>
        </div>

        <div className="customer-card customer-card--default">
          <div className="data-list">
            <div className="data-row">
              <span className="data-label">{copy.subtotal}</span>
              <span className="data-value">{formatUsd(quote.summary.subtotalUsd, locale)}</span>
            </div>
            <div className="data-row">
              <span className="data-label">{copy.pointsToReserve}</span>
              <span className="data-value">{formatPoints(feedback?.reservedPoints ?? quote.summary.appliedPoints, locale)} pts</span>
            </div>
            <div className="data-row">
              <span className="data-label">{copy.coveredAmount}</span>
              <span className="data-value">-{formatUsd(feedback?.coveredUsd ?? quote.summary.appliedUsd, locale)}</span>
            </div>
            <div className="data-row">
              <span className="data-label">{copy.payableAmount}</span>
              <span className="data-value data-value--strong">{formatUsd(feedback?.payableUsd ?? quote.summary.remainingUsd, locale)}</span>
            </div>
          </div>

          <form action="/api/storefront-reserve" method="post" className="stack stack--sm storefront-reserve-form">
            <input type="hidden" name="locale" value={locale} />
            <input type="hidden" name="items" value={JSON.stringify(items)} />
            <input type="hidden" name="availablePoints" value={String(availablePoints)} />
            <input type="hidden" name="requestedPoints" value={String(safeRequestedPoints)} />
            <button type="submit" className="button button--primary button--full" disabled={!quote.summary.canRedeem}>
              {copy.reserveButton}
            </button>
            {!quote.summary.canRedeem ? <p className="trace-note">{copy.reserveDisabled}</p> : null}
          </form>

          <div className="storefront-reservation-actions">
            <form action="/api/storefront-reservation-action" method="post" className="stack stack--sm storefront-reserve-form">
              <input type="hidden" name="locale" value={locale} />
              <input type="hidden" name="action" value="confirm" />
              <input type="hidden" name="items" value={JSON.stringify(items)} />
              <input type="hidden" name="availablePoints" value={String(availablePoints)} />
              <input type="hidden" name="requestedPoints" value={String(feedback?.requestedPoints ?? safeRequestedPoints)} />
              <input type="hidden" name="reserveStatus" value={feedback?.status ?? ''} />
              <input type="hidden" name="reservedPoints" value={String(feedback?.reservedPoints ?? quote.summary.appliedPoints)} />
              <input type="hidden" name="coveredUsd" value={String(feedback?.coveredUsd ?? quote.summary.appliedUsd)} />
              <input type="hidden" name="payableUsd" value={String(feedback?.payableUsd ?? quote.summary.remainingUsd)} />
              <input type="hidden" name="reservationId" value={feedback?.reservationId ?? ''} />
              <input type="hidden" name="message" value={feedback?.message ?? ''} />
              <input type="hidden" name="source" value={feedback?.source ?? ''} />
              <input type="hidden" name="integrationError" value={feedback?.integrationError ?? ''} />
              <button type="submit" className="button button--secondary button--full" disabled={!activeReservation}>
                {copy.confirmButton}
              </button>
            </form>

            <form action="/api/storefront-reservation-action" method="post" className="stack stack--sm storefront-reserve-form">
              <input type="hidden" name="locale" value={locale} />
              <input type="hidden" name="action" value="cancel" />
              <input type="hidden" name="items" value={JSON.stringify(items)} />
              <input type="hidden" name="availablePoints" value={String(availablePoints)} />
              <input type="hidden" name="requestedPoints" value={String(feedback?.requestedPoints ?? safeRequestedPoints)} />
              <input type="hidden" name="reserveStatus" value={feedback?.status ?? ''} />
              <input type="hidden" name="reservedPoints" value={String(feedback?.reservedPoints ?? quote.summary.appliedPoints)} />
              <input type="hidden" name="coveredUsd" value={String(feedback?.coveredUsd ?? quote.summary.appliedUsd)} />
              <input type="hidden" name="payableUsd" value={String(feedback?.payableUsd ?? quote.summary.remainingUsd)} />
              <input type="hidden" name="reservationId" value={feedback?.reservationId ?? ''} />
              <input type="hidden" name="message" value={feedback?.message ?? ''} />
              <input type="hidden" name="source" value={feedback?.source ?? ''} />
              <input type="hidden" name="integrationError" value={feedback?.integrationError ?? ''} />
              <button type="submit" className="button button--ghost button--full" disabled={!activeReservation}>
                {copy.cancelButton}
              </button>
            </form>
          </div>

          {!activeReservation ? <p className="trace-note">{copy.noReservationActions}</p> : null}

          <div className="hero-actions">
            <Link href={`/${locale}/shop/cart`} className="button button--secondary">
              {copy.backToCart}
            </Link>
            <Link href={`/${locale}/shop`} className="button button--ghost">
              {copy.continueShopping}
            </Link>
          </div>
        </div>
      </aside>
    </div>
  );
}
