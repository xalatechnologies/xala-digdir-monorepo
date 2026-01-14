/**
 * API Client Factory
 * Single Responsibility: Create and manage API client instances
 * Open/Closed: Extensible through custom HTTP client implementations
 */

import type { IHttpClient, ApiClientConfig } from './http-client.interface';
import { FetchHttpClient } from './fetch-client';

let defaultClient: IHttpClient | null = null;
let clientConfig: ApiClientConfig | null = null;

/**
 * Initialize the API client with configuration
 * Must be called before using any API methods
 */
export function initializeClient(config: ApiClientConfig): IHttpClient {
  // Set credentials to 'include' by default to enable cookie-based auth
  const configWithDefaults: ApiClientConfig = {
    credentials: 'include',
    ...config,
  };

  clientConfig = configWithDefaults;
  defaultClient = new FetchHttpClient(configWithDefaults);
  return defaultClient;
}

/**
 * Get the initialized API client
 * @throws Error if client not initialized
 */
export function getClient(): IHttpClient {
  if (!defaultClient) {
    throw new Error(
      'API client not initialized. Call initializeClient() first.'
    );
  }
  return defaultClient;
}

/**
 * Get the current configuration
 */
export function getClientConfig(): ApiClientConfig | null {
  return clientConfig;
}

/**
 * Update client configuration (e.g., after login)
 */
export function updateClientConfig(updates: Partial<ApiClientConfig>): void {
  if (!defaultClient || !clientConfig) {
    throw new Error('API client not initialized');
  }
  
  clientConfig = { ...clientConfig, ...updates };
  
  // If using FetchHttpClient, update its config
  if (defaultClient instanceof FetchHttpClient) {
    defaultClient.updateConfig(updates);
  }
}

/**
 * Set auth token
 */
export function setAuthToken(token: string): void {
  updateClientConfig({ token });
}

/**
 * Clear auth token
 */
export function clearAuthToken(): void {
  updateClientConfig({ token: undefined });
}

/**
 * Set tenant ID
 */
export function setTenantId(tenantId: string): void {
  updateClientConfig({ tenantId });
}

/**
 * Check if client is initialized
 */
export function isClientInitialized(): boolean {
  return defaultClient !== null;
}

/**
 * Create a new client instance with custom config
 * Useful for testing or multiple API connections
 */
export function createClient(config: ApiClientConfig): IHttpClient {
  // Set credentials to 'include' by default to enable cookie-based auth
  const configWithDefaults: ApiClientConfig = {
    credentials: 'include',
    ...config,
  };

  return new FetchHttpClient(configWithDefaults);
}

/**
 * Reset the client (useful for testing)
 */
export function resetClient(): void {
  defaultClient = null;
  clientConfig = null;
}

/**
 * Check if using mock data (no real API configured)
 * Returns true if baseUrl is empty, 'mock', or not configured
 */
export function isUsingMockData(): boolean {
  if (!clientConfig || !clientConfig.baseUrl) {
    return true;
  }
  const url = clientConfig.baseUrl.toLowerCase();
  return url === 'mock' || url === '' || url.includes('localhost:mock');
}
