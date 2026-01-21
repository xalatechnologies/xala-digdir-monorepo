/**
 * ProtectedRoute Component
 *
 * Wraps routes that require authentication with support for:
 * - Basic authentication check
 * - Role-based access control
 * - Custom access check functions
 * - Configurable loading and redirect behavior
 *
 * @example
 * ```tsx
 * // Basic usage
 * <ProtectedRoute>
 *   <ProtectedContent />
 * </ProtectedRoute>
 *
 * // With role requirement
 * <ProtectedRoute requiredRole="admin">
 *   <AdminContent />
 * </ProtectedRoute>
 *
 * // With custom access check
 * <ProtectedRoute
 *   accessCheck={() => hasCapability('manage_users')}
 *   onAccessDenied={() => showToast('No access')}
 * >
 *   <UserManagement />
 * </ProtectedRoute>
 * ```
 */

import { useEffect, useRef } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import type { UserRole } from '../types';

export interface ProtectedRouteProps {
  /** Child components to render when authorized */
  children: React.ReactNode;
  /** Path to redirect to when not authenticated */
  redirectTo?: string;
  /** Required role to access this route */
  requiredRole?: UserRole | string;
  /** Custom access check function */
  accessCheck?: () => boolean;
  /** Callback when access is denied (for showing toasts, etc.) */
  onAccessDenied?: () => void;
  /** Custom loading component */
  loadingComponent?: React.ReactNode;
  /** Custom access denied component (if not redirecting) */
  accessDeniedComponent?: React.ReactNode;
  /** Path to redirect when access is denied (instead of showing component) */
  accessDeniedRedirect?: string;
  /** Whether to use navigation state for return URL */
  saveReturnUrl?: boolean;
}

/**
 * ProtectedRoute checks authentication and optionally role/access
 */
export function ProtectedRoute({
  children,
  redirectTo = '/login',
  requiredRole,
  accessCheck,
  onAccessDenied,
  loadingComponent,
  accessDeniedComponent,
  accessDeniedRedirect = '/',
  saveReturnUrl = true,
}: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, accessDeniedError, checkRole } = useAuth();
  const location = useLocation();
  const hasCalledAccessDenied = useRef(false);

  // Determine if user has required access
  const hasRequiredRole = !requiredRole || checkRole(requiredRole as UserRole);
  const passesAccessCheck = !accessCheck || accessCheck();
  const hasAccess = hasRequiredRole && passesAccessCheck;

  // Call onAccessDenied callback when access is denied
  useEffect(() => {
    if (!isLoading && isAuthenticated && !hasAccess && !hasCalledAccessDenied.current) {
      hasCalledAccessDenied.current = true;
      onAccessDenied?.();
    }
  }, [isLoading, isAuthenticated, hasAccess, onAccessDenied]);

  // Reset callback flag when location changes
  useEffect(() => {
    hasCalledAccessDenied.current = false;
  }, [location.pathname]);

  // Show loading state
  if (isLoading) {
    return loadingComponent ?? <DefaultLoadingComponent />;
  }

  // Handle access denied error from auth
  if (accessDeniedError) {
    return <Navigate to="/access-denied" replace />;
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    const state = saveReturnUrl
      ? { from: { pathname: location.pathname, search: location.search } }
      : undefined;
    return <Navigate to={redirectTo} state={state} replace />;
  }

  // Handle access denied (authenticated but lacking permission)
  if (!hasAccess) {
    if (accessDeniedComponent) {
      return <>{accessDeniedComponent}</>;
    }
    return <Navigate to={accessDeniedRedirect} replace />;
  }

  return <>{children}</>;
}

/**
 * Default loading component (simple, can be overridden)
 */
function DefaultLoadingComponent() {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '50vh',
      }}
    >
      <div>Laster...</div>
    </div>
  );
}
