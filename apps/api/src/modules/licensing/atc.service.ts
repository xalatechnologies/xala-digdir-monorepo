/**
 * ATC Service (Activation, Token, Code)
 * Handles license code issuance, token generation, activation tracking,
 * code rotation, and revocation with full audit trail
 */
import { eq, and, sql } from 'drizzle-orm';
import { createHmac, randomBytes } from 'crypto';
import { Injectable, Inject } from '../../core/decorators';
import {
  NotFoundError,
  ConflictError,
  BadRequestError,
  UnauthorizedError,
} from '../../core/errors/problem-details';
import {
  licenseCodes,
  activations,
  tenantLicenses,
  tenants,
  type LicenseCode,
  type NewLicenseCode,
  type Activation,
  type NewActivation,
} from '../../database/schema';

// ============================================================================
// Types and Interfaces
// ============================================================================

/**
 * License code status
 */
export type LicenseCodeStatus = 'active' | 'rotated' | 'revoked' | 'expired';

/**
 * Issue license code input
 */
export interface IssueLicenseCodeInput {
  tenantId: string;
  expiresAt?: Date;
  metadata?: Record<string, unknown>;
}

/**
 * Rotate license code input
 */
export interface RotateLicenseCodeInput {
  tenantId: string;
  currentCode: string;
  expiresAt?: Date;
  metadata?: Record<string, unknown>;
}

/**
 * Revoke license code input
 */
export interface RevokeLicenseCodeInput {
  tenantId: string;
  code: string;
  reason?: string;
}

/**
 * Activation input
 */
export interface CreateActivationInput {
  tenantId: string;
  licenseCodeId: string;
  environment: string;
  appId: string;
  moduleId?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Validate code input
 */
export interface ValidateLicenseCodeInput {
  code: string;
  environment?: string;
  appId?: string;
  moduleId?: string;
}

/**
 * License code projection DTO (screen-ready)
 */
export interface LicenseCodeProjectionDTO {
  id: string;
  code: string;
  maskedCode: string;
  status: LicenseCodeStatus;
  issuedAt: string;
  expiresAt: string | null;
  revokedAt: string | null;
  isExpired: boolean;
  isRevoked: boolean;
  daysUntilExpiry: number | null;
  activationsCount: number;
  permissions: {
    canRotate: boolean;
    canRevoke: boolean;
    canViewToken: boolean;
  };
  availableActions: Array<{
    action: string;
    label: string;
    enabled: boolean;
    reason?: string;
  }>;
}

/**
 * Activation projection DTO (screen-ready)
 */
export interface ActivationProjectionDTO {
  id: string;
  tenantId: string;
  environment: string;
  appId: string;
  moduleId: string | null;
  activatedAt: string;
  lastVerifiedAt: string | null;
  isActive: boolean;
  permissions: {
    canDeactivate: boolean;
  };
}

/**
 * Token payload for license verification
 */
interface LicenseTokenPayload {
  tenantId: string;
  codeId: string;
  issuedAt: number;
  expiresAt?: number;
  type: 'license';
}

// ============================================================================
// Service Implementation
// ============================================================================

@Injectable()
export class ATCService {
  constructor(
    @Inject('Database') private readonly db: any,
    @Inject('Adapters') private readonly adapters: any
  ) {}

  // ==========================================================================
  // License Code Methods
  // ==========================================================================

