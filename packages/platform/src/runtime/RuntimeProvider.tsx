/**
 * RuntimeProvider Component
 *
 * Provides runtime configuration context and wraps the app with required providers.
 * This is the main entry point for platform apps.
 *
 * @example
 * ```tsx
 * import { RuntimeProvider } from '@xalatechnologies/platform/runtime';
 *
 * const config = {
 *   appType: 'backoffice',
 *   apiUrl: 'https://api.digilist.no',
 *   locale: 'nb',
 *   theme: 'digilist',
 *   colorScheme: 'auto',
 *   authConfig: { loginPath: '/login', debug: false },
 * };
 *
 * function App() {
 *   return (
 *     <RuntimeProvider config={config}>
 *       <MyApp />
 *     </RuntimeProvider>
 *   );
 * }
 * ```
 */

import React, { createContext, useContext, useMemo } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '../auth/AuthProvider';
import { DesignsystemetProvider } from '../ui/provider';
import { I18nProvider } from '../i18n';

// ============================================================================
// Types
// ============================================================================

export interface RuntimeConfig {
  /** Application type identifier */
  appType: string;
  /** API base URL */
  apiUrl: string;
  /** WebSocket URL */
  wsUrl?: string;
  /** Tenant identifier */
  tenantId?: string;
  /** Locale for internationalization */
  locale?: 'nb' | 'en';
  /** Theme name */
  theme?: string;
  /** Color scheme preference */
  colorScheme?: 'light' | 'dark' | 'auto';
  /** Auth configuration */
  authConfig?: {
    loginPath?: string;
    debug?: boolean;
    sessionCheckInterval?: number;
  };
  /** Feature flags */
  featureFlags?: Record<string, boolean>;
}

export interface RuntimeContextValue {
  config: RuntimeConfig;
  isFeatureEnabled: (feature: string) => boolean;
}

// ============================================================================
// Context
// ============================================================================

const RuntimeContext = createContext<RuntimeContextValue | null>(null);

/**
 * Hook to access runtime context
 */
export function useRuntime(): RuntimeContextValue {
  const context = useContext(RuntimeContext);
  if (!context) {
    throw new Error('useRuntime must be used within a RuntimeProvider');
  }
  return context;
}

/**
 * Hook to check if a feature is enabled
 */
export function useFeatureFlag(feature: string): boolean {
  const { isFeatureEnabled } = useRuntime();
  return isFeatureEnabled(feature);
}

// ============================================================================
// Provider Component
// ============================================================================

export interface RuntimeProviderProps {
  /** Runtime configuration */
  config: RuntimeConfig;
  /** Child components */
  children: React.ReactNode;
  /** Optional custom QueryClient */
  queryClient?: QueryClient;
}

// Default QueryClient instance
const defaultQueryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 30 * 60 * 1000, // 30 minutes
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

/**
 * RuntimeProvider wraps the app with all required providers
 */
export function RuntimeProvider({
  config,
  children,
  queryClient = defaultQueryClient,
}: RuntimeProviderProps): React.ReactElement {
  // Memoize context value
  const contextValue = useMemo<RuntimeContextValue>(() => ({
    config,
    isFeatureEnabled: (feature: string) => {
      return config.featureFlags?.[feature] ?? false;
    },
  }), [config]);

  return (
    <RuntimeContext.Provider value={contextValue}>
      <QueryClientProvider client={queryClient}>
        <I18nProvider initialLocale={config.locale || 'nb'}>
          <AuthProvider>
            <DesignsystemetProvider
              theme={(config.theme || 'digilist') as 'digilist' | 'digdir'}
              colorScheme={config.colorScheme || 'auto'}
            >
              {children}
            </DesignsystemetProvider>
          </AuthProvider>
        </I18nProvider>
      </QueryClientProvider>
    </RuntimeContext.Provider>
  );
}
