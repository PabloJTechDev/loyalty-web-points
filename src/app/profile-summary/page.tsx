import Link from 'next/link';
import { getCustomerProfileSummary } from '@/lib/api/customer';
import { CustomerBadge } from '@/features/customer/components/CustomerBadge';
import { CustomerCard } from '@/features/customer/components/CustomerCard';
import { SectionTitle } from '@/features/customer/components/SectionTitle';

export default async function ProfileSummaryPage() {
  const data = await getCustomerProfileSummary();

  return (
    <main style={{ minHeight: '100vh', background: '#f5f5f7', color: '#1d1d1f' }}>
      <section
        style={{
          maxWidth: 960,
          margin: '0 auto',
          padding: '56px 24px 72px',
          display: 'flex',
          flexDirection: 'column',
          gap: 24,
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <CustomerBadge label={`Profile Summary · Source: ${data.source ?? 'unknown'}`} />
            <h1 style={{ margin: 0, fontSize: 38 }}>Perfil del cliente</h1>
          </div>
          <Link href="/" style={{ color: '#0b57d0', fontWeight: 700 }}>
            Volver al home
          </Link>
        </div>

        <CustomerCard>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }}>
            <div>
              <SectionTitle>Identidad</SectionTitle>
              <p><strong>Nombre:</strong> {data.customer.fullName}</p>
              <p><strong>Documento:</strong> {data.customer.documentType} · {data.customer.documentNumberMasked}</p>
              <p><strong>Email:</strong> {data.customer.email}</p>
              <p><strong>Teléfono:</strong> {data.customer.phoneMasked}</p>
            </div>
            <div>
              <SectionTitle>Membresía</SectionTitle>
              <p><strong>Estado:</strong> {data.membership.status}</p>
              <p><strong>Tier:</strong> {data.membership.tier.name}</p>
              <p><strong>Fecha de inscripción:</strong> {data.membership.joinedAt}</p>
            </div>
          </div>
        </CustomerCard>
      </section>
    </main>
  );
}
