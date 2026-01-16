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
  Alert,
  Stack,
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
  const [fieldErrors, setFieldErrors] = useState({
    name: '',
    email: '',
    token: '',
  });
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
   * Validate individual field
   */
  const validateField = (field: 'name' | 'email' | 'token', value: string) => {
    let error = '';

    if (field === 'email' && value.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        error = t('auth.demoForm.invalidEmail');
      }
    }

    setFieldErrors(prev => ({ ...prev, [field]: error }));
  };

  /**
   * Open demo login form dialog
   */
  const handleDemoLogin = () => {
    setShowDemoDialog(true);
    setLoginError(null);
    setFieldErrors({ name: '', email: '', token: '' });
    setDemoForm({ name: '', email: '', token: '' });
  };

  /**
   * Handle demo form submission
   */
  const handleDemoFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Clear previous errors
    setLoginError(null);
    const errors = { name: '', email: '', token: '' };

    // Validate all fields
    if (!demoForm.name.trim()) {
      errors.name = t('auth.demoForm.nameRequired');
    }

    if (!demoForm.email.trim()) {
      errors.email = t('auth.demoForm.emailRequired');
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(demoForm.email)) {
        errors.email = t('auth.demoForm.invalidEmail');
      }
    }

    if (!demoForm.token.trim()) {
      errors.token = t('auth.demoForm.tokenRequired');
    }

    // Show field errors
    setFieldErrors(errors);

    // Stop if there are validation errors
    if (errors.name || errors.email || errors.token) {
      return;
    }

    setIsLoggingIn(true);

    try {
      // Call the auth service to validate the demo token
      const response = await authService.loginWithDemoToken(demoForm.token.trim());

      if (response.data?.user) {
        // Token is valid - store user session
        localStorage.setItem('tenant_admin_user', JSON.stringify(response.data.user));

        // Close dialog
        setShowDemoDialog(false);

        // Determine redirect based on user role (tenant-admin is for kommune admins)
        const user = response.data.user;
        let redirectPath = '/';

        // For tenant-admin, all users go to dashboard
        if (user.role === 'tenant_admin' || user.role === 'admin') {
          redirectPath = '/';
        }

        // Navigate and reload to pick up auth state
        navigate(redirectPath, { replace: true });
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
        onClose={() => !isLoggingIn && setShowDemoDialog(false)}
        title={t('auth.demoForm.title')}
        description={t('auth.demoForm.description')}
      >
        <form onSubmit={handleDemoFormSubmit}>
          <Stack direction="column" gap={20}>
            {loginError && (
              <Alert variant="error">
                {loginError}
              </Alert>
            )}

            <div>
              <Textfield
                label={t('auth.demoForm.name')}
                value={demoForm.name}
                onChange={(e) => {
                  setDemoForm({ ...demoForm, name: e.target.value });
                  if (fieldErrors.name) setFieldErrors({ ...fieldErrors, name: '' });
                }}
                onBlur={(e) => validateField('name', e.target.value)}
                placeholder={t('auth.demoForm.namePlaceholder')}
                disabled={isLoggingIn}
                required
                error={!!fieldErrors.name}
              />
              {fieldErrors.name && (
                <span style={{ fontSize: '14px', color: '#dc2626', marginTop: '4px', display: 'block' }}>
                  {fieldErrors.name}
                </span>
              )}
            </div>

            <div>
              <Textfield
                label={t('auth.demoForm.email')}
                type="email"
                value={demoForm.email}
                onChange={(e) => {
                  setDemoForm({ ...demoForm, email: e.target.value });
                  if (fieldErrors.email) setFieldErrors({ ...fieldErrors, email: '' });
                }}
                onBlur={(e) => validateField('email', e.target.value)}
                placeholder={t('auth.demoForm.emailPlaceholder')}
                disabled={isLoggingIn}
                required
                error={!!fieldErrors.email}
              />
              {fieldErrors.email && (
                <span style={{ fontSize: '14px', color: '#dc2626', marginTop: '4px', display: 'block' }}>
                  {fieldErrors.email}
                </span>
              )}
            </div>

            <div>
              <Textfield
                label={t('auth.demoForm.token')}
                value={demoForm.token}
                onChange={(e) => {
                  setDemoForm({ ...demoForm, token: e.target.value });
                  if (fieldErrors.token) setFieldErrors({ ...fieldErrors, token: '' });
                }}
                onBlur={(e) => validateField('token', e.target.value)}
                placeholder={t('auth.demoForm.tokenPlaceholder')}
                disabled={isLoggingIn}
                required
                error={!!fieldErrors.token}
              />
              {fieldErrors.token && (
                <span style={{ fontSize: '14px', color: '#dc2626', marginTop: '4px', display: 'block' }}>
                  {fieldErrors.token}
                </span>
              )}
            </div>

            <Stack
              direction="horizontal"
              gap={12}
              justify="end"
              style={{
                marginTop: 'var(--ds-spacing-2)',
                paddingTop: 'var(--ds-spacing-4)',
                borderTop: '1px solid var(--ds-color-neutral-border-subtle)'
              }}
            >
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
                disabled={isLoggingIn || !demoForm.name || !demoForm.email || !demoForm.token}
              >
                {isLoggingIn ? t('common.loading') : t('auth.login')}
              </Button>
            </Stack>
          </Stack>
        </form>
      </Dialog>
    </LoginLayout>
  );
}
