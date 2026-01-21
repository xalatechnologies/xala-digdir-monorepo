/**
 * @xala/ds - DEPRECATED COMPATIBILITY LAYER
 *
 * This package is deprecated and will be removed in a future version.
 * Please migrate to @xalatechnologies/platform/ui
 *
 * Migration guide: https://docs.xalatechnologies.com/migration
 *
 * Before:
 *   import { Button, Card } from '@xala/ds';
 *
 * After:
 *   import { Button, Card } from '@xalatechnologies/platform/ui';
 */

// Emit deprecation warning once per session
const DEPRECATION_KEY = '__xala_ds_deprecation_warned__';

if (typeof globalThis !== 'undefined' && !(globalThis as Record<string, unknown>)[DEPRECATION_KEY]) {
  console.warn(
    '[@xala/ds] DEPRECATED: This package is deprecated. ' +
      'Please migrate to @xalatechnologies/platform/ui. ' +
      'See migration guide: https://docs.xalatechnologies.com/migration'
  );
  (globalThis as Record<string, unknown>)[DEPRECATION_KEY] = true;
}

// Re-export everything from the new location
export * from '@xalatechnologies/platform/ui';
