/**
 * Reports Hooks
 * React Query hooks for reporting and analytics
 */

import { useQuery, useMutation } from '@tanstack/react-query';
import { reportsService } from '../services/reports.service';
import type { ReportQueryParams, ExportFormat } from '../types';

// Query keys
export const reportKeys = {
  all: ['reports'] as const,
  dashboard: () => [...reportKeys.all, 'dashboard'] as const,
  usage: (params?: ReportQueryParams) => [...reportKeys.all, 'usage', params] as const,
  revenue: (params?: ReportQueryParams) => [...reportKeys.all, 'revenue', params] as const,
  stats: (params?: ReportQueryParams) => [...reportKeys.all, 'stats', params] as const,
};

/**
 * Get dashboard KPIs
 */
export function useDashboardKPIs() {
  return useQuery({
    queryKey: reportKeys.dashboard(),
    queryFn: () => reportsService.getDashboardKPIs(),
  });
}

/**
 * Get usage report
 */
export function useUsageReport(params?: ReportQueryParams) {
  return useQuery({
    queryKey: reportKeys.usage(params),
    queryFn: () => reportsService.getUsageReport(params),
  });
}

/**
 * Get revenue report
 */
export function useRevenueReport(params?: ReportQueryParams) {
  return useQuery({
    queryKey: reportKeys.revenue(params),
    queryFn: () => reportsService.getRevenueReport(params),
  });
}

/**
 * Get booking stats
 */
export function useBookingStats(params?: ReportQueryParams) {
  return useQuery({
    queryKey: reportKeys.stats(params),
    queryFn: () => reportsService.getBookingStats(params),
  });
}

/**
 * Export report mutation
 */
export function useExportReport() {
  return useMutation({
    mutationFn: ({
      type,
      format,
      params,
    }: {
      type: 'usage' | 'revenue' | 'bookings';
      format: ExportFormat;
      params?: ReportQueryParams;
    }) => reportsService.exportReport(type, format, params),
  });
}
