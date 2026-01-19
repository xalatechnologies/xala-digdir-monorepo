/**
 * Permission Assignment Hooks
 * React Query hooks for RBAC permission management
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from './query-keys';
import { permissionAssignmentService } from '../services/permission-assignment.service';
import type { PermissionAssignmentQueryParams, CreatePermissionAssignmentDTO, UpdatePermissionAssignmentDTO } from '../types';

export function usePermissionAssignments(params?: PermissionAssignmentQueryParams) {
  return useQuery({
    queryKey: queryKeys.permissionAssignments.list(params),
    queryFn: () => permissionAssignmentService.getAll(params),
  });
}

export function useUserPermissions(userId: string) {
  return useQuery({
    queryKey: queryKeys.permissionAssignments.forUser(userId),
    queryFn: () => permissionAssignmentService.getForUser(userId),
    enabled: !!userId,
  });
}

export function useOrganizationPermissions(organizationId: string) {
  return useQuery({
    queryKey: queryKeys.permissionAssignments.forOrganization(organizationId),
    queryFn: () => permissionAssignmentService.getForOrganization(organizationId),
    enabled: !!organizationId,
  });
}

export function useEffectivePermissions(userId: string) {
  return useQuery({
    queryKey: queryKeys.permissionAssignments.effective(userId),
    queryFn: () => permissionAssignmentService.getEffectivePermissions(userId),
    enabled: !!userId,
  });
}

export function usePermissionAuditLog(userId: string) {
  return useQuery({
    queryKey: queryKeys.permissionAssignments.auditLog(userId),
    queryFn: () => permissionAssignmentService.getAuditLog(userId),
    enabled: !!userId,
  });
}

export function useCreatePermissionAssignment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreatePermissionAssignmentDTO) => permissionAssignmentService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.permissionAssignments.all });
    },
  });
}

export function useUpdatePermissionAssignment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdatePermissionAssignmentDTO }) => 
      permissionAssignmentService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.permissionAssignments.all });
    },
  });
}

export function useDeletePermissionAssignment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => permissionAssignmentService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.permissionAssignments.all });
    },
  });
}

export function useBulkAssignPermissions() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, permissions }: { userId: string; permissions: string[] }) => 
      permissionAssignmentService.bulkAssign(userId, permissions),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.permissionAssignments.forUser(variables.userId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.permissionAssignments.effective(variables.userId) });
    },
  });
}

export function useRevokeAllPermissions() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (userId: string) => permissionAssignmentService.revokeAll(userId),
    onSuccess: (_, userId) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.permissionAssignments.forUser(userId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.permissionAssignments.effective(userId) });
    },
  });
}

export function useCheckPermission(userId: string, permission: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: queryKeys.permissionAssignments.checkPermission(userId, permission),
    queryFn: () => permissionAssignmentService.checkPermission(userId, permission),
    enabled: !!userId && !!permission && (options?.enabled ?? true),
  });
}
