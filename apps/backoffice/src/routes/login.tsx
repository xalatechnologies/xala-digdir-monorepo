/**
 * Login Page - Backoffice App
 *
 * Uses reusable login components from @xala/ds
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

export function LoginPage(): React.ReactElement {
  const { isAuthenticated, isLoading, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const t = useT();

  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/';

  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, isLoading, navigate, from]);

  if (isLoading) {
    return <></>;
  }

  const features = [
    {
      icon: <PlatformIcon />,
      title: t('auth.completePlatform'),
      description: t('auth.completePlatformDesc'),
    },
    {
      icon: <AutomationIcon />,
      title: t('auth.automation'),
      description: t('auth.automationDesc'),
    },
    {
      icon: <ShieldCheckIcon />,
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
