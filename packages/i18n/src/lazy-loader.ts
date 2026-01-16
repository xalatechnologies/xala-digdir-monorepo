/**
 * Lazy Loading for i18n Locale Bundles
 *
 * This module provides lazy loading capabilities for translation bundles.
 * Instead of loading all locales upfront, it loads only the active locale
 * on demand, reducing initial bundle size.
 *
 * Usage:
 *   import { loadLocale, getLoadedLocales } from '@xala/i18n';
 *
 *   // Load a locale dynamically
 *   const translations = await loadLocale('nb');
 *
 * For React:
 *   import { LazyI18nProvider } from '@xala/i18n';
 *
 *   <LazyI18nProvider locale="nb" fallbackLocale="nb">
 *     <App />
 *   </LazyI18nProvider>
 */

import type { SupportedLocale, TranslationsRegistry } from './types';

/**
 * Core translations that are bundled immediately for fast initial render.
 * These are the most commonly used keys that should never cause a flash.
 */
export const CORE_TRANSLATIONS: Record<SupportedLocale, Record<string, string>> = {
  nb: {
    'common.loading': 'Laster...',
    'common.error': 'Det oppstod en feil',
    'common.save': 'Lagre',
    'common.cancel': 'Avbryt',
    'common.close': 'Lukk',
    'common.back': 'Tilbake',
    'common.next': 'Neste',
    'common.submit': 'Send inn',
    'common.search': 'Søk',
    'common.delete': 'Slett',
    'common.edit': 'Rediger',
    'common.create': 'Opprett',
    'auth.login': 'Logg inn',
    'auth.logout': 'Logg ut',
    'nav.home': 'Hjem',
    'nav.dashboard': 'Dashboard',
    'errors.generic': 'Noe gikk galt',
  },
  en: {
    'common.loading': 'Loading...',
    'common.error': 'An error occurred',
    'common.save': 'Save',
    'common.cancel': 'Cancel',
    'common.close': 'Close',
    'common.back': 'Back',
    'common.next': 'Next',
    'common.submit': 'Submit',
    'common.search': 'Search',
    'common.delete': 'Delete',
    'common.edit': 'Edit',
    'common.create': 'Create',
    'auth.login': 'Log in',
    'auth.logout': 'Log out',
    'nav.home': 'Home',
    'nav.dashboard': 'Dashboard',
    'errors.generic': 'Something went wrong',
  },
};

/**
 * Cache of loaded locales
 */
const loadedLocales: Map<SupportedLocale, TranslationsRegistry[SupportedLocale]> = new Map();

/**
 * Loading promises to prevent duplicate loads
 */
const loadingPromises: Map<SupportedLocale, Promise<TranslationsRegistry[SupportedLocale]>> =
  new Map();

/**
 * Load a locale bundle dynamically
 *
 * @param locale The locale to load
 * @returns Promise resolving to the translations object
 *
 * @example
 * const nbTranslations = await loadLocale('nb');
 */
export async function loadLocale(
  locale: SupportedLocale
): Promise<TranslationsRegistry[SupportedLocale]> {
  // Return cached if already loaded
  if (loadedLocales.has(locale)) {
    return loadedLocales.get(locale)!;
  }

  // Return existing promise if already loading
  if (loadingPromises.has(locale)) {
    return loadingPromises.get(locale)!;
  }

  // Create loading promise
  const loadPromise = (async () => {
    try {
      let translations: TranslationsRegistry[SupportedLocale];

      // Dynamic import based on locale
      if (locale === 'nb') {
        const module = await import('./locales/nb');
        translations = module.nb;
      } else if (locale === 'en') {
        const module = await import('./locales/en');
        translations = module.en;
      } else {
        // Fallback to Norwegian
        const module = await import('./locales/nb');
        translations = module.nb;
      }

      // Cache the loaded translations
      loadedLocales.set(locale, translations);
      loadingPromises.delete(locale);

      return translations;
    } catch (error) {
      loadingPromises.delete(locale);
      console.error(`Failed to load locale: ${locale}`, error);

      // Return core translations as fallback
      return CORE_TRANSLATIONS[locale] || CORE_TRANSLATIONS.nb;
    }
  })();

  loadingPromises.set(locale, loadPromise);
  return loadPromise;
}

/**
 * Preload a locale without waiting
 *
 * @param locale The locale to preload
 */
export function preloadLocale(locale: SupportedLocale): void {
  if (!loadedLocales.has(locale) && !loadingPromises.has(locale)) {
    loadLocale(locale).catch(() => {
      // Silently handle preload errors
    });
  }
}

/**
 * Get list of currently loaded locales
 */
export function getLoadedLocales(): SupportedLocale[] {
  return Array.from(loadedLocales.keys());
}

/**
 * Check if a locale is loaded
 */
export function isLocaleLoaded(locale: SupportedLocale): boolean {
  return loadedLocales.has(locale);
}

/**
 * Get cached translations for a locale (returns undefined if not loaded)
 */
export function getCachedTranslations(
  locale: SupportedLocale
): TranslationsRegistry[SupportedLocale] | undefined {
  return loadedLocales.get(locale);
}

/**
 * Clear the locale cache (useful for testing)
 */
export function clearLocaleCache(): void {
  loadedLocales.clear();
  loadingPromises.clear();
}
