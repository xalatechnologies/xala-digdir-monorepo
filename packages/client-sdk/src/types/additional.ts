/**
 * Additional Types
 * Types that don't fit into the main domain categories
 */

import type { TenantEntity, SeasonalLeaseStatus, ConversationStatus, MessageSenderType, ReportPeriod, DiscountType, BaseQueryParams } from './enums';

// =============================================================================
// Seasonal Lease
// =============================================================================

export interface SeasonalLease extends TenantEntity {
  listingId: string;
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
  listingId: string;
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
  listingId?: string;
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
  // Display/denormalized fields (populated by backend)
  userName?: string;
  userEmail?: string;
}

export interface Message {
  id: string;
  conversationId: string;
  senderType: MessageSenderType;
  senderId?: string;
  senderName: string;
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
  topListings: Array<{
    id: string;
    name: string;
    bookings: number;
    revenue: number;
  }>;
}

export interface UsageReport {
  period: string;
  listingId: string;
  listingName: string;
  totalBookings: number;
  totalHours: number;
  utilizationRate: number;
  revenue: number;
}

export interface RevenueReport {
  totalCents: number;
  data: Array<{
    period: string;
    amountCents: number;
  }>;
}

export interface BookingReport {
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
  startDate: string;
  endDate: string;
  listingId?: string;
  organizationId?: string;
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
  listingIds?: string[];
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
  listingIds?: string[];
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
  listingId: string;
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
  listingId: string;
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
  listingId: string;
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
