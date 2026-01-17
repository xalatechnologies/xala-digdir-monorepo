/**
 * User Management Hooks (MinSide)
 * TEMPORARY STUBS - To be implemented when backend is ready
 *
 * These stubs allow the app to load without breaking on missing imports.
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export interface UserPreferences {
  language?: 'nb' | 'en';
  notifications?: {
    email?: boolean;
    sms?: boolean;
    push?: boolean;
  };
  theme?: 'light' | 'dark' | 'auto';
}

interface UserPreferencesResponse {
  data: UserPreferences;
}

interface UpdateUserPayload {
  name?: string;
  email?: string;
  phone?: string;
}

interface UploadAvatarPayload {
  file: File;
}

/**
 * Get user preferences
 * TODO: Implement when backend is ready
 */
export function useUserPreferences() {
  return useQuery<UserPreferencesResponse>({
    queryKey: ['user', 'preferences'],
    queryFn: async () => {
      return {
        data: {
          language: 'nb',
          theme: 'auto',
          notifications: {
            email: true,
            sms: false,
            push: false,
          },
        },
      };
    },
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    staleTime: Infinity,
  });
}

/**
 * Update user preferences
 * TODO: Implement when backend is ready
 */
export function useUpdateUserPreferences() {
  const queryClient = useQueryClient();

  return useMutation<UserPreferencesResponse, Error, Partial<UserPreferences>>({
    mutationFn: async (payload) => {
      // STUB: Return unchanged until backend ready
      return {
        data: payload as UserPreferences,
      };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user', 'preferences'] });
    },
  });
}

/**
 * Update current user profile
 * TODO: Implement when backend is ready
 */
export function useUpdateCurrentUser() {
  const queryClient = useQueryClient();

  return useMutation<{ data: any }, Error, UpdateUserPayload>({
    mutationFn: async (payload) => {
      // STUB: Return unchanged until backend ready
      return {
        data: payload,
      };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['session'] });
      queryClient.invalidateQueries({ queryKey: ['user'] });
    },
  });
}

/**
 * Delete user account (GDPR right to erasure)
 * TODO: Implement when backend is ready
 */
export function useDeleteAccount() {
  const queryClient = useQueryClient();

  return useMutation<{ success: boolean }, Error>({
    mutationFn: async () => {
      // STUB: Simulate deletion
      return { success: true };
    },
    onSuccess: () => {
      // Clear all user data from cache
      queryClient.clear();
    },
  });
}

/**
 * Upload user avatar
 * TODO: Implement when backend is ready
 */
export function useUploadUserAvatar() {
  const queryClient = useQueryClient();

  return useMutation<{ data: { avatarUrl: string } }, Error, UploadAvatarPayload>({
    mutationFn: async (payload) => {
      // STUB: Return placeholder URL
      return {
        data: {
          avatarUrl: '/placeholder-avatar.png',
        },
      };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['session'] });
      queryClient.invalidateQueries({ queryKey: ['user'] });
    },
  });
}

/**
 * Export user data (GDPR right to data portability)
 * TODO: Implement when backend is ready
 */
export function useExportData() {
  return useMutation<{ data: any }, Error>({
    mutationFn: async () => {
      // STUB: Return empty data
      return {
        data: {},
      };
    },
  });
}
