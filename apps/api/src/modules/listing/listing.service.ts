/**
 * Listing Service
 * Business logic for rental objects (utleieobjekter) domain
 */
import { Injectable, Inject } from '../../core/decorators';
import { ListingRepository } from './listing.repository';
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
export class ListingService {
  constructor(
    @Inject('ListingRepository') private readonly repository: ListingRepository,
    @Inject('Adapters') private readonly adapters: any
  ) {}

  /**
   * Create a new rental object
   */
  async create(tenantId: string, data: CreateRentalObjectDTO): Promise<RentalObject> {
    const validated = validate(CreateRentalObjectSchema, data);

    // Generate slug if not provided
    const slug = validated.slug || this.generateSlug(validated.name);

    const listing = await this.repository.create({
      tenantId,
      name: validated.name,
      slug,
      organizationId: validated.organizationId || null,
      category: validated.category,
      subcategory: validated.subcategory || null,
      tags: validated.tags || [],
      timeMode: validated.timeMode || 'PERIOD',
      bookingFeatures: validated.bookingFeatures || {},
      status: 'draft',
      description: validated.description || null,
      images: validated.images || [],
      pricing: validated.pricing || { basePrice: 0, currency: 'NOK', unit: 'hour' },
      capacity: validated.capacity || null,
      fixedLocation: validated.fixedLocation ?? true,
      metadata: validated.metadata || {},
    });

    this.adapters?.log?.info('Rental object created', { id: listing.id, tenantId });

    getAuditService().log({
      tenantId,
      action: 'create',
      resource: 'rental-object',
      resourceId: listing.id,
      metadata: { name: listing.name, category: listing.category },
    });

    return listing as RentalObject;
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
    return this.repository.findByIdOrFail(id) as Promise<RentalObject>;
  }

  /**
   * List rental objects with filters
   */
  async findAll(tenantId: string | null, params: RentalObjectQueryParams): Promise<PaginatedResult<RentalObject>> {
    const validated = validate(RentalObjectQuerySchema, params);
    // Pass null tenantId to repository to fetch all listings (public access)
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
    const listing = await this.repository.update(id, validated);
    
    this.adapters?.log?.info('Rental object updated', { id, changes: Object.keys(validated) });

    getAuditService().log({
      tenantId: listing.tenantId,
      action: 'update',
      resource: 'rental-object',
      resourceId: id,
      metadata: { changes: Object.keys(validated) },
    });

    return listing as RentalObject;
  }

  /**
   * Publish rental object
   */
  async publish(id: string): Promise<RentalObject> {
    const listing = await this.repository.update(id, { status: 'published' });
    this.adapters?.log?.info('Rental object published', { id });
    
    getAuditService().log({
      tenantId: listing.tenantId,
      action: 'publish',
      resource: 'rental-object',
      resourceId: id,
      metadata: { newStatus: 'published' },
    });
    
    return listing as RentalObject;
  }

  /**
   * Archive rental object
   */
  async archive(id: string): Promise<RentalObject> {
    const listing = await this.repository.update(id, { status: 'archived' });
    this.adapters?.log?.info('Rental object archived', { id });
    
    getAuditService().log({
      tenantId: listing.tenantId,
      action: 'archive',
      resource: 'rental-object',
      resourceId: id,
      severity: 'warning',
      metadata: { newStatus: 'archived' },
    });
    
    return listing as RentalObject;
  }

  /**
   * Duplicate rental object - creates a copy with "(Kopi)" suffix and draft status
   */
  async duplicate(id: string): Promise<RentalObject> {
    const original = await this.repository.findByIdOrFail(id);
    
    const newListing = await this.repository.create({
      ...original,
      id: undefined, // Let DB generate new ID
      name: `${original.name} (Kopi)`,
      slug: `${original.slug}-kopi-${Date.now()}`,
      status: 'draft',
      createdAt: undefined,
      updatedAt: undefined,
    } as any);
    
    this.adapters?.log?.info('Rental object duplicated', { originalId: id, newId: newListing.id });
    
    getAuditService().log({
      tenantId: newListing.tenantId,
      action: 'duplicate',
      resource: 'rental-object',
      resourceId: newListing.id,
      metadata: { originalId: id, originalName: original.name },
    });
    
    return newListing as RentalObject;
  }

  /**
   * Delete rental object
   */
  async delete(id: string): Promise<void> {
    const listing = await this.repository.findByIdOrFail(id);
    await this.repository.delete(id);
    this.adapters?.log?.warn('Rental object deleted', { id });
    
    getAuditService().log({
      tenantId: listing.tenantId,
      action: 'delete',
      resource: 'rental-object',
      resourceId: id,
      severity: 'warning',
      metadata: { name: listing.name },
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
  async getAvailability(listingId: string, startDate: string, endDate: string): Promise<any> {
    return this.repository.getAvailability(listingId, new Date(startDate), new Date(endDate));
  }

  /**
   * Add media to rental object
   */
  async addMedia(listingId: string, url: string, type: string): Promise<RentalObject> {
    const listing = await this.findByIdOrFail(listingId);
    const images = [...(listing.images || []), url];
    return this.update(listingId, { images }) as Promise<RentalObject>;
  }

  /**
   * Remove media from rental object
   */
  async removeMedia(listingId: string, mediaId: string): Promise<void> {
    const listing = await this.findByIdOrFail(listingId);
    const images = (listing.images || []).filter((img: string) => img !== mediaId);
    await this.update(listingId, { images });
  }

  /**
   * Get rental object statistics
   */
  async getStats(listingId: string): Promise<any> {
    return this.repository.getStats(listingId);
  }
}

