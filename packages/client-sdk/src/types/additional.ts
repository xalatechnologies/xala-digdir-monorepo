/**
 * Additional Types
 * Types that don't fit into the main domain categories
 */

import type { TenantEntity, SeasonalLeaseStatus, ConversationStatus, MessageSenderType, ReportPeriod, DiscountType, BaseQueryParams } from './enums';

// =============================================================================
// Seasonal Lease
// =============================================================================

export interface SeasonalLease extends TenantEntity {
  rentalObjectId: string;
  organizationId: string;
  startDate: string;
  endDate: string;
  weekdays: number[];
  startTime: string;
  endTime: string;
  status: SeasonalLeaseStatus;
  totalPrice: number;
  currency: string;
  notes?: string;
}

export interface CreateSeasonalLeaseDTO {
  rentalObjectId: string;
  organizationId: string;
  startDate: string;
  endDate: string;
  weekdays: number[];
  startTime: string;
  endTime: string;
  totalPrice?: number;
  notes?: string;
}

export interface UpdateSeasonalLeaseDTO {
  weekdays?: number[];
  startTime?: string;
  endTime?: string;
  totalPrice?: number;
  notes?: string;
}

export interface SeasonalLeaseQueryParams extends BaseQueryParams {
  status?: SeasonalLeaseStatus;
  organizationId?: string;
  rentalObjectId?: string;
}

// =============================================================================
// Seasons
// =============================================================================

export type SeasonStatus = 'draft' | 'open' | 'closed' | 'active' | 'completed' | 'cancelled';

export interface Season extends TenantEntity {
  name: string;
  startDate: string;
  endDate: string;
  applicationDeadline: string;
  description?: string;
  status: SeasonStatus;
  totalApplications?: number;
  approvedApplications?: number;
  allocatedApplications?: number;
  metadata?: Record<string, unknown>;
}

export interface CreateSeasonDTO {
  name: string;
  startDate: string;
  endDate: string;
  applicationDeadline: string;
  description?: string;
  metadata?: Record<string, unknown>;
}

export interface UpdateSeasonDTO {
  name?: string;
  startDate?: string;
  endDate?: string;
  applicationDeadline?: string;
  description?: string;
  metadata?: Record<string, unknown>;
}

export interface SeasonQueryParams extends BaseQueryParams {
  status?: SeasonStatus;
  year?: number;
}

// =============================================================================
// Season Applications
// =============================================================================

export interface SeasonApplication extends TenantEntity {
  seasonId: string;
  rentalObjectId: string;
  rentalObjectName?: string;
  organizationId: string;
  organizationName?: string;
  applicantName: string;
  applicantEmail: string;
  applicantPhone?: string;
  weekday: number;
  startTime: string;
  endTime: string;
  status: 'pending' | 'approved' | 'rejected' | 'allocated';
  priority?: number;
  notes?: string;
  rejectionReason?: string;
  metadata?: Record<string, unknown>;
}

export interface CreateSeasonApplicationDTO {
  seasonId: string;
  rentalObjectId: string;
  organizationId: string;
  applicantName: string;
  applicantEmail: string;
  applicantPhone?: string;
  weekday: number;
  startTime: string;
  endTime: string;
  notes?: string;
  metadata?: Record<string, unknown>;
}

export interface SeasonApplicationQueryParams extends BaseQueryParams {
  seasonId?: string;
  rentalObjectId?: string;
  organizationId?: string;
  status?: string;
}

export interface AllocateApplicationDTO {
  applicationId: string;
  generateRecurring?: boolean;
}

export interface FinalizeSeasonAllocationsDTO {
  seasonId: string;
  sendNotifications?: boolean;
}

// =============================================================================
// Conversations & Messages
// =============================================================================

export interface Conversation extends TenantEntity {
  userId: string;
  bookingId?: string;
  subject?: string;
  status: ConversationStatus;
  unreadCount: number;
  lastMessageAt?: string;
  lastMessagePreview?: string;
  lastMessage?: string;
  // Display/denormalized fields (populated by backend)
  userName?: string;
  userEmail?: string;
  userPhone?: string;
}

export interface Message {
  id: string;
  conversationId: string;
  senderType: MessageSenderType;
  senderId?: string;
  senderName: string;
  sender?: string;
  content: string;
  attachments?: string[];
  readAt?: string;
  createdAt: string;
}

export interface CreateConversationDTO {
  userId?: string;
  bookingId?: string;
  subject?: string;
  initialMessage?: string;
}

export interface SendMessageDTO {
  content: string;
  attachments?: string[];
}

export interface ConversationQueryParams extends BaseQueryParams {
  status?: ConversationStatus;
  unreadOnly?: boolean;
}

// =============================================================================
// Dashboard & Reports
// =============================================================================

export interface DashboardKPIs {
  activeListings: number;
  pendingRequests: number;
  todayBookings: number;
  weekBookings: number;
  monthRevenue: number;
  previousMonthRevenue: number;
  revenueGrowth: number;
  periodRevenue: number;
  revenueChange?: number;
  topListings: Array<{
    id: string;
    name: string;
    bookings: number;
    revenue: number;
  }>;
}

