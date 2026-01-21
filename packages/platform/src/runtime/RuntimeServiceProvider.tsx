import React, { createContext, useContext, type ReactNode } from 'react';

/**
 * Base result type for injected service hooks
 * Allows any data shape while requiring standard loading/error states
 */
export interface ServiceHookResult<T = unknown> {
  data: T | undefined;
  isLoading: boolean;
  error: Error | null;
}

/**
 * Service configuration for dependency injection
 *
 * This allows domain packages to inject their SDK hooks into the runtime context,
 * enabling platform components to use domain-specific services without direct coupling.
 *
 * Note: The types here are intentionally flexible to allow domain packages
 * to inject their own implementations with domain-specific return types.
 */
export interface RuntimeServiceConfig {
  services: {
    /**
     * Organization service hook
     * Domain packages inject their SDK's useOrganizations hook here
     * The data type is intentionally flexible - it can be an array, paginated response, etc.
     */
    useOrganizations?: (filter?: { status?: string }) => ServiceHookResult;
    /**
     * Additional services can be added here as needed
     * This is extensible for future domain-specific hooks
     */
    [key: string]: unknown;
  };
}

/**
 * Context value for runtime services
 */
interface RuntimeServiceContextValue {
  config: RuntimeServiceConfig;
}

/**
 * RuntimeServiceProvider props
 */
export interface RuntimeServiceProviderProps {
  /** Service configuration with injected hooks */
  config: RuntimeServiceConfig;
  /** Children to render */
  children: ReactNode;
}

/**
 * Context for runtime services (dependency injection)
 */
const RuntimeServiceContext = createContext<RuntimeServiceContextValue | null>(null);

/**
 * RuntimeServiceProvider
 *
 * A dependency injection provider that allows domain packages to inject their
 * SDK hooks into the platform runtime context. This enables platform components
 * to use domain-specific services without creating direct dependencies.
 *
 * @example
 * ```tsx
 * import { RuntimeServiceProvider } from '@xalatechnologies/platform/runtime';
 * import { useOrganizations } from '@digilist/client-sdk/hooks';
 *
 * function App() {
 *   const serviceConfig = {
 *     services: {
 *       useOrganizations: (filter) => {
 *         const result = useOrganizations({ status: filter?.status });
 *         return {
 *           data: result.data,
 *           isLoading: result.isLoading,
 *           error: result.error,
 *         };
 *       },
 *     },
 *   };
 *
 *   return (
 *     <RuntimeServiceProvider config={serviceConfig}>
 *       <MyApp />
 *     </RuntimeServiceProvider>
 *   );
 * }
 * ```
 */
export const RuntimeServiceProvider: React.FC<RuntimeServiceProviderProps> = ({
  config,
  children,
}) => {
  const contextValue: RuntimeServiceContextValue = { config };

  return (
    <RuntimeServiceContext.Provider value={contextValue}>
      {children}
    </RuntimeServiceContext.Provider>
  );
};

RuntimeServiceProvider.displayName = 'RuntimeServiceProvider';

/**
 * Hook to access the runtime service context
 *
 * @returns The runtime service configuration
 * @throws Error if used outside of RuntimeServiceProvider
 */
export function useRuntimeServices(): RuntimeServiceConfig {
  const context = useContext(RuntimeServiceContext);
  if (!context) {
    throw new Error(
      'useRuntimeServices must be used within a RuntimeServiceProvider. ' +
        'Make sure to wrap your app with RuntimeServiceProvider.'
    );
  }
  return context.config;
}

/**
 * Hook to get the injected useOrganizations service
 *
 * This allows platform components to use domain-specific organization
 * fetching without depending directly on the domain SDK.
 *
 * @returns The organizations hook result, or null if not configured
 */
export function useInjectedOrganizations(filter?: { status?: string }) {
  const context = useContext(RuntimeServiceContext);
  if (!context?.config.services.useOrganizations) {
    // Return a safe default if not configured
    return {
      data: undefined,
      isLoading: false,
      error: null,
    };
  }
  return context.config.services.useOrganizations(filter);
}

export default RuntimeServiceProvider;
