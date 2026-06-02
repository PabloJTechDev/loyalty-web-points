'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { locales, type Locale } from '@/lib/i18n/config';

interface LocaleSwitcherProps {
  locale: Locale;
  label: string;
  labels: Record<Locale, string>;
}

export function LocaleSwitcher({ locale, label, labels }: LocaleSwitcherProps) {
  const pathname = usePathname();
  const strippedPath = pathname.replace(/^\/(es|en)/, '') || '/';

  return (
    <div className="locale-switcher-wrap">
      <span className="locale-switcher-wrap__label">{label}</span>
      <div className="locale-switcher" aria-label={label}>
        {locales.map((item) => {
          const href = `/${item}${strippedPath === '/' ? '' : strippedPath}`;
          const active = item === locale;

          return (
            <Link
              key={item}
              href={href}
              className={`locale-switcher__link${active ? ' locale-switcher__link--active' : ''}`}
            >
              {labels[item]}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
