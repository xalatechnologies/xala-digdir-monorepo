/**
 * Lazy Loading for i18n Locale Bundles
 *
 * ARCHITECTURE: Database is the ONLY source of truth for translations.
 * 
 * Flow:
 * 1. App requests translations via loadLocale(lang)
 * 2. Loader fetches from API: GET /api/i18n/{lang}
 * 3. API queries platform.translations table
 * 4. Translations are cached locally for performance
 * 
 * Note: Static JSON files in locales/ are used ONLY for initial DB seeding.
 *       They are NOT used at runtime.
 */

import type { SupportedLocale, TranslationsRegistry } from './types';

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
 * API base URL for fetching translations
 */
const getApiBaseUrl = (): string => {
  // Check for environment variable or use default
  if (typeof window !== 'undefined' && (window as any).__VITE_API_URL__) {
    return (window as any).__VITE_API_URL__;
  }
  return import.meta.env?.VITE_API_URL || '/api';
};

/**
 * Fetch translations from API (database source of truth)
 */
async function fetchTranslationsFromApi(
  locale: SupportedLocale
): Promise<Record<string, string> | null> {
  try {
    const baseUrl = getApiBaseUrl();
    const response = await fetch(`${baseUrl}/i18n/${locale}`, {
      headers: {
        Accept: 'application/json',
      },
    });

    if (!response.ok) {
      console.warn(`Failed to fetch translations for ${locale}: ${response.status}`);
      return null;
    }

    return response.json();
  } catch (error) {
    console.warn(`Failed to fetch translations for ${locale}:`, error);
    return null;
  }
}

/**
 * Load a locale bundle from the database via API
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
      // Fetch from API (database is source of truth)
      const apiTranslations = await fetchTranslationsFromApi(locale);

      if (apiTranslations) {
        // Cache and return API translations
        loadedLocales.set(locale, apiTranslations);
        loadingPromises.delete(locale);
        return apiTranslations;
      }

      // If API fails, use core translations as emergency fallback
      console.warn(`Using core translations fallback for ${locale}`);
      const fallback = CORE_TRANSLATIONS[locale] || CORE_TRANSLATIONS.nb;
      loadedLocales.set(locale, fallback);
      loadingPromises.delete(locale);
      return fallback;
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
 * Clear the locale cache (useful for testing or after DB updates)
 */
export function clearLocaleCache(): void {
  loadedLocales.clear();
  loadingPromises.clear();
}

/**
 * Force refresh translations from API
 */
export async function refreshLocale(
  locale: SupportedLocale
): Promise<TranslationsRegistry[SupportedLocale]> {
  loadedLocales.delete(locale);
  loadingPromises.delete(locale);
  return loadLocale(locale);
}
