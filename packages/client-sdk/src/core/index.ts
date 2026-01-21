/**
 * Core Module Index
 *
 * NOTE: Core functionality is now provided by @xala/sdk-core.
 * Local implementations are kept for backward compatibility but
 * new code should import from @xala/sdk-core directly.
 */

// =============================================================================
// Re-export from @xala/sdk-core (Schema-Agnostic Core)
// =============================================================================

// HTTP client utilities
export {
  type IHttpClient,
  type ApiClientConfig,
  type RequestOptions,
  type RequestBody,
  type HttpMethod,
  type HttpResponse,
  FetchHttpClient,
  initializeClient as initializeClientCore,
  getClient as getClientCore,
  createClient,
  isClientInitialized,
  resetClient,
} from '@xala/sdk-core/http';

// Error handling
export {
  type ProblemDetails,
  type FieldError,
  ApiError,
  isProblemDetails,
  parseProblemDetails,
  ProblemDetailsFactory,
} from '@xala/sdk-core/errors';

// Retry utilities
export {
  type RetryPolicy,
  type RetryContext,
  type DLQEntry,
  type RetryOptions,
  type RetryResult,
  withRetry,
  DEFAULT_RETRY_POLICY,
  CRITICAL_RETRY_POLICY,
  LIGHT_RETRY_POLICY,
  isRetryableError,
  getDLQEntries,
  getDLQEntry,
  removeDLQEntry,
  retryDLQEntry,
  getDLQStats,
} from '@xala/sdk-core/retry';

// Query key utilities
export {
  type QueryKey,
  createQueryKeyFactory,
  mergeQueryKeyFactories,
  matchQueryKey,
} from '@xala/sdk-core/query';

// =============================================================================
// API Router (for Platform vs Domain API routing)
// =============================================================================

export {
  type ApiType,
  getApiTypeForPath,
  getBaseUrlForApiType,
  routeRequest,
  isPlatformPath,
  isDomainPath,
  getPlatformPaths,
  getDomainPaths,
} from './api-router';

// =============================================================================
// Legacy Exports (for backward compatibility)
// =============================================================================

export * from './http-client.interface';
export * from './fetch-client';
export * from './client-factory';
