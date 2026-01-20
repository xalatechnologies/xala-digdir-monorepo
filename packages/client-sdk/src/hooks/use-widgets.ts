/**
 * Widget Hooks
 * Single Responsibility: React Query hooks for embeddable widgets
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from './query-keys';
import { widgetService } from '@/services/widget.service';
import type { CreateWidgetDTO } from '@/services/widget.service';

// ============================================================================
// Widget Query Hooks
// ============================================================================

/**
 * Get all widgets
 */
export function useWidgets() {
  return useQuery({
    queryKey: queryKeys.widgets.list(),
    queryFn: () => widgetService.getAll(),
  });
}

/**
 * Get single widget by ID
 */
export function useWidget(id: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: queryKeys.widgets.detail(id),
    queryFn: () => widgetService.getById(id),
    enabled: !!id && (options?.enabled ?? true),
  });
}

/**
 * Get embed code for a widget
 */
export function useWidgetEmbedCode(id: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: queryKeys.widgets.embedCode(id),
    queryFn: () => widgetService.getEmbedCode(id),
    enabled: !!id && (options?.enabled ?? true),
  });
}

/**
 * Get widget preview (returns HTML)
 */
export function useWidgetPreview(id: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: queryKeys.widgets.preview(id),
    queryFn: () => widgetService.preview(id),
    enabled: !!id && (options?.enabled ?? true),
  });
}

// ============================================================================
// Widget Mutation Hooks
// ============================================================================

/**
 * Create widget mutation
 */
export function useCreateWidget() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateWidgetDTO) => widgetService.create(data),
    onSuccess: () => {
      // Invalidate all widget lists
      queryClient.invalidateQueries({ queryKey: queryKeys.widgets.lists() });
    },
  });
}

/**
 * Update widget mutation
 */
export function useUpdateWidget() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateWidgetDTO> }) =>
      widgetService.update(id, data),
    onSuccess: (_, { id }) => {
      // Invalidate specific widget detail
      queryClient.invalidateQueries({ queryKey: queryKeys.widgets.detail(id) });
      // Invalidate all widget lists
      queryClient.invalidateQueries({ queryKey: queryKeys.widgets.lists() });
      // Invalidate embed code since settings might have changed
      queryClient.invalidateQueries({ queryKey: queryKeys.widgets.embedCode(id) });
      // Invalidate preview since settings might have changed
      queryClient.invalidateQueries({ queryKey: queryKeys.widgets.preview(id) });
    },
  });
}

/**
 * Delete widget mutation
 */
export function useDeleteWidget() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => widgetService.deleteById(id),
    onSuccess: () => {
      // Invalidate all widget-related queries
      queryClient.invalidateQueries({ queryKey: queryKeys.widgets.all });
    },
  });
}
