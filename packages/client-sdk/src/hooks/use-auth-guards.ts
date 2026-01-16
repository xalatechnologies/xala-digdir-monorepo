/**
 * Authentication Guard Hooks
 * 
 * Provides hooks to prevent authentication redirect loops and handle session restoration.
 * These hooks are designed to be used in AuthProvider components to ensure robust auth flows.
 */

import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * Hook to prevent infinite authentication redirect loops.
 * Tracks redirect attempts and clears auth state if too many redirects occur in a short time.
 * 
 * @param isAuthenticated - Whether the user is currently authenticated
 * @param isLoading - Whether auth state is still loading
 * @param storageKey - The localStorage key used for user data (app-specific)
 */
export function useAuthRedirectGuard(
  isAuthenticated: boolean,
  isLoading: boolean,
  storageKey: string = 'user'
): void {
  const navigate = useNavigate();
  const redirectAttempts = useRef(0);
  const lastRedirectTime = useRef(0);
  
  useEffect(() => {
    // Reset redirect counter if we've been loading for more than 5 seconds
    if (isLoading && Date.now() - lastRedirectTime.current > 5000) {
      redirectAttempts.current = 0;
    }
    
    // Prevent infinite redirect loops
    if (!isAuthenticated && !isLoading) {
      const now = Date.now();
      const timeSinceLastRedirect = now - lastRedirectTime.current;
      
      // If we've redirected more than 3 times in the last 10 seconds,
      // clear auth state and force a fresh login
      if (redirectAttempts.current >= 3 && timeSinceLastRedirect < 10000) {
        console.warn('[AUTH GUARD] Redirect loop detected, clearing auth state');
        localStorage.removeItem(storageKey);
        sessionStorage.clear();
        redirectAttempts.current = 0;
        navigate('/login', { replace: true });
        return;
      }
      
      redirectAttempts.current++;
      lastRedirectTime.current = now;
    } else if (isAuthenticated) {
      // Reset counters on successful authentication
      redirectAttempts.current = 0;
    }
  }, [isAuthenticated, isLoading, navigate, storageKey]);
}

/**
 * Hook to handle session restoration after OAuth callback.
 * Detects OAuth callback parameters and restores user to intended destination.
 */
export function useSessionRestoration(): void {
  const navigate = useNavigate();
  const hasRestored = useRef(false);
  
  useEffect(() => {
    // Check if we're returning from OAuth callback
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const authSuccess = urlParams.get('auth_success') === 'true';
    
    if ((code || authSuccess) && !hasRestored.current) {
      hasRestored.current = true;
      
      // Store the return URL from session storage if it exists
      const returnTo = sessionStorage.getItem('auth_return_to');
      const flowContext = sessionStorage.getItem('flow_context');
      
      if (returnTo) {
        // Clean URL and redirect to intended destination
        window.history.replaceState({}, document.title, window.location.pathname);
        
        // Navigate with proper state restoration
        if (flowContext) {
          try {
            navigate(returnTo, { 
              replace: true,
              state: { flowContext: JSON.parse(flowContext) }
            });
          } catch {
            navigate(returnTo, { replace: true });
          }
        } else {
          navigate(returnTo, { replace: true });
        }
      }
    }
  }, [navigate]);
}

/**
 * Hook to check and handle expired sessions.
 * Returns a function to validate session status.
 * 
 * @param storageKey - The localStorage key used for user data (app-specific)
 */
export function useSessionExpirationCheck(storageKey: string = 'user') {
  const checkSession = async (): Promise<boolean> => {
    try {
      // Make a lightweight request to check session validity
      const response = await fetch('/api/auth/session', {
        method: 'GET',
        credentials: 'include',
      });
      
      if (!response.ok) {
        // Session is invalid, clear local storage
        localStorage.removeItem(storageKey);
        window.location.href = '/login';
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('[AUTH GUARD] Session check failed:', error);
      return false;
    }
  };
  
  return { checkSession };
}
