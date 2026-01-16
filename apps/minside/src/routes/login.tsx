/**
 * Login Page - Minside (User Dashboard)
 *
 * Uses reusable login components from @xala/ds
 * Supports session-safe return-to-flow authentication with flow context preservation
 */
import { useEffect, useCallback, useRef, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  LoginLayout,
  LoginOption,
  IdPortenIcon,
  MicrosoftIcon,
  VippsIcon,
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
import { idportenService, authService } from '@digilist/client-sdk';
import type { FlowContext } from '@digilist/client-sdk';

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
  const { isAuthenticated, isLoading, restoreFlowContext, hasStoredContext } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
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

  // Get fallback return path from location state (set by ProtectedRoute or direct navigation)
  // Default to dashboard - user context will be loaded from database automatically
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/';

  /**
   * Handle navigation after authentication
   * Prioritizes stored flow context over simple location state
   */
  const handlePostAuthNavigation = useCallback(() => {
    // Prevent double processing
    if (flowRestorationProcessed.current) {
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
        // Navigate to dashboard with notification that session expired
        const expiredState: FlowContextExpiredState = {
          flowContextExpired: true,
        };
        navigate('/', {
          replace: true,
          state: expiredState,
        });
        return;
      }

      // Handle invalid/corrupted flow context - gracefully fall back
      if (result.wasInvalid) {
        flowRestorationProcessed.current = true;
        navigate(from, { replace: true });
        return;
      }
    }

    // No flow context - use simple location state fallback
    flowRestorationProcessed.current = true;
    navigate(from, { replace: true });
  }, [hasStoredContext, restoreFlowContext, navigate, from]);

  // Navigate after successful authentication
  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      // Add a small delay to ensure all auth state is properly set
      const timer = setTimeout(() => {
        handlePostAuthNavigation();
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, [isAuthenticated, isLoading, handlePostAuthNavigation]);

  if (isLoading) {
    return <></>;
  }

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
        localStorage.setItem('minside_user', JSON.stringify(response.data.user));

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

  return (
    <LoginLayout
      brandName={t('brand.name')}
      brandTagline={t('brand.tagline')}
      logoHref="/"
      title={t('auth.login')}
      subtitle={t('auth.selectMethod')}
      panelTitle={t('minside.dashboard')}
      panelSubtitle={t('auth.holisticSolution')}
      panelDescription={t('auth.platformDesc')}
      features={features}
      integrations={integrations}
      footerLinks={footerLinks}
      copyright={t('auth.copyright')}
    >
      <LoginOption
        icon={<IdPortenIcon />}
        title={t('auth.idporten')}
        description={t('auth.idportenDesc')}
        onClick={() => {
          // Pass current URL for session persistence
          // Backend will auto-redirect to /minside or create user if needed
          const returnTo = window.location.href;
          idportenService.authorize(returnTo);
        }}
      />
      <LoginOption
        icon={<VippsIcon />}
        title={t('auth.vipps')}
        description={t('auth.temporarilyDisabled')}
        disabled
        onClick={() => {
          // Vipps login temporarily disabled
          console.log('Vipps login is temporarily disabled');
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
        title={t('auth.demoLogin')}
        description={t('auth.demoLoginDescription')}
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
