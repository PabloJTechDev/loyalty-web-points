import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getDemoSession } from '@/lib/auth/session';
import { getStorefrontCatalog } from '@/lib/api/storefront';
import { CustomerCard } from '@/features/customer/components/CustomerCard';
import { CustomerPageHeader } from '@/features/customer/components/CustomerPageHeader';
import { CustomerShell } from '@/features/customer/components/CustomerShell';
import { SectionTitle } from '@/features/customer/components/SectionTitle';
import { StorefrontAddToCartButton } from '@/features/storefront/components/StorefrontAddToCartButton';
import { StorefrontCartLink } from '@/features/storefront/components/StorefrontCartLink';
import { getDictionary } from '@/lib/i18n/dictionaries';
import { isLocale, type Locale } from '@/lib/i18n/config';
import { formatPoints } from '@/lib/i18n/format';

function formatUsd(amount: number, locale: Locale) {
  return new Intl.NumberFormat(locale === 'es' ? 'es-CL' : 'en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(amount);
}

export default async function ShopPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const [catalog, dictionary, authenticatedSession] = await Promise.all([
    getStorefrontCatalog(locale),
    Promise.resolve(getDictionary(locale)),
    getDemoSession(),
  ]);

  return (
    <CustomerShell locale={locale} dictionary={dictionary} authenticatedSession={authenticatedSession}>
      <CustomerPageHeader
        badge={`${dictionary.home.badge} · storefront: ${catalog.source}`}
        title={locale === 'es' ? 'Tienda demo' : 'Demo store'}
        description={
          locale === 'es'
            ? 'Storefront preparado para consumir catálogo real vía BFF/redemption si existe; mientras tanto cae a un catálogo mock coherente sin tocar login, profile ni wallet.'
            : 'Storefront prepared to consume a real catalog through BFF/redemption if available; meanwhile it falls back to a coherent mock catalog without touching login, profile, or wallet.'
        }
        aside={
          <div className="stack stack--sm store-shop-aside">
            <div className="info-chip">{catalog.integrations.storefront.available ? 'Storefront API' : 'Storefront fallback'}</div>
            <StorefrontCartLink href={`/${locale}/shop/cart`} locale={locale} />
          </div>
        }
      />

      <section className="grid grid--equal">
        {catalog.items.map((product) => (
          <CustomerCard key={product.id}>
            <div className="stack stack--sm">
              <span className="info-chip">{product.categoryName}</span>
              <SectionTitle>{product.name}</SectionTitle>
              <p className="muted">{product.shortDescription}</p>
              <div className="store-product-card__pricing store-product-card__pricing--inline">
                <span>{formatUsd(product.priceUsd, locale)}</span>
                <small>
                  {locale === 'es' ? 'Desde' : 'From'} {formatPoints(product.pointsFrom, locale)} pts
                </small>
              </div>
              <p className="muted">{product.eligibilityNote}</p>
              <div className="store-card-actions">
                <Link href={`/${locale}/shop/${encodeURIComponent(product.id)}`} className="button button--secondary button--full">
                  {locale === 'es' ? 'Ver detalle' : 'View detail'}
                </Link>
                <StorefrontAddToCartButton
                  productId={product.id}
                  labels={locale === 'es'
                    ? { idle: 'Agregar al carrito', success: 'Agregado' }
                    : { idle: 'Add to cart', success: 'Added' }}
                />
              </div>
              <div className="link-list">
                <Link href={`/${locale}/wallet`}>
                  {locale === 'es' ? 'Revisar saldo antes de canjear' : 'Check balance before redeeming'}
                </Link>
                <Link href={`/${locale}/profile-summary`}>
                  {locale === 'es' ? 'Ver perfil y categoría loyalty' : 'View profile and loyalty tier'}
                </Link>
              </div>
            </div>
          </CustomerCard>
        ))}
      </section>

      <section className="section-block">
        <CustomerCard tone="soft">
          <div className="stack stack--sm">
            <SectionTitle>{locale === 'es' ? 'Estado de integración storefront' : 'Storefront integration status'}</SectionTitle>
            <div className="data-list">
              <div className="data-row">
                <span className="data-label">source</span>
                <span className="data-value">{catalog.source}</span>
              </div>
              <div className="data-row">
                <span className="data-label">available</span>
                <span className="data-value">{String(catalog.integrations.storefront.available)}</span>
              </div>
              <div className="data-row">
                <span className="data-label">baseUrl</span>
                <span className="data-value">{catalog.integrations.storefront.baseUrl ?? '—'}</span>
              </div>
              <div className="data-row">
                <span className="data-label">path</span>
                <span className="data-value">{catalog.integrations.storefront.path ?? '—'}</span>
              </div>
            </div>
            {catalog.integrations.storefront.error ? (
              <p className="muted">
                {locale === 'es' ? 'Último fallback:' : 'Latest fallback:'} {catalog.integrations.storefront.error}
              </p>
            ) : null}
          </div>
        </CustomerCard>
      </section>
    </CustomerShell>
  );
}
