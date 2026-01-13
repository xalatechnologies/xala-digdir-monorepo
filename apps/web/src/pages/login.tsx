/**
 * Login Page - Web App
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
  VippsIcon,
  PlatformIcon,
  AutomationIcon,
  ShieldCheckIcon,
} from '@xala/ds';
import { useAuth } from '../hooks/useAuth';

export function LoginPage(): React.ReactElement {
  const { isAuthenticated, isLoading, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

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
      icon: <PlatformIcon size={20} />,
      title: 'Komplett plattform',
      description: 'Booking, betaling, kalender og rapportering i én løsning',
    },
    {
      icon: <AutomationIcon size={20} />,
      title: 'Automatisering',
      description: 'Regelbasert godkjenning reduserer manuelt arbeid',
    },
    {
      icon: <ShieldCheckIcon size={20} />,
      title: 'GDPR-klar & Sikker',
      description: 'Full etterlevelse av personvernregler og norske standarder',
    },
  ];

  const integrations = ['BankID', 'Vipps', 'Visma', 'RCO', 'ISO 27001', 'ISO 27701'];

  const footerLinks = [
    { href: 'https://digilist.no/personvern', label: 'Personvern' },
    { href: 'https://digilist.no/cookies', label: 'Vilkår for bruk' },
    { href: 'https://digilist.no/#book-demo', label: 'Kontakt support' },
  ];

  return (
    <LoginLayout
      brandName="DIGILIST"
      brandTagline="ENKEL BOOKING"
      logoHref="/"
      title="Logg inn"
      subtitle="Velg innloggingsmetode for å fortsette."
      panelTitle="Booking"
      panelSubtitle="En helhetlig bookingløsning"
      panelDescription="Skybasert plattform for booking av kommunale anlegg og ressurser med moderne design, betaling og rapportering."
      features={features}
      integrations={integrations}
      footerLinks={footerLinks}
      copyright="© 2026 Digilist. Alle rettigheter reservert."
    >
      <LoginOption
        icon={<VippsIcon />}
        title="Vipps"
        description="Rask og enkel innlogging med Vipps"
        onClick={() => login('vipps')}
      />
      <LoginOption
        icon={<IdPortenIcon />}
        title="ID-porten"
        description="Personlig innlogging med BankID"
        onClick={() => login('idporten')}
      />
      <LoginOption
        icon={<MicrosoftIcon />}
        title="Microsoft"
        description="For ansatte med organisasjonskonto"
        onClick={() => login('microsoft')}
      />
    </LoginLayout>
  );
}
