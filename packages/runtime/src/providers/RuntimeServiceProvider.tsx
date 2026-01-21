import React, { createContext, useContext, useMemo } from 'react';
import type {
  RuntimeServiceContract,
  RuntimeServiceConfig,
  UseOrganizationsHook,
  OrganizationsFilter,
  QueryHookResult,
  PaginatedResponse,
  OrganizationDTO,
} from '../contracts';

/**
 * Runtime Service Provider
 *
 * Provides dependency injection for runtime services.
 * This allows @xala/runtime to be domain-agnostic.
 *
 * Usage:
 * ```tsx
 * import { RuntimeServiceProvider } from '@xala/runtime';
 * import { useOrganizations } from '@digilist/client-sdk/hooks';
 *
 * function App() {
 *   return (
 *     <RuntimeServiceProvider
 *       config={{
 *         services: {
 *           useOrganizations: (filter) => {
 *             const result = useOrganizations({ status: filter?.status });
 *             return { data: result.data, isLoading: result.isLoading, error: result.error };
 *           },
 *         },
 *       }}
 *     >
 *       <YourApp />
 *     </RuntimeServiceProvider>
 *   );
 * }
 * ```
 */

// =============================================================================
// Context Types
// =============================================================================

interface RuntimeServiceContextValue {
  /**
   * Injected services
   */
  services: RuntimeServiceContract;

  /**
   * Whether services are available
   */
  hasServices: boolean;

  /**
   * Whether organizations service is available
   */
  hasOrganizationsService: boolean;
}

// =============================================================================
// Context
// =============================================================================

const RuntimeServiceContext = createContext<RuntimeServiceContextValue | undefined>(undefined);

// =============================================================================
// Provider Props
// =============================================================================

export interface RuntimeServiceProviderProps {
  children: React.ReactNode;
  config?: RuntimeServiceConfig;
}

// =============================================================================
// Provider Component
// =============================================================================

export function RuntimeServiceProvider({
  children,
  config,
}: RuntimeServiceProviderProps) {
  const services = config?.services ?? {};

  const value = useMemo<RuntimeServiceContextValue>(
    () => ({
      services,
      hasServices: Object.keys(services).length > 0,
      hasOrganizationsService: !!(services.useOrganizations || services.organizations),
    }),
    [services]
  );

  return (
    <RuntimeServiceContext.Provider value={value}>
      {children}
    </RuntimeServiceContext.Provider>
  );
}

// =============================================================================
// Hook: Access Service Context
// =============================================================================

/**
 * Access runtime service context
 * @throws Error if not within RuntimeServiceProvider
 */
export function useRuntimeServices(): RuntimeServiceContextValue {
  const context = useContext(RuntimeServiceContext);

  if (!context) {
    throw new Error(
      'useRuntimeServices must be used within RuntimeServiceProvider. ' +
        'Ensure your app is wrapped with <RuntimeServiceProvider>.'
    );
  }

  return context;
}

/**
 * Access runtime service context (optional - returns undefined if not available)
 * Use this when you want graceful degradation without services
 */
export function useRuntimeServicesOptional(): RuntimeServiceContextValue | undefined {
  return useContext(RuntimeServiceContext);
}

// =============================================================================
// Hook: Use Organizations (Injected)
// =============================================================================

/**
 * Default empty hook result for when no organizations service is available
 */
const emptyOrganizationsResult: QueryHookResult<PaginatedResponse<OrganizationDTO>> = {
  data: { data: [] },
  isLoading: false,
  error: null,
};

/**
 * Use organizations from injected service
 *
 * This hook abstracts over the injected organizations service,
 * providing a consistent API regardless of the domain implementation.
 *
 * @param filter - Optional filter criteria
 * @returns Query result with organizations data
 */
export function useInjectedOrganizations(
  filter?: OrganizationsFilter
): QueryHookResult<PaginatedResponse<OrganizationDTO>> {
  const context = useContext(RuntimeServiceContext);

  // No context - return empty result
  if (!context) {
    return emptyOrganizationsResult;
  }

  const { services } = context;

  // Prefer hook-based service if available
  if (services.useOrganizations) {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    return services.useOrganizations(filter);
  }

  // No organizations service available - return empty result
  return emptyOrganizationsResult;
}

// =============================================================================
// Factory: Create Organizations Hook from Service
// =============================================================================

/**
 * Create a React Query-compatible hook from an organizations service.
 * Useful when you have a service but need a hook.
 *
 * @param service - Organizations service
 * @returns Hook function
 */
export function createOrganizationsHook(
  service: RuntimeServiceContract['organizations']
): UseOrganizationsHook | undefined {
  if (!service) return undefined;

  // Return a hook factory that uses React Query internally
  // This is a simplified version - in practice you'd use the actual React Query hook
  return function useOrganizationsFromService(
    filter?: OrganizationsFilter
  ): QueryHookResult<PaginatedResponse<OrganizationDTO>> {
    const [data, setData] = React.useState<PaginatedResponse<OrganizationDTO> | undefined>();
    const [isLoading, setIsLoading] = React.useState(true);
    const [error, setError] = React.useState<Error | null>(null);

    React.useEffect(() => {
      let cancelled = false;

      setIsLoading(true);
      setError(null);

      service
        .getOrganizations(filter)
        .then((result) => {
          if (!cancelled) {
            setData(result);
            setIsLoading(false);
          }
        })
        .catch((err) => {
          if (!cancelled) {
            setError(err instanceof Error ? err : new Error(String(err)));
            setIsLoading(false);
          }
        });

      return () => {
        cancelled = true;
      };
    }, [filter?.status]);

    return { data, isLoading, error };
  };
}
