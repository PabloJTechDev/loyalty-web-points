import Link from 'next/link';
import { notFound } from 'next/navigation';
import { CustomerCard } from '@/shared/ui/CustomerCard';
import { CustomerPageHeader } from '@/shared/ui/CustomerPageHeader';
import { CustomerShell } from '@/shared/ui/CustomerShell';
import { getDemoSession } from '@pablojtech/loyalty-shared-web/auth';
import { getCustomerLoginTraceByLoginId } from '@/shared/api/customer';
import { getDictionary } from '@pablojtech/loyalty-shared-web/i18n';
import { isLocale } from '@pablojtech/loyalty-shared-web/i18n';

function formatTimestamp(value: string, locale: string) {
  return new Intl.DateTimeFormat(locale === 'es' ? 'es-CL' : 'en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
}

export default async function LoginTracePage({
  params,
}: {
  params: Promise<{ locale: string; loginId: string }>;
}) {
  const { locale, loginId } = await params;
  if (!isLocale(locale)) notFound();

  const [dictionary, details, session] = await Promise.all([
    Promise.resolve(getDictionary(locale)),
    getCustomerLoginTraceByLoginId(loginId),
    getDemoSession(),
  ]);

  if (!details) notFound();

  const authenticatedSession = session ?? {
    fullName: details.trace.customerSnapshot.fullName,
    tier: details.trace.customerSnapshot.tierName,
    loginId,
    customerId: details.trace.customerSnapshot.customerId,
    maskedEmail: details.trace.customerSnapshot.maskedEmail,
  };
  const statusTone = details.trace.session.status === 'authenticated' ? 'trace-chip--ready' : 'trace-chip--pending';

  return (
    <CustomerShell locale={locale} dictionary={dictionary} authenticatedSession={authenticatedSession}>
      <CustomerPageHeader
        badge={dictionary.loginTrace.badge}
        title={dictionary.loginTrace.title}
        description={dictionary.loginTrace.description}
        aside={<div className="info-chip">{loginId}</div>}
      />

      <CustomerCard tone="soft">
        <div className="stack stack--sm">
          <span className="section-kicker">{dictionary.loginTrace.journeyKicker}</span>
          <h3 className="section-title">{dictionary.loginTrace.journeyTitle}</h3>

          <div className="journey-grid">
            <div className="journey-step">
              <span className="journey-step__stage">1</span>
              <strong>{dictionary.loginTrace.webStageTitle}</strong>
              <p>{dictionary.loginTrace.webStageDescription}</p>
            </div>
            <div className="journey-step">
              <span className="journey-step__stage">2</span>
              <strong>{dictionary.loginTrace.bffStageTitle}</strong>
              <p>{dictionary.loginTrace.bffStageDescription}</p>
            </div>
            <div className="journey-step">
              <span className="journey-step__stage">3</span>
              <strong>{dictionary.loginTrace.coreStageTitle}</strong>
              <p>{dictionary.loginTrace.coreStageDescription}</p>
            </div>
          </div>
        </div>
      </CustomerCard>

      <section className="grid grid--equal">
        <CustomerCard tone="soft">
          <div className="stack stack--sm">
            <div className="trace-section-head">
              <div>
                <span className="section-kicker">{dictionary.loginTrace.bffKicker}</span>
                <h3 className="section-title">{dictionary.loginTrace.bffTitle}</h3>
              </div>
              <span className={`trace-chip ${statusTone}`}>{details.trace.session.status}</span>
            </div>

            <div className="timeline">
              <div className="timeline__item">
                <span className="timeline__step">1</span>
                <div>
                  <strong>{dictionary.loginTrace.createdAt}</strong>
                  <p>{formatTimestamp(details.trace.createdAt, locale)}</p>
                </div>
              </div>
              <div className="timeline__item">
                <span className="timeline__step">2</span>
                <div>
                  <strong>{dictionary.loginTrace.loginId}</strong>
                  <p>{details.trace.loginId}</p>
                </div>
              </div>
              <div className="timeline__item">
                <span className="timeline__step">3</span>
                <div>
                  <strong>{dictionary.loginTrace.requestId}</strong>
                  <p>{details.trace.requestId}</p>
                </div>
              </div>
              <div className="timeline__item">
                <span className="timeline__step">4</span>
                <div>
                  <strong>{dictionary.loginTrace.transactionId}</strong>
                  <p>{details.trace.transactionId}</p>
                </div>
              </div>
              <div className="timeline__item">
                <span className="timeline__step">5</span>
                <div>
                  <strong>{dictionary.loginTrace.sessionStatus}</strong>
                  <p>{details.trace.session.status}</p>
                </div>
              </div>
              <div className="timeline__item">
                <span className="timeline__step">6</span>
                <div>
                  <strong>{dictionary.loginTrace.target}</strong>
                  <p>{details.trace.session.targetBaseUrl}</p>
                </div>
              </div>
              {details.trace.session.authenticatedAt ? (
                <div className="timeline__item">
                  <span className="timeline__step">7</span>
                  <div>
                    <strong>{dictionary.loginTrace.authenticatedAt}</strong>
                    <p>{formatTimestamp(details.trace.session.authenticatedAt, locale)}</p>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </CustomerCard>

        <CustomerCard>
          <div className="stack stack--sm">
            <span className="section-kicker">{dictionary.loginTrace.coreKicker}</span>
            <h3 className="section-title">{dictionary.loginTrace.coreTitle}</h3>
            {details.coreRecord ? (
              <div className="timeline">
                <div className="timeline__item">
                  <span className="timeline__step">1</span>
                  <div>
                    <strong>{dictionary.loginTrace.stage}</strong>
                    <p>{details.coreRecord.stage}</p>
                  </div>
                </div>
                <div className="timeline__item">
                  <span className="timeline__step">2</span>
                  <div>
                    <strong>{dictionary.loginTrace.coreAuthenticatedAt}</strong>
                    <p>{formatTimestamp(details.coreRecord.authenticatedAt, locale)}</p>
                  </div>
                </div>
                <div className="timeline__item">
                  <span className="timeline__step">3</span>
                  <div>
                    <strong>{dictionary.loginTrace.source}</strong>
                    <p>{details.coreRecord.source}</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="empty-trace-panel">
                <strong>{dictionary.loginTrace.pendingTitle}</strong>
                <p>{dictionary.loginTrace.pendingDescription}</p>
              </div>
            )}
          </div>
        </CustomerCard>
      </section>

      <CustomerCard>
        <div className="stack stack--sm">
          <span className="section-kicker">{dictionary.login.authenticatedArea}</span>
          <h3 className="section-title">{dictionary.login.authenticatedDescription}</h3>
          <div className="hero-actions">
            <Link href={`/${locale}/authenticated`} className="button button--primary">
              {locale === 'es' ? 'Ir al home autenticado' : 'Go to authenticated home'}
            </Link>
            <Link href={`/${locale}/wallet`} className="button button--secondary">
              {locale === 'es' ? 'Abrir wallet autenticada' : 'Open authenticated wallet'}
            </Link>
          </div>
        </div>
      </CustomerCard>
    </CustomerShell>
  );
}
