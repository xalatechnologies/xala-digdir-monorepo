/**
 * @xala/auth - DEPRECATED COMPATIBILITY LAYER
 *
 * This package is deprecated and will be removed in a future version.
 * Please migrate to @xalatechnologies/platform/auth
 *
 * Migration guide: https://docs.xalatechnologies.com/migration
 *
 * Before:
 *   import { AuthProvider, useAuth } from '@xala/auth';
 *
 * After:
 *   import { AuthProvider, useAuth } from '@xalatechnologies/platform/auth';
 */

// Emit deprecation warning once per session
const DEPRECATION_KEY = '__xala_auth_deprecation_warned__';

if (typeof globalThis !== 'undefined' && !(globalThis as Record<string, unknown>)[DEPRECATION_KEY]) {
  console.warn(
    '[@xala/auth] DEPRECATED: This package is deprecated. ' +
      'Please migrate to @xalatechnologies/platform/auth. ' +
      'See migration guide: https://docs.xalatechnologies.com/migration'
  );
  (globalThis as Record<string, unknown>)[DEPRECATION_KEY] = true;
}

// Re-export everything from the new location
export * from '@xalatechnologies/platform/auth';
