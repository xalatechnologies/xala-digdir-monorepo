/**
 * Lazy Loading i18n Provider
 *
 * A React provider that loads translation bundles on demand.
 * Only loads the active locale, reducing initial bundle size.
 *
 * @example
 * import { LazyI18nProvider } from '@xala/i18n';
 *
 * function App() {
 *   return (
 *     <LazyI18nProvider
 *       locale="nb"
 *       fallbackLocale="nb"
 *       loadingFallback={<Spinner />}
 *     >
 *       <YourApp />
 *     </LazyI18nProvider>
 *   );
 * }
 */

import React, { useState, useEffect, useCallback, useMemo, createContext, useContext } from 'react';
import type { ReactNode } from 'react';
import type { SupportedLocale, TranslationFunction, TranslationParams } from './types';
import {
  loadLocale,
  preloadLocale,
  isLocaleLoaded,
  getCachedTranslations,
  CORE_TRANSLATIONS,
} from './lazy-loader';
import { interpolate } from './utils';
import { persistLocale, getPersistedLocale } from './storage';
import { I18nContext } from './context';

/**
 * Lazy i18n context value
 */
interface LazyI18nContextValue {
  /** Current locale */
  locale: SupportedLocale;
  /** Set the active locale */
  setLocale: (locale: SupportedLocale) => void;
  /** Translation function */
  t: TranslationFunction;
  /** Whether translations are loading */
  isLoading: boolean;
  /** Whether translations are ready */
  isReady: boolean;
}

/**
 * Lazy i18n context
 */
const LazyI18nContext = createContext<LazyI18nContextValue | null>(null);

/**
 * Props for LazyI18nProvider
 */
interface LazyI18nProviderProps {
  /** Initial locale */
  locale?: SupportedLocale;
  /** Fallback locale when translations are missing */
  fallbackLocale?: SupportedLocale;
  /** Component to render while loading */
  loadingFallback?: ReactNode;
  /** Whether to persist locale to storage */
  persistLocale?: boolean;
  /** Children to render */
  children: ReactNode;
}

/**
 * Lazy Loading i18n Provider
 *
 * Loads translation bundles on demand instead of bundling all locales.
 * Shows core translations immediately, then full translations when loaded.
 */
export function LazyI18nProvider({
  locale: initialLocale,
  fallbackLocale = 'nb',
  loadingFallback,
  persistLocale: shouldPersistLocale = true,
  children,
}: LazyI18nProviderProps) {
  // Determine initial locale from storage or prop
  const [locale, setLocaleState] = useState<SupportedLocale>(() => {
    if (initialLocale) return initialLocale;
    const stored = getPersistedLocale();
    return (stored as SupportedLocale) || fallbackLocale;
  });

  // Track loading state
  const [isLoading, setIsLoading] = useState(!isLocaleLoaded(locale));
  const [translations, setTranslations] = useState<Record<string, string>>(() => {
    // Start with cached or core translations
    return getCachedTranslations(locale) || CORE_TRANSLATIONS[locale] || CORE_TRANSLATIONS.nb;
  });

  // Load translations when locale changes
  useEffect(() => {
    let isMounted = true;

    async function load() {
      if (isLocaleLoaded(locale)) {
        // Already loaded, use cached
        const cached = getCachedTranslations(locale);
        if (cached && isMounted) {
          setTranslations(cached);
          setIsLoading(false);
        }
        return;
      }

      setIsLoading(true);

      try {
        const loaded = await loadLocale(locale);
        if (isMounted) {
          setTranslations(loaded);
          setIsLoading(false);
        }
      } catch {
        // Fallback to core translations
        if (isMounted) {
          setTranslations(CORE_TRANSLATIONS[locale] || CORE_TRANSLATIONS.nb);
          setIsLoading(false);
        }
      }
    }

    load();

    // Preload fallback locale in background
    if (fallbackLocale !== locale) {
      preloadLocale(fallbackLocale);
    }

    return () => {
      isMounted = false;
    };
  }, [locale, fallbackLocale]);

  // Set locale and persist
  const setLocale = useCallback(
    (newLocale: SupportedLocale) => {
      setLocaleState(newLocale);
      if (shouldPersistLocale) {
        persistLocale(newLocale);
      }
    },
    [shouldPersistLocale]
  );

  // Translation function
  const t: TranslationFunction = useCallback(
    (key: string, params?: TranslationParams) => {
      // Try current locale
      let value = translations[key];

      // Fallback to core translations
      if (!value) {
        const core = CORE_TRANSLATIONS[locale] || CORE_TRANSLATIONS.nb;
        value = core[key];
      }

      // Return key if not found
      if (!value) {
        // Only warn in development mode (Vite uses import.meta.env)
        try {
          if (import.meta?.env?.DEV) {
            console.warn(`Missing translation key: ${key}`);
          }
        } catch {
          // Ignore - may not be in Vite environment
        }
        return key;
      }

      // Interpolate parameters
      if (params) {
        return interpolate(value, params);
      }

      return value;
    },
    [translations, locale]
  );

  // Context value
  const contextValue = useMemo<LazyI18nContextValue>(
    () => ({
      locale,
      setLocale,
      t,
      isLoading,
      isReady: !isLoading,
    }),
    [locale, setLocale, t, isLoading]
  );

  // I18nContext value for backward compatibility with useT(), useI18n(), useLocale()
  const i18nContextValue = useMemo(
    () => ({
      locale,
      setLocale,
      t,
    }),
    [locale, setLocale, t]
  );

  // Show loading fallback if provided and still loading
  if (isLoading && loadingFallback) {
    return (
      <I18nContext.Provider value={i18nContextValue}>
        <LazyI18nContext.Provider value={contextValue}>
          {loadingFallback}
        </LazyI18nContext.Provider>
      </I18nContext.Provider>
    );
  }

  return (
    <I18nContext.Provider value={i18nContextValue}>
      <LazyI18nContext.Provider value={contextValue}>{children}</LazyI18nContext.Provider>
    </I18nContext.Provider>
  );
}

/**
 * Hook to access lazy i18n context
 *
 * @example
 * const { t, locale, setLocale, isLoading } = useLazyI18n();
 */
export function useLazyI18n(): LazyI18nContextValue {
  const context = useContext(LazyI18nContext);
  if (!context) {
    throw new Error('useLazyI18n must be used within a LazyI18nProvider');
  }
  return context;
}

/**
 * Hook to get translation function from lazy provider
 *
 * @example
 * const t = useLazyT();
 * return <h1>{t('dashboard.title')}</h1>;
 */
export function useLazyT(): TranslationFunction {
  const { t } = useLazyI18n();
  return t;
}

/**
 * Hook to get current locale from lazy provider
 *
 * @example
 * const locale = useLazyLocale();
 */
export function useLazyLocale(): SupportedLocale {
  const { locale } = useLazyI18n();
  return locale;
}
