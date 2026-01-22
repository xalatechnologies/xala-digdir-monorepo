/**
 * Rental Object Service
 * Business logic for rental objects (utleieobjekter) domain
 */
import { Injectable, Inject } from '../../core/decorators';
import { RentalObjectRepository } from './rental-object.repository';
import { validate } from '../../core/validation/zod-pipe';
import { getAuditService } from '../../core/audit/audit.service';
import {
  CreateRentalObjectSchema,
  UpdateRentalObjectSchema,
  RentalObjectQuerySchema,
  type CreateRentalObjectDTO,
  type UpdateRentalObjectDTO,
  type RentalObjectQueryParams,
  type RentalObject,
} from '../../schemas/rental-object.schema';
import type { PaginatedResult } from '../../database/base.repository';

@Injectable()
export class RentalObjectService {
  constructor(
    @Inject('RentalObjectRepository') private readonly repository: RentalObjectRepository,
    @Inject('Adapters') private readonly adapters: any
  ) {}

  /**
   * Create a new rental object
   */
  async create(tenantId: string, data: CreateRentalObjectDTO): Promise<RentalObject> {
    const validated = validate(CreateRentalObjectSchema, data);

    const slug = validated.slug || this.generateSlug(validated.name);

    const rentalObject = await this.repository.create({
      tenantId,
      name: validated.name,
      slug,
      organizationId: validated.organizationId || null,
      categoryKey: validated.category,
      timeMode: validated.timeMode || 'PERIOD',
      features: validated.bookingFeatures ? [validated.bookingFeatures] : [],
      status: 'draft',
      description: validated.description || null,
      images: validated.images || [],
      pricing: validated.pricing || { basePrice: 0, currency: 'NOK', unit: 'hour' },
      capacity: validated.capacity || null,
      requiresApproval: (validated.bookingFeatures as any)?.requiresApproval ?? false,
      metadata: {
        ...(validated.metadata || {}),
        subcategory: validated.subcategory || null,
        tags: validated.tags || [],
        fixedLocation: validated.fixedLocation ?? true,
      },
    });

    this.adapters?.log?.info('Rental object created', { id: rentalObject.id, tenantId });

    getAuditService().log({
      tenantId,
      action: 'create',
      resource: 'rental-object',
      resourceId: rentalObject.id,
      metadata: { name: rentalObject.name, category: rentalObject.categoryKey },
    });

    return rentalObject as unknown as RentalObject;
  }

  /**
   * Get rental object by ID
   */
  async findById(id: string): Promise<RentalObject | null> {
    return this.repository.findById(id) as Promise<RentalObject | null>;
  }

  /**
   * Get rental object by ID or throw
   */
  async findByIdOrFail(id: string): Promise<RentalObject> {
    return this.repository.findByIdOrFail(id) as unknown as Promise<RentalObject>;
  }

  /**
   * List rental objects with filters
   */
  async findAll(tenantId: string | null, params: RentalObjectQueryParams): Promise<PaginatedResult<RentalObject>> {
    const validated = validate(RentalObjectQuerySchema, params);
    return this.repository.findWithFilters(tenantId, { 
      ...validated, 
      page: validated.page ?? 1, 
      limit: validated.limit ?? 20,
      sortBy: validated.sortBy ?? 'createdAt',
      sortOrder: validated.sortOrder ?? 'desc',
    }) as unknown as Promise<PaginatedResult<RentalObject>>;
  }

  /**
   * Update rental object
   */
  async update(id: string, data: UpdateRentalObjectDTO): Promise<RentalObject> {
    const validated = validate(UpdateRentalObjectSchema, data);
    const rentalObject = await this.repository.update(id, validated);
    
    this.adapters?.log?.info('Rental object updated', { id, changes: Object.keys(validated) });

    getAuditService().log({
      tenantId: rentalObject.tenantId,
      action: 'update',
      resource: 'rental-object',
      resourceId: id,
      metadata: { changes: Object.keys(validated) },
    });

    return rentalObject as unknown as RentalObject;
  }

  /**
   * Publish rental object
   */
  async publish(id: string): Promise<RentalObject> {
    const rentalObject = await this.repository.update(id, { status: 'published' });
    this.adapters?.log?.info('Rental object published', { id });
    
    getAuditService().log({
      tenantId: rentalObject.tenantId,
      action: 'publish',
      resource: 'rental-object',
      resourceId: id,
      metadata: { newStatus: 'published' },
    });
    
    return rentalObject as unknown as RentalObject;
  }

  /**
   * Unpublish rental object (set to draft)
   */
  async unpublish(id: string): Promise<RentalObject> {
    const rentalObject = await this.repository.update(id, { status: 'draft' });
    this.adapters?.log?.info('Rental object unpublished', { id });
    
    getAuditService().log({
      tenantId: rentalObject.tenantId,
      action: 'unpublish',
      resource: 'rental-object',
      resourceId: id,
      metadata: { newStatus: 'draft' },
    });
    
    return rentalObject as unknown as RentalObject;
  }

