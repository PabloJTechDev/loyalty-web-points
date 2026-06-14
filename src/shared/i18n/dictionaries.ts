import es from '@/messages/es';
import en from '@/messages/en';
import { defaultLocale, type Locale } from '@/shared/i18n/config';

const dictionaries = {
  es,
  en,
} as const;

export type Dictionary = (typeof dictionaries)[Locale];

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale] ?? dictionaries[defaultLocale];
}
