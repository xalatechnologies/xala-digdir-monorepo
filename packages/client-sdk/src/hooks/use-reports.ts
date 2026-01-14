/**
 * Report Hooks
 * React Query hooks for analytics and reporting
 */
import { useQuery, useMutation } from '@tanstack/react-query';
import { reportsService } from '../services/reports.service';
import { dashboardService } from '../services/dashboard.service';
import type { ReportQueryParams, ExportFormat } from '../types';

// Query keys for reports
export const reportKeys = {
  all: ['reports'] as const,
  dashboard: () => [...reportKeys.all, 'dashboard'] as const,
  kpis: () => [...reportKeys.all, 'kpis'] as const,
  activity: (limit?: number) => [...reportKeys.all, 'activity', { limit }] as const,
  pending: () => [...reportKeys.all, 'pending'] as const,
  upcoming: (limit?: number) => [...reportKeys.all, 'upcoming', { limit }] as const,
  quickActions: () => [...reportKeys.all, 'quick-actions'] as const,
  bookings: (params: ReportQueryParams) => [...reportKeys.all, 'bookings', params] as const,
  revenue: (params: ReportQueryParams) => [...reportKeys.all, 'revenue', params] as const,
  usage: (params: ReportQueryParams) => [...reportKeys.all, 'usage', params] as const,
  utilization: (params: ReportQueryParams) => [...reportKeys.all, 'utilization', params] as const,
};

/**
 * Fetch dashboard KPIs
 */
export function useDashboardKPIs() {
  return useQuery({
    queryKey: reportKeys.kpis(),
    queryFn: () => dashboardService.getKPIs(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Fetch dashboard statistics (bookings, revenue, listings, users)
 */
export function useDashboardStats() {
  return useQuery({
    queryKey: reportKeys.dashboard(),
    queryFn: () => dashboardService.getStats(),
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Fetch recent activity feed
 */
export function useDashboardActivity(limit = 10) {
  return useQuery({
    queryKey: reportKeys.activity(limit),
    queryFn: () => dashboardService.getRecentActivity(limit),
    staleTime: 60 * 1000, // 1 minute
  });
}

/**
 * Fetch pending items count (bookings, messages, approvals)
 */
export function usePendingItems() {
  return useQuery({
    queryKey: reportKeys.pending(),
    queryFn: () => dashboardService.getPendingItems(),
    staleTime: 60 * 1000,
  });
}

/**
 * Fetch upcoming bookings for today
 */
export function useUpcomingBookings(limit = 5) {
  return useQuery({
    queryKey: reportKeys.upcoming(limit),
    queryFn: () => dashboardService.getUpcomingBookings(limit),
    staleTime: 60 * 1000,
  });
}

/**
 * Fetch quick actions for current user
 */
export function useQuickActions() {
  return useQuery({
    queryKey: reportKeys.quickActions(),
    queryFn: () => dashboardService.getQuickActions(),
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Fetch booking statistics/report
 */
export function useBookingStats(params: ReportQueryParams) {
  return useQuery({
    queryKey: reportKeys.bookings(params),
    queryFn: () => reportsService.getBookingReport(params),
    // Enable if we have dates OR period
    enabled: (!!params.startDate && !!params.endDate) || !!params.period,
  });
}

/**
 * Fetch revenue report
 */
export function useRevenueReport(params: ReportQueryParams) {
  return useQuery({
    queryKey: reportKeys.revenue(params),
    queryFn: () => reportsService.getRevenueReport(params),
    enabled: (!!params.startDate && !!params.endDate) || !!params.period,
  });
}

/**
 * Fetch usage/utilization report
 */
export function useUsageReport(params: ReportQueryParams) {
  return useQuery({
    queryKey: reportKeys.usage(params),
    queryFn: () => reportsService.getUtilizationReport(params),
    enabled: (!!params.startDate && !!params.endDate) || !!params.period,
  });
}

/**
 * Export report data
 */
export function useExportReport() {
  return useMutation({
    mutationFn: ({
      type,
      params,
      format = 'csv',
    }: {
      type: string;
      params: ReportQueryParams;
      format?: ExportFormat;
    }) => reportsService.export(type, params, format),
  });
}
