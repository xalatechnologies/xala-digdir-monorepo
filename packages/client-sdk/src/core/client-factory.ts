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
  clientConfig = config;
  defaultClient = new FetchHttpClient(config);
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
  return new FetchHttpClient(config);
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

/**
 * Set the Platform API URL for dual API routing
 * Platform API handles: auth, users, tenants, organizations, RBAC, audit, GDPR, notifications, etc.
 * Domain API handles: bookings, rental-objects, calendar, seasons, etc.
 */
export function setPlatformApiUrl(platformApiUrl: string): void {
  updateClientConfig({ platformApiUrl });
}

/**
 * Get the current Platform API URL
 * Returns undefined if not configured (single API mode)
 */
export function getPlatformApiUrl(): string | undefined {
  return clientConfig?.platformApiUrl;
}

/**
 * Check if dual API mode is enabled
 * Returns true if platformApiUrl is configured and different from baseUrl
 */
export function isDualApiMode(): boolean {
  if (!clientConfig?.platformApiUrl) {
    return false;
  }
  return clientConfig.platformApiUrl !== clientConfig.baseUrl;
}

/**
 * Get the Domain API URL (same as baseUrl)
 */
export function getDomainApiUrl(): string | undefined {
  return clientConfig?.baseUrl;
}
