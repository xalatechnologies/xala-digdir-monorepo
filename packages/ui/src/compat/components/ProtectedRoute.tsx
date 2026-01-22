/**
 * ProtectedRoute Component
 *
 * Protects routes that require authentication.
 * Redirects to login page if user is not authenticated.
 */

import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useSession } from '../../auth';
import { Spinner } from '@digdir/designsystemet-react';

export interface ProtectedRouteProps {
  children: React.ReactNode;
  /**
   * Custom path to redirect to if not authenticated
   * @default '/login'
   */
  redirectTo?: string;
  /**
   * Optional fallback while loading
   */
  fallback?: React.ReactNode;
  /**
   * Required roles for access
   */
  requiredRoles?: string[];
}

interface SessionUser {
  roles?: string[];
  [key: string]: unknown;
}

interface SessionData {
  user?: SessionUser;
  data?: {
    user?: SessionUser;
  };
}

export function ProtectedRoute({
  children,
  redirectTo = '/login',
  fallback,
  requiredRoles = [],
}: ProtectedRouteProps): React.ReactElement | null {
  const location = useLocation();
  const { data: session, isLoading, error } = useSession();

  // Loading state
  if (isLoading) {
    return (
      fallback ? (
        <>{fallback}</>
      ) : (
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '100vh',
          }}
        >
          <Spinner aria-label="Loading..." />
        </div>
      )
    );
  }

  // Extract user from session (handle both wrapped and unwrapped responses)
  const sessionData = session as SessionData | undefined;
  const user = sessionData?.data?.user ?? sessionData?.user;

  // Not authenticated
  if (error || !user) {
    // Preserve the attempted URL for redirect after login
    const returnTo = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={`${redirectTo}?returnTo=${returnTo}`} replace />;
  }

  // Role check (if required)
  if (requiredRoles.length > 0) {
    const userRoles = user.roles || [];
    const hasRequiredRole = requiredRoles.some((role) => userRoles.includes(role));
    if (!hasRequiredRole) {
      return <Navigate to="/unauthorized" replace />;
    }
  }

  return <>{children}</>;
}
