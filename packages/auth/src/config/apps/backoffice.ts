/**
 * Backoffice App Authentication Configuration
 * Administrative interface for case handlers and admins
 */

import type { AppAuthConfig } from '../types';
import { idportenProvider, vippsProvider, microsoftProvider, demoProvider } from '../providers';

export const backofficeAuthConfig: AppAuthConfig = {
  app: 'backoffice',
  
  providers: [
    { ...vippsProvider, enabled: false },
    idportenProvider,
    { ...microsoftProvider, enabled: false },
    demoProvider,
  ],
  
  redirectAfterLogin: '/',
  
  // Only admins and case handlers
  allowedRoles: ['admin', 'saksbehandler', 'super_admin', 'case_handler'],
  
  features: {
    flowContextPreservation: true,
    roleSelection: true, // Dual-role users can switch
    orgContextSwitch: false,
    rememberMe: true,
  },
  
  branding: {
    name: 'DIGILIST',
    tagline: 'BACKOFFICE',
    logoHref: '/',
  },
  
  panel: {
    title: 'Backoffice',
    subtitle: 'Administrasjonspanel',
    description: 'Administrer bookinger, brukere og innstillinger for din organisasjon.',
    features: [
      {
        title: 'Bookingadministrasjon',
        description: 'Håndter alle bookinger og forespørsler',
      },
      {
        title: 'Brukeradministrasjon',
        description: 'Administrer brukere og tilganger',
      },
      {
        title: 'Rapporter og statistikk',
        description: 'Detaljerte rapporter og analyser',
      },
    ],
    integrations: ['BankID', 'Microsoft 365', 'Azure AD'],
  },
  
  footerLinks: [
    { href: '/dokumentasjon', label: 'Dokumentasjon' },
    { href: '/support', label: 'Support' },
    { href: '/api-docs', label: 'API' },
  ],
};
