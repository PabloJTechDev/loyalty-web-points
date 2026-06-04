import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getDemoSession } from '@/lib/auth/session';
import { getCustomerHome } from '@/lib/api/customer';
import { getStorefrontCatalog } from '@/lib/api/storefront';
import { CustomerBadge } from '@/features/customer/components/CustomerBadge';
import { CustomerCard } from '@/features/customer/components/CustomerCard';
import { MetricCard } from '@/features/customer/components/MetricCard';
import { CustomerShell } from '@/features/customer/components/CustomerShell';
import { SectionTitle } from '@/features/customer/components/SectionTitle';
import { getDictionary } from '@/lib/i18n/dictionaries';
import { isLocale, type Locale } from '@/lib/i18n/config';
import { formatDate, formatPoints } from '@/lib/i18n/format';

function formatUsd(amount: number, locale: Locale) {
  return new Intl.NumberFormat(locale === 'es' ? 'es-CL' : 'en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(amount);
}

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const [data, storefrontCatalog, dictionary, authenticatedSession] = await Promise.all([
    getCustomerHome(),
    getStorefrontCatalog(locale),
    Promise.resolve(getDictionary(locale)),
    getDemoSession(),
  ]);

  const cards = [
    {
      title: dictionary.home.metrics.available,
      value: formatPoints(data.wallet.availablePoints, locale),
      description: dictionary.home.metrics.availableDesc,
    },
    {
      title: dictionary.home.metrics.tier,
      value: data.membership.tier.name,
      description: locale === 'es'
        ? `Te faltan ${formatPoints(data.tierProgress.missingPoints, locale)} puntos para llegar a ${data.tierProgress.next}.`
        : `${formatPoints(data.tierProgress.missingPoints, locale)} points away from reaching ${data.tierProgress.next}.`,
    },
    {
      title: dictionary.home.metrics.expiring,
      value: formatPoints(data.wallet.expiringPoints, locale),
      description: `${dictionary.home.metrics.expiringDescPrefix} ${formatDate(data.wallet.expiringAt, locale)}.`,
    },
  ];

  return (
    <CustomerShell locale={locale} dictionary={dictionary} authenticatedSession={authenticatedSession}>
      <section className="landing-hero">
        <div className="landing-hero__copy">
          <CustomerBadge
            label={`${dictionary.home.badge} · ${dictionary.common.source}: ${data.source ?? 'unknown'} · storefront: ${storefrontCatalog.source}`}
          />

          <div className="landing-hero__text">
            <h2 className="landing-hero__title">{dictionary.home.title}</h2>
            <p className="landing-hero__description">{dictionary.home.description}</p>
          </div>

          <div className="landing-hero__actions">
            <Link href={`/${locale}/shop`} className="button button--primary">
              {dictionary.home.primaryCta}
            </Link>
            <Link href={`/${locale}/wallet`} className="button button--ghost-arrow">
              {dictionary.home.secondaryCta}
            </Link>
          </div>

          <div className="landing-hero__pill-row">
            {dictionary.home.pills.map((pill) => (
              <span key={pill}>{pill}</span>
            ))}
          </div>
        </div>

        <div className="landing-hero__visual">
          <div className="landing-hero__visual-bg" />
          <Image
            src="/hero-fintech-loyalty-people.png"
            alt="Customers happily using benefits and points in a fintech loyalty experience"
            width={720}
            height={520}
            priority
            className="landing-hero__image"
          />
        </div>
      </section>

      <section className="landing-section landing-section--metrics">
        <div className="landing-section__intro">
          <span className="section-kicker">{dictionary.home.metricsIntroKicker}</span>
          <SectionTitle>{dictionary.home.metricsIntroTitle}</SectionTitle>
          <p className="muted">{dictionary.home.metricsIntroDescription}</p>
        </div>

        <div className="grid grid--metrics">
          {cards.map((card) => (
            <MetricCard
              key={card.title}
              title={card.title}
              value={card.value}
              description={card.description}
            />
          ))}
        </div>
      </section>

      <section className="landing-section landing-section--split">
        <CustomerCard tone="soft">
          <div className="stack stack--sm">
            <span className="section-kicker">{dictionary.home.activityKicker}</span>
            <SectionTitle>{dictionary.home.activityTitle}</SectionTitle>
            <p className="muted">{dictionary.home.activityDescription}</p>
            <ol className="numbered-list">
              {dictionary.home.steps.map((step) => (
                <li key={step}>{step}</li>
              ))}
            </ol>
          </div>
        </CustomerCard>

        <CustomerCard>
          <div className="stack stack--sm">
            <span className="section-kicker">{dictionary.home.actionsKicker}</span>
            <SectionTitle>{dictionary.home.actionsTitle}</SectionTitle>
            <div className="link-list">
              <Link href={`/${locale}/shop`}>{dictionary.home.quickLinks.shop}</Link>
              <Link href={`/${locale}/profile-summary`}>{dictionary.home.quickLinks.profile}</Link>
              <Link href={`/${locale}/wallet`}>{dictionary.home.quickLinks.wallet}</Link>
              {authenticatedSession ? (
                <Link href={`/${locale}/authenticated`}>{dictionary.login.authenticatedArea}</Link>
              ) : null}
            </div>
          </div>
        </CustomerCard>
      </section>

      <section className="landing-section landing-section--split">
        <CustomerCard>
          <div className="stack stack--sm">
            <span className="section-kicker">{dictionary.home.categoriesKicker}</span>
            <SectionTitle>{dictionary.home.categoriesTitle}</SectionTitle>
            <p className="muted">{dictionary.home.categoriesDescription}</p>
            <div className="bullet-list">
              {storefrontCatalog.categories.map((category) => (
                <div key={category.id} className="bullet-list__item">
                  <strong>{category.name}</strong>
                  <p className="muted">{category.description}</p>
                </div>
              ))}
            </div>
          </div>
        </CustomerCard>

        <CustomerCard tone="soft">
          <div className="stack stack--sm">
            <span className="section-kicker">{dictionary.home.featuredKicker}</span>
            <SectionTitle>{dictionary.home.featuredTitle}</SectionTitle>
            <p className="muted">{dictionary.home.featuredDescription}</p>
            <div className="store-grid">
              {storefrontCatalog.items.map((product) => (
                <article key={product.id} className="store-product-card">
                  <div className="store-product-card__meta">
                    <span className="info-chip">{product.categoryName}</span>
                    <strong>{product.name}</strong>
                    <p className="muted">{product.shortDescription}</p>
                  </div>
                  <div className="store-product-card__pricing">
                    <span>{formatUsd(product.priceUsd, locale)}</span>
                    <small>
                      {locale === 'es' ? 'Desde' : 'From'} {formatPoints(product.pointsFrom, locale)} pts
                    </small>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </CustomerCard>
      </section>
    </CustomerShell>
  );
}
