/**
 * OAuth Callback Handler Hook
 * Handles OAuth redirect with token parameter and establishes session
 * 
 * Usage in App.tsx or AuthProvider:
 * ```tsx
 * import { useOAuthCallback } from './hooks/useOAuthCallback';
 * 
 * function App() {
 *   useOAuthCallback(); // Automatically handles ?token= param
 *   ...
 * }
 * ```
 */

import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { setAuthToken } from '@digilist/client-sdk';

export function useOAuthCallback() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const token = searchParams.get('token');
    const authSuccess = searchParams.get('auth_success');
    
    if (token && authSuccess === 'true') {
      console.log('[OAUTH] Handling OAuth callback with token');
      
      // Update SDK client with JWT token
      setAuthToken(token);
      
      // Store token in localStorage for persistence
      localStorage.setItem('digilist_token', token);
      
      // Clean up URL parameters
      searchParams.delete('token');
      searchParams.delete('auth_success');
      searchParams.delete('session_id');
      
      // Update URL without triggering navigation
      const newSearch = searchParams.toString();
      const newUrl = window.location.pathname + (newSearch ? `?${newSearch}` : '');
      navigate(newUrl, { replace: true });
      
      // Reload to pick up auth state
      window.location.reload();
    }
  }, [searchParams, navigate]);
}
