import Link from 'next/link';
import { notFound } from 'next/navigation';
import { CustomerCard } from '@/shared/ui/CustomerCard';
import { CustomerPageHeader } from '@/shared/ui/CustomerPageHeader';
import { CustomerShell } from '@/shared/ui/CustomerShell';
import { getCustomerPasswordChangeTraceByRequestId } from '@/shared/api/customer';
import { getDictionary } from '@/shared/i18n/dictionaries';
import { isLocale } from '@/shared/i18n/config';

function formatTimestamp(value: string, locale: string) {
  return new Intl.DateTimeFormat(locale === 'es' ? 'es-CL' : 'en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
}

export default async function PasswordChangeTracePage({
  params,
}: {
  params: Promise<{ locale: string; requestId: string }>;
}) {
  const { locale, requestId } = await params;
  if (!isLocale(locale)) notFound();

  const [dictionary, details] = await Promise.all([
    Promise.resolve(getDictionary(locale)),
    getCustomerPasswordChangeTraceByRequestId(requestId),
  ]);

  if (!details) notFound();

  const statusTone = details.trace.handoff.status === 'sent_to_core' ? 'trace-chip--ready' : 'trace-chip--pending';

  return (
    <CustomerShell locale={locale} dictionary={dictionary}>
      <CustomerPageHeader
        badge={dictionary.passwordChangeTrace.badge}
        title={dictionary.passwordChangeTrace.title}
        description={dictionary.passwordChangeTrace.description}
        aside={<div className="info-chip">{requestId}</div>}
      />

      <CustomerCard tone="soft">
        <div className="stack stack--sm">
          <span className="section-kicker">{dictionary.passwordChangeTrace.journeyKicker}</span>
          <h3 className="section-title">{dictionary.passwordChangeTrace.journeyTitle}</h3>

          <div className="journey-grid">
            <div className="journey-step">
              <span className="journey-step__stage">1</span>
              <strong>{dictionary.passwordChangeTrace.webStageTitle}</strong>
              <p>{dictionary.passwordChangeTrace.webStageDescription}</p>
            </div>
            <div className="journey-step">
              <span className="journey-step__stage">2</span>
              <strong>{dictionary.passwordChangeTrace.bffStageTitle}</strong>
              <p>{dictionary.passwordChangeTrace.bffStageDescription}</p>
            </div>
            <div className="journey-step">
              <span className="journey-step__stage">3</span>
              <strong>{dictionary.passwordChangeTrace.coreStageTitle}</strong>
              <p>{dictionary.passwordChangeTrace.coreStageDescription}</p>
            </div>
          </div>
        </div>
      </CustomerCard>

      <section className="grid grid--equal">
        <CustomerCard tone="soft">
          <div className="stack stack--sm">
            <div className="trace-section-head">
              <div>
                <span className="section-kicker">{dictionary.passwordChangeTrace.bffKicker}</span>
                <h3 className="section-title">{dictionary.passwordChangeTrace.bffTitle}</h3>
              </div>
              <span className={`trace-chip ${statusTone}`}>{details.trace.handoff.status}</span>
            </div>

            <div className="timeline">
              <div className="timeline__item">
                <span className="timeline__step">1</span>
                <div>
                  <strong>{dictionary.passwordChangeTrace.createdAt}</strong>
                  <p>{formatTimestamp(details.trace.createdAt, locale)}</p>
                </div>
              </div>
              <div className="timeline__item">
                <span className="timeline__step">2</span>
                <div>
                  <strong>{dictionary.passwordChangeTrace.requestId}</strong>
                  <p>{details.trace.requestId}</p>
                </div>
              </div>
              <div className="timeline__item">
                <span className="timeline__step">3</span>
                <div>
                  <strong>{dictionary.passwordChangeTrace.transactionId}</strong>
                  <p>{details.trace.transactionId}</p>
                </div>
              </div>
              <div className="timeline__item">
                <span className="timeline__step">4</span>
                <div>
                  <strong>{dictionary.passwordChangeTrace.handoffStatus}</strong>
                  <p>{details.trace.handoff.status}</p>
                </div>
              </div>
              <div className="timeline__item">
                <span className="timeline__step">5</span>
                <div>
                  <strong>{dictionary.passwordChangeTrace.target}</strong>
                  <p>{details.trace.handoff.targetBaseUrl}</p>
                </div>
              </div>
              {details.trace.handoff.deliveredAt ? (
                <div className="timeline__item">
                  <span className="timeline__step">6</span>
                  <div>
                    <strong>{dictionary.passwordChangeTrace.deliveredAt}</strong>
                    <p>{formatTimestamp(details.trace.handoff.deliveredAt, locale)}</p>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </CustomerCard>

        <CustomerCard>
          <div className="stack stack--sm">
            <span className="section-kicker">{dictionary.passwordChangeTrace.coreKicker}</span>
            <h3 className="section-title">{dictionary.passwordChangeTrace.coreTitle}</h3>
            {details.coreRecord ? (
              <div className="timeline">
                <div className="timeline__item">
                  <span className="timeline__step">1</span>
                  <div>
                    <strong>{dictionary.passwordChangeTrace.stage}</strong>
                    <p>{details.coreRecord.stage}</p>
                  </div>
                </div>
                <div className="timeline__item">
                  <span className="timeline__step">2</span>
                  <div>
                    <strong>{dictionary.passwordChangeTrace.requestedAt}</strong>
                    <p>{formatTimestamp(details.coreRecord.requestedAt, locale)}</p>
                  </div>
                </div>
                <div className="timeline__item">
                  <span className="timeline__step">3</span>
                  <div>
                    <strong>{dictionary.passwordChangeTrace.source}</strong>
                    <p>{details.coreRecord.source}</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="empty-trace-panel">
                <strong>{dictionary.passwordChangeTrace.pendingTitle}</strong>
                <p>{dictionary.passwordChangeTrace.pendingDescription}</p>
              </div>
            )}
          </div>
        </CustomerCard>
      </section>

      <CustomerCard>
        <div className="stack stack--sm">
          <span className="section-kicker">{dictionary.passwordChangeTrace.nextTitle}</span>
          <h3 className="section-title">{dictionary.passwordChangeTrace.nextCta}</h3>
          <p className="muted">{dictionary.passwordChangeTrace.nextDescription}</p>
          <div className="hero-actions">
            <Link href={`/${locale}/login?requestId=${encodeURIComponent(requestId)}`} className="button button--primary">
              {dictionary.passwordChangeTrace.nextCta}
            </Link>
            <Link href={`/${locale}/traces/${encodeURIComponent(details.trace.transactionId)}`} className="button button--secondary">
              {locale === 'es' ? 'Volver a la inscripción' : 'Back to enrollment'}
            </Link>
          </div>
        </div>
      </CustomerCard>
    </CustomerShell>
  );
}
