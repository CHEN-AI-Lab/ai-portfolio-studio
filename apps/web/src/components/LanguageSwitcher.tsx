'use client';

import React, { useCallback, useTransition } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { usePathname, useRouter } from '@/navigation';

// ─── LanguageSwitcher ─────────────────────────────────────────────
// Toggle button between zh-CN and en using next-intl navigation
// which properly handles locale prefix in the URL.

export function LanguageSwitcher() {
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const t = useTranslations('common');
  const [isPending, startTransition] = useTransition();

  const toggleLanguage = useCallback(() => {
    const nextLocale = locale === 'zh-CN' ? 'en' as const : 'zh-CN' as const;

    startTransition(() => {
      // Set the NEXT_LOCALE cookie for server-side detection
      document.cookie = `NEXT_LOCALE=${nextLocale};path=/;max-age=31536000;samesite=lax`;
      // Navigate to the same page in the new locale
      router.replace(pathname, { locale: nextLocale });
    });
  }, [locale, pathname, router]);

  return (
    <button
      type="button"
      className="language-switcher"
      onClick={toggleLanguage}
      disabled={isPending}
      aria-label={t('languageSwitch')}
      title={t('languageSwitch')}
    >
      <span className="language-switcher__icon" aria-hidden="true">
        🌐
      </span>
      <span>{locale === 'zh-CN' ? 'EN' : '中'}</span>

      <style jsx>{`
        .language-switcher {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          padding: 4px 12px;
          font-size: 11px;
          font-weight: 600;
          color: #A0A0B0;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 9999px;
          cursor: pointer;
          transition: all 150ms ease;
          line-height: 1;
          letter-spacing: 0.03em;
          text-transform: uppercase;
          min-width: 48px;
          font-family: inherit;
        }

        .language-switcher:hover {
          color: #FFFFFF;
          background: rgba(255, 255, 255, 0.1);
          border-color: rgba(255, 255, 255, 0.15);
        }

        .language-switcher:active {
          transform: scale(0.95);
        }

        .language-switcher:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .language-switcher__icon {
          font-size: 0.875rem;
          line-height: 1;
        }
      `}</style>
    </button>
  );
}
