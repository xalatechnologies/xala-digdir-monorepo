/**
 * Offline capability types for @xalatechnologies/enterprise
 */

/**
 * Connection status
 */
export type ConnectionStatus = 'online' | 'offline' | 'reconnecting';

/**
 * Sync status for offline data
 */
export type SyncStatus = 'idle' | 'syncing' | 'error' | 'completed';

/**
 * Represents a queued offline action
 */
export interface QueuedAction {
  /** Unique identifier for the action */
  id: string;
  /** Type of action (e.g., 'create', 'update', 'delete') */
  type: string;
  /** Resource type the action applies to */
  resource: string;
  /** Payload data for the action */
  payload: unknown;
  /** Timestamp when the action was queued */
  queuedAt: Date;
  /** Number of sync attempts */
  attempts: number;
  /** Last error message if sync failed */
  lastError?: string;
}

/**
 * Offline storage configuration
 */
export interface OfflineStorageConfig {
  /** Storage key prefix */
  prefix?: string;
  /** Maximum number of queued actions */
  maxQueueSize?: number;
  /** Storage type ('localStorage' | 'indexedDB') */
  storageType?: 'localStorage' | 'indexedDB';
  /** Database name for IndexedDB */
  dbName?: string;
}

/**
 * Configuration for the OfflineProvider
 */
export interface OfflineConfig {
  /** Enable offline capability */
  enabled?: boolean;
  /** Storage configuration */
  storage?: OfflineStorageConfig;
  /** Sync function to execute queued actions */
  syncFn?: (action: QueuedAction) => Promise<void>;
  /** Interval in milliseconds to check connectivity */
  connectivityCheckInterval?: number;
  /** URL to ping for connectivity check */
  connectivityCheckUrl?: string;
  /** Callback when connection status changes */
  onStatusChange?: (status: ConnectionStatus) => void;
  /** Callback when sync completes */
  onSyncComplete?: (results: SyncResult[]) => void;
}

/**
 * Result of syncing a single action
 */
export interface SyncResult {
  /** The queued action */
  action: QueuedAction;
  /** Whether sync was successful */
  success: boolean;
  /** Error message if sync failed */
  error?: string;
}

/**
 * Offline context value exposed by the provider
 */
export interface OfflineContextValue {
  /** Current connection status */
  connectionStatus: ConnectionStatus;
  /** Whether the app is currently online */
  isOnline: boolean;
  /** Whether offline mode is enabled */
  isOfflineEnabled: boolean;
  /** Current sync status */
  syncStatus: SyncStatus;
  /** Queue an action for offline sync */
  queueAction: (
    type: string,
    resource: string,
    payload: unknown
  ) => Promise<string>;
  /** Get all queued actions */
  getQueuedActions: () => QueuedAction[];
  /** Remove a queued action */
  removeQueuedAction: (id: string) => void;
  /** Clear all queued actions */
  clearQueue: () => void;
  /** Manually trigger sync */
  syncNow: () => Promise<SyncResult[]>;
  /** Number of pending actions */
  pendingCount: number;
}
