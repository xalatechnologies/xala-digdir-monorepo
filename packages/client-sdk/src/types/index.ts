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

// Domain types
export * from './listing';
export * from './booking';
export * from './organization';
export * from './auth';
export * from './review';
export * from './settings';
export * from './upload';
export * from './search';
export * from './economy';

// Notification types (selective exports to avoid conflicts)
export type {
  PushPermissionState,
  BookingNotificationType,
  PushSubscription,
  // NotificationPreferences is already exported from organization.ts
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
