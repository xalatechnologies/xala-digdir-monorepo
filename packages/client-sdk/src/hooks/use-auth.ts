/**
 * Auth Hooks
 * Single Responsibility: React Query hooks for authentication
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from './query-keys';
import { authService } from '../services/auth.service';
import { setAuthToken, clearAuthToken } from '../core/client-factory';
import type { LoginCredentials, EmailLoginCredentials } from '../types/auth';

/**
 * Get current session
 */
export function useSession() {
  return useQuery({
    queryKey: queryKeys.auth.session(),
    queryFn: () => authService.getSession(),
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Get available auth providers
 */
export function useAuthProviders() {
  return useQuery({
    queryKey: queryKeys.auth.providers(),
    queryFn: () => authService.getProviders(),
    staleTime: Infinity, // Providers don't change often
  });
}

/**
 * Login mutation
 */
export function useLogin() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (credentials: LoginCredentials) => authService.login(credentials),
    onSuccess: (response) => {
      // Update auth token
      if (response.data.token) {
        setAuthToken(response.data.token);
      }
      // Update session cache
      queryClient.setQueryData(queryKeys.auth.session(), response);
    },
  });
}

/**
 * Email login mutation
 */
export function useEmailLogin() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (credentials: EmailLoginCredentials) => authService.loginWithEmail(credentials),
    onSuccess: (response) => {
      if (response.data.token) {
        setAuthToken(response.data.token);
      }
      queryClient.setQueryData(queryKeys.auth.session(), response);
    },
  });
}

/**
 * Logout mutation
 */
export function useLogout() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: () => authService.logout(),
    onSuccess: () => {
      clearAuthToken();
      queryClient.removeQueries({ queryKey: queryKeys.auth.session() });
      // Optionally clear all cached data on logout
      queryClient.clear();
    },
  });
}

/**
 * Refresh token mutation
 */
export function useRefreshToken() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: () => authService.refreshToken(),
    onSuccess: (response) => {
      if (response.data.token) {
        setAuthToken(response.data.token);
      }
      queryClient.setQueryData(queryKeys.auth.session(), response);
    },
  });
}
