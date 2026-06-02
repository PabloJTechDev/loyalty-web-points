import { notFound } from 'next/navigation';
import { getDemoSession } from '@/lib/auth/session';
import { getCustomerWallet } from '@/lib/api/customer';
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
    </CustomerShell>
  );
}
