/**
 * Custody Hooks
 * React Query hooks for managing resource-scoped delegation.
 */
import { useQuery, useMutation, useQueryClient, type UseQueryResult } from '@tanstack/react-query';
import { custodyService } from '../services/custody.service';
import type { CustodyGrant, CustodyScope, CreateCustodyGrantDTO } from '@xala/contracts';

const custodyKeys = {
  all: ['custody'] as const,
  rentalObject: (id: string) => [...custodyKeys.all, 'rental-object', id] as const,
  org: (id: string) => [...custodyKeys.all, 'org', id] as const,
};

/**
 * Hook to fetch custody grants for a rental object
 */
export function useRentalObjectCustody(rentalObjectId: string): UseQueryResult<CustodyGrant[], Error> {
  return useQuery({
    queryKey: custodyKeys.rentalObject(rentalObjectId),
    queryFn: () => custodyService.listGrants(rentalObjectId),
    enabled: !!rentalObjectId,
  });
}

/**
 * Hook to fetch custody grants for an organization
 */
export function useOrgCustody(orgId: string): UseQueryResult<CustodyGrant[], Error> {
  return useQuery({
    queryKey: custodyKeys.org(orgId),
    queryFn: () => custodyService.listOrgCustody(orgId),
    enabled: !!orgId,
  });
}

/**
 * Hook to check if current user has a specific custody scope on a rental object
 */
export function useCanCustody(rentalObjectId: string, scope: CustodyScope): boolean {
  const { data: grants } = useRentalObjectCustody(rentalObjectId);
  if (!grants) return false;

  // This is a client-side check for convenience
  // Server-side enforcement is the source of truth
  return (grants as any[]).some(grant => 
    grant.status === 'ACTIVE' && 
    grant.scopes.includes(scope)
  );
}

/**
 * Hook to create a custody grant
 */
export function useCreateCustodyGrant() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ rentalObjectId, data }: { rentalObjectId: string; data: CreateCustodyGrantDTO }) =>
      custodyService.createGrant(rentalObjectId, data),
    onSuccess: (_, { rentalObjectId }) => {
      queryClient.invalidateQueries({ queryKey: custodyKeys.rentalObject(rentalObjectId) });
    },
  });
}

/**
 * Hook to revoke a custody grant
 */
export function useRevokeCustodyGrant() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ grantId, _rentalObjectId }: { grantId: string; _rentalObjectId: string }) =>
      custodyService.revokeGrant(grantId),
    onSuccess: (_, { _rentalObjectId: rentalObjectId }) => {
      queryClient.invalidateQueries({ queryKey: custodyKeys.rentalObject(rentalObjectId) });
    },
  });
}

/**
 * Hook to create a subgrant
 */
export function useCreateCustodySubgrant() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ parentGrantId, _rentalObjectId, data }: { parentGrantId: string; _rentalObjectId: string; data: any }) =>
      custodyService.createSubgrant(parentGrantId, data),
    onSuccess: (_, { _rentalObjectId: rentalObjectId }) => {
      queryClient.invalidateQueries({ queryKey: custodyKeys.rentalObject(rentalObjectId) });
    },
  });
}
