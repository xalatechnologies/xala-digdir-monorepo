/**
 * Protected Route Component for Tenant Admin
 *
 * Handles authentication checks and role-based access control for routes.
 * Uses TenantAdminRole types from the auth hook.
 */

import { useEffect, useRef } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Spinner } from '@xala/ds';
import { useAuth, type TenantAdminRole } from '@xala/auth';
import { useT } from '@xala/i18n';
import { useToast } from '../providers/ToastProvider';

interface ProtectedRouteProps {
  children: React.ReactNode;
  /**
   * Required role for accessing this route.
   * Tenant admin has access to all routes regardless of this setting.
   */
  requiredRole?: TenantAdminRole;
}

export function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const { isLoading, isAuthenticated, checkRole } = useAuth();
  const location = useLocation();
  const { error } = useToast();
  const t = useT();
  const hasShownToast = useRef(false);

  // Check if user has required role (tenant admin always has access)
  const hasRequiredRole = !requiredRole || checkRole(requiredRole);

  // Show toast when user lacks required role (only once per route)
  useEffect(() => {
    if (!isLoading && isAuthenticated && !hasRequiredRole && !hasShownToast.current) {
      hasShownToast.current = true;
      error(
        t('tenantAdmin.auth.noAccess', { defaultValue: 'No access' }),
        t('tenantAdmin.auth.noAccessDescription', {
          defaultValue:
            'You do not have access to this page. Contact tenant administrator if you believe this is an error.',
        })
      );
    }
  }, [isLoading, isAuthenticated, hasRequiredRole, error, t]);

  // Reset toast flag when location changes
  useEffect(() => {
    hasShownToast.current = false;
  }, [location.pathname]);

  if (isLoading) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          backgroundColor: 'var(--ds-color-neutral-background-default)',
        }}
      >
        <Spinner aria-label={t('common.loading', { defaultValue: 'Loading...' })} data-size="lg" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!hasRequiredRole) {
    // Redirect to dashboard if user lacks required role
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
