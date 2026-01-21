/**
 * Offline capability module for @xalatechnologies/enterprise
 *
 * Provides offline functionality including:
 * - Connection status monitoring
 * - Action queuing for offline execution
 * - Automatic sync when connection is restored
 * - Local storage persistence
 *
 * @example
 * ```tsx
 * import { OfflineProvider, useOffline } from '@xalatechnologies/enterprise/offline';
 *
 * // In your app root
 * <OfflineProvider config={{
 *   enabled: true,
 *   syncFn: async (action) => await api.sync(action)
 * }}>
 *   <App />
 * </OfflineProvider>
 *
 * // In your components
 * function MyComponent() {
 *   const { isOnline, queueAction, pendingCount } = useOffline();
 *
 *   const handleSave = async (data) => {
 *     if (isOnline) {
 *       await api.save(data);
 *     } else {
 *       await queueAction('create', 'resource', data);
 *     }
 *   };
 * }
 * ```
 */

export {
  OfflineProvider,
  useOffline,
  useIsOnline,
  type OfflineProviderProps,
} from './OfflineProvider';

export type {
  ConnectionStatus,
  SyncStatus,
  QueuedAction,
  OfflineConfig,
  OfflineStorageConfig,
  OfflineContextValue,
  SyncResult,
} from './types';
