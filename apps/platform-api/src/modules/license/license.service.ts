/**
 * License Key Service
 * Server-side license key generation, rotation, and verification
 *
 * Security: License keys are never stored in plaintext - only the hash is persisted.
 * The plaintext key is returned only once during generation/rotation.
 */
import { randomBytes, createHash, timingSafeEqual } from 'crypto';
import { Injectable, Inject } from '../../core/decorators';
import { container } from '../../core/container';
import { tenants } from '../../database/schema/index';
import { eq } from 'drizzle-orm';
import { NotFoundError, ConflictError, BadRequestError } from '../../core/errors/problem-details';
import { getAuditService } from '../../core/audit/audit.service';

/**
 * License key format: XALA-XXXX-XXXX-XXXX-XXXX
 * Total: 4 groups of 4 characters (alphanumeric, uppercase)
 */
const LICENSE_KEY_PREFIX = 'XALA';
const LICENSE_KEY_SEGMENT_LENGTH = 4;
const LICENSE_KEY_SEGMENTS = 4;
const LICENSE_KEY_CHARSET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

export interface LicenseKeyGenerationResult {
  /** The plaintext license key (only returned once) */
  key: string;
  /** First 8 characters of the key for identification */
  keyPrefix: string;
  /** SHA-256 hash of the key (what is stored) */
  keyHash: string;
  /** Timestamp when the key was generated */
  generatedAt: Date;
}

export interface LicenseKeyRotationResult extends LicenseKeyGenerationResult {
  /** Previous key prefix for audit purposes */
  previousKeyPrefix: string | null;
  /** Timestamp of previous rotation */
  previousRotatedAt: Date | null;
}

export interface LicenseKeyVerificationResult {
  valid: boolean;
  tenantId: string | null;
  tenantName: string | null;
  tenantStatus: string | null;
  lastRotatedAt: Date | null;
}

@Injectable()
export class LicenseKeyService {
  private db: any;

  constructor() {
    this.db = container.resolve<any>('Database');
  }

  /**
   * Generate a new random license key
   * Format: XALA-XXXX-XXXX-XXXX-XXXX
   */
  private generateKey(): string {
    const segments: string[] = [LICENSE_KEY_PREFIX];

    for (let i = 0; i < LICENSE_KEY_SEGMENTS; i++) {
      let segment = '';
      const bytes = randomBytes(LICENSE_KEY_SEGMENT_LENGTH);
      for (let j = 0; j < LICENSE_KEY_SEGMENT_LENGTH; j++) {
        segment += LICENSE_KEY_CHARSET[bytes[j] % LICENSE_KEY_CHARSET.length];
      }
      segments.push(segment);
    }

    return segments.join('-');
  }

  /**
   * Hash a license key using SHA-256
   * Uses a deterministic hash so the same key always produces the same hash
   */
  private hashKey(key: string): string {
    return createHash('sha256')
      .update(key.toUpperCase().trim())
      .digest('hex');
  }

  /**
   * Extract key prefix for identification (first 8 chars after XALA-)
   */
  private getKeyPrefix(key: string): string {
    // Remove XALA- prefix and get first segment
    const withoutPrefix = key.replace('XALA-', '');
    return `XALA-${withoutPrefix.substring(0, 4)}...`;
  }

