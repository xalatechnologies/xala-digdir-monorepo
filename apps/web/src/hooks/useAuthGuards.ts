import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * Hook to handle authentication redirect loops
 * Prevents infinite redirects when authentication state is unclear
 */
export function useAuthRedirectGuard(isAuthenticated: boolean, isLoading: boolean) {
  const navigate = useNavigate();
  const redirectAttempts = useRef(0);
  const lastRedirectTime = useRef(0);
  
  useEffect(() => {
    // If we've been loading for more than 5 seconds and still not authenticated,
    // there might be an issue with the auth flow
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
        console.warn('Auth redirect loop detected, clearing auth state');
        localStorage.removeItem('web_user');
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
  }, [isAuthenticated, isLoading, navigate]);
}

/**
 * Hook to handle session restoration after login
 * Ensures proper redirect after OAuth callback
 */
export function useSessionRestoration() {
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
          navigate(returnTo, { 
            replace: true,
            state: { flowContext: JSON.parse(flowContext) }
          });
        } else {
          navigate(returnTo, { replace: true });
        }
      }
    }
  }, [navigate]);
}

/**
 * Hook to check and handle expired sessions
 */
export function useSessionExpirationCheck() {
  const checkSession = async () => {
    try {
      // Make a lightweight request to check session validity
      const response = await fetch('/api/auth/session', {
        method: 'GET',
        credentials: 'include',
      });
      
      if (!response.ok) {
        // Session is invalid, clear local storage
        localStorage.removeItem('web_user');
        window.location.href = '/login';
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Session check failed:', error);
      return false;
    }
  };
  
  return { checkSession };
}
