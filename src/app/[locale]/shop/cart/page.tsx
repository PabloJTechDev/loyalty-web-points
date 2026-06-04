import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getDemoSession } from '@/lib/auth/session';
import { getStorefrontCatalog } from '@/lib/api/storefront';
import { getCustomerWallet } from '@/lib/api/customer';
import { CustomerCard } from '@/features/customer/components/CustomerCard';
import { CustomerPageHeader } from '@/features/customer/components/CustomerPageHeader';
import { CustomerShell } from '@/features/customer/components/CustomerShell';
import { SectionTitle } from '@/features/customer/components/SectionTitle';
import { StorefrontCartClient } from '@/features/storefront/components/StorefrontCartClient';
import { getDictionary } from '@/lib/i18n/dictionaries';
import { isLocale } from '@/lib/i18n/config';

export default async function StoreCartPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const [catalog, wallet, dictionary, authenticatedSession] = await Promise.all([
    getStorefrontCatalog(locale),
    getCustomerWallet(),
    Promise.resolve(getDictionary(locale)),
    getDemoSession(),
  ]);

  return (
    <CustomerShell locale={locale} dictionary={dictionary} authenticatedSession={authenticatedSession}>
      <CustomerPageHeader
        badge={locale === 'es' ? 'Carrito + quote demo' : 'Demo cart + quote'}
        title={locale === 'es' ? 'Carrito storefront listo para BFF' : 'Storefront cart ready for BFF'}
        description={locale === 'es'
          ? 'La UI usa el catálogo actual y calcula un quote coherente en fallback. Cuando exista el endpoint del BFF, la capa API ya queda preparada para reemplazar esta lógica.'
          : 'The UI uses the current catalog and computes a coherent fallback quote. When the BFF endpoint exists, the API layer is already prepared to replace this logic.'}
        aside={<div className="info-chip">{catalog.source}</div>}
      />

      <StorefrontCartClient locale={locale} products={catalog.items} availablePoints={wallet.summary.availablePoints} />

      <section className="section-block">
        <CustomerCard>
          <div className="stack stack--sm">
            <SectionTitle>{locale === 'es' ? 'Continuar a checkout' : 'Continue to checkout'}</SectionTitle>
            <p className="muted">
              {locale === 'es'
                ? 'Cuando el carrito ya tenga los productos correctos, avanza al resumen de checkout para reservar puntos contra el quote actual.'
                : 'Once the cart has the right products, move to the checkout summary to reserve points against the current quote.'}
            </p>
            <div className="link-list">
              <Link href={`/${locale}/shop/checkout`}>
                {locale === 'es' ? 'Abrir checkout summary' : 'Open checkout summary'}
              </Link>
            </div>
          </div>
        </CustomerCard>
      </section>

      <section className="section-block">
        <CustomerCard tone="soft">
          <div className="stack stack--sm">
            <SectionTitle>{locale === 'es' ? 'Qué queda intacto' : 'What stays intact'}</SectionTitle>
            <div className="link-list">
              <Link href={`/${locale}/login`}>{locale === 'es' ? 'Login y sesión demo' : 'Login and demo session'}</Link>
              <Link href={`/${locale}/profile-summary`}>{locale === 'es' ? 'Profile summary actual' : 'Current profile summary'}</Link>
              <Link href={`/${locale}/wallet`}>{locale === 'es' ? 'Wallet actual' : 'Current wallet'}</Link>
            </div>
          </div>
        </CustomerCard>
      </section>
    </CustomerShell>
  );
}
