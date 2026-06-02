import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getDemoSession } from '@/lib/auth/session';
import { getCustomerEnrollmentTraces, getCustomerHome } from '@/lib/api/customer';
import { CustomerBadge } from '@/features/customer/components/CustomerBadge';
import { CustomerCard } from '@/features/customer/components/CustomerCard';
import { MetricCard } from '@/features/customer/components/MetricCard';
import { CustomerShell } from '@/features/customer/components/CustomerShell';
import { SectionTitle } from '@/features/customer/components/SectionTitle';
import { EmptyState } from '@/features/customer/components/state/EmptyState';
import { EnrollmentTracePanel } from '@/features/customer/components/EnrollmentTracePanel';
import { getDictionary } from '@/lib/i18n/dictionaries';
import { isLocale } from '@/lib/i18n/config';
import { formatDate, formatPoints } from '@/lib/i18n/format';

export default async function HomePage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams?: Promise<{ enrollment?: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const resolvedSearchParams = searchParams ? await searchParams : undefined;

  const [data, dictionary, traces, authenticatedSession] = await Promise.all([
    getCustomerHome(),
    Promise.resolve(getDictionary(locale)),
    getCustomerEnrollmentTraces(),
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
          <CustomerBadge label={`${dictionary.home.badge} · ${dictionary.common.source}: ${data.source ?? 'unknown'}`} />

          <div className="landing-hero__text">
            <h2 className="landing-hero__title">{dictionary.home.title}</h2>
            <p className="landing-hero__description">{dictionary.home.description}</p>
          </div>

          <div className="landing-hero__actions">
            <Link href={`/${locale}/wallet`} className="button button--primary">
              {dictionary.home.primaryCta}
            </Link>
            <Link href={`/${locale}/profile-summary`} className="button button--ghost-arrow">
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
            {data.recentActivity.length ? (
              <ul className="bullet-list">
                {data.recentActivity.map((item: { id: string; description: string; points: number }) => (
                  <li key={item.id}>
                    {item.description}: {item.points > 0 ? '+' : ''}
                    {formatPoints(item.points, locale)} pts
                  </li>
                ))}
              </ul>
            ) : (
              <EmptyState
                title={locale === 'es' ? 'Aún no hay actividad reciente' : 'There is no recent activity yet'}
                description={
                  locale === 'es'
                    ? 'Cuando existan nuevos movimientos, aparecerán aquí con contexto claro para el cliente.'
                    : 'When new movements exist, they will appear here with clear customer context.'
                }
              />
            )}
          </div>
        </CustomerCard>

        <CustomerCard>
          <div className="stack stack--sm">
            <span className="section-kicker">{dictionary.home.actionsKicker}</span>
            <SectionTitle>{dictionary.home.actionsTitle}</SectionTitle>
            <div className="link-list">
              <Link href={`/${locale}/profile-summary`}>{dictionary.home.quickLinks.profile}</Link>
              <Link href={`/${locale}/wallet`}>{dictionary.home.quickLinks.wallet}</Link>
              {authenticatedSession ? (
                <Link href={`/${locale}/authenticated`}>{dictionary.login.authenticatedArea}</Link>
              ) : null}
            </div>
            <ol className="numbered-list">
              {dictionary.home.steps.map((step) => (
                <li key={step}>{step}</li>
              ))}
            </ol>
          </div>
        </CustomerCard>
      </section>

      <EnrollmentTracePanel
        locale={locale}
        content={dictionary.enrollment}
        traces={traces}
        enrollmentStatus={resolvedSearchParams?.enrollment}
      />
    </CustomerShell>
  );
}
