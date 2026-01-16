// Context and Provider
export { I18nProvider, I18nContext } from './context';
export type { I18nProviderProps } from './context';

// Lazy Loading Provider (for reduced bundle size)
export { LazyI18nProvider, useLazyI18n, useLazyT, useLazyLocale } from './LazyI18nProvider';

// Lazy Loading Utilities
export {
  loadLocale,
  preloadLocale,
  isLocaleLoaded,
  getLoadedLocales,
  getCachedTranslations,
  clearLocaleCache,
  CORE_TRANSLATIONS,
} from './lazy-loader';

// Hooks
export { useI18n, useT, useLocale, useFormatRelativeTime, useFormatDuration } from './hooks';

// Formatters (Intl-based, locale-aware)
export {
  formatDate,
  formatTime,
  formatDateTime,
  formatNumber,
  formatCurrency,
  formatPercent,
  formatRelativeTime,
  formatDuration,
} from './formatters';

// Types
export type {
  SupportedLocale,
  TranslationKey,
  TranslationParams,
  TranslationFunction,
  TranslationsRegistry,
  I18nContextValue,
  FormatRelativeTimeOptions,
  FormatDurationOptions,
  FormatRelativeTimeFunction,
  FormatDurationFunction,
} from './types';

// Key Registry (for type-safe access and validation)
export {
  isValidKey,
  getKeysForNamespace,
  getAllNamespaces,
  getTranslationStats,
  ALL_TRANSLATION_KEYS,
  TRANSLATION_KEY_SET,
} from './keys';
export type { TranslationKeyPath, TranslationStats } from './keys';

// Translations (for extension/override)
export { translations, nb, en } from './locales';
