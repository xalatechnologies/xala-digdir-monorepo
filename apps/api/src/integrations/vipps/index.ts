/**
 * Vipps Payment Integration
 * Norwegian mobile payment solution
 *
 * This module provides:
 * - Interface definition (IVippsClient)
 * - Real client for production (VippsClient)
 * - Mock client for demo/testing (VippsMockClient)
 * - Config-based provider selection
 *
 * Usage:
 * ```typescript
 * import { getVippsClient, vippsClient } from '@/integrations/vipps';
 *
 * // Use singleton (recommended)
 * const payment = await vippsClient.createPayment({...});
 *
 * // Or get new instance with custom config
 * const client = getVippsClient(customConfig);
 * ```
 */

// Re-export types
export * from './vipps.types';

// Export client classes
export { VippsClient } from './vipps.client';
export { VippsMockClient } from './vipps-mock.client';

import type { IVippsClient, VippsConfig } from './vipps.types';
import { VippsClient } from './vipps.client';
import { VippsMockClient } from './vipps-mock.client';

/**
 * Get Vipps config from environment variables
 */
function getVippsConfig(): VippsConfig {
  const clientId = process.env.VIPPS_CLIENT_ID || '';
  const clientSecret = process.env.VIPPS_CLIENT_SECRET || '';
  const subscriptionKey = process.env.VIPPS_SUBSCRIPTION_KEY || '';
  const merchantSerialNumber = process.env.VIPPS_MSN || '';
  const environment = (process.env.VIPPS_ENVIRONMENT as 'test' | 'production') || 'test';
  const callbackUrl = process.env.VIPPS_CALLBACK_URL || 'http://localhost:4000/api/webhooks/vipps';
  const webhookSecret = process.env.VIPPS_WEBHOOK_SECRET;

  // Use mock if any required credential is missing
  const useMock =
    process.env.VIPPS_USE_MOCK === 'true' ||
    !clientId ||
    !clientSecret ||
    !subscriptionKey ||
    !merchantSerialNumber;

  return {
    clientId,
    clientSecret,
    subscriptionKey,
    merchantSerialNumber,
    environment,
    callbackUrl,
    webhookSecret,
    useMock,
  };
}

/**
 * Create a Vipps client instance based on configuration
 *
 * @param config Optional configuration override. If not provided, uses environment variables.
 * @returns IVippsClient instance (mock or real based on config)
 */
export function getVippsClient(config?: Partial<VippsConfig>): IVippsClient {
  const resolvedConfig = {
    ...getVippsConfig(),
    ...config,
  };

  if (resolvedConfig.useMock) {
    return new VippsMockClient();
  }

  return new VippsClient(resolvedConfig);
}

/**
 * Singleton Vipps client instance
 * Uses environment-based configuration
 */
let _vippsClient: IVippsClient | null = null;

export function getVippsClientSingleton(): IVippsClient {
  if (!_vippsClient) {
    _vippsClient = getVippsClient();
  }
  return _vippsClient;
}

/**
 * Reset the singleton (useful for testing)
 */
export function resetVippsClient(): void {
  _vippsClient = null;
}

/**
 * Default export: singleton client instance
 * Uses lazy initialization via Proxy to defer client creation
 */
export const vippsClient: IVippsClient = new Proxy({} as IVippsClient, {
  get(_, prop: keyof IVippsClient) {
    const client = getVippsClientSingleton();
    const value = client[prop];
    if (typeof value === 'function') {
      return value.bind(client);
    }
    return value;
  },
});

export default vippsClient;
