/**
 * Feature Flags Service
 * Manages tenant-controlled feature access and category permissions
 */

import { tenants } from '../database/schema';
import { eq } from 'drizzle-orm';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';

export interface TenantFeatures {
  tenantId: string;
  tenantName: string;
  enabledRentalObjectCategories: string[];
  featureFlags: Record<string, boolean>;
}

export interface UpdateTenantFeaturesDTO {
  featureFlags?: Record<string, boolean>;
  enabledRentalObjectCategories?: string[];
}

export class FeatureFlagsService {
  constructor(private db: NodePgDatabase<any>) {}

  /**
   * Get tenant features
   */
  async getTenantFeatures(tenantId: string): Promise<TenantFeatures> {
    const [tenant] = await this.db
      .select()
      .from(tenants)
      .where(eq(tenants.id, tenantId))
      .limit(1);

    if (!tenant) {
      throw new Error('Tenant not found');
    }

    // Features are stored in the 'features' jsonb field
    const features = (tenant.features as Record<string, unknown>) || {};

    return {
      tenantId: tenant.id,
      tenantName: tenant.name,
      enabledRentalObjectCategories: (features.enabledRentalObjectCategories as string[]) || ['LOCALE', 'ARRANGEMENT'],
      featureFlags: (features.featureFlags as Record<string, boolean>) || {},
    };
  }

  /**
   * Check if a feature is enabled for a tenant
   */
  async isFeatureEnabled(tenantId: string, featureKey: string): Promise<boolean> {
    const features = await this.getTenantFeatures(tenantId);
    return features.featureFlags[featureKey] === true;
  }

  /**
   * Check if a rental object category is enabled for a tenant
   */
  async isCategoryEnabled(tenantId: string, category: string): Promise<boolean> {
    const features = await this.getTenantFeatures(tenantId);
    return features.enabledRentalObjectCategories.includes(category);
  }

  /**
   * Update tenant features (SaaS Admin only)
   */
  async updateTenantFeatures(
    tenantId: string,
    updates: UpdateTenantFeaturesDTO
  ): Promise<TenantFeatures> {
    const current = await this.getTenantFeatures(tenantId);

    // Build updated features object
    const updatedFeatures: Record<string, unknown> = {
      featureFlags: current.featureFlags,
      enabledRentalObjectCategories: current.enabledRentalObjectCategories,
    };

    if (updates.featureFlags) {
      updatedFeatures.featureFlags = {
        ...current.featureFlags,
        ...updates.featureFlags,
      };
    }

    if (updates.enabledRentalObjectCategories) {
      updatedFeatures.enabledRentalObjectCategories = updates.enabledRentalObjectCategories;
    }

    await this.db
      .update(tenants)
      .set({ features: updatedFeatures, updatedAt: new Date() })
      .where(eq(tenants.id, tenantId));

    return this.getTenantFeatures(tenantId);
  }

  /**
   * Get all enabled categories for a tenant
   */
  async getEnabledCategories(tenantId: string): Promise<string[]> {
    const features = await this.getTenantFeatures(tenantId);
    return features.enabledRentalObjectCategories;
  }

  /**
   * Validate that a category is enabled, throw error if not
   */
  async requireCategory(tenantId: string, category: string): Promise<void> {
    const isEnabled = await this.isCategoryEnabled(tenantId, category);
    
    if (!isEnabled) {
      throw {
        statusCode: 403,
        type: 'https://api.digilist.no/errors/category-disabled',
        title: 'Category Disabled',
        detail: `The rental object category '${category}' is not enabled for your organization.`,
      };
    }
  }

  /**
   * Validate that a feature is enabled, throw error if not
   */
  async requireFeature(tenantId: string, featureKey: string): Promise<void> {
    const isEnabled = await this.isFeatureEnabled(tenantId, featureKey);
    
    if (!isEnabled) {
      throw {
        statusCode: 403,
        type: 'https://api.digilist.no/errors/feature-disabled',
        title: 'Feature Disabled',
        detail: `The feature '${featureKey}' is not enabled for your organization.`,
      };
    }
  }
}

// Note: Service requires db instance - instantiate in main.ts with container
// export const featureFlagsService = new FeatureFlagsService(db);
