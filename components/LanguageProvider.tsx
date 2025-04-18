import React, { createContext, useEffect } from 'react';
import { useLanguageStore } from '../store/language';
import { initI18n, updateLocale } from '../utils/i18n';

// Create a context to provide language information
export const LanguageContext = React.createContext({
  locale: 'fr',
  setLocale: (_locale: string) => {}
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const { locale, setLocale } = useLanguageStore();

  useEffect(() => {
    // Initialize i18n with the stored locale
    initI18n();
  }, []);

  useEffect(() => {
    // Update i18n locale when store changes
    updateLocale(locale);
  }, [locale]);

  return (
    <LanguageContext.Provider value={{ locale, setLocale }}>
      {children}
    </LanguageContext.Provider>
  );
}