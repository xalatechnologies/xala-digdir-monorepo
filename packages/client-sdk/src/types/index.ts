/**
 * Types Index - Public API
 * Exports all type definitions for the SDK
 *
 * NOTE: Types are now sourced from @xala/contracts for schema-agnostic architecture.
 * Legacy types are re-exported for backward compatibility.
 */

// =============================================================================
// Re-export from @xala/contracts (Schema-Agnostic Contracts)
// These are the canonical type definitions derived from Zod schemas.
// =============================================================================

// Projection types from contracts
export type {
  RentalObjectCardProjection,
  RentalObjectDetailsProjection,
  RentalObjectSearchResultProjection,
  BookingCardProjection,
  BookingDetailsProjection,
  BookingReceiptProjection,
  CalendarEventProjection,
  OrganizationCardProjection,
  OrganizationDetailsProjection,
  MemberProjection,
  UserCardProjection,
  UserDetailsProjection,
  CurrentUserProjection,
} from '@xala/contracts/projections';

// Capability types from contracts
export type {
  Capability,
  UIHints,
  FeatureFlags,
  CapabilitiesResponse,
  CapabilityKey,
} from '@xala/contracts/schemas';

export {
  CAPABILITIES,
} from '@xala/contracts/schemas';

// =============================================================================
// Legacy Types (for backward compatibility)
// =============================================================================

// Core types
export * from './enums';

// Feature flags & tenant controls
export * from './feature-flags';

// Booking Engine Contracts (Contract-First DTOs)
export * from './booking-contracts';

// Advanced Feature Contracts (Contract-First DTOs)
export * from './advanced-contracts';

// Authorization types (ActionCode enums + helpers)
export * from './actions';

// Projection Registry (cost classification + metadata)
export * from './projection-registry';

// Projection DTOs (screen-ready, flat data structures)
export * from './projection-dtos';

// Domain types (rental-object types - export selectively to avoid conflicts with enums)
export type {
  RentalObjectCategory,
  // BookingTimeMode - exported from enums instead
  RentalObjectStatus,
  // PricingUnit - exported from enums instead
  RentalObjectPricing,
  RentalObjectLocation,
  // InventoryFeature - exported from enums instead
  // SharedCapacityFeature - exported from enums instead
  // PackagesFeature - exported from enums instead
  // PackageDefinition - exported from enums instead
  BookingFeatures,
  RentalObjectRules,
  RentalObjectMetadata,
  RentalObject,
  CreateRentalObjectDTO,
  UpdateRentalObjectDTO,
  RentalObjectQueryParams,
  RentalObjectsResponse,
  RentalObjectResponse,
  UiRentalObject,
  RentalObjectAvailability,
  AvailabilityQueryParams,
  TimeSlot,
  RentalObjectStats,
  CalendarGranularity,
  BookingMode,
  BookingModeConfig,
  RentalObjectCalendarConfig,
  PublicRentalObjectParams,
  City,
  Municipality,
} from './rental-object';

export {
  RENTAL_OBJECT_CATEGORIES,
  BOOKING_TIME_MODES,
  CATEGORY_LABELS,
  TIME_MODE_LABELS,
  CATEGORY_OPTIONS,
  getCategoryLabel,
  getTimeModeLabel,
  mapPricingUnit,
  toUiRentalObject,
  toUiRentalObjects,
} from './rental-object';

export * from './booking';
export * from './organization';
export * from './gdpr';
export * from './auth';
export * from './rbac';
export * from './review';
export * from './settings';
export * from './upload';
export * from './search';
export * from './economy';

// SaaS and Tenant Admin types
export * from './saas';
export * from './tenant-admin';
// Notification types
export * from './notification-system';

// Push notification types (excluding conflicting NotificationPreferences)
export type {
  PushPermissionState,
  BookingNotificationType,
  PushSubscription,
  // NotificationPreferences - exported from organization.ts instead
  RegisterPushSubscriptionDTO,
  UpdateNotificationPreferencesDTO,
  PushNotificationPayload,
  PushNotificationData,
  PushNotificationAction,
  NotificationEvent,
  NotificationDeliveryStatusType,
  DeliveryAttempt,
  NotificationDeliveryStatus,
  DeliveryReport,
  DeliveryReportQueryParams,
} from './push-notification';

// Notification preferences matrix
export * from './notification-preferences';

// Additional types that don't fit a single domain
export type {
  // Seasonal Lease types
  SeasonalLease,
  CreateSeasonalLeaseDTO,
  UpdateSeasonalLeaseDTO,
  SeasonalLeaseQueryParams,
  // Season types
  Season,
  SeasonStatus,
  CreateSeasonDTO,
  UpdateSeasonDTO,
  SeasonQueryParams,
  // Season Application types
  SeasonApplication,
  CreateSeasonApplicationDTO,
  SeasonApplicationQueryParams,
  AllocateApplicationDTO,
  FinalizeSeasonAllocationsDTO,
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
  ReportQueryParams,
  TimeSlotHeatmap,
  SeasonalPattern,
  PeriodComparison,
  // Audit
  AuditEvent,
  AuditQueryParams,
  // Discount Codes
  DiscountCode,
  CreateDiscountCodeDTO,
  ValidateDiscountResult,
  // Calendar Blocks
  BlockType,
  Block,
  RecurrenceRule,
  CreateBlockDTO,
  UpdateBlockDTO,
  Conflict,
  ConflictsResponse,
  ConflictCheckParams,
  // Share
  ShareLink,
  CreateShareLinkDTO,
} from './additional';
