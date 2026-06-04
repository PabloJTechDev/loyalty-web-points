import Link from 'next/link';
import { notFound } from 'next/navigation';
import { CustomerCard } from '@/features/customer/components/CustomerCard';
import { CustomerPageHeader } from '@/features/customer/components/CustomerPageHeader';
import { CustomerShell } from '@/features/customer/components/CustomerShell';
import { getDictionary } from '@/lib/i18n/dictionaries';
import { isLocale } from '@/lib/i18n/config';

export default async function EnrollSuccessPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams?: Promise<{ transactionId?: string; emailHash?: string; requestId?: string; loginId?: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const transactionId = resolvedSearchParams?.transactionId;
  const emailHash = resolvedSearchParams?.emailHash;
  const requestId = resolvedSearchParams?.requestId;
  const loginId = resolvedSearchParams?.loginId;

  if (!transactionId) notFound();

  const dictionary = getDictionary(locale);

  return (
    <CustomerShell locale={locale} dictionary={dictionary}>
      <CustomerPageHeader
        badge={dictionary.enrollSuccess.badge}
        title={dictionary.enrollSuccess.title}
        description={dictionary.enrollSuccess.description}
        aside={<div className="info-chip info-chip--success">{dictionary.enrollSuccess.chip}</div>}
      />

      <section className="grid grid--two">
        <CustomerCard tone="soft">
          <div className="stack stack--sm">
            <div className="success-banner">
              <span className="success-banner__icon" aria-hidden="true">✓</span>
              <div>
                <strong>{dictionary.enrollSuccess.bannerTitle}</strong>
                <p>{dictionary.enrollSuccess.bannerDescription}</p>
              </div>
            </div>

            <span className="section-kicker">{dictionary.enrollSuccess.receiptKicker}</span>
            <h3 className="section-title">{dictionary.enrollSuccess.receiptTitle}</h3>

            <div className="receipt-panel">
              <div>
                <span>{dictionary.enrollSuccess.transactionId}</span>
                <strong>{transactionId}</strong>
              </div>
              {requestId ? (
                <div>
                  <span>requestId</span>
                  <strong>{requestId}</strong>
                </div>
              ) : null}
              <div>
                <span>{dictionary.enrollSuccess.emailHash}</span>
                <strong className="trace-hash">{emailHash ?? dictionary.enrollSuccess.unavailableHash}</strong>
              </div>
            </div>

            <p className="trace-note">
              {dictionary.enrollSuccess.hashNotice}
              {loginId
                ? ` ${locale === 'es' ? 'Además, la sesión demo ya quedó autenticada automáticamente.' : 'The demo session is already authenticated automatically.'}`
                : requestId
                  ? ` ${locale === 'es' ? 'Además, el requestId ya quedó generado para pasar directo al login.' : 'The requestId is already generated so you can jump straight to login.'}`
                  : ''}
            </p>
          </div>
        </CustomerCard>

        <CustomerCard>
          <div className="stack stack--sm">
            <span className="section-kicker">{dictionary.enrollSuccess.nextKicker}</span>
            <h3 className="section-title">{dictionary.enrollSuccess.nextTitle}</h3>
            <p className="muted">{dictionary.enrollSuccess.nextDescription}</p>

            <div className="timeline timeline--compact">
              {dictionary.enrollSuccess.nextSteps.map((step, index) => (
                <div key={step} className="timeline__item">
                  <span className="timeline__step">{index + 1}</span>
                  <p>{step}</p>
                </div>
              ))}
            </div>

            <div className="hero-actions">
              {loginId ? (
                <Link href={`/${locale}/authenticated`} className="button button--primary">
                  {locale === 'es' ? 'Ir al home autenticado' : 'Go to authenticated home'}
                </Link>
              ) : requestId ? (
                <Link href={`/${locale}/login?requestId=${encodeURIComponent(requestId)}`} className="button button--primary">
                  {locale === 'es' ? 'Continuar al login' : 'Continue to login'}
                </Link>
              ) : (
                <Link href={`/${locale}/password-change?transactionId=${encodeURIComponent(transactionId)}`} className="button button--primary">
                  {dictionary.enrollSuccess.primaryCta}
                </Link>
              )}
              <Link href={`/${locale}/traces/${encodeURIComponent(transactionId)}`} className="button button--secondary">
                {dictionary.enrollSuccess.secondaryCta}
              </Link>
            </div>
          </div>
        </CustomerCard>
      </section>
    </CustomerShell>
  );
}
