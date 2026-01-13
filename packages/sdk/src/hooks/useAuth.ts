/**
 * Authentication Hooks
 * React Query hooks for authentication operations
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  login,
  logout,
  getSession,
  refreshToken,
  getAuthProviders,
} from '../services/api';
import type { LoginCredentials } from '../types/api';

// Query keys for cache management
export const authKeys = {
  all: ['auth'] as const,
  session: () => [...authKeys.all, 'session'] as const,
  providers: () => [...authKeys.all, 'providers'] as const,
};

/**
 * Get current session
 */
export function useSession() {
  return useQuery({
    queryKey: authKeys.session(),
    queryFn: () => getSession(),
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Get available auth providers
 */
export function useAuthProviders() {
  return useQuery({
    queryKey: authKeys.providers(),
    queryFn: () => getAuthProviders(),
    staleTime: 30 * 60 * 1000, // 30 minutes
  });
}

/**
 * Login with email/password
 */
export function useLogin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (credentials: LoginCredentials) => login(credentials),
    onSuccess: (data) => {
      queryClient.setQueryData(authKeys.session(), data);
    },
  });
}

/**
 * Logout
 */
export function useLogout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => logout(),
    onSuccess: () => {
      queryClient.removeQueries({ queryKey: authKeys.session() });
      queryClient.clear();
    },
  });
}

/**
 * Refresh token
 */
export function useRefreshToken() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => refreshToken(),
    onSuccess: (data) => {
      queryClient.setQueryData(authKeys.session(), data);
    },
  });
}
