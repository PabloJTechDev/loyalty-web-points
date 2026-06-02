import { CustomerCard } from '@/features/customer/components/CustomerCard';
import { SectionTitle } from '@/features/customer/components/SectionTitle';
import type { Locale } from '@/lib/i18n/config';
import type { CustomerEnrollmentTraceListResponse } from '@/lib/api/customer';

interface EnrollmentTracePanelProps {
  locale: Locale;
  content: {
    kicker: string;
    title: string;
    description: string;
    emailLabel: string;
    emailHelp: string;
    submit: string;
    panelTitle: string;
    emptyTitle: string;
    emptyDescription: string;
    noticeSuccess: string;
    noticeError: string;
    transactionId: string;
    hashShownOnce: string;
    tracedByTransaction: string;
    handoff: string;
    corePayload: string;
    readyToSend: string;
    pendingCore: string;
  };
  traces: CustomerEnrollmentTraceListResponse;
  enrollmentStatus?: string;
}

export function EnrollmentTracePanel({ locale, content, traces, enrollmentStatus }: EnrollmentTracePanelProps) {
  const formatter = new Intl.DateTimeFormat(locale === 'es' ? 'es-CL' : 'en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });

  return (
    <section className="landing-section">
      <div className="landing-section__intro">
        <span className="section-kicker">{content.kicker}</span>
        <SectionTitle>{content.title}</SectionTitle>
        <p className="muted">{content.description}</p>
      </div>

      <div className="grid grid--two">
        <CustomerCard tone="soft">
          <div className="stack">
            {enrollmentStatus === 'ok' ? <div className="trace-notice trace-notice--success">{content.noticeSuccess}</div> : null}
            {enrollmentStatus === 'error' ? <div className="trace-notice trace-notice--error">{content.noticeError}</div> : null}

            <form action="/api/enrollment-demo" method="post" className="enrollment-form">
              <input type="hidden" name="locale" value={locale} />

              <label className="field-group">
                <span className="field-label">{content.emailLabel}</span>
                <input
                  type="email"
                  name="email"
                  defaultValue={traces.defaultEmail}
                  className="field-input"
                  placeholder={traces.defaultEmail}
                />
              </label>

              <p className="field-help">{content.emailHelp}</p>

              <button type="submit" className="button button--primary">
                {content.submit}
              </button>
            </form>
          </div>
        </CustomerCard>

        <CustomerCard>
          <div className="stack stack--sm">
            <SectionTitle>{content.panelTitle}</SectionTitle>

            {traces.items.length ? (
              <div className="trace-list">
                {traces.items.map((trace) => (
                  <article key={trace.transactionId} className="trace-item">
                    <div className="trace-item__header">
                      <div>
                        <strong>{trace.email}</strong>
                        <p className="muted">{formatter.format(new Date(trace.createdAt))}</p>
                      </div>
                      <span className={`trace-chip ${trace.handoff.status === 'ready_to_send' ? 'trace-chip--ready' : 'trace-chip--pending'}`}>
                        {trace.handoff.status === 'ready_to_send' ? content.readyToSend : content.pendingCore}
                      </span>
                    </div>

                    <div className="trace-meta">
                      <div>
                        <span>{content.transactionId}</span>
                        <strong>{trace.transactionId}</strong>
                      </div>
                      <div>
                        <span>{content.tracedByTransaction}</span>
                        <strong>{trace.transactionId}</strong>
                      </div>
                      <div>
                        <span>{content.handoff}</span>
                        <strong>{trace.handoff.targetBaseUrl}</strong>
                      </div>
                    </div>

                    <div className="trace-payload">
                      <span>{content.corePayload}</span>
                      <pre>{JSON.stringify(trace.payloadPreparedForCore, null, 2)}</pre>
                    </div>

                    <p className="trace-note">{content.hashShownOnce}</p>
                  </article>
                ))}
              </div>
            ) : (
              <div className="empty-trace-panel">
                <strong>{content.emptyTitle}</strong>
                <p>{content.emptyDescription}</p>
              </div>
            )}
          </div>
        </CustomerCard>
      </div>
    </section>
  );
}