  /**
   * Archive rental object
   */
  async archive(id: string): Promise<RentalObject> {
    const rentalObject = await this.repository.update(id, { status: 'archived' });
    this.adapters?.log?.info('Rental object archived', { id });
    
    getAuditService().log({
      tenantId: rentalObject.tenantId,
      action: 'archive',
      resource: 'rental-object',
      resourceId: id,
      severity: 'warning',
      metadata: { newStatus: 'archived' },
    });
    
    return rentalObject as unknown as RentalObject;
  }

  /**
   * Restore archived rental object (set to draft)
   */
  async restore(id: string): Promise<RentalObject> {
    const rentalObject = await this.repository.update(id, { status: 'draft' });
    this.adapters?.log?.info('Rental object restored', { id });
    
    getAuditService().log({
      tenantId: rentalObject.tenantId,
      action: 'restore',
      resource: 'rental-object',
      resourceId: id,
      metadata: { newStatus: 'draft', previousStatus: 'archived' },
    });
    
    return rentalObject as unknown as RentalObject;
  }

  /**
   * Duplicate rental object
   */
  async duplicate(id: string): Promise<RentalObject> {
    const original = await this.repository.findByIdOrFail(id);
    
    const newRentalObject = await this.repository.create({
      ...original,
      id: undefined,
      name: `${original.name} (Kopi)`,
      slug: `${original.slug}-kopi-${Date.now()}`,
      status: 'draft',
      createdAt: undefined,
      updatedAt: undefined,
    } as any);
    
    this.adapters?.log?.info('Rental object duplicated', { originalId: id, newId: newRentalObject.id });
    
    getAuditService().log({
      tenantId: newRentalObject.tenantId,
      action: 'duplicate',
      resource: 'rental-object',
      resourceId: newRentalObject.id,
      metadata: { originalId: id, originalName: original.name },
    });
    
    return newRentalObject as unknown as RentalObject;
  }

  /**
   * Delete rental object
   */
  async delete(id: string): Promise<void> {
    const rentalObject = await this.repository.findByIdOrFail(id);
    await this.repository.delete(id);
    this.adapters?.log?.warn('Rental object deleted', { id });
    
    getAuditService().log({
      tenantId: rentalObject.tenantId,
      action: 'delete',
      resource: 'rental-object',
      resourceId: id,
      severity: 'warning',
      metadata: { name: rentalObject.name },
    });
  }

  /**
   * Generate URL-safe slug from name
   */
  private generateSlug(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  }

  /**
   * Find rental object by slug
   */
  async findBySlug(slug: string): Promise<RentalObject | null> {
    return this.repository.findBySlugOnly(slug) as Promise<RentalObject | null>;
  }

  /**
   * Get rental object availability for date range
   */
  async getAvailability(id: string, startDate: string, endDate: string): Promise<any> {
    return this.repository.getAvailability(id, new Date(startDate), new Date(endDate));
  }

  /**
   * Add media to rental object
   */
  async addMedia(id: string, url: string, type: string): Promise<RentalObject> {
    const rentalObject = await this.findByIdOrFail(id);
    const images = [...(rentalObject.images || []), url];
    return this.update(id, { images }) as Promise<RentalObject>;
  }

  /**
   * Remove media from rental object
   */
  async removeMedia(id: string, mediaId: string): Promise<void> {
    const rentalObject = await this.findByIdOrFail(id);
    const images = (rentalObject.images || []).filter((img: string) => img !== mediaId);
    await this.update(id, { images });
  }

  /**
   * Get rental object statistics
   */
  async getStats(id: string): Promise<any> {
    return this.repository.getStats(id);
  }

  /**
   * Get calendar configuration for rental object
   */
  async getCalendarConfig(id: string): Promise<any> {
    const rentalObject = await this.findByIdOrFail(id);
    
    return {
      rentalObjectId: rentalObject.id,
      rentalObjectName: rentalObject.name,
      granularity: rentalObject.timeMode === 'ALL_DAY' ? 'DAY' : 'HOUR',
      timezone: 'Europe/Oslo',
      slotDurationMinutes: rentalObject.timeMode === 'SLOT' ? 60 : 30,
      allowSameDayBooking: true,
      bookingModes: [
        {
          mode: 'single',
          enabled: true,
          labelKey: 'booking.mode.single',
          constraints: {},
        },
      ],
      defaultMode: 'single',
      availableActions: ['VIEW', 'BOOK'],
      permissions: {
        canBook: true,
        canReserve: false,
        canViewPricing: true,
        canManageAvailability: false,
      },
    };
  }

