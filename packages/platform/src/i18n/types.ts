/**
 * Supported locale codes
 */
export type SupportedLocale = 'nb' | 'en';

/**
 * Translation key string (dot-notation)
 */
export type TranslationKey = string;

/**
 * Parameters for interpolated translations
 */
export type TranslationParams = Record<string, string | number>;

/**
 * Registry of all translations by locale
 */
export type TranslationsRegistry = Record<SupportedLocale, Record<string, string>>;

/**
 * Translation function signature
 */
export type TranslationFunction = (key: TranslationKey, params?: TranslationParams) => string;

/**
 * I18n context value
 */
export interface I18nContextValue {
  locale: SupportedLocale;
  setLocale: (locale: SupportedLocale) => void;
  t: TranslationFunction;
}

/**
 * Options for formatRelativeTime function
 */
export interface FormatRelativeTimeOptions {
  style?: 'long' | 'short' | 'narrow';
  locale?: string;
}

/**
 * Options for formatDuration function
 */
export interface FormatDurationOptions {
  style?: 'compact' | 'long';
  unit?: 'milliseconds' | 'seconds';
  locale?: string;
}

/**
 * Format relative time function signature
 */
export type FormatRelativeTimeFunction = (
  date: string | Date,
  locale?: string
) => string;

/**
 * Format duration function signature
 */
export type FormatDurationFunction = (
  value: number,
  options?: FormatDurationOptions
) => string;
