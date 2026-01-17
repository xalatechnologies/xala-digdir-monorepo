/**
 * Global Search Service (GAP-009)
 * PostgreSQL full-text search with RBAC filtering
 *
 * Features:
 * - Multi-entity search (rental_objects, bookings, organizations, users)
 * - PostgreSQL ts_vector full-text search with ranking
 * - Tenant isolation (RBAC)
 * - Search highlights
 * - Faceted filters
 * - Typeahead support
 *
 * Reference: packages/client-sdk/src/types/search.ts
 */
import { eq, and, or, sql, desc, ilike } from 'drizzle-orm';
import {
  rentalObjects,
  bookings,
  organizations,
  users,
} from '../../database/schema';

// =============================================================================
// Types
// =============================================================================

export type SearchEntityType = 'rental_object' | 'booking' | 'organization' | 'user';

export interface SearchRequest {
  query: string;
  types?: SearchEntityType[];
  filters?: {
    status?: string;
    categoryKey?: string;
    dateFrom?: string;
    dateTo?: string;
  };
  page?: number;
  limit?: number;
}

export interface SearchResult {
  id: string;
  type: SearchEntityType;
  title: string;
  description?: string;
  highlight?: string;
  rank: number;
  metadata: Record<string, unknown>;
}

export interface TypeCount {
  type: SearchEntityType;
  count: number;
}

export interface SearchResponse {
  query: string;
  totalResults: number;
  executionTimeMs: number;
  results: SearchResult[];
  pagination: {
    page: number;
    limit: number;
    totalPages: number;
  };
  facets: {
    types: TypeCount[];
    statuses: Array<{ value: string; count: number }>;
  };
}

export interface TypeaheadSuggestion {
  text: string;
  entityType: SearchEntityType;
  entityId?: string;
  category?: string;
}

export interface TypeaheadResponse {
  query: string;
  suggestions: TypeaheadSuggestion[];
}

// =============================================================================
// Service
// =============================================================================

export class GlobalSearchService {
  constructor(private readonly db: any) {}

  /**
   * Global search across all entities with RBAC
   * Uses PostgreSQL full-text search with ts_vector
   */
  async search(
    request: SearchRequest,
    context: { tenantId: string; userId?: string }
  ): Promise<SearchResponse> {
    const startTime = Date.now();
    const { query, types, filters, page = 1, limit = 20 } = request;
    const { tenantId } = context;

    // Sanitize and prepare search query for PostgreSQL
    const searchQuery = this.prepareSearchQuery(query);

    if (!searchQuery) {
      return this.emptyResponse(query, page, limit, startTime);
    }

    // Determine which entity types to search
    const searchTypes = types?.length ? types : ['rental_object', 'booking', 'organization', 'user'] as SearchEntityType[];

    // Execute parallel searches for each entity type
    const searchPromises: Promise<{ results: SearchResult[]; count: number; type: SearchEntityType }>[] = [];

    if (searchTypes.includes('rental_object')) {
      searchPromises.push(this.searchRentalObjects(searchQuery, tenantId, filters, limit));
    }
    if (searchTypes.includes('booking')) {
      searchPromises.push(this.searchBookings(searchQuery, tenantId, filters, limit));
    }
    if (searchTypes.includes('organization')) {
      searchPromises.push(this.searchOrganizations(searchQuery, tenantId, filters, limit));
    }
    if (searchTypes.includes('user')) {
      searchPromises.push(this.searchUsers(searchQuery, tenantId, filters, limit));
    }

    const searchResults = await Promise.all(searchPromises);

    // Combine and sort by rank
    let allResults: SearchResult[] = [];
    const typeCounts: TypeCount[] = [];
    let totalResults = 0;

    for (const { results, count, type } of searchResults) {
      allResults = allResults.concat(results);
      typeCounts.push({ type, count });
      totalResults += count;
    }

    // Sort by rank descending
    allResults.sort((a, b) => b.rank - a.rank);

    // Apply pagination
    const offset = (page - 1) * limit;
    const paginatedResults = allResults.slice(offset, offset + limit);

    // Get status facets
    const statusFacets = await this.getStatusFacets(searchQuery, tenantId, searchTypes);

    return {
      query,
      totalResults,
      executionTimeMs: Date.now() - startTime,
      results: paginatedResults,
      pagination: {
        page,
        limit,
        totalPages: Math.ceil(totalResults / limit),
      },
      facets: {
        types: typeCounts,
        statuses: statusFacets,
      },
    };
  }

