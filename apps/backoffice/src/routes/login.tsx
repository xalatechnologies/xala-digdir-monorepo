/**
 * Login Page - Backoffice
 * Uses centralized LoginPage component with backofficeAuthConfig
 */
import { useEffect, useCallback, useRef } from 'react';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { LoginPage as LoginPageComponent, DemoRoleSwitcher } from '@xalatechnologies/platform/ui';
import { backofficeAuthConfig } from '@xala/auth';
import {
  PlatformIcon,
  AutomationIcon,
  ShieldCheckIcon,
} from '@xalatechnologies/platform/ui';
import { useAuth } from '@xala/auth';
import { useBackofficeRole, useNeedsRoleSelection } from '../hooks/useBackofficeRole';
import { useDemoLogin } from '../hooks/useDemoLogin';
import { idportenService } from '@digilist/client-sdk';
import { useT } from '@xala/i18n';

export interface FlowContextNavigationState {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  flowContext: any;
  isFlowRestoration: boolean;
}

export interface FlowContextExpiredState {
  flowContextExpired: true;
}

export function LoginPage(): React.ReactElement {
  const { isAuthenticated, isLoading, restoreFlowContext, hasStoredContext } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const t = useT();

  const flowRestorationProcessed = useRef(false);
  const {
    showDialog,
    openDemoLogin,
    closeDemoLogin,
    handleDemoLogin,
    showRoleSwitcher,
    openRoleSwitcher,
    closeRoleSwitcher,
    handleRoleSelect,
    loadingRole,
    error: demoError,
  } = useDemoLogin();
  const { selectedRole } = useBackofficeRole();
  const needsRoleSelection = useNeedsRoleSelection();

  const authSuccess = searchParams.get('auth_success') === 'true';
  const authError = searchParams.get('auth_error');
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/';

  useEffect(() => {
    if (authSuccess && !authError) {
      navigate('/', { replace: true });
    }
  }, [authSuccess, authError, navigate]);

  const handlePostAuthNavigation = useCallback(() => {
    if (flowRestorationProcessed.current) {
      return;
    }

    if (needsRoleSelection && !selectedRole) {
      flowRestorationProcessed.current = true;
      navigate('/select-role', { replace: true });
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
        navigate((result.flowContext as any).returnPath, {
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
  }, [hasStoredContext, restoreFlowContext, navigate, from, needsRoleSelection, selectedRole]);

  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      handlePostAuthNavigation();
    }
  }, [isAuthenticated, isLoading, handlePostAuthNavigation]);

  const handleProviderClick = (providerId: string) => {
    if (providerId === 'idporten') {
      const returnTo = window.location.href;
      idportenService.authorize(returnTo);
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
    title: '',
    subtitle: 'BACKOFFICE',
    description: t('auth.backofficeDesc'),
    features: [
      {
        icon: <PlatformIcon size={20} />,
        title: t('auth.bookingAdmin'),
        description: t('auth.bookingAdminDesc'),
      },
      {
        icon: <AutomationIcon size={20} />,
        title: t('auth.userAdmin'),
        description: t('auth.userAdminDesc'),
      },
      {
        icon: <ShieldCheckIcon size={20} />,
        title: t('auth.reportsStats'),
        description: t('auth.reportsStatsDesc'),
      },
    ],
    integrations: ['BankID', 'Microsoft AD', 'Visma'],
  };

  const footerLinks = [
    { href: 'https://digilist.no/personvern', label: t('auth.privacy') },
    { href: 'https://digilist.no/cookies', label: t('auth.terms') },
    { href: 'https://digilist.no/#book-demo', label: t('auth.contactSupport') },
  ];

  return (
    <>
      {authError && (
        <div
          style={{
            margin: 'var(--ds-spacing-6)',
            padding: 'var(--ds-spacing-4)',
            backgroundColor: 'var(--ds-color-danger-background-subtle)',
            border: '1px solid var(--ds-color-danger-border-default)',
            borderRadius: 'var(--ds-border-radius-sm)',
            color: 'var(--ds-color-danger-text-default)',
          }}
        >
          {t('auth.loginFailed')}: {authError}
        </div>
      )}
      <LoginPageComponent
        config={backofficeAuthConfig}
        brandConfig={brandConfig}
        panelConfig={panelConfig}
        footerLinks={footerLinks}
        onProviderClick={handleProviderClick}
        isAuthenticated={isAuthenticated}
        isLoading={isLoading}
        demoLoginOpen={showDialog}
        onDemoLoginOpen={openRoleSwitcher}
        onDemoLoginClose={closeDemoLogin}
        onDemoLoginSubmit={handleDemoLogin}
      />
      
      {/* Demo Role Switcher - one-click demo login */}
      <DemoRoleSwitcher
        open={showRoleSwitcher}
        onClose={closeRoleSwitcher}
        onRoleSelect={handleRoleSelect}
        loadingRole={loadingRole}
        error={demoError}
        title={t('auth.demoLogin')}
        description={t('auth.demoLoginDescription')}
        cancelText={t('common.cancel')}
      />
    </>
  );
}

export default LoginPage;
