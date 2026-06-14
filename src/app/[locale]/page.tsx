import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getDemoSession } from '@pablojtech/loyalty-shared-web/auth';
import { getCustomerHome } from '@/shared/api/customer';
import { CustomerBadge } from '@/shared/ui/CustomerBadge';
import { CustomerCard } from '@/shared/ui/CustomerCard';
import { MetricCard } from '@pablojtech/loyalty-shared-web/ui';
import { CustomerShell } from '@/shared/ui/CustomerShell';
import { SectionTitle } from '@pablojtech/loyalty-shared-web/ui';
import { getDictionary } from '@pablojtech/loyalty-shared-web/i18n';
import { isLocale } from '@pablojtech/loyalty-shared-web/i18n';
import { formatDate, formatPoints } from '@pablojtech/loyalty-shared-web/i18n';

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const [data, dictionary, authenticatedSession] = await Promise.all([
    getCustomerHome(),
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
          <CustomerBadge label={`${locale === 'es' ? 'Points experience' : 'Points experience'} · ${dictionary.common.source}: ${data.source ?? 'unknown'}`} />

          <div className="landing-hero__text">
            <h2 className="landing-hero__title">
              {locale === 'es'
                ? 'Enrollment, login, perfil y wallet en una vertical points dedicada'
                : 'Enrollment, login, profile, and wallet in a dedicated points vertical'}
            </h2>
            <p className="landing-hero__description">
              {locale === 'es'
                ? 'Esta app concentra la experiencia loyalty customer-first: inscripción, cambio de clave, login, trazabilidad, perfil y wallet.'
                : 'This app concentrates the customer-first loyalty experience: enrollment, password change, login, traceability, profile, and wallet.'}
            </p>
          </div>

          <div className="landing-hero__actions">
            <Link href={`/${locale}/enroll`} className="button button--primary">
              {locale === 'es' ? 'Comenzar inscripción' : 'Start enrollment'}
            </Link>
            <Link href={`/${locale}/wallet`} className="button button--ghost-arrow">
              {dictionary.home.secondaryCta}
            </Link>
          </div>

          <div className="landing-hero__pill-row">
            <span>{locale === 'es' ? 'Enrollment + login' : 'Enrollment + login'}</span>
            <span>{locale === 'es' ? 'Profile summary' : 'Profile summary'}</span>
            <span>{locale === 'es' ? 'Wallet y trazabilidad' : 'Wallet and traceability'}</span>
          </div>
        </div>

        <div className="landing-hero__visual">
          <div className="landing-hero__visual-bg" />
          <Image
            src="/hero-fintech-loyalty-people.png"
            alt="Customers using a loyalty points platform"
            width={720}
            height={520}
            priority
            className="landing-hero__image"
          />
        </div>
      </section>

      <section className="landing-section landing-section--metrics">
        <div className="landing-section__intro">
          <span className="section-kicker">{locale === 'es' ? 'Vertical points' : 'Points vertical'}</span>
          <SectionTitle>{locale === 'es' ? 'La base loyalty queda enfocada en customer y wallet' : 'The loyalty base now stays focused on customer and wallet'}</SectionTitle>
          <p className="muted">
            {locale === 'es'
              ? 'Quitamos storefront de esta app para que points y ecommerce puedan evolucionar por separado.'
              : 'Storefront was removed from this app so points and ecommerce can evolve independently.'}
          </p>
        </div>

        <div className="grid grid--metrics">
          {cards.map((card) => (
            <MetricCard key={card.title} title={card.title} value={card.value} description={card.description} />
          ))}
        </div>
      </section>

      <section className="landing-section landing-section--split">
        <CustomerCard tone="soft">
          <div className="stack stack--sm">
            <span className="section-kicker">{locale === 'es' ? 'Journeys activos' : 'Active journeys'}</span>
            <SectionTitle>{locale === 'es' ? 'Customer-first de punta a punta' : 'Customer-first end to end'}</SectionTitle>
            <ol className="numbered-list">
              <li>{locale === 'es' ? 'Inscripción con transactionId y trazabilidad visible.' : 'Enrollment with transactionId and visible traceability.'}</li>
              <li>{locale === 'es' ? 'Cambio de clave reutilizando el contexto previo.' : 'Password change reusing previous context.'}</li>
              <li>{locale === 'es' ? 'Login y sesión demo autenticada.' : 'Login and authenticated demo session.'}</li>
            </ol>
          </div>
        </CustomerCard>

        <CustomerCard>
          <div className="stack stack--sm">
            <span className="section-kicker">{locale === 'es' ? 'Accesos rápidos' : 'Quick links'}</span>
            <SectionTitle>{locale === 'es' ? 'Qué sigue dentro de points' : 'What comes next inside points'}</SectionTitle>
            <div className="link-list">
              <Link href={`/${locale}/enroll`}>{locale === 'es' ? 'Ir a inscripción' : 'Go to enrollment'}</Link>
              <Link href={`/${locale}/login`}>{locale === 'es' ? 'Ir a login' : 'Go to login'}</Link>
              <Link href={`/${locale}/profile-summary`}>{locale === 'es' ? 'Abrir profile summary' : 'Open profile summary'}</Link>
              <Link href={`/${locale}/wallet`}>{locale === 'es' ? 'Abrir wallet' : 'Open wallet'}</Link>
            </div>
          </div>
        </CustomerCard>
      </section>
    </CustomerShell>
  );
}
