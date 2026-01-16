/**
 * Demo Login Hook - Web App
 * Provides demo login functionality with web-specific redirect logic
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useT } from '@xala/i18n';
import { authService, setAuthToken } from '@digilist/client-sdk';
import type { DemoLoginFormData } from '@xala/ds';

export function useDemoLogin() {
  const [showDialog, setShowDialog] = useState(false);
  const navigate = useNavigate();
  const t = useT();

  /**
   * Open demo login dialog
   */
  const openDemoLogin = () => {
    setShowDialog(true);
  };

  /**
   * Close demo login dialog
   */
  const closeDemoLogin = () => {
    setShowDialog(false);
  };

  /**
   * Handle demo login submission
   */
  const handleDemoLogin = async (data: DemoLoginFormData) => {
    try {
      // Call the auth service to validate the demo token
      const response = await authService.loginWithDemoToken(data.token.trim());

      if (response.data?.token && response.data?.user) {
        // Token is valid - update SDK client with JWT token for authenticated API calls
        setAuthToken(response.data.token);
        
        // Store token and user in localStorage for persistence
        localStorage.setItem('digilist_token', response.data.token);
        localStorage.setItem('web_user', JSON.stringify(response.data.user));

        // Verify session is now established with the token
        const sessionCheck = await authService.getSession();
        console.log('[DEMO LOGIN] Session verified:', sessionCheck.data);

        // Close dialog
        setShowDialog(false);

        // Determine redirect based on user role (web-specific)
        const user = response.data.user;
        let redirectPath = '/';

        // For web app, most users go to listings
        if (user.role === 'user') {
          redirectPath = '/listings';
        }

        // Navigate and reload to pick up auth state
        navigate(redirectPath, { replace: true });
        window.location.reload();
      } else {
        throw new Error(t('auth.invalidToken'));
      }
    } catch (error: any) {
      console.error('[DEMO LOGIN] Token validation failed:', error);
      throw new Error(error.message || t('auth.loginFailed'));
    }
  };

  return {
    showDialog,
    openDemoLogin,
    closeDemoLogin,
    handleDemoLogin,
  };
}
