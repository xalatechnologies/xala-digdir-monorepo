/**
 * Login Page - Backoffice App
 *
 * Uses reusable login components from @xala/ds.
 * After successful login, handles role detection:
 * - Single-role users: auto-redirect to appropriate home
 * - Dual-role users: redirect to role selection page
 */
import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  LoginLayout,
  LoginOption,
  IdPortenIcon,
  MicrosoftIcon,
  PlatformIcon,
  AutomationIcon,
  ShieldCheckIcon,
} from '@xala/ds';
import { useT } from '@xala/i18n';
import { useAuth } from '../hooks/useAuth';
import { useBackofficeRole, useNeedsRoleSelection } from '../hooks/useBackofficeRole';

export function LoginPage(): React.ReactElement {
  const { isAuthenticated, isLoading: authLoading, login } = useAuth();
  const { isInitializing, getHomeRoute } = useBackofficeRole();
  const needsRoleSelection = useNeedsRoleSelection();
  const navigate = useNavigate();
  const location = useLocation();
  const t = useT();

  // Get the intended destination from location state
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname;

  // Handle post-login redirect based on role state
  useEffect(() => {
    // Wait for both auth and role initialization to complete
    if (authLoading || isInitializing) return;
    if (!isAuthenticated) return;

    // Dual-role user: redirect to role selection, preserving intended destination
    if (needsRoleSelection) {
      navigate('/role-selection', {
        replace: true,
        state: from ? { from: { pathname: from } } : undefined,
      });
      return;
    }

    // Single-role user or already selected: redirect to intended destination or role-appropriate home
    const destination = from ?? getHomeRoute();
    navigate(destination, { replace: true });
  }, [isAuthenticated, authLoading, isInitializing, needsRoleSelection, navigate, from, getHomeRoute]);

  // Show nothing while loading auth or role state
  if (authLoading || isInitializing) {
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
      brandName="DIGILIST"
      brandTagline="ENKEL BOOKING"
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
