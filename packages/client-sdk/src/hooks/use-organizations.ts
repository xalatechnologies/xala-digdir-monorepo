/**
 * Organization & User Hooks
 * Single Responsibility: React Query hooks for organizations and users
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from './query-keys';
import { organizationService, userService } from '../services/organization.service';
import type {
  CreateOrganizationDTO,
  UpdateOrganizationDTO,
  OrganizationQueryParams,
  CreateUserDTO,
  UpdateUserDTO,
  UserQueryParams,
  ConsentSettings
} from '../types/organization';
import type { UploadOptions } from '../types/upload';
import { compressImage, isImageFile } from '../utils/image-compression';

// ============================================================================
// Organization Hooks
// ============================================================================

/**
 * Get paginated organizations
 */
export function useOrganizations(params?: OrganizationQueryParams) {
  return useQuery({
    queryKey: queryKeys.organizations.list(params),
    queryFn: () => organizationService.getAll(params),
  });
}

/**
 * Get single organization by ID
 */
export function useOrganization(id: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: queryKeys.organizations.detail(id),
    queryFn: () => organizationService.getById(id),
    enabled: !!id && (options?.enabled ?? true),
  });
}

/**
 * Get organization members
 */
export function useOrganizationMembers(id: string) {
  return useQuery({
    queryKey: queryKeys.organizations.members(id),
    queryFn: () => organizationService.getMembers(id),
    enabled: !!id,
  });
}

/**
 * Create organization mutation
 */
export function useCreateOrganization() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: CreateOrganizationDTO) => organizationService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.organizations.lists() });
    },
  });
}

/**
 * Update organization mutation
 */
export function useUpdateOrganization() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateOrganizationDTO }) => 
      organizationService.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.organizations.detail(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.organizations.lists() });
    },
  });
}

/**
 * Delete organization mutation
 */
export function useDeleteOrganization() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => organizationService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.organizations.all });
    },
  });
}

/**
 * Verify organization mutation
 */
export function useVerifyOrganization() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => organizationService.requestVerification(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.organizations.detail(id) });
    },
  });
}

// ============================================================================
// Organization Media Hooks
// ============================================================================

interface UploadLogoParams {
  id: string;
  file: File;
  options?: UploadOptions;
}

/**
 * Upload logo to an organization
 * Uses proper multipart/form-data upload with optional compression and progress tracking
 */
export function useUploadOrganizationLogo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, file, options }: UploadLogoParams) => {
      // Compress image if enabled (default: true)
      const shouldCompress = options?.compress !== false;
      let processedFile = file;

      if (shouldCompress && isImageFile(file)) {
        try {
          processedFile = await compressImage(file, options?.compressionOptions);
        } catch (_error) {
          // If compression fails, use original file
          processedFile = file;
        }
      }

      // Upload using multipart/form-data
      return organizationService.uploadLogo(id, [processedFile], options);
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.organizations.detail(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.organizations.lists() });
    },
  });
}

// ============================================================================
// User Hooks
// ============================================================================

/**
 * Get paginated users
 */
export function useUsers(params?: UserQueryParams) {
  return useQuery({
    queryKey: queryKeys.users.list(params),
    queryFn: () => userService.getAll(params),
  });
}

/**
 * Get single user by ID
 */
export function useUser(id: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: queryKeys.users.detail(id),
    queryFn: () => userService.getById(id),
    enabled: !!id && (options?.enabled ?? true),
  });
}

/**
 * Get current user
 */
export function useCurrentUser() {
  return useQuery({
    queryKey: queryKeys.users.me(),
    queryFn: () => userService.getCurrentUser(),
  });
}

/**
 * Create user mutation
 */
export function useCreateUser() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: CreateUserDTO) => userService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.lists() });
    },
  });
}

/**
 * Update user mutation
 */
export function useUpdateUser() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateUserDTO }) => 
      userService.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.detail(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.users.lists() });
    },
  });
}

/**
 * Update current user mutation
 */
export function useUpdateCurrentUser() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: UpdateUserDTO) => userService.updateCurrentUser(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.me() });
    },
  });
}

/**
 * Deactivate user mutation
 */
export function useDeactivateUser() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => userService.deactivate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
    },
  });
}

/**
 * Reactivate user mutation
 */
export function useReactivateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => userService.reactivate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
    },
  });
}

// ============================================================================
// User Media Hooks
// ============================================================================

interface UploadAvatarParams {
  id: string;
  file: File;
  options?: UploadOptions;
}

/**
 * Upload avatar to a user
 * Uses proper multipart/form-data upload with optional compression and progress tracking
 */
export function useUploadUserAvatar() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, file, options }: UploadAvatarParams) => {
      // Compress image if enabled (default: true)
      const shouldCompress = options?.compress !== false;
      let processedFile = file;

      if (shouldCompress && isImageFile(file)) {
        try {
          processedFile = await compressImage(file, options?.compressionOptions);
        } catch (_error) {
          // If compression fails, use original file
          processedFile = file;
        }
      }

      // Upload using multipart/form-data
      return userService.uploadAvatar(id, [processedFile], options);
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.detail(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.users.lists() });
    },
  });
}

// ============================================================================
// GDPR Hooks
// ============================================================================

/**
 * Export user data mutation
 */
export function useExportData() {
  return useMutation({
    mutationFn: () => userService.exportData(),
  });
}

/**
 * Delete account mutation
 */
export function useDeleteAccount() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: () => userService.deleteAccount(),
    onSuccess: () => {
      queryClient.clear();
    },
  });
}

/**
 * Get consent settings
 */
export function useConsents() {
  return useQuery({
    queryKey: queryKeys.users.consents(),
    queryFn: () => userService.getConsents(),
  });
}

/**
 * Update consent settings mutation
 */
export function useUpdateConsents() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (consents: Partial<ConsentSettings>) => userService.updateConsents(consents),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.consents() });
    },
  });
}
