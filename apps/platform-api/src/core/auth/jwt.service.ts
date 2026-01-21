/**
 * JWT Service
 * Production-ready JWT token generation and verification with cryptographic signatures
 */
import jwt from 'jsonwebtoken';

export interface TenantSubscriptionInfo {
  planId: string | null;
  status: string;
  seatLimits: {
    maxUsers: number;
    maxOrganizations: number;
    maxResources: number;
    maxOperationsPerMonth: number;
    maxStorageMb: number;
  };
  enabledCategories: string[];
}

export interface JwtPayload {
  userId: string;
  tenantId: string;
  tenantSlug?: string;
  subscription?: TenantSubscriptionInfo;
  featureFlags?: Record<string, unknown>;
  iat?: number;
  exp?: number;
  iss?: string;
  aud?: string;
}

export interface TokenResult {
  token: string;
  expiresIn: number;
  expiresAt: Date;
}

export interface VerifiedToken extends JwtPayload {
  iat: number;
  exp: number;
  iss: string;
  aud: string;
}

export class JwtService {
  private readonly secret: string;
  private readonly issuer: string = 'xala-platform';
  private readonly audience: string = 'xala-api';
  private readonly algorithm: jwt.Algorithm = 'HS256';

  constructor(secret: string) {
    if (!secret || secret.length < 32) {
      throw new Error('JWT secret must be at least 32 characters long');
    }
    this.secret = secret;
  }

  /**
   * Generate a signed JWT token for a user and tenant
   * @param userId - User identifier
   * @param tenantId - Tenant/organization identifier
   * @param expiresIn - Token expiration time in seconds (default: 24 hours)
   * @param tenantData - Optional tenant subscription and feature flag data
   * @returns Token result with token string and expiration info
   */
  generateToken(
    userId: string,
    tenantId: string,
    expiresIn: number = 86400,
    tenantData?: {
      slug?: string;
      subscription?: TenantSubscriptionInfo;
      featureFlags?: Record<string, unknown>;
    }
  ): TokenResult {
    if (!userId || !tenantId) {
      throw new Error('userId and tenantId are required');
    }

    const payload: JwtPayload = {
      userId,
      tenantId,
      ...(tenantData?.slug && { tenantSlug: tenantData.slug }),
      ...(tenantData?.subscription && { subscription: tenantData.subscription }),
      ...(tenantData?.featureFlags && { featureFlags: tenantData.featureFlags }),
    };

    const token = jwt.sign(payload, this.secret, {
      algorithm: this.algorithm,
      issuer: this.issuer,
      audience: this.audience,
      expiresIn,
    });

    const now = Math.floor(Date.now() / 1000);
    const exp = now + expiresIn;

    return {
      token,
      expiresIn,
      expiresAt: new Date(exp * 1000),
    };
  }

  /**
   * Verify and decode a JWT token with comprehensive validation
   * @param token - JWT token string
   * @param options - Validation options
   * @returns Verified token payload
   * @throws Error if token is invalid, expired, or has invalid signature
   */
  verifyToken(
    token: string,
    options?: {
      validateTenant?: boolean;
      validateSubscription?: boolean;
    }
  ): VerifiedToken {
    if (!token) {
      throw new Error('Token is required');
    }

    try {
      const decoded = jwt.verify(token, this.secret, {
        algorithms: [this.algorithm],
        issuer: this.issuer,
        audience: this.audience,
      }) as VerifiedToken;

      // Ensure required fields are present
      if (!decoded.userId || !decoded.tenantId) {
        throw new Error('Token missing required claims (userId, tenantId)');
      }

      // Validate tenant ID format (UUID)
      if (options?.validateTenant && !this.isValidUuid(decoded.tenantId)) {
        throw new Error('Invalid tenant ID format');
      }

      // Validate subscription if present and required
      if (options?.validateSubscription && decoded.subscription) {
        this.validateSubscription(decoded.subscription);
      }

      return decoded;
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new Error('Token has expired');
      }
      if (error instanceof jwt.JsonWebTokenError) {
        throw new Error('Invalid token signature');
      }
      if (error instanceof jwt.NotBeforeError) {
        throw new Error('Token not yet valid');
      }
      throw error;
    }
  }

  /**
   * Validate UUID format
   */
  private isValidUuid(uuid: string): boolean {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid);
  }

  /**
   * Validate subscription data structure
   */
  private validateSubscription(subscription: TenantSubscriptionInfo): void {
    if (!subscription.status) {
      throw new Error('Subscription missing status');
    }

    if (!subscription.seatLimits) {
      throw new Error('Subscription missing seat limits');
    }

    const requiredLimits = ['maxUsers', 'maxOrganizations', 'maxResources', 'maxOperationsPerMonth', 'maxStorageMb'];
    for (const limit of requiredLimits) {
      if (typeof subscription.seatLimits[limit as keyof typeof subscription.seatLimits] !== 'number') {
        throw new Error(`Subscription missing or invalid limit: ${limit}`);
      }
    }
  }

  /**
   * Decode a JWT token without verification (use for debugging only)
   * @param token - JWT token string
   * @returns Decoded token payload or null if invalid format
   */
  decodeToken(token: string): JwtPayload | null {
    if (!token) {
      return null;
    }

    try {
      const decoded = jwt.decode(token) as JwtPayload;
      return decoded;
    } catch {
      return null;
    }
  }

  /**
   * Refresh a token by generating a new one with the same claims
   * @param token - Existing JWT token
   * @param expiresIn - New expiration time in seconds
   * @returns New token result
   */
  refreshToken(token: string, expiresIn: number = 86400): TokenResult {
    const verified = this.verifyToken(token);
    return this.generateToken(
      verified.userId,
      verified.tenantId,
      expiresIn,
      {
        slug: verified.tenantSlug,
        subscription: verified.subscription,
        featureFlags: verified.featureFlags,
      }
    );
  }

  /**
   * Extract token from Authorization header
   * @param authHeader - Authorization header value (e.g., "Bearer <token>")
   * @returns Token string or null if invalid format
   */
  extractTokenFromHeader(authHeader: string | undefined): string | null {
    if (!authHeader) {
      return null;
    }

    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      return null;
    }

    return parts[1];
  }

  /**
   * Check if a token is expired without full verification
   * @param token - JWT token string
   * @returns true if token is expired, false otherwise
   */
  isTokenExpired(token: string): boolean {
    const decoded = this.decodeToken(token);
    if (!decoded || !decoded.exp) {
      return true;
    }

    const now = Math.floor(Date.now() / 1000);
    return decoded.exp < now;
  }
}
