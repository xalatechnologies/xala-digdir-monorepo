/**
 * Login Page - SaaS Admin App
 *
 * Uses reusable login components from @xala/ds.
 * SaaS Admin supports multiple login methods:
 * - ID-porten for external platform administrators
 * - Internal SSO for Digilist employees
 * - Dev login providers for testing different roles
 */
import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  LoginLayout,
  LoginOption,
  IdPortenIcon,
  MicrosoftIcon,
  ShieldCheckIcon,
  BuildingIcon,
  SettingsIcon,
} from '@xala/ds';
import { useAuth } from '../hooks/useAuth';

export function LoginPage(): React.ReactElement {
  const { isAuthenticated, isLoading, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

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
    </LoginLayout>
  );
}
