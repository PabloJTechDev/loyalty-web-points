import type { ReactNode } from 'react';
import { notFound } from 'next/navigation';
import { getDictionary } from '@pablojtech/loyalty-shared-web/i18n';
import { requireDemoSession } from '@/shared/auth/guards';
import { isLocale } from '@pablojtech/loyalty-shared-web/i18n';
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
