/**
 * Core Types - Enums and Base Types
 * Single Responsibility: Define all enumeration and base types
 */

// =============================================================================
// Status Enums
// =============================================================================

export type ListingType = 'SPACE' | 'RESOURCE' | 'SERVICE' | 'EVENT' | 'VEHICLE' | 'OTHER';
export type BookingModel = 'TIME_RANGE' | 'SLOT' | 'ALL_DAY' | 'QUANTITY' | 'CAPACITY' | 'PACKAGE';
export type ListingStatus = 'draft' | 'published' | 'archived' | 'maintenance';
export type BookingStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed';
export type PaymentStatus = 'unpaid' | 'paid' | 'partial' | 'refunded';
export type AllocationStatus = 'confirmed' | 'pending' | 'blocked' | 'maintenance';
export type SeasonalLeaseStatus = 'active' | 'upcoming' | 'expired' | 'cancelled';
export type ConversationStatus = 'active' | 'resolved' | 'archived';
export type OrganizationStatus = 'active' | 'inactive' | 'suspended';
export type UserStatus = 'active' | 'inactive' | 'suspended';
export type UserRole = 'super_admin' | 'admin' | 'saksbehandler' | 'user';
export type ActorType = 'private' | 'business' | 'sports_club' | 'youth_organization' | 'school' | 'municipality';
export type MessageSenderType = 'user' | 'admin' | 'system';
export type ReportPeriod = 'day' | 'week' | 'month' | 'quarter' | 'year';
export type ExportFormat = 'pdf' | 'excel' | 'csv';
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
