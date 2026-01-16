/**
 * Demo Login Hook - Tenant Admin App
 * Provides demo login functionality with tenant-admin-specific redirect logic
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useT } from '@xala/i18n';
import { authService } from '@digilist/client-sdk';
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

      if (response.data?.user) {
        // Token is valid - store user session
        localStorage.setItem('tenant_admin_user', JSON.stringify(response.data.user));

        // Close dialog
        setShowDialog(false);

        // Determine redirect based on user role (tenant-admin-specific)
        const user = response.data.user;
        let redirectPath = '/';

        // For tenant-admin, all users go to dashboard
        if (user.role === 'tenant_admin' || user.role === 'admin') {
          redirectPath = '/';
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
