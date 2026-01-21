/**
 * @xala/runtime - Service Contracts
 *
 * Generic interfaces for dependency injection.
 * Domain packages implement these contracts to provide services to runtime.
 */

export type {
  // Organization/Account types
  OrganizationDTO,
  PaginatedResponse,
  OrganizationsFilter,

  // Service contracts
  OrganizationsServiceContract,
  RuntimeServiceContract,

  // Hook contracts
  QueryHookResult,
  UseOrganizationsHook,

  // Configuration
  RuntimeServiceConfig,
} from './RuntimeServiceContract';
