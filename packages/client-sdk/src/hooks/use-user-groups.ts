/**
 * User Groups Hooks  
 * React Query hooks for user group management
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from './query-keys';
import { userGroupsService } from '../services/user-groups.service';
import type { UserGroupQueryParams, CreateUserGroupDTO, UpdateUserGroupDTO } from '../types';

export function useUserGroups(params?: UserGroupQueryParams) {
  return useQuery({
    queryKey: queryKeys.userGroups.list(params),
    queryFn: () => userGroupsService.getAll(params),
  });
}

export function useUserGroup(id: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: queryKeys.userGroups.detail(id),
    queryFn: () => userGroupsService.getById(id),
    enabled: !!id && (options?.enabled ?? true),
  });
}

export function useGroupMembers(id: string) {
  return useQuery({
    queryKey: queryKeys.userGroups.members(id),
    queryFn: () => userGroupsService.getMembers(id),
    enabled: !!id,
  });
}

export function useUserGroupsForUser(userId: string) {
  return useQuery({
    queryKey: queryKeys.userGroups.forUser(userId),
    queryFn: () => userGroupsService.getUserGroups(userId),
    enabled: !!userId,
  });
}

export function useGroupPermissions(id: string) {
  return useQuery({
    queryKey: queryKeys.userGroups.permissions(id),
    queryFn: () => userGroupsService.getGroupPermissions(id),
    enabled: !!id,
  });
}

export function useCreateUserGroup() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateUserGroupDTO) => userGroupsService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.userGroups.all });
    },
  });
}

export function useUpdateUserGroup() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateUserGroupDTO }) => 
      userGroupsService.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.userGroups.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.userGroups.lists() });
    },
  });
}

export function useDeleteUserGroup() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => userGroupsService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.userGroups.all });
    },
  });
}

export function useAddGroupMember() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ groupId, userId }: { groupId: string; userId: string }) => 
      userGroupsService.addMember(groupId, userId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.userGroups.members(variables.groupId) });
    },
  });
}

export function useRemoveGroupMember() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ groupId, userId }: { groupId: string; userId: string }) => 
      userGroupsService.removeMember(groupId, userId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.userGroups.members(variables.groupId) });
    },
  });
}

export function useBulkAddGroupMembers() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ groupId, userIds }: { groupId: string; userIds: string[] }) => 
      userGroupsService.bulkAddMembers(groupId, userIds),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.userGroups.members(variables.groupId) });
    },
  });
}
