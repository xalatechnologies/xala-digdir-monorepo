/**
 * Account Selection Page - Minside App
 *
 * Displays account selection for users after authentication.
 * Uses LoginLayout for consistent styling with the login page.
 */
import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  LoginLayout,
  PlatformIcon,
  ShieldCheckIcon,
  AutomationIcon,
} from '@xala/ds';
import { useT } from '@xala/i18n';
import { useAuth } from '../hooks/useAuth';
import { useAccountContext } from '../providers/AccountContextProvider';
import { AccountSelector, type AccountSelectionType } from '../components/AccountSelector';

export function AccountSelectionPage(): React.ReactElement {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const {
    hasSelectedAccount,
    rememberChoice,
    accountType,
  } = useAccountContext();
  const navigate = useNavigate();
  const location = useLocation();
  const t = useT();

  // Get the intended destination if any
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname;

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/login', { replace: true });
    }
  }, [authLoading, isAuthenticated, navigate]);

  // Redirect away if account is already selected and remembered
  useEffect(() => {
    if (hasSelectedAccount && rememberChoice) {
      // Navigate to the appropriate dashboard based on account type
      const destination = from ?? (accountType === 'organization' ? '/org' : '/');
      navigate(destination, { replace: true });
    }
  }, [hasSelectedAccount, rememberChoice, accountType, navigate, from]);

  // Show nothing while loading auth
  if (authLoading) {
    return <></>;
  }

  // Handle account selection - navigate to appropriate dashboard
  const handleAccountSelect = (type: AccountSelectionType): void => {
    const destination = from ?? (type === 'organization' ? '/org' : '/');
    navigate(destination, { replace: true });
  };

  const features = [
    {
      icon: <PlatformIcon size={20} />,
      title: t('auth.completePlatform') || 'Komplett plattform',
      description: t('auth.completePlatformDesc') || 'Alt du trenger for booking og administrasjon',
    },
    {
      icon: <AutomationIcon size={20} />,
      title: t('minside.accountSelection.flexibleSwitch') || 'Fleksibel bytte',
      description: t('minside.accountSelection.flexibleSwitchDesc') || 'Bytt mellom personlig og organisasjon når som helst',
    },
    {
      icon: <ShieldCheckIcon size={20} />,
      title: t('auth.gdprSecure') || 'GDPR-sikker',
      description: t('auth.gdprSecureDesc') || 'Dine data er trygge hos oss',
    },
  ];

  const footerLinks = [
    { href: 'https://digilist.no/personvern', label: t('auth.privacy') || 'Personvern' },
    { href: 'https://digilist.no/cookies', label: t('auth.terms') || 'Vilkår' },
    { href: 'https://digilist.no/#book-demo', label: t('auth.contactSupport') || 'Kontakt oss' },
  ];

  return (
    <LoginLayout
      brandName="DIGILIST"
      brandTagline="ENKEL BOOKING"
      title={t('minside.accountSelection.title') || 'Velg konto'}
      subtitle={t('minside.accountSelection.subtitle') || 'Hvordan vil du bruke tjenesten?'}
      panelTitle="MIN SIDE"
      panelSubtitle={t('minside.accountSelection.panelTitle') || 'Personlig eller organisasjon'}
      panelDescription={t(
        'minside.accountSelection.panelDescription'
      ) || 'Du kan bruke tjenesten som privatperson eller på vegne av en organisasjon. Velg hvordan du vil fortsette.'}
      features={features}
      footerLinks={footerLinks}
      copyright={t('auth.copyright') || '© 2024 Digilist AS'}
    >
      <AccountSelector onAccountSelect={handleAccountSelect} />
    </LoginLayout>
  );
}

export default AccountSelectionPage;
