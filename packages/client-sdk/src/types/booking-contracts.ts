/**
 * Booking Engine Contracts (Contract-First DTOs)
 * 
 * These DTOs define the API contracts that drive the booking engine UI.
 * UI MUST NOT compute business logic - all logic comes from API.
 * 
 * Reference: Governance Audit Phase 3 - Canonical DTO Contract List
 * Created: 2026-01-17
 */

// =============================================================================
// Booking Policy Contract (GAP-001)
// =============================================================================

/**
 * Booking Policy DTO - Defines all booking rules for a rental object
 * API endpoint: GET /api/v1/rental-objects/:id/booking-policy
 */
export interface BookingPolicyDTO {
  rentalObjectId: string;
  
  /**
   * Available booking modes
   * UI uses this to show/hide mode options
   */
  modes: {
    single: boolean;        // One-time bookings
    range: boolean;         // Multi-hour/day ranges
    allDay: boolean;        // Full-day bookings
    recurring: boolean;     // Repeating schedules
    season: boolean;        // Season rentals
    activity: boolean;      // Event registration (fixed schedule)
  };
  
  /**
   * Time slot configuration
   * UI uses this to render slot picker
   */
  slots: {
    enabled: boolean;
    durationMinutes: number[];  // e.g., [30, 60, 120]
    gridStart: string;          // e.g., "08:00"
    gridEnd: string;            // e.g., "22:00"
  };
  
  /**
   * Booking constraints
   * UI enforces these before allowing submission
   */
  constraints: {
    minDurationMinutes: number;
    maxDurationMinutes: number;
    minNoticeDays: number;      // Minimum advance booking
    maxAdvanceDays: number;     // Maximum advance booking
    maxConcurrentBookings?: number;
  };
  
  /**
   * Business rules
   * UI uses these to show warnings/errors
   */
  rules: {
    requiresApproval: boolean;
    allowWeekends: boolean;
    allowHolidays: boolean;
    blackoutDates?: string[];  // ISO dates
    ageRestriction?: { min?: number; max?: number };
    customRules?: Array<{
      code: string;
      message: { nb: string; en: string };
    }>;
  };
}

// =============================================================================
// Payment Policy Contract (GAP-002)
// =============================================================================

/**
 * Payment Policy DTO - Defines payment requirements for a rental object
 * API endpoint: GET /api/v1/rental-objects/:id/payment-policy
 */
export interface PaymentPolicyDTO {
  rentalObjectId: string;
  
  /**
   * Approval workflow settings
   */
  requiresApproval: boolean;
  approvalWorkflow?: {
    roles: string[];  // e.g., ['ORG_ADMIN', 'TENANT_ADMIN']
    autoApproveForGroups?: string[];  // Pricing group IDs
    estimatedApprovalTime?: string;   // e.g., "24-48 hours"
  };
  
  /**
   * Deposit requirements
   */
  deposit: {
    required: boolean;
    type: 'PERCENTAGE' | 'FIXED';
    value: number;  // % or cents
    paymentTiming: 'BEFORE_SUBMIT' | 'AFTER_APPROVAL' | 'AT_CHECKIN';
  };
  
  /**
   * Payment options
   */
  payment: {
    payNowEnabled: boolean;
    payLaterEnabled: boolean;
    payOnlineRequired: boolean;
    providers: Array<'VIPPS' | 'STRIPE' | 'INVOICE'>;
  };
  
  /**
   * Cancellation policy
   */
  cancellation: {
    feeCents: number;
    freeCancellationHours: number;
    refundPolicy: {
      fullRefundHours: number;      // Full refund if cancelled this many hours before
      partialRefundHours: number;   // Partial refund window
      partialRefundPercent: number; // % refunded in partial window
    };
  };
}

// =============================================================================
// Price Preview Contract (GAP-004)
// =============================================================================

/**
 * Price Preview DTO - Complete price breakdown
 * API endpoint: POST /api/v1/bookings/preview-price
 */
export interface PricePreviewDTO {
  rentalObjectId: string;
  
  /**
   * Base price before any modifications
   */
  basePriceCents: number;
  
  /**
   * Itemized breakdown
   * UI renders this as a list
   */
  breakdown: Array<{
    label: string;
    amountCents: number;
    type: 'BASE' | 'DISCOUNT' | 'SURCHARGE' | 'ADDON' | 'DEPOSIT' | 'FEE';
    description?: string;
  }>;
  
  /**
   * Final totals
   */
  totalCents: number;
  depositCents: number;
  currency: string;
  
  /**
   * Pricing context
   */
  pricingGroupApplied?: string;  // e.g., 'CITIZEN', 'ORG_MEMBER'
  context: 'PRIVATE' | 'MEMBERSHIP_ORG';
  contextOrgId?: string;
  
  /**
   * Discount explanations
   */
  discountsApplied?: Array<{
    code: string;
    name: string;
    amountCents: number;
    reason: string;
  }>;
}

/**
 * Price Preview Request
 */
export interface PricePreviewRequest {
  rentalObjectId: string;
  startDate: string;  // ISO
  endDate: string;    // ISO
  startTime?: string; // HH:mm
  endTime?: string;   // HH:mm
  context: 'PRIVATE' | 'MEMBERSHIP_ORG';
  contextOrgId?: string;
  addonIds?: string[];
}

