/**
 * Login Page - Web App
 *
 * Uses reusable login components from @xala/ds
 * Supports session-safe return-to-flow authentication with flow context preservation
 */
import { useEffect, useCallback, useRef } from 'react';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import {
  LoginLayout,
  LoginOption,
  IdPortenIcon,
  MicrosoftIcon,
  VippsIcon,
  PlatformIcon,
  AutomationIcon,
  ShieldCheckIcon,
} from '@xala/ds';
import { useAuth } from '../hooks/useAuth';
import { idportenService, vippsAuthService } from '@digilist/client-sdk';
import type { FlowContext } from '@digilist/client-sdk';
import { useT } from '@xala/i18n';

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
  const t = useT();
  const { isAuthenticated, isLoading, login, restoreFlowContext, hasStoredContext } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  // Track if we've already processed flow restoration to prevent double navigation
  const flowRestorationProcessed = useRef(false);

  // Check for auth callback params (returned from ID-porten/OAuth)
  const authSuccess = searchParams.get('auth_success') === 'true';
  const authError = searchParams.get('auth_error');

  // Get fallback return path from location state (set by ProtectedRoute or direct navigation)
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/';

  // Handle auth callback - redirect to home after successful authentication
  useEffect(() => {
    if (authSuccess && !authError) {
      // Clear the URL params and redirect to home
      // The useAuth hook will have already loaded the session via getSession()
      // so isAuthenticated will be true and handlePostAuthNavigation will redirect
      navigate('/', { replace: true });
    }
  }, [authSuccess, authError, navigate]);

  /**
   * Handle navigation after authentication
   * Prioritizes stored flow context over simple location state
   */
  const handlePostAuthNavigation = useCallback(() => {
    // Prevent double processing
    if (flowRestorationProcessed.current) {
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
        navigate('/', {
          replace: true,
          state: expiredState,
        });
        return;
      }

      // Handle invalid/corrupted flow context - gracefully fall back
      if (result.wasInvalid) {
        flowRestorationProcessed.current = true;
        navigate(from, { replace: true });
        return;
      }
    }

    // No flow context - use simple location state fallback
    flowRestorationProcessed.current = true;
    navigate(from, { replace: true });
  }, [hasStoredContext, restoreFlowContext, navigate, from]);

  // Navigate after successful authentication
  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      handlePostAuthNavigation();
    }
  }, [isAuthenticated, isLoading, handlePostAuthNavigation]);

  if (isLoading) {
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
      brandName={t('brand.name')}
      brandTagline={t('brand.tagline')}
      logoHref="/"
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
        icon={<VippsIcon />}
        title={t('auth.vipps')}
        description={t('auth.temporarilyDisabled')}
        disabled
        onClick={() => {
          // Vipps login temporarily disabled
          console.log('Vipps login is temporarily disabled');
        }}
      />
      <LoginOption
        icon={<IdPortenIcon />}
        title={t('auth.idporten')}
        description={t('auth.idportenDesc')}
        onClick={() => {
          // Pass current URL for session persistence (booking flow)
          // Backend will auto-redirect based on user role or create user if needed
          const returnTo = window.location.href;
          idportenService.authorize(returnTo);
        }}
      />
      <LoginOption
        icon={<MicrosoftIcon />}
        title={t('auth.microsoft')}
        description={t('auth.comingSoon')}
        disabled
        onClick={() => {
          // Microsoft login temporarily disabled
          console.warn('Microsoft login is temporarily disabled');
        }}
      />
    </LoginLayout>
  );
}
