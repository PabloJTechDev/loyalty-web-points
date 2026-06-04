import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getDemoSession } from '@/lib/auth/session';
import { getStorefrontCatalog } from '@/lib/api/storefront';
import { getCustomerWallet } from '@/lib/api/customer';
import { CustomerCard } from '@/features/customer/components/CustomerCard';
import { CustomerPageHeader } from '@/features/customer/components/CustomerPageHeader';
import { CustomerShell } from '@/features/customer/components/CustomerShell';
import { SectionTitle } from '@/features/customer/components/SectionTitle';
import { StorefrontCheckoutClient } from '@/features/storefront/components/StorefrontCheckoutClient';
import { getDictionary } from '@/lib/i18n/dictionaries';
import { isLocale } from '@/lib/i18n/config';

interface CheckoutPageProps {
  params: Promise<{ locale: string }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}

function asNumber(value: string | string[] | undefined) {
  const raw = Array.isArray(value) ? value[0] : value;
  const parsed = Number(raw);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function asString(value: string | string[] | undefined) {
  const raw = Array.isArray(value) ? value[0] : value;
  return typeof raw === 'string' && raw.trim().length ? raw.trim() : undefined;
}

export default async function StoreCheckoutPage({ params, searchParams }: CheckoutPageProps) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const resolvedSearchParams = searchParams ? await searchParams : {};

  const [catalog, wallet, dictionary, authenticatedSession] = await Promise.all([
    getStorefrontCatalog(locale),
    getCustomerWallet(),
    Promise.resolve(getDictionary(locale)),
    getDemoSession(),
  ]);

  const feedback = {
    status: asString(resolvedSearchParams.reserveStatus) as 'reserved' | 'simulated' | 'rejected' | undefined,
    reservedPoints: asNumber(resolvedSearchParams.reservedPoints),
    coveredUsd: asNumber(resolvedSearchParams.coveredUsd),
    payableUsd: asNumber(resolvedSearchParams.payableUsd),
    requestedPoints: asNumber(resolvedSearchParams.requestedPoints),
    reservationId: asString(resolvedSearchParams.reservationId),
    message: asString(resolvedSearchParams.message),
    source: asString(resolvedSearchParams.source),
    integrationError: asString(resolvedSearchParams.integrationError),
  };

  return (
    <CustomerShell locale={locale} dictionary={dictionary} authenticatedSession={authenticatedSession}>
      <CustomerPageHeader
        badge={locale === 'es' ? 'Checkout summary' : 'Checkout summary'}
        title={locale === 'es' ? 'Reserva de puntos sobre quote actual' : 'Point reservation over current quote'}
        description={locale === 'es'
          ? 'Pantalla resumen conectada al carrito actual. Muestra subtotal, puntos reservables, cobertura en USD y deja lista la integración con reserve mock del BFF.'
          : 'Summary screen connected to the current cart. It shows subtotal, reservable points, USD coverage, and keeps the BFF reserve mock integration ready.'}
        aside={<div className="info-chip">{catalog.integrations.storefront.available ? 'Storefront API' : 'Storefront fallback'}</div>}
      />

      <StorefrontCheckoutClient
        locale={locale}
        products={catalog.items}
        availablePoints={wallet.summary.availablePoints}
        feedback={feedback}
      />

      <section className="section-block">
        <CustomerCard tone="soft">
          <div className="stack stack--sm">
            <SectionTitle>{locale === 'es' ? 'Flujo intacto' : 'Intact flow'}</SectionTitle>
            <div className="link-list">
              <Link href={`/${locale}/login`}>{locale === 'es' ? 'Login y sesión actual' : 'Current login and session'}</Link>
              <Link href={`/${locale}/profile-summary`}>{locale === 'es' ? 'Profile summary actual' : 'Current profile summary'}</Link>
              <Link href={`/${locale}/wallet`}>{locale === 'es' ? 'Wallet actual' : 'Current wallet'}</Link>
            </div>
          </div>
        </CustomerCard>
      </section>
    </CustomerShell>
  );
}