  /**
   * Issue a new license code for a tenant
   */
  async issueLicenseCode(input: IssueLicenseCodeInput, userId?: string): Promise<LicenseCodeProjectionDTO> {
    // Verify tenant exists
    const tenantResult = await this.db
      .select()
      .from(tenants)
      .where(eq(tenants.id, input.tenantId))
      .limit(1);

    if (!tenantResult[0]) {
      throw new NotFoundError('Tenant', input.tenantId);
    }

    // Check if tenant has an active license
    const licenseResult = await this.db
      .select()
      .from(tenantLicenses)
      .where(eq(tenantLicenses.tenantId, input.tenantId))
      .limit(1);

    if (!licenseResult[0]) {
      throw new BadRequestError('Tenant must have an assigned license before issuing a license code');
    }

    // Generate unique code and token
    const code = this.generateLicenseCode();
    const token = this.generateLicenseToken({
      tenantId: input.tenantId,
      codeId: code,
      issuedAt: Date.now(),
      expiresAt: input.expiresAt ? input.expiresAt.getTime() : undefined,
      type: 'license',
    });

    // Create the license code record
    const result = await this.db
      .insert(licenseCodes)
      .values({
        tenantId: input.tenantId,
        code,
        token,
        status: 'active',
        issuedAt: new Date(),
        expiresAt: input.expiresAt || null,
        metadata: input.metadata || {},
      })
      .returning();

    const licenseCode = result[0] as LicenseCode;

    // Invalidate caches
    await this.adapters?.cache?.delete(`license-codes:${input.tenantId}`);

    // Audit log
    await this.logAudit(input.tenantId, 'license_code_issued', 'license_codes', licenseCode.id, {
      codePrefix: code.substring(0, 4),
      expiresAt: input.expiresAt?.toISOString(),
      userId,
    });

    this.adapters?.log?.info('License code issued', {
      tenantId: input.tenantId,
      codeId: licenseCode.id,
    });

    return this.buildLicenseCodeProjectionDTO(licenseCode, 0);
  }

  /**
   * Find license code by code string
   */
  async findByCode(code: string): Promise<LicenseCode | null> {
    const result = await this.db
      .select()
      .from(licenseCodes)
      .where(eq(licenseCodes.code, code))
      .limit(1);

    return result[0] as LicenseCode | undefined ?? null;
  }

  /**
   * Find license code by ID
   */
  async findById(id: string): Promise<LicenseCode | null> {
    const result = await this.db
      .select()
      .from(licenseCodes)
      .where(eq(licenseCodes.id, id))
      .limit(1);

    return result[0] as LicenseCode | undefined ?? null;
  }

  /**
   * Find license code by ID or throw
   */
  async findByIdOrFail(id: string): Promise<LicenseCode> {
    const code = await this.findById(id);
    if (!code) {
      throw new NotFoundError('LicenseCode', id);
    }
    return code;
  }

  /**
   * Get all license codes for a tenant
   */
  async findByTenant(tenantId: string): Promise<LicenseCodeProjectionDTO[]> {
    // Try cache first
    const cached = await this.adapters?.cache?.get(`license-codes:${tenantId}`) as LicenseCodeProjectionDTO[] | null;
    if (cached) {
      return cached;
    }

    const codes = await this.db
      .select()
      .from(licenseCodes)
      .where(eq(licenseCodes.tenantId, tenantId))
      .orderBy(licenseCodes.issuedAt);

    // Get activation counts for each code
    const projectedCodes: LicenseCodeProjectionDTO[] = [];
    for (const code of codes) {
      const activationCount = await this.getActivationCount(code.id);
      projectedCodes.push(this.buildLicenseCodeProjectionDTO(code, activationCount));
    }

    // Cache the result
    await this.adapters?.cache?.set(`license-codes:${tenantId}`, projectedCodes, 300);

    return projectedCodes;
  }

  /**
   * Get active license codes for a tenant
   */
  async findActiveByTenant(tenantId: string): Promise<LicenseCode[]> {
    const codes = await this.db
      .select()
      .from(licenseCodes)
      .where(
        and(
          eq(licenseCodes.tenantId, tenantId),
          eq(licenseCodes.status, 'active')
        )
      );

    return codes as LicenseCode[];
  }

  /**
   * Validate a license code
   * Returns the tenant ID if valid, throws if invalid
   */
  async validateCode(input: ValidateLicenseCodeInput): Promise<{
    valid: boolean;
    tenantId: string;
    codeId: string;
    reason?: string;
  }> {
    const licenseCode = await this.findByCode(input.code);

    if (!licenseCode) {
      throw new UnauthorizedError('Invalid license code');
    }

    // Check status
    if (licenseCode.status === 'revoked') {
      return {
        valid: false,
        tenantId: licenseCode.tenantId,
        codeId: licenseCode.id,
        reason: 'License code has been revoked',
      };
    }

    if (licenseCode.status === 'rotated') {
      return {
        valid: false,
        tenantId: licenseCode.tenantId,
        codeId: licenseCode.id,
        reason: 'License code has been rotated. Please use the new code.',
      };
    }

    // Check expiry
    if (licenseCode.expiresAt && new Date(licenseCode.expiresAt) < new Date()) {
      return {
        valid: false,
        tenantId: licenseCode.tenantId,
        codeId: licenseCode.id,
        reason: 'License code has expired',
      };
    }

    return {
      valid: true,
      tenantId: licenseCode.tenantId,
      codeId: licenseCode.id,
    };
  }

