/**
 * Types Index - Public API
 * Exports all type definitions for the SDK
 */

// Core types (excluding types that are re-defined in rental-object.ts)
export {
  // Deprecated types (kept for backwards compatibility)
  type ListingType,
  type BookingModel,
  // New V2 types from enums.ts
  type ListingCategory,
  type InventoryFeature,
  type SharedCapacityFeature,
  type PackageDefinition,
  type PackagesFeature,
  type ListingBookingFeatures,
  type ListingBookingConfig,
  LISTING_CATEGORY_LABEL_KEYS,
  BOOKING_TIME_MODE_LABEL_KEYS,
  LISTING_CATEGORY_LABELS,
  BOOKING_TIME_MODE_LABELS,
  // Standard status enums
  type ListingStatus,
  type BookingStatus,
  type PaymentStatus,
  type AllocationStatus,
  type SeasonalLeaseStatus,
  type ConversationStatus,
  type OrganizationStatus,
  type UserStatus,
  type UserRole,
  type ActorType,
  type MessageSenderType,
  type ReportPeriod,
  type ExportFormat,
  type DiscountType,
  // Base interfaces
  type BaseEntity,
  type TenantEntity,
  type PaginationMeta,
  type PaginatedResponse,
  type SingleResponse,
  type ErrorResponse,
  type SuccessResponse,
  type BaseQueryParams,
} from './enums';

// Authorization types (ActionCode enums + helpers)
export * from './actions';

// Projection Registry (cost classification + metadata)
export * from './projection-registry';

// Projection DTOs (screen-ready, flat data structures)
export * from './projection-dtos';

// Rental Object types - Primary type system for utleieobjekter
export * from './rental-object';

// Booking types - exclude BookingMode (conflicts with rental-object.ts)
export {
  type Booking,
  type CreateBookingDTO,
  type UpdateBookingDTO,
  type CancelBookingDTO,
  type BookingQueryParams,
  type Allocation,
  type CreateAllocationDTO,
  type CalendarEvent,
  type CalendarQueryParams,
  type BookingPricing,
  type BookingMetadata,
  type RecurringConstraintsDTO,
  type InGameConstraintsDTO,
  type PaymentTransaction,
  type BookingReceipt,
  type BookingDocument,
  type RecurringFrequency,
  type OccurrenceStatus,
  type RecurringEndConditionType,
  type RecurringEndCondition,
  type RecurringOccurrenceDTO,
  type BookingSelectionDTO,
  type RecurringSummary,
  type RecurringPreviewProjectionDTO,
  type CreateRecurringBookingDTO,
  type RecurringOccurrenceResultDTO,
  type RecurringBookingResultProjectionDTO,
  type BookingMode as LegacyBookingMode,
} from './booking';
export * from './organization';
export * from './auth';
export * from './profile';
export * from './review';
export * from './settings';
export * from './upload';
export * from './search';
export * from './economy';
// Calendar types - exclude duplicates that are also in listing.ts
// CalendarGranularity and ListingCalendarConfigProjectionDTO are defined in both files with different values
export {
  type SlotStatus,
  type SelectableUnit,
  type CalendarView,
  type DayOpeningHours,
  type OpeningHoursException,
  type OpeningHoursDTO,
  type BookingTypeDTO,
  type CalendarUIConfigDTO,
  type CalendarPermissionsDTO,
  type AvailabilityCellDTO,
  type SlotStatusLegendDTO,
  type ListingAvailabilityMatrixProjectionDTO,
  type AvailabilityMatrixQueryParams,
  SLOT_STATUS_LABELS,
  SLOT_STATUS_LABEL_KEYS,
  CALENDAR_GRANULARITY_LABELS,
  DEFAULT_SLOT_STATUS_LEGEND,
} from './calendar';

// Push notification and notification preferences types
export * from './push-notification';

// Notification System types (complete notification system)
// Exclude types that conflict with push-notification
export {
  type NotificationDTO,
  type NotificationListResponse,
  type NotificationCountResponse,
  type NotificationStatsResponse,
  type NotificationQueryParams,
  type NotificationTemplateDTO,
  type CreateTemplateDTO,
  type UpdateTemplateDTO,
  type TemplatePreviewRequest,
  type TemplatePreviewResponse,
  type SendNotificationDTO,
  type SendNotificationResponse,
  type BroadcastNotificationDTO,
  type BroadcastNotificationResponse,
  type AvailableChannelsResponse,
  type RateLimitsResponse,
  // Export with different names to avoid conflict
  type NotificationType as SystemNotificationType,
  type NotificationChannel as SystemNotificationChannel,
} from './notification-system';

// GDPR Consent types
export * from './gdpr';

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
