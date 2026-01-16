/**
 * HTTP Module Exports
 *
 * Schema-agnostic HTTP client and utilities.
 */

export type {
  HttpMethod,
  RequestBody,
  RequestOptions,
  HttpResponse,
  IHttpClient,
  ApiClientConfig,
} from './types';

export { FetchHttpClient } from './fetch-client';

export {
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
} from './client-factory';
