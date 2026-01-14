/**
 * Listing Service
 * Business logic for listing domain
 */
import { Injectable, Inject } from '../../core/decorators';
import { ListingRepository } from './listing.repository';
import { validate } from '../../core/validation/zod-pipe';
import { getAuditService } from '../../core/audit/audit.service';
import {
  CreateListingSchema,
  UpdateListingSchema,
  ListingQuerySchema,
  type CreateListingDTO,
  type UpdateListingDTO,
  type ListingQueryParams,
  type Listing,
} from '../../schemas/listing.schema';
import type { PaginatedResult } from '../../database/base.repository';

@Injectable()
export class ListingService {
  constructor(
    @Inject('ListingRepository') private readonly repository: ListingRepository,
    @Inject('Adapters') private readonly adapters: any
  ) {}

  /**
   * Create a new listing
   */
  async create(tenantId: string, data: CreateListingDTO): Promise<Listing> {
    const validated = validate(CreateListingSchema, data);

    // Generate slug if not provided
    const slug = validated.slug || this.generateSlug(validated.name);

    const listing = await this.repository.create({
      tenantId,
      name: validated.name,
      slug,
      organizationId: validated.organizationId || null,
      type: (validated.type || 'SPACE') as 'SPACE' | 'RESOURCE' | 'EVENT' | 'SERVICE' | 'VEHICLE' | 'OTHER',
      status: 'draft',
      description: validated.description || null,
      images: validated.images || [],
      pricing: validated.pricing || { basePrice: 0, currency: 'NOK', unit: 'hour' },
      capacity: validated.capacity || null,
      metadata: validated.metadata || {},
    });

    this.adapters?.log?.info('Listing created', { id: listing.id, tenantId });

    getAuditService().log({
      tenantId,
      action: 'create',
      resource: 'listing',
      resourceId: listing.id,
      metadata: { name: listing.name, type: listing.type },
    });

    return listing as Listing;
  }

  /**
   * Get listing by ID
   */
  async findById(id: string): Promise<Listing | null> {
    return this.repository.findById(id) as Promise<Listing | null>;
  }

  /**
   * Get listing by ID or throw
   */
  async findByIdOrFail(id: string): Promise<Listing> {
    return this.repository.findByIdOrFail(id) as Promise<Listing>;
  }

  /**
   * List listings with filters
   */
  async findAll(tenantId: string | null, params: ListingQueryParams): Promise<PaginatedResult<Listing>> {
    const validated = validate(ListingQuerySchema, params);
    // Pass null tenantId to repository to fetch all listings (public access)
    return this.repository.findWithFilters(tenantId, { 
      ...validated, 
      page: validated.page ?? 1, 
      limit: validated.limit ?? 20,
      sortBy: validated.sortBy ?? 'createdAt',
      sortOrder: validated.sortOrder ?? 'desc',
    }) as unknown as Promise<PaginatedResult<Listing>>;
  }

  /**
   * Update listing
   */
  async update(id: string, data: UpdateListingDTO): Promise<Listing> {
    const validated = validate(UpdateListingSchema, data);
    const listing = await this.repository.update(id, validated);
    
    this.adapters?.log?.info('Listing updated', { id, changes: Object.keys(validated) });

    getAuditService().log({
      tenantId: listing.tenantId,
      action: 'update',
      resource: 'listing',
      resourceId: id,
      metadata: { changes: Object.keys(validated) },
    });

    return listing as Listing;
  }

  /**
   * Publish listing
   */
  async publish(id: string): Promise<Listing> {
    const listing = await this.repository.update(id, { status: 'published' });
    this.adapters?.log?.info('Listing published', { id });
    
    getAuditService().log({
      tenantId: listing.tenantId,
      action: 'publish',
      resource: 'listing',
      resourceId: id,
      metadata: { newStatus: 'published' },
    });
    
    return listing as Listing;
  }

  /**
   * Archive listing
   */
  async archive(id: string): Promise<Listing> {
    const listing = await this.repository.update(id, { status: 'archived' });
    this.adapters?.log?.info('Listing archived', { id });
    
    getAuditService().log({
      tenantId: listing.tenantId,
      action: 'archive',
      resource: 'listing',
      resourceId: id,
      severity: 'warning',
      metadata: { newStatus: 'archived' },
    });
    
    return listing as Listing;
  }

  /**
   * Duplicate listing - creates a copy with "(Kopi)" suffix and draft status
   */
  async duplicate(id: string): Promise<Listing> {
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
    
    this.adapters?.log?.info('Listing duplicated', { originalId: id, newId: newListing.id });
    
    getAuditService().log({
      tenantId: newListing.tenantId,
      action: 'duplicate',
      resource: 'listing',
      resourceId: newListing.id,
      metadata: { originalId: id, originalName: original.name },
    });
    
    return newListing as Listing;
  }

  /**
   * Delete listing
   */
  async delete(id: string): Promise<void> {
    const listing = await this.repository.findByIdOrFail(id);
    await this.repository.delete(id);
    this.adapters?.log?.warn('Listing deleted', { id });
    
    getAuditService().log({
      tenantId: listing.tenantId,
      action: 'delete',
      resource: 'listing',
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
   * Find listing by slug
   */
  async findBySlug(slug: string): Promise<Listing | null> {
    return this.repository.findBySlugOnly(slug) as Promise<Listing | null>;
  }

  /**
   * Get listing availability for date range
   */
  async getAvailability(listingId: string, startDate: string, endDate: string): Promise<any> {
    return this.repository.getAvailability(listingId, new Date(startDate), new Date(endDate));
  }

  /**
   * Add media to listing
   */
  async addMedia(listingId: string, url: string, type: string): Promise<Listing> {
    const listing = await this.findByIdOrFail(listingId);
    const images = [...(listing.images || []), url];
    return this.update(listingId, { images }) as Promise<Listing>;
  }

  /**
   * Remove media from listing
   */
  async removeMedia(listingId: string, mediaId: string): Promise<void> {
    const listing = await this.findByIdOrFail(listingId);
    const images = (listing.images || []).filter((img: string) => img !== mediaId);
    await this.update(listingId, { images });
  }

  /**
   * Get listing statistics
   */
  async getStats(listingId: string): Promise<any> {
    return this.repository.getStats(listingId);
  }
}

