/**
 * Configuration Service
 * Business logic for schema-driven configuration management
 */
import { ConfigurationRepository } from './configuration.repository';
import type {
  RentalObjectCategory,
  NewRentalObjectCategory,
  RentalObjectSubcategory,
  NewRentalObjectSubcategory,
  BookingTimeMode,
  NewBookingTimeMode,
  PricingUnit,
  NewPricingUnit,
  RentalObjectStatus,
  BookingStatus,
  SystemConfiguration,
  NewSystemConfiguration,
} from '../../database/schema';

// =============================================================================
// DTOs for API responses
// =============================================================================

export interface CategoryDTO {
  id: string;
  code: string;
  name: string;
  nameEn: string | null;
  description: string | null;
  descriptionEn: string | null;
  icon: string | null;
  examples: string[];
  subcategories?: SubcategoryDTO[];
}

export interface SubcategoryDTO {
  id: string;
  code: string;
  name: string;
  nameEn: string | null;
  description: string | null;
  icon: string | null;
}

export interface TimeModeDTO {
  id: string;
  code: string;
  name: string;
  nameEn: string | null;
  description: string | null;
  descriptionEn: string | null;
  calendarBehavior: string | null;
  icon: string | null;
}

export interface PricingUnitDTO {
  id: string;
  code: string;
  name: string;
  nameEn: string | null;
  description: string | null;
  durationMinutes: number | null;
}

export interface StatusDTO {
  id: string;
  code: string;
  name: string;
  nameEn: string | null;
  description: string | null;
  color: string | null;
  allowedTransitions: string[];
}

export interface ConfigurationDTO {
  key: string;
  value: unknown;
  valueType: string;
  description: string | null;
  isPublic: boolean;
  tenantId: string | null;
}

// =============================================================================
// Service Implementation
// =============================================================================

export class ConfigurationService {
  constructor(private readonly repository: ConfigurationRepository) {}

  // ==========================================================================
  // Categories
  // ==========================================================================

  async getCategories(includeSubcategories = false, enabledOnly = true): Promise<CategoryDTO[]> {
    const categories = await this.repository.findAllCategories(enabledOnly);
    
    if (!includeSubcategories) {
      return categories.map(this.toCategoryDTO);
    }
    
    // Fetch subcategories for each category
    const result: CategoryDTO[] = [];
    for (const category of categories) {
      const subcategories = await this.repository.findSubcategoriesByCategory(category.id, enabledOnly);
      result.push({
        ...this.toCategoryDTO(category),
        subcategories: subcategories.map(this.toSubcategoryDTO),
      });
    }
    
    return result;
  }

  async getCategoryByCode(code: string): Promise<CategoryDTO | null> {
    const category = await this.repository.findCategoryByCode(code);
    if (!category) return null;
    
    const subcategories = await this.repository.findSubcategoriesByCategory(category.id);
    return {
      ...this.toCategoryDTO(category),
      subcategories: subcategories.map(this.toSubcategoryDTO),
    };
  }

  async createCategory(data: {
    code: string;
    name: string;
    nameEn?: string;
    description?: string;
    descriptionEn?: string;
    icon?: string;
    examples?: string[];
    sortOrder?: number;
    enabled?: boolean;
  }): Promise<CategoryDTO> {
    const category = await this.repository.createCategory({
      code: data.code,
      name: data.name,
      nameEn: data.nameEn ?? null,
      description: data.description ?? null,
      descriptionEn: data.descriptionEn ?? null,
      icon: data.icon ?? null,
      examples: data.examples ?? [],
      sortOrder: data.sortOrder ?? 0,
      enabled: data.enabled ?? true,
    });
    
    return this.toCategoryDTO(category);
  }

  async updateCategory(id: string, data: Partial<{
    code: string;
    name: string;
    nameEn: string | null;
    description: string | null;
    descriptionEn: string | null;
    icon: string | null;
    examples: string[];
    sortOrder: number;
    enabled: boolean;
  }>): Promise<CategoryDTO | null> {
    const category = await this.repository.updateCategory(id, data);
    if (!category) return null;
    return this.toCategoryDTO(category);
  }

  async deleteCategory(id: string): Promise<boolean> {
    return this.repository.deleteCategory(id);
  }

  // ==========================================================================
  // Subcategories
  // ==========================================================================

