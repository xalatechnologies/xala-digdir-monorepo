/**
 * Backoffice Menu Hook
 * 
 * React Query hook for fetching the database-driven Backoffice menu.
 * Returns a fully resolved menu tree based on user roles, permissions, and feature flags.
 */

import { useQuery, type UseQueryOptions } from '@tanstack/react-query';
import type {
  BackofficeMenuResponse,
  MenuTreeDTO,
  SupportedLanguage,
} from '@xala/contracts/projections';
import { getClient } from '../core/client-factory';

interface UseBackofficeMenuOptions {
  language?: SupportedLanguage;
}

/**
 * Fetch the backoffice menu from the DK API
 */
async function fetchBackofficeMenu(language: SupportedLanguage): Promise<BackofficeMenuResponse> {
  const client = getClient();
  const response = await client.get<BackofficeMenuResponse>(`/dk/backoffice/menu?lang=${language}`);
  return response;
}

/**
 * Hook to fetch the database-driven backoffice menu
 * 
 * Returns a fully resolved menu tree that is:
 * - Role-based (filtered by user roles)
 * - Permission-gated (filtered by user permissions)
 * - Feature-flag aware (filtered by tenant feature flags)
 * - Localized (labels in requested language)
 * 
 * The menu is cached for 5 minutes to reduce API calls.
 * Cache is invalidated when user roles or tenant feature flags change.
 * 
 * @param options - Hook options
 * @param queryOptions - React Query options
 * @returns React Query result with MenuTreeDTO
 * 
 * @example
 * ```tsx
 * function Sidebar() {
 *   const { data, isLoading, error } = useBackofficeMenu({ language: 'nb' });
 *   
 *   if (isLoading) return <SidebarSkeleton />;
 *   if (error) return <SidebarError error={error} />;
 *   
 *   return (
 *     <nav>
 *       {data?.data.categories.map(category => (
 *         <CategorySection key={category.key} category={category} />
 *       ))}
 *     </nav>
 *   );
 * }
 * ```
 */
export function useBackofficeMenu(
  options?: UseBackofficeMenuOptions,
  queryOptions?: Omit<UseQueryOptions<BackofficeMenuResponse>, 'queryKey' | 'queryFn'>
) {
  const language = options?.language ?? 'nb';

  return useQuery<BackofficeMenuResponse>({
    queryKey: ['dk', 'backoffice', 'menu', language],
    queryFn: () => fetchBackofficeMenu(language),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
    ...queryOptions,
  });
}

/**
 * Hook to get just the menu tree data
 * 
 * Convenience wrapper that returns only the MenuTreeDTO.
 * 
 * @param options - Hook options
 * @returns MenuTreeDTO or undefined
 * 
 * @example
 * ```tsx
 * function Sidebar() {
 *   const menuTree = useBackofficeMenuData({ language: 'nb' });
 *   
 *   if (!menuTree) return <SidebarSkeleton />;
 *   
 *   return (
 *     <nav>
 *       {menuTree.categories.map(category => (
 *         <CategorySection key={category.key} category={category} />
 *       ))}
 *     </nav>
 *   );
 * }
 * ```
 */
export function useBackofficeMenuData(options?: UseBackofficeMenuOptions): MenuTreeDTO | undefined {
  const { data } = useBackofficeMenu(options);
  return data?.data;
}

/**
 * Query keys for menu-related queries
 */
export const menuQueryKeys = {
  all: ['dk', 'backoffice', 'menu'] as const,
  byLanguage: (language: SupportedLanguage) => ['dk', 'backoffice', 'menu', language] as const,
  context: ['dk', 'me', 'context'] as const,
};
