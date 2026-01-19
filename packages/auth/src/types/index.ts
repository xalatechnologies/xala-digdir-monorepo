/**
 * User Types and Roles
 * Unified types used across all applications
 */

/**
 * Application types that use this auth package
 */
export type AppType = 'minside' | 'backoffice' | 'saas-admin' | 'tenant-admin' | 'web';

/**
 * All possible user roles across the platform
 */
export type UserRole = 
  | 'admin'          // Full admin access
  | 'saksbehandler'  // Case handler (backoffice)
  | 'super_admin'    // Platform super admin (saas-admin)
  | 'tenant_admin'   // Tenant administrator (tenant-admin)
  | 'citizen'        // Regular citizen (minside/web)
  | 'case_handler';  // Case handler (alternative name)

/**
 * Extended effective roles for backoffice
 */
export type EffectiveBackofficeRole = 'admin' | 'case_handler' | 'super_admin';

/**
 * Base user interface used across all apps
 */
export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  grantedRoles?: EffectiveBackofficeRole[];
  tenantId?: string;
}

/**
 * Flow context for preserving user intent across authentication
 * (e.g., booking flow, application flow)
 */
export interface FlowContext {
  flow: string;
  returnPath: string;
  metadata?: Record<string, unknown>;
  timestamp: number;
}

/**
 * Result from restoring flow context after authentication
 */
export interface RestoreFlowContextResult {
  hasContext: boolean;
  flowContext?: FlowContext;
  ttl?: number;
  wasExpired?: boolean;
  wasInvalid?: boolean;
}

/**
 * Authentication configuration per app
 */
export interface AuthConfig {
  /**
   * Application type - determines role-based access rules
   */
  appType: AppType;
  
  /**
   * Roles allowed to access this app
   * If undefined, all authenticated users allowed
   */
  allowedRoles?: UserRole[];
  
  /**
   * Path to the login page
   * @default '/login'
   */
  loginPath?: string;
  
  /**
   * Path to redirect after successful login
   * @default '/'
   */
  loginRedirect?: string;
  
  /**
   * Path to redirect when user lacks required role
   * @default '/access-denied'
   */
  unauthorizedRedirect?: string;
  
  /**
   * Message to show when access is denied
   */
  accessDeniedMessage?: string;
  
  /**
   * Callback fired on authentication errors
   */
  onAuthError?: (error: Error) => void;
  
  /**
   * Enable debug logging
   * @default false
   */
  debug?: boolean;
}

/**
 * Authentication context provided by AuthProvider
 */
export interface AuthContextType {
  /** Current authenticated user (null if not authenticated) */
  user: User | null;
  
  /** Whether authentication state is being loaded */
  isLoading: boolean;
  
  /** Whether user is authenticated */
  isAuthenticated: boolean;
  
  /** Whether user has admin role */
  isAdmin: boolean;
  
  /** Whether user has case handler role (backoffice specific) */
  isSaksbehandler: boolean;
  
  /** Error message if access was denied */
  accessDeniedError: string | null;
  
  /** Whether there is a stored flow context */
  hasStoredContext: boolean;
  
  /** Initiate OAuth login with specified provider */
  login: (provider?: 'idporten' | 'microsoft' | 'vipps') => Promise<void>;
  
  /** Log out current user */
  logout: () => Promise<void>;
  
  /** Check if user has specific role */
  checkRole: (role: UserRole) => boolean;
  
  /** Restore flow context after authentication */
  restoreFlowContext: (clearAfterLoad?: boolean) => RestoreFlowContextResult;
  
  /** Clear any stored flow context */
  clearFlowContext: () => void;
  
  /** Handle auth callback with user data (for demo login without page reload) */
  handleAuthCallback: (userData: Pick<User, 'id' | 'name' | 'email'>) => void;
}
