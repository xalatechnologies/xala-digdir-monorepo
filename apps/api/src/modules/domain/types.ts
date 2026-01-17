/**
 * Domain Module Types
 * 
 * Core interfaces for the pluggable domain module system.
 * Every domain module MUST implement these contracts.
 * 
 * @module domain/types
 * @since 1.0.0
 */

import type { FastifyPluginAsync } from 'fastify';

// =============================================================================
// MODULE MANIFEST
// =============================================================================

/**
 * DomainModuleManifest
 * Every pluggable domain module MUST provide this manifest
 */
export interface DomainModuleManifest {
  /**
   * Unique module identifier (e.g., 'BOOKING_RENTALS', 'WAREHOUSE', 'TICKETING')
   */
  id: string;

  /**
   * Human-readable name (i18n)
   */
  name: { en: string; nb: string };

  /**
   * Module description (i18n)
   */
  description: { en: string; nb: string };

  /**
   * Module version (semver)
   */
  version: string;

  /**
   * Module category for grouping
   */
  category: 'domain' | 'extension' | 'integration';

  /**
   * Dependencies on other modules
   */
  dependencies: string[];

  /**
   * Capabilities this module provides (for RBAC/capability checks)
   */
  capabilities: string[];

  /**
   * Is this a core module that cannot be disabled?
   * Core modules are always enabled for all tenants.
   */
  isCore: boolean;

  /**
   * Default enabled state for new tenants
   */
  defaultEnabled: boolean;

  /**
   * Module configuration schema (JSON Schema)
   */
  configSchema?: Record<string, unknown>;
}

// =============================================================================
// SCHEMA CONTRACT
// =============================================================================

/**
 * DomainModuleSchema
 * Schema contributions from a domain module
 */
export interface DomainModuleSchema {
  /**
   * Database schema namespace
   */
  schemaName: string;

  /**
   * Table names owned by this module
   */
  tables: string[];

  /**
   * Migration file paths (ordered)
   */
  migrations: string[];

  /**
   * RLS policy definitions
   */
  rlsPolicies?: RlsPolicyDefinition[];
}

export interface RlsPolicyDefinition {
  table: string;
  policyName: string;
  operation: 'SELECT' | 'INSERT' | 'UPDATE' | 'DELETE' | 'ALL';
  expression: string;
}

// =============================================================================
// POLICY CONTRACT
// =============================================================================

/**
 * DomainModulePolicies
 * Policy types provided by a domain module
 */
export interface DomainModulePolicies {
  /**
   * Policy type identifiers
   */
  policyTypes: string[];

  /**
   * JSON Schema for each policy type's rules
   */
  policySchemas: Record<string, Record<string, unknown>>;

  /**
   * Default policies for new tenants
   */
  defaultPolicies: Record<string, Record<string, unknown>>;
}

// =============================================================================
// DTO CONTRACT
// =============================================================================

/**
 * DomainModuleDTOs
 * DTO projections provided by a domain module
 */
export interface DomainModuleDTOs {
  /**
   * Projection registry entries
   */
  projections: ProjectionRegistryEntry[];

  /**
   * TypeScript interface names (for reference)
   */
  interfaces: string[];
}

export interface ProjectionRegistryEntry {
  id: string;
  entity: string;
  screens: string[];
  roles: ('public' | 'user' | 'saksbehandler' | 'admin' | 'tenantAdmin')[];
  cost: 'cheap' | 'medium' | 'heavy';
  cacheTtl: 'short' | 'medium' | 'long' | 'static';
  hasRelations: boolean;
  estimatedSize: number;
}

// =============================================================================
// ROUTE CONTRACT
// =============================================================================

/**
 * DomainModuleRoutes
 * API routes provided by a domain module
 */
export interface DomainModuleRoutes {
  /**
   * Route prefix (e.g., '/api/domain/booking-rentals')
   */
  prefix: string;

  /**
   * Fastify plugin to register routes
   */
  plugin: FastifyPluginAsync;

  /**
   * OpenAPI tags for grouping
   */
  openApiTags: string[];
}

// =============================================================================
// NAVIGATION CONTRACT
// =============================================================================

/**
 * DomainModuleNavigation
 * Navigation contributions for each frontend
 */
export interface DomainModuleNavigation {
  /**
   * Web app navigation items
   */
  web: NavContribution[];

  /**
   * Backoffice navigation items
   */
  backoffice: NavContribution[];

  /**
   * MinSide navigation items
   */
  minside: NavContribution[];
}

export interface NavContribution {
  id: string;
  label: { en: string; nb: string };
  href: string;
  icon?: string;
  requiredCapability?: string;
  order: number;
  children?: NavContribution[];
}

// =============================================================================
// SEARCH CONTRACT
// =============================================================================

/**
 * DomainModuleSearch
 * Search indexing rules for a domain module
 */
export interface DomainModuleSearch {
  /**
   * Entities that can be searched
   */
  indexableEntities: string[];

  /**
   * Field mappings for each entity
   */
  fieldMappings: Record<string, SearchFieldMapping[]>;
}

export interface SearchFieldMapping {
  field: string;
  type: 'text' | 'keyword' | 'number' | 'date' | 'geo';
  boost?: number;
  searchable: boolean;
  filterable: boolean;
}

// =============================================================================
// SEED CONTRACT
// =============================================================================

/**
 * DomainModuleSeed
 * Seed data blueprints for a domain module
 */
export interface DomainModuleSeed {
  /**
   * Entity seeding order
   */
  entityOrder: string[];

  /**
   * Demo scenarios
   */
  scenarios: SeedScenario[];
}

export interface SeedScenario {
  id: string;
  name: string;
  description: string;
  entities: Record<string, number | Record<string, unknown>[]>;
}

// =============================================================================
// DOCUMENTATION CONTRACT
// =============================================================================

/**
 * DomainModuleDocs
 * Documentation contributions for a domain module
 */
export interface DomainModuleDocs {
  /**
   * Docs sections
   */
  sections: DocSection[];

  /**
   * FAQ entries
   */
  faq: FaqEntry[];
}

export interface DocSection {
  id: string;
  title: { en: string; nb: string };
  order: number;
  mdxPath?: string;
}

export interface FaqEntry {
  question: { en: string; nb: string };
  answer: { en: string; nb: string };
  category: string;
}

// =============================================================================
// COMPLETE MODULE DEFINITION
// =============================================================================

/**
 * DomainModuleDefinition
 * Complete definition of a domain module
 */
export interface DomainModuleDefinition {
  manifest: DomainModuleManifest;
  schema?: DomainModuleSchema;
  policies?: DomainModulePolicies;
  dtos?: DomainModuleDTOs;
  routes?: DomainModuleRoutes;
  navigation?: DomainModuleNavigation;
  search?: DomainModuleSearch;
  seed?: DomainModuleSeed;
  docs?: DomainModuleDocs;
}
