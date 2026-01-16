/**
 * Metadata Types
 *
 * Dynamic metadata for categories, time modes, pricing units, and statuses.
 * Replaces hardcoded SDK enums with server-driven metadata.
 *
 * @see /reports/DECOUPLED_ARCHITECTURE_PLAN.md
 */

/**
 * Base metadata item
 */
export interface MetadataItem {
  key: string; // Unique identifier (e.g., 'LOKALER_OG_BANER')
  label: string; // i18n key (e.g., 'metadata.category.LOKALER_OG_BANER')
  description?: string; // Optional description
  sortOrder: number; // Display order
  enabled: boolean; // Whether this option is active
  metadata?: Record<string, unknown>; // Additional properties
}

/**
 * Category metadata
 */
export interface CategoryMetadata extends MetadataItem {
  icon?: string; // Icon name or URL
  color?: string; // Theme color
  parentKey?: string; // Parent category for hierarchical categories
}

/**
 * Time mode metadata
 */
export interface TimeModeMetadata extends MetadataItem {
  defaultDuration?: number; // Default duration in minutes
  allowCustomDuration: boolean; // Whether custom durations are allowed
  minimumDuration?: number; // Minimum duration in minutes
  maximumDuration?: number; // Maximum duration in minutes
}

/**
 * Pricing unit metadata
 */
export interface PricingUnitMetadata extends MetadataItem {
  duration?: number; // Duration in minutes (for time-based units)
  abbreviation: string; // Short form (e.g., 'hr', 'day')
}

/**
 * Status metadata
 */
export interface StatusMetadata extends MetadataItem {
  statusType: 'rental-object' | 'booking' | 'user' | 'organization';
  color: string; // Status color (success, warning, error, info)
  transitions: string[]; // Allowed next statuses
}

/**
 * Metadata response envelope
 */
export interface MetadataResponse<T extends MetadataItem = MetadataItem> {
  items: T[];
  totalCount: number;
  lastUpdated: string; // ISO timestamp
  version: string; // Metadata version for cache invalidation
}

/**
 * Metadata filter options
 */
export interface MetadataFilter {
  enabled?: boolean; // Filter by enabled status
  parentKey?: string; // Filter by parent (for categories)
  statusType?: string; // Filter by status type
}
