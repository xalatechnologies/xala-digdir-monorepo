/**
 * Org Dashboard Types
 * Types for organization-scoped dashboard data
 */

/**
 * Stats for org_admin/org_member dashboard
 */
export interface OrgDashboardStatsDTO {
  assignedRentalObjects: number;
  pendingBookings: number;
  confirmedBookings: number;
  todayBookings: number;
  weekBookings: number;
  activeBlocks: number;
  monthRevenue: number;
}

/**
 * Pending booking item for work queue
 */
export interface OrgPendingItemDTO {
  id: string;
  rentalObjectId: string;
  rentalObjectName: string;
  userId: string;
  userName: string;
  startTime: string;
  endTime: string;
  status: string;
  totalPrice: number;
  notes?: string;
  createdAt: string;
}

/**
 * Calendar preview booking
 */
export interface CalendarBookingDTO {
  id: string;
  rentalObjectId: string;
  rentalObjectName: string;
  userId: string;
  userName: string;
  startTime: string;
  endTime: string;
  status: string;
  notes?: string;
}

/**
 * Calendar preview block
 */
export interface CalendarBlockDTO {
  id: string;
  rentalObjectId: string;
  rentalObjectName: string;
  title: string;
  reason?: string;
  startDate: string;
  endDate: string;
  allDay: boolean;
  status: string;
}

/**
 * Assigned rental object summary
 */
export interface AssignedRentalObjectDTO {
  id: string;
  name: string;
  slug: string;
  categoryKey: string;
  timeMode: string;
  status: string;
  capacity?: number;
}

/**
 * Calendar preview response
 */
export interface CalendarPreviewDTO {
  bookings: CalendarBookingDTO[];
  blocks: CalendarBlockDTO[];
  rentalObjects: AssignedRentalObjectDTO[];
  dateRange: {
    start: string;
    end: string;
  };
}

/**
 * Operational alert for org admin
 */
export interface OrgAlertDTO {
  id: string;
  type: 'warning' | 'info' | 'danger';
  title: string;
  description: string;
  resourceType: string;
  resourceId?: string;
  createdAt: string;
}

/**
 * Parameters for calendar preview query
 */
export interface CalendarPreviewParams {
  range?: 'day' | 'week' | 'month';
  startDate?: string;
  endDate?: string;
}

/**
 * Pagination parameters
 */
export interface PaginationParams {
  limit?: number;
  offset?: number;
}

/**
 * Paginated response
 */
export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    limit: number;
    offset: number;
  };
}
