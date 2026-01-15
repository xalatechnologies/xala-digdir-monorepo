import { useEffect, useRef } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Spinner } from '@xala/ds';
import { useAuth, type BackofficeRole } from '../hooks/useAuth';
import { useNeedsRoleSelection } from '../hooks/useBackofficeRole';
import { useToast } from '../providers/ToastProvider';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: BackofficeRole;
}

export function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const { isLoading, isAuthenticated, checkRole } = useAuth();
  const location = useLocation();
  const { error } = useToast();
  const hasShownToast = useRef(false);

  // Check if dual-role user needs to select a role
  const needsRoleSelection = useNeedsRoleSelection();

  const hasRequiredRole = !requiredRole || checkRole(requiredRole);

  // Show toast when user lacks required role (only once per route)
  useEffect(() => {
    if (!isLoading && isAuthenticated && !hasRequiredRole && !hasShownToast.current) {
      hasShownToast.current = true;
      error(
        'Ingen tilgang',
        'Du har ikke tilgang til denne siden. Kontakt administrator hvis du mener dette er feil.'
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
        <Spinner aria-label="Laster..." data-data-size="lg" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Dual-role users without selection must select a role first
  if (needsRoleSelection) {
    return <Navigate to="/role-selection" state={{ from: location }} replace />;
  }

  if (!hasRequiredRole) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
