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

// ============================================================================
// Vipps OAuth Hooks
// ============================================================================

/**
 * Initiate Vipps OAuth login
 * 
 * Returns authorization URL and state/nonce for validation
 */
export function useVippsLogin() {
  return useMutation({
    mutationFn: async ({
      redirectUri,
      returnTo,
      scopes,
    }: {
      redirectUri: string;
      returnTo?: string;
      scopes?: string[];
    }) => {
      const response = await fetch('/api/auth/vipps/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ redirectUri, returnTo, scopes }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to initiate Vipps login');
      }
      
      return response.json() as Promise<{
        data: {
          authorizationUrl: string;
          state: string;
          nonce: string;
          returnTo: string;
        };
      }>;
    },
  });
}

/**
 * Handle Vipps OAuth callback
 * 
 * Exchanges authorization code for session
 */
export function useVippsCallback() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({
      code,
      state,
      nonce,
      redirectUri,
    }: {
      code: string;
      state: string;
      nonce: string;
      redirectUri: string;
    }) => {
      const response = await fetch('/api/auth/vipps/callback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, state, nonce, redirectUri }),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'Vipps authentication failed');
      }
      
      return response.json();
    },
    onSuccess: (response) => {
      if (response.data?.token) {
        setAuthToken(response.data.token);
      }
      queryClient.setQueryData(queryKeys.auth.session(), response);
    },
  });
}
