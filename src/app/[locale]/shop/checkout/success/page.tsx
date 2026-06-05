import { notFound } from 'next/navigation';
import { getDemoSession } from '@/lib/auth/session';
import { CustomerPageHeader } from '@/features/customer/components/CustomerPageHeader';
import { CustomerShell } from '@/features/customer/components/CustomerShell';
import { StorefrontOrderSuccessClient } from '@/features/storefront/components/StorefrontOrderSuccessClient';
import { getDictionary } from '@/lib/i18n/dictionaries';
import { isLocale } from '@/lib/i18n/config';
import { getStorefrontOrderById } from '@/lib/api/storefront';

interface StoreCheckoutSuccessPageProps {
  params: Promise<{ locale: string }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}

function asString(value: string | string[] | undefined) {
  const raw = Array.isArray(value) ? value[0] : value;
  return typeof raw === 'string' && raw.trim().length ? raw.trim() : undefined;
}

export default async function StoreCheckoutSuccessPage({
  params,
  searchParams,
}: StoreCheckoutSuccessPageProps) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const resolvedSearchParams = searchParams ? await searchParams : {};
  const orderId = asString(resolvedSearchParams.orderId);

  if (!orderId) notFound();

  const [dictionary, authenticatedSession, order] = await Promise.all([
    Promise.resolve(getDictionary(locale)),
    getDemoSession(),
    getStorefrontOrderById(orderId),
  ]);

  if (!order) notFound();

  return (
    <CustomerShell locale={locale} dictionary={dictionary} authenticatedSession={authenticatedSession}>
      <CustomerPageHeader
        badge={locale === 'es' ? 'Order success mock' : 'Mock order success'}
        title={locale === 'es' ? 'Compra demo completada' : 'Demo purchase completed'}
        description={locale === 'es'
          ? 'La orden quedó creada desde el flujo mock storefront y ya puedes revisar su detalle.'
          : 'The order was created from the mock storefront flow and you can now review its detail.'}
        aside={<div className="info-chip info-chip--success">{order.status}</div>}
      />

      <StorefrontOrderSuccessClient locale={locale} order={order} />
    </CustomerShell>
  );
}
