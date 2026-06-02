import { notFound } from 'next/navigation';
import { getDemoSession } from '@/lib/auth/session';
import { getCustomerProfileSummary } from '@/lib/api/customer';
import { CustomerCard } from '@/features/customer/components/CustomerCard';
import { CustomerPageHeader } from '@/features/customer/components/CustomerPageHeader';
import { CustomerShell } from '@/features/customer/components/CustomerShell';
import { SectionTitle } from '@/features/customer/components/SectionTitle';
import { getDictionary } from '@/lib/i18n/dictionaries';
import { isLocale } from '@/lib/i18n/config';
import { formatDate } from '@/lib/i18n/format';

export default async function ProfileSummaryPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const [data, dictionary, authenticatedSession] = await Promise.all([
    getCustomerProfileSummary(),
    Promise.resolve(getDictionary(locale)),
    getDemoSession(),
  ]);

  return (
    <CustomerShell locale={locale} dictionary={dictionary} authenticatedSession={authenticatedSession}>
      <CustomerPageHeader
        badge={`${dictionary.profile.badge} · ${dictionary.common.source}: ${data.source ?? 'unknown'}`}
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
    </CustomerShell>
  );
}
