import { getDictionary } from '@/shared/i18n/dictionaries';
import { defaultLocale, isLocale } from '@/shared/i18n/config';
import { CustomerShell } from '@/shared/ui/CustomerShell';
import { LoadingState } from '@/shared/ui/state/LoadingState';

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
