import { redirect } from 'next/navigation';
import type { Locale } from '@pablojtech/loyalty-shared-web/i18n';
import { getDemoSession } from '@pablojtech/loyalty-shared-web/auth';

export async function requireDemoSession(locale: Locale) {
  const session = await getDemoSession();

  if (!session) {
    redirect(`/${locale}/login?status=auth-required`);
  }

  return session;
}
