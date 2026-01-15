/**
 * Rental Object Migration Utilities
 * 
 * This file provides utilities for migrating from legacy terminology and types:
 * 
 * 1. TERMINOLOGY MIGRATION:
 *    - "Listing" -> "RentalObject" (utleieobjekt)
 *    - /api/listings -> /api/rental-objects
 *    - ListingService -> RentalObjectService
 *    - useListings -> useRentalObjects
 * 
 * 2. TYPE/CATEGORY MIGRATION:
 *    - ListingType (SPACE, RESOURCE, etc.) -> RentalObjectCategory (4 categories)
 *    - Deprecated 6-type system -> New 4-category system
 * 
 * The "rental object" terminology better reflects the domain model of 
 * Norwegian municipal facility/equipment rental (utleie av kommunale anlegg).
 */

import type { ListingType, BookingTimeMode } from '../types/enums';
import type { RentalObjectCategory } from '../types/rental-object';

// =============================================================================
// Migration Mapping
// =============================================================================

/**
 * Maps legacy ListingType values to the new 4-category system
 * @deprecated Use RentalObjectCategory directly in new code
 */
export const LISTING_TYPE_TO_CATEGORY: Record<ListingType, RentalObjectCategory> = {
  SPACE: 'LOKALER_OG_BANER',
  RESOURCE: 'UTSTYR_OG_INVENTAR',
  VEHICLE: 'KJORETOY_OG_TRANSPORT',
  EVENT: 'OPPLEVELSER_OG_ARRANGEMENT',
  SERVICE: 'OPPLEVELSER_OG_ARRANGEMENT',
  OTHER: 'UTSTYR_OG_INVENTAR',
};

/**
 * Reverse mapping from new category to best-fit legacy type
 * @deprecated For display compatibility only
 */
export const CATEGORY_TO_LISTING_TYPE: Record<RentalObjectCategory, ListingType> = {
  LOKALER_OG_BANER: 'SPACE',
  UTSTYR_OG_INVENTAR: 'RESOURCE',
  KJORETOY_OG_TRANSPORT: 'VEHICLE',
  OPPLEVELSER_OG_ARRANGEMENT: 'EVENT',
};

/**
 * Default time modes for each category
 */
export const CATEGORY_DEFAULT_TIME_MODE: Record<RentalObjectCategory, BookingTimeMode> = {
  LOKALER_OG_BANER: 'PERIOD',
  UTSTYR_OG_INVENTAR: 'ALL_DAY',
  KJORETOY_OG_TRANSPORT: 'ALL_DAY',
  OPPLEVELSER_OG_ARRANGEMENT: 'SLOT',
};

// =============================================================================
// Migration Functions
// =============================================================================

/**
 * Convert legacy ListingType to new RentalObjectCategory
 * @deprecated Use RentalObjectCategory directly in new code
 */
export function migrateListingTypeToCategory(type: ListingType): RentalObjectCategory {
  return LISTING_TYPE_TO_CATEGORY[type] || 'UTSTYR_OG_INVENTAR';
}

/**
 * Convert new RentalObjectCategory to legacy ListingType (for backwards compatibility)
 * @deprecated For legacy API compatibility only
 */
export function migrateCategoryToListingType(category: RentalObjectCategory): ListingType {
  return CATEGORY_TO_LISTING_TYPE[category] || 'OTHER';
}

/**
 * Check if a value is a valid legacy ListingType
 */
export function isLegacyListingType(value: unknown): value is ListingType {
  const validTypes: ListingType[] = ['SPACE', 'RESOURCE', 'EVENT', 'SERVICE', 'VEHICLE', 'OTHER'];
  return typeof value === 'string' && validTypes.includes(value as ListingType);
}

/**
 * Check if a value is a valid new RentalObjectCategory
 */
export function isRentalObjectCategory(value: unknown): value is RentalObjectCategory {
  const validCategories: RentalObjectCategory[] = [
    'LOKALER_OG_BANER',
    'UTSTYR_OG_INVENTAR',
    'KJORETOY_OG_TRANSPORT',
    'OPPLEVELSER_OG_ARRANGEMENT',
  ];
  return typeof value === 'string' && validCategories.includes(value as RentalObjectCategory);
}

/**
 * Normalize a type/category value to the new category system
 * Handles both legacy and new values
 */
export function normalizeToCategory(value: string | undefined): RentalObjectCategory {
  if (!value) return 'LOKALER_OG_BANER';
  
  // Already a new category
  if (isRentalObjectCategory(value)) {
    return value;
  }
  
  // Legacy type - migrate it
  if (isLegacyListingType(value)) {
    return migrateListingTypeToCategory(value);
  }
  
  // Unknown value - default
  console.warn(`Unknown listing type/category: ${value}, defaulting to LOKALER_OG_BANER`);
  return 'LOKALER_OG_BANER';
}

/**
 * Get the default time mode for a category or legacy type
 */
export function getDefaultTimeMode(categoryOrType: string): BookingTimeMode {
  const category = normalizeToCategory(categoryOrType);
  return CATEGORY_DEFAULT_TIME_MODE[category];
}

// =============================================================================
// Display Labels
// =============================================================================

/**
 * Norwegian labels for new categories
 */
