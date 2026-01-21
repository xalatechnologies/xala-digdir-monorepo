/**
 * Core Module Index
 *
 * Core functionality for HTTP client, error handling, and utilities.
 * Local implementations are used for all functionality.
 */

// =============================================================================
// HTTP Client Exports
// =============================================================================

export * from './http-client.interface';
export * from './fetch-client';
export * from './client-factory';

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
