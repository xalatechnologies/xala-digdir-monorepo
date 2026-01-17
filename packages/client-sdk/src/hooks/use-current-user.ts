/**
 * Current User Hook
 *
 * Convenience alias for useSession - provides current user information
 */

import { useSession } from './use-auth';

/**
 * Get current authenticated user
 *
 * This is an alias to useSession() for better semantic naming
 * in user-facing components.
 *
 * @example
 * ```tsx
 * const { data: currentUserData } = useCurrentUser();
 * const user = currentUserData?.user;
 * ```
 */
export function useCurrentUser() {
  return useSession();
}
