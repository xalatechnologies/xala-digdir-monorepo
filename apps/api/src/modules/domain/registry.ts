/**
 * Domain Module Registry
 * 
 * Central registry for all domain modules.
 * Modules register themselves here and the platform can query them.
 * 
 * @module domain/registry
 * @since 1.0.0
 */

import type { DomainModuleDefinition, DomainModuleManifest } from './types';

// =============================================================================
// MODULE REGISTRY
// =============================================================================

/**
 * In-memory module registry
 * Modules are registered at startup
 */
const moduleRegistry = new Map<string, DomainModuleDefinition>();

/**
 * Register a domain module
 * Called by each domain module during initialization
 */
export function registerDomainModule(module: DomainModuleDefinition): void {
  if (moduleRegistry.has(module.manifest.id)) {
    console.warn(`Domain module '${module.manifest.id}' is already registered. Overwriting.`);
  }
  moduleRegistry.set(module.manifest.id, module);
  console.log(`Registered domain module: ${module.manifest.id} v${module.manifest.version}`);
}

/**
 * Get a domain module by ID
 */
export function getDomainModule(id: string): DomainModuleDefinition | undefined {
  return moduleRegistry.get(id);
}

/**
 * Get all registered domain modules
 */
export function getAllDomainModules(): DomainModuleDefinition[] {
  return Array.from(moduleRegistry.values());
}

/**
 * Get all module manifests
 */
export function getAllModuleManifests(): DomainModuleManifest[] {
  return getAllDomainModules().map((m) => m.manifest);
}

/**
 * Check if a module is registered
 */
export function isModuleRegistered(id: string): boolean {
  return moduleRegistry.has(id);
}

/**
 * Get modules by category
 */
export function getModulesByCategory(
  category: 'domain' | 'extension' | 'integration'
): DomainModuleDefinition[] {
  return getAllDomainModules().filter((m) => m.manifest.category === category);
}

/**
 * Get all capabilities provided by registered modules
 */
export function getAllModuleCapabilities(): string[] {
  const capabilities = new Set<string>();
  for (const module of getAllDomainModules()) {
    for (const cap of module.manifest.capabilities) {
      capabilities.add(cap);
    }
  }
  return Array.from(capabilities);
}

/**
 * Get the module that provides a specific capability
 */
export function getModuleByCapability(capability: string): DomainModuleDefinition | undefined {
  return getAllDomainModules().find((m) => m.manifest.capabilities.includes(capability));
}

// =============================================================================
// MODULE LOADER
// =============================================================================

/**
 * Load and register all domain modules
 * Called at application startup
 */
export async function loadDomainModules(): Promise<void> {
  // Import and register each domain module
  // Modules are loaded dynamically to support future plugin architecture
  
  try {
    // BOOKING_RENTALS is always loaded (it's the core domain)
    const bookingRentalsModule = await import('./booking-rentals');
    registerDomainModule(bookingRentalsModule.default);
  } catch (error) {
    console.error('Failed to load booking-rentals module:', error);
  }

  // Future modules would be loaded here:
  // const warehouseModule = await import('./warehouse');
  // registerDomainModule(warehouseModule.default);
  
  console.log(`Loaded ${moduleRegistry.size} domain module(s)`);
}

// =============================================================================
// NAVIGATION AGGREGATION
// =============================================================================

/**
 * Get aggregated navigation for a specific app
 */
export function getAggregatedNavigation(
  app: 'web' | 'backoffice' | 'minside',
  enabledModules: string[]
): Array<{ moduleId: string; items: DomainModuleDefinition['navigation'] }> {
  return getAllDomainModules()
    .filter((m) => enabledModules.includes(m.manifest.id))
    .filter((m) => m.navigation)
    .map((m) => ({
      moduleId: m.manifest.id,
      items: m.navigation,
    }));
}

// =============================================================================
// ROUTE AGGREGATION
// =============================================================================

/**
 * Get all routes from enabled modules
 */
export function getAggregatedRoutes(
  enabledModules: string[]
): Array<{ moduleId: string; routes: DomainModuleDefinition['routes'] }> {
  return getAllDomainModules()
    .filter((m) => enabledModules.includes(m.manifest.id))
    .filter((m) => m.routes)
    .map((m) => ({
      moduleId: m.manifest.id,
      routes: m.routes,
    }));
}

// =============================================================================
// SCHEMA AGGREGATION
// =============================================================================

/**
 * Get all schema contributions from domain modules
 */
export function getAggregatedSchemas(): Array<{
  moduleId: string;
  schema: DomainModuleDefinition['schema'];
}> {
  return getAllDomainModules()
    .filter((m) => m.schema)
    .map((m) => ({
      moduleId: m.manifest.id,
      schema: m.schema,
    }));
}

// =============================================================================
// POLICY AGGREGATION
// =============================================================================

/**
 * Get all policy types from domain modules
 */
export function getAggregatedPolicyTypes(): Array<{
  moduleId: string;
  policyTypes: string[];
}> {
  return getAllDomainModules()
    .filter((m) => m.policies)
    .map((m) => ({
      moduleId: m.manifest.id,
      policyTypes: m.policies!.policyTypes,
    }));
}
