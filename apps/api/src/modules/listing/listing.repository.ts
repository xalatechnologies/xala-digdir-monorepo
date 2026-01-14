/**
 * Listing Repository
 * Data access layer for listing entities
 */
import { Injectable } from '../../core/decorators';
import { BaseRepository, type PaginatedResult, type FilterCondition } from '../../database/base.repository';
import { listings, type Listing, type NewListing } from '../../database/schema';
import type { ListingQueryParams } from '../../schemas/listing.schema';

@Injectable()
export class ListingRepository extends BaseRepository<
  typeof listings,
  Listing,
  NewListing,
  Partial<NewListing>,
  string
> {
  constructor(db: any) {
    super(db, listings, listings.id);
  }

  /**
   * Find listing by slug within a tenant
   */
  async findBySlug(tenantId: string, slug: string): Promise<Listing | null> {
    return this.findOne([
      { field: 'tenantId', operator: 'eq', value: tenantId },
      { field: 'slug', operator: 'eq', value: slug },
    ]);
  }

  /**
   * Find listings with query params
   * If tenantId is null, fetch all published listings (public access)
   * Supports: type, status, search, city, price range, capacity range, amenities, sorting
   */
  async findWithFilters(tenantId: string | null, params: ListingQueryParams): Promise<PaginatedResult<Listing>> {
    const conditions: FilterCondition[] = [];

    // Only filter by tenant if tenantId is provided
    if (tenantId) {
      conditions.push({ field: 'tenantId', operator: 'eq', value: tenantId });
    } else {
      // Public access: only show published listings
      conditions.push({ field: 'status', operator: 'eq', value: 'published' });
    }

    // Status filter
    if (params.status) {
      conditions.push({ field: 'status', operator: 'eq', value: params.status });
    }

    // Type filter
    if (params.type) {
      conditions.push({ field: 'type', operator: 'eq', value: params.type });
    }

    // Organization filter
    if (params.organizationId) {
      conditions.push({ field: 'organizationId', operator: 'eq', value: params.organizationId });
    }

    // Text search (name and description)
    if (params.search) {
      conditions.push({ field: 'name', operator: 'like', value: `%${params.search}%` });
    }

    // Capacity range filters
    if (params.minCapacity) {
      conditions.push({ field: 'capacity', operator: 'gte', value: params.minCapacity });
    }
    if (params.maxCapacity) {
      conditions.push({ field: 'capacity', operator: 'lte', value: params.maxCapacity });
    }

    // Get results with sorting
    const result = await this.findMany(conditions, {
      page: params.page,
      limit: params.limit,
      sortBy: params.sortBy || 'createdAt',
      sortOrder: params.sortOrder || 'desc',
    });

    // Post-filter for JSON field queries (city, amenities, price range)
    // These require filtering after fetch since they're in JSON metadata/pricing fields
    let filteredData = result.data;

    // City filter (from metadata.location.city)
    if (params.city) {
      const cityLower = params.city.toLowerCase();
      filteredData = filteredData.filter((listing: any) => {
        const city = listing.metadata?.location?.city;
        return city && city.toLowerCase().includes(cityLower);
      });
    }

    // Price range filters (from pricing.basePrice)
    if (params.minPrice !== undefined) {
      filteredData = filteredData.filter((listing: any) => {
        const price = listing.pricing?.basePrice ?? 0;
        return price >= params.minPrice!;
      });
    }
    if (params.maxPrice !== undefined) {
      filteredData = filteredData.filter((listing: any) => {
        const price = listing.pricing?.basePrice ?? 0;
        return price <= params.maxPrice!;
      });
    }

    // Amenities filter (from metadata.amenities)
    if (params.amenities) {
      const requiredAmenities = params.amenities.split(',').map(a => a.trim().toLowerCase());
      filteredData = filteredData.filter((listing: any) => {
        const listingAmenities = (listing.metadata?.amenities || []).map((a: string) => a.toLowerCase());
        return requiredAmenities.every(required => listingAmenities.includes(required));
      });
    }

    // Update pagination counts if we filtered
    const filteredTotal = filteredData.length;
    
    return {
      data: filteredData,
      pagination: {
        ...result.pagination,
        total: filteredTotal,
        totalPages: Math.ceil(filteredTotal / (params.limit || 20)),
      },
    };
  }

  /**
   * Find published listings
   */
  async findPublished(tenantId: string, params: ListingQueryParams): Promise<PaginatedResult<Listing>> {
    return this.findWithFilters(tenantId, { ...params, status: 'published' });
  }

  /**
   * Find by slug (single param version)
   */
  async findBySlugOnly(slug: string): Promise<Listing | null> {
    return this.findOne([{ field: 'slug', operator: 'eq', value: slug }]);
  }

  /**
   * Get listing availability for date range
   */
  async getAvailability(listingId: string, startDate: Date, endDate: Date): Promise<any> {
    // Query allocations and bookings for this listing in the date range
    const db = (this as any).db;
    
    // Return blocked time slots
    return {
      listingId,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      blockedSlots: [], // Would query allocations table
    };
  }

  /**
   * Get listing statistics
   */
  async getStats(listingId: string): Promise<any> {
    // Return mock stats (in production, would aggregate from bookings)
    return {
      listingId,
      totalBookings: 0,
      totalRevenue: 0,
      averageRating: 4.5,
      utilizationRate: 0.65,
      lastBooking: null,
    };
  }

  protected getEntityName(): string {
    return 'Listing';
  }
}

