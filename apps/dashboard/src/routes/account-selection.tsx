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
} from '@xalatechnologies/platform/ui';
import { useT } from '@xalatechnologies/platform/i18n';
import { useAuth } from '@xalatechnologies/platform/auth';
import { useAccountContext } from '@digilist/runtime';
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

  // Redirect away only if user chose to remember their choice
  useEffect(() => {
    if (rememberChoice && hasSelectedAccount) {
      // User chose "remember my choice" - skip selection and go to dashboard
      const destination = from ?? (accountType === 'organization' ? '/org' : '/');
      navigate(destination, { replace: true });
    }
  }, [rememberChoice, hasSelectedAccount, accountType, navigate, from]);

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
      brandTagline={t('common.enkel_booking')}
      title={t('minside.accountSelection.page.title') || 'Velg konto'}
      subtitle={t('minside.accountSelection.page.description') || 'Hvordan vil du bruke tjenesten?'}
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
