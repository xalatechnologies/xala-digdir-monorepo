/**
 * Login Page - Web App
 * Uses centralized LoginPage component with webAuthConfig
 */
import { useEffect, useCallback, useRef, useState } from 'react';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { LoginPage } from '@xala/ds';
import { webAuthConfig } from '@xala/auth';
import {
  PlatformIcon,
  AutomationIcon,
  ShieldCheckIcon,
  IdPortenIcon,
  VippsIcon,
  MicrosoftIcon,
  KeyIcon,
} from '@xala/ds';
import { useAuth } from '../hooks/useAuth';
import { useDemoLogin } from '../hooks/useDemoLogin';
import { idportenService } from '@digilist/client-sdk';
import type { FlowContext } from '@digilist/client-sdk';
import { useT } from '@xala/i18n';

/**
 * Navigation state passed when redirecting with flow context
 */
export interface FlowContextNavigationState {
  flowContext: {
    returnTo: string;
    tenantId?: string;
    correlationId?: string;
    [key: string]: any;
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

  // Demo login hook
  const { showDialog, openDemoLogin, closeDemoLogin, handleDemoLogin } = useDemoLogin();

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
          flowContext: result.flowContext as any,
          isFlowRestoration: true,
        };
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
    if (providerId === 'idporten') {
      const returnTo = window.location.href;
      idportenService.authorize(returnTo);
    } else if (providerId === 'vipps') {
      console.log('Vipps login is temporarily disabled');
    } else if (providerId === 'microsoft') {
      console.warn('Microsoft login is temporarily disabled');
    }
  };

  if (isLoading) {
    return <></>;
  }

  // Branding configuration
  const brandConfig = {
    name: t('brand.name'),
    tagline: t('brand.tagline'),
    logoHref: '/',
  };

  // Panel configuration with icons
  const panelConfig = {
    title: t('auth.backoffice'),
    subtitle: t('auth.holisticSolution'),
    description: t('auth.platformDesc'),
    features: [
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
    ],
    integrations: ['BankID', 'Vipps', 'Visma', 'RCO', 'ISO 27001', 'ISO 27701'],
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
      demoLoginOpen={showDialog}
      onDemoLoginOpen={openDemoLogin}
      onDemoLoginClose={closeDemoLogin}
      onDemoLoginSubmit={handleDemoLogin}
    />
  );
}

// Export alias for backward compatibility with App.tsx
export { Login as LoginPage };
