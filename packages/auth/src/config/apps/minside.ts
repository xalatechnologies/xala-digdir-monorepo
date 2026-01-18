/**
 * MinSide App Authentication Configuration
 * Citizen portal for managing bookings and profile
 */

import type { AppAuthConfig } from '../types';
import { idportenProvider, vippsProvider, microsoftProvider, demoProvider } from '../providers';

export const minsideAuthConfig: AppAuthConfig = {
  app: 'minside',
  
  providers: [
    idportenProvider,
    { ...vippsProvider, enabled: false },
    { ...microsoftProvider, enabled: false },
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
    tagline: 'MIN SIDE',
    logoHref: '/',
  },
  
  panel: {
    title: 'Min Side',
    subtitle: 'Dine bookinger og profil',
    description: 'Administrer dine bookinger, se historikk og oppdater profilen din.',
    features: [
      {
        title: 'Mine bookinger',
        description: 'Oversikt over alle dine bookinger',
      },
      {
        title: 'Bookinghistorikk',
        description: 'Se tidligere bookinger og kvitteringer',
      },
      {
        title: 'Profilinnstillinger',
        description: 'Oppdater kontaktinformasjon og preferanser',
      },
    ],
    integrations: ['BankID', 'MinID', 'Vipps'],
  },
  
  footerLinks: [
    { href: '/personvern', label: 'Personvern' },
    { href: '/vilkar', label: 'Vilkår' },
    { href: '/hjelp', label: 'Hjelp' },
  ],
};
