/**
 * @xala/runtime - DEPRECATED COMPATIBILITY LAYER
 *
 * This package is deprecated and will be removed in a future version.
 * Please migrate to @xalatechnologies/platform/runtime
 *
 * Migration guide: https://docs.xalatechnologies.com/migration
 *
 * Before:
 *   import { RuntimeProvider, useSDK } from '@xala/runtime';
 *
 * After:
 *   import { RuntimeProvider, useSDK } from '@xalatechnologies/platform/runtime';
 */

// Emit deprecation warning once per session
const DEPRECATION_KEY = '__xala_runtime_deprecation_warned__';

if (typeof globalThis !== 'undefined' && !(globalThis as Record<string, unknown>)[DEPRECATION_KEY]) {
  console.warn(
    '[@xala/runtime] DEPRECATED: This package is deprecated. ' +
      'Please migrate to @xalatechnologies/platform/runtime. ' +
      'See migration guide: https://docs.xalatechnologies.com/migration'
  );
  (globalThis as Record<string, unknown>)[DEPRECATION_KEY] = true;
}

// Re-export everything from the new location
export * from '@xalatechnologies/platform/runtime';
