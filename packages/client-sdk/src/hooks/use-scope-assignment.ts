/**
 * Scope Assignment Hooks
 * React Query hooks for scope delegation management
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  scopeAssignmentService,
  type CreateScopeAssignmentDTO,
  type UpdateScopeAssignmentDTO,
  type AssignScopesDTO,
  type ScopeQueryParams,
} from '../services/scope-assignment.service';

// =============================================================================
// Query Keys
// =============================================================================

export const scopeAssignmentKeys = {
  all: ['scopes'] as const,
  lists: () => [...scopeAssignmentKeys.all, 'list'] as const,
  list: (params?: ScopeQueryParams) => [...scopeAssignmentKeys.lists(), params] as const,
  details: () => [...scopeAssignmentKeys.all, 'detail'] as const,
  detail: (id: string) => [...scopeAssignmentKeys.details(), id] as const,
  userScopes: (userId: string) => [...scopeAssignmentKeys.all, 'user', userId] as const,
  effectiveScope: (userId: string) => [...scopeAssignmentKeys.all, 'effective', userId] as const,
  delegationTree: (orgId?: string) => [...scopeAssignmentKeys.all, 'delegation-tree', orgId] as const,
};

// =============================================================================
// Query Hooks
// =============================================================================

/**
 * Get all scope assignments (paginated)
 */
export function useScopeAssignments(params?: ScopeQueryParams) {
  return useQuery({
    queryKey: scopeAssignmentKeys.list(params),
    queryFn: () => scopeAssignmentService.getAll(params),
  });
}

/**
 * Get scope assignment by ID
 */
export function useScopeAssignment(scopeId: string) {
  return useQuery({
    queryKey: scopeAssignmentKeys.detail(scopeId),
    queryFn: () => scopeAssignmentService.getById(scopeId),
    enabled: !!scopeId,
  });
}

/**
 * Get all scopes for a specific user
 */
export function useUserScopes(userId: string) {
  return useQuery({
    queryKey: scopeAssignmentKeys.userScopes(userId),
    queryFn: () => scopeAssignmentService.getUserScopes(userId),
    enabled: !!userId,
  });
}

/**
 * Get effective scope for a user (computed access)
 */
export function useEffectiveScope(userId: string) {
  return useQuery({
    queryKey: scopeAssignmentKeys.effectiveScope(userId),
    queryFn: () => scopeAssignmentService.getEffectiveScope(userId),
    enabled: !!userId,
  });
}

/**
 * Get scope delegation tree
 */
export function useScopeDelegationTree(organizationId?: string) {
  return useQuery({
    queryKey: scopeAssignmentKeys.delegationTree(organizationId),
    queryFn: () => scopeAssignmentService.getDelegationTree(organizationId),
  });
}

// =============================================================================
// Mutation Hooks
// =============================================================================

/**
 * Create a new scope assignment
 */
export function useCreateScopeAssignment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateScopeAssignmentDTO) => scopeAssignmentService.create(data),
    onSuccess: (response, variables) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: scopeAssignmentKeys.lists() });
      queryClient.invalidateQueries({ queryKey: scopeAssignmentKeys.userScopes(variables.userId) });
      queryClient.invalidateQueries({
        queryKey: scopeAssignmentKeys.effectiveScope(variables.userId),
      });
    },
  });
}

/**
 * Update an existing scope assignment
 */
export function useUpdateScopeAssignment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ scopeId, data }: { scopeId: string; data: UpdateScopeAssignmentDTO }) =>
      scopeAssignmentService.update(scopeId, data),
    onSuccess: (response, variables) => {
      // Invalidate detail and list queries
      queryClient.invalidateQueries({ queryKey: scopeAssignmentKeys.detail(variables.scopeId) });
      queryClient.invalidateQueries({ queryKey: scopeAssignmentKeys.lists() });
    },
  });
}

/**
 * Delete a scope assignment
 */
export function useDeleteScopeAssignment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (scopeId: string) => scopeAssignmentService.deleteScope(scopeId),
    onSuccess: (response, scopeId) => {
      // Remove from cache and invalidate lists
      queryClient.removeQueries({ queryKey: scopeAssignmentKeys.detail(scopeId) });
      queryClient.invalidateQueries({ queryKey: scopeAssignmentKeys.lists() });
    },
  });
}

/**
 * Assign multiple scopes to a user (replaces existing)
 */
export function useAssignScopes() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: AssignScopesDTO) => scopeAssignmentService.assignScopes(data),
    onSuccess: (response, variables) => {
      // Invalidate user scopes and effective scope
      queryClient.invalidateQueries({ queryKey: scopeAssignmentKeys.userScopes(variables.userId) });
      queryClient.invalidateQueries({
        queryKey: scopeAssignmentKeys.effectiveScope(variables.userId),
      });
      queryClient.invalidateQueries({ queryKey: scopeAssignmentKeys.lists() });
    },
  });
}

/**
 * Add a rental object to user's scope
 */
