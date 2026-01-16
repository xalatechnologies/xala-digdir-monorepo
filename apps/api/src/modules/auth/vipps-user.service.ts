/**
 * Vipps User Service
 * 
 * Handles user creation, linking, and management for Vipps Login integration.
 * 
 * Responsibilities:
 * - Find existing users by Vipps sub or email
 * - Create new users from Vipps claims
 * - Link Vipps identity to existing users
 * - Map Vipps roles to Digilist roles
 */

import { eq, or } from 'drizzle-orm';
import { container } from '../../core/container';
import { users, tenants } from '../../database/schema/index';
import { getAuditService } from '../../core/audit/audit.service';
import type { IdTokenClaims, VippsUserInfo } from '../../integrations/vipps/vipps-login.service';

// =============================================================================
// Types
// =============================================================================

export interface VippsUserLinkResult {
  /** The user record */
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
    tenantId: string;
  };
  /** Whether the user was newly created */
  isNewUser: boolean;
  /** Whether an existing user was linked to Vipps */
  wasLinked: boolean;
}

export interface VippsUserCreateOptions {
  /** Vipps ID token claims */
  claims: IdTokenClaims;
  /** Vipps user info */
  userInfo: VippsUserInfo;
  /** Optional: Specific tenant to assign user to */
  tenantId?: string;
  /** Optional: Specific role to assign */
  role?: string;
  /** Request IP for audit logging */
  ipAddress?: string;
  /** Request user agent for audit logging */
  userAgent?: string;
}

// =============================================================================
// Vipps User Service
// =============================================================================

export class VippsUserService {
  private db: any;

  constructor() {
    this.db = container.resolve<any>('Database');
  }

  /**
   * Find or create user from Vipps login
   * 
   * Search order:
   * 1. By Vipps sub in metadata
   * 2. By email
   * 3. Create new user if not found
   */
  async findOrCreateFromVipps(options: VippsUserCreateOptions): Promise<VippsUserLinkResult> {
    const { claims, userInfo, tenantId, role, ipAddress, userAgent } = options;
    
    // Try to find by Vipps sub in metadata
    let user = await this.findByVippsSub(claims.sub);
    
    if (user) {
      // Update last login metadata
      await this.updateVippsMetadata(user.id, claims, userInfo);
      
      return {
        user: this.mapUserToResult(user),
        isNewUser: false,
        wasLinked: false,
      };
    }
    
    // Try to find by email
    if (userInfo.email) {
      user = await this.findByEmail(userInfo.email);
      
      if (user) {
        // Link existing user to Vipps
        await this.linkToVipps(user.id, claims, userInfo);
        
        getAuditService().log({
          tenantId: user.tenantId,
          userId: user.id,
          action: 'user_linked_to_vipps',
          resource: 'user',
          resourceId: user.id,
          ipAddress,
          userAgent,
          metadata: {
            vippsSub: claims.sub,
            email: userInfo.email,
          },
        });
        
        // Refresh user data
        user = await this.findByEmail(userInfo.email);
        
        return {
          user: this.mapUserToResult(user!),
          isNewUser: false,
          wasLinked: true,
        };
      }
    }
    
    // Create new user
    const newUser = await this.createFromVipps({
      claims,
      userInfo,
      tenantId,
      role,
      ipAddress,
      userAgent,
    });
    
    return {
      user: this.mapUserToResult(newUser),
      isNewUser: true,
      wasLinked: false,
    };
  }

  /**
   * Find user by Vipps sub ID stored in metadata
   */
  async findByVippsSub(vippsSub: string): Promise<any | null> {
    // Note: This uses a JSON query which may not be optimal
    // In production, consider adding a dedicated column or index
    const result = await this.db
      .select()
      .from(users)
      .limit(100); // Get a batch to filter
    
    // Filter in JS since drizzle JSONB querying can be complex
    const matchingUser = result.find((u: any) => 
      u.metadata?.vippsSub === vippsSub
    );
    
    return matchingUser || null;
  }

  /**
   * Find user by email
   */
  async findByEmail(email: string): Promise<any | null> {
    const result = await this.db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);
    
