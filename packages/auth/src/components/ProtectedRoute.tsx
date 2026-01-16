/**
 * ProtectedRoute Component
 * ========================
 * 
 * Wraps routes that require authentication
 */

import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

interface ProtectedRouteProps {
  children: React.ReactNode;
  redirectTo?: string;
}

export function ProtectedRoute({ 
  children, 
  redirectTo = '/login' 
}: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, accessDeniedError } = useAuth();

  if (isLoading) {
    return <div>Laster...</div>;
  }

  if (accessDeniedError) {
    return <Navigate to="/access-denied" replace />;
  }

  if (!isAuthenticated) {
    return <Navigate to={redirectTo} replace />;
  }

  return <>{children}</>;
}
