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
import { getStorefrontOrders } from '@/lib/api/storefront';

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

export default async function StoreOrdersPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const [dictionary, authenticatedSession, orders] = await Promise.all([
    Promise.resolve(getDictionary(locale)),
    getDemoSession(),
    getStorefrontOrders(),
  ]);

  const copy = locale === 'es'
    ? {
        badge: 'Order history mock',
        title: 'Historial de órdenes',
        description: 'Órdenes creadas desde el flujo storefront actual, incluyendo fallback local cuando el BFF aún no expone historial.',
        emptyTitle: 'Todavía no tienes órdenes',
        emptyBody: 'Cuando completes una compra en storefront, aquí verás su estado, fecha y total pagado.',
        goToShop: 'Ir a la tienda',
        backToCheckout: 'Volver a checkout',
        placedOn: 'Creada en',
        items: 'Items',
        appliedPoints: 'Puntos aplicados',
        paidTotal: 'Total pagado',
        viewDetail: 'Ver detalle',
      }
    : {
        badge: 'Mock order history',
        title: 'Order history',
        description: 'Orders created from the current storefront flow, including local fallback when the BFF does not expose history yet.',
        emptyTitle: 'You do not have any orders yet',
        emptyBody: 'Once you complete a storefront purchase, you will see its status, date, and paid total here.',
        goToShop: 'Go to shop',
        backToCheckout: 'Back to checkout',
        placedOn: 'Placed on',
        items: 'Items',
        appliedPoints: 'Applied points',
        paidTotal: 'Paid total',
        viewDetail: 'View detail',
      };

  return (
    <CustomerShell locale={locale} dictionary={dictionary} authenticatedSession={authenticatedSession}>
      <CustomerPageHeader
        badge={copy.badge}
        title={copy.title}
        description={copy.description}
        aside={<div className="info-chip">{orders.length}</div>}
      />

      {!orders.length ? (
        <section className="section-block">
          <CustomerCard tone="soft">
            <div className="stack stack--sm">
              <SectionTitle>{copy.emptyTitle}</SectionTitle>
              <p className="muted">{copy.emptyBody}</p>
              <div className="hero-actions">
                <Link href={`/${locale}/shop`} className="button button--primary">
                  {copy.goToShop}
                </Link>
                <Link href={`/${locale}/shop/checkout`} className="button button--secondary">
                  {copy.backToCheckout}
                </Link>
              </div>
            </div>
          </CustomerCard>
        </section>
      ) : (
        <section className="section-block">
          <div className="stack">
            {orders.map((order) => (
              <CustomerCard key={order.orderId}>
                <div className="stack stack--sm">
                  <div className="cart-line">
                    <div className="cart-line__meta">
                      <span className="info-chip info-chip--success">{order.status}</span>
                      <strong>{order.orderId}</strong>
                      <small className="muted">{copy.placedOn}: {formatDateTime(order.createdAt, locale)}</small>
                    </div>
                    <div className="cart-line__controls cart-line__controls--summary">
                      <small className="muted">{copy.items}: {order.summary.itemCount}</small>
                      <small className="muted">{copy.appliedPoints}: {formatPoints(order.summary.reservedPoints, locale)} pts</small>
                      <strong>{copy.paidTotal}: {formatUsd(order.summary.payableUsd, locale)}</strong>
                    </div>
                  </div>
                  <div className="link-list">
                    <Link href={`/${locale}/shop/orders/${order.orderId}`}>{copy.viewDetail}</Link>
                  </div>
                </div>
              </CustomerCard>
            ))}
          </div>
        </section>
      )}
    </CustomerShell>
  );
}
