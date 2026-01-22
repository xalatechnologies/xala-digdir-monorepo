/**
 * Minside Navigation Hook
 * 
 * React Query hook for fetching database-driven navigation items.
 * Returns a fully resolved navigation tree based on user roles, permissions, and feature flags.
 * 
 * Pattern follows BackofficeSidebar's useBackofficeMenu() hook.
 */

import { useQuery, type UseQueryOptions } from '@tanstack/react-query';
import { getClient } from '@digilist/client-sdk';
import { useAuth } from '@xalatechnologies/platform/auth';

export interface NavItemFromApi {
  key: string;
  labelKey: string;
  routeKey?: string;
  iconKey?: string;
  parentKey?: string;
  section?: string;
  contexts: string[];
  order: number;
}

export interface NavigationResponse {
  app: string;
  items: NavItemFromApi[];
}

/**
 * Fetch navigation items from the API
 */
async function fetchNavigation(app: string): Promise<NavigationResponse> {
  const client = getClient();
  const response = await client.get<NavigationResponse>(`/api/nav/${app}`);
  return response;
}

/**
 * Hook to fetch database-driven navigation items
 * 
 * Returns a fully resolved navigation tree that is:
 * - Role-based (filtered by user roles)
 * - Module-gated (filtered by tenant modules)
 * - Feature-flag aware (filtered by tenant feature flags)
 * - Context-aware (filtered by personal/organization context)
 * 
 * The navigation is cached for 5 minutes to reduce API calls.
 * 
 * @param app - Application name (default: 'minside')
 * @param queryOptions - React Query options
 * @returns React Query result with NavigationResponse
 */
export function useNavigation(
  app: string = 'minside',
  queryOptions?: Omit<UseQueryOptions<NavigationResponse>, 'queryKey' | 'queryFn'>
) {
  const { isAuthenticated } = useAuth();

  return useQuery<NavigationResponse>({
    queryKey: ['navigation', app],
    queryFn: () => fetchNavigation(app),
    enabled: isAuthenticated,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
    retry: 1,
    ...queryOptions,
  });
}

/**
 * Hook to get navigation items with loading state
 * 
 * Convenience wrapper that returns items array with loading/error states.
 * 
 * @param app - Application name (default: 'minside')
 * @returns Navigation items array with query state
 */
export function useNavigationItems(app: string = 'minside') {
  const query = useNavigation(app);
  return {
    ...query,
    items: query.data?.items ?? [],
  };
}

/**
 * Query keys for navigation-related queries
 */
export const navigationQueryKeys = {
  all: ['navigation'] as const,
  byApp: (app: string) => ['navigation', app] as const,
};
