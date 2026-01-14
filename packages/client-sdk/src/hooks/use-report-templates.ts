/**
 * Report Templates Hooks
 * Single Responsibility: React Query hooks for report templates
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from './query-keys';
import { reportTemplatesService } from '../services/report-templates.service';
import type {
  CreateReportTemplateDTO,
  UpdateReportTemplateDTO,
} from '../types';
import type { ReportTemplateQueryParams } from '../services/report-templates.service';

// ============================================================================
// Report Templates Hooks
// ============================================================================

/**
 * Get paginated report templates
 */
export function useReportTemplates(params?: ReportTemplateQueryParams) {
  return useQuery({
    queryKey: queryKeys.reportTemplates.list(params),
    queryFn: () => reportTemplatesService.getAll(params),
  });
}

/**
 * Get single report template by ID
 */
export function useReportTemplate(id: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: queryKeys.reportTemplates.detail(id),
    queryFn: () => reportTemplatesService.getById(id),
    enabled: !!id && (options?.enabled ?? true),
  });
}

/**
 * Get system report templates (pre-built templates)
 */
export function useSystemReportTemplates() {
  return useQuery({
    queryKey: queryKeys.reportTemplates.system(),
    queryFn: () => reportTemplatesService.getSystemTemplates(),
  });
}

/**
 * Create report template mutation
 */
export function useCreateReportTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateReportTemplateDTO) => reportTemplatesService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.reportTemplates.all });
    },
  });
}

/**
 * Update report template mutation
 */
export function useUpdateReportTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateReportTemplateDTO }) =>
      reportTemplatesService.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.reportTemplates.detail(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.reportTemplates.lists() });
    },
  });
}

/**
 * Delete report template mutation
 */
export function useDeleteReportTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => reportTemplatesService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.reportTemplates.all });
    },
  });
}

/**
 * Duplicate report template mutation
 */
export function useDuplicateReportTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, name }: { id: string; name?: string }) =>
      reportTemplatesService.duplicate(id, name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.reportTemplates.all });
    },
  });
}
