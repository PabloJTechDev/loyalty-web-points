import { notFound } from 'next/navigation';
import { getDemoSession } from '@pablojtech/loyalty-shared-web/auth';
import { getCustomerProfileSummary } from '@/shared/api/customer';
import { CustomerCard } from '@/shared/ui/CustomerCard';
import { CustomerPageHeader } from '@/shared/ui/CustomerPageHeader';
import { CustomerShell } from '@/shared/ui/CustomerShell';
import { SectionTitle } from '@pablojtech/loyalty-shared-web/ui';
import { getDictionary } from '@pablojtech/loyalty-shared-web/i18n';
import { isLocale } from '@pablojtech/loyalty-shared-web/i18n';
import { formatDate } from '@pablojtech/loyalty-shared-web/i18n';

export default async function ProfileSummaryPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const [dictionary, authenticatedSession] = await Promise.all([
    Promise.resolve(getDictionary(locale)),
    getDemoSession(),
  ]);

  const data = await getCustomerProfileSummary(authenticatedSession?.loginId);

  return (
    <CustomerShell locale={locale} dictionary={dictionary} authenticatedSession={authenticatedSession}>
      <CustomerPageHeader
        badge={`${dictionary.profile.badge} · ${dictionary.common.source}: ${data.sourceDetails.visible}`}
        title={dictionary.profile.title}
        description={dictionary.profile.description}
        aside={<div className="info-chip">{dictionary.profile.chip}</div>}
      />

      <section className="grid grid--equal">
        <CustomerCard>
          <div className="stack stack--sm">
            <SectionTitle>{dictionary.profile.identity}</SectionTitle>
            <div className="data-list">
              <div className="data-row">
                <span className="data-label">{dictionary.profile.fields.name}</span>
                <span className="data-value">{data.customer.fullName}</span>
              </div>
              <div className="data-row">
                <span className="data-label">{dictionary.profile.fields.document}</span>
                <span className="data-value">
                  {data.customer.documentType} · {data.customer.documentNumberMasked}
                </span>
              </div>
              <div className="data-row">
                <span className="data-label">{dictionary.profile.fields.email}</span>
                <span className="data-value">{data.customer.email}</span>
              </div>
              <div className="data-row">
                <span className="data-label">{dictionary.profile.fields.phone}</span>
                <span className="data-value">{data.customer.phoneMasked}</span>
              </div>
            </div>
          </div>
        </CustomerCard>

        <CustomerCard>
          <div className="stack stack--sm">
            <SectionTitle>{dictionary.profile.membership}</SectionTitle>
            <div className="data-list">
              <div className="data-row">
                <span className="data-label">{dictionary.profile.fields.status}</span>
                <span className="data-value">{data.membership.status}</span>
              </div>
              <div className="data-row">
                <span className="data-label">{dictionary.profile.fields.tier}</span>
                <span className="data-value">{data.membership.tier.name}</span>
              </div>
              <div className="data-row">
                <span className="data-label">{dictionary.profile.fields.joinedAt}</span>
                <span className="data-value">{formatDate(data.membership.joinedAt, locale)}</span>
              </div>
            </div>
          </div>
        </CustomerCard>
      </section>

      <section className="section-block">
        <CustomerCard tone="soft">
          <div className="stack stack--sm">
            <SectionTitle>{locale === 'es' ? 'Origen visible de la experiencia' : 'Visible experience source'}</SectionTitle>
            <div className="data-list">
              <div className="data-row">
                <span className="data-label">{locale === 'es' ? 'profile-summary BFF' : 'profile-summary BFF'}</span>
                <span className="data-value">{data.sourceDetails.profileSummary}</span>
              </div>
              <div className="data-row">
                <span className="data-label">{locale === 'es' ? 'sesión autenticada' : 'authenticated session'}</span>
                <span className="data-value">{data.sourceDetails.authenticatedSession}</span>
              </div>
              <div className="data-row">
                <span className="data-label">loginId</span>
                <span className="data-value">{data.sourceDetails.loginId ?? '—'}</span>
              </div>
              <div className="data-row">
                <span className="data-label">{dictionary.common.source}</span>
                <span className="data-value">{data.sourceDetails.visible}</span>
              </div>
            </div>
            <p className="muted">
              {data.sourceDetails.usesFallback
                ? locale === 'es'
                  ? 'La identidad y membresía siguen usando el fallback del BFF para profile-summary. Si existe loginId en la cookie demo, la web además consulta la traza real de login en el BFF y completa nombre, email enmascarado, customerId y tier con esa sesión auténtica.'
                  : 'Identity and membership still use the BFF fallback for profile-summary. If a loginId exists in the demo cookie, the web also fetches the real login trace from the BFF and completes name, masked email, customerId, and tier with that authenticated session.'
                : locale === 'es'
                  ? 'El resumen principal ya viene del BFF. Si hay loginId en la cookie demo, también mostramos el contexto autenticado real del mismo journey sin hablar directo con core.'
                  : 'The main summary already comes from the BFF. If there is a loginId in the demo cookie, we also show the real authenticated context from the same journey without talking directly to core.'}
            </p>
          </div>
        </CustomerCard>
      </section>

      {data.sessionTrace?.trace ? (
        <section className="section-block">
          <CustomerCard tone="soft">
            <div className="stack stack--sm">
              <SectionTitle>{locale === 'es' ? 'Sesión autenticada real' : 'Real authenticated session'}</SectionTitle>
              <div className="data-list">
                <div className="data-row">
                  <span className="data-label">loginId</span>
                  <span className="data-value">{data.sessionTrace.trace.loginId}</span>
                </div>
                <div className="data-row">
                  <span className="data-label">requestId</span>
                  <span className="data-value">{data.sessionTrace.trace.requestId}</span>
                </div>
                <div className="data-row">
                  <span className="data-label">transactionId</span>
                  <span className="data-value">{data.sessionTrace.trace.transactionId}</span>
                </div>
                <div className="data-row">
                  <span className="data-label">customerId</span>
                  <span className="data-value">{data.sessionTrace.trace.customerSnapshot.customerId}</span>
                </div>
                <div className="data-row">
                  <span className="data-label">status</span>
                  <span className="data-value">{data.sessionTrace.trace.session.status}</span>
                </div>
              </div>
            </div>
          </CustomerCard>
        </section>
      ) : null}
    </CustomerShell>
  );
}