  /**
   * Get booking policy (Contract-First DTO)
   * Returns BookingPolicyDTO with all booking rules
   * Reference: packages/client-sdk/src/types/booking-contracts.ts
   */
  async getBookingPolicy(id: string): Promise<any> {
    const rentalObject = await this.findByIdOrFail(id);
    const features = (rentalObject.bookingFeatures || {}) as Record<string, unknown>;

    return {
      rentalObjectId: rentalObject.id,
      modes: {
        single: true,
        range: rentalObject.timeMode === 'PERIOD',
        allDay: rentalObject.timeMode === 'ALL_DAY',
        recurring: features.recurringBookings === true,
        season: false, // Future feature
        activity: rentalObject.category === 'ARRANGEMENTER_OG_TJENESTER',
      },
      slots: {
        enabled: rentalObject.timeMode === 'SLOT',
        durationMinutes: [30, 60, 120, 180],
        gridStart: '08:00',
        gridEnd: '22:00',
      },
      constraints: {
        minDurationMinutes: 30,
        maxDurationMinutes: 480,
        minNoticeDays: 0,
        maxAdvanceDays: 90,
        maxConcurrentBookings: 3,
      },
      rules: {
        requiresApproval: features.requiresApproval === true,
        allowWeekends: true,
        allowHolidays: true,
        blackoutDates: [],
        customRules: [],
      },
    };
  }

  /**
   * Get payment policy (Contract-First DTO)
   * Returns PaymentPolicyDTO with payment requirements
   * Reference: packages/client-sdk/src/types/booking-contracts.ts
   */
  async getPaymentPolicy(id: string): Promise<any> {
    const rentalObject = await this.findByIdOrFail(id);
    const features = (rentalObject.bookingFeatures || {}) as Record<string, unknown>;
    const pricing = (rentalObject.pricing || {}) as Record<string, unknown>;

    return {
      rentalObjectId: rentalObject.id,
      requiresApproval: features.requiresApproval === true,
      approvalWorkflow: features.requiresApproval
        ? {
            roles: ['ORG_ADMIN', 'TENANT_ADMIN'],
            autoApproveForGroups: [],
            estimatedApprovalTime: '24-48 hours',
          }
        : undefined,
      deposit: {
        required: false,
        type: 'PERCENTAGE' as const,
        value: 0,
        paymentTiming: 'BEFORE_SUBMIT' as const,
      },
      payment: {
        payNowEnabled: (pricing.basePrice as number) > 0,
        payLaterEnabled: features.requiresApproval === true,
        payOnlineRequired: false,
        providers: (pricing.basePrice as number) > 0 ? ['VIPPS' as const, 'STRIPE' as const] : [],
      },
      cancellation: {
        feeCents: 0,
        freeCancellationHours: 24,
        refundPolicy: {
          fullRefundHours: 48,
          partialRefundHours: 24,
          partialRefundPercent: 50,
        },
      },
    };
  }

  /**
   * Get dynamic tabs configuration (Contract-First DTO)
   * Returns TabConfigDTO[] for rental object details page
   * Reference: packages/client-sdk/src/types/booking-contracts.ts
   */
  async getTabs(id: string): Promise<any[]> {
    const rentalObject = await this.findByIdOrFail(id);
    const features = rentalObject.bookingFeatures || {};
    const hasLocation = rentalObject.fixedLocation && rentalObject.metadata?.location;
    
    const tabs = [
      {
        key: 'overview',
        label: { nb: 'Oversikt', en: 'Overview' },
        order: 1,
        enabled: true,
        contentAvailable: true,
        icon: 'information',
      },
      {
        key: 'availability',
        label: { nb: 'Tilgjengelighet', en: 'Availability' },
        order: 2,
        enabled: true,
        contentAvailable: true,
        icon: 'calendar',
      },
      {
        key: 'pricing',
        label: { nb: 'Priser', en: 'Pricing' },
        order: 3,
        enabled: rentalObject.pricing?.basePrice > 0,
        contentAvailable: rentalObject.pricing?.basePrice > 0,
        icon: 'currency',
        featureFlag: 'feature.pricing',
      },
      {
        key: 'activities',
        label: { nb: 'Aktiviteter', en: 'Activities' },
        order: 4,
        enabled: rentalObject.category === 'ARRANGEMENTER_OG_TJENESTER',
        contentAvailable: false, // Would check if activities exist
        icon: 'event',
      },
      {
        key: 'reviews',
        label: { nb: 'Anmeldelser', en: 'Reviews' },
        order: 5,
        enabled: false, // Feature flag controlled
        contentAvailable: false,
        icon: 'star',
        featureFlag: 'feature.ratings_reviews',
      },
      {
        key: 'location',
        label: { nb: 'Plassering', en: 'Location' },
        order: 6,
        enabled: hasLocation,
        contentAvailable: hasLocation,
        icon: 'location',
      },
    ];
    
    return tabs.filter((tab) => tab.enabled);
  }
}