  async getSubcategories(categoryCode: string, enabledOnly = true): Promise<SubcategoryDTO[]> {
    const category = await this.repository.findCategoryByCode(categoryCode);
    if (!category) return [];
    
    const subcategories = await this.repository.findSubcategoriesByCategory(category.id, enabledOnly);
    return subcategories.map(this.toSubcategoryDTO);
  }

  async createSubcategory(categoryCode: string, data: {
    code: string;
    name: string;
    nameEn?: string;
    description?: string;
    icon?: string;
    sortOrder?: number;
    enabled?: boolean;
  }): Promise<SubcategoryDTO | null> {
    const category = await this.repository.findCategoryByCode(categoryCode);
    if (!category) return null;
    
    const subcategory = await this.repository.createSubcategory({
      categoryId: category.id,
      code: data.code,
      name: data.name,
      nameEn: data.nameEn ?? null,
      description: data.description ?? null,
      icon: data.icon ?? null,
      sortOrder: data.sortOrder ?? 0,
      enabled: data.enabled ?? true,
    });
    
    return this.toSubcategoryDTO(subcategory);
  }

  async updateSubcategory(id: string, data: Partial<{
    code: string;
    name: string;
    nameEn: string | null;
    description: string | null;
    icon: string | null;
    sortOrder: number;
    enabled: boolean;
  }>): Promise<SubcategoryDTO | null> {
    const subcategory = await this.repository.updateSubcategory(id, data);
    if (!subcategory) return null;
    return this.toSubcategoryDTO(subcategory);
  }

  async deleteSubcategory(id: string): Promise<boolean> {
    return this.repository.deleteSubcategory(id);
  }

  // ==========================================================================
  // Time Modes
  // ==========================================================================

  async getTimeModes(enabledOnly = true): Promise<TimeModeDTO[]> {
    const modes = await this.repository.findAllTimeModes(enabledOnly);
    return modes.map(this.toTimeModeDTO);
  }

  async getTimeModeByCode(code: string): Promise<TimeModeDTO | null> {
    const mode = await this.repository.findTimeModeByCode(code);
    if (!mode) return null;
    return this.toTimeModeDTO(mode);
  }

  async createTimeMode(data: {
    code: string;
    name: string;
    nameEn?: string;
    description?: string;
    descriptionEn?: string;
    calendarBehavior?: string;
    icon?: string;
    sortOrder?: number;
    enabled?: boolean;
  }): Promise<TimeModeDTO> {
    const mode = await this.repository.createTimeMode({
      code: data.code,
      name: data.name,
      nameEn: data.nameEn ?? null,
      description: data.description ?? null,
      descriptionEn: data.descriptionEn ?? null,
      calendarBehavior: data.calendarBehavior ?? null,
      icon: data.icon ?? null,
      sortOrder: data.sortOrder ?? 0,
      enabled: data.enabled ?? true,
    });
    
    return this.toTimeModeDTO(mode);
  }

  async updateTimeMode(id: string, data: Partial<{
    code: string;
    name: string;
    nameEn: string | null;
    description: string | null;
    descriptionEn: string | null;
    calendarBehavior: string | null;
    icon: string | null;
    sortOrder: number;
    enabled: boolean;
  }>): Promise<TimeModeDTO | null> {
    const mode = await this.repository.updateTimeMode(id, data);
    if (!mode) return null;
    return this.toTimeModeDTO(mode);
  }

  // ==========================================================================
  // Pricing Units
  // ==========================================================================

  async getPricingUnits(enabledOnly = true): Promise<PricingUnitDTO[]> {
    const units = await this.repository.findAllPricingUnits(enabledOnly);
    return units.map(this.toPricingUnitDTO);
  }

  async getPricingUnitByCode(code: string): Promise<PricingUnitDTO | null> {
    const unit = await this.repository.findPricingUnitByCode(code);
    if (!unit) return null;
    return this.toPricingUnitDTO(unit);
  }

  async createPricingUnit(data: {
    code: string;
    name: string;
    nameEn?: string;
    description?: string;
    durationMinutes?: number;
    sortOrder?: number;
    enabled?: boolean;
  }): Promise<PricingUnitDTO> {
    const unit = await this.repository.createPricingUnit({
      code: data.code,
      name: data.name,
      nameEn: data.nameEn ?? null,
      description: data.description ?? null,
      durationMinutes: data.durationMinutes ?? null,
      sortOrder: data.sortOrder ?? 0,
      enabled: data.enabled ?? true,
    });
    
    return this.toPricingUnitDTO(unit);
  }

