/**
 * SaaS Admin App Authentication Configuration
 * Platform administration for super admins
 */

import type { AppAuthConfig } from '../types';
import { idportenProvider, demoProvider } from '../providers';

export const saasAdminAuthConfig: AppAuthConfig = {
  app: 'saas-admin',
  
  providers: [
    idportenProvider,
    // Internal SSO would go here when implemented
    demoProvider,
  ],
  
  redirectAfterLogin: '/',
  
  // Only super admins
  allowedRoles: ['super_admin', 'admin'],
  
  features: {
    flowContextPreservation: false,
    roleSelection: false,
    orgContextSwitch: false,
    rememberMe: true,
  },
  
  branding: {
    name: 'DIGILIST',
    tagline: 'SAAS ADMIN',
    logoHref: '/',
  },
  
  panel: {
    title: 'SaaS Admin',
    subtitle: 'Plattformadministrasjon',
    description: 'Administrer tenants, planer, feature flags og plattforminnstillinger.',
    features: [
      {
        title: 'Tenant Management',
        description: 'Administrer alle tenants og abonnementer',
      },
      {
        title: 'Feature Flags',
        description: 'Kontroller features og utrullinger',
      },
      {
        title: 'Platform Metrics',
        description: 'Overvåk plattformens helse og ytelse',
      },
    ],
    integrations: ['Azure Monitor', 'Stripe', 'SendGrid'],
  },
  
  footerLinks: [
    { href: '/docs', label: 'Documentation' },
    { href: '/api', label: 'API Reference' },
    { href: '/status', label: 'Status' },
  ],
};
