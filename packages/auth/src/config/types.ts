/**
 * Auth Configuration Types
 * Defines auth provider configurations and app-specific settings
 */

import type { ReactElement } from 'react';
import type { UserRole, AppType } from '../types';

/**
 * Auth provider identifiers
 */
export type AuthProviderId = 'idporten' | 'vipps' | 'microsoft' | 'demo';

/**
 * Auth provider configuration
 */
export interface AuthProvider {
  /** Unique provider identifier */
  id: AuthProviderId;
  
  /** Display name */
  name: string;
  
  /** Description shown to users */
  description: string;
  
  /** Whether provider is enabled */
  enabled: boolean;
  
  /** Icon component (from @xala/ds or custom) */
  icon?: () => ReactElement;
  
  /** Required roles to use this provider (optional) */
  requiresRoles?: UserRole[];
  
  /** OAuth authorize endpoint (if OAuth provider) */
  authorizeEndpoint?: string;
  
  /** Custom click handler (for demo login, etc.) */
  customHandler?: () => void;
}

/**
 * App-specific authentication configuration
 */
export interface AppAuthConfig {
  /** Application identifier */
  app: AppType;
  
  /** Available auth providers for this app */
  providers: AuthProvider[];
  
  /** Path to redirect after successful login */
  redirectAfterLogin: string;
  
  /** Roles allowed to access this app */
  allowedRoles?: UserRole[];
  
  /** Feature flags for auth behavior */
  features: {
    /** Enable flow context preservation (booking flows, etc.) */
    flowContextPreservation: boolean;
    
    /** Enable role selection for dual-role users */
    roleSelection: boolean;
    
    /** Enable organization context switching */
    orgContextSwitch: boolean;
    
    /** Show "Remember me" option */
    rememberMe: boolean;
  };
  
  /** Branding configuration */
  branding?: {
    /** Brand name */
    name: string;
    
    /** Brand tagline */
    tagline: string;
    
    /** Logo URL or path */
    logoUrl?: string;
    
    /** Logo click destination */
    logoHref?: string;
  };
  
  /** Right panel configuration */
  panel?: {
    /** Panel title */
    title: string;
    
    /** Panel subtitle */
    subtitle: string;
    
    /** Panel description */
    description?: string;
    
    /** Feature items to display */
    features: Array<{
      icon?: () => ReactElement;
      title: string;
      description: string;
    }>;
    
    /** Integration/certification badges */
    integrations: string[];
  };
  
  /** Footer links */
  footerLinks?: Array<{
    href: string;
    label: string;
  }>;
}

/**
 * Provider availability check result
 */
export interface ProviderAvailability {
  available: boolean;
  reason?: string;
}
