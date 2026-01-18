/**
 * App Configuration Exports
 */

export { webAuthConfig } from './web';
export { minsideAuthConfig } from './minside';
export { backofficeAuthConfig } from './backoffice';
export { saasAdminAuthConfig } from './saas-admin';

import type { AppType } from '../../types';
import type { AppAuthConfig } from '../types';
import { webAuthConfig } from './web';
import { minsideAuthConfig } from './minside';
import { backofficeAuthConfig } from './backoffice';
import { saasAdminAuthConfig } from './saas-admin';

/**
 * Get auth config for specific app
 */
export function getAppAuthConfig(appType: AppType): AppAuthConfig {
  switch (appType) {
    case 'web':
      return webAuthConfig;
    case 'minside':
      return minsideAuthConfig;
    case 'backoffice':
      return backofficeAuthConfig;
    case 'saas-admin':
      return saasAdminAuthConfig;
    case 'tenant-admin':
      // Tenant admin uses similar config to backoffice
      return {
        ...backofficeAuthConfig,
        app: 'tenant-admin',
        allowedRoles: ['tenant_admin', 'admin', 'super_admin'],
        branding: {
          name: 'DIGILIST',
          tagline: 'TENANT ADMIN',
          logoHref: '/',
        },
      };
    default:
      throw new Error(`Unknown app type: ${appType}`);
  }
}
