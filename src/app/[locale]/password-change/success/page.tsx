import Link from 'next/link';
import { notFound } from 'next/navigation';
import { CustomerCard } from '@/features/customer/components/CustomerCard';
import { CustomerPageHeader } from '@/features/customer/components/CustomerPageHeader';
import { CustomerShell } from '@/features/customer/components/CustomerShell';
import { getDictionary } from '@/lib/i18n/dictionaries';
import { isLocale } from '@/lib/i18n/config';

export default async function PasswordChangeSuccessPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams?: Promise<{ requestId?: string; transactionId?: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const requestId = resolvedSearchParams?.requestId;
  const transactionId = resolvedSearchParams?.transactionId;

  if (!requestId || !transactionId) notFound();

  const dictionary = getDictionary(locale);

  return (
    <CustomerShell locale={locale} dictionary={dictionary}>
      <CustomerPageHeader
        badge={dictionary.passwordChangeSuccess.badge}
        title={dictionary.passwordChangeSuccess.title}
        description={dictionary.passwordChangeSuccess.description}
        aside={<div className="info-chip info-chip--success">{dictionary.passwordChangeSuccess.chip}</div>}
      />

      <section className="grid grid--two">
        <CustomerCard tone="soft">
          <div className="stack stack--sm">
            <div className="success-banner">
              <span className="success-banner__icon" aria-hidden="true">✓</span>
              <div>
                <strong>{dictionary.passwordChangeSuccess.bannerTitle}</strong>
                <p>{dictionary.passwordChangeSuccess.bannerDescription}</p>
              </div>
            </div>

            <span className="section-kicker">{dictionary.passwordChangeSuccess.receiptKicker}</span>
            <h3 className="section-title">{dictionary.passwordChangeSuccess.receiptTitle}</h3>

            <div className="receipt-panel">
              <div>
                <span>{dictionary.passwordChangeSuccess.requestId}</span>
                <strong>{requestId}</strong>
              </div>
              <div>
                <span>{dictionary.passwordChangeSuccess.transactionId}</span>
                <strong>{transactionId}</strong>
              </div>
            </div>
          </div>
        </CustomerCard>

        <CustomerCard>
          <div className="stack stack--sm">
            <span className="section-kicker">{dictionary.passwordChangeSuccess.nextKicker}</span>
            <h3 className="section-title">{dictionary.passwordChangeSuccess.nextTitle}</h3>
            <p className="muted">{dictionary.passwordChangeSuccess.nextDescription}</p>

            <div className="timeline timeline--compact">
              {dictionary.passwordChangeSuccess.nextSteps.map((step, index) => (
                <div key={step} className="timeline__item">
                  <span className="timeline__step">{index + 1}</span>
                  <p>{step}</p>
                </div>
              ))}
            </div>

            <div className="hero-actions">
              <Link
                href={`/${locale}/password-change/traces/${encodeURIComponent(requestId)}`}
                className="button button--primary"
              >
                {dictionary.passwordChangeSuccess.primaryCta}
              </Link>
              <Link href={`/${locale}/login?requestId=${encodeURIComponent(requestId)}`} className="button button--secondary">
                {dictionary.passwordChangeSuccess.secondaryCta}
              </Link>
            </div>
          </div>
        </CustomerCard>
      </section>
    </CustomerShell>
  );
}
