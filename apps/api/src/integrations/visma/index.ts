/**
 * Visma Enterprise Integration
 * Norwegian municipal ERP/invoicing system
 *
 * This module provides:
 * - Interface definition (IVismaClient)
 * - Real client for production (VismaClient)
 * - Mock client for demo/testing (VismaMockClient)
 * - Config-based provider selection
 *
 * Usage:
 * ```typescript
 * import { getVismaClient, vismaClient } from '@/integrations/visma';
 *
 * // Use singleton (recommended)
 * const invoices = await vismaClient.getInvoices();
 *
 * // Or get new instance with custom config
 * const client = getVismaClient(customConfig);
 * ```
 */

// Re-export types
export * from './visma.types';

// Export client classes
export { VismaClient } from './visma.client';
export { VismaMockClient } from './visma-mock.client';

import type { IVismaClient, VismaConfig } from './visma.types';
import { VismaClient } from './visma.client';
import { VismaMockClient } from './visma-mock.client';

/**
 * Get Visma config from environment variables
 */
function getVismaConfig(): VismaConfig {
  return {
    apiUrl: process.env.VISMA_API_URL || 'https://integration.visma.net',
    clientId: process.env.VISMA_CLIENT_ID || '',
    clientSecret: process.env.VISMA_CLIENT_SECRET || '',
    tenantId: process.env.VISMA_TENANT_ID || '',
    useMock: process.env.VISMA_USE_MOCK === 'true' || !process.env.VISMA_CLIENT_ID,
  };
}

/**
 * Create a Visma client instance based on configuration
 *
 * @param config Optional configuration override. If not provided, uses environment variables.
 * @returns IVismaClient instance (mock or real based on config)
 */
export function getVismaClient(config?: Partial<VismaConfig>): IVismaClient {
  const resolvedConfig = {
    ...getVismaConfig(),
    ...config,
  };

  if (resolvedConfig.useMock) {
    return new VismaMockClient();
  }

  return new VismaClient(resolvedConfig);
}

/**
 * Singleton Visma client instance
 * Uses environment-based configuration
 */
let _vismaClient: IVismaClient | null = null;

export function getVismaClientSingleton(): IVismaClient {
  if (!_vismaClient) {
    _vismaClient = getVismaClient();
  }
  return _vismaClient;
}

/**
 * Reset the singleton (useful for testing)
 */
export function resetVismaClient(): void {
  _vismaClient = null;
}

/**
 * Default export: singleton client instance
 */
export const vismaClient: IVismaClient = new Proxy({} as IVismaClient, {
  get(_, prop: keyof IVismaClient) {
    const client = getVismaClientSingleton();
    const value = client[prop];
    if (typeof value === 'function') {
      return value.bind(client);
    }
    return value;
  },
});

export default vismaClient;
