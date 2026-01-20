/**
 * ProtectedRoute Component
 * 
 * Unified route protection component that supports:
 * - Basic authentication checks
 * - Role-based access control
 * - Capability-based access control (via callbacks)
 * - Account context checks (via callbacks)
 * - Flow context preservation for OAuth redirects
 * - Configurable redirect paths
 * 
 * This component is designed to work across all apps while allowing
 * app-specific customization through props and callbacks.
 */

import { useEffect, useRef, useMemo } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Spinner, Heading, Paragraph } from '@xala/ds';
import { useT } from '@xala/i18n';
import { useAuth } from '@xala/auth';
import {
  createFlowContext,
  saveFlowContextToStorage,
  sanitizeReturnToUrl,
} from '@digilist/client-sdk';
import type { FlowContext } from '@digilist/client-sdk';

/**
 * Props for ProtectedRoute component
 */
export interface ProtectedRouteProps {
  /** Child components to wrap */
  children: React.ReactNode;
  
  /** Redirect path when not authenticated (default: /login) */
  redirectTo?: string;
  
  /** Tenant ID for flow context (optional, defaults to env or 'app') */
  tenantId?: string;
  
  /** Enable flow context preservation (default: true) */
  enableFlowContext?: boolean;
  
  /** Required role(s) to access this route */
  requiredRole?: string | string[];
  
  /** Custom role check function (overrides default checkRole from useAuth) */
  checkRole?: (role: string) => boolean;
  
  /** Required capability(ies) - checked via callback */
  requiredCapability?: string | string[];
  
  /** Custom capability check function */
  checkCapability?: (capability: string) => boolean;
  
  /** Check if ALL capabilities are required (default: true for requiredCapability array) */
  requireAllCapabilities?: boolean;
  
  /** Required account context (e.g., 'personal' | 'organization') */
  requiredContext?: string;
  
  /** Current account context */
  currentContext?: string;
  
  /** Loading state for account context */
  isLoadingContext?: boolean;
  
  /** Custom home route for authenticated users (default: /) */
  homeRoute?: string | (() => string);
  
  /** Role selection page path (for dual-role users) */
  roleSelectionPath?: string;
  
  /** Check if user needs role selection */
  needsRoleSelection?: boolean;
  
  /** Custom access denied component */
  accessDeniedComponent?: React.ReactNode;
  
  /** Show toast on access denied (requires toast provider) */
  showAccessDeniedToast?: boolean;
  
  /** Custom toast function */
  showToast?: (title: string, message: string) => void;
  
  /** Custom loading component */
  loadingComponent?: React.ReactNode;
  
  /** Additional pages to exclude from redirect (besides login) */
  excludedPaths?: string[];
}

/**
 * Navigation state passed when redirecting to login
 */
export interface ProtectedRouteLoginState {
  /** Simple pathname to return to (for backwards compatibility) */
  from: { pathname: string; search: string };
  /** Flag indicating flow context is stored in sessionStorage */
  hasFlowContext: boolean;
}

/**
 * Extracts form data from location state if present
 */
function extractFormDataFromState(state: unknown): Record<string, unknown> | undefined {
  if (!state || typeof state !== 'object') {
    return undefined;
  }

  const stateObj = state as Record<string, unknown>;

  // Look for common form data patterns in state
  if (stateObj.formData && typeof stateObj.formData === 'object') {
    return stateObj.formData as Record<string, unknown>;
  }

  return undefined;
}

/**
 * ProtectedRoute component with unified auth/role/capability checking
 */
