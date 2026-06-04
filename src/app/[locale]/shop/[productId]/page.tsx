import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getDemoSession } from '@/lib/auth/session';
import { getCustomerWallet } from '@/lib/api/customer';
import { getStorefrontProductById, getStorefrontQuote } from '@/lib/api/storefront';
import { CustomerCard } from '@/features/customer/components/CustomerCard';
import { CustomerPageHeader } from '@/features/customer/components/CustomerPageHeader';
import { CustomerShell } from '@/features/customer/components/CustomerShell';
import { SectionTitle } from '@/features/customer/components/SectionTitle';
import { StorefrontCartLink } from '@/features/storefront/components/StorefrontCartLink';
import { StorefrontProductActions } from '@/features/storefront/components/StorefrontProductActions';
import { getDictionary } from '@/lib/i18n/dictionaries';
import { isLocale, type Locale } from '@/lib/i18n/config';
import { formatPoints } from '@/lib/i18n/format';

function formatUsd(amount: number, locale: Locale) {
  return new Intl.NumberFormat(locale === 'es' ? 'es-CL' : 'en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

export default async function StoreProductDetailPage({
  params,
}: {
  params: Promise<{ locale: string; productId: string }>;
}) {
  const { locale, productId } = await params;
  if (!isLocale(locale)) notFound();

  const [dictionary, authenticatedSession, wallet, product] = await Promise.all([
    Promise.resolve(getDictionary(locale)),
    getDemoSession(),
    getCustomerWallet(),
    getStorefrontProductById(locale, productId),
  ]);

  if (!product) notFound();

  const quotePreview = await getStorefrontQuote(locale, [{ productId: product.id, quantity: 1 }], {
    availablePoints: wallet.summary.availablePoints,
    requestedPoints: wallet.summary.availablePoints,
  });

  return (
    <CustomerShell locale={locale} dictionary={dictionary} authenticatedSession={authenticatedSession}>
      <CustomerPageHeader
        badge={`${product.categoryName} · ${product.sku}`}
        title={product.name}
        description={product.shortDescription}
        aside={<StorefrontCartLink href={`/${locale}/shop/cart`} locale={locale} />}
      />

      <section className="grid grid--two store-pdp-layout">
        <CustomerCard>
          <div className="stack">
            <div className="store-pdp-hero">
              <div className="store-pdp-hero__copy">
                <span className="info-chip">{locale === 'es' ? 'PDP demo' : 'Demo PDP'}</span>
                <SectionTitle>{locale === 'es' ? 'Producto storefront' : 'Storefront product'}</SectionTitle>
                <p className="muted">{product.eligibilityNote}</p>
              </div>
              <div className="store-pdp-hero__price">
                <strong>{formatUsd(product.priceUsd, locale)}</strong>
                <small>{formatPoints(product.pointsFrom, locale)} pts eq.</small>
              </div>
            </div>

            <div className="bullet-list bullet-list--cards">
              <div className="bullet-list__item">
                <strong>{locale === 'es' ? 'SKU' : 'SKU'}</strong>
                <p className="muted">{product.sku}</p>
              </div>
              <div className="bullet-list__item">
                <strong>{locale === 'es' ? 'Categoría' : 'Category'}</strong>
                <p className="muted">{product.categoryName}</p>
              </div>
              <div className="bullet-list__item">
                <strong>{locale === 'es' ? 'Equivalencia demo' : 'Demo equivalence'}</strong>
                <p className="muted">
                  {locale === 'es'
                    ? `Hasta 30% del total, con mínimo de ${formatPoints(quotePreview.summary.minRedeemablePoints, locale)} pts.`
                    : `Up to 30% of the total, with a ${formatPoints(quotePreview.summary.minRedeemablePoints, locale)} pt minimum.`}
                </p>
              </div>
            </div>

            <StorefrontProductActions locale={locale} productId={product.id} />
          </div>
        </CustomerCard>

        <div className="stack">
          <CustomerCard tone="soft">
            <div className="stack stack--sm">
              <SectionTitle>{locale === 'es' ? 'Preview de quote' : 'Quote preview'}</SectionTitle>
              <div className="data-list">
                <div className="data-row">
                  <span className="data-label">{locale === 'es' ? 'Subtotal USD' : 'USD subtotal'}</span>
                  <span className="data-value">{formatUsd(quotePreview.summary.subtotalUsd, locale)}</span>
                </div>
                <div className="data-row">
                  <span className="data-label">{locale === 'es' ? 'Equivalencia puntos' : 'Points equivalence'}</span>
                  <span className="data-value">{formatPoints(quotePreview.summary.equivalentPoints, locale)} pts</span>
                </div>
                <div className="data-row">
                  <span className="data-label">{locale === 'es' ? 'Máximo aplicable' : 'Maximum applicable'}</span>
                  <span className="data-value">{formatPoints(quotePreview.summary.maxRedeemablePoints, locale)} pts</span>
                </div>
                <div className="data-row">
                  <span className="data-label">{locale === 'es' ? 'Saldo wallet' : 'Wallet balance'}</span>
                  <span className="data-value">{formatPoints(wallet.summary.availablePoints, locale)} pts</span>
                </div>
              </div>
            </div>
          </CustomerCard>

          <CustomerCard>
            <div className="stack stack--sm">
              <SectionTitle>{locale === 'es' ? 'Siguientes pasos BFF' : 'Next BFF steps'}</SectionTitle>
              <div className="link-list">
                <Link href={`/${locale}/shop`}>{locale === 'es' ? 'Volver al catálogo storefront' : 'Back to the storefront catalog'}</Link>
                <Link href={`/${locale}/wallet`}>{locale === 'es' ? 'Validar saldo y movimientos' : 'Validate balance and movements'}</Link>
                <Link href={`/${locale}/profile-summary`}>{locale === 'es' ? 'Confirmar contexto cliente' : 'Confirm customer context'}</Link>
              </div>
            </div>
          </CustomerCard>
        </div>
      </section>
    </CustomerShell>
  );
}
