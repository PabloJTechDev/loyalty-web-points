import Link from 'next/link';
import { getCustomerWallet } from '@/lib/api/customer';
import { CustomerBadge } from '@/features/customer/components/CustomerBadge';
import { CustomerCard } from '@/features/customer/components/CustomerCard';
import { MetricCard } from '@/features/customer/components/MetricCard';
import { SectionTitle } from '@/features/customer/components/SectionTitle';

function formatPoints(value: number) {
  return new Intl.NumberFormat('es-CL').format(value);
}

export default async function WalletPage() {
  const data = await getCustomerWallet();

  return (
    <main style={{ minHeight: '100vh', background: '#f5f5f7', color: '#1d1d1f' }}>
      <section
        style={{
          maxWidth: 1100,
          margin: '0 auto',
          padding: '56px 24px 72px',
          display: 'flex',
          flexDirection: 'column',
          gap: 24,
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <CustomerBadge label={`Wallet · Source: ${data.source ?? 'unknown'}`} />
            <h1 style={{ margin: 0, fontSize: 38 }}>Wallet</h1>
          </div>
          <Link href="/" style={{ color: '#0b57d0', fontWeight: 700 }}>
            Volver al home
          </Link>
        </div>

        <section
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: 16,
          }}
        >
          <MetricCard title="Puntos disponibles" value={formatPoints(data.summary.availablePoints)} />
          <MetricCard title="Puntos pendientes" value={formatPoints(data.summary.pendingPoints)} />
          <MetricCard
            title="Puntos por vencer"
            value={formatPoints(data.summary.expiringPoints)}
            description={`Vencen el ${data.summary.expiringAt}`}
          />
        </section>

        <CustomerCard>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <SectionTitle>Movimientos recientes</SectionTitle>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {data.movements.map((movement: { id: string; description: string; points: number; occurredAt: string }) => (
                <div
                  key={movement.id}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    gap: 16,
                    padding: '14px 0',
                    borderBottom: '1px solid #e5e5ea',
                  }}
                >
                  <div>
                    <strong>{movement.description}</strong>
                    <p style={{ margin: '6px 0 0', color: '#6e6e73' }}>{movement.occurredAt}</p>
                  </div>
                  <strong style={{ color: movement.points >= 0 ? '#0a7d33' : '#b42318' }}>
                    {movement.points > 0 ? '+' : ''}{formatPoints(movement.points)} pts
                  </strong>
                </div>
              ))}
            </div>
          </div>
        </CustomerCard>
      </section>
    </main>
  );
}
