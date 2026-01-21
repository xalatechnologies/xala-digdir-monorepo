/**
 * User Management Hooks (MinSide)
 * Production-ready hooks for user profile and preferences
 * 
 * Uses ProfileService and GdprService for API calls
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { profileService } from '@/services/profile.service';
import { gdprService } from '@/services/gdpr.service';
import type { 
  UserPreferences, 
  UpdatePreferencesDTO,
  UserProfile,
  UpdateProfileDTO,
} from '@/types/profile';
import type { GdprDataExport } from '@/types/gdpr';
import type { SingleResponse } from '@/types/enums';

/**
 * Query keys for user data
 */
export const userKeys = {
  all: ['user'] as const,
  profile: () => [...userKeys.all, 'profile'] as const,
  preferences: () => [...userKeys.all, 'preferences'] as const,
};

// Re-export types for consumers
export type { UserPreferences } from '@/types/profile';

/**
 * Get user preferences from the Profile API
 * Endpoint: GET /api/profile/preferences
 */
export function useUserPreferences() {
  return useQuery<SingleResponse<UserPreferences>>({
    queryKey: userKeys.preferences(),
    queryFn: async () => {
      return profileService.getPreferences();
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}

/**
 * Update user preferences
 * Endpoint: PUT /api/profile/preferences
 */
export function useUpdateUserPreferences() {
  const queryClient = useQueryClient();

  return useMutation<SingleResponse<UserPreferences>, Error, UpdatePreferencesDTO>({
    mutationFn: async (payload) => {
      return profileService.updatePreferences(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.preferences() });
      queryClient.invalidateQueries({ queryKey: ['session'] });
    },
  });
}

/**
 * Update current user profile
 * Endpoint: PUT /api/profile
 */
export function useUpdateCurrentUser() {
  const queryClient = useQueryClient();

  return useMutation<SingleResponse<UserProfile>, Error, UpdateProfileDTO>({
    mutationFn: async (payload) => {
      return profileService.updateProfile(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.profile() });
      queryClient.invalidateQueries({ queryKey: ['session'] });
    },
  });
}

/**
 * Delete user account (GDPR right to erasure)
 * Creates a GDPR deletion request
 * Endpoint: POST /api/gdpr/requests (type: deletion)
 */
export function useDeleteAccount() {
  const queryClient = useQueryClient();

  return useMutation<SingleResponse<unknown>, Error>({
    mutationFn: async () => {
      return gdprService.createRequest({ requestType: 'deletion' });
    },
    onSuccess: () => {
      // Clear all user data from cache
      queryClient.clear();
    },
  });
}

/**
 * Upload user avatar
 * Endpoint: PUT /api/profile (with avatar field)
 */
export function useUploadUserAvatar() {
  const queryClient = useQueryClient();

  return useMutation<SingleResponse<UserProfile>, Error, { avatar: string }>({
    mutationFn: async (payload) => {
      return profileService.updateProfile({ avatar: payload.avatar });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.profile() });
      queryClient.invalidateQueries({ queryKey: ['session'] });
    },
  });
}

/**
 * Export user data (GDPR right to data portability)
 * Endpoint: GET /api/gdpr/export
 */
export function useExportData() {
  return useMutation<SingleResponse<GdprDataExport>, Error>({
    mutationFn: async () => {
      return gdprService.exportData();
    },
  });
}

