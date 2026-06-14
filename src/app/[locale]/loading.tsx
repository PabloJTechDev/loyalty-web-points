import { getDictionary } from '@pablojtech/loyalty-shared-web/i18n';
import { defaultLocale, isLocale } from '@pablojtech/loyalty-shared-web/i18n';
import { CustomerShell } from '@/shared/ui/CustomerShell';
import { LoadingState } from '@pablojtech/loyalty-shared-web/ui/state';

export default async function Loading({
  params,
}: {
  params?: Promise<{ locale?: string }>;
}) {
  const resolved = params ? await params : undefined;
  const locale = resolved?.locale && isLocale(resolved.locale) ? resolved.locale : defaultLocale;
  const dictionary = getDictionary(locale);

  return (
    <CustomerShell locale={locale} dictionary={dictionary}>
      <LoadingState
        title={locale === 'es' ? 'Cargando experiencia' : 'Loading experience'}
        description={
          locale === 'es'
            ? 'Estamos preparando tu información para mostrarla de forma clara y útil.'
            : 'We are preparing your information to display it clearly and helpfully.'
        }
      />
    </CustomerShell>
  );
}
