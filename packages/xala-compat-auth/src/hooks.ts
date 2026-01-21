/**
 * @xala/auth/hooks - DEPRECATED COMPATIBILITY LAYER
 *
 * This package is deprecated and will be removed in a future version.
 * Please migrate to @xalatechnologies/platform/auth/hooks
 *
 * Migration guide: https://docs.xalatechnologies.com/migration
 *
 * Before:
 *   import { useAuth, useOAuthCallback } from '@xala/auth/hooks';
 *
 * After:
 *   import { useAuth, useOAuthCallback } from '@xalatechnologies/platform/auth/hooks';
 */

// Re-export hooks from the new location
export * from '@xalatechnologies/platform/auth/hooks';
