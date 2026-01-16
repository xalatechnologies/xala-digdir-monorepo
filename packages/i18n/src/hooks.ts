import { useContext, useCallback } from 'react';
import { I18nContext } from './context';
import type { I18nContextValue, TranslationFunction, SupportedLocale, FormatDurationOptions } from './types';
import { formatRelativeTime, formatDuration } from './formatters';

/**
 * Hook to access the full i18n context
 * Provides access to translation functions, locale state, and formatting utilities
 * @returns The complete i18n context including t function, locale, and setLocale
 * @throws Error if used outside of I18nProvider
 * @example
 * const { t, locale, setLocale } = useI18n();
 * const title = t('dashboard.title');
 * setLocale('en');
 */
export function useI18n(): I18nContextValue {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
}

/**
 * Hook to access the translation function
 * Convenience hook that returns only the translation function from the i18n context
 * @returns Translation function for looking up localized strings
 * @example
 * const t = useT();
 * const greeting = t('common.welcome', { name: 'User' });
 */
export function useT(): TranslationFunction {
  const { t } = useI18n();
  return t;
}

/**
 * Hook to access locale state
 * Provides access to the current locale and function to change it
 * @returns Object containing current locale and setLocale function
 * @example
 * const { locale, setLocale } = useLocale();
 * console.log(locale); // "nb"
 * setLocale('en'); // Switch to English
 */
export function useLocale(): { locale: SupportedLocale; setLocale: (locale: SupportedLocale) => void } {
  const { locale, setLocale } = useI18n();
  return { locale, setLocale };
}

/**
 * Hook to access the formatRelativeTime function with current locale
 * Returns a memoized formatter that automatically uses the current locale setting
 * @returns Function that formats dates as relative time strings (e.g., "2 timer siden", "om 3 dager")
 * @example
 * const formatRelative = useFormatRelativeTime();
 * const timeAgo = formatRelative(new Date('2024-01-15T10:00:00')); // "2 timer siden"
 * const upcoming = formatRelative(new Date(Date.now() + 3600000)); // "om 1 time"
 */
export function useFormatRelativeTime(): (date: string | Date) => string {
  const { locale } = useI18n();

  return useCallback(
    (date: string | Date) => {
      // Convert 'nb' to 'nb-NO' and 'en' to 'en-US' for Intl.RelativeTimeFormat
      const localeCode = locale === 'nb' ? 'nb-NO' : 'en-US';
      return formatRelativeTime(date, localeCode);
    },
    [locale]
  );
}

/**
 * Hook to access the formatDuration function with current locale
 * Returns a memoized formatter that automatically uses the current locale setting
 * @returns Function that formats durations as human-readable strings (e.g., "1t 30m", "1 time 30 minutter")
 * @example
 * const formatDur = useFormatDuration();
 * const compact = formatDur(5400000); // "1t 30m" (Norwegian)
 * const long = formatDur(5400000, { style: 'long' }); // "1 time 30 minutter"
 * const seconds = formatDur(90, { unit: 'seconds' }); // "1m 30s"
 */
export function useFormatDuration(): (value: number, options?: FormatDurationOptions) => string {
  const { locale } = useI18n();

  return useCallback(
    (value: number, options?: FormatDurationOptions) => {
      // Convert 'nb' to 'nb-NO' and 'en' to 'en-US'
      const localeCode = locale === 'nb' ? 'nb-NO' : 'en-US';
      return formatDuration(value, { ...options, locale: localeCode });
    },
    [locale]
  );
}
