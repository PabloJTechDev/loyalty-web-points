'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { Dictionary } from '@/shared/i18n/dictionaries';
import type { Locale } from '@/shared/i18n/config';

interface CustomerNavProps {
  locale: Locale;
  dictionary: Dictionary;
}

export function CustomerNav({ locale, dictionary }: CustomerNavProps) {
  const pathname = usePathname();
  const links = [
    { href: `/${locale}`, label: dictionary.nav.home, matcher: (value: string) => value === `/${locale}` },
    { href: `/${locale}/login`, label: dictionary.nav.login, matcher: (value: string) => value.startsWith(`/${locale}/login`) },
    { href: `/${locale}/profile-summary`, label: dictionary.nav.profile, matcher: (value: string) => value.startsWith(`/${locale}/profile-summary`) },
    { href: `/${locale}/wallet`, label: dictionary.nav.points, matcher: (value: string) => value.startsWith(`/${locale}/wallet`) },
  ];

  return (
    <nav className="top-nav top-nav--landing" aria-label="Main navigation">
      {links.map((link) => {
        const isActive = link.matcher(pathname);

        return (
          <Link
            key={link.href}
            href={link.href}
            className={`top-nav__link top-nav__link--landing${isActive ? ' top-nav__link--active' : ''}`}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
