// Context and Provider
export { I18nProvider, I18nContext } from './context';
export type { I18nProviderProps } from './context';

// Hooks
export { useI18n, useT, useLocale, useFormatRelativeTime, useFormatDuration } from './hooks';

// Formatters
export { formatRelativeTime, formatDuration } from './formatters';

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

// Translations (for extension/override)
export { translations, nb, en } from './locales';
