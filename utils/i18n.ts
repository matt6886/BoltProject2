import { I18n } from 'i18n-js';
import * as enTranslations from '../locales/en.json';
import * as frTranslations from '../locales/fr.json';
import { useLanguageStore } from '../store/language';

const i18n = new I18n({
  en: enTranslations,
  fr: frTranslations
});

// Set default fallback locale to fr
i18n.enableFallback = true;
i18n.defaultLocale = 'fr';

// Get the current locale from the store
export const initI18n = () => {
  const locale = useLanguageStore.getState().locale;
  i18n.locale = locale;
};

// Update the locale when it changes
export const updateLocale = (locale: string) => {
  i18n.locale = locale;
};

// Translation function
export const t = (key: string, options?: Record<string, any>) => {
  return i18n.t(key, options);
};

// Get available locales
export const getAvailableLocales = () => {
  return Object.keys(i18n.translations);
};

// Get current locale
export const getCurrentLocale = () => {
  return i18n.locale;
};

// Get locale name
export const getLocaleName = (locale: string) => {
  switch (locale) {
    case 'en':
      return t('languages.en');
    case 'fr':
      return t('languages.fr');
    default:
      return locale;
  }
};

export default i18n;