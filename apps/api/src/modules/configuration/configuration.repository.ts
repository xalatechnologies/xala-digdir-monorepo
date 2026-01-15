/**
 * Configuration Repository
 * Database operations for schema-driven configuration tables
 */
import { eq, and, isNull, asc } from 'drizzle-orm';
import {
  rentalObjectCategories,
  rentalObjectSubcategories,
  bookingTimeModes,
  pricingUnits,
  rentalObjectStatuses,
  bookingStatuses,
  systemConfigurations,
  integrations,
  type RentalObjectCategory,
  type NewRentalObjectCategory,
  type RentalObjectSubcategory,
  type NewRentalObjectSubcategory,
  type BookingTimeMode,
  type NewBookingTimeMode,
  type PricingUnit,
  type NewPricingUnit,
  type RentalObjectStatus,
  type NewRentalObjectStatus,
  type BookingStatus,
  type NewBookingStatus,
  type SystemConfiguration,
  type NewSystemConfiguration,
} from '../../database/schema';

export class ConfigurationRepository {
  // Using 'any' for db type to avoid generic parameter compatibility issues with Drizzle
  constructor(private readonly db: any) {}

  // ==========================================================================
  // Rental Object Categories
  // ==========================================================================

  async findAllCategories(enabledOnly = true): Promise<RentalObjectCategory[]> {
    const query = this.db.select().from(rentalObjectCategories);
    
    if (enabledOnly) {
      return query.where(eq(rentalObjectCategories.enabled, true)).orderBy(asc(rentalObjectCategories.sortOrder));
    }
    
    return query.orderBy(asc(rentalObjectCategories.sortOrder));
  }

  async findCategoryByCode(code: string): Promise<RentalObjectCategory | null> {
    const results = await this.db
      .select()
      .from(rentalObjectCategories)
      .where(eq(rentalObjectCategories.code, code))
      .limit(1);
    
    return results[0] ?? null;
  }

  async findCategoryById(id: string): Promise<RentalObjectCategory | null> {
    const results = await this.db
      .select()
      .from(rentalObjectCategories)
      .where(eq(rentalObjectCategories.id, id))
      .limit(1);
    
    return results[0] ?? null;
  }

  async createCategory(data: NewRentalObjectCategory): Promise<RentalObjectCategory> {
    const results = await this.db
      .insert(rentalObjectCategories)
      .values(data)
      .returning();
    
    return results[0] as RentalObjectCategory;
  }

  async updateCategory(id: string, data: Partial<NewRentalObjectCategory>): Promise<RentalObjectCategory | null> {
    const results = await this.db
      .update(rentalObjectCategories)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(rentalObjectCategories.id, id))
      .returning();
    
