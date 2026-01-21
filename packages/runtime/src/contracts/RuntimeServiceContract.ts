/**
 * Runtime Service Contract
 *
 * Generic interface for services required by @xala/runtime.
 * This allows the runtime package to be domain-agnostic by accepting
 * injected service implementations.
 *
 * Domain-specific implementations (e.g., @digilist/client-sdk)
 * must implement this interface.
 */

// =============================================================================
// Organization/Account Types
// =============================================================================

/**
 * Base organization/account type returned from service
 */
export interface OrganizationDTO {
  id: string;
  name: string;
  type?: string;
  role?: string;
  status?: string;
}

/**
 * Response wrapper for paginated data
 */
export interface PaginatedResponse<T> {
  data: T[];
  meta?: {
    total?: number;
    page?: number;
    pageSize?: number;
  };
}

// =============================================================================
// Organizations Service Contract
// =============================================================================

/**
 * Filter options for fetching organizations
 */
export interface OrganizationsFilter {
  status?: 'active' | 'inactive' | 'all';
}

/**
 * Organizations service contract.
 * Domain implementations must provide this to enable multi-account features.
 */
export interface OrganizationsServiceContract {
  /**
   * Fetch organizations for the current user
   * @param filter - Optional filter criteria
   * @returns Paginated list of organizations
   */
  getOrganizations(filter?: OrganizationsFilter): Promise<PaginatedResponse<OrganizationDTO>>;
}

// =============================================================================
// React Query Hook Contract
// =============================================================================

/**
 * React Query-style hook result
 */
export interface QueryHookResult<T> {
  data: T | undefined;
  isLoading: boolean;
  error: Error | null;
  refetch?: () => void;
}

/**
 * React hook that returns organizations
 * This is the hook-based contract for use within React components
 */
export type UseOrganizationsHook = (
  filter?: OrganizationsFilter
) => QueryHookResult<PaginatedResponse<OrganizationDTO>>;

// =============================================================================
// Runtime Service Provider Contract
// =============================================================================

/**
 * Complete runtime services contract.
 * Domain packages implement this and inject it via RuntimeServiceProvider.
 */
export interface RuntimeServiceContract {
  /**
   * Organizations service for multi-account features
   * Optional - if not provided, multi-account features are disabled
   */
  organizations?: OrganizationsServiceContract;

  /**
   * React Query hook for fetching organizations
   * Preferred over organizations service for React components
   */
  useOrganizations?: UseOrganizationsHook;
}

// =============================================================================
// Service Provider Configuration
// =============================================================================

/**
 * Configuration for RuntimeServiceProvider
 */
export interface RuntimeServiceConfig {
  /**
   * Injected services that implement the runtime contracts
   */
  services?: RuntimeServiceContract;

  /**
   * Whether to use lazy loading for SDK imports (legacy support)
   * @default false
   */
  useLazySDK?: boolean;

  /**
   * Custom lazy loader for organizations hook (legacy support)
   * Only used when useLazySDK is true and services.useOrganizations is not provided
   */
  lazyOrganizationsLoader?: () => Promise<UseOrganizationsHook>;
}