  // ==========================================================================
  // Statuses
  // ==========================================================================

  async getRentalObjectStatuses(enabledOnly = true): Promise<StatusDTO[]> {
    const statuses = await this.repository.findAllRentalObjectStatuses(enabledOnly);
    return statuses.map(this.toStatusDTO);
  }

  async getBookingStatuses(enabledOnly = true): Promise<StatusDTO[]> {
    const statuses = await this.repository.findAllBookingStatuses(enabledOnly);
    return statuses.map(this.toBookingStatusDTO);
  }

  // ==========================================================================
  // Validation Helpers
  // ==========================================================================

  async isValidCategoryCode(code: string): Promise<boolean> {
    const category = await this.repository.findCategoryByCode(code);
    return category !== null && Boolean(category.enabled);
  }

  async isValidSubcategoryCode(categoryCode: string, subcategoryCode: string): Promise<boolean> {
    const category = await this.repository.findCategoryByCode(categoryCode);
    if (!category || !category.enabled) return false;
    
    const subcategory = await this.repository.findSubcategoryByCode(category.id, subcategoryCode);
    return subcategory !== null && Boolean(subcategory.enabled);
  }

  async isValidTimeModeCode(code: string): Promise<boolean> {
    const mode = await this.repository.findTimeModeByCode(code);
    return mode !== null && Boolean(mode.enabled);
  }

  async isValidPricingUnitCode(code: string): Promise<boolean> {
    const unit = await this.repository.findPricingUnitByCode(code);
    return unit !== null && Boolean(unit.enabled);
  }

  async getValidCategoryCodes(): Promise<string[]> {
    const categories = await this.repository.findAllCategories(true);
    return categories.map(c => c.code);
  }

  async getValidTimeModeCodes(): Promise<string[]> {
    const modes = await this.repository.findAllTimeModes(true);
    return modes.map(m => m.code);
  }

  async getValidPricingUnitCodes(): Promise<string[]> {
    const units = await this.repository.findAllPricingUnits(true);
    return units.map(u => u.code);
  }

  // ==========================================================================
  // System Configuration
  // ==========================================================================

  async getConfiguration(key: string, tenantId?: string): Promise<ConfigurationDTO | null> {
    const config = await this.repository.findConfiguration(key, tenantId);
    if (!config) return null;
    return this.toConfigurationDTO(config);
  }

  async getConfigurations(tenantId?: string, publicOnly = false): Promise<ConfigurationDTO[]> {
    const configs = await this.repository.findAllConfigurations(tenantId, publicOnly);
    return configs.map(this.toConfigurationDTO);
  }

  async setConfiguration(data: {
    key: string;
    value: unknown;
    valueType?: string;
    description?: string;
    isPublic?: boolean;
    isEditable?: boolean;
    tenantId?: string;
  }): Promise<ConfigurationDTO> {
    const config = await this.repository.setConfiguration({
      key: data.key,
      value: data.value,
      valueType: data.valueType ?? 'json',
      description: data.description ?? null,
      isPublic: data.isPublic ?? false,
      isEditable: data.isEditable ?? true,
      tenantId: data.tenantId ?? null,
    });
    
    return this.toConfigurationDTO(config);
  }

  async deleteConfiguration(key: string, tenantId?: string): Promise<boolean> {
    return this.repository.deleteConfiguration(key, tenantId);
  }

  // ==========================================================================
  // DTO Mappers
  // ==========================================================================

  private toCategoryDTO = (category: RentalObjectCategory): CategoryDTO => ({
    id: category.id,
    code: category.code,
    name: category.name,
    nameEn: category.nameEn,
    description: category.description,
    descriptionEn: category.descriptionEn,
    icon: category.icon,
    examples: (category.examples as string[]) ?? [],
  });

  private toSubcategoryDTO = (subcategory: RentalObjectSubcategory): SubcategoryDTO => ({
    id: subcategory.id,
    code: subcategory.code,
    name: subcategory.name,
    nameEn: subcategory.nameEn,
    description: subcategory.description,
    icon: subcategory.icon,
  });