export function useAddRentalObjectScope() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, rentalObjectId }: { userId: string; rentalObjectId: string }) =>
      scopeAssignmentService.addRentalObject(userId, rentalObjectId),
    onSuccess: (response, variables) => {
      queryClient.invalidateQueries({ queryKey: scopeAssignmentKeys.userScopes(variables.userId) });
      queryClient.invalidateQueries({
        queryKey: scopeAssignmentKeys.effectiveScope(variables.userId),
      });
    },
  });
}

/**
 * Remove a rental object from user's scope
 */
export function useRemoveRentalObjectScope() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, rentalObjectId }: { userId: string; rentalObjectId: string }) =>
      scopeAssignmentService.removeRentalObject(userId, rentalObjectId),
    onSuccess: (response, variables) => {
      queryClient.invalidateQueries({ queryKey: scopeAssignmentKeys.userScopes(variables.userId) });
      queryClient.invalidateQueries({
        queryKey: scopeAssignmentKeys.effectiveScope(variables.userId),
      });
    },
  });
}

/**
 * Set user scope to organization-level
 */
export function useSetOrganizationScope() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, organizationId }: { userId: string; organizationId: string }) =>
      scopeAssignmentService.setOrganizationScope(userId, organizationId),
    onSuccess: (response, variables) => {
      queryClient.invalidateQueries({ queryKey: scopeAssignmentKeys.userScopes(variables.userId) });
      queryClient.invalidateQueries({
        queryKey: scopeAssignmentKeys.effectiveScope(variables.userId),
      });
    },
  });
}

/**
 * Set user scope to category-level
 */
export function useSetCategoryScope() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, categoryKeys }: { userId: string; categoryKeys: string[] }) =>
      scopeAssignmentService.setCategoryScope(userId, categoryKeys),
    onSuccess: (response, variables) => {
      queryClient.invalidateQueries({ queryKey: scopeAssignmentKeys.userScopes(variables.userId) });
      queryClient.invalidateQueries({
        queryKey: scopeAssignmentKeys.effectiveScope(variables.userId),
      });
    },
  });
}

/**
 * Set user scope to global (access all)
 */
export function useSetGlobalScope() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId: string) => scopeAssignmentService.setGlobalScope(userId),
    onSuccess: (response, userId) => {
      queryClient.invalidateQueries({ queryKey: scopeAssignmentKeys.userScopes(userId) });
      queryClient.invalidateQueries({ queryKey: scopeAssignmentKeys.effectiveScope(userId) });
    },
  });
}

/**
 * Clear all scopes for a user
 */
export function useClearScopes() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId: string) => scopeAssignmentService.clearAllScopes(userId),
    onSuccess: (response, userId) => {
      queryClient.invalidateQueries({ queryKey: scopeAssignmentKeys.userScopes(userId) });
      queryClient.invalidateQueries({ queryKey: scopeAssignmentKeys.effectiveScope(userId) });
      queryClient.invalidateQueries({ queryKey: scopeAssignmentKeys.lists() });
    },
  });
}

/**
 * Suspend scope temporarily
 */
export function useSuspendScope() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ scopeId, reason }: { scopeId: string; reason?: string }) =>
      scopeAssignmentService.suspend(scopeId, reason),
    onSuccess: (response, variables) => {
      queryClient.invalidateQueries({ queryKey: scopeAssignmentKeys.detail(variables.scopeId) });
      queryClient.invalidateQueries({ queryKey: scopeAssignmentKeys.lists() });
    },
  });
}

/**
 * Reactivate suspended scope
 */
export function useReactivateScope() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (scopeId: string) => scopeAssignmentService.reactivate(scopeId),
    onSuccess: (response, scopeId) => {
      queryClient.invalidateQueries({ queryKey: scopeAssignmentKeys.detail(scopeId) });
      queryClient.invalidateQueries({ queryKey: scopeAssignmentKeys.lists() });
    },
  });
}

/**
 * Validate if user has access to a rental object
 */
export function useValidateAccess() {
  return useMutation({
    mutationFn: ({ userId, rentalObjectId }: { userId: string; rentalObjectId: string }) =>
      scopeAssignmentService.validateAccess(userId, rentalObjectId),
  });
}

/**
 * Bulk assign scopes to multiple users
 */
export function useBulkAssignScopes() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      userIds,
      scopeData,
    }: {
      userIds: string[];
      scopeData: Omit<CreateScopeAssignmentDTO, 'userId'>;
    }) => scopeAssignmentService.bulkAssign(userIds, scopeData),
    onSuccess: () => {
      // Invalidate all scope queries
      queryClient.invalidateQueries({ queryKey: scopeAssignmentKeys.all });
    },
  });
}

/**
 * Bulk remove scopes from multiple users
 */
export function useBulkRemoveScopes() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userIds: string[]) => scopeAssignmentService.bulkRemove(userIds),
    onSuccess: () => {
      // Invalidate all scope queries
      queryClient.invalidateQueries({ queryKey: scopeAssignmentKeys.all });
    },
  });
}
