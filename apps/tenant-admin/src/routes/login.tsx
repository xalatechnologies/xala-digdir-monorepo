/**
 * Login Page - Tenant Admin App
 *
 * Uses reusable login components from @xala/ds.
 * After successful login, redirects to the tenant dashboard.
 */
import { useEffect, useState } from 'react';
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
  Dialog,
  Textfield,
  Button,
} from '@xala/ds';
import { useT } from '@xala/i18n';
import { useAuth } from '../hooks/useAuth';
import { authService } from '@digilist/client-sdk';

export function LoginPage(): React.ReactElement {
  const { isAuthenticated, isLoading, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const t = useT();

  // Demo login form state
  const [showDemoDialog, setShowDemoDialog] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [demoForm, setDemoForm] = useState({
    name: '',
    email: '',
    token: '',
  });

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

  /**
   * Open demo login form dialog
   */
  const handleDemoLogin = () => {
    setShowDemoDialog(true);
    setLoginError(null);
    setDemoForm({ name: '', email: '', token: '' });
  };

  /**
   * Handle demo form submission
   */
  const handleDemoFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate all fields
    if (!demoForm.name.trim() || !demoForm.email.trim() || !demoForm.token.trim()) {
      setLoginError(t('auth.demoForm.allFieldsRequired'));
      return;
    }

    setIsLoggingIn(true);
    setLoginError(null);

    try {
      // Call the auth service to validate the demo token
      const response = await authService.loginWithDemoToken(demoForm.token.trim());

      if (response.data?.user) {
        // Token is valid - store user session
        localStorage.setItem('tenant_admin_user', JSON.stringify(response.data.user));

        // Close dialog
        setShowDemoDialog(false);

        // Redirect to home
        navigate('/', { replace: true });
        // Reload to pick up the new auth state
        window.location.reload();
      } else {
        setLoginError(t('auth.invalidToken'));
      }
    } catch (error) {
      console.error('[DEMO LOGIN] Token validation failed:', error);
      setLoginError(t('auth.loginFailed'));
    } finally {
      setIsLoggingIn(false);
    }
  };

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
        onClick={handleDemoLogin}
      />

      <Dialog
        open={showDemoDialog}
        onClose={() => setShowDemoDialog(false)}
        title={t('auth.demoForm.title')}
        description={t('auth.demoForm.description')}
      >
        <form onSubmit={handleDemoFormSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {loginError && (
            <div
              style={{
                padding: '12px',
                backgroundColor: '#fef2f2',
                border: '1px solid #fecaca',
                borderRadius: '8px',
                color: '#991b1b',
                fontSize: '14px',
              }}
            >
              {loginError}
            </div>
          )}

          <Textfield
            label={t('auth.demoForm.name')}
            value={demoForm.name}
            onChange={(e) => setDemoForm({ ...demoForm, name: e.target.value })}
            placeholder={t('auth.demoForm.namePlaceholder')}
            disabled={isLoggingIn}
            required
          />

          <Textfield
            label={t('auth.demoForm.email')}
            type="email"
            value={demoForm.email}
            onChange={(e) => setDemoForm({ ...demoForm, email: e.target.value })}
            placeholder={t('auth.demoForm.emailPlaceholder')}
            disabled={isLoggingIn}
            required
          />

          <Textfield
            label={t('auth.demoForm.token')}
            value={demoForm.token}
            onChange={(e) => setDemoForm({ ...demoForm, token: e.target.value })}
            placeholder={t('auth.demoForm.tokenPlaceholder')}
            disabled={isLoggingIn}
            required
          />

          <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '8px' }}>
            <Button
              type="button"
              variant="secondary"
              onClick={() => setShowDemoDialog(false)}
              disabled={isLoggingIn}
            >
              {t('common.cancel')}
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={isLoggingIn}
            >
              {isLoggingIn ? t('common.loading') : t('auth.login')}
            </Button>
          </div>
        </form>
      </Dialog>
    </LoginLayout>
  );
}
