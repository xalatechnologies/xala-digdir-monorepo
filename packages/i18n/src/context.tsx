import { createContext, useState, useCallback, useEffect, type ReactNode } from 'react';
import type { SupportedLocale, TranslationParams, I18nContextValue, TranslationsRegistry } from './types';
import { translations as defaultTranslations } from './locales';
import { interpolate, getStoredLocale, setStoredLocale } from './utils';

const DEFAULT_LOCALE: SupportedLocale = 'nb';

export const I18nContext = createContext<I18nContextValue | null>(null);

export interface I18nProviderProps {
  children: ReactNode;
  /**
   * Override or extend default translations
   */
  translations?: TranslationsRegistry;
  /**
   * Initial locale (overrides localStorage)
   */
  initialLocale?: SupportedLocale;
}

/**
 * I18nProvider - manages locale state and provides translation function
 */
export function I18nProvider({
  children,
  translations = defaultTranslations,
  initialLocale,
}: I18nProviderProps) {
  // Initialize locale from: prop > localStorage > default
  const [locale, setLocaleState] = useState<SupportedLocale>(() => {
    if (initialLocale) return initialLocale;
    const stored = getStoredLocale();
    if (stored === 'en' || stored === 'nb') return stored;
    return DEFAULT_LOCALE;
  });

  // Persist locale changes to localStorage
  const setLocale = useCallback((newLocale: SupportedLocale) => {
    setLocaleState(newLocale);
    setStoredLocale(newLocale);
  }, []);

  // Sync initialLocale prop changes
  useEffect(() => {
    if (initialLocale) {
      setLocaleState(initialLocale);
    }
  }, [initialLocale]);

  // Translation function with interpolation and fallback
  const t = useCallback(
    (key: string, params?: TranslationParams): string => {
      // Try current locale
      let value = translations[locale]?.[key];

      // Fallback to English
      if (!value && locale !== 'en') {
        value = translations.en?.[key];
      }

      // Return short key if missing
      if (!value) {
        console.warn(`[i18n] Missing translation: ${key}`);
        return key.split('.').pop() || key;
      }

      // Interpolate parameters
      return interpolate(value, params);
    },
    [locale, translations]
  );

  const contextValue: I18nContextValue = {
    locale,
    setLocale,
    t,
  };

  return (
    <I18nContext.Provider value={contextValue}>
      {children}
    </I18nContext.Provider>
  );
}
