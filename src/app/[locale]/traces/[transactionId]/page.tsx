import Link from 'next/link';
import { notFound } from 'next/navigation';
import { CustomerCard } from '@/features/customer/components/CustomerCard';
import { CustomerPageHeader } from '@/features/customer/components/CustomerPageHeader';
import { CustomerShell } from '@/features/customer/components/CustomerShell';
import { getCustomerEnrollmentTraceByTransactionId } from '@/lib/api/customer';
import { getDictionary } from '@/lib/i18n/dictionaries';
import { isLocale } from '@/lib/i18n/config';

function formatTimestamp(value: string, locale: string) {
  return new Intl.DateTimeFormat(locale === 'es' ? 'es-CL' : 'en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
}

export default async function TraceByTransactionIdPage({
  params,
}: {
  params: Promise<{ locale: string; transactionId: string }>;
}) {
  const { locale, transactionId } = await params;
  if (!isLocale(locale)) notFound();

  const [dictionary, details] = await Promise.all([
    Promise.resolve(getDictionary(locale)),
    getCustomerEnrollmentTraceByTransactionId(transactionId),
  ]);

  if (!details) notFound();

  const statusTone = details.trace.handoff.status === 'sent_to_core' ? 'trace-chip--ready' : 'trace-chip--pending';

  return (
    <CustomerShell locale={locale} dictionary={dictionary}>
      <CustomerPageHeader
        badge={dictionary.trace.badge}
        title={dictionary.trace.title}
        description={dictionary.trace.description}
        aside={<div className="info-chip">{transactionId}</div>}
      />

      <CustomerCard tone="soft">
        <div className="stack stack--sm">
          <span className="section-kicker">{dictionary.trace.journeyKicker}</span>
          <h3 className="section-title">{dictionary.trace.journeyTitle}</h3>

          <div className="journey-grid">
            <div className="journey-step">
              <span className="journey-step__stage">1</span>
              <strong>{dictionary.trace.webStageTitle}</strong>
              <p>{dictionary.trace.webStageDescription}</p>
            </div>
            <div className="journey-step">
              <span className="journey-step__stage">2</span>
              <strong>{dictionary.trace.bffStageTitle}</strong>
              <p>{dictionary.trace.bffStageDescription}</p>
            </div>
            <div className="journey-step">
              <span className="journey-step__stage">3</span>
              <strong>{dictionary.trace.coreStageTitle}</strong>
              <p>{dictionary.trace.coreStageDescription}</p>
            </div>
          </div>
        </div>
      </CustomerCard>

      <section className="grid grid--equal">
        <CustomerCard tone="soft">
          <div className="stack stack--sm">
            <div className="trace-section-head">
              <div>
                <span className="section-kicker">{dictionary.trace.bffKicker}</span>
                <h3 className="section-title">{dictionary.trace.bffTitle}</h3>
              </div>
              <span className={`trace-chip ${statusTone}`}>{details.trace.handoff.status}</span>
            </div>

            <div className="timeline">
              <div className="timeline__item">
                <span className="timeline__step">1</span>
                <div>
                  <strong>{dictionary.trace.createdAt}</strong>
                  <p>{formatTimestamp(details.trace.createdAt, locale)}</p>
                </div>
              </div>
              <div className="timeline__item">
                <span className="timeline__step">2</span>
                <div>
                  <strong>{dictionary.trace.handoffStatus}</strong>
                  <p>{details.trace.handoff.status}</p>
                </div>
              </div>
              <div className="timeline__item">
                <span className="timeline__step">3</span>
                <div>
                  <strong>{dictionary.trace.target}</strong>
                  <p>{details.trace.handoff.targetBaseUrl}</p>
                </div>
              </div>
              {details.trace.handoff.deliveredAt ? (
                <div className="timeline__item">
                  <span className="timeline__step">4</span>
                  <div>
                    <strong>{dictionary.trace.deliveredAt}</strong>
                    <p>{formatTimestamp(details.trace.handoff.deliveredAt, locale)}</p>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </CustomerCard>

        <CustomerCard>
          <div className="stack stack--sm">
            <span className="section-kicker">{dictionary.trace.coreKicker}</span>
            <h3 className="section-title">{dictionary.trace.coreTitle}</h3>
            {details.coreRecord ? (
              <div className="timeline">
                <div className="timeline__item">
                  <span className="timeline__step">1</span>
                  <div>
                    <strong>{dictionary.trace.stage}</strong>
                    <p>{details.coreRecord.stage}</p>
                  </div>
                </div>
                <div className="timeline__item">
                  <span className="timeline__step">2</span>
                  <div>
                    <strong>{dictionary.trace.receivedAt}</strong>
                    <p>{formatTimestamp(details.coreRecord.receivedAt, locale)}</p>
                  </div>
                </div>
                <div className="timeline__item">
                  <span className="timeline__step">3</span>
                  <div>
                    <strong>{dictionary.trace.source}</strong>
                    <p>{details.coreRecord.source}</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="empty-trace-panel">
                <strong>{dictionary.trace.pendingTitle}</strong>
                <p>{dictionary.trace.pendingDescription}</p>
              </div>
            )}
          </div>
        </CustomerCard>
      </section>

      <CustomerCard>
        <div className="stack stack--sm">
          <span className="section-kicker">{dictionary.trace.nextTitle}</span>
          <h3 className="section-title">{dictionary.trace.nextCta}</h3>
          <p className="muted">{dictionary.trace.nextDescription}</p>
          <div className="hero-actions">
            <Link
              href={`/${locale}/password-change?transactionId=${encodeURIComponent(transactionId)}`}
              className="button button--primary"
            >
              {dictionary.trace.nextCta}
            </Link>
          </div>
        </div>
      </CustomerCard>
    </CustomerShell>
  );
}