// =============================================================================
// Recurring Preview Contract (GAP-005)
// =============================================================================

/**
 * Recurring Booking Preview DTO - Shows all occurrences with conflicts
 * API endpoint: POST /api/v1/bookings/recurring/preview
 */
export interface RecurringPreviewDTO {
  /**
   * The requested pattern
   */
  pattern: {
    frequency: 'DAILY' | 'WEEKLY' | 'MONTHLY';
    interval: number;          // e.g., 1 = every week, 2 = every 2 weeks
    daysOfWeek?: number[];    // 0=Sunday, 6=Saturday
    startDate: string;
    endDate: string;
    occurrences: number;      // Total requested
  };
  
  /**
   * All occurrences with status
   * UI renders this as a table
   */
  results: Array<{
    date: string;             // ISO date
    startTime: string;        // HH:mm
    endTime: string;          // HH:mm
    status: 'AVAILABLE' | 'CONFLICT' | 'BLOCKED' | 'CLOSED';
    conflictReason?: string;
    conflictType?: 'EXISTING_BOOKING' | 'MAINTENANCE_BLOCK' | 'CLOSED_DAY' | 'RULE_VIOLATION';
    
    /**
     * Alternative suggestions for conflicts
     * UI shows these as options to accept
     */
    alternatives?: Array<{
      startTime: string;
      endTime: string;
      available: boolean;
      reason?: string;
    }>;
  }>;
  
  /**
   * Summary stats
   * UI shows this as a summary card
   */
  summary: {
    total: number;
    available: number;
    conflicts: number;
    blocked: number;
    canProceedStrict: boolean;    // All occurrences available
    canProceedWithSkips: boolean; // Some conflicts can be skipped
    wouldSkip: number;            // How many would be skipped
  };
}

/**
 * Recurring Preview Request
 */
export interface RecurringPreviewRequest {
  rentalObjectId: string;
  frequency: 'DAILY' | 'WEEKLY' | 'MONTHLY';
  interval: number;
  daysOfWeek?: number[];
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
  maxOccurrences?: number;
}

// =============================================================================
// Dynamic Tabs Contract (GAP-003)
// =============================================================================

/**
 * Tab Configuration DTO - Defines which tabs to show on details page
 * API endpoint: GET /api/v1/rental-objects/:id/tabs
 */
export interface TabConfigDTO {
  key: string;  // 'overview' | 'availability' | 'pricing' | 'activities' | 'reviews' | 'location'
  label: { nb: string; en: string };
  order: number;
  enabled: boolean;
  featureFlag?: string;  // e.g., 'feature.ratings_reviews'
  contentAvailable: boolean;  // False if no content exists
  icon?: string;  // Icon name from design system
}

// =============================================================================
// Calendar Data Contract (GAP-006)
// =============================================================================

/**
 * Calendar Data DTO - Availability calendar with statuses
 * API endpoint: GET /api/v1/calendar/rental-objects/:id
 */
export interface CalendarDataDTO {
  rentalObjectId: string;
  view: 'DAY' | 'WEEK' | 'MONTH' | 'TIMELINE';
  startDate: string;
  endDate: string;
  
  /**
   * Time slots with statuses
   * UI renders these with color coding
   */
  slots: Array<{
    date: string;
    startTime: string;
    endTime: string;
    status: 'AVAILABLE' | 'BUSY' | 'RESERVED' | 'BLOCKED' | 'CLOSED' | 'SURCHARGE';
    reason?: string;  // e.g., "Booking #1234", "Maintenance block", "Holiday"
    entityId?: string;  // Booking ID or block ID
    entityType?: 'BOOKING' | 'BLOCK' | 'RULE';
    metadata?: Record<string, unknown>;
  }>;
}

/**
 * Calendar Request
 */
export interface CalendarRequest {
  rentalObjectId: string;
  view: 'DAY' | 'WEEK' | 'MONTH' | 'TIMELINE';
  startDate: string;
  endDate: string;
}

// =============================================================================
// Block Management Contract (GAP-007)
// =============================================================================

/**
 * Block DTO - Maintenance/closure block
 * API endpoints: POST/GET/DELETE /api/v1/blocks
 */
export interface BlockDTO {
  id: string;
  rentalObjectId: string;
  type: 'MAINTENANCE' | 'EVENT_PRIORITY' | 'CLOSED_DAY' | 'CUSTOM';
  startDate: string;
  endDate: string;
  startTime?: string;  // For partial-day blocks
  endTime?: string;
  
  /**
   * Recurring block configuration
   */
  recurring?: {
    frequency: 'DAILY' | 'WEEKLY' | 'MONTHLY';
    daysOfWeek?: number[];
    endDate?: string;  // When recurring pattern ends
  };
  
  reason: string;
  notes?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Create Block Request
 */
export interface CreateBlockRequest {
  rentalObjectId: string;
  type: 'MAINTENANCE' | 'EVENT_PRIORITY' | 'CLOSED_DAY' | 'CUSTOM';
  startDate: string;
  endDate: string;
  startTime?: string;
  endTime?: string;
  recurring?: {
    frequency: 'DAILY' | 'WEEKLY' | 'MONTHLY';
    daysOfWeek?: number[];
    endDate?: string;
  };
  reason: string;
  notes?: string;
}
