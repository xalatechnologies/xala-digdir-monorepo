/**
 * @xalatechnologies/platform/sdk
 *
 * Schema-agnostic SDK core library providing:
 * - HTTP client with RFC 7807 error handling
 * - Query key factory for React Query
 * - Retry mechanism with DLQ support
 *
 * This package contains no domain-specific code and can be reused
 * across different projects.
 *
 * @example
 * import { initializeClient, getClient, ApiError, withRetry } from '@xalatechnologies/platform/sdk';
 *
 * // Initialize
 * initializeClient({
 *   baseUrl: 'https://api.example.com',
 *   tenantId: 'tenant-123',
 * });
 *
 * // Make requests
 * const data = await getClient().get('/users');
 *
 * // With retry
 * const result = await withRetry(
 *   () => getClient().post('/orders', { items: [...] }),
 *   { operationType: 'create_order', operationId: 'order-123' }
 * );
 */

// HTTP Client
export {
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
} from './http';

// Errors
export {
  type ProblemDetails,
  type FieldError,
  isProblemDetails,
  parseProblemDetails,
  ProblemDetailsFactory,
  ApiError,
} from './errors';

// Query Keys
export {
  type QueryKey,
  type QueryKeyOptions,
  createQueryKeyFactory,
  mergeQueryKeyFactories,
  createScopedQueryKey,
  matchQueryKey,
  serializeQueryParams,
  hashQueryKey,
} from './query';

// Retry
export {
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
} from './retry';

// Auth (Demo Login, OAuth, ID-porten)
export * from './auth';

// SaaS Admin (Tenant Management, Plans, Feature Flags, Billing)
export * from './saas';
