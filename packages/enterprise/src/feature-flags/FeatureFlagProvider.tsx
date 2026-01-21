import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from 'react';
import type {
  FeatureFlagConfig,
  FeatureFlagContextValue,
  FeatureFlagContext as FeatureFlagEvalContext,
} from './types';

const FeatureFlagContext = createContext<FeatureFlagContextValue | null>(null);

export interface FeatureFlagProviderProps {
  children: ReactNode;
  config?: FeatureFlagConfig;
}

/**
 * FeatureFlagProvider - React context provider for feature flags
 *
 * Provides feature flag functionality including:
 * - Local feature flag management
 * - Remote feature flag fetching (optional)
 * - Context-based evaluation (user, tenant, roles)
 *
 * @example
 * ```tsx
 * <FeatureFlagProvider config={{
 *   flags: { 'new-dashboard': true, 'beta-features': false },
 *   context: { tenantId: 'kommune-123' }
 * }}>
 *   <App />
 * </FeatureFlagProvider>
 * ```
 */
export function FeatureFlagProvider({
  children,
  config = {},
}: FeatureFlagProviderProps) {
  const [flags, setFlags] = useState<Record<string, boolean>>(
    config.flags ?? {}
  );
  const [context, setContext] = useState<FeatureFlagEvalContext>(
    config.context ?? {}
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Fetch remote flags if URL is provided
  useEffect(() => {
    if (!config.remoteUrl) return undefined;

    const fetchFlags = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(config.remoteUrl!, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ context }),
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch feature flags: ${response.status}`);
        }

        const remoteFlags = await response.json();
        setFlags((prev) => ({ ...prev, ...remoteFlags }));
        config.onFlagsUpdated?.(remoteFlags);
      } catch (err) {
        setError(
          err instanceof Error ? err : new Error('Unknown error fetching flags')
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchFlags();

    // Set up polling if interval is provided
    if (config.pollingInterval && config.pollingInterval > 0) {
      const interval = setInterval(fetchFlags, config.pollingInterval);
      return () => clearInterval(interval);
    }

    return undefined;
  }, [config.remoteUrl, config.pollingInterval, context]);

  const isEnabled = useCallback(
    (key: string): boolean => {
      return flags[key] ?? false;
    },
    [flags]
  );

  const getFlags = useCallback((): Record<string, boolean> => {
    return { ...flags };
  }, [flags]);

  const updateFlags = useCallback(
    (newFlags: Record<string, boolean>) => {
      setFlags((prev) => ({ ...prev, ...newFlags }));
      config.onFlagsUpdated?.(newFlags);
    },
    [config.onFlagsUpdated]
  );

  const updateContext = useCallback((newContext: FeatureFlagEvalContext) => {
    setContext((prev) => ({ ...prev, ...newContext }));
  }, []);

  const value: FeatureFlagContextValue = {
    isEnabled,
    getFlags,
    setFlags: updateFlags,
    isLoading,
    error,
    context,
    setContext: updateContext,
  };

  return (
    <FeatureFlagContext.Provider value={value}>
      {children}
    </FeatureFlagContext.Provider>
  );
}

/**
 * Hook to access feature flag functionality
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { isEnabled } = useFeatureFlags();
 *
 *   if (isEnabled('new-dashboard')) {
 *     return <NewDashboard />;
 *   }
 *
 *   return <LegacyDashboard />;
 * }
 * ```
 */
export function useFeatureFlags(): FeatureFlagContextValue {
  const context = useContext(FeatureFlagContext);

  if (!context) {
    throw new Error(
      'useFeatureFlags must be used within a FeatureFlagProvider'
    );
  }

  return context;
}

/**
 * Convenience hook to check a single feature flag
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const isNewDashboardEnabled = useFeatureFlag('new-dashboard');
 *
 *   return isNewDashboardEnabled ? <NewDashboard /> : <LegacyDashboard />;
 * }
 * ```
 */
export function useFeatureFlag(key: string): boolean {
  const { isEnabled } = useFeatureFlags();
  return isEnabled(key);
}
