import type { ReactNode } from 'react';
import Link from 'next/link';
import { CustomerNav } from '@/shared/ui/CustomerNav';
import { LocaleSwitcher } from '@/shared/ui/LocaleSwitcher';
import type { Dictionary } from '@/shared/i18n/dictionaries';
import type { Locale } from '@/shared/i18n/config';

interface CustomerShellProps {
  children: ReactNode;
  locale: Locale;
  dictionary: Dictionary;
  authenticatedSession?: {
    fullName: string;
    tier: string;
    loginId: string;
  } | null;
}

export function CustomerShell({ children, locale, dictionary, authenticatedSession = null }: CustomerShellProps) {
  return (
    <div className="app-shell">
      <div className="app-shell__glow app-shell__glow--green" />
      <div className="app-shell__glow app-shell__glow--mint" />

      <header className="app-header app-header--landing">
        <div className="container app-header__inner app-header__inner--landing">
          <div className="brand-mark">
            <div className="brand-mark__icon" aria-hidden="true">
              <span className="brand-mark__dot brand-mark__dot--green" />
              <span className="brand-mark__dot brand-mark__dot--mint" />
              <span className="brand-mark__dot brand-mark__dot--soft" />
            </div>
            <div className="brand-mark__copy">
              <span className="brand-mark__text">{dictionary.common.brand}</span>
              <span className="brand-mark__signature">By Pablov</span>
            </div>
          </div>

          <CustomerNav locale={locale} dictionary={dictionary} />

          <div className="header-actions">
            <LocaleSwitcher
              locale={locale}
              label={dictionary.localeSwitcher.label}
              labels={{ es: dictionary.localeSwitcher.es, en: dictionary.localeSwitcher.en }}
            />
            {authenticatedSession ? (
              <>
                <Link href={`/${locale}/login/success`} className="session-pill">
                  <span className="session-pill__label">{dictionary.login.sessionActive}</span>
                  <strong>{authenticatedSession.fullName}</strong>
                  <small>{authenticatedSession.tier}</small>
                </Link>
                <form action="/api/logout-demo" method="post" className="logout-form">
                  <input type="hidden" name="locale" value={locale} />
                  <button type="submit" className="header-cta header-cta--ghost">
                    {dictionary.login.logoutCta}
                  </button>
                </form>
              </>
            ) : null}
            <Link href={`/es`} className="header-cta">
              {dictionary.common.walletCta}
            </Link>
          </div>
        </div>
      </header>

      <main className="app-main app-main--landing">
        <div className="container app-content">{children}</div>
      </main>
    </div>
  );
}
