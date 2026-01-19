/**
 * Login Page - MinSide
 * Uses centralized LoginPage component with minsideAuthConfig
 */
import { useEffect, useCallback, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { LoginPage as LoginPageComponent } from '@xala/ds';
import { minsideAuthConfig } from '@xala/auth';
import {
  PlatformIcon,
  AutomationIcon,
  ShieldCheckIcon,
} from '@xala/ds';
import { useAuth } from '@xala/auth';
import { useDemoLogin } from '../hooks/useDemoLogin';
import { idportenService } from '@digilist/client-sdk';
import { useT } from '@xala/i18n';

export interface FlowContextNavigationState {
  flowContext: {
    returnTo: string;
    tenantId?: string;
    correlationId?: string;
    [key: string]: unknown;
  };
  isFlowRestoration: boolean;
}

export interface FlowContextExpiredState {
  flowContextExpired: true;
}

export function LoginPage(): React.ReactElement {
  const { isAuthenticated, isLoading, restoreFlowContext, hasStoredContext } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const t = useT();

  const flowRestorationProcessed = useRef(false);
  const { handleDemoLogin } = useDemoLogin();

  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/';

  const handlePostAuthNavigation = useCallback(() => {
    if (flowRestorationProcessed.current) {
      return;
    }

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

    flowRestorationProcessed.current = true;
    navigate(from, { replace: true });
  }, [hasStoredContext, restoreFlowContext, navigate, from]);

  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      handlePostAuthNavigation();
    }
  }, [isAuthenticated, isLoading, handlePostAuthNavigation]);

  const handleProviderClick = (providerId: string) => {
    if (providerId === 'idporten') {
      const returnTo = window.location.href;
      idportenService.authorize(returnTo);
    } else if (providerId === 'demo') {
      // One-click demo login for citizens - no dialog needed
      handleDemoLogin();
    } else if (providerId === 'vipps') {
      console.log('Vipps login is temporarily disabled');
    } else if (providerId === 'microsoft') {
      console.warn('Microsoft login is temporarily disabled');
    }
  };

  if (isLoading) {
    return <></>;
  }

  const brandConfig = {
    name: t('app.name'),
    tagline: t('brand.tagline'),
    logoHref: '/',
  };

  const panelConfig = {
    title: t('auth.minside'),
    subtitle: t('auth.yourBookings'),
    description: t('auth.minsideDesc'),
    features: [
      {
        icon: <PlatformIcon size={20} />,
        title: t('auth.myBookings'),
        description: t('auth.myBookingsDesc'),
      },
      {
        icon: <AutomationIcon size={20} />,
        title: t('auth.bookingHistory'),
        description: t('auth.bookingHistoryDesc'),
      },
      {
        icon: <ShieldCheckIcon size={20} />,
        title: t('auth.profileSettings'),
        description: t('auth.profileSettingsDesc'),
      },
    ],
    integrations: ['BankID', 'MinID', 'Vipps'],
  };

  const footerLinks = [
    { href: 'https://digilist.no/personvern', label: t('auth.privacy') },
    { href: 'https://digilist.no/cookies', label: t('auth.terms') },
    { href: 'https://digilist.no/#book-demo', label: t('auth.contactSupport') },
  ];

  return (
    <LoginPageComponent
      config={minsideAuthConfig}
      brandConfig={brandConfig}
      panelConfig={panelConfig}
      footerLinks={footerLinks}
      onProviderClick={handleProviderClick}
      isAuthenticated={isAuthenticated}
      isLoading={isLoading}
    />
  );
}

export default LoginPage;
