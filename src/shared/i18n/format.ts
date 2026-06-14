import type { Locale } from '@/shared/i18n/config';

export function formatPoints(value: number, locale: Locale) {
  return new Intl.NumberFormat(locale === 'es' ? 'es-CL' : 'en-US').format(value);
}

export function formatDate(value: string, locale: Locale) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat(locale === 'es' ? 'es-CL' : 'en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date);
}
