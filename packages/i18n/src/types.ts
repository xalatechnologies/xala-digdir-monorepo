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
 * All translation domains used in the application.
 * Domains group related translation keys by feature/area.
 */
export type TranslationDomain =
  | 'common'
  | 'nav'
  | 'auth'
  | 'dashboard'
  | 'listings'
  | 'listing'
  | 'booking'
  | 'bookings'
  | 'calendar'
  | 'messages'
  | 'reports'
  | 'organizations'
  | 'users'
  | 'settings'
  | 'seasons'
  | 'requests'
  | 'minside'
  | 'org'
  | 'errors'
  | 'policy'
  | 'actions';

/**
 * Newly added translation domains for error handling, policies, and actions.
 * These domains support RFC7807 error messages and reason key resolution.
 */
export type ExtendedTranslationDomain = 'errors' | 'policy' | 'actions';

/**
 * Helper type to build domain-prefixed translation keys.
 * @example
 * type MyKey = DomainPrefixedKey<'errors'>; // 'errors.${string}'
 */
export type DomainPrefixedKey<D extends TranslationDomain> = `${D}.${string}`;

/**
 * Locale mapping for Intl API (BCP 47 format).
 * Maps our simplified locale codes to full BCP 47 locale strings.
 */
export type IntlLocaleMap = {
  [K in SupportedLocale]: string;
};

/**
 * Formatter function signature for locale-aware formatting.
 * Used by formatCurrency, formatDate, formatNumber.
 */
export type LocaleFormatter<T, R = string> = (value: T) => R;

/**
 * Factory function that creates a locale-aware formatter.
 */
export type FormatterFactory<T, R = string> = (locale: SupportedLocale) => LocaleFormatter<T, R>;

/**
 * Options for the I18nProvider component.
 */
export interface I18nProviderOptions {
  /** Initial locale for SSR (overrides cookie/localStorage) */
  initialLocale?: SupportedLocale;
  /** Default locale when no preference is stored */
  defaultLocale?: SupportedLocale;
  /** Children components */
  children: React.ReactNode;
}

/**
 * Return type for useLocale hook.
 */
export interface UseLocaleResult {
  /** Current active locale */
  locale: SupportedLocale;
  /** Function to change the locale */
  setLocale: (locale: SupportedLocale) => void;
  /** Array of all supported locales */
  supportedLocales: readonly SupportedLocale[];
}
