/**
 * Org Dashboard Hooks
 * React Query hooks for organization-scoped dashboard operations
 */
import { useQuery } from '@tanstack/react-query';
import { orgDashboardService } from '../services/org-dashboard.service';
import type {
  CalendarPreviewParams,
  PaginationParams,
} from '../types/org-dashboard';

// Query keys for org dashboard
export const orgDashboardKeys = {
  all: ['org-dashboard'] as const,
  stats: () => [...orgDashboardKeys.all, 'stats'] as const,
  pendingItems: (params?: PaginationParams) =>
    [...orgDashboardKeys.all, 'pending-items', params] as const,
  calendarPreview: (params?: CalendarPreviewParams) =>
    [...orgDashboardKeys.all, 'calendar-preview', params] as const,
  alerts: () => [...orgDashboardKeys.all, 'alerts'] as const,
  assignedRentalObjects: () =>
    [...orgDashboardKeys.all, 'assigned-rental-objects'] as const,
};

/**
 * Fetch org dashboard stats for assigned rental objects
 */
export function useOrgDashboardStats() {
  return useQuery({
    queryKey: orgDashboardKeys.stats(),
    queryFn: () => orgDashboardService.getStats(),
  });
}

/**
 * Fetch pending items (bookings needing approval) for assigned objects
 */
export function useOrgPendingItems(params?: PaginationParams) {
  return useQuery({
    queryKey: orgDashboardKeys.pendingItems(params),
    queryFn: () => orgDashboardService.getPendingItems(params),
  });
}

/**
 * Fetch calendar preview for assigned objects
 */
export function useOrgCalendarPreview(params?: CalendarPreviewParams) {
  return useQuery({
    queryKey: orgDashboardKeys.calendarPreview(params),
    queryFn: () => orgDashboardService.getCalendarPreview(params),
  });
}

/**
 * Fetch operational alerts for assigned objects
 */
export function useOrgAlerts() {
  return useQuery({
    queryKey: orgDashboardKeys.alerts(),
    queryFn: () => orgDashboardService.getAlerts(),
  });
}

/**
 * Fetch list of assigned rental objects
 */
export function useAssignedRentalObjects() {
  return useQuery({
    queryKey: orgDashboardKeys.assignedRentalObjects(),
    queryFn: () => orgDashboardService.getAssignedRentalObjects(),
  });
}
