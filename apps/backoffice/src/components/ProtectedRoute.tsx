import { useEffect, useRef, useMemo } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Spinner } from '@xala/ds';
import { useAuth } from '../hooks/useAuth';
import { useNeedsRoleSelection, useBackofficeRole } from '../hooks/useBackofficeRole';
import { useCapabilities, type Capability } from '../hooks/useCapabilities';
import { useToast } from '../providers/ToastProvider';
import type { EffectiveBackofficeRole } from '../lib/capabilities';

interface ProtectedRouteProps {
  children: React.ReactNode;
  /**
   * Required role for accessing this route.
   * Uses EffectiveBackofficeRole ('admin' | 'case_handler').
   * @deprecated Use requiredCapability or requiredCapabilities instead for finer-grained control
   */
  requiredRole?: EffectiveBackofficeRole;
  /**
   * Single capability required to access this route.
   * Use this for simple permission checks.
   */
  requiredCapability?: Capability;
  /**
   * Multiple capabilities where ALL are required to access this route.
   * Use this for routes that need multiple permissions.
   */
  requiredCapabilities?: Capability[];
  /**
   * Multiple capabilities where ANY ONE is sufficient to access this route.
   * Use this for routes accessible by multiple different permission sets.
   */
  anyCapability?: Capability[];
}

export function ProtectedRoute({
  children,
  requiredRole,
  requiredCapability,
  requiredCapabilities,
  anyCapability,
}: ProtectedRouteProps) {
  const { isLoading, isAuthenticated } = useAuth();
  const { effectiveRole, getHomeRoute } = useBackofficeRole();
  const { hasCapability, hasAllCapabilities, hasAnyCapability } = useCapabilities();
  const location = useLocation();
  const { error } = useToast();
  const hasShownToast = useRef(false);

  // Check if dual-role user needs to select a role
  const needsRoleSelection = useNeedsRoleSelection();

  // Check role against effectiveRole from BackofficeRoleProvider (legacy support)
  const hasRequiredRole = !requiredRole || effectiveRole === requiredRole;

  // Check capability-based access control
  const hasRequiredCapabilities = useMemo(() => {
    // If no capability requirements, pass
    if (!requiredCapability && !requiredCapabilities && !anyCapability) {
      return true;
    }

    // Check single required capability
    if (requiredCapability && !hasCapability(requiredCapability)) {
      return false;
    }

    // Check all required capabilities (AND logic)
    if (requiredCapabilities && requiredCapabilities.length > 0) {
      if (!hasAllCapabilities(requiredCapabilities)) {
        return false;
      }
    }

    // Check any required capability (OR logic)
    if (anyCapability && anyCapability.length > 0) {
      if (!hasAnyCapability(anyCapability)) {
        return false;
      }
    }

    return true;
  }, [
    requiredCapability,
    requiredCapabilities,
    anyCapability,
    hasCapability,
    hasAllCapabilities,
    hasAnyCapability,
  ]);

  // Combined access check: both role (legacy) and capability checks must pass
  const hasAccess = hasRequiredRole && hasRequiredCapabilities;

  // Show toast when user lacks access (only once per route)
  useEffect(() => {
    if (!isLoading && isAuthenticated && !hasAccess && !hasShownToast.current) {
      hasShownToast.current = true;
      error(
        'Ingen tilgang',
        'Du har ikke tilgang til denne siden. Kontakt administrator hvis du mener dette er feil.'
      );
    }
  }, [isLoading, isAuthenticated, hasAccess, error]);

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

  if (!hasAccess) {
    return <Navigate to={getHomeRoute()} replace />;
  }

  return <>{children}</>;
}