  /**
   * Typeahead suggestions for search autocomplete
   */
  async typeahead(
    query: string,
    context: { tenantId: string },
    options?: { entityType?: SearchEntityType; limit?: number }
  ): Promise<TypeaheadResponse> {
    const { tenantId } = context;
    const limit = options?.limit || 8;
    const searchQuery = this.prepareSearchQuery(query);

    if (!searchQuery || query.length < 2) {
      return { query, suggestions: [] };
    }

    const suggestions: TypeaheadSuggestion[] = [];

    // Get suggestions from rental objects (most common use case)
    const rentalObjectSuggestions = await this.db
      .select({
        id: rentalObjects.id,
        name: rentalObjects.name,
        categoryKey: rentalObjects.categoryKey,
      })
      .from(rentalObjects)
      .where(
        and(
          eq(rentalObjects.tenantId, tenantId),
          eq(rentalObjects.status, 'active'),
          or(
            ilike(rentalObjects.name, `%${query}%`),
            ilike(rentalObjects.description, `%${query}%`)
          )
        )
      )
      .limit(limit);

    for (const ro of rentalObjectSuggestions) {
      suggestions.push({
        text: ro.name,
        entityType: 'rental_object',
        entityId: ro.id,
        category: ro.categoryKey,
      });
    }

    // Get suggestions from organizations if room
    if (suggestions.length < limit) {
      const remainingSlots = limit - suggestions.length;
      const orgSuggestions = await this.db
        .select({
          id: organizations.id,
          name: organizations.name,
        })
        .from(organizations)
        .where(
          and(
            eq(organizations.tenantId, tenantId),
            eq(organizations.status, 'active'),
            ilike(organizations.name, `%${query}%`)
          )
        )
        .limit(remainingSlots);

      for (const org of orgSuggestions) {
        suggestions.push({
          text: org.name,
          entityType: 'organization',
          entityId: org.id,
        });
      }
    }

    return { query, suggestions };
  }

  // ===========================================================================
  // Private Methods - Entity Searches
  // ===========================================================================

  private async searchRentalObjects(
    searchQuery: string,
    tenantId: string,
    filters?: SearchRequest['filters'],
    limit?: number
  ): Promise<{ results: SearchResult[]; count: number; type: SearchEntityType }> {
    // Build WHERE conditions
    const conditions = [eq(rentalObjects.tenantId, tenantId)];

    if (filters?.status) {
      conditions.push(eq(rentalObjects.status, filters.status));
    }
    if (filters?.categoryKey) {
      conditions.push(eq(rentalObjects.categoryKey, filters.categoryKey));
    }

    // Use PostgreSQL full-text search
    // ts_rank for ranking, ts_headline for highlights
    const results = await this.db
      .select({
        id: rentalObjects.id,
        name: rentalObjects.name,
        description: rentalObjects.description,
        categoryKey: rentalObjects.categoryKey,
        status: rentalObjects.status,
        rank: sql<number>`ts_rank(
          to_tsvector('norwegian', coalesce(${rentalObjects.name}, '') || ' ' || coalesce(${rentalObjects.description}, '')),
          plainto_tsquery('norwegian', ${searchQuery})
        )`.as('rank'),
        highlight: sql<string>`ts_headline(
          'norwegian',
          coalesce(${rentalObjects.name}, '') || ' ' || coalesce(${rentalObjects.description}, ''),
          plainto_tsquery('norwegian', ${searchQuery}),
          'MaxWords=30, MinWords=15, MaxFragments=1'
        )`.as('highlight'),
      })
      .from(rentalObjects)
      .where(
        and(
          ...conditions,
          sql`to_tsvector('norwegian', coalesce(${rentalObjects.name}, '') || ' ' || coalesce(${rentalObjects.description}, '')) @@ plainto_tsquery('norwegian', ${searchQuery})`
        )
      )
      .orderBy(desc(sql`rank`))
      .limit(limit || 20);

    // Get count
    const [{ count }] = await this.db
      .select({ count: sql<number>`count(*)` })
      .from(rentalObjects)
      .where(
        and(
          ...conditions,
          sql`to_tsvector('norwegian', coalesce(${rentalObjects.name}, '') || ' ' || coalesce(${rentalObjects.description}, '')) @@ plainto_tsquery('norwegian', ${searchQuery})`
        )
      );

    return {
      results: results.map((r: any) => ({
        id: r.id,
        type: 'rental_object' as SearchEntityType,
        title: r.name,
        description: r.description,
        highlight: r.highlight,
        rank: r.rank || 0,
        metadata: {
          categoryKey: r.categoryKey,
          status: r.status,
        },
      })),
      count: Number(count),
      type: 'rental_object',
    };
  }

