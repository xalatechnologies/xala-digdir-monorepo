/**
 * @xala/runtime - RuntimeProvider
 *
 * Unified provider that composes all required context providers for Xala apps.
 * This replaces 8-12 nested providers with a single mount point.
 *
 * Usage:
 * ```tsx
 * import { RuntimeProvider } from '@xala/runtime';
 *
 * function App() {
 *   return (
 *     <RuntimeProvider
 *       config={{
 *         appType: 'backoffice',
 *         apiUrl: import.meta.env.VITE_API_URL,
 *         locale: 'nb',
 *       }}
 *     >
 *       <BrowserRouter>
 *         <Routes />
 *       </BrowserRouter>
 *     </RuntimeProvider>
 *   );
 * }
 * ```
 */

import React, { createContext, useContext, useMemo, useState, type ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { I18nProvider } from '@xala/i18n';
import { AuthProvider } from '@xala/auth';
import { ErrorBoundary, ThemeProvider, DialogProvider } from '@xala/ds';
import type { RuntimeConfig, FeatureFlagsContext, TenantContext, NotificationCenterContext } from './types';

// ============================================================================
// Internal Contexts (for features not covered by other packages)
// ============================================================================

const FeatureFlagsContext = createContext<FeatureFlagsContext | null>(null);
const TenantContextInternal = createContext<TenantContext | null>(null);
const NotificationCenterContextInternal = createContext<NotificationCenterContext | null>(null);
const RuntimeConfigContext = createContext<RuntimeConfig | null>(null);

// ============================================================================
// Default QueryClient Configuration
// ============================================================================

function createDefaultQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 1000 * 60 * 5, // 5 minutes
        retry: 1,
        refetchOnWindowFocus: false,
      },
      mutations: {
        retry: 0,
      },
    },
  });
}

// ============================================================================
// Internal Providers
// ============================================================================

interface FeatureFlagsProviderProps {
  flags: Record<string, boolean>;
  children: ReactNode;
}

function FeatureFlagsProvider({ flags, children }: FeatureFlagsProviderProps) {
  const value = useMemo<FeatureFlagsContext>(() => ({
    isEnabled: (flag: string) => flags[flag] ?? false,
    getVariant: <T,>(flag: string, defaultValue: T) => (flags[flag] as unknown as T) ?? defaultValue,
    flags,
  }), [flags]);

  return (
    <FeatureFlagsContext.Provider value={value}>
      {children}
    </FeatureFlagsContext.Provider>
  );
}

interface TenantProviderProps {
  tenantId?: string;
  children: ReactNode;
}

function TenantProvider({ tenantId, children }: TenantProviderProps) {
  const [accountType, setAccountType] = useState<'personal' | 'organization'>('personal');
  const [selectedOrgId, setSelectedOrgId] = useState<string | null>(null);
  
  // In a real implementation, this would come from auth context
  const organizations: TenantContext['organizations'] = [];
  
  const value = useMemo<TenantContext>(() => ({
    tenantId: tenantId ?? null,
    tenantName: tenantId ?? null,
    accountType,
    selectedOrganization: organizations.find(o => o.id === selectedOrgId) ?? null,
    organizations,
    switchToPersonal: () => {
      setAccountType('personal');
      setSelectedOrgId(null);
    },
    switchToOrganization: (orgId: string) => {
      setAccountType('organization');
      setSelectedOrgId(orgId);
    },
  }), [tenantId, accountType, selectedOrgId, organizations]);

  return (
    <TenantContextInternal.Provider value={value}>
      {children}
    </TenantContextInternal.Provider>
  );
}

interface NotificationCenterProviderProps {
  children: ReactNode;
}

