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
  Card,
  Heading,
  Paragraph,
  Button,
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

  // Demo account selector state
  const [showDemoDialog, setShowDemoDialog] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  // Demo accounts configuration
  const demoAccounts = [
    {
      token: 'admin-demo-2026',
      name: t('auth.demoAccount.adminName'),
      email: t('auth.demoAccount.adminEmail'),
      role: t('auth.demoAccount.adminRole'),
      description: t('auth.demoAccount.adminDesc'),
    },
    {
      token: 'user-demo-2026',
      name: t('auth.demoAccount.userName'),
      email: t('auth.demoAccount.userEmail'),
      role: t('auth.demoAccount.userRole'),
      description: t('auth.demoAccount.userDesc'),
    },
    {
      token: 'org-demo-2026',
      name: t('auth.demoAccount.orgName'),
      email: t('auth.demoAccount.orgEmail'),
      role: t('auth.demoAccount.orgRole'),
      description: t('auth.demoAccount.orgDesc'),
    },
  ];

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
   * Open demo account selector dialog
   */
  const handleDemoLogin = () => {
    setShowDemoDialog(true);
    setLoginError(null);
  };

  /**
   * Handle demo account selection and login
   */
  const handleSelectDemoAccount = async (token: string) => {
    setIsLoggingIn(true);
    setLoginError(null);

    try {
      // Call the auth service to validate the demo token
      const response = await authService.loginWithDemoToken(token);

      if (response.data?.user) {
        // Token is valid - store user session
        localStorage.setItem('backoffice_mock_user', JSON.stringify(response.data.user));

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
        <div
          style={{
            padding: '16px',
            marginBottom: '24px',
            backgroundColor: '#fef2f2',
            border: '1px solid #fecaca',
            borderRadius: '8px',
            color: '#991b1b',
          }}
        >
          <div style={{ fontWeight: 600, marginBottom: '4px' }}>
            {t('auth.noAccess')}
          </div>
          <div style={{ fontSize: '14px' }}>
            {accessDeniedError}
          </div>
        </div>
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
        onClose={() => setShowDemoDialog(false)}
        title={t('auth.demoAccount.selectTitle')}
        description={t('auth.demoAccount.selectDescription')}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
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

          {demoAccounts.map((account) => (
            <Card
              key={account.token}
              style={{
                padding: '16px',
                cursor: isLoggingIn ? 'not-allowed' : 'pointer',
                opacity: isLoggingIn ? 0.6 : 1,
                border: '1px solid #e5e7eb',
                transition: 'all 0.2s',
              }}
              onClick={() => !isLoggingIn && handleSelectDemoAccount(account.token)}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <Heading level={3} size="xs" style={{ margin: 0 }}>
                  {account.name}
                </Heading>
                <Paragraph size="sm" style={{ margin: 0, color: '#6b7280' }}>
                  {account.email}
                </Paragraph>
                <div
                  style={{
                    padding: '4px 8px',
                    backgroundColor: '#eff6ff',
                    borderRadius: '4px',
                    fontSize: '12px',
                    fontWeight: 600,
                    color: '#1e40af',
                    width: 'fit-content',
                  }}
                >
                  {account.role}
                </div>
                <Paragraph size="sm" style={{ margin: 0, color: '#6b7280' }}>
                  {account.description}
                </Paragraph>
              </div>
            </Card>
          ))}

          <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '8px' }}>
            <Button
              variant="secondary"
              onClick={() => setShowDemoDialog(false)}
              disabled={isLoggingIn}
            >
              {t('common.cancel')}
            </Button>
          </div>
        </div>
      </Dialog>
    </LoginLayout>
  );
}
