/**
 * Lazy Loading for i18n Locale Bundles
 *
 * ARCHITECTURE: Static JSON files are the ONLY source of truth for translations.
 *
 * Flow:
 * 1. App requests translations via loadLocale(lang)
 * 2. Loader imports static JSON files bundled with the app
 * 3. Translations are cached locally for performance
 *
 * Note: NO API or database fetching. All translations bundled with the app.
 */

import type { SupportedLocale, TranslationsRegistry } from './types';
import { nb } from './locales/nb';
import { en } from './locales/en';

/**
 * Core translations that are bundled immediately for fast initial render.
 * These provide immediate feedback while loading from API.
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
    'common.search': 'Sok',
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
 * Static translations registry - bundled with the app
 */
const STATIC_TRANSLATIONS: TranslationsRegistry = {
  nb,
  en,
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
 * Load a locale bundle from static JSON files (bundled with app)
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
      // Load from static bundled translations
      const translations = STATIC_TRANSLATIONS[locale];

      if (translations) {
        // Cache and return static translations
        loadedLocales.set(locale, translations);
        loadingPromises.delete(locale);
        return translations;
      }

      // Fallback to Norwegian if locale not found
      console.warn(`Locale ${locale} not found, using Norwegian fallback`);
      const fallback = STATIC_TRANSLATIONS.nb;
      loadedLocales.set(locale, fallback);
      loadingPromises.delete(locale);
      return fallback;
    } catch (error) {
      loadingPromises.delete(locale);
      console.error(`Failed to load locale: ${locale}`, error);

      // Return Norwegian as fallback
      return STATIC_TRANSLATIONS.nb;
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
 * Clear the locale cache (useful for testing or after DB updates)
 */
export function clearLocaleCache(): void {
  loadedLocales.clear();
  loadingPromises.clear();
}

/**
 * Force refresh translations from static files
 */
export async function refreshLocale(
  locale: SupportedLocale
): Promise<TranslationsRegistry[SupportedLocale]> {
  loadedLocales.delete(locale);
  loadingPromises.delete(locale);
  return loadLocale(locale);
}
