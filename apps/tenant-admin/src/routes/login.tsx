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
  KeyIcon,
  DemoLoginDialog,
} from '@xala/ds';
import { useT } from '@xala/i18n';
import { useAuth } from '@xala/auth';
import { useDemoLogin } from '../hooks/useDemoLogin';

export function LoginPage(): React.ReactElement {
  const { isAuthenticated, isLoading, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const t = useT();

  // Demo login hook
  const { showDialog, openDemoLogin, closeDemoLogin, handleDemoLogin } = useDemoLogin();

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
      <LoginOption
        icon={<KeyIcon />}
        title={t('auth.demoLogin')}
        description={t('auth.demoLoginDescription')}
        onClick={openDemoLogin}
      />

      <DemoLoginDialog
        open={showDialog}
        onClose={closeDemoLogin}
        onSubmit={handleDemoLogin}
        title={t('auth.demoForm.title')}
        description={t('auth.demoForm.description')}
        cancelText={t('common.cancel')}
        submitText={t('auth.login')}
        loadingText={t('common.loading')}
        validationMessages={{
          nameRequired: t('auth.demoForm.nameRequired'),
          emailRequired: t('auth.demoForm.emailRequired'),
          tokenRequired: t('auth.demoForm.tokenRequired'),
          invalidEmail: t('auth.demoForm.invalidEmail'),
        }}
        labels={{
          name: t('auth.demoForm.name'),
          email: t('auth.demoForm.email'),
          token: t('auth.demoForm.token'),
        }}
        placeholders={{
          name: t('auth.demoForm.namePlaceholder'),
          email: t('auth.demoForm.emailPlaceholder'),
          token: t('auth.demoForm.tokenPlaceholder'),
        }}
      />
    </LoginLayout>
  );
}
