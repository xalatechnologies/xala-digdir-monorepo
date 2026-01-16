/**
 * Login Page - Backoffice App
 *
 * Uses reusable login components from @xala/ds.
 * Supports session-safe return-to-flow authentication with flow context preservation.
 * After successful login, handles role detection:
 * - Single-role users: auto-redirect to appropriate home
 * - Dual-role users: redirect to role selection page
 */
import { useEffect, useCallback, useRef, useState } from 'react';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import {
  LoginLayout,
  LoginOption,
  IdPortenIcon,
  MicrosoftIcon,
  PlatformIcon,
  AutomationIcon,
  ShieldCheckIcon,
  KeyIcon,
  Dialog,
  Textfield,
  Button,
  Alert,
  Stack,
} from '@xala/ds';
import { useT } from '@xala/i18n';
import { useAuth } from '../hooks/useAuth';
import { useBackofficeRole, useNeedsRoleSelection } from '../hooks/useBackofficeRole';
import type { FlowContext } from '@digilist/client-sdk';
import { idportenService, authService } from '@digilist/client-sdk';


/**
 * Navigation state passed when redirecting with flow context
 */
export interface FlowContextNavigationState {
  /** The restored flow context containing booking state */
  flowContext: FlowContext;
  /** Whether this navigation is from a flow restoration */
  isFlowRestoration: boolean;
}

/**
 * Navigation state passed when flow context was expired
 */
export interface FlowContextExpiredState {
  /** Indicates the booking session expired */
  flowContextExpired: true;
}