  /**
   * Rotate a license code (issue new, mark old as rotated)
   */
  async rotateCode(input: RotateLicenseCodeInput, userId?: string): Promise<LicenseCodeProjectionDTO> {
    // Find the current code
    const currentLicenseCode = await this.findByCode(input.currentCode);

    if (!currentLicenseCode) {
      throw new NotFoundError('LicenseCode', input.currentCode);
    }

    // Verify tenant ownership
    if (currentLicenseCode.tenantId !== input.tenantId) {
      throw new UnauthorizedError('License code does not belong to this tenant');
    }

    // Check if code can be rotated
    if (currentLicenseCode.status !== 'active') {
      throw new BadRequestError(`Cannot rotate license code with status '${currentLicenseCode.status}'`);
    }

    // Generate new code and token
    const newCode = this.generateLicenseCode();
    const newToken = this.generateLicenseToken({
      tenantId: input.tenantId,
      codeId: newCode,
      issuedAt: Date.now(),
      expiresAt: input.expiresAt ? input.expiresAt.getTime() : undefined,
      type: 'license',
    });

    // Use transaction to ensure atomicity
    const result = await this.db.transaction(async (tx: any) => {
      // Mark old code as rotated
      await tx
        .update(licenseCodes)
        .set({ status: 'rotated' })
        .where(eq(licenseCodes.id, currentLicenseCode.id));

      // Create new code
      const newCodeResult = await tx
        .insert(licenseCodes)
        .values({
          tenantId: input.tenantId,
          code: newCode,
          token: newToken,
          status: 'active',
          issuedAt: new Date(),
          expiresAt: input.expiresAt || null,
          metadata: {
            ...input.metadata,
            rotatedFrom: currentLicenseCode.id,
          },
        })
        .returning();

      return newCodeResult[0] as LicenseCode;
    });

    // Invalidate caches
    await this.adapters?.cache?.delete(`license-codes:${input.tenantId}`);

    // Audit log
    await this.logAudit(input.tenantId, 'license_code_rotated', 'license_codes', result.id, {
      previousCodeId: currentLicenseCode.id,
      newCodePrefix: newCode.substring(0, 4),
      userId,
    });

    this.adapters?.log?.info('License code rotated', {
      tenantId: input.tenantId,
      previousCodeId: currentLicenseCode.id,
      newCodeId: result.id,
    });

    return this.buildLicenseCodeProjectionDTO(result, 0);
  }

  /**
   * Revoke a license code
   */
  async revokeCode(input: RevokeLicenseCodeInput, userId?: string): Promise<void> {
    // Find the code
    const licenseCode = await this.findByCode(input.code);

    if (!licenseCode) {
      throw new NotFoundError('LicenseCode', input.code);
    }

    // Verify tenant ownership
    if (licenseCode.tenantId !== input.tenantId) {
      throw new UnauthorizedError('License code does not belong to this tenant');
    }

    // Check if already revoked
    if (licenseCode.status === 'revoked') {
      throw new BadRequestError('License code is already revoked');
    }

    // Revoke the code
    await this.db
      .update(licenseCodes)
      .set({
        status: 'revoked',
        revokedAt: new Date(),
      })
      .where(eq(licenseCodes.id, licenseCode.id));

    // Deactivate all activations for this code
    await this.db
      .delete(activations)
      .where(eq(activations.licenseCodeId, licenseCode.id));

    // Invalidate caches
    await this.adapters?.cache?.delete(`license-codes:${input.tenantId}`);
    await this.adapters?.cache?.delete(`activations:${licenseCode.id}`);

    // Audit log
    await this.logAudit(input.tenantId, 'license_code_revoked', 'license_codes', licenseCode.id, {
      reason: input.reason,
      userId,
    });

    this.adapters?.log?.warn('License code revoked', {
      tenantId: input.tenantId,
      codeId: licenseCode.id,
      reason: input.reason,
    });
  }

