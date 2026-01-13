/**
 * @digilist/client-sdk
 * Type-safe SDK for the Digilist Backoffice API
 * 
 * @example
 * ```typescript
 * import { initializeClient, listingService, useListings } from '@digilist/client-sdk';
 * 
 * // Initialize client
 * initializeClient({
 *   baseUrl: 'https://api.digilist.no',
 *   tenantId: 'your-tenant-id',
 * });
 * 
 * // Use service directly
 * const listings = await listingService.getAll();
 * 
 * // Or use React Query hook
 * function MyComponent() {
 *   const { data, isLoading } = useListings();
 *   ...
 * }
 * ```
 */

// Core - Client management
export {
  initializeClient,
  getClient,
  getClientConfig,
  updateClientConfig,
  setAuthToken,
  clearAuthToken,
  setTenantId,
  isClientInitialized,
  createClient,
  resetClient,
  isUsingMockData,
} from './core/client-factory';

export type {
  IHttpClient,
  ApiClientConfig,
  RequestOptions,
  HttpResponse,
  HttpMethod,
} from './core/http-client.interface';

export { ApiError } from './core/http-client.interface';
export { FetchHttpClient } from './core/fetch-client';

// Types - All type definitions
export * from './types';

// Services - Domain services
export * from './services';

// Hooks - React Query hooks (requires React and @tanstack/react-query)
export * from './hooks';

// Utils - Formatting utilities (Norwegian locale)
export * from './utils';
