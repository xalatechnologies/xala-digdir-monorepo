/**
 * Rental Object Types
 *
 * Shared type definitions for rental object management and filtering.
 * Used across backoffice and minside applications for administrative
 * rental object operations.
 *
 * Note: While we use "rental object" terminology in our domain,
 * the SDK still uses "Listing" types which we re-export and map to.
 */

import type { ListingStatus, ListingType } from '@digilist/client-sdk';

// Re-export SDK types with aliases for compatibility
// TODO: Update SDK to use RentalObject terminology
export type { ListingStatus, ListingType };

// Alias SDK types to our domain terminology
export type RentalObjectStatus = ListingStatus;
export type RentalObjectType = ListingType;

// =============================================================================
// Query and Filter Types
// =============================================================================

/**
 * Query filters for rental object management interfaces
 * Used in both backoffice and minside apps for filtering rental objects
 */
export interface RentalObjectQueryFilters {
  /** Filter by rental object type (SPACE, RESOURCE, EVENT, etc.) */
  type?: RentalObjectType;
  /** Filter by rental object status (DRAFT, PUBLISHED, ARCHIVED, etc.) */
  status?: RentalObjectStatus;
  /** Text search query across name and description */
  search?: string;
  /** Filter by city location */
  city?: string;
  /** Filter by municipality */
  municipality?: string;
  /** Filter by organization ID */
  organizationId?: string;
  /** Minimum capacity filter */
  minCapacity?: number;
  /** Maximum capacity filter */
  maxCapacity?: number;
  /** Filter rental objects with booking configuration */
  hasBookingConfig?: boolean;
  /** Filter by user who last updated */
  updatedBy?: string;
  /** Sort field */
  sortBy?: 'updatedAt' | 'createdAt' | 'name' | 'status';
  /** Sort direction */
  sortOrder?: 'asc' | 'desc';
  /** Pagination: page number */
  page?: number;
  /** Pagination: items per page */
  limit?: number;
}

/**
 * View mode for rental object display
 * Controls whether rental objects are shown in table or grid layout
 */
export type ViewMode = 'table' | 'grid';

/**
 * Filter state combining query filters and view mode
 * Represents complete UI state for rental object filter bar
 */
export interface RentalObjectFilterState {
  /** Active filter values */
  filters: RentalObjectQueryFilters;
  /** Current view mode (table or grid) */
  viewMode: ViewMode;
}
