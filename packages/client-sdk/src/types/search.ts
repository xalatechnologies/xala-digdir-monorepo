/**
 * Search Types
 * Single Responsibility: All search-related type definitions
 */

import type {
  TenantEntity,
  BaseQueryParams,
  BookingStatus,
  ListingType,
  ListingStatus,
  OrganizationStatus,
  ExportFormat
} from './enums';
import type { Booking } from './booking';
import type { RentalObject } from './rental-object';
import type { Organization } from './organization';

// Type alias for backward compatibility
type Listing = RentalObject;

// =============================================================================
// Search Entity Types
// =============================================================================

export type SearchEntityType = 'booking' | 'rental-object' | 'listing' | 'organization' | 'all';
// Note: 'listing' is deprecated, use 'rental-object' instead

// =============================================================================
// Search Result Types
// =============================================================================

export interface BookingSearchResult {
  type: 'booking';
  entity: Booking;
  highlight?: {
    field: string;
    snippet: string;
  };
}

export interface RentalObjectSearchResult {
  type: 'rental-object';
  entity: RentalObject;
  highlight?: {
    field: string;
    snippet: string;
  };
}

/** @deprecated Use RentalObjectSearchResult instead */
export interface ListingSearchResult {
  type: 'listing';
  entity: Listing;
  highlight?: {
    field: string;
    snippet: string;
  };
}

export interface OrganizationSearchResult {
  type: 'organization';
  entity: Organization;
  highlight?: {
    field: string;
    snippet: string;
  };
}

/**
 * Discriminated union of all search result types
 */
export type SearchResult =
  | BookingSearchResult
  | ListingSearchResult
  | OrganizationSearchResult;

// =============================================================================
// Search Parameters
// =============================================================================

export interface SearchFilters {
  // Entity type filters
  entityTypes?: SearchEntityType[];

  // Date filters
  dateFrom?: string;
  dateTo?: string;

  // Status filters
  bookingStatus?: BookingStatus[];
  listingStatus?: ListingStatus[];
  organizationStatus?: OrganizationStatus[];

  // Type filters
  listingType?: ListingType[];

  // Related entity filters
  organizationId?: string;
  userId?: string;
  rentalObjectId?: string; // Preferred filter for rental objects
  rentalObjectId?: string; // @deprecated Use rentalObjectId instead (backward compatibility)

  // Additional filters
  minPrice?: number;
  maxPrice?: number;
  capacity?: number;
  city?: string;
  verified?: boolean;
}

export interface SearchParams extends BaseQueryParams {
  /** Search query string */
  query: string;

  /** Entity types to search (defaults to 'all') */
  entityType?: SearchEntityType;

  /** Additional filters */
  filters?: SearchFilters;

  /** Include highlights in results */
  includeHighlights?: boolean;
}

// =============================================================================
// Search Response
// =============================================================================

export interface SearchResponseMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  /** Breakdown by entity type */
  counts: {
    bookings: number;
    listings: number;
    organizations: number;
  };
  /** Query execution time in ms */
  executionTime?: number;
}

export interface SearchResponse {
  data: SearchResult[];
  meta: SearchResponseMeta;
}

// =============================================================================
// Typeahead Suggestions
// =============================================================================

export interface SearchSuggestion {
  /** Suggestion text */
  text: string;

  /** Entity type this suggestion relates to */
  entityType: SearchEntityType;

  /** Entity ID if suggestion is for a specific entity */
  entityId?: string;

  /** Display category (e.g., "Booking", "Listing Name", "Organization") */
  category: string;

  /** Match score/relevance (0-1) */
  score?: number;
}

export interface TypeaheadParams {
  /** Partial query string */
  query: string;

  /** Entity types to include in suggestions */
  entityTypes?: SearchEntityType[];

  /** Maximum number of suggestions to return */
  limit?: number;
}

export interface TypeaheadResponse {
  suggestions: SearchSuggestion[];
}

// =============================================================================
// Saved Filters
// =============================================================================

export interface SavedFilter extends TenantEntity {
  /** User-defined name for the filter */
  name: string;

  /** User who created the filter */
  userId: string;

  /** The saved search query */
  query?: string;

  /** The saved filters */
  filters: SearchFilters;

  /** Entity type this filter applies to */
  entityType?: SearchEntityType;

  /** Whether this is the user's default filter */
  isDefault?: boolean;

  /** Number of times this filter has been used */
  usageCount?: number;

  /** Last time this filter was used */
  lastUsedAt?: string;
}

export interface CreateSavedFilterDTO {
  name: string;
  query?: string;
  filters: SearchFilters;
  entityType?: SearchEntityType;
  isDefault?: boolean;
}

export interface UpdateSavedFilterDTO {
  name?: string;
  query?: string;
  filters?: SearchFilters;
  entityType?: SearchEntityType;
  isDefault?: boolean;
}

export interface SavedFilterQueryParams extends BaseQueryParams {
  /** Filter by entity type */
  entityType?: SearchEntityType;

  /** Only return default filter */
  defaultOnly?: boolean;
}

// =============================================================================
// Recent Searches
// =============================================================================

export interface RecentSearch extends TenantEntity {
  /** User who performed the search */
  userId: string;

  /** The search query */
  query: string;

  /** Entity type searched */
  entityType: SearchEntityType;

  /** Filters applied (if any) */
  filters?: SearchFilters;

  /** Number of results returned */
  resultCount?: number;

  /** Last time this search was performed */
  lastSearchedAt: string;
}

export interface RecentSearchQueryParams {
  /** Maximum number of recent searches to return */
  limit?: number;

  /** Filter by entity type */
  entityType?: SearchEntityType;
}

// =============================================================================
// Export Parameters
// =============================================================================

export interface ExportSearchParams {
  /** Search query string */
  query?: string;

  /** Entity type to export */
  entityType: SearchEntityType;

  /** Filters to apply */
  filters?: SearchFilters;

  /** Export format */
  format: ExportFormat;

  /** Fields to include in export (if not specified, all fields included) */
  fields?: string[];

  /** Filename for the export (without extension) */
  filename?: string;
}

export interface ExportSearchResponse {
  /** Export job ID (if async) */
  jobId?: string;

  /** Download URL (if sync) */
  url?: string;

  /** Filename of the exported file */
  filename: string;

  /** Number of records exported */
  recordCount: number;

  /** File size in bytes */
  fileSize?: number;
}
