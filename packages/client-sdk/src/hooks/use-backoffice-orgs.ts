/**
 * Backoffice Organization Management Hooks
 * React Query hooks for municipal/partner organization CRUD
 * 
 * Reference: packages/client-sdk/src/types/organization-contracts.ts
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { BaseService } from '../services/base.service';
import type {
  CreateOrganizationRequest,
  UpdateOrganizationRequest,
  AddMemberRequest,
  AssignRentalObjectRequest,
  OrganizationListParams,
} from '../types/organization-contracts';

// =============================================================================
// Service
// =============================================================================

class BackofficeOrganizationsService extends BaseService {
  constructor() {
    super('/api/organizations');
  }

  async list(params?: OrganizationListParams) {
    return this.get('', { params });
  }

  async getById(id: string) {
    return this.get(`/${id}`);
  }

  async create(request: CreateOrganizationRequest) {
    return this.post('', request);
  }

  async update(id: string, request: UpdateOrganizationRequest) {
    return this.put(`/${id}`, request);
  }

  async deleteOrg(id: string) {
    return this.delete(`/${id}`);
  }

  // Members
  async listMembers(organizationId: string) {
    return this.get(`/${organizationId}/members`);
  }

  async addMember(organizationId: string, request: AddMemberRequest) {
    return this.post(`/${organizationId}/members`, request);
  }

  async removeMember(organizationId: string, userId: string) {
    return this.delete(`/${organizationId}/members/${userId}`);
  }

  // Rental object assignments
  async listAssignedRentalObjects(organizationId: string) {
    return this.get(`/${organizationId}/rental-objects`);
  }

  async assignRentalObject(organizationId: string, request: AssignRentalObjectRequest) {
    return this.post(`/${organizationId}/rental-objects`, request);
  }

  async unassignRentalObject(organizationId: string, rentalObjectId: string) {
    return this.delete(`/${organizationId}/rental-objects/${rentalObjectId}`);
  }
}

const backofficeOrganizationsService = new BackofficeOrganizationsService();

// =============================================================================
// Query Keys
// =============================================================================

export const backofficeOrgKeys = {
  all: ['backoffice-organizations'] as const,
  lists: () => [...backofficeOrgKeys.all, 'list'] as const,
  list: (params?: OrganizationListParams) => [...backofficeOrgKeys.lists(), params] as const,
  details: () => [...backofficeOrgKeys.all, 'detail'] as const,
  detail: (id: string) => [...backofficeOrgKeys.details(), id] as const,
  members: (id: string) => [...backofficeOrgKeys.all, 'members', id] as const,
  assignments: (id: string) => [...backofficeOrgKeys.all, 'assignments', id] as const,
};

// =============================================================================
// Organization Hooks
// =============================================================================

export function useBackofficeOrganizations(params?: OrganizationListParams) {
  return useQuery({
    queryKey: backofficeOrgKeys.list(params),
    queryFn: () => backofficeOrganizationsService.list(params),
  });
}

export function useBackofficeOrganization(id: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: backofficeOrgKeys.detail(id),
    queryFn: () => backofficeOrganizationsService.getById(id),
    enabled: options?.enabled !== false && !!id,
  });
}

export function useCreateBackofficeOrganization() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: CreateOrganizationRequest) => backofficeOrganizationsService.create(request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: backofficeOrgKeys.lists() });
    },
  });
}

export function useUpdateBackofficeOrganization() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, request }: { id: string; request: UpdateOrganizationRequest }) =>
      backofficeOrganizationsService.update(id, request),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: backofficeOrgKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: backofficeOrgKeys.lists() });
    },
  });
}

export function useDeleteBackofficeOrganization() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => backofficeOrganizationsService.deleteOrg(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: backofficeOrgKeys.lists() });
    },
  });
}

// =============================================================================
// Member Hooks
// =============================================================================

export function useBackofficeOrganizationMembers(organizationId: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: backofficeOrgKeys.members(organizationId),
    queryFn: () => backofficeOrganizationsService.listMembers(organizationId),
    enabled: options?.enabled !== false && !!organizationId,
  });
}

export function useAddBackofficeOrganizationMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ organizationId, request }: { organizationId: string; request: AddMemberRequest }) =>
      backofficeOrganizationsService.addMember(organizationId, request),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: backofficeOrgKeys.members(variables.organizationId) });
    },
  });
}

export function useRemoveBackofficeOrganizationMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ organizationId, userId }: { organizationId: string; userId: string }) =>
      backofficeOrganizationsService.removeMember(organizationId, userId),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: backofficeOrgKeys.members(variables.organizationId) });
    },
  });
}

// =============================================================================
// Assignment Hooks
// =============================================================================

export function useBackofficeAssignedRentalObjects(organizationId: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: backofficeOrgKeys.assignments(organizationId),
    queryFn: () => backofficeOrganizationsService.listAssignedRentalObjects(organizationId),
    enabled: options?.enabled !== false && !!organizationId,
  });
}

export function useAssignRentalObjectToOrg() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ organizationId, request }: { organizationId: string; request: AssignRentalObjectRequest }) =>
      backofficeOrganizationsService.assignRentalObject(organizationId, request),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: backofficeOrgKeys.assignments(variables.organizationId) });
    },
  });
}

export function useUnassignRentalObjectFromOrg() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ organizationId, rentalObjectId }: { organizationId: string; rentalObjectId: string }) =>
      backofficeOrganizationsService.unassignRentalObject(organizationId, rentalObjectId),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: backofficeOrgKeys.assignments(variables.organizationId) });
    },
  });
}
