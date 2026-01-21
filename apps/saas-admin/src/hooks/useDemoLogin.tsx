/**
 * Demo Login Hook - SaaS Admin App
 * Provides demo login functionality with saas-admin-specific redirect logic
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useT } from '@xala/i18n';
import { authService } from '@digilist/client-sdk'; // platform-exempt: auth is domain-specific
import type { DemoLoginFormData } from '@xalatechnologies/platform/ui';

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

      if (response.data?.user) {
        // Token is valid - store user session
        localStorage.setItem('saas_admin_user', JSON.stringify(response.data.user));

        // Close dialog
        setShowDialog(false);

        // Determine redirect based on user role (saas-admin-specific)
        const user = response.data.user;
        let redirectPath = '/';

        // For saas-admin app, super_admin goes to tenants management
        if (user.role === 'super_admin') {
          redirectPath = '/tenants';
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
