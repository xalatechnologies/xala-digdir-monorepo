/**
 * Login Page - SaaS Admin
 * Uses centralized LoginPage component with saasAdminAuthConfig
 */
import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { LoginPage as LoginPageComponent } from '@xalatechnologies/platform/ui';
import { saasAdminAuthConfig } from '@xalatechnologies/platform/auth';
import {
  ShieldCheckIcon,
  BuildingIcon,
  SettingsIcon,
} from '@xalatechnologies/platform/ui';
import { useAuth } from '@xalatechnologies/platform/auth';
import { useDemoLogin } from '../hooks/useDemoLogin';
import { idportenService } from '@xalatechnologies/platform/sdk';
import { useT } from '@xalatechnologies/platform/i18n';

export function LoginPage(): React.ReactElement {
  const { isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const t = useT();

  const { showDialog, openDemoLogin, closeDemoLogin, handleDemoLogin } = useDemoLogin();
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/';

  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, isLoading, navigate, from]);

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
    tagline: 'SAAS ADMIN',
    logoHref: '/',
  };

  const panelConfig = {
    title: t('auth.saasAdmin'),
    subtitle: t('auth.platformAdmin'),
    description: t('auth.saasAdminDesc'),
    features: [
      {
        icon: <BuildingIcon size={20} />,
        title: t('auth.tenantManagement'),
        description: t('auth.tenantManagementDesc'),
      },
      {
        icon: <SettingsIcon size={20} />,
        title: t('auth.featureFlags'),
        description: t('auth.featureFlagsDesc'),
      },
      {
        icon: <ShieldCheckIcon size={20} />,
        title: t('auth.platformMetrics'),
        description: t('auth.platformMetricsDesc'),
      },
    ],
    integrations: ['BankID', 'Microsoft AD', 'Monitoring'],
  };

  const footerLinks = [
    { href: 'https://digilist.no/personvern', label: t('auth.privacy') },
    { href: 'https://digilist.no/cookies', label: t('auth.terms') },
    { href: 'https://digilist.no/#book-demo', label: t('auth.contactSupport') },
  ];

  return (
    <LoginPageComponent
      config={saasAdminAuthConfig}
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

export default LoginPage;
