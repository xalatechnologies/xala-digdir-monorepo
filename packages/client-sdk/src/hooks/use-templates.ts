/**
 * Templates Hooks
 * React Query hooks for message templates
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { templatesService, CreateTemplateDTO, UpdateTemplateDTO, TemplatePreviewRequest } from '@/services/templates.service';

// Query key factory
export const templateKeys = {
  all: ['templates'] as const,
  lists: () => [...templateKeys.all, 'list'] as const,
  list: (filters?: { type?: string; isActive?: boolean }) => [...templateKeys.lists(), filters] as const,
  details: () => [...templateKeys.all, 'detail'] as const,
  detail: (id: string) => [...templateKeys.details(), id] as const,
  preview: (id: string) => [...templateKeys.all, 'preview', id] as const,
};

/**
 * List all templates
 */
export function useTemplates(query?: { type?: string; isActive?: boolean }) {
  return useQuery({
    queryKey: templateKeys.list(query),
    queryFn: () => templatesService.list(query),
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Get single template
 */
export function useTemplate(id: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: templateKeys.detail(id),
    queryFn: () => templatesService.getById(id),
    enabled: !!id && (options?.enabled ?? true),
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Create template mutation
 */
export function useCreateTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateTemplateDTO) => templatesService.create(data),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: templateKeys.lists() });
      if (result.data) {
        queryClient.setQueryData(templateKeys.detail(result.data.id), result);
      }
    },
  });
}

/**
 * Update template mutation
 */
export function useUpdateTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateTemplateDTO }) =>
      templatesService.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: templateKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: templateKeys.lists() });
    },
  });
}

/**
 * Delete template mutation
 */
export function useDeleteTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => templatesService.deleteTemplate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: templateKeys.lists() });
    },
  });
}

/**
 * Preview template mutation
 */
export function usePreviewTemplate() {
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data?: TemplatePreviewRequest }) =>
      templatesService.preview(id, data),
  });
}

/**
 * Test send template mutation
 */
export function useTestSendTemplate() {
  return useMutation({
    mutationFn: ({ id, email, variables }: { id: string; email: string; variables?: Record<string, string> }) =>
      templatesService.testSend(id, email, variables),
  });
}
