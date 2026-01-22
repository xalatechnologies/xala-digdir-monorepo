/**
 * Modules Service
 * Manages module-based feature flags with dependency validation and audit logging
 */

import { eq, and } from 'drizzle-orm';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { tenants } from '../database/schema';
import { modules, tenantModules, orgModules, moduleAudit } from '../database/schema/modules';
import {
  MODULE_REGISTRY,
  computeCapabilities,
  getModuleDependents,
  type ModuleKeyType,
  type ModuleDTO,
  type EffectiveModulesDTO,
  type ModuleCatalogDTO,
  type ModuleInfoDTO,
  type ModuleValidationResult,
  type UpdateModuleDTO,
} from '../types/modules';

// =============================================================================
// Types
// =============================================================================

export interface ModuleContext {
  tenantId: string;
  orgId?: string;
  userId?: string;
}

// =============================================================================
// Service
// =============================================================================

export class ModulesService {
  constructor(private db: NodePgDatabase<any>) {}

  /**
   * Get the module catalog (all available modules)
   */
  async getModuleCatalog(): Promise<ModuleCatalogDTO> {
    const moduleInfos: ModuleInfoDTO[] = Object.values(MODULE_REGISTRY).map((mod) => ({
      key: mod.key,
      name: mod.name,
      description: mod.description,
      category: mod.category,
      dependencies: mod.dependencies,
      capabilities: mod.capabilities,
      isCore: mod.isCore,
      defaultEnabled: mod.defaultEnabled,
    }));

    const allCapabilities = new Set<string>();
    for (const mod of Object.values(MODULE_REGISTRY)) {
      for (const cap of mod.capabilities) {
        allCapabilities.add(cap);
      }
    }

    const categories = [...new Set(Object.values(MODULE_REGISTRY).map((m) => m.category))];

    return {
      modules: moduleInfos,
      capabilities: Array.from(allCapabilities).sort(),
      categories,
    };
  }

  /**
   * Get effective modules for a tenant (with optional org override)
   */
  async getEffectiveModules(context: ModuleContext): Promise<EffectiveModulesDTO> {
    const { tenantId, orgId } = context;

    // Get tenant-level module overrides using direct select
    const tenantOverrides = await this.db
      .select()
      .from(tenantModules)
      .where(eq(tenantModules.tenantId, tenantId));

    // Get org-level overrides if applicable
    let orgOverrides: typeof tenantOverrides = [];
    if (orgId) {
      orgOverrides = await this.db
        .select()
        .from(orgModules)
        .where(eq(orgModules.orgId, orgId));
    }

    // Build effective module state
    const moduleStates: ModuleDTO[] = [];
    const enabledModuleKeys: ModuleKeyType[] = [];

    for (const [key, definition] of Object.entries(MODULE_REGISTRY)) {
      const moduleKey = key as ModuleKeyType;
      
      // Start with default state
      let enabled = definition.isCore || definition.defaultEnabled;
      let config: Record<string, unknown> = {};
      let updatedAt: string | undefined;

      // Apply tenant override
      const tenantOverride = tenantOverrides.find((o) => o.moduleKey === moduleKey);
      if (tenantOverride) {
        enabled = tenantOverride.isEnabled;
        config = (tenantOverride.config as Record<string, unknown>) || {};
        updatedAt = tenantOverride.updatedAt?.toISOString();
      }

      // Apply org override (takes precedence)
      if (orgId) {
        const orgOverride = orgOverrides.find((o) => o.moduleKey === moduleKey);
        if (orgOverride) {
          enabled = orgOverride.isEnabled;
          config = (orgOverride.config as Record<string, unknown>) || {};
          updatedAt = orgOverride.updatedAt?.toISOString();
        }
      }

      // Core modules are always enabled
      if (definition.isCore) {
        enabled = true;
      }

      moduleStates.push({ key: moduleKey, enabled, config, updatedAt });

      if (enabled) {
        enabledModuleKeys.push(moduleKey);
      }
    }

    // Compute capabilities from enabled modules
    const capabilities = computeCapabilities(enabledModuleKeys);

    return {
      modules: moduleStates,
      capabilities,
      tenantId,
      organizationId: orgId,
    };
  }

  /**
   * Check if a specific module is enabled
   */
  async isModuleEnabled(context: ModuleContext, moduleKey: string): Promise<boolean> {
    const effective = await this.getEffectiveModules(context);
    const module = effective.modules.find((m) => m.key === moduleKey);
    return module?.enabled ?? false;
  }

  /**
   * Check if a capability is available
   */
  async hasCapability(context: ModuleContext, capability: string): Promise<boolean> {
    const effective = await this.getEffectiveModules(context);
    return effective.capabilities[capability] === true;
  }