export function LoginPage(): React.ReactElement {
  const { isAuthenticated, isLoading: authLoading, restoreFlowContext, hasStoredContext, accessDeniedError } = useAuth();
  const { isInitializing, getHomeRoute } = useBackofficeRole();
  const needsRoleSelection = useNeedsRoleSelection();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const t = useT();

  // Track if we've already processed flow restoration to prevent double navigation
  const flowRestorationProcessed = useRef(false);

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

  // Check for auth callback params (returned from ID-porten/BankID)
  const authSuccess = searchParams.get('auth_success') === 'true';
  const authError = searchParams.get('auth_error');

  // Get the intended destination from location state (set by ProtectedRoute or direct navigation)
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname;

  // Handle auth callback - redirect to root after successful authentication
  useEffect(() => {
    if (authSuccess && !authError) {
      // Clear the URL params and redirect to root (/) which is the dashboard index route
      // Don't use getHomeRoute() as it may return /role-selection
      // The root's ProtectedRoute will handle role-selection if needed
      navigate('/', { replace: true });
    }
  }, [authSuccess, authError, navigate]);

  /**
   * Handle navigation after authentication
   * Prioritizes stored flow context over simple location state
   */
  const handlePostAuthNavigation = useCallback(() => {
    // Prevent double processing
    if (flowRestorationProcessed.current) {
      return;
    }

    // Dual-role user: redirect to role selection, preserving intended destination
    if (needsRoleSelection) {
      flowRestorationProcessed.current = true;
      navigate('/role-selection', {
        replace: true,
        state: from ? { from: { pathname: from } } : undefined,
      });
      return;
    }

    // Check for stored flow context first (higher priority than location state)
    if (hasStoredContext) {
      const result = restoreFlowContext(true); // Clear after load

      if (result.hasContext && result.flowContext) {
        flowRestorationProcessed.current = true;

        // Navigate to the returnTo URL with complete flow context
        const navigationState: FlowContextNavigationState = {
          flowContext: result.flowContext,
          isFlowRestoration: true,
        };

        navigate(result.flowContext.returnTo, {
          replace: true,
          state: navigationState,
        });
        return;
      }

      // Handle expired flow context
      if (result.wasExpired) {
        flowRestorationProcessed.current = true;
        // Navigate to home with notification that session expired
        // The target page can show a toast about expired booking session
        const expiredState: FlowContextExpiredState = {
          flowContextExpired: true,
        };
        navigate(getHomeRoute(), {
          replace: true,
          state: expiredState,
        });
        return;
      }

      // Handle invalid/corrupted flow context - gracefully fall back
      if (result.wasInvalid) {
        flowRestorationProcessed.current = true;
        navigate(from ?? getHomeRoute(), { replace: true });
        return;
      }
    }

    // No flow context - use simple location state fallback or role-appropriate home
    flowRestorationProcessed.current = true;
    const destination = from ?? getHomeRoute();
    navigate(destination, { replace: true });
  }, [hasStoredContext, restoreFlowContext, navigate, from, needsRoleSelection, getHomeRoute]);

  // Handle post-login redirect based on role state
  useEffect(() => {
    // Wait for auth to complete first
    if (authLoading) return;
    if (!isAuthenticated) return;

    // For authenticated users, wait for role initialization
    if (isInitializing) return;

    handlePostAuthNavigation();
  }, [isAuthenticated, authLoading, isInitializing, handlePostAuthNavigation]);

  // Show nothing while loading auth state
  // Only check role initialization if authenticated
  if (authLoading) {
    return <></>;
  }

  // If authenticated, wait for role initialization before redirecting
  if (isAuthenticated && isInitializing) {
    return <></>;
  }

  const features = [
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
  ];

  const integrations = ['BankID', 'Vipps', 'Visma', 'RCO', 'ISO 27001', 'ISO 27701'];

  const footerLinks = [
    { href: 'https://digilist.no/personvern', label: t('auth.privacy') },
    { href: 'https://digilist.no/cookies', label: t('auth.terms') },
    { href: 'https://digilist.no/#book-demo', label: t('auth.contactSupport') },
  ];

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
        localStorage.setItem('backoffice_mock_user', JSON.stringify(response.data.user));

        // Close dialog
        setShowDemoDialog(false);

        // Determine redirect based on user role
        const user = response.data.user;
        let redirectPath = '/';

        // Role-based routing for backoffice
        if (user.role === 'super_admin' || user.role === 'admin') {
          redirectPath = '/dashboard';
        } else if (user.role === 'tenant_admin') {
          redirectPath = '/rental-objects';
        } else {
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

  return (
    <LoginLayout
      brandName={t('brand.name')}
      brandTagline={t('brand.tagline')}
      title={t('auth.login')}
      subtitle={t('auth.selectMethod')}
      panelTitle={t('auth.backoffice')}
      panelSubtitle={t('auth.holisticSolution')}
      panelDescription={t('auth.platformDesc')}
      features={features}
      integrations={integrations}
      footerLinks={footerLinks}
      copyright={t('auth.copyright')}
    >
      {accessDeniedError && (
        <Alert variant="error" style={{ marginBottom: 24 }}>
          <div style={{ fontWeight: 600, marginBottom: 4 }}>
            {t('auth.noAccess')}
          </div>
          <div>
            {accessDeniedError}
          </div>
        </Alert>
      )}
      <LoginOption
        icon={<IdPortenIcon />}
        title={t('auth.idporten')}
        description={t('auth.idportenDesc')}
        onClick={() => {
          // Pass root URL (/) as returnTo - this is the dashboard index route
          // The login page will detect auth_success and redirect to /
          // ProtectedRoute will handle role selection if needed
          const returnTo = `${window.location.origin}/`;
          idportenService.authorize(returnTo);
        }}
      />
      <LoginOption
        icon={<MicrosoftIcon />}
        title={t('auth.microsoft')}
        description={t('auth.microsoftComingSoon')}
        disabled
        onClick={() => {
          // Microsoft login temporarily disabled
          console.warn('Microsoft login is temporarily disabled');
        }}
      />
      <LoginOption
        icon={<KeyIcon />}
        title={t('auth.adminDemo')}
        description={t('auth.adminDemoDescription')}
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
                marginTop: 8,
                paddingTop: 16,
                borderTop: '1px solid #e5e7eb'
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
