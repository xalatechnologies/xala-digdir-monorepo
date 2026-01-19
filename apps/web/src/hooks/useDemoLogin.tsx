/**
 * Demo Login Hook - Web App
 * One-click demo login for citizens - no dialog needed
 * 
 * Public web app uses the same citizen demo token as MinSide.
 * Clicking demo login immediately authenticates.
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService, setAuthToken } from '@digilist/client-sdk';

const CITIZEN_DEMO_TOKEN = 'demo-token-2026';

export function useDemoLogin() {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  /**
   * One-click demo login - no dialog, immediate authentication
   */
  const handleDemoLogin = async () => {
    if (isLoading) return;
    
    setIsLoading(true);
    try {
      const response = await authService.loginWithDemoToken(CITIZEN_DEMO_TOKEN);

      if (response.data?.user) {
        // Update SDK client with JWT token if available
        if (response.data.token) {
          setAuthToken(response.data.token);
          localStorage.setItem('digilist_token', response.data.token);
        }
        
        localStorage.setItem('web_user', JSON.stringify(response.data.user));
        navigate('/', { replace: true });
        window.location.reload();
      } else {
        console.error('[DEMO LOGIN] No user in response');
      }
    } catch (error: any) {
      console.error('[DEMO LOGIN] Failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    handleDemoLogin,
  };
}
