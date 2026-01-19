/**
 * User Context Hook
 * 
 * React Query hook for fetching the user's context (tenant, roles, permissions).
 */

import { useQuery, type UseQueryOptions } from '@tanstack/react-query';
import { getClient } from '../core/client-factory';
import { menuQueryKeys } from './use-backoffice-menu';

export interface UserContextResponse {
  userId: string;
  tenantId: string;
  orgId: string | null;
  roles: string[];
  permissions: string[];
  language: string;
}

async function fetchUserContext(): Promise<UserContextResponse> {
  const client = getClient();
  const response = await client.get<{ data: UserContextResponse }>('/dk/me/context');
  return response.data;
}

/**
 * Hook to fetch user context (tenant, roles, permissions)
 * 
 * @example
 * ```tsx
 * function UserInfo() {
 *   const { data: context, isLoading } = useUserContext();
 *   if (isLoading) return <Skeleton />;
 *   return <div>Role: {context?.roles.join(', ')}</div>;
 * }
 * ```
 */
export function useUserContext(
  queryOptions?: Omit<UseQueryOptions<UserContextResponse>, 'queryKey' | 'queryFn'>
) {
  return useQuery<UserContextResponse>({
    queryKey: menuQueryKeys.context,
    queryFn: fetchUserContext,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    ...queryOptions,
  });
}
