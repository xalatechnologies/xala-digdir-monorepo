/**
 * Microsoft Outlook Integration
 * Calendar sync via Microsoft Graph API
 *
 * This module provides:
 * - Interface definition (IOutlookClient)
 * - Real client for production (OutlookClient)
 * - Mock client for demo/testing (OutlookMockClient)
 * - Config-based provider selection
 *
 * Usage:
 * ```typescript
 * import { getOutlookClient, outlookClient } from '@/integrations/outlook';
 *
 * // Use singleton (recommended)
 * const events = await outlookClient.getEvents();
 *
 * // Or get new instance with custom config
 * const client = getOutlookClient(customConfig);
 * ```
 */

// Re-export types
export * from './outlook.types';

// Export client classes
export { OutlookClient } from './outlook.client';
export { OutlookMockClient } from './outlook-mock.client';

import type { IOutlookClient, OutlookConfig } from './outlook.types';
import { OutlookClient } from './outlook.client';
import { OutlookMockClient } from './outlook-mock.client';

/**
 * Get Outlook config from environment variables
 */
function getOutlookConfig(): OutlookConfig {
  return {
    tenantId: process.env.OUTLOOK_TENANT_ID || '',
    clientId: process.env.OUTLOOK_CLIENT_ID || '',
    clientSecret: process.env.OUTLOOK_CLIENT_SECRET || '',
    useMock: process.env.OUTLOOK_USE_MOCK === 'true' || !process.env.OUTLOOK_CLIENT_ID,
  };
}

/**
 * Create an Outlook client instance based on configuration
 *
 * @param config Optional configuration override. If not provided, uses environment variables.
 * @returns IOutlookClient instance (mock or real based on config)
 */
export function getOutlookClient(config?: Partial<OutlookConfig>): IOutlookClient {
  const resolvedConfig = {
    ...getOutlookConfig(),
    ...config,
  };

  if (resolvedConfig.useMock) {
    return new OutlookMockClient();
  }

  return new OutlookClient(resolvedConfig);
}

/**
 * Singleton Outlook client instance
 * Uses environment-based configuration
 */
let _outlookClient: IOutlookClient | null = null;

export function getOutlookClientSingleton(): IOutlookClient {
  if (!_outlookClient) {
    _outlookClient = getOutlookClient();
  }
  return _outlookClient;
}

/**
 * Reset the singleton (useful for testing)
 */
export function resetOutlookClient(): void {
  _outlookClient = null;
}

/**
 * Default export: singleton client instance
 */
export const outlookClient: IOutlookClient = new Proxy({} as IOutlookClient, {
  get(_, prop: keyof IOutlookClient) {
    const client = getOutlookClientSingleton();
    const value = client[prop];
    if (typeof value === 'function') {
      return value.bind(client);
    }
    return value;
  },
});

export default outlookClient;
