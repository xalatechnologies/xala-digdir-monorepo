/**
 * useOAuthCallback Hook
 *
 * Handles OAuth/OIDC callback processing for authentication flows.
 * Automatically detects OAuth callbacks from URL parameters and handles them.
 *
 * @example
 * ```tsx
 * import { useOAuthCallback } from '@xalatechnologies/platform/auth';
 *
 * function App() {
 *   // Place at app root to handle OAuth redirects
 *   useOAuthCallback();
 *
 *   return <YourApp />;
 * }
 * ```
 */

import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

export interface OAuthCallbackState {
  /** Whether callback is being processed */
  isProcessing: boolean;
  /** Error message if callback failed */
  error: string | null;
  /** Whether callback was successful */
  success: boolean;
}

export interface UseOAuthCallbackOptions {
  /** Callback when authentication is successful */
  onSuccess?: () => void;
  /** Callback when authentication fails */
  onError?: (error: string) => void;
  /** Path to redirect to after successful auth (defaults to returnTo param or '/') */
  defaultRedirect?: string;
}

/**
 * Hook to handle OAuth callback parameters from URL.
 *
 * Looks for:
 * - `code` parameter (OAuth authorization code)
 * - `state` parameter (CSRF protection)
 * - `error` parameter (OAuth error)
 * - `error_description` parameter (OAuth error details)
 *
 * If these are found, processes the callback appropriately.
 */
export function useOAuthCallback(options: UseOAuthCallbackOptions = {}): OAuthCallbackState {
  const location = useLocation();
  const navigate = useNavigate();
  const [state, setState] = useState<OAuthCallbackState>({
    isProcessing: false,
    error: null,
    success: false,
  });

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);

    // Check for OAuth error
    const error = searchParams.get('error');
    const errorDescription = searchParams.get('error_description');

    if (error) {
      const errorMessage = errorDescription || error;
      setState({
        isProcessing: false,
        error: errorMessage,
        success: false,
      });
      options.onError?.(errorMessage);

      // Clear URL parameters
      const cleanUrl = location.pathname;
      window.history.replaceState({}, '', cleanUrl);
      return;
    }

    // Check for OAuth success indicators
    const code = searchParams.get('code');
    const authSuccess = searchParams.get('auth_success') === 'true';

    if (code || authSuccess) {
      setState({
        isProcessing: false,
        error: null,
        success: true,
      });

      // Get return URL from state or use default
      const returnTo = searchParams.get('returnTo') ||
                       searchParams.get('state') ||
                       options.defaultRedirect ||
                       '/';

      // Clear URL parameters and navigate
      options.onSuccess?.();

      // Navigate to the intended destination
      navigate(returnTo, { replace: true });
      return;
    }

    // Check for session success (set by backend after OAuth flow completes)
    const sessionSuccess = searchParams.get('session') === 'success';

    if (sessionSuccess) {
      setState({
        isProcessing: false,
        error: null,
        success: true,
      });

      const returnTo = searchParams.get('returnTo') || options.defaultRedirect || '/';
      options.onSuccess?.();
      navigate(returnTo, { replace: true });
      return;
    }
  }, [location, navigate, options]);

  return state;
}
