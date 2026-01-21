/**
 * @xalatechnologies/platform
 *
 * Unified platform package providing:
 * - UI components (primitives, composed, shells, blocks, themes)
 * - Runtime utilities and providers
 * - Authentication layer
 * - Configuration management
 * - API contracts and schemas
 * - SDK services and hooks
 * - Internationalization
 * - Observability and monitoring
 *
 * @example
 * ```tsx
 * // Import UI components
 * import { Button, Card } from '@xalatechnologies/platform/ui';
 *
 * // Import runtime utilities
 * import { AppProvider } from '@xalatechnologies/platform/runtime';
 *
 * // Import auth utilities
 * import { useAuth } from '@xalatechnologies/platform/auth';
 *
 * // Import SDK hooks
 * import { useListings } from '@xalatechnologies/platform/sdk';
 * ```
 */

// Re-export all modules for convenience
export * from './ui';
export * from './runtime';
export * from './auth';
export * from './config';
export * from './contracts';
export * from './sdk';
export * from './i18n';
export * from './observability';

// Package version
export const VERSION = '1.0.0';
