import { useEffect, useRef } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Spinner, Heading, Paragraph } from '@xala/ds';
import { useT } from '@xala/i18n';
import { useAuth, type BackofficeRole } from '../hooks/useAuth';
import { useAccountContext, type DashboardContext } from '../providers/AccountContextProvider';
import {
  createFlowContext,
  saveFlowContextToStorage,
  sanitizeReturnToUrl,
} from '@digilist/client-sdk';
import type { FlowContext } from '@digilist/client-sdk';

/**
 * Props for ProtectedRoute component
 */
interface ProtectedRouteProps {
  children: React.ReactNode;
  /** Required role to access this route */
  requiredRole?: BackofficeRole;
  /** Tenant ID for flow context (optional, defaults to env or 'minside') */
  tenantId?: string;
  /** Required account context for this route */
  requiredContext?: DashboardContext;
}

/**
 * Navigation state passed when redirecting to login
 * Minimal state to avoid URL length issues - full context is in sessionStorage
 */
export interface ProtectedRouteLoginState {
  /** Simple pathname to return to (for backwards compatibility) */
  from: { pathname: string; search: string };
  /** Flag indicating flow context is stored in sessionStorage */
  hasFlowContext: boolean;
}

/**
 * Extracts form data from location state if present
 * Used to preserve any form state that might be in progress
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

  // Return undefined if no form data found
  return undefined;
}

/**
 * ProtectedRoute component with session-safe return-to-flow support.
 *
 * When an unauthenticated user tries to access a protected route, this component:
 * 1. Saves the full navigation context (URL, form state, etc.) to sessionStorage
 * 2. Redirects to login with minimal state in URL
 * 3. Login page can restore full context from sessionStorage after auth
 *
 * This ensures no user state is lost during authentication flows.
 *
 * @example
 * ```tsx
 * <Route
 *   path="/profile/settings"
 *   element={
 *     <ProtectedRoute>
 *       <ProfileSettings />
 *     </ProtectedRoute>
 *   }
 * />
 * ```
 */
export function ProtectedRoute({
  children,
  requiredRole,
  tenantId,
  requiredContext,
}: ProtectedRouteProps) {
  const { isLoading, isAuthenticated, checkRole } = useAuth();
  const { accountType, isLoadingOrganizations } = useAccountContext();
  const location = useLocation();
  const t = useT();

  // Track if we've already saved context to prevent double-saves
  const hasStoredContext = useRef(false);

  // Get tenant ID from props, environment, or fallback
  const resolvedTenantId = tenantId
    ?? import.meta.env.VITE_TENANT_ID
    ?? 'minside';

  /**
   * Save flow context when user needs to authenticate.
   * This effect runs when:
   * - Not loading
   * - User is not authenticated
   * - We haven't already saved context
   */
  useEffect(() => {
    // Only save context once when we detect unauthenticated state
    if (!isLoading && !isAuthenticated && !hasStoredContext.current) {
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
  }, [isLoading, isAuthenticated, location, resolvedTenantId]);

  // Show loading state while auth or account context is being determined
  if (isLoading || (requiredContext && isLoadingOrganizations)) {
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
        <Spinner aria-label={t('components.protected.loading')} data-size="lg" />
      </div>
    );
  }

  // Add a check to prevent redirect loops
  const isLoginPage = location.pathname === '/login';
  
  if (!isAuthenticated && !isLoginPage) {
    // Create minimal state for backwards compatibility and as fallback
    const loginState: ProtectedRouteLoginState = {
      from: {
        pathname: location.pathname,
        search: location.search,
      },
      hasFlowContext: hasStoredContext.current,
    };

    return <Navigate to="/login" state={loginState} replace />;
  }

  // If we're on login page but authenticated, redirect to appropriate home
  if (isAuthenticated && isLoginPage) {
    const redirectTo = accountType === 'organization' ? '/org' : '/';
    return <Navigate to={redirectTo} replace />;
  }

  if (requiredRole && !checkRole(requiredRole)) {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100%',
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
          {t('components.protected.noAccess')}
        </Heading>
        <Paragraph style={{ color: 'var(--ds-color-neutral-text-subtle)' }}>
          {t('components.protected.noAccessDescription')}
          <br />
          {t('components.protected.contactAdmin')}
        </Paragraph>
      </div>
    );
  }

  // Context validation: Check if current account context matches required context
  // If wrong context, redirect to current context's home page silently
  // (User likely just switched context via AccountSwitcher - no need to show message)
  if (requiredContext && accountType !== requiredContext) {
    // Redirect to current context's home (not the required context's home)
    const redirectTo = accountType === 'organization' ? '/org' : '/';

    return (
      <Navigate
        to={redirectTo}
        replace
      />
    );
  }

  return <>{children}</>;
}
