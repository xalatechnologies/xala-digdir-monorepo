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
 * RECOMMENDED: Import from specific sub-paths for better tree-shaking:
 *
 * @example
 * ```tsx
 * // Import UI components
 * import { Button, Card } from '@xalatechnologies/platform/ui';
 *
 * // Import runtime utilities
 * import { RuntimeProvider } from '@xalatechnologies/platform/runtime';
 *
 * // Import auth utilities
 * import { useAuth, AuthProvider } from '@xalatechnologies/platform/auth';
 *
 * // Import SDK utilities
 * import { initializeClient, ApiError } from '@xalatechnologies/platform/sdk';
 *
 * // Import contracts
 * import { ProblemDetailsSchema, PaginationSchema } from '@xalatechnologies/platform/contracts';
 *
 * // Import i18n
 * import { I18nProvider, useT } from '@xalatechnologies/platform/i18n';
 *
 * // Import config
 * import { validateEnv, getAppProfile } from '@xalatechnologies/platform/config';
 *
 * // Import observability
 * import { createLogger } from '@xalatechnologies/platform/observability';
 * ```
 */

// =============================================================================
// Re-export modules with explicit exports to avoid conflicts
// Note: For production use, import from specific sub-paths for tree-shaking
// =============================================================================

// UI exports
export * from './ui';

// Runtime exports
export * from './runtime';

// Auth exports
export * from './auth';

// Config exports
export * from './config';

// Contracts exports (schemas and types)
export {
  // Common schemas
  UUIDSchema,
  SlugSchema,
  EmailSchema,
  DateSchema,
  PaginationSchema,
  SortOrderSchema,
  ProblemDetailsSchema,
  createPaginatedResponseSchema,
  // Types
  type Pagination,
  type SortOrder,
  type ProblemDetails,
} from './contracts';

// SDK exports (exclude ProblemDetails to avoid conflict with contracts)
export {
  // HTTP Client
  type HttpMethod,
  type RequestBody,
  type RequestOptions,
  type HttpResponse,
  type IHttpClient,
  type ApiClientConfig,
  FetchHttpClient,
  initializeClient,
  getClient,
  getClientConfig,
  isClientInitialized,
  updateClientConfig,
  setAuthToken,
  clearAuthToken,
  setTenantId,
  clearTenantId,
  resetClient,
  createClient,
  // Errors (ProblemDetails type comes from contracts)
  type FieldError,
  isProblemDetails,
  parseProblemDetails,
  ProblemDetailsFactory,
  ApiError,
  // Query Keys
  type QueryKey,
  type QueryKeyOptions,
  createQueryKeyFactory,
  mergeQueryKeyFactories,
  createScopedQueryKey,
  matchQueryKey,
  serializeQueryParams,
  hashQueryKey,
  // Retry
  type RetryPolicy,
  type RetryContext,
  type DLQEntry,
  type RetryOptions,
  type RetryResult,
  DEFAULT_RETRY_POLICY,
  CRITICAL_RETRY_POLICY,
  LIGHT_RETRY_POLICY,
  isRetryableError,
  withRetry,
  getDLQEntries,
  getDLQEntry,
  removeDLQEntry,
  retryDLQEntry,
  getDLQStats,
  clearDLQ,
} from './sdk';

// i18n exports
export * from './i18n';

// Observability exports
export * from './observability';

// =============================================================================
// Package metadata
// =============================================================================

/** Package version */
export const VERSION = '1.0.0';

/** Package name */
export const PACKAGE_NAME = '@xalatechnologies/platform';