  // ==========================================================================
  // Activation Methods
  // ==========================================================================

  /**
   * Create an activation record
   */
  async createActivation(input: CreateActivationInput, userId?: string): Promise<ActivationProjectionDTO> {
    // Verify license code exists and is valid
    const licenseCode = await this.findByIdOrFail(input.licenseCodeId);

    if (licenseCode.tenantId !== input.tenantId) {
      throw new UnauthorizedError('License code does not belong to this tenant');
    }

    if (licenseCode.status !== 'active') {
      throw new BadRequestError(`Cannot activate with license code status '${licenseCode.status}'`);
    }

    // Check for existing activation with same environment/app/module
    const existingActivation = await this.db
      .select()
      .from(activations)
      .where(
        and(
          eq(activations.tenantId, input.tenantId),
          eq(activations.environment, input.environment),
          eq(activations.appId, input.appId)
        )
      )
      .limit(1);

    if (existingActivation[0]) {
      // Update existing activation
      const result = await this.db
        .update(activations)
        .set({
          licenseCodeId: input.licenseCodeId,
          lastVerifiedAt: new Date(),
          metadata: input.metadata || {},
        })
        .where(eq(activations.id, existingActivation[0].id))
        .returning();

      const activation = result[0] as Activation;

      // Audit log
      await this.logAudit(input.tenantId, 'activation_updated', 'activations', activation.id, {
        environment: input.environment,
        appId: input.appId,
        moduleId: input.moduleId,
        userId,
      });

      return this.buildActivationProjectionDTO(activation);
    }

    // Create new activation
    const result = await this.db
      .insert(activations)
      .values({
        tenantId: input.tenantId,
        licenseCodeId: input.licenseCodeId,
        environment: input.environment,
        appId: input.appId,
        moduleId: input.moduleId || null,
        activatedAt: new Date(),
        lastVerifiedAt: new Date(),
        metadata: input.metadata || {},
      })
      .returning();

    const activation = result[0] as Activation;

    // Invalidate caches
    await this.adapters?.cache?.delete(`activations:${input.licenseCodeId}`);

    // Audit log
    await this.logAudit(input.tenantId, 'activation_created', 'activations', activation.id, {
      environment: input.environment,
      appId: input.appId,
      moduleId: input.moduleId,
      userId,
    });

    this.adapters?.log?.info('Activation created', {
      tenantId: input.tenantId,
      activationId: activation.id,
      environment: input.environment,
      appId: input.appId,
    });

    return this.buildActivationProjectionDTO(activation);
  }

  /**
   * Verify and update activation last verified timestamp
   */
  async verifyActivation(
    tenantId: string,
    environment: string,
    appId: string,
    moduleId?: string
  ): Promise<{ verified: boolean; activation?: ActivationProjectionDTO; reason?: string }> {
    // Find the activation
    let query = this.db
      .select()
      .from(activations)
      .where(
        and(
          eq(activations.tenantId, tenantId),
          eq(activations.environment, environment),
          eq(activations.appId, appId)
        )
      )
      .limit(1);

    const activationResults = await query;
    const activation = activationResults[0] as Activation | undefined;

    if (!activation) {
      return {
        verified: false,
        reason: 'No activation found for this environment and application',
      };
    }

    // Verify the license code is still valid
    const licenseCode = await this.findById(activation.licenseCodeId);
    if (!licenseCode || licenseCode.status !== 'active') {
      return {
        verified: false,
        reason: 'License code is no longer active',
      };
    }

    // Check expiry
    if (licenseCode.expiresAt && new Date(licenseCode.expiresAt) < new Date()) {
      return {
        verified: false,
        reason: 'License code has expired',
      };
    }

    // Update last verified timestamp
    const result = await this.db
      .update(activations)
      .set({ lastVerifiedAt: new Date() })
      .where(eq(activations.id, activation.id))
      .returning();

    return {
      verified: true,
      activation: this.buildActivationProjectionDTO(result[0] as Activation),
    };
  }