  private async searchBookings(
    searchQuery: string,
    tenantId: string,
    filters?: SearchRequest['filters'],
    limit?: number
  ): Promise<{ results: SearchResult[]; count: number; type: SearchEntityType }> {
    // Build WHERE conditions
    const conditions = [eq(bookings.tenantId, tenantId)];

    if (filters?.status) {
      conditions.push(eq(bookings.status, filters.status));
    }
    if (filters?.dateFrom) {
      conditions.push(sql`${bookings.startTime} >= ${filters.dateFrom}`);
    }
    if (filters?.dateTo) {
      conditions.push(sql`${bookings.endTime} <= ${filters.dateTo}`);
    }

    // Search in booking notes and related rental object name
    const results = await this.db
      .select({
        id: bookings.id,
        notes: bookings.notes,
        status: bookings.status,
        startTime: bookings.startTime,
        endTime: bookings.endTime,
        rentalObjectId: bookings.rentalObjectId,
        rentalObjectName: rentalObjects.name,
        rank: sql<number>`ts_rank(
          to_tsvector('norwegian', coalesce(${bookings.notes}, '') || ' ' || coalesce(${rentalObjects.name}, '')),
          plainto_tsquery('norwegian', ${searchQuery})
        )`.as('rank'),
      })
      .from(bookings)
      .leftJoin(rentalObjects, eq(bookings.rentalObjectId, rentalObjects.id))
      .where(
        and(
          ...conditions,
          sql`to_tsvector('norwegian', coalesce(${bookings.notes}, '') || ' ' || coalesce(${rentalObjects.name}, '')) @@ plainto_tsquery('norwegian', ${searchQuery})`
        )
      )
      .orderBy(desc(sql`rank`))
      .limit(limit || 20);

    // Get count
    const [{ count }] = await this.db
      .select({ count: sql<number>`count(*)` })
      .from(bookings)
      .leftJoin(rentalObjects, eq(bookings.rentalObjectId, rentalObjects.id))
      .where(
        and(
          ...conditions,
          sql`to_tsvector('norwegian', coalesce(${bookings.notes}, '') || ' ' || coalesce(${rentalObjects.name}, '')) @@ plainto_tsquery('norwegian', ${searchQuery})`
        )
      );

    return {
      results: results.map((r: any) => ({
        id: r.id,
        type: 'booking' as SearchEntityType,
        title: r.rentalObjectName || 'Booking',
        description: r.notes,
        rank: r.rank || 0,
        metadata: {
          status: r.status,
          startTime: r.startTime,
          endTime: r.endTime,
          rentalObjectId: r.rentalObjectId,
        },
      })),
      count: Number(count),
      type: 'booking',
    };
  }

  private async searchOrganizations(
    searchQuery: string,
    tenantId: string,
    filters?: SearchRequest['filters'],
    limit?: number
  ): Promise<{ results: SearchResult[]; count: number; type: SearchEntityType }> {
    const conditions = [eq(organizations.tenantId, tenantId)];

    if (filters?.status) {
      conditions.push(eq(organizations.status, filters.status));
    }

    const results = await this.db
      .select({
        id: organizations.id,
        name: organizations.name,
        slug: organizations.slug,
        type: organizations.type,
        status: organizations.status,
        rank: sql<number>`ts_rank(
          to_tsvector('norwegian', coalesce(${organizations.name}, '') || ' ' || coalesce(${organizations.slug}, '')),
          plainto_tsquery('norwegian', ${searchQuery})
        )`.as('rank'),
        highlight: sql<string>`ts_headline(
          'norwegian',
          coalesce(${organizations.name}, ''),
          plainto_tsquery('norwegian', ${searchQuery}),
          'MaxWords=20, MinWords=10, MaxFragments=1'
        )`.as('highlight'),
      })
      .from(organizations)
      .where(
        and(
          ...conditions,
          sql`to_tsvector('norwegian', coalesce(${organizations.name}, '') || ' ' || coalesce(${organizations.slug}, '')) @@ plainto_tsquery('norwegian', ${searchQuery})`
        )
      )
      .orderBy(desc(sql`rank`))
      .limit(limit || 20);

    const [{ count }] = await this.db
      .select({ count: sql<number>`count(*)` })
      .from(organizations)
      .where(
        and(
          ...conditions,
          sql`to_tsvector('norwegian', coalesce(${organizations.name}, '') || ' ' || coalesce(${organizations.slug}, '')) @@ plainto_tsquery('norwegian', ${searchQuery})`
        )
      );

    return {
      results: results.map((r: any) => ({
        id: r.id,
        type: 'organization' as SearchEntityType,
        title: r.name,
        highlight: r.highlight,
        rank: r.rank || 0,
        metadata: {
          slug: r.slug,
          type: r.type,
          status: r.status,
        },
      })),
      count: Number(count),
      type: 'organization',
    };
  }

