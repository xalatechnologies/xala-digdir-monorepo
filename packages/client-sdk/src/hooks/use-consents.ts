/**
 * Consent Hooks (GDPR)
 * Production-ready hooks for GDPR consent management
 * 
 * Uses GdprService to call /api/gdpr/consents endpoints
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { gdprService } from '@/services/gdpr.service';
import type { ConsentSettings, UpdateConsentDTO } from '@/types/gdpr';
import type { SingleResponse } from '@/types/enums';

// Re-export types for consumers
export type { ConsentSettings, UpdateConsentDTO };

/**
 * Query keys for consent data
 */
export const consentKeys = {
  all: ['consents'] as const,
  settings: () => [...consentKeys.all, 'settings'] as const,
};

/**
 * Fetch user's consent preferences from the GDPR API
 * Endpoint: GET /api/gdpr/consents
 */
export function useConsents() {
  return useQuery<SingleResponse<ConsentSettings>>({
    queryKey: consentKeys.settings(),
    queryFn: async () => {
      return gdprService.getConsents();
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
  });
}

/**
 * Update user's consent preferences
 * Endpoint: PUT /api/gdpr/consents
 */
export function useUpdateConsents() {
  const queryClient = useQueryClient();

  return useMutation<SingleResponse<ConsentSettings>, Error, UpdateConsentDTO>({
    mutationFn: async (payload) => {
      return gdprService.updateConsents(payload);
    },
    onSuccess: () => {
      // Invalidate consents query to refetch updated data
      queryClient.invalidateQueries({ queryKey: consentKeys.all });
    },
  });
}

/**
 * Check if a specific consent type is granted
 * @param type - The consent type to check ('marketing' | 'analytics' | 'thirdPartySharing')
 */
export function useHasConsent(type: 'marketing' | 'analytics' | 'thirdPartySharing') {
  const { data } = useConsents();
  
  if (!data?.data) return false;
  
  const consents = data.data;
  switch (type) {
    case 'marketing':
      return consents.marketing ?? false;
    case 'analytics':
      return consents.analytics ?? true; // Default to true for analytics
    case 'thirdPartySharing':
      return consents.thirdPartySharing ?? false;
    default:
      return false;
  }
}

