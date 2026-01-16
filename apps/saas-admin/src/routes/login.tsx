/**
 * Login Page - SaaS Admin App
 *
 * Uses reusable login components from @xala/ds.
 * SaaS Admin supports multiple login methods:
 * - ID-porten for external platform administrators
 * - Internal SSO for Digilist employees
 * - Dev login providers for testing different roles
 */
import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  LoginLayout,
  LoginOption,
  IdPortenIcon,
  MicrosoftIcon,
  ShieldCheckIcon,
  BuildingIcon,
  SettingsIcon,
  KeyIcon,
  Dialog,
  Textfield,
  Button,
  Alert,
  Stack,
  Text,
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
        localStorage.setItem('saas_admin_user', JSON.stringify(response.data.user));

        // Close dialog
        setShowDemoDialog(false);

        // Determine redirect based on user role (saas-admin is platform admin)
        const user = response.data.user;
        let redirectPath = '/';

        // For saas-admin, super admins go to tenants dashboard
        if (user.role === 'super_admin') {
          redirectPath = '/tenants';
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
      icon: <BuildingIcon size={20} />,
      title: 'Tenant-administrasjon',
      description: 'Full kontroll over alle kommuner og organisasjoner på plattformen.',
    },
    {
      icon: <SettingsIcon size={20} />,
      title: 'Plattformkonfigurasjon',
      description: 'Administrer planer, fakturering og globale innstillinger.',
    },
    {
      icon: <ShieldCheckIcon size={20} />,
      title: 'Sikkerhet og compliance',
      description: 'Audit-logger, tilgangskontroll og GDPR-verktøy.',
    },
  ];

  const integrations = ['Multi-tenant', 'RBAC', 'Audit Trail', 'ISO 27001'];

  const footerLinks = [
    { href: 'https://digilist.no/personvern', label: 'Personvern' },
    { href: 'https://digilist.no/vilkar', label: 'Vilkår' },
    { href: 'https://digilist.no/support', label: 'Support' },
  ];

  return (
    <LoginLayout
      brandName="DIGILIST"
      brandTagline="SAAS ADMIN"
      title="Plattform-administrasjon"
      subtitle="Velg innloggingsmetode for å fortsette."
      panelTitle="SaaS Admin Portal"
      panelSubtitle="Administrer hele Digilist-plattformen"
      panelDescription="Full tilgang til tenant-administrasjon, plankonfigurasjon, fakturering og plattform-overvåking."
      features={features}
      integrations={integrations}
      footerLinks={footerLinks}
      copyright={`© ${new Date().getFullYear()} Digilist AS. Kun for autorisert personell.`}
    >
      <LoginOption
        icon={<IdPortenIcon />}
        title="ID-porten"
        description="For eksterne plattformadministratorer"
        onClick={() => login('idporten')}
      />
      <LoginOption
        icon={<MicrosoftIcon />}
        title="Intern pålogging"
        description="For Digilist-ansatte med Microsoft-konto"
        onClick={() => login('internal')}
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
                <Text data-size="sm" style={{ color: 'var(--ds-color-danger-text-default)', marginTop: 'var(--ds-spacing-1)' }}>
                  {fieldErrors.name}
                </Text>
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
                <Text data-size="sm" style={{ color: 'var(--ds-color-danger-text-default)', marginTop: 'var(--ds-spacing-1)' }}>
                  {fieldErrors.email}
                </Text>
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
                <Text data-size="sm" style={{ color: 'var(--ds-color-danger-text-default)', marginTop: 'var(--ds-spacing-1)' }}>
                  {fieldErrors.token}
                </Text>
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
