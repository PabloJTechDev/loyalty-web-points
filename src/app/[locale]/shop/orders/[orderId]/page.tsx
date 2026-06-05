import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getDemoSession } from '@/lib/auth/session';
import { CustomerCard } from '@/features/customer/components/CustomerCard';
import { CustomerPageHeader } from '@/features/customer/components/CustomerPageHeader';
import { CustomerShell } from '@/features/customer/components/CustomerShell';
import { SectionTitle } from '@/features/customer/components/SectionTitle';
import { getDictionary } from '@/lib/i18n/dictionaries';
import { isLocale, type Locale } from '@/lib/i18n/config';
import { formatPoints } from '@/lib/i18n/format';
import { getStorefrontOrderById } from '@/lib/api/storefront';

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

export default async function StoreOrderDetailPage({
  params,
}: {
  params: Promise<{ locale: string; orderId: string }>;
}) {
  const { locale, orderId } = await params;
  if (!isLocale(locale)) notFound();

  const [dictionary, authenticatedSession, order] = await Promise.all([
    Promise.resolve(getDictionary(locale)),
    getDemoSession(),
    getStorefrontOrderById(orderId),
  ]);

  if (!order) notFound();

  return (
    <CustomerShell locale={locale} dictionary={dictionary} authenticatedSession={authenticatedSession}>
      <CustomerPageHeader
        badge={locale === 'es' ? 'Order detail mock' : 'Mock order detail'}
        title={locale === 'es' ? 'Detalle de la orden' : 'Order detail'}
        description={locale === 'es'
          ? 'Vista simple de order detail para cerrar el journey storefront con evidencia visible.'
          : 'Simple order detail view to close the storefront journey with visible evidence.'}
        aside={<div className="info-chip info-chip--success">{order.orderId}</div>}
      />

      <section className="grid grid--two store-cart-layout">
        <div className="stack">
          <CustomerCard tone="soft">
            <div className="stack stack--sm">
              <SectionTitle>{locale === 'es' ? 'Cabecera de la orden' : 'Order header'}</SectionTitle>
              <div className="data-list">
                <div className="data-row">
                  <span className="data-label">orderId</span>
                  <span className="data-value">{order.orderId}</span>
                </div>
                <div className="data-row">
                  <span className="data-label">reservationId</span>
                  <span className="data-value">{order.reservationId}</span>
                </div>
                <div className="data-row">
                  <span className="data-label">status</span>
                  <span className="data-value">{order.status}</span>
                </div>
                <div className="data-row">
                  <span className="data-label">createdAt</span>
                  <span className="data-value">{formatDateTime(order.createdAt, locale)}</span>
                </div>
                <div className="data-row">
                  <span className="data-label">source</span>
                  <span className="data-value">{order.source}</span>
                </div>
              </div>
            </div>
          </CustomerCard>

          <CustomerCard>
            <div className="stack stack--sm">
              <SectionTitle>{locale === 'es' ? 'Líneas de la orden' : 'Order lines'}</SectionTitle>
              {order.lines.map((line) => (
                <div key={`${line.productId}-${line.sku}`} className="cart-line">
                  <div className="cart-line__meta">
                    {line.categoryName ? <span className="info-chip">{line.categoryName}</span> : null}
                    <strong>{line.name}</strong>
                    <small className="muted">SKU: {line.sku}</small>
                  </div>
                  <div className="cart-line__controls cart-line__controls--summary">
                    <small className="muted">{locale === 'es' ? 'Cantidad' : 'Quantity'}: {line.quantity}</small>
                    <small className="muted">{locale === 'es' ? 'Unitario' : 'Unit price'}: {formatUsd(line.unitPriceUsd, locale)}</small>
                    <strong>{formatUsd(line.lineSubtotalUsd, locale)}</strong>
                  </div>
                </div>
              ))}
            </div>
          </CustomerCard>
        </div>

        <aside className="stack">
          <CustomerCard>
            <div className="stack stack--sm">
              <SectionTitle>{locale === 'es' ? 'Resumen económico' : 'Financial summary'}</SectionTitle>
              <div className="data-list">
                <div className="data-row">
                  <span className="data-label">Subtotal USD</span>
                  <span className="data-value">{formatUsd(order.summary.subtotalUsd, locale)}</span>
                </div>
                <div className="data-row">
                  <span className="data-label">{locale === 'es' ? 'Puntos solicitados' : 'Requested points'}</span>
                  <span className="data-value">{formatPoints(order.summary.requestedPoints, locale)} pts</span>
                </div>
                <div className="data-row">
                  <span className="data-label">{locale === 'es' ? 'Puntos aplicados' : 'Applied points'}</span>
                  <span className="data-value">{formatPoints(order.summary.reservedPoints, locale)} pts</span>
                </div>
                <div className="data-row">
                  <span className="data-label">{locale === 'es' ? 'Monto cubierto' : 'Covered amount'}</span>
                  <span className="data-value">-{formatUsd(order.summary.coveredUsd, locale)}</span>
                </div>
                <div className="data-row">
                  <span className="data-label">{locale === 'es' ? 'Total pagado' : 'Paid total'}</span>
                  <span className="data-value data-value--strong">{formatUsd(order.summary.payableUsd, locale)}</span>
                </div>
              </div>
              <div className="link-list">
                <Link href={`/${locale}/shop/orders`}>
                  {locale === 'es' ? 'Volver al historial' : 'Back to order history'}
                </Link>
                <Link href={`/${locale}/shop`}>
                  {locale === 'es' ? 'Seguir explorando catálogo' : 'Keep exploring the catalog'}
                </Link>
              </div>
            </div>
          </CustomerCard>
        </aside>
      </section>
    </CustomerShell>
  );
}
