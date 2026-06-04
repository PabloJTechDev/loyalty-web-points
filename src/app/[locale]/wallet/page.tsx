import { notFound } from 'next/navigation';
import { getDemoSession } from '@/lib/auth/session';
import { getCustomerLoginTraceByLoginId, getCustomerWallet } from '@/lib/api/customer';
import { CustomerCard } from '@/features/customer/components/CustomerCard';
import { CustomerPageHeader } from '@/features/customer/components/CustomerPageHeader';
import { CustomerShell } from '@/features/customer/components/CustomerShell';
import { MetricCard } from '@/features/customer/components/MetricCard';
import { SectionTitle } from '@/features/customer/components/SectionTitle';
import { EmptyState } from '@/features/customer/components/state/EmptyState';
import { getDictionary } from '@/lib/i18n/dictionaries';
import { isLocale } from '@/lib/i18n/config';
import { formatDate, formatPoints } from '@/lib/i18n/format';

export default async function WalletPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const [data, dictionary, authenticatedSession] = await Promise.all([
    getCustomerWallet(),
    Promise.resolve(getDictionary(locale)),
    getDemoSession(),
  ]);

  const loginTrace = authenticatedSession
    ? await getCustomerLoginTraceByLoginId(authenticatedSession.loginId)
    : null;

  return (
    <CustomerShell locale={locale} dictionary={dictionary} authenticatedSession={authenticatedSession}>
      <CustomerPageHeader
        badge={`${dictionary.wallet.badge} · ${dictionary.common.source}: ${data.source ?? 'unknown'}`}
        title={dictionary.wallet.title}
        description={dictionary.wallet.description}
        aside={<div className="info-chip">{dictionary.wallet.chip}</div>}
      />

      <section className="grid grid--metrics">
        <MetricCard title={dictionary.wallet.metrics.available} value={formatPoints(data.summary.availablePoints, locale)} />
        <MetricCard title={dictionary.wallet.metrics.pending} value={formatPoints(data.summary.pendingPoints, locale)} />
        <MetricCard
          title={dictionary.wallet.metrics.expiring}
          value={formatPoints(data.summary.expiringPoints, locale)}
          description={`${dictionary.wallet.metrics.expiringDescPrefix} ${formatDate(data.summary.expiringAt, locale)}`}
        />
      </section>

      <CustomerCard>
        <div className="stack stack--sm">
          <SectionTitle>{dictionary.wallet.movements}</SectionTitle>
          {data.movements.length ? (
            <div className="activity-list">
              {data.movements.map(
                (movement: { id: string; description: string; points: number; occurredAt: string }) => (
                  <div key={movement.id} className="activity-item">
                    <div className="activity-item__meta">
                      <strong>{movement.description}</strong>
                      <p className="muted">{formatDate(movement.occurredAt, locale)}</p>
                    </div>
                    <strong className={movement.points >= 0 ? 'points-positive' : 'points-negative'}>
                      {movement.points > 0 ? '+' : ''}
                      {formatPoints(movement.points, locale)} pts
                    </strong>
                  </div>
                ),
              )}
            </div>
          ) : (
            <EmptyState
              title={locale === 'es' ? 'Todavía no hay movimientos' : 'There are no movements yet'}
              description={
                locale === 'es'
                  ? 'Cuando el cliente acumule o canjee puntos, este historial mostrará el detalle.'
                  : 'When the customer earns or redeems points, this history will show the detail.'
              }
            />
          )}
        </div>
      </CustomerCard>

      {loginTrace?.trace ? (
        <CustomerCard tone="soft">
          <div className="stack stack--sm">
            <SectionTitle>{locale === 'es' ? 'Contexto real de la sesión' : 'Real session context'}</SectionTitle>
            <div className="data-list">
              <div className="data-row">
                <span className="data-label">customerId</span>
                <span className="data-value">{authenticatedSession?.customerId ?? loginTrace.trace.customerSnapshot.customerId}</span>
              </div>
              <div className="data-row">
                <span className="data-label">loginId</span>
                <span className="data-value">{loginTrace.trace.loginId}</span>
              </div>
              <div className="data-row">
                <span className="data-label">transactionId</span>
                <span className="data-value">{loginTrace.trace.transactionId}</span>
              </div>
              <div className="data-row">
                <span className="data-label">{locale === 'es' ? 'Estado de sesión' : 'Session status'}</span>
                <span className="data-value">{loginTrace.trace.session.status}</span>
              </div>
            </div>
            <p className="muted">
              {locale === 'es'
                ? 'El wallet todavía usa datos demo para saldos y movimientos, pero la sesión autenticada y su trazabilidad ya vienen del flujo real web → BFF → core.'
                : 'The wallet still uses demo balances and movements, but the authenticated session and its traceability already come from the real web → BFF → core flow.'}
            </p>
          </div>
        </CustomerCard>
      ) : null}
    </CustomerShell>
  );
}
