import Cookies from 'js-cookie';

const COOKIE_NAME = 'digilist_locale';
const STORAGE_KEY = 'locale';

/**
 * SSR-safe check for production mode.
 * Works in both Node.js and browser environments without requiring @types/node.
 */
function isProduction(): boolean {
  try {
    // Vite sets import.meta.env.PROD in browser environments
    if (import.meta?.env?.PROD === true) {
      return true;
    }
  } catch {
    // Ignore errors - import.meta might not be available in all environments
  }
  // Default to false to allow dev over HTTP
  return false;
}

/**
 * Cookie options for locale persistence
 * - 365 days expiry for long-term preference storage
 * - SameSite=Lax for security (prevents CSRF)
 * - Secure only in production (allows dev over HTTP)
 */
const COOKIE_OPTIONS: Cookies.CookieAttributes = {
  expires: 365,
  sameSite: 'lax',
  secure: isProduction(),
};

/**
 * Get locale from cookie (SSR-safe)
 * Used as primary storage for SSR consistency
 */
export function getCookieLocale(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    return Cookies.get(COOKIE_NAME) || null;
  } catch {
    return null;
  }
}

/**
 * Set locale in cookie (SSR-safe)
 * Server can read this from request headers for SSR
 */
export function setCookieLocale(locale: string): void {
  if (typeof window === 'undefined') return;
  try {
    Cookies.set(COOKIE_NAME, locale, COOKIE_OPTIONS);
  } catch {
    // Ignore cookie errors (e.g., in incognito mode)
  }
}

/**
 * Remove locale cookie (SSR-safe)
 */
export function removeCookieLocale(): void {
  if (typeof window === 'undefined') return;
  try {
    Cookies.remove(COOKIE_NAME);
  } catch {
    // Ignore removal errors
  }
}

/**
 * Get locale from localStorage (SSR-safe)
 * Used as fallback when cookies are blocked
 */
export function getLocalStorageLocale(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

/**
 * Set locale in localStorage (SSR-safe)
 * Provides fallback persistence when cookies unavailable
 */
export function setLocalStorageLocale(locale: string): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, locale);
  } catch {
    // Ignore storage errors (e.g., quota exceeded)
  }
}

/**
 * Remove locale from localStorage (SSR-safe)
 */
export function removeLocalStorageLocale(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Ignore removal errors
  }
}

/**
 * Get persisted locale using priority: cookie > localStorage
 * Returns null if no stored preference found (SSR-safe)
 */
export function getPersistedLocale(): string | null {
  // Priority: cookie > localStorage
  return getCookieLocale() || getLocalStorageLocale();
}

/**
 * Persist locale using dual-write strategy (cookie + localStorage)
 * This ensures SSR compatibility (cookie) and fallback (localStorage)
 */
export function persistLocale(locale: string): void {
  setCookieLocale(locale);
  setLocalStorageLocale(locale);
}

/**
 * Clear all persisted locale data
 */
export function clearPersistedLocale(): void {
  removeCookieLocale();
  removeLocalStorageLocale();
}
