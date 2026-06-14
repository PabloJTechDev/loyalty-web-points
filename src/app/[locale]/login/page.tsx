import { notFound } from 'next/navigation';
import { CustomerCard } from '@/shared/ui/CustomerCard';
import { CustomerPageHeader } from '@/shared/ui/CustomerPageHeader';
import { CustomerShell } from '@/shared/ui/CustomerShell';
import { getDictionary } from '@/shared/i18n/dictionaries';
import { isLocale } from '@/shared/i18n/config';

function resolveStatusNotice(
  status: string | undefined,
  dictionary: ReturnType<typeof getDictionary>,
) {
  if (status === 'missing-request') {
    return { tone: 'error' as const, message: dictionary.login.statusMissingRequest };
  }

  if (status === 'password-change-not-found') {
    return { tone: 'error' as const, message: dictionary.login.statusPasswordChangeNotFound };
  }

  if (status === 'error') {
    return { tone: 'error' as const, message: dictionary.login.statusError };
  }

  if (status === 'auth-required') {
    return { tone: 'error' as const, message: dictionary.login.statusAuthRequired };
  }

  if (status === 'logged-out') {
    return { tone: 'success' as const, message: dictionary.login.statusLoggedOut };
  }

  return null;
}

export default async function LoginPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams?: Promise<{ status?: string; requestId?: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const dictionary = getDictionary(locale);
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const statusNotice = resolveStatusNotice(resolvedSearchParams?.status, dictionary);

  return (
    <CustomerShell locale={locale} dictionary={dictionary}>
      <CustomerPageHeader
        badge={dictionary.login.badge}
        title={dictionary.login.title}
        description={dictionary.login.description}
        aside={<div className="info-chip">{dictionary.login.chip}</div>}
      />

      <section className="grid grid--two">
        <CustomerCard tone="soft">
          <div className="stack">
            {statusNotice ? (
              <div className={`trace-notice trace-notice--${statusNotice.tone}`}>{statusNotice.message}</div>
            ) : null}

            <div className="stack stack--sm">
              <span className="section-kicker">{dictionary.login.formKicker}</span>
              <h3 className="section-title">{dictionary.login.formTitle}</h3>
              <p className="muted">{dictionary.login.formDescription}</p>
            </div>

            <form action="/api/login-demo" method="post" className="enrollment-form enrollment-form--page">
              <input type="hidden" name="locale" value={locale} />

              <label className="field-group">
                <span className="field-label">{dictionary.login.requestIdLabel}</span>
                <input
                  type="text"
                  name="requestId"
                  defaultValue={resolvedSearchParams?.requestId ?? ''}
                  className="field-input"
                  placeholder="pwd_..."
                />
              </label>

              <p className="field-help">{dictionary.login.requestIdHelp}</p>

              <button type="submit" className="button button--primary">
                {dictionary.login.submit}
              </button>
            </form>

            <div className="trust-list">
              {dictionary.login.trustPoints.map((item) => (
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
            <span className="section-kicker">{dictionary.login.flowKicker}</span>
            <h3 className="section-title">{dictionary.login.flowTitle}</h3>
            <p className="muted">{dictionary.login.flowDescription}</p>
            <ol className="numbered-list numbered-list--spacious">
              {dictionary.login.flowSteps.map((step) => (
                <li key={step}>{step}</li>
              ))}
            </ol>
          </div>
        </CustomerCard>
      </section>
    </CustomerShell>
  );
}
