/**
 * @xala/runtime - useSDK
 *
 * Access SDK client and query utilities.
 */

import { useQueryClient } from '@tanstack/react-query';
import { useRuntimeConfig } from '../RuntimeProvider';
import type { SDKContext } from '../types';

/**
 * Access SDK utilities.
 *
 * Usage:
 * ```tsx
 * const { queryClient, apiUrl, isOnline } = useSDK();
 * queryClient.invalidateQueries({ queryKey: ['bookings'] });
 * ```
 */
export function useSDK(): SDKContext {
  const queryClient = useQueryClient();
  const config = useRuntimeConfig();

  return {
    queryClient,
    apiUrl: config.apiUrl,
    isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
  };
}
