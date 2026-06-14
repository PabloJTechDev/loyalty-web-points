import { notFound } from 'next/navigation';
import { getDemoSession } from '@pablojtech/loyalty-shared-web/auth';
import { getCustomerLoginTraceByLoginId, getCustomerWallet, getPointsBalance, getPointsTransactions } from '@/shared/api/customer';
import { CustomerCard } from '@/shared/ui/CustomerCard';
import { CustomerPageHeader } from '@/shared/ui/CustomerPageHeader';
import { CustomerShell } from '@/shared/ui/CustomerShell';
import { MetricCard } from '@pablojtech/loyalty-shared-web/ui';
import { SectionTitle } from '@pablojtech/loyalty-shared-web/ui';
import { EmptyState } from '@pablojtech/loyalty-shared-web/ui/state';
import { getDictionary } from '@pablojtech/loyalty-shared-web/i18n';
import { isLocale } from '@pablojtech/loyalty-shared-web/i18n';
import { formatDate, formatPoints } from '@pablojtech/loyalty-shared-web/i18n';

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

  const [pointsBalance, pointsTransactions] = authenticatedSession?.customerId
    ? await Promise.all([
        getPointsBalance(authenticatedSession.customerId),
        getPointsTransactions(authenticatedSession.customerId),
      ])
    : [null, null];

  const hasRealPoints = pointsBalance && pointsBalance.source === 'core-points';

  return (
    <CustomerShell locale={locale} dictionary={dictionary} authenticatedSession={authenticatedSession}>
      <CustomerPageHeader
        badge={`${dictionary.wallet.badge} · ${dictionary.common.source}: ${hasRealPoints ? 'core-points' : data.source ?? 'unknown'}`}
        title={dictionary.wallet.title}
        description={dictionary.wallet.description}
        aside={<div className="info-chip">{dictionary.wallet.chip}</div>}
      />

      <section className="grid grid--metrics">
        <MetricCard title={dictionary.wallet.metrics.available} value={formatPoints(hasRealPoints ? pointsBalance.balancePoints : data.summary.availablePoints, locale)} />
        <MetricCard title={locale === 'es' ? 'Total acumulado' : 'Lifetime accrued'} value={formatPoints(hasRealPoints ? pointsBalance.lifetimeAccrued : data.summary.pendingPoints, locale)} />
        <MetricCard
          title={locale === 'es' ? 'Total canjeado' : 'Lifetime redeemed'}
          value={formatPoints(hasRealPoints ? pointsBalance.lifetimeRedeemed : data.summary.expiringPoints, locale)}
        />
      </section>

      <CustomerCard>
        <div className="stack stack--sm">
          <SectionTitle>{dictionary.wallet.movements}</SectionTitle>
          {hasRealPoints && pointsTransactions && pointsTransactions.items.length ? (
            <div className="activity-list">
              {pointsTransactions.items.map(
                (tx: { transactionId: string; type: string; points: number; description: string; createdAt: string }) => (
                  <div key={tx.transactionId} className="activity-item">
                    <div className="activity-item__meta">
                      <strong>{tx.description}</strong>
                      <p className="muted">{tx.type} · {formatDate(tx.createdAt, locale)}</p>
                    </div>
                    <strong className={tx.type === 'accrue' ? 'points-positive' : 'points-negative'}>
                      {tx.type === 'accrue' ? '+' : '-'}
                      {formatPoints(tx.points, locale)} pts
                    </strong>
                  </div>
                ),
              )}
            </div>
          ) : data.movements.length ? (
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
                <span className="data-label">balance</span>
                <span className="data-value">{hasRealPoints ? `${pointsBalance.balancePoints} pts` : 'sin cuenta'}</span>
              </div>
            </div>
          </div>
        </CustomerCard>
      ) : null}
    </CustomerShell>
  );
}
