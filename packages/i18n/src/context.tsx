import { createContext, useState, useCallback, useEffect, type ReactNode } from 'react';
import type { SupportedLocale, TranslationParams, I18nContextValue, TranslationsRegistry } from './types';
import { translations as defaultTranslations } from './locales';
import { interpolate } from './utils';
import { getPersistedLocale, persistLocale } from './storage';

const DEFAULT_LOCALE: SupportedLocale = 'nb';

export const I18nContext = createContext<I18nContextValue | null>(null);

export interface I18nProviderProps {
  children: ReactNode;
  /**
   * Override or extend default translations
   */
  translations?: TranslationsRegistry;
  /**
   * Initial locale (overrides cookie/localStorage for SSR)
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
  // Initialize locale from: prop > cookie > localStorage > default
  const [locale, setLocaleState] = useState<SupportedLocale>(() => {
    if (initialLocale) return initialLocale;
    const stored = getPersistedLocale();
    if (stored === 'en' || stored === 'nb') return stored;
    return DEFAULT_LOCALE;
  });

  // Persist locale changes to cookie + localStorage (dual-write)
  const setLocale = useCallback((newLocale: SupportedLocale) => {
    setLocaleState(newLocale);
    persistLocale(newLocale);
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

      // Fallback to Norwegian (primary language)
      if (!value && locale !== 'nb') {
        value = translations.nb?.[key];
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
