/**
 * API Client Factory
 *
 * Manages client instances with singleton pattern.
 * Schema-agnostic client management.
 */

import type { IHttpClient, ApiClientConfig } from './types';
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
    throw new Error('API client not initialized. Call initializeClient() first.');
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
 * Check if client is initialized
 */
export function isClientInitialized(): boolean {
  return defaultClient !== null;
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
 * Clear tenant ID
 */
export function clearTenantId(): void {
  updateClientConfig({ tenantId: undefined });
}

/**
 * Reset the client (for testing or logout)
 */
export function resetClient(): void {
  defaultClient = null;
  clientConfig = null;
}

/**
 * Create a new client instance without affecting the global singleton
 * Useful for testing or multiple API instances
 */
export function createClient(config: ApiClientConfig): IHttpClient {
  return new FetchHttpClient(config);
}