export function ProtectedRoute({
  children,
  redirectTo = '/login',
  tenantId,
  enableFlowContext = true,
  requiredRole,
  checkRole: customCheckRole,
  requiredCapability,
  checkCapability,
  requireAllCapabilities = true,
  requiredContext,
  currentContext,
  isLoadingContext = false,
  homeRoute = '/',
  roleSelectionPath = '/role-selection',
  needsRoleSelection = false,
  accessDeniedComponent,
  showAccessDeniedToast = false,
  showToast,
  loadingComponent,
  excludedPaths = [],
}: ProtectedRouteProps) {
  const t = useT();
  const { isLoading, isAuthenticated, checkRole: authCheckRole } = useAuth();
  const location = useLocation();
  const hasShownToast = useRef(false);

  // Track if we've already saved context to prevent double-saves
  const hasStoredContext = useRef(false);

  // Get tenant ID from props, environment, or fallback
  // Note: import.meta.env requires Vite types which may not be available in DS package
  const getEnvTenantId = (): string | undefined => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const env = (import.meta as any)?.env;
      return env?.VITE_TENANT_ID as string | undefined;
    } catch {
      return undefined;
    }
  };
  const resolvedTenantId = tenantId ?? getEnvTenantId() ?? 'app';

  // Use custom checkRole or default from auth hook
  const checkRoleFn = customCheckRole || authCheckRole || (() => false);

  // Check role access
  // Note: checkRoleFn may expect specific UserRole type, cast string as needed
  const hasRequiredRole = useMemo(() => {
    if (!requiredRole) return true;

    if (Array.isArray(requiredRole)) {
      // User needs ANY of the roles
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return requiredRole.some((role) => checkRoleFn(role as any));
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return checkRoleFn(requiredRole as any);
  }, [requiredRole, checkRoleFn]);

  // Check capability access
  const hasRequiredCapability = useMemo(() => {
    if (!requiredCapability || !checkCapability) return true;
    
    if (Array.isArray(requiredCapability)) {
      if (requireAllCapabilities) {
        // User needs ALL capabilities
        return requiredCapability.every((cap) => checkCapability(cap));
      } else {
        // User needs ANY capability
        return requiredCapability.some((cap) => checkCapability(cap));
      }
    }
    
    return checkCapability(requiredCapability);
  }, [requiredCapability, checkCapability, requireAllCapabilities]);

  // Check context access
  const hasRequiredContext = useMemo(() => {
    if (!requiredContext || !currentContext) return true;
    return currentContext === requiredContext;
  }, [requiredContext, currentContext]);

  // Combined access check
  const hasAccess = hasRequiredRole && hasRequiredCapability && hasRequiredContext;

  // Show toast when user lacks access (only once per route)
  useEffect(() => {
    if (
      showAccessDeniedToast &&
      showToast &&
      !isLoading &&
      isAuthenticated &&
      !hasAccess &&
      !hasShownToast.current
    ) {
      hasShownToast.current = true;
      showToast(
        t('components.protected.noAccess') || 'Ingen tilgang',
        t('components.protected.noAccessDescription') || 'Du har ikke tilgang til denne siden.'
      );
    }
  }, [isLoading, isAuthenticated, hasAccess, showAccessDeniedToast, showToast, t]);

  // Reset toast flag when location changes
  useEffect(() => {
    hasShownToast.current = false;
  }, [location.pathname]);

  /**
   * Save flow context when user needs to authenticate.
   */
  useEffect(() => {
    if (
      enableFlowContext &&
      !isLoading &&
      !isAuthenticated &&
      !hasStoredContext.current
    ) {
      // Build the returnTo URL from current location
      const returnTo = sanitizeReturnToUrl(
        location.pathname + location.search
      );

      // Extract any form data that might be in state
      const formData = extractFormDataFromState(location.state);

      // Create and save flow context
      const flowContext: FlowContext = createFlowContext(
        returnTo,
        resolvedTenantId,
        {
          formData,
        }
      );

      // Save to sessionStorage
      const saved = saveFlowContextToStorage(flowContext);

      if (saved) {
        hasStoredContext.current = true;
      }
    }
  }, [isLoading, isAuthenticated, location, resolvedTenantId, enableFlowContext]);

  // Show loading state
  if (isLoading || isLoadingContext) {
    if (loadingComponent) {
      return <>{loadingComponent}</>;
    }
    
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
        <Spinner aria-label={t('common.loading') || 'Laster...'} data-size="lg" />
      </div>
    );
  }

  // Check if we're on an excluded path
  const isExcludedPath = excludedPaths.some((path) => location.pathname === path);
  const isLoginPage = location.pathname === redirectTo || location.pathname === '/login';
  const isRoleSelectionPage = location.pathname === roleSelectionPath;

  // Redirect unauthenticated users
  if (!isAuthenticated && !isLoginPage && !isExcludedPath) {
    const loginState: ProtectedRouteLoginState = {
      from: {
        pathname: location.pathname,
        search: location.search,
      },
      hasFlowContext: hasStoredContext.current,
    };

    return <Navigate to={redirectTo} state={loginState} replace />;
  }

  // Redirect authenticated users away from login/role selection pages
  if (isAuthenticated && (isLoginPage || isRoleSelectionPage)) {
    // Check if user needs role selection first
    if (needsRoleSelection && !isRoleSelectionPage) {
      return <Navigate to={roleSelectionPath} replace />;
    }
    
    const home = typeof homeRoute === 'function' ? homeRoute() : homeRoute;
    return <Navigate to={home} replace />;
  }

  // Dual-role users without selection must select a role first
  if (needsRoleSelection && !isRoleSelectionPage) {
    return <Navigate to={roleSelectionPath} state={{ from: location }} replace />;
  }

  // Check access
  if (!hasAccess) {
    // Use custom access denied component if provided
    if (accessDeniedComponent) {
      return <>{accessDeniedComponent}</>;
    }

    // Default access denied UI
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          gap: 'var(--ds-spacing-4)',
          padding: 'var(--ds-spacing-6)',
          textAlign: 'center',
        }}
      >
        <Heading
          level={1}
          data-size="lg"
          style={{ color: 'var(--ds-color-danger-text-default)' }}
        >
          {t('components.protected.noAccess') || 'Ingen tilgang'}
        </Heading>
        <Paragraph style={{ color: 'var(--ds-color-neutral-text-subtle)' }}>
          {t('components.protected.noAccessDescription') || 'Du har ikke tilgang til denne siden.'}
        </Paragraph>
      </div>
    );
  }

  // Context validation: redirect if wrong context
  if (requiredContext && currentContext && currentContext !== requiredContext) {
    const home = typeof homeRoute === 'function' ? homeRoute() : homeRoute;
    return <Navigate to={home} replace />;
  }

  return <>{children}</>;
}
