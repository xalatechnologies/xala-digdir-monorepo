/**
 * Core Types - Enums and Base Types
 * Single Responsibility: Define all enumeration and base types
 */

// =============================================================================
// Status Enums
// =============================================================================

/** @deprecated Use ListingCategory instead */
export type ListingType = 'SPACE' | 'RESOURCE' | 'SERVICE' | 'EVENT' | 'VEHICLE' | 'OTHER';

/** @deprecated Use BookingTimeMode + ListingBookingFeatures instead */
export type BookingModel = 'TIME_RANGE' | 'SLOT' | 'ALL_DAY' | 'QUANTITY' | 'CAPACITY' | 'PACKAGE';

// =============================================================================
// V2 Category & Booking Model (New System)
// =============================================================================

/** 4 Top-Level Listing Categories */
export type ListingCategory =
  | 'LOKALER_OG_BANER'           // Lokaler og baner
  | 'UTSTYR_OG_INVENTAR'         // Utstyr og inventar
  | 'KJORETOY_OG_TRANSPORT'      // Kjøretøy og transport
  | 'OPPLEVELSER_OG_ARRANGEMENT'; // Opplevelser og arrangement

/** 3 Booking Time Modes */
export type BookingTimeMode = 'PERIOD' | 'SLOT' | 'ALL_DAY';

/** Inventory feature configuration */
export interface InventoryFeature {
  enabled: boolean;
  total: number;
  policy: 'FIFO' | 'CONCURRENT';
}

/** Shared capacity feature configuration */
export interface SharedCapacityFeature {
  enabled: boolean;
  total: number;
  policy: 'PER_SLOT' | 'PER_DAY';
}

/** Package definition */
export interface PackageDefinition {
  id: string;
  name: string;
  description?: string;
  price: number;
  currency: string;
  includedItems?: string[];
}

/** Packages feature configuration */
export interface PackagesFeature {
  enabled: boolean;
  items: PackageDefinition[];
}

/** Composable Booking Features */
export interface ListingBookingFeatures {
  inventory?: InventoryFeature;
  sharedCapacity?: SharedCapacityFeature;
  packages?: PackagesFeature;
}

/** Listing Booking Configuration */
export interface ListingBookingConfig {
  timeMode: BookingTimeMode;
  features: ListingBookingFeatures;
}

/** Norwegian display labels for categories */
export const LISTING_CATEGORY_LABELS: Record<ListingCategory, string> = {
  LOKALER_OG_BANER: 'Lokaler og baner',
  UTSTYR_OG_INVENTAR: 'Utstyr og inventar',
  KJORETOY_OG_TRANSPORT: 'Kjøretøy og transport',
  OPPLEVELSER_OG_ARRANGEMENT: 'Opplevelser og arrangement',
};

/** Norwegian display labels for time modes */
export const BOOKING_TIME_MODE_LABELS: Record<BookingTimeMode, string> = {
  PERIOD: 'Tidsperiode',
  SLOT: 'Tidsluke',
  ALL_DAY: 'Heldags',
};

// =============================================================================
// Standard Status Enums
// =============================================================================

export type ListingStatus = 'draft' | 'published' | 'archived' | 'maintenance';
export type BookingStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed';
export type PaymentStatus = 'unpaid' | 'paid' | 'partial' | 'refunded';
export type AllocationStatus = 'confirmed' | 'pending' | 'blocked' | 'maintenance';
export type SeasonalLeaseStatus = 'draft' | 'pending' | 'approved' | 'active' | 'expired' | 'cancelled';
export type ConversationStatus = 'active' | 'resolved' | 'archived';
export type OrganizationStatus = 'active' | 'inactive' | 'suspended';
export type UserStatus = 'active' | 'inactive' | 'suspended';
export type UserRole = 'super_admin' | 'admin' | 'saksbehandler' | 'user';
export type ActorType = 'private' | 'business' | 'sports_club' | 'youth_organization' | 'school' | 'municipality';
export type MessageSenderType = 'user' | 'admin' | 'system';
export type ReportPeriod = 'day' | 'week' | 'month' | 'quarter' | 'year';
export type ExportFormat = 'csv' | 'xlsx' | 'pdf' | 'json';
export type DiscountType = 'percentage' | 'fixed';
export type PricingUnit = 'hour' | 'day' | 'booking' | 'week' | 'month';


// =============================================================================
// Base Interfaces
// =============================================================================

/** Base entity with common fields */
export interface BaseEntity {
  id: string;
  createdAt: string;
  updatedAt: string;
}

/** Tenant-scoped entity */
export interface TenantEntity extends BaseEntity {
  tenantId: string;
}

/** Pagination metadata */
export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/** Paginated response wrapper */
export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}

/** Single resource response */
export interface SingleResponse<T> {
  data: T;
}

/** Error response structure */
export interface ErrorResponse {
  error: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
}

/** Success response for mutations */
export interface SuccessResponse {
  success: boolean;
}

/** Base query params for listings */
export interface BaseQueryParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}