export const CATEGORY_LABELS_NB: Record<RentalObjectCategory, string> = {
  LOKALER_OG_BANER: 'Lokaler og baner',
  UTSTYR_OG_INVENTAR: 'Utstyr og inventar',
  KJORETOY_OG_TRANSPORT: 'Kjøretøy og transport',
  OPPLEVELSER_OG_ARRANGEMENT: 'Opplevelser og arrangement',
};

/**
 * English labels for new categories
 */
export const CATEGORY_LABELS_EN: Record<RentalObjectCategory, string> = {
  LOKALER_OG_BANER: 'Spaces & Courts',
  UTSTYR_OG_INVENTAR: 'Equipment & Inventory',
  KJORETOY_OG_TRANSPORT: 'Vehicles & Transport',
  OPPLEVELSER_OG_ARRANGEMENT: 'Experiences & Events',
};

/**
 * Get display label for a category
 */
export function getCategoryLabel(
  category: RentalObjectCategory,
  locale: 'nb' | 'en' = 'nb'
): string {
  const labels = locale === 'nb' ? CATEGORY_LABELS_NB : CATEGORY_LABELS_EN;
  return labels[category] || category;
}

/**
 * Category icons (icon names for use with icon libraries)
 */
export const CATEGORY_ICONS: Record<RentalObjectCategory, string> = {
  LOKALER_OG_BANER: 'building',
  UTSTYR_OG_INVENTAR: 'package',
  KJORETOY_OG_TRANSPORT: 'car',
  OPPLEVELSER_OG_ARRANGEMENT: 'calendar',
};

// =============================================================================
// API Endpoint Migration
// =============================================================================

/**
 * New API endpoints (preferred)
 */
export const RENTAL_OBJECT_ENDPOINTS = {
  base: '/api/rental-objects',
  byId: (id: string) => `/api/rental-objects/${id}`,
  bySlug: (slug: string) => `/api/rental-objects/slug/${slug}`,
  availability: (id: string) => `/api/rental-objects/${id}/availability`,
  calendarConfig: (id: string) => `/api/rental-objects/${id}/calendar-config`,
  stats: (id: string) => `/api/rental-objects/${id}/stats`,
  media: (id: string) => `/api/rental-objects/${id}/media`,
  publish: (id: string) => `/api/rental-objects/${id}/publish`,
  unpublish: (id: string) => `/api/rental-objects/${id}/unpublish`,
  archive: (id: string) => `/api/rental-objects/${id}/archive`,
  restore: (id: string) => `/api/rental-objects/${id}/restore`,
  duplicate: (id: string) => `/api/rental-objects/${id}/duplicate`,
} as const;

/**
 * Legacy API endpoints (deprecated)
 * @deprecated Use RENTAL_OBJECT_ENDPOINTS instead
 */
export const LEGACY_LISTING_ENDPOINTS = {
  base: '/api/listings',
  byId: (id: string) => `/api/listings/${id}`,
  bySlug: (slug: string) => `/api/listings/slug/${slug}`,
} as const;

// =============================================================================
// Import/Hook Migration Guide
// =============================================================================

/**
 * Migration mapping for hooks
 * Use this as a reference when migrating from listing to rental object hooks
 */
export const HOOK_MIGRATION_MAP = {
  // List hooks
  useListings: 'useRentalObjects',
  usePublicListings: 'usePublicRentalObjects',
  useFeaturedListings: 'useFeaturedRentalObjects',
  // Detail hooks
  useListing: 'useRentalObject',
  useListingBySlug: 'useRentalObjectBySlug',
  usePublicListing: 'usePublicRentalObject',
  // CRUD hooks
  useCreateListing: 'useCreateRentalObject',
  useUpdateListing: 'useUpdateRentalObject',
  useDeleteListing: 'useDeleteRentalObject',
  usePublishListing: 'usePublishRentalObject',
  useUnpublishListing: 'useUnpublishRentalObject',
  useArchiveListing: 'useArchiveRentalObject',
  useRestoreListing: 'useRestoreRentalObject',
  useDuplicateListing: 'useDuplicateRentalObject',
  // Stats & Availability
  useListingAvailability: 'useRentalObjectAvailability',
  useListingStats: 'useRentalObjectStats',
  // Media
  useUploadListingMedia: 'useUploadRentalObjectMedia',
  useDeleteListingMedia: 'useDeleteRentalObjectMedia',
} as const;

/**
 * Migration mapping for services
 */
export const SERVICE_MIGRATION_MAP = {
  ListingService: 'RentalObjectService',
  PublicListingService: 'PublicRentalObjectService',
  listingService: 'rentalObjectService',
  publicListingService: 'publicRentalObjectService',
} as const;

/**
 * Migration mapping for types
 */
export const TYPE_MIGRATION_MAP = {
  Listing: 'RentalObject',
  ListingV2: 'RentalObject',
  CreateListingDTO: 'CreateRentalObjectDTO',
  UpdateListingDTO: 'UpdateRentalObjectDTO',
  ListingQueryParams: 'RentalObjectQueryParams',
  ListingAvailability: 'RentalObjectAvailability',
  ListingStats: 'RentalObjectStats',
  UiListing: 'UiRentalObject',
} as const;
