/**
 * Protected Route Component for SaaS Admin
 *
 * Handles authentication checks and role-based access control for routes.
 * Uses SaasAdminRole types from the auth hook.
 */

import { useEffect, useRef } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Spinner } from '@xala/ds';
import { useT } from '@xala/i18n';
import { useAuth, type SaasAdminRole } from '../hooks/useAuth';
import { useToast } from '../providers/ToastProvider';

interface ProtectedRouteProps {
  children: React.ReactNode;
  /**
   * Required role for accessing this route.
   * Super admin has access to all routes regardless of this setting.
   */
  requiredRole?: SaasAdminRole;
}

export function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const t = useT();
  const { isLoading, isAuthenticated, checkRole } = useAuth();
  const location = useLocation();
  const { error } = useToast();
  const hasShownToast = useRef(false);

  // Check if user has required role (super admin always has access)
  const hasRequiredRole = !requiredRole || checkRole(requiredRole);

  // Show toast when user lacks required role (only once per route)
  useEffect(() => {
    if (!isLoading && isAuthenticated && !hasRequiredRole && !hasShownToast.current) {
      hasShownToast.current = true;
      error(
        t('auth.accessDenied.title'),
        t('auth.accessDenied.message')
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
        <Spinner aria-label={t('common.loading')} data-size="lg" />
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
