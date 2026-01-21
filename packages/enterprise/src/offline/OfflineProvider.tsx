import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useRef,
  type ReactNode,
} from 'react';
import type {
  OfflineConfig,
  OfflineContextValue,
  QueuedAction,
  ConnectionStatus,
  SyncStatus,
  SyncResult,
} from './types';

const OfflineContext = createContext<OfflineContextValue | null>(null);

export interface OfflineProviderProps {
  children: ReactNode;
  config?: OfflineConfig;
}

const generateId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

const STORAGE_KEY = 'xala-offline-queue';

/**
 * OfflineProvider - React context provider for offline capability
 *
 * Provides offline functionality including:
 * - Connection status monitoring
 * - Action queuing for offline execution
 * - Automatic sync when connection is restored
 * - Manual sync trigger
 *
 * @example
 * ```tsx
 * <OfflineProvider config={{
 *   enabled: true,
 *   syncFn: async (action) => {
 *     await api.sync(action);
 *   }
 * }}>
 *   <App />
 * </OfflineProvider>
 * ```
 */
export function OfflineProvider({ children, config = {} }: OfflineProviderProps) {
  const [connectionStatus, setConnectionStatus] =
    useState<ConnectionStatus>('online');
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('idle');
  const [queue, setQueue] = useState<QueuedAction[]>(() => {
    // Load queue from storage on mount
    if (typeof window !== 'undefined' && config.enabled !== false) {
      try {
        const stored = localStorage.getItem(
          config.storage?.prefix
            ? `${config.storage.prefix}-${STORAGE_KEY}`
            : STORAGE_KEY
        );
        if (stored) {
          const parsed = JSON.parse(stored);
          return parsed.map((action: QueuedAction) => ({
            ...action,
            queuedAt: new Date(action.queuedAt),
          }));
        }
      } catch {
        // Ignore storage errors
      }
    }
    return [];
  });

  const syncingRef = useRef(false);

  const isOnline = connectionStatus === 'online';
  const isOfflineEnabled = config.enabled !== false;
  const pendingCount = queue.length;

  // Persist queue to storage
  useEffect(() => {
    if (typeof window === 'undefined' || !isOfflineEnabled) return;

    const storageKey = config.storage?.prefix
      ? `${config.storage.prefix}-${STORAGE_KEY}`
      : STORAGE_KEY;

    try {
      localStorage.setItem(storageKey, JSON.stringify(queue));
    } catch {
      // Ignore storage errors
    }
  }, [queue, isOfflineEnabled, config.storage?.prefix]);

  // Monitor online/offline status
  useEffect(() => {
    if (typeof window === 'undefined' || !isOfflineEnabled) return;

    const handleOnline = () => {
      setConnectionStatus('online');
      config.onStatusChange?.('online');
    };

    const handleOffline = () => {
      setConnectionStatus('offline');
      config.onStatusChange?.('offline');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Set initial status
    if (!navigator.onLine) {
      setConnectionStatus('offline');
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [isOfflineEnabled, config.onStatusChange]);

  // Auto-sync when coming back online
  useEffect(() => {
    if (isOnline && queue.length > 0 && config.syncFn && !syncingRef.current) {
      syncNow();
    }
  }, [isOnline, queue.length]);

  const queueAction = useCallback(
    async (type: string, resource: string, payload: unknown): Promise<string> => {
      const maxQueueSize = config.storage?.maxQueueSize ?? 100;

      if (queue.length >= maxQueueSize) {
        throw new Error(
          `Offline queue is full (max ${maxQueueSize} actions)`
        );
      }

      const action: QueuedAction = {
        id: generateId(),
        type,
        resource,
        payload,
        queuedAt: new Date(),
        attempts: 0,
      };

      setQueue((prev) => [...prev, action]);
      return action.id;
    },
    [queue.length, config.storage?.maxQueueSize]
  );

  const getQueuedActions = useCallback((): QueuedAction[] => {
    return [...queue];
  }, [queue]);

  const removeQueuedAction = useCallback((id: string) => {
    setQueue((prev) => prev.filter((action) => action.id !== id));
  }, []);

  const clearQueue = useCallback(() => {
    setQueue([]);
  }, []);

  const syncNow = useCallback(async (): Promise<SyncResult[]> => {
    if (!config.syncFn || queue.length === 0 || syncingRef.current) {
      return [];
    }

    syncingRef.current = true;
    setSyncStatus('syncing');

    const results: SyncResult[] = [];
    const successfulIds: string[] = [];

    for (const action of queue) {
      try {
        await config.syncFn({
          ...action,
          attempts: action.attempts + 1,
        });

        results.push({ action, success: true });
        successfulIds.push(action.id);
      } catch (err) {
        const error =
          err instanceof Error ? err.message : 'Unknown sync error';
        results.push({ action, success: false, error });

        // Update action with error
        setQueue((prev) =>
          prev.map((a) =>
            a.id === action.id
              ? { ...a, attempts: a.attempts + 1, lastError: error }
              : a
          )
        );
      }
    }

    // Remove successful actions
    if (successfulIds.length > 0) {
      setQueue((prev) => prev.filter((a) => !successfulIds.includes(a.id)));
    }

    const hasErrors = results.some((r) => !r.success);
    setSyncStatus(hasErrors ? 'error' : 'completed');
    syncingRef.current = false;

    config.onSyncComplete?.(results);

    // Reset status after a delay
    setTimeout(() => {
      setSyncStatus('idle');
    }, 3000);

    return results;
  }, [config.syncFn, queue]);

  const value: OfflineContextValue = {
    connectionStatus,
    isOnline,
    isOfflineEnabled,
    syncStatus,
    queueAction,
    getQueuedActions,
    removeQueuedAction,
    clearQueue,
    syncNow,
    pendingCount,
  };

  return (
    <OfflineContext.Provider value={value}>{children}</OfflineContext.Provider>
  );
}

/**
 * Hook to access offline functionality
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { isOnline, queueAction, pendingCount } = useOffline();
 *
 *   const handleSave = async (data) => {
 *     if (isOnline) {
 *       await api.save(data);
 *     } else {
 *       await queueAction('create', 'booking', data);
 *     }
 *   };
 *
 *   return (
 *     <div>
 *       {!isOnline && <Banner>Offline mode - {pendingCount} pending</Banner>}
 *       <button onClick={() => handleSave(formData)}>Save</button>
 *     </div>
 *   );
 * }
 * ```
 */
export function useOffline(): OfflineContextValue {
  const context = useContext(OfflineContext);

  if (!context) {
    throw new Error('useOffline must be used within an OfflineProvider');
  }

  return context;
}

/**
 * Convenience hook to check online status
 *
 * @example
 * ```tsx
 * function StatusIndicator() {
 *   const isOnline = useIsOnline();
 *   return <span>{isOnline ? 'Online' : 'Offline'}</span>;
 * }
 * ```
 */
export function useIsOnline(): boolean {
  const { isOnline } = useOffline();
  return isOnline;
}
