/**
 * Development Token Service
 * Generates real JWT tokens for demo users in development/staging environments.
 * 
 * This is NOT an auth bypass - tokens go through the same validation as production.
 * The only difference is that tokens are auto-generated for convenience during development.
 * 
 * IMPORTANT: This service throws in production mode as a safety measure.
 */
import { JwtService } from './jwt.service';

export interface DevUserConfig {
  userId: string;
  tenantId: string;
  role?: string;
  tenantSlug?: string;
}

// Default demo user configuration
const DEFAULT_DEV_USER: DevUserConfig = {
  userId: 'f47ac10b-58cc-4372-a567-0e02b2c3d479', // Demo admin user
  tenantId: 'f47ac10b-58cc-4372-a567-0e02b2c3d479', // Digilist kommune tenant
  role: 'admin',
  tenantSlug: 'digilist-kommune',
};

export class DevTokenService {
  private jwtService: JwtService;
  private isEnabled: boolean;
  private devUser: DevUserConfig;

  constructor(jwtService: JwtService) {
    this.jwtService = jwtService;
    
    // Only enable in development or staging, NEVER in production
    const nodeEnv = process.env.NODE_ENV || 'development';
    const autoDevAuth = process.env.AUTO_DEV_AUTH === 'true';
    
    this.isEnabled = autoDevAuth && nodeEnv !== 'production';
    
    // Safety check: fail-fast if someone tries to enable in production
    if (autoDevAuth && nodeEnv === 'production') {
      console.error('❌ SECURITY: AUTO_DEV_AUTH cannot be enabled in production!');
      this.isEnabled = false;
    }

    // Configure dev user from environment or use defaults
    this.devUser = {
      userId: process.env.DEV_AUTH_USER_ID || DEFAULT_DEV_USER.userId,
      tenantId: process.env.DEV_AUTH_TENANT_ID || DEFAULT_DEV_USER.tenantId,
      role: process.env.DEV_AUTH_ROLE || DEFAULT_DEV_USER.role,
      tenantSlug: process.env.DEV_AUTH_TENANT_SLUG || DEFAULT_DEV_USER.tenantSlug,
    };

    if (this.isEnabled) {
      console.log('🔧 DevTokenService enabled - auto-injecting JWT for dev user');
    }
  }

  /**
   * Check if dev token auto-injection is enabled
   */
  isAutoAuthEnabled(): boolean {
    return this.isEnabled;
  }

  /**
   * Generate a real JWT token for the configured dev user.
   * Token goes through normal validation - same as production.
   */
  generateDevToken(): string {
    if (!this.isEnabled) {
      throw new Error('DevTokenService is not enabled');
    }

    const result = this.jwtService.generateToken(
      this.devUser.userId,
      this.devUser.tenantId,
      86400, // 24 hours
      {
        slug: this.devUser.tenantSlug,
        featureFlags: {
          // Enable all feature flags in dev mode for testing
          demoLogin: true,
          bankidLogin: true,
          vippsLogin: true,
        },
      }
    );

    return result.token;
  }

  /**
   * Get the configured dev user info
   */
  getDevUser(): DevUserConfig {
    return { ...this.devUser };
  }
}
