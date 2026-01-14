/**
 * Types Index - Public API
 * Exports all type definitions for the SDK
 */

// Core types
export * from './enums';

// Domain types
export * from './listing';
export * from './booking';
export * from './organization';
export * from './auth';
export * from './settings';
export * from './upload';
export * from './search';

// Additional types that don't fit a single domain
export type {
  // Seasonal Lease types
  SeasonalLease,
  CreateSeasonalLeaseDTO,
  UpdateSeasonalLeaseDTO,
  SeasonalLeaseQueryParams,
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
