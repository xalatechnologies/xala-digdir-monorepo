/**
 * @xalatechnologies/platform/i18n
 *
 * Internationalization utilities for the Xala/Digilist Platform.
 *
 * Provides:
 * - I18nProvider and LazyI18nProvider for language context
 * - Translation hooks (useT, useI18n, useLocale)
 * - Locale detection and persistence utilities
 * - Intl-based formatters (dates, numbers, currency, duration)
 * - Translation key validation utilities
 * - RFC 7807 reason key resolver
 *
 * Supported languages:
 * - Norwegian Bokmal (nb) - Default/Canonical
 * - English (en)
 *
 * @example
 * ```tsx
 * import { I18nProvider, useT, useLocale } from '@xalatechnologies/platform/i18n';
 *
 * function App() {
 *   return (
 *     <I18nProvider initialLocale="nb">
 *       <MyApp />
 *     </I18nProvider>
 *   );
 * }
 *
 * function MyComponent() {
 *   const t = useT();
 *   const { locale, setLocale } = useLocale();
 *
 *   return (
 *     <div>
 *       <h1>{t('dashboard.title')}</h1>
 *       <button onClick={() => setLocale('en')}>
 *         {t('common.switchLanguage')}
 *       </button>
 *     </div>
 *   );
 * }
 * ```
 */

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

// Reason Keys (RFC 7807 error mapping)
export {
  resolveReasonKey,
  hasReasonKeyTranslation,
  getMissingReasonKeys,
  CANONICAL_REASON_KEYS,
} from './reasonKeys';
export type { ReasonKey, ResolveReasonKeyOptions } from './reasonKeys';

// Storage utilities
export {
  getPersistedLocale,
  persistLocale,
  clearPersistedLocale,
  getCookieLocale,
  setCookieLocale,
  getLocalStorageLocale,
  setLocalStorageLocale,
} from './storage';

// Utils
export { interpolate, getStoredLocale, setStoredLocale } from './utils';

// Translations (for extension/override)
export { translations, nb, en } from './locales';
