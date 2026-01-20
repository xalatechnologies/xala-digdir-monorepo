/**
 * @xala/runtime - useLocalization
 *
 * Re-exports localization from @xala/i18n with consistent API.
 */

import { useI18n, useT } from '@xala/i18n';
import type { LocalizationContext, SupportedLocale } from '../types';

/**
 * Access localization utilities.
 *
 * Usage:
 * ```tsx
 * const { t, locale, setLocale } = useLocalization();
 * <p>{t('greeting.hello')}</p>
 * ```
 */
export function useLocalization(): LocalizationContext {
  const { locale, setLocale } = useI18n();
  const t = useT();

  return {
    t,
    locale: locale as SupportedLocale,
    setLocale: setLocale as (locale: SupportedLocale) => void,
  };
}
