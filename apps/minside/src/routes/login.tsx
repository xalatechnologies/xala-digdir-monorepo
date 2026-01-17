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
  DemoLoginDialog,
  Button,
} from '@xala/ds';
import { useT } from '@xala/i18n';
import { useAuth } from '@xala/auth';
import { useDemoLogin } from '../hooks/useDemoLogin';
import { idportenService } from '@digilist/client-sdk';
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

  // Demo login hook
  const { showDialog, openDemoLogin, closeDemoLogin, handleDemoLogin } = useDemoLogin();

  // Test login state
  const [showTestLogin, setShowTestLogin] = useState(false);
  const [testNationalId, setTestNationalId] = useState('');
  const [isTestLoginLoading, setIsTestLoginLoading] = useState(false);

  // Get fallback return path from location state (set by ProtectedRoute or direct navigation)
  // Default to dashboard - user context will be loaded from database automatically
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/';

  /**
   * Handle test login with national ID
   */
  const handleTestLogin = useCallback(async () => {
    if (!testNationalId || testNationalId.length !== 11) {
      alert('Please enter a valid 11-digit Norwegian national ID');
      return;
    }

    setIsTestLoginLoading(true);
    try {
      const { authService } = await import('@digilist/client-sdk');
      await authService.loginWithNationalId(testNationalId);
      // Reload page to trigger session detection
      window.location.href = from;
    } catch (error) {
      console.error('Test login failed:', error);
      alert('Login failed. Please check the national ID and try again.');
      setIsTestLoginLoading(false);
    }
  }, [testNationalId, from]);

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
        onClick={openDemoLogin}
      />

      <LoginOption
        icon={<ShieldCheckIcon />}
        title="Test Login (National ID)"
        description="BankID/Vipps test login (11-digit national ID)"
        onClick={() => setShowTestLogin(true)}
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

      {showTestLogin && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
          }}
          onClick={() => !isTestLoginLoading && setShowTestLogin(false)}
        >
          <div
            style={{
              background: 'white',
              padding: '32px',
              borderRadius: '8px',
              maxWidth: '400px',
              width: '90%',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 style={{ marginTop: 0, marginBottom: '16px' }}>Test Login</h2>
            <p style={{ marginBottom: '16px' }}>
              Enter a Norwegian national ID (11 digits) to test BankID/Vipps authentication.
            </p>
            <p style={{ marginBottom: '16px', fontSize: '14px', color: '#666' }}>
              Example test IDs:
              <br />
              • 15860771346 (BankID Bruker)
              <br />
              • 24014005907 (Vipps Bruker)
              <br />• 30916326773 (BankID Admin)
            </p>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>National ID</label>
              <input
                type="text"
                value={testNationalId}
                onChange={(e) => setTestNationalId(e.target.value)}
                placeholder="11 digits"
                maxLength={11}
                disabled={isTestLoginLoading}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #ccc',
                  borderRadius: '4px',
                  fontSize: '16px',
                }}
              />
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <Button
                onClick={handleTestLogin}
                disabled={isTestLoginLoading || !testNationalId}
                style={{ flex: 1 }}
              >
                {isTestLoginLoading ? 'Logging in...' : 'Login'}
              </Button>
              <Button onClick={() => setShowTestLogin(false)} disabled={isTestLoginLoading}>
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </LoginLayout>
  );
}
