/**
 * Protected Route Component for SaaS Admin
 *
 * Handles authentication checks and role-based access control for routes.
 * Uses SaasAdminRole types from the auth hook.
 */

import { useEffect, useRef } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Spinner } from '@xala/ds';
import { useAuth, type SaasAdminRole } from '@xala/auth';
import { useToast } from '../providers/ToastProvider';
import { useT } from '@xala/i18n';
interface ProtectedRouteProps {
  children: React.ReactNode;
  /**
   * Required role for accessing this route.
   * Super admin has access to all routes regardless of this setting.
   */
  requiredRole?: SaasAdminRole;
}

export function ProtectedRoute({
  const t = useT();
 children, requiredRole }: ProtectedRouteProps) {
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
        'Ingen tilgang',
        'Du har ikke tilgang til denne siden. Kontakt plattformadministrator hvis du mener dette er feil.'
      );
    }
  }, [isLoading, isAuthenticated, hasRequiredRole, error]);

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
        <Spinner aria-label={t('saasAdmin.ariaLabel.laster')} size="lg" />
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
