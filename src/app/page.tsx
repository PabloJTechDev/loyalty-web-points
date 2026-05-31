import Link from 'next/link';
import { getCustomerHome } from '@/lib/api/customer';
import { CustomerBadge } from '@/features/customer/components/CustomerBadge';
import { MetricCard } from '@/features/customer/components/MetricCard';
import { CustomerCard } from '@/features/customer/components/CustomerCard';
import { SectionTitle } from '@/features/customer/components/SectionTitle';

function formatPoints(value: number) {
  return new Intl.NumberFormat('es-CL').format(value);
}

export default async function Home() {
  const data = await getCustomerHome();

  const cards = [
    {
      title: 'Puntos disponibles',
      value: formatPoints(data.wallet.availablePoints),
      description: 'Saldo actual para usar en beneficios y canjes.',
    },
    {
      title: 'Tier actual',
      value: data.membership.tier.name,
      description: `Te faltan ${formatPoints(data.tierProgress.missingPoints)} puntos para llegar a ${data.tierProgress.next}.`,
    },
    {
      title: 'Puntos por vencer',
      value: formatPoints(data.wallet.expiringPoints),
      description: `Vencen el ${data.wallet.expiringAt}.`,
    },
  ];

  return (
    <main style={{ minHeight: '100vh', background: '#f5f5f7', color: '#1d1d1f' }}>
      <section
        style={{
          maxWidth: 1100,
          margin: '0 auto',
          padding: '56px 24px 72px',
          display: 'flex',
          flexDirection: 'column',
          gap: 32,
        }}
      >
        <header style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <CustomerBadge label={`Loyalty Platform · Customer MVP · Source: ${data.source ?? 'unknown'}`} />
          <h1 style={{ fontSize: 42, lineHeight: 1.1, margin: 0 }}>Hola, {data.customer.firstName} 👋</h1>
          <p style={{ margin: 0, maxWidth: 760, fontSize: 18, color: '#6e6e73', lineHeight: 1.6 }}>
            Esta es la primera versión de la experiencia customer conectada al BFF. El objetivo es
            validar el journey inicial antes de bajar al dominio completo y al modelo de base de datos.
          </p>
        </header>

        <section
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: 16,
          }}
        >
          {cards.map((card) => (
            <MetricCard
              key={card.title}
              title={card.title}
              value={card.value}
              description={card.description}
            />
          ))}
        </section>

        <section
          style={{
            display: 'grid',
            gridTemplateColumns: '1.3fr 1fr',
            gap: 16,
          }}
        >
          <CustomerCard>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <SectionTitle>Resumen de actividad</SectionTitle>
              <ul style={{ margin: 0, paddingLeft: 20, color: '#4b5563', lineHeight: 1.8 }}>
                {data.recentActivity.map((item: { id: string; description: string; points: number }) => (
                  <li key={item.id}>
                    {item.description}: {item.points > 0 ? '+' : ''}
                    {formatPoints(item.points)} pts
                  </li>
                ))}
              </ul>
            </div>
          </CustomerCard>

          <CustomerCard>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <SectionTitle>Próximos pasos</SectionTitle>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <Link href="/profile-summary" style={{ color: '#0b57d0', fontWeight: 700 }}>
                  Ir a profile summary
                </Link>
                <Link href="/wallet" style={{ color: '#0b57d0', fontWeight: 700 }}>
                  Ir a wallet
                </Link>
                <ol style={{ margin: 0, paddingLeft: 20, color: '#4b5563', lineHeight: 1.8 }}>
                  <li>Reemplazar mock del core por integración real con Go.</li>
                  <li>Agregar componentes reutilizables del vertical customer.</li>
                  <li>Incorporar estados de carga, errores y observabilidad.</li>
                </ol>
              </div>
            </div>
          </CustomerCard>
        </section>
      </section>
    </main>
  );
}
