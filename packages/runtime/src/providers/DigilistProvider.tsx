import React, { useMemo } from 'react';
import {
  RuntimeProvider,
  RuntimeServiceProvider,
  type RuntimeConfig,
} from '@xalatechnologies/platform/runtime';
import { useOrganizations } from '@digilist/client-sdk/hooks';
import { AccountContextProvider, type AccountContextProviderProps } from './AccountContextProvider';

/**
 * DigilistProvider Props
 *
 * Combines the base RuntimeProvider with domain-specific Digilist providers.
 */
export interface DigilistProviderProps {
  /** Runtime configuration for the application */
  config: RuntimeConfig;
  /** Children to render within the provider tree */
  children: React.ReactNode;
  /** Storage key prefix for AccountContextProvider (default: 'app') */
  storageKeyPrefix?: string;
  /** Optional user ID for personal account mode */
  userId?: string;
  /** Optional user name for personal account mode */
  userName?: string;
  /** Skip AccountContextProvider (useful for public pages) */
  skipAccountContext?: boolean;
}

/**
 * DigilistProvider
 *
 * The main runtime provider for Digilist applications. This provider combines:
 *
 * 1. **RuntimeProvider** - Base platform provider from @xala/runtime that handles:
 *    - QueryClientProvider (React Query)
 *    - ThemeProvider (color scheme)
 *    - I18nProvider (localization)
 *    - DesignsystemetProvider (Digdir design tokens)
 *    - DialogProvider (modal dialogs)
 *    - ErrorBoundary (RFC7807 error handling)
 *    - AuthProvider (session management)
 *    - FeatureFlagsProvider (feature toggles)
 *    - TenantProvider (multi-tenant context)
 *    - NotificationCenterProvider (notifications UI)
 *
 * 2. **RuntimeServiceProvider** - Dependency injection for SDK hooks
 *
 * 3. **AccountContextProvider** - Domain-specific provider for:
 *    - Personal vs Organization account switching
 *    - Organization membership validation
 *    - Remember choice persistence
 *
 * @example Basic Usage
 * ```tsx
 * import { DigilistProvider } from '@digilist/runtime';
 *
 * function App() {
 *   return (
 *     <DigilistProvider
 *       config={{
 *         appType: 'backoffice',
 *         apiUrl: 'https://api.digilist.no',
 *         tenantId: 'oslo-kommune',
 *         locale: 'nb',
 *         theme: 'digilist',
 *         colorScheme: 'auto',
 *       }}
 *       storageKeyPrefix="backoffice"
 *     >
 *       <BrowserRouter>
 *         <Routes />
 *       </BrowserRouter>
 *     </DigilistProvider>
 *   );
 * }
 * ```
 *
 * @example Without Account Context (for public pages)
 * ```tsx
 * <DigilistProvider
 *   config={{ appType: 'web', ... }}
 *   skipAccountContext
 * >
 *   <PublicApp />
 * </DigilistProvider>
 * ```
 */
export const DigilistProvider: React.FC<DigilistProviderProps> = ({
  config,
  children,
  storageKeyPrefix = 'app',
  userId,
  userName,
  skipAccountContext = false,
}) => {
  // Service configuration for RuntimeServiceProvider
  // This injects the SDK's useOrganizations hook into the runtime context
  const serviceConfig = useMemo(
    () => ({
      services: {
        useOrganizations: (filter?: { status?: string }) => {
          // Cast to the domain-specific status type
          const status = filter?.status as 'active' | 'inactive' | 'all' | undefined;
          const result = useOrganizations({ status });
          return {
            data: result.data,
            isLoading: result.isLoading,
            error: result.error,
          };
        },
      },
    }),
    []
  );

  // Account context props
  const accountContextProps: AccountContextProviderProps = useMemo(
    () => ({
      storageKeyPrefix,
      userId,
      userName,
      children: null, // Will be set below
    }),
    [storageKeyPrefix, userId, userName]
  );

  return (
    <RuntimeProvider config={config}>
      <RuntimeServiceProvider config={serviceConfig}>
        {skipAccountContext ? (
          children
        ) : (
          <AccountContextProvider {...accountContextProps}>
            {children}
          </AccountContextProvider>
        )}
      </RuntimeServiceProvider>
    </RuntimeProvider>
  );
};

/**
 * DigilistProvider display name for React DevTools
 */
DigilistProvider.displayName = 'DigilistProvider';

export default DigilistProvider;
