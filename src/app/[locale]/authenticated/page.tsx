import Link from 'next/link';
import { CustomerCard } from '@/shared/ui/CustomerCard';
import { CustomerPageHeader } from '@/shared/ui/CustomerPageHeader';
import { getDictionary } from '@pablojtech/loyalty-shared-web/i18n';
import { getDemoSession } from '@pablojtech/loyalty-shared-web/auth';
import { getCustomerLoginTraceByLoginId } from '@/shared/api/customer';
import { formatDate } from '@pablojtech/loyalty-shared-web/i18n';

export default async function AuthenticatedHomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const [dictionary, session] = await Promise.all([
    Promise.resolve(getDictionary(locale as 'es' | 'en')),
    getDemoSession(),
  ]);

  if (!session) {
    return null;
  }

  const loginTrace = await getCustomerLoginTraceByLoginId(session.loginId);

  return (
    <>
      <CustomerPageHeader
        badge={dictionary.login.authenticatedArea}
        title={session.fullName}
        description={dictionary.login.authenticatedDescription}
        aside={<div className="info-chip info-chip--success">{session.tier}</div>}
      />

      <section className="grid grid--two">
        <CustomerCard tone="soft">
          <div className="stack stack--sm">
            <span className="section-kicker">{locale === 'es' ? 'Sesión demo' : 'Demo session'}</span>
            <h3 className="section-title">{locale === 'es' ? 'Contexto autenticado activo' : 'Authenticated context active'}</h3>
            <div className="data-list">
              <div className="data-row">
                <span className="data-label">loginId</span>
                <span className="data-value">{session.loginId}</span>
              </div>
              <div className="data-row">
                <span className="data-label">{locale === 'es' ? 'Nombre' : 'Name'}</span>
                <span className="data-value">{session.fullName}</span>
              </div>
              {session.customerId ? (
                <div className="data-row">
                  <span className="data-label">customerId</span>
                  <span className="data-value">{session.customerId}</span>
                </div>
              ) : null}
              {session.maskedEmail ? (
                <div className="data-row">
                  <span className="data-label">{locale === 'es' ? 'Email' : 'Email'}</span>
                  <span className="data-value">{session.maskedEmail}</span>
                </div>
              ) : null}
              <div className="data-row">
                <span className="data-label">Tier</span>
                <span className="data-value">{session.tier}</span>
              </div>
              {loginTrace?.trace ? (
                <>
                  <div className="data-row">
                    <span className="data-label">requestId</span>
                    <span className="data-value">{loginTrace.trace.requestId}</span>
                  </div>
                  <div className="data-row">
                    <span className="data-label">transactionId</span>
                    <span className="data-value">{loginTrace.trace.transactionId}</span>
                  </div>
                  <div className="data-row">
                    <span className="data-label">auth status</span>
                    <span className="data-value">{loginTrace.trace.session.status}</span>
                  </div>
                  {loginTrace.trace.session.authenticatedAt ? (
                    <div className="data-row">
                      <span className="data-label">authenticatedAt</span>
                      <span className="data-value">{formatDate(loginTrace.trace.session.authenticatedAt, locale as 'es' | 'en')}</span>
                    </div>
                  ) : null}
                </>
              ) : null}
            </div>
          </div>
        </CustomerCard>

        <CustomerCard>
          <div className="stack stack--sm">
            <span className="section-kicker">{locale === 'es' ? 'Siguientes acciones' : 'Next actions'}</span>
            <h3 className="section-title">{locale === 'es' ? 'Navega la experiencia protegida' : 'Navigate the protected experience'}</h3>
            <p className="muted">
              {locale === 'es'
                ? `Sesión activa al ${formatDate(new Date().toISOString(), 'es')}. Desde aquí puedes seguir navegando con cookie demo en vez de query params.`
                : `Session active as of ${formatDate(new Date().toISOString(), 'en')}. From here you can keep navigating with a demo cookie instead of query params.`}
            </p>
            <div className="hero-actions">
              <Link href={`/${locale}/profile-summary`} className="button button--primary">
                {locale === 'es' ? 'Ver perfil' : 'View profile'}
              </Link>
              <Link href={`/${locale}/wallet`} className="button button--secondary">
                {locale === 'es' ? 'Abrir wallet' : 'Open wallet'}
              </Link>
              <Link href={`/${locale}/login/traces/${session.loginId}`} className="button button--ghost">
                {locale === 'es' ? 'Ver trace login' : 'View login trace'}
              </Link>
            </div>
          </div>
        </CustomerCard>
      </section>

      {loginTrace?.coreRecord ? (
        <section className="section-block">
          <CustomerCard>
            <div className="stack stack--sm">
              <span className="section-kicker">{locale === 'es' ? 'Core evidence' : 'Core evidence'}</span>
              <h3 className="section-title">{locale === 'es' ? 'Autenticación confirmada por el core' : 'Authentication confirmed by core'}</h3>
              <div className="data-list">
                <div className="data-row">
                  <span className="data-label">loginId</span>
                  <span className="data-value">{loginTrace.coreRecord.loginId}</span>
                </div>
                <div className="data-row">
                  <span className="data-label">requestId</span>
                  <span className="data-value">{loginTrace.coreRecord.requestId}</span>
                </div>
                <div className="data-row">
                  <span className="data-label">stage</span>
                  <span className="data-value">{loginTrace.coreRecord.stage}</span>
                </div>
                <div className="data-row">
                  <span className="data-label">source</span>
                  <span className="data-value">{loginTrace.coreRecord.source}</span>
                </div>
              </div>
            </div>
          </CustomerCard>
        </section>
      ) : null}
    </>
  );
}
