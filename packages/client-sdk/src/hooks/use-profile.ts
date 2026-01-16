/**
 * Profile Hooks
 * React Query hooks for user profile operations
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { profileService } from '../services/profile.service';

export const profileKeys = {
  all: ['profile'] as const,
  current: () => [...profileKeys.all, 'current'] as const,
};

/**
 * Get current user's profile
 * 
 * @example
 * ```tsx
 * function ProfilePage() {
 *   const { data, isLoading } = useProfile();
 *   if (isLoading) return <Spinner />;
 *   return <ProfileCard profile={data?.data} />;
 * }
 * ```
 */
export function useProfile(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: profileKeys.current(),
    queryFn: () => profileService.getProfile(),
    enabled: options?.enabled ?? true,
  });
}

/**
 * Update current user's profile
 * 
 * @example
 * ```tsx
 * function EditProfileForm() {
 *   const { mutate: updateProfile, isPending } = useUpdateProfile();
 *   
 *   const handleSubmit = (data: UpdateProfileDTO) => {
 *     updateProfile(data, {
 *       onSuccess: () => toast.success('Profile updated'),
 *     });
 *   };
 *   
 *   return <Form onSubmit={handleSubmit} disabled={isPending} />;
 * }
 * ```
 */
export function useUpdateProfile() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: Parameters<typeof profileService.updateProfile>[0]) => 
      profileService.updateProfile(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: profileKeys.all });
    },
  });
}
