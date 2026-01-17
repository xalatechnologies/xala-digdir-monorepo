/**
 * Modules Service
 * Handles module-based feature flags API operations
 */

import { BaseService } from './base.service';
import type { SingleResponse } from '../types/enums';

// =============================================================================
// Types
// =============================================================================

export interface ModuleDTO {
  key: string;
  enabled: boolean;
  config?: Record<string, unknown>;
  updatedAt?: string;
}

export interface ModuleInfoDTO {
  key: string;
  name: { no: string; en: string };
  description: { no: string; en: string };
  category: string;
  dependencies: string[];
  capabilities: string[];
  isCore: boolean;
  defaultEnabled: boolean;
}

export interface EffectiveModulesDTO {
  modules: ModuleDTO[];
  capabilities: Record<string, boolean>;
  tenantId: string;
  organizationId?: string;
}

export interface ModuleCatalogDTO {
  modules: ModuleInfoDTO[];
  capabilities: string[];
  categories: string[];
}

export interface UpdateModuleDTO {
  enabled: boolean;
  config?: Record<string, unknown>;
}

export interface FeatureDisabledError extends Error {
  type: 'FEATURE_DISABLED';
  module: string;
  tenantId?: string;
}

// =============================================================================
// Service
// =============================================================================

export class ModulesService extends BaseService {
  constructor() {
    super('/api/platform/modules');
  }

  /**
   * Get the module catalog (all available modules)
   * 
   * @example
   * ```typescript
   * const catalog = await modulesService.getCatalog();
   * console.log(`${catalog.data.modules.length} modules available`);
   * ```
   */
  async getCatalog(): Promise<SingleResponse<ModuleCatalogDTO>> {
    return this.client.get(this.buildPath());
  }

  /**
   * Get effective modules for current tenant/org
   * Returns resolved module states and computed capabilities
   * 
   * @example
   * ```typescript
   * const { data } = await modulesService.getEffective();
   * if (data.capabilities.ratings) {
   *   // Show ratings UI
   * }
   * ```
   */
  async getEffective(): Promise<SingleResponse<EffectiveModulesDTO>> {
    return this.client.get(this.buildPath('/effective'));
  }

  /**
   * Get single module state
   * 
   * @param key - Module key (e.g., 'RATINGS', 'MESSAGING')
   */
  async getModule(key: string): Promise<SingleResponse<ModuleDTO>> {
    return this.client.get(this.buildPath(`/${key}`));
  }

  /**
   * Update module state (admin only)
   * 
   * @param key - Module key
   * @param update - Enable/disable with optional config
   * 
   * @example
   * ```typescript
   * await modulesService.setModuleState('RATINGS', { enabled: true });
   * ```
   */
  async setModuleState(key: string, update: UpdateModuleDTO): Promise<SingleResponse<ModuleDTO>> {
    return this.client.put(this.buildPath(`/${key}`), update);
  }

  /**
   * Check if a module is enabled
   * Lightweight check that uses cached effective modules if available
   * 
   * @param key - Module key
   * @returns boolean indicating if module is enabled
   */
  async isModuleEnabled(key: string): Promise<boolean> {
    try {
      const { data } = await this.getModule(key);
      return data.enabled;
    } catch {
      return false;
    }
  }

  /**
   * Check if a capability is available
   * Capabilities are derived from enabled modules
   * 
   * @param capability - Capability name (e.g., 'ratings', 'messaging')
   */
  async hasCapability(capability: string): Promise<boolean> {
    try {
      const { data } = await this.getEffective();
      return data.capabilities[capability] === true;
    } catch {
      return false;
    }
  }

  /**
   * Assert that a module is enabled
   * Throws FeatureDisabledError if module is not enabled
   * Use in service methods that require a specific module
   * 
   * @param key - Module key
   * @throws FeatureDisabledError if module is disabled
   */
  async requireModule(key: string): Promise<void> {
    const isEnabled = await this.isModuleEnabled(key);
    if (!isEnabled) {
      const error = new Error(`Module '${key}' is not enabled`) as FeatureDisabledError;
      error.name = 'FeatureDisabledError';
      error.type = 'FEATURE_DISABLED';
      error.module = key;
      throw error;
    }
  }
}

// Singleton instance
export const modulesService = new ModulesService();
