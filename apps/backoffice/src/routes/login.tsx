/**
 * Login Page - Backoffice App
 *
 * Uses reusable login components from @xala/ds.
 * Supports session-safe return-to-flow authentication with flow context preservation.
 * After successful login, handles role detection:
 * - Single-role users: auto-redirect to appropriate home
 * - Dual-role users: redirect to role selection page
 */
import { useEffect, useCallback, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  LoginLayout,
  LoginOption,
  IdPortenIcon,
  MicrosoftIcon,
  BankIdIcon,
  PlatformIcon,
  AutomationIcon,
  ShieldCheckIcon,
} from '@xala/ds';
import { useT } from '@xala/i18n';
import { useAuth } from '../hooks/useAuth';
import { useBackofficeRole, useNeedsRoleSelection } from '../hooks/useBackofficeRole';
import type { FlowContext } from '@digilist/client-sdk';
import { signicatService } from '@digilist/client-sdk';


/**
 * Navigation state passed when redirecting with flow context
 */
export interface FlowContextNavigationState {
  /** The restored flow context containing booking state */
  flowContext: FlowContext;
  /** Whether this navigation is from a flow restoration */
  isFlowRestoration: boolean;
}

/**
 * Navigation state passed when flow context was expired
 */
export interface FlowContextExpiredState {
  /** Indicates the booking session expired */
  flowContextExpired: true;
}

export function LoginPage(): React.ReactElement {
  const { isAuthenticated, isLoading: authLoading, login, restoreFlowContext, hasStoredContext } = useAuth();
  const { isInitializing, getHomeRoute } = useBackofficeRole();
  const needsRoleSelection = useNeedsRoleSelection();
  const navigate = useNavigate();
  const location = useLocation();
  const t = useT();

  // Track if we've already processed flow restoration to prevent double navigation
  const flowRestorationProcessed = useRef(false);

  // Get the intended destination from location state (set by ProtectedRoute or direct navigation)
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname;

  /**
   * Handle navigation after authentication
   * Prioritizes stored flow context over simple location state
   */
  const handlePostAuthNavigation = useCallback(() => {
    // Prevent double processing
    if (flowRestorationProcessed.current) {
      return;
    }

    // Dual-role user: redirect to role selection, preserving intended destination
    if (needsRoleSelection) {
      flowRestorationProcessed.current = true;
      navigate('/role-selection', {
        replace: true,
        state: from ? { from: { pathname: from } } : undefined,
      });
      return;
    }

    // Check for stored flow context first (higher priority than location state)
    if (hasStoredContext) {
      const result = restoreFlowContext(true); // Clear after load

      if (result.hasContext && result.flowContext) {
        flowRestorationProcessed.current = true;

        // Navigate to the returnTo URL with complete flow context
        const navigationState: FlowContextNavigationState = {
          flowContext: result.flowContext,
          isFlowRestoration: true,
        };

        navigate(result.flowContext.returnTo, {
          replace: true,
          state: navigationState,
        });
        return;
      }

      // Handle expired flow context
      if (result.wasExpired) {
        flowRestorationProcessed.current = true;
        // Navigate to home with notification that session expired
        // The target page can show a toast about expired booking session
        const expiredState: FlowContextExpiredState = {
          flowContextExpired: true,
        };
        navigate(getHomeRoute(), {
          replace: true,
          state: expiredState,
        });
        return;
      }

      // Handle invalid/corrupted flow context - gracefully fall back
      if (result.wasInvalid) {
        flowRestorationProcessed.current = true;
        navigate(from ?? getHomeRoute(), { replace: true });
        return;
      }
    }

    // No flow context - use simple location state fallback or role-appropriate home
    flowRestorationProcessed.current = true;
    const destination = from ?? getHomeRoute();
    navigate(destination, { replace: true });
  }, [hasStoredContext, restoreFlowContext, navigate, from, needsRoleSelection, getHomeRoute]);

  // Handle post-login redirect based on role state
  useEffect(() => {
    // Wait for both auth and role initialization to complete
    if (authLoading || isInitializing) return;
    if (!isAuthenticated) return;

    handlePostAuthNavigation();
  }, [isAuthenticated, authLoading, isInitializing, handlePostAuthNavigation]);

  // Show nothing while loading auth or role state
  if (authLoading || isInitializing) {
    return <></>;
  }

  const features = [
    {
      icon: <PlatformIcon size={20} />,
      title: t('auth.completePlatform'),
      description: t('auth.completePlatformDesc'),
    },
    {
      icon: <AutomationIcon size={20} />,
      title: t('auth.automation'),
      description: t('auth.automationDesc'),
    },
    {
      icon: <ShieldCheckIcon size={20} />,
      title: t('auth.gdprSecure'),
      description: t('auth.gdprSecureDesc'),
    },
  ];

  const integrations = ['BankID', 'Vipps', 'Visma', 'RCO', 'ISO 27001', 'ISO 27701'];

  const footerLinks = [
    { href: 'https://digilist.no/personvern', label: t('auth.privacy') },
    { href: 'https://digilist.no/cookies', label: t('auth.terms') },
    { href: 'https://digilist.no/#book-demo', label: t('auth.contactSupport') },
  ];

  return (
    <LoginLayout
      brandName="DIGILIST"
      brandTagline="ENKEL BOOKING"
      title={t('auth.login')}
      subtitle={t('auth.selectMethod')}
      panelTitle={t('auth.backoffice')}
      panelSubtitle={t('auth.holisticSolution')}
      panelDescription={t('auth.platformDesc')}
      features={features}
      integrations={integrations}
      footerLinks={footerLinks}
      copyright={t('auth.copyright')}
    >
      <LoginOption
        icon={<IdPortenIcon />}
        title={t('auth.idporten')}
        description={t('auth.idportenDesc')}
        onClick={() => login('idporten')}
      />
      <LoginOption
        icon={<MicrosoftIcon />}
        title={t('auth.microsoft')}
        description={t('auth.microsoftDesc')}
        onClick={() => login('microsoft')}
      />
      <LoginOption
        icon={<BankIdIcon />}
        title={t('auth.bankid')}
        description={t('auth.bankidDesc')}
        onClick={() => signicatService.authorize('/role-selection')}
      />
    </LoginLayout>
  );
}
