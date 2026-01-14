/**
 * Scheduled Reports Hooks
 * Single Responsibility: React Query hooks for scheduled reports
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from './query-keys';
import { scheduledReportsService } from '../services/scheduled-reports.service';
import type {
  ScheduledReportQueryParams,
  CreateScheduledReportDTO,
  UpdateScheduledReportDTO,
} from '../types/additional';

// ============================================================================
// Query Hooks
// ============================================================================

/**
 * Get paginated scheduled reports
 */
export function useScheduledReports(params?: ScheduledReportQueryParams) {
  return useQuery({
    queryKey: queryKeys.scheduledReports.list(params),
    queryFn: () => scheduledReportsService.getAll(params),
  });
}

/**
 * Get single scheduled report by ID
 */
export function useScheduledReport(id: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: queryKeys.scheduledReports.detail(id),
    queryFn: () => scheduledReportsService.getById(id),
    enabled: !!id && (options?.enabled ?? true),
  });
}

/**
 * Get active scheduled reports
 */
export function useActiveScheduledReports() {
  return useQuery({
    queryKey: queryKeys.scheduledReports.active(),
    queryFn: () => scheduledReportsService.getActive(),
  });
}

/**
 * Get scheduled reports by report type
 */
export function useScheduledReportsByType(reportType: string) {
  return useQuery({
    queryKey: queryKeys.scheduledReports.byType(reportType),
    queryFn: () => scheduledReportsService.getByReportType(reportType),
    enabled: !!reportType,
  });
}

// ============================================================================
// Mutation Hooks
// ============================================================================

/**
 * Create scheduled report mutation
 */
export function useCreateScheduledReport() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateScheduledReportDTO) => scheduledReportsService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.scheduledReports.all });
    },
  });
}

/**
 * Update scheduled report mutation
 */
export function useUpdateScheduledReport() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateScheduledReportDTO }) =>
      scheduledReportsService.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.scheduledReports.detail(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.scheduledReports.lists() });
    },
  });
}

/**
 * Delete scheduled report mutation
 */
export function useDeleteScheduledReport() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => scheduledReportsService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.scheduledReports.all });
    },
  });
}

/**
 * Pause scheduled report mutation
 */
export function usePauseScheduledReport() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => scheduledReportsService.pause(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.scheduledReports.detail(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.scheduledReports.lists() });
      queryClient.invalidateQueries({ queryKey: queryKeys.scheduledReports.active() });
    },
  });
}

/**
 * Resume scheduled report mutation
 */
export function useResumeScheduledReport() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => scheduledReportsService.resume(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.scheduledReports.detail(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.scheduledReports.lists() });
      queryClient.invalidateQueries({ queryKey: queryKeys.scheduledReports.active() });
    },
  });
}

/**
 * Trigger manual run of scheduled report mutation
 */
export function useTriggerScheduledReport() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => scheduledReportsService.triggerRun(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.scheduledReports.detail(id) });
      // Also invalidate report history when a new job is triggered
      queryClient.invalidateQueries({ queryKey: queryKeys.reports.all });
    },
  });
}
