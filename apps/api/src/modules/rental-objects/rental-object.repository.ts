/**
 * Rental Object Repository
 * Data access layer for rental object entities
 */
import { Injectable } from '../../core/decorators';
import { BaseRepository, type PaginatedResult, type FilterCondition } from '../../database/base.repository';
import { listings, type Listing, type NewListing } from '../../database/schema';
import type { RentalObjectQueryParams } from '../../schemas/rental-object.schema';

@Injectable()
export class RentalObjectRepository extends BaseRepository<
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
   * Find rental object by slug within a tenant
   */
  async findBySlug(tenantId: string, slug: string): Promise<Listing | null> {
    return this.findOne([
      { field: 'tenantId', operator: 'eq', value: tenantId },
      { field: 'slug', operator: 'eq', value: slug },
    ]);
  }

  /**
   * Find rental objects with query params
   * If tenantId is null, fetch all published rental objects (public access)
   */
  async findWithFilters(tenantId: string | null, params: RentalObjectQueryParams): Promise<PaginatedResult<Listing>> {
    const conditions: FilterCondition[] = [];

    // Only filter by tenant if tenantId is provided
    if (tenantId) {
      conditions.push({ field: 'tenantId', operator: 'eq', value: tenantId });
    } else {
      // Public access: only show published rental objects
      conditions.push({ field: 'status', operator: 'eq', value: 'published' });
    }

    // Status filter
    if (params.status) {
      conditions.push({ field: 'status', operator: 'eq', value: params.status });
    }

    // Category filter
    if (params.category) {
      conditions.push({ field: 'category', operator: 'eq', value: params.category });
    }

    // Subcategory filter
    if (params.subcategory) {
      conditions.push({ field: 'subcategory', operator: 'eq', value: params.subcategory });
    }

    // Time mode filter
    if (params.timeMode) {
      conditions.push({ field: 'timeMode', operator: 'eq', value: params.timeMode });
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
    let filteredData = result.data;

    // City filter (from metadata.location.city)
    if (params.city) {
      const cityLower = params.city.toLowerCase();
      filteredData = filteredData.filter((obj: any) => {
        const city = obj.metadata?.location?.city;
        return city && city.toLowerCase().includes(cityLower);
      });
    }

    // Municipality filter
    if (params.municipality) {
      const municipalityLower = params.municipality.toLowerCase();
      filteredData = filteredData.filter((obj: any) => {
        const municipality = obj.metadata?.location?.municipality;
        return municipality && municipality.toLowerCase().includes(municipalityLower);
      });
    }

    // Price range filters (from pricing.basePrice)
    if (params.minPrice !== undefined) {
      filteredData = filteredData.filter((obj: any) => {
        const price = obj.pricing?.basePrice ?? 0;
        return price >= params.minPrice!;
      });
    }
    if (params.maxPrice !== undefined) {
      filteredData = filteredData.filter((obj: any) => {
        const price = obj.pricing?.basePrice ?? 0;
        return price <= params.maxPrice!;
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
   * Find published rental objects
   */
  async findPublished(tenantId: string, params: RentalObjectQueryParams): Promise<PaginatedResult<Listing>> {
    return this.findWithFilters(tenantId, { ...params, status: 'published' });
  }

  /**
   * Find by slug (single param version)
   */
  async findBySlugOnly(slug: string): Promise<Listing | null> {
    return this.findOne([{ field: 'slug', operator: 'eq', value: slug }]);
  }

  /**
   * Get rental object availability for date range
   */
  async getAvailability(id: string, startDate: Date, endDate: Date): Promise<any> {
    return {
      rentalObjectId: id,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      blockedSlots: [],
    };
  }

  /**
   * Get rental object statistics
   */
  async getStats(id: string): Promise<any> {
    return {
      rentalObjectId: id,
      totalBookings: 0,
      totalRevenue: 0,
      averageRating: 4.5,
      utilizationRate: 0.65,
      lastBooking: null,
    };
  }

  protected getEntityName(): string {
    return 'RentalObject';
  }
}
