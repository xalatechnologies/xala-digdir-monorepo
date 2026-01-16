/**
 * Rental Object Constants
 *
 * Shared constants for rental object filters and options.
 * Used across backoffice and minside applications for rental object management.
 *
 * Note: The SDK still uses "LISTING_TYPE_OPTIONS" which we re-use here.
 * This will be updated when the SDK migrates to rental object terminology.
 */

import { LISTING_TYPE_OPTIONS, type ListingType } from '@digilist/client-sdk';
import type { RentalObjectQueryFilters } from '../types/rental-objects';

// =============================================================================
// Type Tabs Configuration
// =============================================================================

/**
 * Type tabs configuration - uses SDK's LISTING_TYPE_OPTIONS directly
 * For filtering rental objects by type (SPACE, RESOURCE, EVENT, etc.)
 */
export const TYPE_TABS: Array<{ id: ListingType | 'ALL'; label: string }> = LISTING_TYPE_OPTIONS;

// =============================================================================
// Status Filter Options
// =============================================================================

/**
 * Status filter options for rental object management
 * Allows filtering by draft, published, archived, or all statuses
 */
export const STATUS_OPTIONS: Array<{ id: string; label: string }> = [
  { id: 'all', label: 'Alle statuser' },
  { id: 'draft', label: 'Utkast' },
  { id: 'published', label: 'Publisert' },
  { id: 'archived', label: 'Arkivert' },
];

// =============================================================================
// Sort Options
// =============================================================================

/**
 * Sort options for rental objects
 * Provides common sorting criteria for rental object tables
 */
export const SORT_OPTIONS: Array<{
  id: string;
  label: string;
  field: RentalObjectQueryFilters['sortBy'];
  order: RentalObjectQueryFilters['sortOrder'];
}> = [
  { id: 'updated-desc', label: 'Sist oppdatert', field: 'updatedAt', order: 'desc' },
  { id: 'updated-asc', label: 'Eldst oppdatert', field: 'updatedAt', order: 'asc' },
  { id: 'created-desc', label: 'Nyeste først', field: 'createdAt', order: 'desc' },
  { id: 'created-asc', label: 'Eldste først', field: 'createdAt', order: 'asc' },
  { id: 'name-asc', label: 'Navn A-Å', field: 'name', order: 'asc' },
  { id: 'name-desc', label: 'Navn Å-A', field: 'name', order: 'desc' },
];

// =============================================================================
// Capacity Filter Options
// =============================================================================

/**
 * Capacity filter options for rental object filtering
 * Used in the RentalObjectsFilterBar more filters modal
 */
export const CAPACITY_OPTIONS = [
  { id: 'any', label: 'Alle størrelser', min: undefined, max: undefined },
  { id: '1-10', label: '1-10 personer', min: 1, max: 10 },
  { id: '11-25', label: '11-25 personer', min: 11, max: 25 },
  { id: '26-50', label: '26-50 personer', min: 26, max: 50 },
  { id: '51-100', label: '51-100 personer', min: 51, max: 100 },
  { id: '100+', label: 'Over 100 personer', min: 101, max: undefined },
];
