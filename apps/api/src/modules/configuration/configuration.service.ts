/**
 * Configuration Service
 * Provides tenant configuration management
 */

export interface TenantConfiguration {
  tenantId: string;
  settings: Record<string, unknown>;
  features: Record<string, boolean>;
  branding?: {
    primaryColor?: string;
    logo?: string;
    name?: string;
  };
}

export class ConfigurationService {
  /**
   * Get tenant configuration
   */
  async getTenantConfig(tenantId: string): Promise<TenantConfiguration | null> {
    // Return default configuration - actual implementation would query database
    return {
      tenantId,
      settings: {},
      features: {
        bookings: true,
        calendar: true,
        seasons: true,
        reviews: true,
      },
    };
  }

  /**
   * Get a specific configuration value
   */
  async getConfig<T = unknown>(tenantId: string, key: string, defaultValue?: T): Promise<T> {
    const config = await this.getTenantConfig(tenantId);
    const value = config?.settings[key];
    return (value as T) ?? (defaultValue as T);
  }

  /**
   * Check if a feature is enabled
   */
  async isFeatureEnabled(tenantId: string, feature: string): Promise<boolean> {
    const config = await this.getTenantConfig(tenantId);
    return config?.features[feature] ?? false;
  }

  /**
   * Update tenant configuration
   */
  async updateConfig(tenantId: string, updates: Partial<TenantConfiguration>): Promise<TenantConfiguration> {
    // Stub - actual implementation would update database
    const current = await this.getTenantConfig(tenantId);
    return {
      ...current!,
      ...updates,
      tenantId,
    };
  }
}

// Singleton instance
let configurationServiceInstance: ConfigurationService | null = null;

export function getConfigurationService(): ConfigurationService {
  if (!configurationServiceInstance) {
    configurationServiceInstance = new ConfigurationService();
  }
  return configurationServiceInstance;
}