  private async searchUsers(
    searchQuery: string,
    tenantId: string,
    filters?: SearchRequest['filters'],
    limit?: number
  ): Promise<{ results: SearchResult[]; count: number; type: SearchEntityType }> {
    const conditions = [eq(users.tenantId, tenantId)];

    if (filters?.status) {
      conditions.push(eq(users.status, filters.status));
    }

    const results = await this.db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
        status: users.status,
        rank: sql<number>`ts_rank(
          to_tsvector('norwegian', coalesce(${users.name}, '') || ' ' || coalesce(${users.email}, '')),
          plainto_tsquery('norwegian', ${searchQuery})
        )`.as('rank'),
      })
      .from(users)
      .where(
        and(
          ...conditions,
          sql`to_tsvector('norwegian', coalesce(${users.name}, '') || ' ' || coalesce(${users.email}, '')) @@ plainto_tsquery('norwegian', ${searchQuery})`
        )
      )
      .orderBy(desc(sql`rank`))
      .limit(limit || 20);

    const [{ count }] = await this.db
      .select({ count: sql<number>`count(*)` })
      .from(users)
      .where(
        and(
          ...conditions,
          sql`to_tsvector('norwegian', coalesce(${users.name}, '') || ' ' || coalesce(${users.email}, '')) @@ plainto_tsquery('norwegian', ${searchQuery})`
        )
      );

    return {
      results: results.map((r: any) => ({
        id: r.id,
        type: 'user' as SearchEntityType,
        title: r.name,
        description: r.email,
        rank: r.rank || 0,
        metadata: {
          email: r.email,
          role: r.role,
          status: r.status,
        },
      })),
      count: Number(count),
      type: 'user',
    };
  }

  // ===========================================================================
  // Private Methods - Helpers
  // ===========================================================================

  /**
   * Prepare search query for PostgreSQL full-text search
   * Sanitizes input and handles special characters
   */
  private prepareSearchQuery(query: string): string {
    if (!query || typeof query !== 'string') {
      return '';
    }

    // Trim and normalize whitespace
    let sanitized = query.trim().replace(/\s+/g, ' ');

    // Remove special PostgreSQL FTS characters
    sanitized = sanitized.replace(/[&|!():*<>]/g, ' ');

    // Limit length
    if (sanitized.length > 100) {
      sanitized = sanitized.substring(0, 100);
    }

    return sanitized;
  }

  /**
   * Get status facets for search results
   */
  private async getStatusFacets(
    searchQuery: string,
    tenantId: string,
    types: SearchEntityType[]
  ): Promise<Array<{ value: string; count: number }>> {
    // Get status distribution from rental objects (primary entity)
    if (!types.includes('rental_object')) {
      return [];
    }

    const statusCounts = await this.db
      .select({
        status: rentalObjects.status,
        count: sql<number>`count(*)`,
      })
      .from(rentalObjects)
      .where(
        and(
          eq(rentalObjects.tenantId, tenantId),
          sql`to_tsvector('norwegian', coalesce(${rentalObjects.name}, '') || ' ' || coalesce(${rentalObjects.description}, '')) @@ plainto_tsquery('norwegian', ${searchQuery})`
        )
      )
      .groupBy(rentalObjects.status);

    return statusCounts.map((s: any) => ({
      value: s.status,
      count: Number(s.count),
    }));
  }

  /**
   * Return empty response structure
   */
  private emptyResponse(
    query: string,
    page: number,
    limit: number,
    startTime: number
  ): SearchResponse {
    return {
      query,
      totalResults: 0,
      executionTimeMs: Date.now() - startTime,
      results: [],
      pagination: {
        page,
        limit,
        totalPages: 0,
      },
      facets: {
        types: [
          { type: 'rental_object', count: 0 },
          { type: 'booking', count: 0 },
          { type: 'organization', count: 0 },
          { type: 'user', count: 0 },
        ],
        statuses: [],
      },
    };
  }
}

// Export factory function for creating service with db
export function createGlobalSearchService(db: any): GlobalSearchService {
  return new GlobalSearchService(db);
}
