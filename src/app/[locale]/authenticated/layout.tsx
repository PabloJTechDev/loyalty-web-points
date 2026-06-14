import type { ReactNode } from 'react';
import { notFound } from 'next/navigation';
import { getDictionary } from '@/shared/i18n/dictionaries';
import { requireDemoSession } from '@/shared/auth/guards';
import { isLocale } from '@/shared/i18n/config';
import { CustomerShell } from '@/shared/ui/CustomerShell';

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
