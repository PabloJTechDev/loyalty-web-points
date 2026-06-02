import { getDictionary } from '@/lib/i18n/dictionaries';
import { defaultLocale, isLocale } from '@/lib/i18n/config';
import { CustomerShell } from '@/features/customer/components/CustomerShell';
import { LoadingState } from '@/features/customer/components/state/LoadingState';

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