export interface UsageReport {
  period: string;
  rentalObjectId: string;
  rentalObjectName: string;
  totalBookings: number;
  bookingCount: number;
  totalHours: number;
  utilizationRate: number;
  revenue: number;
}

export interface RevenueReport {
  period: string;
  revenue: number;
  totalRevenue: number;
  transactions: number;
}

export interface BookingReport {
  totalBookings: number;
  confirmedBookings: number;
  pendingBookings: number;
  cancelledBookings: number;
  averageDuration: number;
  data: Array<{
    date: string;
    confirmed: number;
    cancelled: number;
    pending: number;
    revenue: number;
  }>;
}

export interface ReportQueryParams {
  period?: ReportPeriod;
  startDate?: string;
  endDate?: string;
  rentalObjectId?: string;
  organizationId?: string;
}

// =============================================================================
// Analytics
// =============================================================================

export interface TimeSlotHeatmap {
  dayOfWeek: number;
  hour: number;
  bookingCount: number;
  utilizationRate: number;
}

export interface SeasonalPattern {
  period: string;
  year: number;
  bookingCount: number;
  revenue: number;
  utilizationRate: number;
}

export interface PeriodComparison {
  current: {
    startDate: string;
    endDate: string;
    bookingCount: number;
    revenue: number;
    utilizationRate: number;
  };
  previous: {
    startDate: string;
    endDate: string;
    bookingCount: number;
    revenue: number;
    utilizationRate: number;
  };
  percentageChange: {
    bookings: number;
    revenue: number;
    utilization: number;
  };
}

export interface EnhancedReportFilter extends ReportQueryParams {
  facilityId?: string;
  bookingType?: string;
}

// =============================================================================
// Audit
// =============================================================================

export interface AuditEvent {
  id: string;
  tenantId: string;
  userId?: string;
  userName?: string;
  resource: string;
  action: 'create' | 'read' | 'update' | 'delete';
  resourceId?: string;
  changes?: {
    before?: Record<string, unknown>;
    after?: Record<string, unknown>;
  };
  ipAddress?: string;
  userAgent?: string;
  timestamp: string;
}

export interface AuditQueryParams extends BaseQueryParams {
  resource?: string;
  action?: string;
  userId?: string;
  resourceId?: string;
  startDate?: string;
  endDate?: string;
}

// =============================================================================
// Discount Codes
// =============================================================================

export interface DiscountCode {
  id: string;
  code: string;
  description?: string;
  type: DiscountType;
  value: number;
  minBookingValue?: number;
  maxUses?: number;
  usedCount: number;
  validFrom?: string;
  validUntil?: string;
  rentalObjectIds?: string[];
  actorTypes?: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateDiscountCodeDTO {
  code: string;
  description?: string;
  type: DiscountType;
  value: number;
  minBookingValue?: number;
  maxUses?: number;
  validFrom?: string;
  validUntil?: string;
  rentalObjectIds?: string[];
  actorTypes?: string[];
}

export interface ValidateDiscountResult {
  valid: boolean;
  code?: DiscountCode;
  discountAmount?: number;
  reason?: string;
}

// =============================================================================
// Calendar Blocks
// =============================================================================

export type BlockType = 'maintenance' | 'closed' | 'hold' | 'emergency' | 'internal';

export interface Block {
  id: string;
  tenantId: string;
  rentalObjectId: string;
  title: string;
  startTime: string;
  endTime: string;
  blockType: BlockType;
  status: 'active' | 'cancelled';
  notes?: string;
  recurrenceRule?: RecurrenceRule;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface RecurrenceRule {
  frequency: 'daily' | 'weekly' | 'monthly';
  interval: number;
  weekdays?: number[];
  endDate?: string;
  exceptions?: string[];
}

export interface CreateBlockDTO {
  rentalObjectId: string;
  title: string;
  startTime: string;
  endTime: string;
  blockType: BlockType;
  allDay?: boolean;
  notes?: string;
  recurrence?: RecurrenceRule;
  notifyAffectedUsers?: boolean;
}

export interface UpdateBlockDTO {
  title?: string;
  startTime?: string;
  endTime?: string;
  blockType?: BlockType;
  notes?: string;
  recurrence?: RecurrenceRule;
}

export interface Conflict {
  type: 'booking' | 'block' | 'allocation' | 'seasonal';
  id: string;
  title: string;
  startTime: string;
  endTime: string;
  resolvable: boolean;
}

export interface ConflictsResponse {
  hasConflicts: boolean;
  conflicts: Conflict[];
}

export interface ConflictCheckParams {
  rentalObjectId: string;
  startTime: string;
  endTime: string;
  excludeBlockId?: string;
}

// =============================================================================
// Share Links
// =============================================================================

export interface ShareLink {
  token: string;
  type: 'listing' | 'booking';
  resourceId: string;
  expiresAt: string;
  url: string;
  createdAt: string;
}

export interface CreateShareLinkDTO {
  type: 'listing' | 'booking';
  resourceId: string;
  expiresIn?: number;
}
