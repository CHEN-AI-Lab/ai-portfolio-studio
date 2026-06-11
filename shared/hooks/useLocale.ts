'use client';

import { useLocale as useNextIntlLocale } from 'next-intl';
import type { Locale } from '../types';

// ─── useLocale ───────────────────────────────────────────────────
// Thin wrapper around next-intl's useLocale() that returns our
// Locale union type. Ensures type safety throughout the app when
// branching on the active locale.
//
// Usage:
//   const locale = useLocale();
//   const greeting = locale === 'zh-CN' ? '你好' : 'Hello';

export function useLocale(): Locale {
  const rawLocale = useNextIntlLocale();

  // Validate that the locale is one we support; fall back to 'zh-CN'
  if (rawLocale === 'en' || rawLocale === 'en-US' || rawLocale === 'en-GB') {
    return 'en';
  }

  // All other values (zh-CN, zh, zh-Hans, etc.) map to 'zh-CN'
  return 'zh-CN';
}