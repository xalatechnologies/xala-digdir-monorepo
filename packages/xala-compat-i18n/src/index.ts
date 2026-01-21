/**
 * @xala/i18n - DEPRECATED COMPATIBILITY LAYER
 *
 * This package is deprecated and will be removed in a future version.
 * Please migrate to @xalatechnologies/platform/i18n
 *
 * Migration guide: https://docs.xalatechnologies.com/migration
 *
 * Before:
 *   import { I18nProvider, useT, useLocale } from '@xala/i18n';
 *
 * After:
 *   import { I18nProvider, useT, useLocale } from '@xalatechnologies/platform/i18n';
 */

// Emit deprecation warning once per session
const DEPRECATION_KEY = '__xala_i18n_deprecation_warned__';

if (typeof globalThis !== 'undefined' && !(globalThis as Record<string, unknown>)[DEPRECATION_KEY]) {
  console.warn(
    '[@xala/i18n] DEPRECATED: This package is deprecated. ' +
      'Please migrate to @xalatechnologies/platform/i18n. ' +
      'See migration guide: https://docs.xalatechnologies.com/migration'
  );
  (globalThis as Record<string, unknown>)[DEPRECATION_KEY] = true;
}

// Re-export everything from the new location
export * from '@xalatechnologies/platform/i18n';