  private toTimeModeDTO = (mode: BookingTimeMode): TimeModeDTO => ({
    id: mode.id,
    code: mode.code,
    name: mode.name,
    nameEn: mode.nameEn,
    description: mode.description,
    descriptionEn: mode.descriptionEn,
    calendarBehavior: mode.calendarBehavior,
    icon: mode.icon,
  });

  private toPricingUnitDTO = (unit: PricingUnit): PricingUnitDTO => ({
    id: unit.id,
    code: unit.code,
    name: unit.name,
    nameEn: unit.nameEn,
    description: unit.description,
    durationMinutes: unit.durationMinutes,
  });

  private toStatusDTO = (status: RentalObjectStatus): StatusDTO => ({
    id: status.id,
    code: status.code,
    name: status.name,
    nameEn: status.nameEn,
    description: status.description,
    color: status.color,
    allowedTransitions: (status.allowedTransitions as string[]) ?? [],
  });

  private toBookingStatusDTO = (status: BookingStatus): StatusDTO => ({
    id: status.id,
    code: status.code,
    name: status.name,
    nameEn: status.nameEn,
    description: status.description,
    color: status.color,
    allowedTransitions: (status.allowedTransitions as string[]) ?? [],
  });

  private toConfigurationDTO = (config: SystemConfiguration): ConfigurationDTO => ({
    key: config.key,
    value: config.value,
    valueType: config.valueType,
    description: config.description,
    isPublic: Boolean(config.isPublic),
    tenantId: config.tenantId,
  });

  // =============================================================================
  // Integrations Management
  // =============================================================================

  async listIntegrations(tenantId: string) {
    return this.repository.listIntegrations(tenantId);
  }

  async getIntegration(tenantId: string, provider: string) {
    return this.repository.getIntegration(tenantId, provider);
  }

  async updateIntegration(
    tenantId: string,
    provider: string,
    data: { name?: string; status?: string; config?: Record<string, any> },
    userId?: string
  ) {
    return this.repository.updateIntegration(tenantId, provider, data, userId);
  }

  async testIntegration(tenantId: string, provider: string) {
    const integration = await this.repository.getIntegration(tenantId, provider);

    if (!integration) {
      return null;
    }

    let testResult: { success: boolean; message: string; details?: any };

    switch (provider) {
      case 'idporten':
        testResult = await this.testIdPorten(integration.config);
        break;
      case 'vipps':
        testResult = await this.testVipps(integration.config);
        break;
      default:
        testResult = {
          success: false,
          message: `Test not implemented for provider '${provider}'`,
        };
    }

    // Update integration status based on test result
    await this.repository.updateIntegrationStatus(
      tenantId,
      provider,
      testResult.success ? 'active' : 'error'
    );

    return testResult;
  }

  private async testIdPorten(config: any): Promise<{ success: boolean; message: string; details?: any }> {
    try {
      const tokenUrl = `${config.baseUrl}/auth/open/connect/token`;

      const response = await fetch(tokenUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `Basic ${Buffer.from(`${config.clientId}:${config.clientSecret}`).toString('base64')}`,
        },
        body: new URLSearchParams({
          grant_type: 'client_credentials',
          scope: config.scopes || 'signicat-api',
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        return {
          success: false,
          message: `Failed to get access token: ${error}`,
          details: { status: response.status },
        };
      }

      const data = await response.json() as { access_token?: string };
      return {
        success: true,
        message: 'Successfully connected to ID-porten/Signicat',
        details: { hasAccessToken: !!data.access_token },
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Connection failed',
      };
    }
  }

  private async testVipps(config: any): Promise<{ success: boolean; message: string; details?: any }> {
    try {
      const tokenUrl = `${config.baseUrl}/accesstoken/get`;

      const response = await fetch(tokenUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'client_id': config.clientId,
          'client_secret': config.clientSecret,
          'Ocp-Apim-Subscription-Key': config.subscriptionKey,
        },
      });

      if (!response.ok) {
        return {
          success: false,
          message: `Failed to get Vipps access token`,
          details: { status: response.status },
        };
      }

      return {
        success: true,
        message: 'Successfully connected to Vipps',
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Connection failed',
      };
    }
  }
}
