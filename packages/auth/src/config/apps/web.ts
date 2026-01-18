/**
 * Web App Authentication Configuration
 * Public-facing booking website
 */

import type { AppAuthConfig } from '../types';
import { idportenProvider, vippsProvider, demoProvider } from '../providers';

export const webAuthConfig: AppAuthConfig = {
  app: 'web',
  
  providers: [
    idportenProvider,
    { ...vippsProvider, enabled: false }, // Disabled pending integration
    demoProvider,
  ],
  
  redirectAfterLogin: '/',
  
  // All authenticated users allowed
  allowedRoles: undefined,
  
  features: {
    flowContextPreservation: true, // Booking flows
    roleSelection: false,
    orgContextSwitch: false,
    rememberMe: true,
  },
  
  branding: {
    name: 'DIGILIST',
    tagline: 'ENKEL BOOKING',
    logoHref: '/',
  },
  
  panel: {
    title: 'Web',
    subtitle: 'En helhetlig bookingløsning',
    description: 'Book lokaler, utstyr og tjenester enkelt og effektivt.',
    features: [
      {
        title: 'Enkel booking',
        description: 'Book lokaler og ressurser med få klikk',
      },
      {
        title: 'Sanntidsoppdateringer',
        description: 'Se tilgjengelighet i sanntid',
      },
      {
        title: 'Sikker betaling',
        description: 'Trygg betaling med Vipps eller kort',
      },
    ],
    integrations: ['BankID', 'Vipps', 'Stripe'],
  },
  
  footerLinks: [
    { href: '/personvern', label: 'Personvern' },
    { href: '/vilkar', label: 'Vilkår' },
    { href: '/hjelp', label: 'Hjelp' },
  ],
};