  /**
   * Generate a new license key for a tenant
   * @throws NotFoundError if tenant doesn't exist
   * @throws ConflictError if tenant already has a license key
   */
  async generateLicenseKey(
    tenantId: string,
    options?: { userId?: string; force?: boolean }
  ): Promise<LicenseKeyGenerationResult> {
    // Verify tenant exists
    const [tenant] = await this.db
      .select()
      .from(tenants)
      .where(eq(tenants.id, tenantId))
      .limit(1);

    if (!tenant) {
      throw new NotFoundError('Tenant', tenantId);
    }

    // Check if tenant already has a key (unless force is true)
    if (tenant.licenseKeyHash && !options?.force) {
      throw new ConflictError(
        `Tenant '${tenantId}' already has a license key. Use rotation to update it.`
      );
    }

    // Generate key and hash
    const key = this.generateKey();
    const keyHash = this.hashKey(key);
    const generatedAt = new Date();

    // Update tenant with new key hash
    await this.db
      .update(tenants)
      .set({
        licenseKeyHash: keyHash,
        licenseKeyRotatedAt: generatedAt,
        updatedAt: generatedAt,
      })
      .where(eq(tenants.id, tenantId));

    // Audit log the generation
    const auditService = getAuditService();
    await auditService.log({
      tenantId,
      userId: options?.userId,
      action: 'create',
      resource: 'license_key',
      resourceId: tenantId,
      severity: 'warning',
      metadata: {
        keyPrefix: this.getKeyPrefix(key),
        generatedAt: generatedAt.toISOString(),
      },
    });

    return {
      key,
      keyPrefix: this.getKeyPrefix(key),
      keyHash,
      generatedAt,
    };
  }

  /**
   * Rotate (regenerate) a license key for a tenant
   * Invalidates the old key and generates a new one
   * @throws NotFoundError if tenant doesn't exist
   */
  async rotateLicenseKey(
    tenantId: string,
    options?: { userId?: string; reason?: string }
  ): Promise<LicenseKeyRotationResult> {
    // Get current tenant state
    const [tenant] = await this.db
      .select()
      .from(tenants)
      .where(eq(tenants.id, tenantId))
      .limit(1);

    if (!tenant) {
      throw new NotFoundError('Tenant', tenantId);
    }

    const previousKeyHash = tenant.licenseKeyHash;
    const previousRotatedAt = tenant.licenseKeyRotatedAt;

    // Generate new key and hash
    const key = this.generateKey();
    const keyHash = this.hashKey(key);
    const generatedAt = new Date();

    // Update tenant with new key hash
    await this.db
      .update(tenants)
      .set({
        licenseKeyHash: keyHash,
        licenseKeyRotatedAt: generatedAt,
        updatedAt: generatedAt,
      })
      .where(eq(tenants.id, tenantId));

    // Audit log the rotation
    const auditService = getAuditService();
    await auditService.log({
      tenantId,
      userId: options?.userId,
      action: 'update',
      resource: 'license_key',
      resourceId: tenantId,
      severity: 'warning',
      metadata: {
        action: 'rotate',
        reason: options?.reason || 'Scheduled rotation',
        newKeyPrefix: this.getKeyPrefix(key),
        previousKeyExists: !!previousKeyHash,
        previousRotatedAt: previousRotatedAt?.toISOString() || null,
        rotatedAt: generatedAt.toISOString(),
      },
    });

    return {
      key,
      keyPrefix: this.getKeyPrefix(key),
      keyHash,
      generatedAt,
      previousKeyPrefix: previousKeyHash ? 'XALA-****...' : null,
      previousRotatedAt,
    };
  }

