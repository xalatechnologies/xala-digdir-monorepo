/**
 * Login Page - SaaS Admin App
 *
 * Uses reusable login components from @xala/ds.
 * SaaS Admin supports multiple login methods:
 * - ID-porten for external platform administrators
 * - Internal SSO for Digilist employees
 * - Dev login providers for testing different roles
 */
import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  LoginLayout,
  LoginOption,
  IdPortenIcon,
  MicrosoftIcon,
  ShieldCheckIcon,
  BuildingIcon,
  SettingsIcon,
} from '@xala/ds';
import { useT } from '@xala/i18n';
import { useAuth } from '../hooks/useAuth';

export function LoginPage(): React.ReactElement {
  const t = useT();
  const { isAuthenticated, isLoading, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Get the intended destination from location state
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname;

  // Handle post-login redirect
  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated) return;

    // Redirect to intended destination or dashboard
    const destination = from ?? '/';
    navigate(destination, { replace: true });
  }, [isAuthenticated, isLoading, navigate, from]);

  // Show nothing while loading auth state
  if (isLoading) {
    return <></>;
  }

  // Already authenticated, will redirect in useEffect
  if (isAuthenticated) {
    return <></>;
  }

  const features = [
    {
      icon: <BuildingIcon size={20} />,
      title: t('saasAdmin.login.feature.tenantAdmin.title'),
      description: t('saasAdmin.login.feature.tenantAdmin.description'),
    },
    {
      icon: <SettingsIcon size={20} />,
      title: t('saasAdmin.login.feature.platformConfig.title'),
      description: t('saasAdmin.login.feature.platformConfig.description'),
    },
    {
      icon: <ShieldCheckIcon size={20} />,
      title: t('saasAdmin.login.feature.security.title'),
      description: t('saasAdmin.login.feature.security.description'),
    },
  ];

  const integrations = [
    t('saasAdmin.login.integration.multiTenant'),
    t('saasAdmin.login.integration.rbac'),
    t('saasAdmin.login.integration.auditTrail'),
    t('saasAdmin.login.integration.iso27001'),
  ];

  const footerLinks = [
    { href: 'https://digilist.no/personvern', label: t('saasAdmin.login.footer.privacy') },
    { href: 'https://digilist.no/vilkar', label: t('saasAdmin.login.footer.terms') },
    { href: 'https://digilist.no/support', label: t('saasAdmin.login.footer.support') },
  ];

  return (
    <LoginLayout
      brandName={t('saasAdmin.login.brandName')}
      brandTagline={t('saasAdmin.login.brandTagline')}
      title={t('saasAdmin.login.title')}
      subtitle={t('saasAdmin.login.subtitle')}
      panelTitle={t('saasAdmin.login.panelTitle')}
      panelSubtitle={t('saasAdmin.login.panelSubtitle')}
      panelDescription={t('saasAdmin.login.panelDescription')}
      features={features}
      integrations={integrations}
      footerLinks={footerLinks}
      copyright={t('saasAdmin.login.copyright', { year: new Date().getFullYear().toString() })}
    >
      <LoginOption
        icon={<IdPortenIcon />}
        title={t('saasAdmin.login.option.idporten.title')}
        description={t('saasAdmin.login.option.idporten.description')}
        onClick={() => login('idporten')}
      />
      <LoginOption
        icon={<MicrosoftIcon />}
        title={t('saasAdmin.login.option.internal.title')}
        description={t('saasAdmin.login.option.internal.description')}
        onClick={() => login('internal')}
      />
    </LoginLayout>
  );
}
