/**
 * Module DTOs
 * Data transfer objects for module-related API operations
 */

import type { ModuleCategory } from './registry';

// =============================================================================
// Module DTOs
// =============================================================================

/**
 * Module state for a single tenant
 */
export interface ModuleDTO {
  /** Module key */
  key: string;
  /** Whether module is enabled */
  enabled: boolean;
  /** Module configuration */
  config?: Record<string, unknown>;
  /** Last updated timestamp */
  updatedAt?: string;
}

/**
 * Full module info including metadata
 */
export interface ModuleInfoDTO {
  /** Module key */
  key: string;
  /** Localized name */
  name: { no: string; en: string };
  /** Localized description */
  description: { no: string; en: string };
  /** Module category */
  category: ModuleCategory;
  /** Module dependencies */
  dependencies: string[];
  /** Capabilities provided */
  capabilities: string[];
  /** Whether this is a core module */
  isCore: boolean;
  /** Default enabled state */
  defaultEnabled: boolean;
}

/**
 * Effective modules response for current user/tenant
 */
export interface EffectiveModulesDTO {
  /** Effective module states */
  modules: ModuleDTO[];
  /** Computed capabilities from enabled modules */
  capabilities: Record<string, boolean>;
  /** Tenant ID */
  tenantId: string;
  /** Organization ID (if org-level override) */
  organizationId?: string;
}

/**
 * Module catalog response
 */
export interface ModuleCatalogDTO {
  /** All available modules */
  modules: ModuleInfoDTO[];
  /** All capability names */
  capabilities: string[];
  /** Categories */
  categories: ModuleCategory[];
}

/**
 * Request to update module state
 */
export interface UpdateModuleDTO {
  /** Enable or disable module */
  enabled: boolean;
  /** Optional configuration */
  config?: Record<string, unknown>;
}

/**
 * Bulk update modules request
 */
export interface BulkUpdateModulesDTO {
  /** Module updates */
  updates: Array<{
    key: string;
    enabled: boolean;
    config?: Record<string, unknown>;
  }>;
  /** Whether to cascade disable dependents */
  cascadeDisable?: boolean;
}

/**
 * RFC7807 Problem Details for feature disabled error
 */
export interface FeatureDisabledProblemDetails {
  type: 'https://api.digilist.no/errors/feature-disabled';
  title: 'Feature Disabled';
  status: 403;
  detail: string;
  instance: string;
  /** Module key that is disabled */
  module: string;
  /** Tenant ID */
  tenantId?: string;
}

/**
 * Module audit entry
 */
export interface ModuleAuditDTO {
  id: string;
  tenantId: string;
  moduleKey: string;
  actorUserId: string;
  oldState: { enabled: boolean; config?: Record<string, unknown> } | null;
  newState: { enabled: boolean; config?: Record<string, unknown> };
  createdAt: string;
}

/**
 * Validation result when enabling/disabling modules
 */
export interface ModuleValidationResult {
  valid: boolean;
  errors: Array<{
    code: 'MISSING_DEPENDENCY' | 'DEPENDENT_ENABLED' | 'CORE_MODULE';
    message: string;
    moduleKey: string;
    relatedModules?: string[];
  }>;
}
