/**
 * Demo Login Hook - Backoffice App
 * Provides demo login functionality with backoffice-specific redirect logic
 * 
 * Supports two modes:
 * 1. Role-based one-click demo login (new - recommended)
 * 2. Manual token entry (legacy)
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useT } from '@xala/i18n';
import { authService } from '@digilist/client-sdk';
import type { DemoLoginFormData, DemoRoleKey } from '@xalatechnologies/platform/ui';

export function useDemoLogin() {
  const [showDialog, setShowDialog] = useState(false);
  const [showRoleSwitcher, setShowRoleSwitcher] = useState(false);
  const [loadingRole, setLoadingRole] = useState<DemoRoleKey | null>(null);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const t = useT();

  /**
   * Open demo login dialog (legacy manual token entry)
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
   * Open role switcher (new one-click demo login)
   */
  const openRoleSwitcher = () => {
    setError(null);
    setShowRoleSwitcher(true);
  };

  /**
   * Close role switcher
   */
  const closeRoleSwitcher = () => {
    setShowRoleSwitcher(false);
    setLoadingRole(null);
    setError(null);
  };

  /**
   * Handle role selection for one-click demo login
   */
  const handleRoleSelect = async (key: DemoRoleKey): Promise<void> => {
    setLoadingRole(key);
    setError(null);

    try {
      const response = await authService.demoExchange(key);

      if (response.data?.user) {
        localStorage.setItem('backoffice_mock_user', JSON.stringify(response.data.user));
        setShowRoleSwitcher(false);
        
        const redirectUrl = response.data.redirectUrl || '/';
        navigate(redirectUrl, { replace: true });
        window.location.reload();
      } else {
        throw new Error(t('auth.loginFailed'));
      }
    } catch (err: any) {
      console.error('[DEMO LOGIN] Role login failed:', err);
      setError(err.message || t('auth.loginFailed'));
    } finally {
      setLoadingRole(null);
    }
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
        localStorage.setItem('backoffice_mock_user', JSON.stringify(response.data.user));

        // Close dialog
        setShowDialog(false);

        // Determine redirect based on user role (backoffice-specific)
        const user = response.data.user;
        let redirectPath = '/';

        if (user.role === 'super_admin' || user.role === 'admin') {
          redirectPath = '/dashboard';
        } else if (user.role === 'tenant_admin') {
          redirectPath = '/rental-objects';
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
    // Legacy manual token dialog
    showDialog,
    openDemoLogin,
    closeDemoLogin,
    handleDemoLogin,
    // New role switcher
    showRoleSwitcher,
    openRoleSwitcher,
    closeRoleSwitcher,
    handleRoleSelect,
    loadingRole,
    error,
  };
}
