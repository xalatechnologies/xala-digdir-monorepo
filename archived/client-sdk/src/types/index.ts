/**
 * Types Index - Public API
 * Exports all type definitions for the SDK
 */

// Core types
export * from './enums';

// Domain types
export * from './listing';
export {
  transformListing,
  transformListings,
  mapPricingUnit,
  getListingTypeLabel,
  LISTING_TYPE_LABELS,
  LISTING_TYPE_OPTIONS,
  CAPACITY_OPTIONS,
} from './listing';
export type { UiListing } from './listing';
export * from './booking';
export * from './organization';
export * from './auth';
export * from './settings';

// Additional types that don't fit a single domain
export type {
  // Seasonal Lease types
  SeasonalLease,
  CreateSeasonalLeaseDTO,
  UpdateSeasonalLeaseDTO,
  SeasonalLeaseQueryParams,
  // Conversation types
  Conversation,
  Message,
  CreateConversationDTO,
  SendMessageDTO,
  ConversationQueryParams,
  // Dashboard & Reports
  DashboardKPIs,
  UsageReport,
  RevenueReport,
  BookingReport,
  BookingStats,
  ReportQueryParams,
  ExportFormat,
  // Audit
  AuditEvent,
  AuditQueryParams,
  // Discount Codes
  DiscountCode,
  CreateDiscountCodeDTO,
  ValidateDiscountResult,
  // Share
  ShareLink,
  CreateShareLinkDTO,
} from './additional';
