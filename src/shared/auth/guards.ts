import { redirect } from 'next/navigation';
import type { Locale } from '@/shared/i18n/config';
import { getDemoSession } from '@/shared/auth/session';

export async function requireDemoSession(locale: Locale) {
  const session = await getDemoSession();

  if (!session) {
    redirect(`/${locale}/login?status=auth-required`);
  }

  return session;
}
