import { notFound } from 'next/navigation';
import { CustomerCard } from '@/shared/ui/CustomerCard';
import { CustomerPageHeader } from '@/shared/ui/CustomerPageHeader';
import { CustomerShell } from '@/shared/ui/CustomerShell';
import { getCustomerEnrollmentTraces } from '@/shared/api/customer';
import { getDictionary } from '@/shared/i18n/dictionaries';
import { isLocale } from '@/shared/i18n/config';

function resolveStatusNotice(
  status: string | undefined,
  dictionary: ReturnType<typeof getDictionary>,
) {
  if (status === 'missing-transaction') {
    return { tone: 'error' as const, message: dictionary.passwordChange.statusMissingTransaction };
  }

  if (status === 'enrollment-not-found') {
    return { tone: 'error' as const, message: dictionary.passwordChange.statusEnrollmentNotFound };
  }

  if (status === 'error') {
    return { tone: 'error' as const, message: dictionary.passwordChange.statusError };
  }

  return null;
}

export default async function PasswordChangePage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams?: Promise<{ status?: string; transactionId?: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const [dictionary, traces] = await Promise.all([
    Promise.resolve(getDictionary(locale)),
    getCustomerEnrollmentTraces(),
  ]);

  const statusNotice = resolveStatusNotice(resolvedSearchParams?.status, dictionary);
  const recentTraces = traces.items.slice(0, 5);

  return (
    <CustomerShell locale={locale} dictionary={dictionary}>
      <CustomerPageHeader
        badge={dictionary.passwordChange.badge}
        title={dictionary.passwordChange.title}
        description={dictionary.passwordChange.description}
        aside={<div className="info-chip">{dictionary.passwordChange.chip}</div>}
      />

      <section className="grid grid--two">
        <CustomerCard tone="soft">
          <div className="stack">
            {statusNotice ? (
              <div className={`trace-notice trace-notice--${statusNotice.tone}`}>{statusNotice.message}</div>
            ) : null}

            <div className="stack stack--sm">
              <span className="section-kicker">{dictionary.passwordChange.formKicker}</span>
              <h3 className="section-title">{dictionary.passwordChange.formTitle}</h3>
              <p className="muted">{dictionary.passwordChange.formDescription}</p>
            </div>

            <form action="/api/password-change-demo" method="post" className="enrollment-form enrollment-form--page">
              <input type="hidden" name="locale" value={locale} />

              <label className="field-group">
                <span className="field-label">{dictionary.passwordChange.transactionIdLabel}</span>
                <input
                  type="text"
                  name="transactionId"
                  defaultValue={resolvedSearchParams?.transactionId ?? recentTraces[0]?.transactionId ?? ''}
                  className="field-input"
                  placeholder={recentTraces[0]?.transactionId ?? 'txn_...'}
                />
              </label>

              <p className="field-help">{dictionary.passwordChange.transactionIdHelp}</p>

              <button type="submit" className="button button--primary">
                {dictionary.passwordChange.submit}
              </button>
            </form>

            <div className="trust-list">
              {dictionary.passwordChange.trustPoints.map((item) => (
                <div key={item} className="trust-list__item">
                  <span className="trust-list__dot" aria-hidden="true" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </CustomerCard>

        <CustomerCard>
          <div className="stack stack--sm">
            <span className="section-kicker">{dictionary.passwordChange.flowKicker}</span>
            <h3 className="section-title">{dictionary.passwordChange.flowTitle}</h3>
            <p className="muted">{dictionary.passwordChange.flowDescription}</p>
            <ol className="numbered-list numbered-list--spacious">
              {dictionary.passwordChange.flowSteps.map((step) => (
                <li key={step}>{step}</li>
              ))}
            </ol>
          </div>
        </CustomerCard>
      </section>

      <CustomerCard>
        <div className="stack stack--sm">
          <span className="section-kicker">{dictionary.passwordChange.recentKicker}</span>
          <h3 className="section-title">{dictionary.passwordChange.recentTitle}</h3>
          <p className="muted">{dictionary.passwordChange.recentDescription}</p>

          {recentTraces.length ? (
            <div className="trace-list">
              {recentTraces.map((trace) => (
                <div key={trace.transactionId} className="trace-item">
                  <div className="trace-item__header">
                    <div>
                      <strong>{trace.transactionId}</strong>
                      <p className="muted">{trace.email}</p>
                    </div>
                    <a
                      href={`/${locale}/password-change?transactionId=${encodeURIComponent(trace.transactionId)}`}
                      className="button button--secondary"
                    >
                      {dictionary.passwordChange.useTransaction}
                    </a>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-trace-panel">
              <strong>{dictionary.passwordChange.emptyTitle}</strong>
              <p>{dictionary.passwordChange.emptyDescription}</p>
            </div>
          )}
        </div>
      </CustomerCard>
    </CustomerShell>
  );
}
