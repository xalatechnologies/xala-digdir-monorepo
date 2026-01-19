/**
 * Auth Hooks
 * Single Responsibility: React Query hooks for authentication
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from './query-keys';
import { authService } from '../services/auth.service';
import { clearAuthToken } from '../core/client-factory';
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
 * Cookie-based auth - tokens are automatically set via Set-Cookie headers
 */
export function useLogin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (credentials: LoginCredentials) => authService.login(credentials),
    onSuccess: (response) => {
      // Cookie-based auth - no token storage needed
      // Cookies are automatically set by Set-Cookie headers
      // Update session cache
      queryClient.setQueryData(queryKeys.auth.session(), response);
    },
  });
}

/**
 * Email login mutation
 * Cookie-based auth - tokens are automatically set via Set-Cookie headers
 */
export function useEmailLogin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (credentials: EmailLoginCredentials) => authService.loginWithEmail(credentials),
    onSuccess: (response) => {
      // Cookie-based auth - no token storage needed
      // Cookies are automatically set by Set-Cookie headers
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
 * Cookie-based auth - tokens are automatically rotated via Set-Cookie headers
 */
export function useRefreshToken() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => authService.refreshToken(),
    onSuccess: (response) => {
      // Cookie-based auth - tokens are automatically rotated
      // Refresh endpoint returns new cookies via Set-Cookie headers
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
 * Cookie-based auth - tokens are automatically set via Set-Cookie headers
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
        credentials: 'include', // Ensure cookies are sent/received
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'Vipps authentication failed');
      }

      return response.json();
    },
    onSuccess: (response) => {
      // Cookie-based auth - no token storage needed
      // Cookies are automatically set by Set-Cookie headers
      queryClient.setQueryData(queryKeys.auth.session(), response);
    },
  });
}

// ============================================================================
// Demo Login Hook
// ============================================================================

export type DemoRoleKey = 'admin' | 'case_handler' | 'org_admin' | 'org_member';

/**
 * Demo login mutation - one-click login by role
 * 
 * Security: Only available in demo/staging environments or when explicitly enabled.
 * 
 * @example
 * ```tsx
 * const demoLogin = useDemoLogin();
 * 
 * const handleRoleSelect = (key: DemoRoleKey) => {
 *   demoLogin.mutate({ key }, {
 *     onSuccess: (data) => {
 *       window.location.href = data.data.redirectUrl;
 *     }
 *   });
 * };
 * ```
 */
export function useDemoLogin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ key, returnTo }: { key: DemoRoleKey; returnTo?: string }) =>
      authService.demoExchange(key, returnTo),
    onSuccess: (response) => {
      // Cookie-based auth - cookies are set by Set-Cookie headers
      queryClient.setQueryData(queryKeys.auth.session(), response);
    },
  });
}