    return result.length > 0 ? result[0] : null;
  }

  /**
   * Link existing user to Vipps identity
   */
  async linkToVipps(userId: string, claims: IdTokenClaims, userInfo: VippsUserInfo): Promise<void> {
    const existingUser = await this.db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);
    
    if (!existingUser.length) {
      throw new Error(`User ${userId} not found`);
    }
    
    const currentMetadata = existingUser[0].metadata || {};
    
    await this.db.update(users).set({
      metadata: {
        ...currentMetadata,
        vippsSub: claims.sub,
        phoneNumber: userInfo.phone_number,
        provider: 'vipps',
        linkedAt: new Date().toISOString(),
        lastVippsLogin: new Date().toISOString(),
      },
      lastLoginAt: new Date(),
    }).where(eq(users.id, userId));
  }

  /**
   * Update Vipps metadata on existing linked user
   */
  async updateVippsMetadata(userId: string, claims: IdTokenClaims, userInfo: VippsUserInfo): Promise<void> {
    const existingUser = await this.db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);
    
    if (!existingUser.length) {
      return;
    }
    
    const currentMetadata = existingUser[0].metadata || {};
    
    await this.db.update(users).set({
      metadata: {
        ...currentMetadata,
        phoneNumber: userInfo.phone_number || currentMetadata.phoneNumber,
        lastVippsLogin: new Date().toISOString(),
      },
      lastLoginAt: new Date(),
    }).where(eq(users.id, userId));
  }

  /**
   * Create new user from Vipps data
   */
  async createFromVipps(options: VippsUserCreateOptions): Promise<any> {
    const { claims, userInfo, tenantId, role, ipAddress, userAgent } = options;
    
    // Get tenant ID
    let finalTenantId = tenantId;
    if (!finalTenantId) {
      const defaultTenants = await this.db.select().from(tenants).limit(1);
      finalTenantId = defaultTenants.length > 0 ? defaultTenants[0].id : undefined;
      
      if (!finalTenantId) {
        throw new Error('No default tenant found');
      }
    }
    
    // Generate user ID
    const newUserId = `vipps-${claims.sub.substring(0, 8)}-${Date.now()}`;
    
    // Determine role based on Vipps claims (if any custom mapping needed)
    const userRole = role || this.mapVippsToDigilistRole(userInfo);
    
    // Create user
    await this.db.insert(users).values({
      id: newUserId,
      email: userInfo.email || `${claims.sub}@vipps.user`,
      name: userInfo.name || this.buildName(userInfo.given_name, userInfo.family_name) || 'Vipps User',
      role: userRole,
      tenantId: finalTenantId,
      status: 'active',
      metadata: {
        vippsSub: claims.sub,
        phoneNumber: userInfo.phone_number,
        provider: 'vipps',
        createdVia: 'vipps_login',
        createdAt: new Date().toISOString(),
        lastVippsLogin: new Date().toISOString(),
        // Store additional Vipps data
        address: userInfo.address,
        birthdate: userInfo.birthdate,
      },
      createdAt: new Date(),
      lastLoginAt: new Date(),
    });
    
    // Fetch created user
    const createdUsers = await this.db
      .select()
      .from(users)
      .where(eq(users.id, newUserId))
      .limit(1);
    
    const newUser = createdUsers[0];
    
    // Audit log
    getAuditService().log({
      tenantId: finalTenantId,
      userId: newUserId,
      action: 'user_created_via_vipps',
      resource: 'user',
      resourceId: newUserId,
      ipAddress,
      userAgent,
      metadata: {
        vippsSub: claims.sub,
        email: userInfo.email,
        phone: userInfo.phone_number,
        role: userRole,
      },
    });
    
    return newUser;
  }

  /**
   * Map Vipps user info to Digilist role
   * Can be extended for custom role mapping based on organization, etc.
   */
  private mapVippsToDigilistRole(userInfo: VippsUserInfo): string {
    // Default to 'user' role
    // In production, you might check organization membership, NIN-based lookups, etc.
    return 'user';
  }

  /**
   * Build full name from given and family names
   */
  private buildName(givenName?: string, familyName?: string): string | null {
    const parts = [givenName, familyName].filter(Boolean);
    return parts.length > 0 ? parts.join(' ') : null;
  }

  /**
   * Map database user to result format
   */
  private mapUserToResult(user: any): VippsUserLinkResult['user'] {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      tenantId: user.tenantId,
    };
  }
}

// =============================================================================
// Singleton
// =============================================================================

let serviceInstance: VippsUserService | null = null;

export function getVippsUserService(): VippsUserService {
  if (!serviceInstance) {
    serviceInstance = new VippsUserService();
  }
  return serviceInstance;
}

export function clearVippsUserService(): void {
  serviceInstance = null;
}
