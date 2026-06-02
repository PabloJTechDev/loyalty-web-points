import Link from 'next/link';
import { notFound } from 'next/navigation';
import { CustomerCard } from '@/features/customer/components/CustomerCard';
import { CustomerPageHeader } from '@/features/customer/components/CustomerPageHeader';
import { CustomerShell } from '@/features/customer/components/CustomerShell';
import { getDemoSession } from '@/lib/auth/session';
import { getDictionary } from '@/lib/i18n/dictionaries';
import { isLocale } from '@/lib/i18n/config';

export default async function LoginSuccessPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams?: Promise<{ loginId?: string; requestId?: string; transactionId?: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const loginId = resolvedSearchParams?.loginId;
  const requestId = resolvedSearchParams?.requestId;
  const transactionId = resolvedSearchParams?.transactionId;

  if (!loginId || !requestId || !transactionId) notFound();

  const [dictionary, session] = await Promise.all([
    Promise.resolve(getDictionary(locale)),
    getDemoSession(),
  ]);
  const authenticatedSession = session ?? {
    fullName: 'Customer Demo',
    tier: 'Unknown tier',
    loginId,
  };

  return (
    <CustomerShell locale={locale} dictionary={dictionary} authenticatedSession={authenticatedSession}>
      <CustomerPageHeader
        badge={dictionary.loginSuccess.badge}
        title={dictionary.loginSuccess.title}
        description={dictionary.loginSuccess.description}
        aside={<div className="info-chip info-chip--success">{dictionary.loginSuccess.chip}</div>}
      />

      <section className="grid grid--two">
        <CustomerCard tone="soft">
          <div className="stack stack--sm">
            <div className="success-banner">
              <span className="success-banner__icon" aria-hidden="true">✓</span>
              <div>
                <strong>{dictionary.loginSuccess.bannerTitle}</strong>
                <p>{dictionary.loginSuccess.bannerDescription}</p>
              </div>
            </div>

            <span className="section-kicker">{dictionary.loginSuccess.receiptKicker}</span>
            <h3 className="section-title">{dictionary.loginSuccess.receiptTitle}</h3>

            <div className="receipt-panel">
              <div>
                <span>{dictionary.loginSuccess.loginId}</span>
                <strong>{loginId}</strong>
              </div>
              <div>
                <span>{dictionary.loginSuccess.requestId}</span>
                <strong>{requestId}</strong>
              </div>
              <div>
                <span>{dictionary.loginSuccess.transactionId}</span>
                <strong>{transactionId}</strong>
              </div>
            </div>
          </div>
        </CustomerCard>

        <CustomerCard>
          <div className="stack stack--sm">
            <span className="section-kicker">{dictionary.loginSuccess.nextKicker}</span>
            <h3 className="section-title">{dictionary.loginSuccess.nextTitle}</h3>
            <p className="muted">{dictionary.loginSuccess.nextDescription}</p>

            <div className="timeline timeline--compact">
              {dictionary.loginSuccess.nextSteps.map((step, index) => (
                <div key={step} className="timeline__item">
                  <span className="timeline__step">{index + 1}</span>
                  <p>{step}</p>
                </div>
              ))}
            </div>

            <div className="hero-actions">
              <Link
                href={`/${locale}/login/traces/${encodeURIComponent(loginId)}`}
                className="button button--primary"
              >
                {dictionary.loginSuccess.primaryCta}
              </Link>
              <Link
                href={`/${locale}/authenticated`}
                className="button button--secondary"
              >
                {dictionary.loginSuccess.secondaryCta}
              </Link>
            </div>
          </div>
        </CustomerCard>
      </section>
    </CustomerShell>
  );
}
