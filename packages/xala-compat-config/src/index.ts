/**
 * @xala/config - DEPRECATED COMPATIBILITY LAYER
 *
 * This package is deprecated and will be removed in a future version.
 * Please migrate to @xalatechnologies/platform/config
 *
 * Migration guide: https://docs.xalatechnologies.com/migration
 *
 * Before:
 *   import { validateEnv, createAppConfig } from '@xala/config';
 *
 * After:
 *   import { validateEnv, createAppConfig } from '@xalatechnologies/platform/config';
 */

// Emit deprecation warning once per session
const DEPRECATION_KEY = '__xala_config_deprecation_warned__';

if (typeof globalThis !== 'undefined' && !(globalThis as Record<string, unknown>)[DEPRECATION_KEY]) {
  console.warn(
    '[@xala/config] DEPRECATED: This package is deprecated. ' +
      'Please migrate to @xalatechnologies/platform/config. ' +
      'See migration guide: https://docs.xalatechnologies.com/migration'
  );
  (globalThis as Record<string, unknown>)[DEPRECATION_KEY] = true;
}

// Re-export everything from the new location
export * from '@xalatechnologies/platform/config';
