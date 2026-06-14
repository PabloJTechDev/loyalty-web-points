import { notFound } from 'next/navigation';
import { CustomerCard } from '@/shared/ui/CustomerCard';
import { CustomerPageHeader } from '@/shared/ui/CustomerPageHeader';
import { CustomerShell } from '@/shared/ui/CustomerShell';
import { getDictionary } from '@pablojtech/loyalty-shared-web/i18n';
import { getCustomerEnrollmentTraces } from '@/shared/api/customer';
import { isLocale } from '@pablojtech/loyalty-shared-web/i18n';

export default async function EnrollPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams?: Promise<{ status?: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const [dictionary, traces] = await Promise.all([
    Promise.resolve(getDictionary(locale)),
    getCustomerEnrollmentTraces(),
  ]);

  return (
    <CustomerShell locale={locale} dictionary={dictionary}>
      <CustomerPageHeader
        badge={dictionary.enroll.badge}
        title={dictionary.enroll.title}
        description={dictionary.enroll.description}
        aside={<div className="info-chip">{dictionary.enroll.chip}</div>}
      />

      <section className="grid grid--two">
        <CustomerCard tone="soft">
          <div className="stack">
            {resolvedSearchParams?.status === 'error' ? (
              <div className="trace-notice trace-notice--error">{dictionary.enroll.errorNotice}</div>
            ) : null}

            <div className="stack stack--sm">
              <span className="section-kicker">{dictionary.enroll.formKicker}</span>
              <h3 className="section-title">{dictionary.enroll.formTitle}</h3>
              <p className="muted">{dictionary.enroll.formDescription}</p>
            </div>

            <form action="/api/enrollment-demo" method="post" className="enrollment-form enrollment-form--page">
              <input type="hidden" name="locale" value={locale} />

              <label className="field-group">
                <span className="field-label">{dictionary.enroll.emailLabel}</span>
                <input
                  type="email"
                  name="email"
                  defaultValue={traces.defaultEmail}
                  className="field-input"
                  placeholder={traces.defaultEmail}
                />
              </label>

              <p className="field-help">{dictionary.enroll.emailHelp}</p>

              <label className="field-group">
                <span className="field-label">{locale === 'es' ? 'Clave de acceso' : 'Access password'}</span>
                <input
                  type="password"
                  name="password"
                  minLength={8}
                  className="field-input"
                  placeholder={locale === 'es' ? 'Mínimo 8 caracteres' : 'At least 8 characters'}
                  required
                />
              </label>

              <label className="field-group">
                <span className="field-label">{locale === 'es' ? 'Confirma la clave' : 'Confirm password'}</span>
                <input
                  type="password"
                  name="confirmPassword"
                  minLength={8}
                  className="field-input"
                  placeholder={locale === 'es' ? 'Repite la clave' : 'Repeat password'}
                  required
                />
              </label>

              <button type="submit" className="button button--primary">
                {dictionary.enroll.submit}
              </button>
            </form>

            <div className="trust-list">
              {dictionary.enroll.trustPoints.map((item) => (
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
            <span className="section-kicker">{dictionary.enroll.flowKicker}</span>
            <h3 className="section-title">{dictionary.enroll.flowTitle}</h3>
            <p className="muted">{dictionary.enroll.flowDescription}</p>
            <ol className="numbered-list numbered-list--spacious">
              {dictionary.enroll.flowSteps.map((step) => (
                <li key={step}>{step}</li>
              ))}
            </ol>
          </div>
        </CustomerCard>
      </section>
    </CustomerShell>
  );
}
