/**
 * Consent Hooks (GDPR)
 * TEMPORARY STUB - To be implemented when backend is ready
 *
 * This stub allows the app to load without breaking on missing import.
 * Returns empty consents until backend API is implemented.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export interface Consent {
  id: string;
  userId: string;
  type: 'marketing' | 'analytics' | 'essential' | 'preferences';
  granted: boolean;
  grantedAt?: string;
  revokedAt?: string;
  version: string;
}

interface ConsentsResponse {
  data: Consent[];
}

interface UpdateConsentPayload {
  type: Consent['type'];
  granted: boolean;
}

/**
 * Fetch user's consent preferences
 *
 * TODO: Implement when backend endpoint is ready
 * Expected endpoint: GET /api/gdpr/consents
 */
export function useConsents() {
  return useQuery<ConsentsResponse>({
    queryKey: ['consents'],
    queryFn: async () => {
      // STUB: Return empty array until backend is ready
      return {
        data: [],
      };
    },
    // Disable refetching since this is a stub
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    staleTime: Infinity,
  });
}

/**
 * Update user's consent preferences
 *
 * TODO: Implement when backend endpoint is ready
 * Expected endpoint: POST /api/gdpr/consents
 */
export function useUpdateConsents() {
  const queryClient = useQueryClient();

  return useMutation<ConsentsResponse, Error, UpdateConsentPayload>({
    mutationFn: async (payload) => {
      // STUB: Return unchanged data until backend is ready
      return {
        data: [],
      };
    },
    onSuccess: () => {
      // Invalidate consents query to refetch
      queryClient.invalidateQueries({ queryKey: ['consents'] });
    },
  });
}

/**
 * Check if a specific consent is granted
 */
export function useHasConsent(type: Consent['type']) {
  const { data } = useConsents();
  const consent = data?.data.find(c => c.type === type);
  return consent?.granted ?? false;
}
