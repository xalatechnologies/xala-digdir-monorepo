/**
 * Help Hooks
 * React Query hooks for help, FAQ, guides, and support
 * KRAV-SUP-01, KRAV-SUP-03
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { helpService } from '@/services/help.service';

// Query keys for cache management
export const helpKeys = {
  all: ['help'] as const,
  faq: (category?: string) => [...helpKeys.all, 'faq', category] as const,
  toc: (app: string, role: string) => [...helpKeys.all, 'toc', app, role] as const,
  guides: (role: string) => [...helpKeys.all, 'guides', role] as const,
  training: () => [...helpKeys.all, 'training'] as const,
  tooltips: () => [...helpKeys.all, 'tooltips'] as const,
};

/**
 * Get FAQ entries
 * @param category Optional category filter
 */
export function useFaq(category?: string) {
  return useQuery({
    queryKey: helpKeys.faq(category),
    queryFn: () => helpService.getFaq(category),
    staleTime: 15 * 60 * 1000, // 15 minutes - FAQs are relatively static
  });
}

/**
 * Get Table of Contents for help pages (right-side TOC)
 * @param app Application context (minside, backoffice, web)
 * @param role User role for filtering admin sections
 */
export function useHelpToc(app = 'minside', role = 'user') {
  return useQuery({
    queryKey: helpKeys.toc(app, role),
    queryFn: () => helpService.getToc(app, role),
    staleTime: 30 * 60 * 1000, // 30 minutes - TOC is very static
  });
}

/**
 * Get user guides by role
 * @param role User role (user, admin, case_handler)
 */
export function useGuides(role = 'user') {
  return useQuery({
    queryKey: helpKeys.guides(role),
    queryFn: () => helpService.getGuides(role),
    staleTime: 15 * 60 * 1000, // 15 minutes - guides rarely change
  });
}

/**
 * Get training plan and materials
 */
export function useTraining() {
  return useQuery({
    queryKey: helpKeys.training(),
    queryFn: () => helpService.getTraining(),
    staleTime: 15 * 60 * 1000, // 15 minutes - training content is stable
  });
}

/**
 * Get UI tooltips
 * Long staleTime since tooltips rarely change
 */
export function useTooltips() {
  return useQuery({
    queryKey: helpKeys.tooltips(),
    queryFn: () => helpService.getTooltips(),
    staleTime: Infinity, // Tooltips are static
  });
}

/**
 * Submit support contact form
 */
export function useSubmitContact() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: helpService.submitContact,
    onSuccess: () => {
      // Optionally invalidate any support-related queries
      queryClient.invalidateQueries({ queryKey: helpKeys.all });
    },
  });
}
