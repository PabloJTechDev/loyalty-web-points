import { redirect } from 'next/navigation';
import type { Locale } from '@/lib/i18n/config';
import { getDemoSession } from '@/lib/auth/session';

export async function requireDemoSession(locale: Locale) {
  const session = await getDemoSession();

  if (!session) {
    redirect(`/${locale}/login?status=auth-required`);
  }

  return session;
}
