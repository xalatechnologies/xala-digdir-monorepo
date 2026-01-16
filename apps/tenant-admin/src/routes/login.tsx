/**
 * Login Page - Tenant Admin App
 *
 * Uses reusable login components from @xala/ds.
 * After successful login, redirects to the tenant dashboard.
 */
import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  LoginLayout,
  LoginOption,
  IdPortenIcon,
  MicrosoftIcon,
  PlatformIcon,
  ShieldCheckIcon,
  SettingsIcon,
} from '@xala/ds';
import { useT } from '@xala/i18n';
import { useAuth } from '../hooks/useAuth';

export function LoginPage(): React.ReactElement {
  const { isAuthenticated, isLoading, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const t = useT();

  // Get the intended destination from location state
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname ?? '/';

  // Handle post-login redirect
  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated) return;

    // Redirect to intended destination or dashboard
    navigate(from, { replace: true });
  }, [isAuthenticated, isLoading, navigate, from]);

  // Show nothing while loading auth state
  if (isLoading) {
    return <></>;
  }

  const features = [
    {
      icon: <PlatformIcon size={20} />,
      title: t('tenantAdmin.featureBranding'),
      description: t('tenantAdmin.featureBrandingDesc'),
    },
    {
      icon: <SettingsIcon size={20} />,
      title: t('tenantAdmin.featureSettings'),
      description: t('tenantAdmin.featureSettingsDesc'),
    },
    {
      icon: <ShieldCheckIcon size={20} />,
      title: t('tenantAdmin.featureAudit'),
      description: t('tenantAdmin.featureAuditDesc'),
    },
  ];

  const integrations = ['BankID', 'Vipps', 'Azure AD', 'ISO 27001'];

  const footerLinks = [
    { href: 'https://digilist.no/personvern', label: t('auth.privacy') },
    { href: 'https://digilist.no/cookies', label: t('auth.terms') },
    { href: 'https://digilist.no/#book-demo', label: t('auth.contactSupport') },
  ];

  return (
    <LoginLayout
      brandName="DIGILIST"
      brandTagline="TENANT ADMIN"
      title={t('auth.login')}
      subtitle={t('auth.selectMethod')}
      panelTitle={t('tenantAdmin.panelTitle')}
      panelSubtitle={t('tenantAdmin.panelSubtitle')}
      panelDescription={t('tenantAdmin.panelDescription')}
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
    </LoginLayout>
  );
}