  /**
   * Require a module to be enabled, throw RFC7807 error if not
   */
  async requireModule(context: ModuleContext, moduleKey: string): Promise<void> {
    const isEnabled = await this.isModuleEnabled(context, moduleKey);

    if (!isEnabled) {
      const module = MODULE_REGISTRY[moduleKey as ModuleKeyType];
      throw {
        type: 'https://api.digilist.no/errors/feature-disabled',
        title: 'Feature Disabled',
        status: 403,
        detail: module
          ? `The module '${module.name.en}' is not enabled for this tenant.`
          : `The module '${moduleKey}' is not enabled.`,
        instance: '/api/platform/modules',
        module: moduleKey,
        tenantId: context.tenantId,
      };
    }
  }

  /**
   * Validate that a module can be enabled/disabled
   */
  validateModuleChange(
    moduleKey: string,
    enabled: boolean,
    currentEnabledModules: Set<string>
  ): ModuleValidationResult {
    const errors: ModuleValidationResult['errors'] = [];
    const module = MODULE_REGISTRY[moduleKey as ModuleKeyType];

    if (!module) {
      return { valid: false, errors: [{ code: 'MISSING_DEPENDENCY', message: 'Module not found', moduleKey }] };
    }

    if (module.isCore && !enabled) {
      errors.push({
        code: 'CORE_MODULE',
        message: `Cannot disable core module '${module.name.en}'`,
        moduleKey,
      });
    }

    if (enabled) {
      // Check all dependencies are enabled
      const missingDeps = module.dependencies.filter((dep) => !currentEnabledModules.has(dep));
      if (missingDeps.length > 0) {
        errors.push({
          code: 'MISSING_DEPENDENCY',
          message: `Module '${module.name.en}' requires: ${missingDeps.join(', ')}`,
          moduleKey,
          relatedModules: missingDeps,
        });
      }
    } else {
      // Check no dependents are enabled
      const dependents = getModuleDependents(moduleKey as ModuleKeyType);
      const enabledDependents = dependents.filter((dep) => currentEnabledModules.has(dep));
      if (enabledDependents.length > 0) {
        errors.push({
          code: 'DEPENDENT_ENABLED',
          message: `Cannot disable '${module.name.en}' while dependents are enabled: ${enabledDependents.join(', ')}`,
          moduleKey,
          relatedModules: enabledDependents,
        });
      }
    }

    return { valid: errors.length === 0, errors };
  }

  /**
   * Set module state for a tenant
   */
  async setModuleState(
    context: ModuleContext & { actorUserId: string },
    moduleKey: string,
    update: UpdateModuleDTO
  ): Promise<ModuleDTO> {
    const { tenantId, actorUserId } = context;

    // Get current state using direct select
    const currentResults = await this.db
      .select()
      .from(tenantModules)
      .where(and(eq(tenantModules.tenantId, tenantId), eq(tenantModules.moduleKey, moduleKey)))
      .limit(1);
    const current = currentResults[0];

    // Get all current enabled modules for validation
    const effective = await this.getEffectiveModules({ tenantId });
    const currentEnabled = new Set(effective.modules.filter((m) => m.enabled).map((m) => m.key));

    // Validate change
    const validation = this.validateModuleChange(moduleKey, update.enabled, currentEnabled);
    if (!validation.valid) {
      throw {
        type: 'https://api.digilist.no/errors/validation-error',
        title: 'Validation Error',
        status: 400,
        detail: validation.errors[0].message,
        errors: validation.errors,
      };
    }

    const now = new Date();
    const oldState = current
      ? { enabled: current.isEnabled, config: current.config as Record<string, unknown> }
      : null;
    const newState = { enabled: update.enabled, config: update.config || {} };

    // Upsert tenant module
    if (current) {
      await this.db
        .update(tenantModules)
        .set({
          isEnabled: update.enabled,
          config: update.config || {},
          updatedAt: now,
          updatedBy: actorUserId,
        })
        .where(and(eq(tenantModules.tenantId, tenantId), eq(tenantModules.moduleKey, moduleKey)));
    } else {
      await this.db.insert(tenantModules).values({
        tenantId,
        moduleKey,
        isEnabled: update.enabled,
        config: update.config || {},
        updatedAt: now,
        updatedBy: actorUserId,
      });
    }

    // Audit log
    await this.db.insert(moduleAudit).values({
      tenantId,
      moduleKey,
      actorUserId,
      action: update.enabled ? 'enable' : 'disable',
      oldState,
      newState,
      createdAt: now,
    });

    return {
      key: moduleKey,
      enabled: update.enabled,
      config: update.config,
      updatedAt: now.toISOString(),
    };
  }
}
