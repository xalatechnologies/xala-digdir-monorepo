/**
 * Case Handler Scope Hooks
 * React Query hooks for custody/scope management
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from './query-keys';
import { caseHandlerScopeService } from '../services/case-handler-scope.service';
import type { CaseHandlerScopeQueryParams, CreateCaseHandlerScopeDTO, UpdateCaseHandlerScopeDTO } from '../types';

export function useCaseHandlerScopes(params?: CaseHandlerScopeQueryParams) {
  return useQuery({
    queryKey: queryKeys.caseHandlerScopes.list(params),
    queryFn: () => caseHandlerScopeService.getAll(params),
  });
}

export function useCaseHandlerScope(id: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: queryKeys.caseHandlerScopes.detail(id),
    queryFn: () => caseHandlerScopeService.getById(id),
    enabled: !!id && (options?.enabled ?? true),
  });
}

export function useCaseHandlerScopesForUser(userId: string) {
  return useQuery({
    queryKey: queryKeys.caseHandlerScopes.forUser(userId),
    queryFn: () => caseHandlerScopeService.getForCaseHandler(userId),
    enabled: !!userId,
  });
}

export function useCaseHandlerScopesForRentalObject(rentalObjectId: string) {
  return useQuery({
    queryKey: queryKeys.caseHandlerScopes.forRentalObject(rentalObjectId),
    queryFn: () => caseHandlerScopeService.getForRentalObject(rentalObjectId),
    enabled: !!rentalObjectId,
  });
}

export function useCaseHandlerAuditLog(userId: string) {
  return useQuery({
    queryKey: queryKeys.caseHandlerScopes.auditLog(userId),
    queryFn: () => caseHandlerScopeService.getAuditLog(userId),
    enabled: !!userId,
  });
}

export function useCheckCaseHandlerAccess(
  userId: string, 
  rentalObjectId: string, 
  options?: { enabled?: boolean }
) {
  return useQuery({
    queryKey: queryKeys.caseHandlerScopes.checkAccess(userId, rentalObjectId),
    queryFn: () => caseHandlerScopeService.checkAccess(userId, rentalObjectId),
    enabled: !!userId && !!rentalObjectId && (options?.enabled ?? true),
  });
}

export function useCreateCaseHandlerScope() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateCaseHandlerScopeDTO) => caseHandlerScopeService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.caseHandlerScopes.all });
    },
  });
}

export function useUpdateCaseHandlerScope() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateCaseHandlerScopeDTO }) => 
      caseHandlerScopeService.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.caseHandlerScopes.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.caseHandlerScopes.lists() });
    },
  });
}

export function useDeleteCaseHandlerScope() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => caseHandlerScopeService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.caseHandlerScopes.all });
    },
  });
}

export function useBulkAssignScopes() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, rentalObjectIds }: { userId: string; rentalObjectIds: string[] }) => 
      caseHandlerScopeService.bulkAssign(userId, rentalObjectIds),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.caseHandlerScopes.forUser(variables.userId) });
    },
  });
}

export function useRevokeAllScopes() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (userId: string) => caseHandlerScopeService.revokeAll(userId),
    onSuccess: (_, userId) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.caseHandlerScopes.forUser(userId) });
    },
  });
}

export function useTransferScopes() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ fromUserId, toUserId }: { fromUserId: string; toUserId: string }) => 
      caseHandlerScopeService.transferScopes(fromUserId, toUserId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.caseHandlerScopes.forUser(variables.fromUserId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.caseHandlerScopes.forUser(variables.toUserId) });
    },
  });
}
