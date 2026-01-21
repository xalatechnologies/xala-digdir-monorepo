/**
 * Login Page - Web App
 * Uses centralized LoginPage component with webAuthConfig
 */
import { useEffect, useCallback, useRef } from 'react';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { LoginPage } from '@xalatechnologies/platform/ui';
import { webAuthConfig } from '@xala/auth';
import {
  PlatformIcon,
  AutomationIcon,
  ShieldCheckIcon,
} from '@xalatechnologies/platform/ui';
import { useAuth } from '../hooks/useAuth';
import { useDemoLogin } from '../hooks/useDemoLogin';
import { idportenService } from '@digilist/client-sdk';
import { useT } from '@xala/i18n';

/**
 * Navigation state passed when redirecting with flow context
 */
export interface FlowContextNavigationState {
  flowContext: {
    returnTo: string;
    tenantId?: string;
    correlationId?: string;
    [key: string]: unknown;
  };
  isFlowRestoration: boolean;
}

/**
 * Navigation state passed when flow context was expired
 */
export interface FlowContextExpiredState {
  flowContextExpired: true;
}

export function Login(): React.ReactElement {
  const t = useT();
  const { isAuthenticated, isLoading, restoreFlowContext, hasStoredContext } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  // Track if we've already processed flow restoration
  const flowRestorationProcessed = useRef(false);

  // Demo login hook - one-click, no dialog
  const { handleDemoLogin } = useDemoLogin();

  // Check for auth callback params
  const authSuccess = searchParams.get('auth_success') === 'true';
  const authError = searchParams.get('auth_error');

  // Get fallback return path
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/';

  // Handle auth callback
  useEffect(() => {
    if (authSuccess && !authError) {
      navigate('/', { replace: true });
    }
  }, [authSuccess, authError, navigate]);

  /**
   * Handle navigation after authentication
   */
  const handlePostAuthNavigation = useCallback(() => {
    if (flowRestorationProcessed.current) {
      return;
    }

    // Check for stored flow context
    if (hasStoredContext) {
      const result = restoreFlowContext(true);

      if (result.hasContext && result.flowContext) {
        flowRestorationProcessed.current = true;
        const navigationState: FlowContextNavigationState = {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          flowContext: result.flowContext as any,
          isFlowRestoration: true,
        };
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        navigate((result.flowContext as any).returnTo, {
          replace: true,
          state: navigationState,
        });
        return;
      }

      if (result.wasExpired) {
        flowRestorationProcessed.current = true;
        const expiredState: FlowContextExpiredState = {
          flowContextExpired: true,
        };
        navigate('/', {
          replace: true,
          state: expiredState,
        });
        return;
      }

      if (result.wasInvalid) {
        flowRestorationProcessed.current = true;
        navigate(from, { replace: true });
        return;
      }
    }

    // No flow context - use simple fallback
    flowRestorationProcessed.current = true;
    navigate(from, { replace: true });
  }, [hasStoredContext, restoreFlowContext, navigate, from]);

  // Navigate after successful authentication
  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      handlePostAuthNavigation();
    }
  }, [isAuthenticated, isLoading, handlePostAuthNavigation]);

  // Handle provider click
  const handleProviderClick = (providerId: string) => {
    const returnTo = window.location.href;
    
    if (providerId === 'idporten') {
      idportenService.authorize(returnTo);
    } else if (providerId === 'demo') {
      // One-click demo login for citizens - no dialog needed
      handleDemoLogin();
    } else if (providerId === 'vipps') {
      // For demo mode, simulate Vipps login with a demo user
      const demoUser = {
        id: 'demo-user-vipps',
        name: 'Vipps Bruker',
        email: 'vipps@example.no',
      };
      localStorage.setItem('web_user', JSON.stringify(demoUser));
      navigate('/', { replace: true });
    } else if (providerId === 'microsoft') {
      console.warn('Microsoft login is not available for web app');
    }
  };

  if (isLoading) {
    return <></>;
  }

  // Branding configuration
  const brandConfig = {
    name: t('app.name'),
    tagline: t('brand.tagline'),
    logoHref: '/',
  };

  // Panel configuration with icons - Web app branding (NOT backoffice)
  const panelConfig = {
    title: t('auth.webPortal'),
    subtitle: t('auth.webSubtitle'),
    description: t('auth.webDescription'),
    features: [
      {
        icon: <PlatformIcon size={20} />,
        title: t('auth.easyBooking'),
        description: t('auth.easyBookingDesc'),
      },
      {
        icon: <AutomationIcon size={20} />,
        title: t('auth.instantConfirmation'),
        description: t('auth.instantConfirmationDesc'),
      },
      {
        icon: <ShieldCheckIcon size={20} />,
        title: t('auth.securePayment'),
        description: t('auth.securePaymentDesc'),
      },
    ],
    integrations: ['BankID', 'Vipps', 'Visma'],
  };

  // Footer links
  const footerLinks = [
    { href: 'https://digilist.no/personvern', label: t('auth.privacy') },
    { href: 'https://digilist.no/cookies', label: t('auth.terms') },
    { href: 'https://digilist.no/#book-demo', label: t('auth.contactSupport') },
  ];

  return (
    <LoginPage
      config={webAuthConfig}
      brandConfig={brandConfig}
      panelConfig={panelConfig}
      footerLinks={footerLinks}
      onProviderClick={handleProviderClick}
      isAuthenticated={isAuthenticated}
      isLoading={isLoading}
    />
  );
}

// Export alias for backward compatibility with App.tsx
export { Login as LoginPage };
