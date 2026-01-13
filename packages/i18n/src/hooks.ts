import { useContext } from 'react';
import { I18nContext } from './context';
import type { I18nContextValue, TranslationFunction, SupportedLocale } from './types';

/**
 * Hook to access the full i18n context
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
 */
export function useT(): TranslationFunction {
  const { t } = useI18n();
  return t;
}

/**
 * Hook to access locale state
 */
export function useLocale(): { locale: SupportedLocale; setLocale: (locale: SupportedLocale) => void } {
  const { locale, setLocale } = useI18n();
  return { locale, setLocale };
}