    return results[0] ?? null;
  }

  async deleteCategory(id: string): Promise<boolean> {
    const results = await this.db
      .delete(rentalObjectCategories)
      .where(eq(rentalObjectCategories.id, id))
      .returning();
    
    return results.length > 0;
  }

  // ==========================================================================
  // Rental Object Subcategories
  // ==========================================================================

  async findSubcategoriesByCategory(categoryId: string, enabledOnly = true): Promise<RentalObjectSubcategory[]> {
    const query = this.db
      .select()
      .from(rentalObjectSubcategories)
      .where(eq(rentalObjectSubcategories.categoryId, categoryId));
    
    if (enabledOnly) {
      return this.db
        .select()
        .from(rentalObjectSubcategories)
        .where(and(
          eq(rentalObjectSubcategories.categoryId, categoryId),
          eq(rentalObjectSubcategories.enabled, true)
        ))
        .orderBy(asc(rentalObjectSubcategories.sortOrder));
    }
    
    return query.orderBy(asc(rentalObjectSubcategories.sortOrder));
  }

  async findSubcategoryByCode(categoryId: string, code: string): Promise<RentalObjectSubcategory | null> {
    const results = await this.db
      .select()
      .from(rentalObjectSubcategories)
      .where(and(
        eq(rentalObjectSubcategories.categoryId, categoryId),
        eq(rentalObjectSubcategories.code, code)
      ))
      .limit(1);
    
    return results[0] ?? null;
  }

  async createSubcategory(data: NewRentalObjectSubcategory): Promise<RentalObjectSubcategory> {
    const results = await this.db
      .insert(rentalObjectSubcategories)
      .values(data)
      .returning();
    
    return results[0] as RentalObjectSubcategory;
  }

  async updateSubcategory(id: string, data: Partial<NewRentalObjectSubcategory>): Promise<RentalObjectSubcategory | null> {
    const results = await this.db
      .update(rentalObjectSubcategories)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(rentalObjectSubcategories.id, id))
      .returning();
    
    return results[0] ?? null;
  }

  async deleteSubcategory(id: string): Promise<boolean> {
    const results = await this.db
      .delete(rentalObjectSubcategories)
      .where(eq(rentalObjectSubcategories.id, id))
      .returning();
    
    return results.length > 0;
  }

  // ==========================================================================
  // Booking Time Modes
  // ==========================================================================

  async findAllTimeModes(enabledOnly = true): Promise<BookingTimeMode[]> {
    if (enabledOnly) {
      return this.db
        .select()
        .from(bookingTimeModes)
        .where(eq(bookingTimeModes.enabled, true))
        .orderBy(asc(bookingTimeModes.sortOrder));
    }
    
    return this.db
      .select()
      .from(bookingTimeModes)
      .orderBy(asc(bookingTimeModes.sortOrder));
  }

  async findTimeModeByCode(code: string): Promise<BookingTimeMode | null> {
    const results = await this.db
      .select()
      .from(bookingTimeModes)
      .where(eq(bookingTimeModes.code, code))
      .limit(1);
    
    return results[0] ?? null;
  }

  async createTimeMode(data: NewBookingTimeMode): Promise<BookingTimeMode> {
    const results = await this.db
      .insert(bookingTimeModes)
      .values(data)
      .returning();
    
    return results[0] as BookingTimeMode;
  }

  async updateTimeMode(id: string, data: Partial<NewBookingTimeMode>): Promise<BookingTimeMode | null> {
    const results = await this.db
      .update(bookingTimeModes)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(bookingTimeModes.id, id))
      .returning();
    
    return results[0] ?? null;
  }

  // ==========================================================================
  // Pricing Units
  // ==========================================================================

  async findAllPricingUnits(enabledOnly = true): Promise<PricingUnit[]> {
    if (enabledOnly) {
      return this.db
        .select()
        .from(pricingUnits)
        .where(eq(pricingUnits.enabled, true))
        .orderBy(asc(pricingUnits.sortOrder));
    }
    
    return this.db
      .select()
      .from(pricingUnits)
      .orderBy(asc(pricingUnits.sortOrder));
  }

  async findPricingUnitByCode(code: string): Promise<PricingUnit | null> {
    const results = await this.db
      .select()
      .from(pricingUnits)
      .where(eq(pricingUnits.code, code))
      .limit(1);
    
    return results[0] ?? null;
  }

  async createPricingUnit(data: NewPricingUnit): Promise<PricingUnit> {
    const results = await this.db
      .insert(pricingUnits)
      .values(data)
      .returning();
    
    return results[0] as PricingUnit;
  }

  async updatePricingUnit(id: string, data: Partial<NewPricingUnit>): Promise<PricingUnit | null> {
    const results = await this.db
      .update(pricingUnits)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(pricingUnits.id, id))
      .returning();
    
    return results[0] ?? null;
  }

  // ==========================================================================
  // Rental Object Statuses
  // ==========================================================================

  async findAllRentalObjectStatuses(enabledOnly = true): Promise<RentalObjectStatus[]> {
    if (enabledOnly) {
      return this.db
        .select()
        .from(rentalObjectStatuses)
        .where(eq(rentalObjectStatuses.enabled, true))
        .orderBy(asc(rentalObjectStatuses.sortOrder));
    }
    
    return this.db
      .select()
      .from(rentalObjectStatuses)
      .orderBy(asc(rentalObjectStatuses.sortOrder));
  }

  async findRentalObjectStatusByCode(code: string): Promise<RentalObjectStatus | null> {
    const results = await this.db
      .select()
      .from(rentalObjectStatuses)
      .where(eq(rentalObjectStatuses.code, code))
      .limit(1);
    
    return results[0] ?? null;
  }

  async createRentalObjectStatus(data: NewRentalObjectStatus): Promise<RentalObjectStatus> {
    const results = await this.db
      .insert(rentalObjectStatuses)
      .values(data)
      .returning();
    
    return results[0] as RentalObjectStatus;
  }

  // ==========================================================================
  // Booking Statuses
  // ==========================================================================

  async findAllBookingStatuses(enabledOnly = true): Promise<BookingStatus[]> {
    if (enabledOnly) {
      return this.db
        .select()
        .from(bookingStatuses)
        .where(eq(bookingStatuses.enabled, true))
        .orderBy(asc(bookingStatuses.sortOrder));
    }
    
    return this.db
      .select()
      .from(bookingStatuses)
      .orderBy(asc(bookingStatuses.sortOrder));
  }

  async findBookingStatusByCode(code: string): Promise<BookingStatus | null> {
    const results = await this.db
      .select()
      .from(bookingStatuses)
      .where(eq(bookingStatuses.code, code))
      .limit(1);
    
    return results[0] ?? null;
  }

  async createBookingStatus(data: NewBookingStatus): Promise<BookingStatus> {
    const results = await this.db
      .insert(bookingStatuses)
      .values(data)
      .returning();
    
    return results[0] as BookingStatus;
  }

  // ==========================================================================
  // System Configurations
  // ==========================================================================

  async findConfiguration(key: string, tenantId?: string | null): Promise<SystemConfiguration | null> {
    // First try tenant-specific, then fall back to global
    if (tenantId) {
      const tenantResult = await this.db
        .select()
        .from(systemConfigurations)
        .where(and(
          eq(systemConfigurations.key, key),
          eq(systemConfigurations.tenantId, tenantId)
        ))
        .limit(1);
      
      if (tenantResult[0]) {
        return tenantResult[0];
      }
    }
    
    // Fall back to global configuration
    const globalResult = await this.db
      .select()
      .from(systemConfigurations)
      .where(and(
        eq(systemConfigurations.key, key),
        isNull(systemConfigurations.tenantId)
      ))
      .limit(1);
    
    return globalResult[0] ?? null;
  }

  async findAllConfigurations(tenantId?: string | null, publicOnly = false): Promise<SystemConfiguration[]> {
    let conditions = [];
    
    if (tenantId) {
      // Get both tenant-specific and global configs
      conditions.push(eq(systemConfigurations.tenantId, tenantId));
    } else {
      conditions.push(isNull(systemConfigurations.tenantId));
    }
    
    if (publicOnly) {
      conditions.push(eq(systemConfigurations.isPublic, true));
    }
    
    return this.db
      .select()
      .from(systemConfigurations)
      .where(and(...conditions));
  }

  async setConfiguration(data: NewSystemConfiguration): Promise<SystemConfiguration> {
    // Upsert - update if exists, insert if not
    const existing = await this.findConfiguration(data.key, data.tenantId);
    
    if (existing) {
      const results = await this.db
        .update(systemConfigurations)
        .set({ ...data, updatedAt: new Date() })
        .where(eq(systemConfigurations.id, existing.id))
        .returning();
      
      return results[0] as SystemConfiguration;
    }
    
    const results = await this.db
      .insert(systemConfigurations)
      .values(data)
      .returning();
    
    return results[0] as SystemConfiguration;
  }

  async deleteConfiguration(key: string, tenantId?: string | null): Promise<boolean> {
    let conditions = [eq(systemConfigurations.key, key)];

    if (tenantId) {
      conditions.push(eq(systemConfigurations.tenantId, tenantId));
    } else {
      conditions.push(isNull(systemConfigurations.tenantId));
    }

    const results = await this.db
      .delete(systemConfigurations)
      .where(and(...conditions))
      .returning();

    return results.length > 0;
  }

  // ==========================================================================
  // Integrations
  // ==========================================================================

  async listIntegrations(tenantId: string) {
    const results = await this.db
      .select()
      .from(integrations)
      .where(eq(integrations.tenantId, tenantId))
      .orderBy(integrations.provider);

    // Mask sensitive fields
    return results.map((integration: any) => ({
      ...integration,
      config: this.maskSensitiveFields(integration.config),
    }));
  }

  async getIntegration(tenantId: string, provider: string) {
    const results = await this.db
      .select()
      .from(integrations)
      .where(and(
        eq(integrations.tenantId, tenantId),
        eq(integrations.provider, provider)
      ))
      .limit(1);

    if (results.length === 0) return null;

    return {
      ...results[0],
      config: this.maskSensitiveFields(results[0].config),
    };
  }

  async updateIntegration(
    tenantId: string,
    provider: string,
    data: { name?: string; status?: string; config?: Record<string, any> },
    userId?: string
  ) {
    // Get existing config
    const existing = await this.db
      .select()
      .from(integrations)
      .where(and(
        eq(integrations.tenantId, tenantId),
        eq(integrations.provider, provider)
      ))
      .limit(1);

    if (existing.length === 0) return null;

    // Merge config (don't overwrite masked values)
    const mergedConfig = { ...existing[0].config };
    if (data.config) {
      for (const [key, value] of Object.entries(data.config)) {
        if (value !== '***' && value !== '') {
          mergedConfig[key] = value;
        }
      }
    }

    const results = await this.db
      .update(integrations)
      .set({
        ...(data.name && { name: data.name }),
        ...(data.status && { status: data.status }),
        config: mergedConfig,
        updatedAt: new Date(),
        updatedBy: userId || null,
      })
      .where(and(
        eq(integrations.tenantId, tenantId),
        eq(integrations.provider, provider)
      ))
      .returning();

    if (results.length === 0) return null;

    return {
      ...results[0],
      config: this.maskSensitiveFields(results[0].config),
    };
  }

  async updateIntegrationStatus(tenantId: string, provider: string, status: string) {
    await this.db
      .update(integrations)
      .set({
        status,
        updatedAt: new Date(),
      })
      .where(and(
        eq(integrations.tenantId, tenantId),
        eq(integrations.provider, provider)
      ));
  }

  private maskSensitiveFields(config: any): any {
    const sensitiveFields = ['clientSecret', 'apiKey', 'webhookSecret', 'password', 'subscriptionKey'];
    const masked = { ...config };

    for (const field of sensitiveFields) {
      if (masked[field]) {
        masked[field] = '***';
      }
    }

    return masked;
  }
}
