/**
 * Domain Modules
 * 
 * Entry point for the domain module system.
 * Exports types, registry, adapters, and policy engine.
 * 
 * @module domain
 * @since 1.0.0
 */

// Types
export * from './types';

// Registry
export {
  registerDomainModule,
  getDomainModule,
  getAllDomainModules,
  getAllModuleManifests,
  isModuleRegistered,
  getModulesByCategory,
  getAllModuleCapabilities,
  getModuleByCapability,
  loadDomainModules,
  getAggregatedNavigation,
  getAggregatedRoutes,
  getAggregatedSchemas,
  getAggregatedPolicyTypes,
} from './registry';

// Adapters
export * from './adapters';

// Policy Engine
export {
  DomainPolicyEngine,
  getDomainPolicyEngine,
  resetDomainPolicyEngine,
  type PolicyEvaluationResult,
  type PolicyEvaluationContext,
  type PolicyRolloutConfig,
} from './policy-engine';

// Module IDs (constants)
export const MODULE_IDS = {
  BOOKING_RENTALS: 'BOOKING_RENTALS',
  // Future modules:
  // WAREHOUSE: 'WAREHOUSE',
  // TICKETING: 'TICKETING',
  // CASE_MANAGEMENT: 'CASE_MANAGEMENT',
} as const;

export type ModuleId = (typeof MODULE_IDS)[keyof typeof MODULE_IDS];
