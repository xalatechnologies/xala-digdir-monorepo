import type { TranslationParams } from './types';

const STORAGE_KEY = 'locale';

/**
 * Interpolates {{param}} placeholders in a translation string
 */
export function interpolate(
  value: string,
  params?: TranslationParams
): string {
  if (!params) return value;

  let result = value;
  for (const [key, val] of Object.entries(params)) {
    result = result.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), String(val));
  }
  return result;
}

/**
 * Get stored locale from localStorage (SSR-safe)
 */
export function getStoredLocale(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

/**
 * Store locale in localStorage (SSR-safe)
 */
export function setStoredLocale(locale: string): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, locale);
  } catch {
    // Ignore storage errors
  }
}
