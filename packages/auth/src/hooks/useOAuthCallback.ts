/**
 * OAuth Callback Handler Hook
 * Handles OAuth redirect with token parameter and establishes session
 *
 * Usage in App.tsx or AuthProvider:
 * ```tsx
 * import { useOAuthCallback } from '@xala/auth/hooks';
 *
 * function App() {
 *   useOAuthCallback(); // Automatically handles ?token= param
 *   ...
 * }
 * ```
 *
 * With custom token handler (recommended for domain-agnostic usage):
 * ```tsx
 * import { useOAuthCallback } from '@xala/auth/hooks';
 * import { setAuthToken } from '@my-domain/sdk';
 *
 * function App() {
 *   useOAuthCallback({ setAuthToken });
 *   ...
 * }
 * ```
 *
 * With AuthServiceProvider (recommended):
 * ```tsx
 * import { AuthServiceProvider } from '@xala/auth/providers';
 * import { authService, tokenUtils } from '@my-domain/sdk';
 *
 * // In your app setup
 * <AuthServiceProvider
 *   authService={authService}
 *   tokenUtils={{ setAuthToken: tokenUtils.setAuthToken }}
 * >
 *   <App /> // useOAuthCallback will use the injected tokenUtils
 * </AuthServiceProvider>
 * ```
 */

import { useEffect, useRef, useContext } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import type { TokenUtilities } from '../types';
import { AuthServiceContext } from '../providers/AuthServiceContext';

/**
 * Default storage key for auth tokens
 */
const DEFAULT_TOKEN_KEY = 'auth_token';

export interface UseOAuthCallbackOptions {
  /**
   * Custom function to set the auth token in your SDK
   * If not provided, will try to use tokenUtils from AuthServiceContext
   */
  setAuthToken?: TokenUtilities['setAuthToken'];

  /**
   * Storage key for persisting the token
   * @default 'auth_token'
   */
  tokenStorageKey?: string;

  /**
   * Whether to reload the page after handling callback
   * @default true
   */
  reloadAfterAuth?: boolean;

  /**
   * Debug logging
   * @default false
   */
  debug?: boolean;
}

export function useOAuthCallback(options: UseOAuthCallbackOptions = {}) {
  const {
    setAuthToken: customSetAuthToken,
    tokenStorageKey = DEFAULT_TOKEN_KEY,
    reloadAfterAuth = true,
    debug = false,
  } = options;

  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const hasHandled = useRef(false);

  // Get token utils from context if available
  const serviceContext = useContext(AuthServiceContext);
  const contextSetAuthToken = serviceContext.isInitialized
    ? serviceContext.tokenUtils.setAuthToken
    : undefined;

  useEffect(() => {
    const handleCallback = async () => {
      // Prevent double handling
      if (hasHandled.current) return;

      const token = searchParams.get('token');
      const authSuccess = searchParams.get('auth_success');

      if (token && authSuccess === 'true') {
        hasHandled.current = true;

        if (debug) {
          console.log('[OAUTH] Handling OAuth callback with token');
        }

        // Get the setAuthToken function (priority: custom > context > warn)
        const setTokenFn = customSetAuthToken ?? contextSetAuthToken;

        if (!setTokenFn) {
          console.warn(
            '[OAUTH] No setAuthToken implementation available. ' +
            'Either provide setAuthToken option or wrap your app with AuthServiceProvider ' +
            'and provide tokenUtils.'
          );
        } else {
          // Update SDK client with JWT token
          setTokenFn(token);
        }

        // Store token in localStorage for persistence
        try {
          localStorage.setItem(tokenStorageKey, token);
        } catch {
          if (debug) {
            console.warn('[OAUTH] Could not persist token to localStorage');
          }
        }

        // Clean up URL parameters
        const newParams = new URLSearchParams(searchParams);
        newParams.delete('token');
        newParams.delete('auth_success');
        newParams.delete('session_id');

        // Update URL without triggering navigation
        const newSearch = newParams.toString();
        const newUrl = window.location.pathname + (newSearch ? `?${newSearch}` : '');
        navigate(newUrl, { replace: true });

        // Reload to pick up auth state
        if (reloadAfterAuth) {
          window.location.reload();
        }
      }
    };

    handleCallback();
  }, [
    searchParams,
    navigate,
    customSetAuthToken,
    contextSetAuthToken,
    tokenStorageKey,
    reloadAfterAuth,
    debug,
  ]);
}