  /**
   * Get activations for a license code
   */
  async findActivationsByCode(licenseCodeId: string): Promise<ActivationProjectionDTO[]> {
    // Try cache first
    const cached = await this.adapters?.cache?.get(`activations:${licenseCodeId}`) as ActivationProjectionDTO[] | null;
    if (cached) {
      return cached;
    }

    const results = await this.db
      .select()
      .from(activations)
      .where(eq(activations.licenseCodeId, licenseCodeId))
      .orderBy(activations.activatedAt);

    const projectedActivations = (results as Activation[]).map((a) =>
      this.buildActivationProjectionDTO(a)
    );

    // Cache the result
    await this.adapters?.cache?.set(`activations:${licenseCodeId}`, projectedActivations, 300);

    return projectedActivations;
  }

  /**
   * Get activations for a tenant
   */
  async findActivationsByTenant(tenantId: string): Promise<ActivationProjectionDTO[]> {
    const results = await this.db
      .select()
      .from(activations)
      .where(eq(activations.tenantId, tenantId))
      .orderBy(activations.activatedAt);

    return (results as Activation[]).map((a) => this.buildActivationProjectionDTO(a));
  }

  /**
   * Deactivate (remove) an activation
   */
  async deactivate(activationId: string, tenantId: string, userId?: string): Promise<void> {
    const result = await this.db
      .select()
      .from(activations)
      .where(eq(activations.id, activationId))
      .limit(1);

    const activation = result[0] as Activation | undefined;

    if (!activation) {
      throw new NotFoundError('Activation', activationId);
    }

    // Verify tenant ownership
    if (activation.tenantId !== tenantId) {
      throw new UnauthorizedError('Activation does not belong to this tenant');
    }

    // Delete the activation
    await this.db.delete(activations).where(eq(activations.id, activationId));

    // Invalidate caches
    await this.adapters?.cache?.delete(`activations:${activation.licenseCodeId}`);

    // Audit log
    await this.logAudit(tenantId, 'activation_removed', 'activations', activationId, {
      environment: activation.environment,
      appId: activation.appId,
      userId,
    });

    this.adapters?.log?.info('Activation removed', {
      tenantId,
      activationId,
    });
  }

  /**
   * Get activation count for a license code
   */
  async getActivationCount(licenseCodeId: string): Promise<number> {
    const result = await this.db
      .select({ count: sql<number>`count(*)` })
      .from(activations)
      .where(eq(activations.licenseCodeId, licenseCodeId));

    return Number(result[0]?.count || 0);
  }

  // ==========================================================================
  // Token Methods
  // ==========================================================================

  /**
   * Generate a signed license token
   */
  private generateLicenseToken(payload: LicenseTokenPayload): string {
    const payloadStr = JSON.stringify(payload);
    const payloadBase64 = Buffer.from(payloadStr).toString('base64url');

    const secret = process.env.JWT_SECRET || 'default-secret-change-in-production';
    const signature = createHmac('sha256', secret)
      .update(payloadBase64)
      .digest('base64url');

    return `${payloadBase64}.${signature}`;
  }

  /**
   * Verify a license token
   */
  verifyLicenseToken(token: string): LicenseTokenPayload | null {
    try {
      const [payloadBase64, signature] = token.split('.');
      if (!payloadBase64 || !signature) {
        return null;
      }

      // Verify signature
      const secret = process.env.JWT_SECRET || 'default-secret-change-in-production';
      const expectedSignature = createHmac('sha256', secret)
        .update(payloadBase64)
        .digest('base64url');

      if (signature !== expectedSignature) {
        return null;
      }

      // Decode payload
      const payloadStr = Buffer.from(payloadBase64, 'base64url').toString();
      const payload = JSON.parse(payloadStr) as LicenseTokenPayload;

      // Check expiry
      if (payload.expiresAt && payload.expiresAt < Date.now()) {
        return null;
      }

      return payload;
    } catch {
      return null;
    }
  }

