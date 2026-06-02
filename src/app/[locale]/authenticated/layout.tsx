import type { ReactNode } from 'react';
import { notFound } from 'next/navigation';
import { getDictionary } from '@/lib/i18n/dictionaries';
import { requireDemoSession } from '@/lib/auth/guards';
import { isLocale } from '@/lib/i18n/config';
import { CustomerShell } from '@/features/customer/components/CustomerShell';

export default async function AuthenticatedLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!isLocale(locale)) {
    notFound();
  }

  const [dictionary, session] = await Promise.all([
    Promise.resolve(getDictionary(locale)),
    requireDemoSession(locale),
  ]);

  return (
    <CustomerShell locale={locale} dictionary={dictionary} authenticatedSession={session}>
      {children}
    </CustomerShell>
  );
}