  /**
   * Verify a license key against stored hashes
   * Uses timing-safe comparison to prevent timing attacks
   */
  async verifyLicenseKey(key: string): Promise<LicenseKeyVerificationResult> {
    if (!key || typeof key !== 'string') {
      throw new BadRequestError('License key is required');
    }

    // Normalize the key
    const normalizedKey = key.toUpperCase().trim();

    // Validate key format
    const keyFormat = /^XALA-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/;
    if (!keyFormat.test(normalizedKey)) {
      return {
        valid: false,
        tenantId: null,
        tenantName: null,
        tenantStatus: null,
        lastRotatedAt: null,
      };
    }

    const keyHash = this.hashKey(normalizedKey);

    // Find tenant with matching hash
    const [tenant] = await this.db
      .select({
        id: tenants.id,
        name: tenants.name,
        status: tenants.status,
        licenseKeyHash: tenants.licenseKeyHash,
        licenseKeyRotatedAt: tenants.licenseKeyRotatedAt,
      })
      .from(tenants)
      .where(eq(tenants.licenseKeyHash, keyHash))
      .limit(1);

    if (!tenant) {
      return {
        valid: false,
        tenantId: null,
        tenantName: null,
        tenantStatus: null,
        lastRotatedAt: null,
      };
    }

    // Perform timing-safe comparison
    const storedHashBuffer = Buffer.from(tenant.licenseKeyHash, 'hex');
    const providedHashBuffer = Buffer.from(keyHash, 'hex');

    const isValid = storedHashBuffer.length === providedHashBuffer.length &&
      timingSafeEqual(storedHashBuffer, providedHashBuffer);

    return {
      valid: isValid && tenant.status === 'active',
      tenantId: isValid ? tenant.id : null,
      tenantName: isValid ? tenant.name : null,
      tenantStatus: isValid ? tenant.status : null,
      lastRotatedAt: isValid ? tenant.licenseKeyRotatedAt : null,
    };
  }

  /**
   * Revoke a tenant's license key (set to null)
   * @throws NotFoundError if tenant doesn't exist
   */
  async revokeLicenseKey(
    tenantId: string,
    options?: { userId?: string; reason?: string }
  ): Promise<void> {
    // Verify tenant exists
    const [tenant] = await this.db
      .select()
      .from(tenants)
      .where(eq(tenants.id, tenantId))
      .limit(1);

    if (!tenant) {
      throw new NotFoundError('Tenant', tenantId);
    }

    const hadKey = !!tenant.licenseKeyHash;

    // Remove license key
    await this.db
      .update(tenants)
      .set({
        licenseKeyHash: null,
        updatedAt: new Date(),
      })
      .where(eq(tenants.id, tenantId));

    // Audit log the revocation
    if (hadKey) {
      const auditService = getAuditService();
      await auditService.log({
        tenantId,
        userId: options?.userId,
        action: 'delete',
        resource: 'license_key',
        resourceId: tenantId,
        severity: 'critical',
        metadata: {
          action: 'revoke',
          reason: options?.reason || 'Manual revocation',
          revokedAt: new Date().toISOString(),
        },
      });
    }
  }

  /**
   * Check if a tenant has an active license key
   */
  async hasLicenseKey(tenantId: string): Promise<boolean> {
    const [tenant] = await this.db
      .select({ licenseKeyHash: tenants.licenseKeyHash })
      .from(tenants)
      .where(eq(tenants.id, tenantId))
      .limit(1);

    return !!tenant?.licenseKeyHash;
  }

  /**
   * Get license key metadata for a tenant (no sensitive data)
   */
  async getLicenseKeyMetadata(tenantId: string): Promise<{
    hasKey: boolean;
    lastRotatedAt: Date | null;
    keyPrefix: string | null;
  }> {
    const [tenant] = await this.db
      .select({
        licenseKeyHash: tenants.licenseKeyHash,
        licenseKeyRotatedAt: tenants.licenseKeyRotatedAt,
      })
      .from(tenants)
      .where(eq(tenants.id, tenantId))
      .limit(1);

    if (!tenant) {
      throw new NotFoundError('Tenant', tenantId);
    }

    return {
      hasKey: !!tenant.licenseKeyHash,
      lastRotatedAt: tenant.licenseKeyRotatedAt,
      // Never expose any part of the actual hash
      keyPrefix: tenant.licenseKeyHash ? 'XALA-****...' : null,
    };
  }
}

// Singleton instance
let licenseServiceInstance: LicenseKeyService | null = null;

export function getLicenseKeyService(): LicenseKeyService {
  if (!licenseServiceInstance) {
    licenseServiceInstance = new LicenseKeyService();
  }
  return licenseServiceInstance;
}

// Reset singleton for testing
export function resetLicenseKeyService(): void {
  licenseServiceInstance = null;
}
