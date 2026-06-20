import React, { createContext, useContext, useState, useCallback } from 'react';
import type { Locale } from '@shared/types/index';
import { SITE_CONFIG } from '@shared/constants/index';
import { t as translate } from '../i18n';

interface LocaleContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (path: string) => string;
}

const LocaleContext = createContext<LocaleContextType>({
  locale: SITE_CONFIG.defaultLocale,
  setLocale: () => {},
  t: () => '',
});

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocale] = useState<Locale>(SITE_CONFIG.defaultLocale);

  const t = useCallback(
    (path: string): string => {
      return translate(locale, path);
    },
    [locale],
  );

  return (
    <LocaleContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </LocaleContext.Provider>
  );
}

export function useLocale() {
  return useContext(LocaleContext);
}