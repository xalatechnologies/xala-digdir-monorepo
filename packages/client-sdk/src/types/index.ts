/**
 * Types Index - Public API
 * Exports all type definitions for the SDK
 */

// Core types
export * from './enums';

// Authorization types (ActionCode enums + helpers)
export * from './actions';

// Projection Registry (cost classification + metadata)
export * from './projection-registry';

// Projection DTOs (screen-ready, flat data structures)
export * from './projection-dtos';

// Rental Object types - Primary type system for utleieobjekter
export * from './rental-object';
export * from './booking';
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