function NotificationCenterProvider({ children }: NotificationCenterProviderProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount] = useState(0); // Would be connected to realtime in production
  
  const value = useMemo<NotificationCenterContext>(() => ({
    openNotificationCenter: () => setIsOpen(true),
    closeNotificationCenter: () => setIsOpen(false),
    isOpen,
    unreadCount,
  }), [isOpen, unreadCount]);

  return (
    <NotificationCenterContextInternal.Provider value={value}>
      {children}
    </NotificationCenterContextInternal.Provider>
  );
}

// ============================================================================
// RuntimeProvider Component
// ============================================================================

export interface RuntimeProviderProps {
  config: RuntimeConfig;
  children: ReactNode;
  /** Override QueryClient (useful for testing) */
  queryClient?: QueryClient;
}

export function RuntimeProvider({ config, children, queryClient }: RuntimeProviderProps) {
  // Create or use provided QueryClient
  const qc = useMemo(
    () => queryClient ?? createDefaultQueryClient(),
    [queryClient]
  );

  // Validate required config
  if (process.env.NODE_ENV === 'development') {
    if (!config.apiUrl) {
      console.warn(
        '[RuntimeProvider] apiUrl not provided. SDK calls will fail. ' +
        'Set VITE_API_URL environment variable.'
      );
    }
  }

  // Provider composition order (outer to inner):
  // 1. QueryClientProvider - SDK data layer
  // 2. ThemeProvider - Theme state
  // 3. I18nProvider - Localization
  // 4. DialogProvider - Modal management (from DS)
  // 5. ErrorBoundary - Error handling
  // 6. AuthProvider - Authentication
  // 7. FeatureFlagsProvider - Feature flags
  // 8. TenantProvider - Tenant/org context
  // 9. NotificationCenterProvider - Notifications
  // 10. Children - App content

  return (
    <RuntimeConfigContext.Provider value={config}>
      <QueryClientProvider client={qc}>
        <ThemeProvider>
          <I18nProvider initialLocale={config.locale ?? 'nb'}>
            <DialogProvider>
              <ErrorBoundary>
                <AuthProvider
                  config={{
                    loginPath: config.authConfig?.loginPath ?? '/login',
                    debug: config.authConfig?.debug ?? false,
                  }}
                >
                  <FeatureFlagsProvider flags={config.featureFlags ?? {}}>
                    <TenantProvider tenantId={config.tenantId}>
                      <NotificationCenterProvider>
                        {children}
                      </NotificationCenterProvider>
                    </TenantProvider>
                  </FeatureFlagsProvider>
                </AuthProvider>
              </ErrorBoundary>
            </DialogProvider>
          </I18nProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </RuntimeConfigContext.Provider>
  );
}

// ============================================================================
// Hook to access runtime config
// ============================================================================

export function useRuntimeConfig(): RuntimeConfig {
  const context = useContext(RuntimeConfigContext);
  if (!context) {
    throw new Error(
      'useRuntimeConfig must be used within RuntimeProvider. ' +
      'Ensure your app is wrapped with <RuntimeProvider>.'
    );
  }
  return context;
}

// ============================================================================
// Re-export internal context hooks
// ============================================================================

export function useFeatureFlags(): FeatureFlagsContext {
  const context = useContext(FeatureFlagsContext);
  if (!context) {
    throw new Error(
      'useFeatureFlags must be used within RuntimeProvider. ' +
      'Ensure your app is wrapped with <RuntimeProvider>.'
    );
  }
  return context;
}

export function useTenantContext(): TenantContext {
  const context = useContext(TenantContextInternal);
  if (!context) {
    throw new Error(
      'useTenantContext must be used within RuntimeProvider. ' +
      'Ensure your app is wrapped with <RuntimeProvider>.'
    );
  }
  return context;
}

export function useNotificationCenter(): NotificationCenterContext {
  const context = useContext(NotificationCenterContextInternal);
  if (!context) {
    throw new Error(
      'useNotificationCenter must be used within RuntimeProvider. ' +
      'Ensure your app is wrapped with <RuntimeProvider>.'
    );
  }
  return context;
}
