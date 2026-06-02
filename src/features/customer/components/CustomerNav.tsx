'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { Dictionary } from '@/lib/i18n/dictionaries';
import type { Locale } from '@/lib/i18n/config';

interface CustomerNavProps {
  locale: Locale;
  dictionary: Dictionary;
}

export function CustomerNav({ locale, dictionary }: CustomerNavProps) {
  const pathname = usePathname();
  const links = [
    { href: `/${locale}`, label: dictionary.nav.home },
    { href: `/${locale}/enroll`, label: dictionary.nav.enroll },
    { href: `/${locale}/password-change`, label: dictionary.nav.passwordChange },
    { href: `/${locale}/login`, label: dictionary.nav.login },
    { href: `/${locale}/profile-summary`, label: dictionary.nav.profile },
    { href: `/${locale}/wallet`, label: dictionary.nav.points },
  ];

  return (
    <nav className="top-nav top-nav--landing" aria-label="Main navigation">
      {links.map((link) => {
        const isActive = pathname === link.href || pathname.startsWith(`${link.href}/`);

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