  /**
   * Get token for a license code (requires proper authorization)
   */
  async getCodeToken(codeId: string, tenantId: string): Promise<string | null> {
    const code = await this.findById(codeId);

    if (!code || code.tenantId !== tenantId) {
      return null;
    }

    return code.token;
  }

  // ==========================================================================
  // Private Helper Methods
  // ==========================================================================

  /**
   * Generate a human-readable license code (XXXX-XXXX-XXXX-XXXX format)
   */
  private generateLicenseCode(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Exclude confusing chars: 0,O,1,I
    const segments: string[] = [];

    for (let s = 0; s < 4; s++) {
      let segment = '';
      const bytes = randomBytes(4);
      for (let i = 0; i < 4; i++) {
        segment += chars[bytes[i] % chars.length];
      }
      segments.push(segment);
    }

    return segments.join('-');
  }

  /**
   * Mask a license code for display (show first and last segment)
   */
  private maskLicenseCode(code: string): string {
    const segments = code.split('-');
    if (segments.length !== 4) {
      return '****-****-****-****';
    }
    return `${segments[0]}-****-****-${segments[3]}`;
  }

  /**
   * Build license code projection DTO
   */
  private buildLicenseCodeProjectionDTO(
    code: LicenseCode,
    activationsCount: number
  ): LicenseCodeProjectionDTO {
    const now = new Date();
    const isExpired = code.expiresAt ? new Date(code.expiresAt) < now : false;
    const isRevoked = code.status === 'revoked';
    const isActive = code.status === 'active' && !isExpired;

    // Calculate days until expiry
    let daysUntilExpiry: number | null = null;
    if (code.expiresAt && !isExpired) {
      const expiryDate = new Date(code.expiresAt);
      const diffTime = expiryDate.getTime() - now.getTime();
      daysUntilExpiry = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }

    return {
      id: code.id,
      code: code.code,
      maskedCode: this.maskLicenseCode(code.code),
      status: code.status as LicenseCodeStatus,
      issuedAt: code.issuedAt.toISOString(),
      expiresAt: code.expiresAt?.toISOString() || null,
      revokedAt: code.revokedAt?.toISOString() || null,
      isExpired,
      isRevoked,
      daysUntilExpiry,
      activationsCount,
      permissions: {
        canRotate: isActive,
        canRevoke: isActive,
        canViewToken: isActive,
      },
      availableActions: [
        {
          action: 'rotate',
          label: 'Rotate Code',
          enabled: isActive,
          reason: !isActive ? 'Code is not active' : undefined,
        },
        {
          action: 'revoke',
          label: 'Revoke Code',
          enabled: isActive,
          reason: !isActive ? 'Code is not active' : undefined,
        },
        {
          action: 'copy',
          label: 'Copy Code',
          enabled: isActive,
          reason: !isActive ? 'Code is not active' : undefined,
        },
        {
          action: 'view_activations',
          label: 'View Activations',
          enabled: true,
        },
      ],
    };
  }

  /**
   * Build activation projection DTO
   */
  private buildActivationProjectionDTO(activation: Activation): ActivationProjectionDTO {
    return {
      id: activation.id,
      tenantId: activation.tenantId,
      environment: activation.environment,
      appId: activation.appId,
      moduleId: activation.moduleId,
      activatedAt: activation.activatedAt.toISOString(),
      lastVerifiedAt: activation.lastVerifiedAt?.toISOString() || null,
      isActive: true,
      permissions: {
        canDeactivate: true,
      },
    };
  }

  /**
   * Log audit event
   */
  private async logAudit(
    tenantId: string | null,
    action: string,
    resource: string,
    resourceId: string | null,
    metadata: Record<string, unknown>
  ): Promise<void> {
    try {
      if (this.adapters?.audit) {
        await this.adapters.audit.log({
          tenantId,
          action,
          resource,
          resourceId,
          metadata,
          timestamp: new Date(),
        });
      }
    } catch (error) {
      // Log but don't throw - audit failure shouldn't break the operation
      this.adapters?.log?.error('Failed to log audit event', {
        tenantId,
        action,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
}
