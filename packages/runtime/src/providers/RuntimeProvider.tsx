/**
 * @digilist/runtime - RuntimeProvider
 *
 * Core runtime provider that wraps the application with necessary contexts.
 * This is a local implementation to remove dependency on deleted platform package.
 */

import React, { createContext, useContext, useMemo } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { RuntimeConfig } from '../config/app-config';

// Re-export RuntimeConfig type for convenience
export type { RuntimeConfig };

// ============================================================================
// Runtime Context
// ============================================================================

interface RuntimeContextValue {
  config: RuntimeConfig;
}

const RuntimeContext = createContext<RuntimeContextValue | null>(null);

/**
 * Hook to access runtime configuration
 */
export function useRuntimeConfig(): RuntimeConfig {
  const context = useContext(RuntimeContext);
  if (!context) {
    throw new Error('useRuntimeConfig must be used within a RuntimeProvider');
  }
  return context.config;
}

// ============================================================================
// Query Client
// ============================================================================

const defaultQueryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

// ============================================================================
// RuntimeProvider
// ============================================================================

export interface RuntimeProviderProps {
  config: RuntimeConfig;
  children: React.ReactNode;
  queryClient?: QueryClient;
}

/**
 * RuntimeProvider
 *
 * Provides runtime configuration and essential React Query context.
 *
 * @example
 * ```tsx
 * import { RuntimeProvider } from '@digilist/runtime';
 *
 * function App() {
 *   return (
 *     <RuntimeProvider config={runtimeConfig}>
 *       <YourApp />
 *     </RuntimeProvider>
 *   );
 * }
 * ```
 */
export const RuntimeProvider: React.FC<RuntimeProviderProps> = ({
  config,
  children,
  queryClient = defaultQueryClient,
}) => {
  const contextValue = useMemo(() => ({ config }), [config]);

  // Apply data attributes to document
  React.useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-color-scheme', config.colorScheme);
      document.documentElement.setAttribute('lang', config.locale);
    }
  }, [config.colorScheme, config.locale]);

  return (
    <RuntimeContext.Provider value={contextValue}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </RuntimeContext.Provider>
  );
};

RuntimeProvider.displayName = 'RuntimeProvider';

// ============================================================================
// RuntimeServiceProvider (Placeholder for DI)
// ============================================================================

interface RuntimeServiceConfig {
  services: Record<string, unknown>;
}

interface RuntimeServiceContextValue {
  config: RuntimeServiceConfig;
}

const RuntimeServiceContext = createContext<RuntimeServiceContextValue | null>(null);

export interface RuntimeServiceProviderProps {
  config: RuntimeServiceConfig;
  children: React.ReactNode;
}

/**
 * RuntimeServiceProvider
 *
 * Provides dependency injection for SDK hooks.
 */
export const RuntimeServiceProvider: React.FC<RuntimeServiceProviderProps> = ({
  config,
  children,
}) => {
  const contextValue = useMemo(() => ({ config }), [config]);

  return (
    <RuntimeServiceContext.Provider value={contextValue}>
      {children}
    </RuntimeServiceContext.Provider>
  );
};

RuntimeServiceProvider.displayName = 'RuntimeServiceProvider';

/**
 * Hook to access runtime services
 */
export function useRuntimeServices(): RuntimeServiceConfig | null {
  const context = useContext(RuntimeServiceContext);
  return context?.config ?? null;
}
