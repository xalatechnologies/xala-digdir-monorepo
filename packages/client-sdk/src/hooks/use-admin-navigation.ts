/**
 * Admin Navigation Hook
 * React Query hook for fetching admin navigation menu
 */

import { useQuery, type UseQueryOptions } from '@tanstack/react-query';
import { NavigationService } from '@/services/navigation.service';
import type { NavigationResponse } from '@/types/navigation';

const navigationService = new NavigationService();

/**
 * Hook to fetch admin navigation menu
 * 
 * Returns server-generated menu structure based on user's role and permissions.
 * Menu is cached for 5 minutes to reduce API calls.
 * 
 * @example
 * ```tsx
 * function Sidebar() {
 *   const { data: navigation, isLoading } = useAdminNavigation();
 *   
 *   if (isLoading) return <LoadingSkeleton />;
 *   
 *   return (
 *     <nav>
 *       {navigation?.menu.map(item => (
 *         <NavLink key={item.id} to={item.href}>{item.label}</NavLink>
 *       ))}
 *     </nav>
 *   );
 * }
 * ```
 */
export function useAdminNavigation(
  options?: Omit<UseQueryOptions<NavigationResponse>, 'queryKey' | 'queryFn'>
) {
  return useQuery<NavigationResponse>({
    queryKey: ['me', 'navigation'],
    queryFn: () => navigationService.getAdminNavigation(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    ...options,
  });
}
