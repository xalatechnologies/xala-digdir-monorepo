/**
 * Integration Credentials Repository
 * 
 * Handles encrypted storage and retrieval of integration credentials.
 * All sensitive values are encrypted before storage and decrypted on retrieval.
 */

import { eq, and } from 'drizzle-orm';
import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import {
  integrationCredentials,
  integrationAuditLogs,
  type IntegrationCredential,
  type NewIntegrationCredential,
} from '../../database/schema';
import {
  EncryptionService,
  getEncryptionService,
  type CredentialType,
} from '../../core/encryption';

/**
 * Input for creating a new credential
 */
export interface CreateCredentialInput {
  tenantId: string;
  integrationId: string;
  credentialType: CredentialType;
  name: string;
  value: string; // Plaintext value to encrypt
  expiresAt?: Date;
  metadata?: Record<string, unknown>;
  createdBy?: string;
}

/**
 * Input for updating a credential
 */
export interface UpdateCredentialInput {
  value?: string; // New plaintext value to encrypt
  name?: string;
  expiresAt?: Date | null;
  isActive?: boolean;
  metadata?: Record<string, unknown>;
  updatedBy?: string;
}

/**
 * Credential with decrypted value (only returned when explicitly requested)
 */
export interface DecryptedCredential {
  id: string;
  tenantId: string;
  integrationId: string;
  credentialType: string;
  name: string;
  value: string; // Decrypted plaintext value
  expiresAt: Date | null;
  lastUsedAt: Date | null;
  lastRotatedAt: Date | null;
  isActive: boolean;
  metadata: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Credential without the sensitive value (safe to expose)
 */
export interface CredentialInfo {
  id: string;
  tenantId: string;
  integrationId: string;
  credentialType: string;
  name: string;
  maskedValue: string; // e.g., "****abcd"
  expiresAt: Date | null;
  lastUsedAt: Date | null;
  lastRotatedAt: Date | null;
  isActive: boolean;
  isExpired: boolean;
  metadata: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Audit log input
 */
interface AuditLogInput {
  tenantId: string;
  integrationId?: string;
  credentialId?: string;
  action: string;
  actorId?: string;
  actorEmail?: string;
  actorIp?: string;
  userAgent?: string;
  success: boolean;
  errorMessage?: string;
  context?: Record<string, unknown>;
}

export class IntegrationCredentialsRepository {
  private readonly encryptionService: EncryptionService;

  constructor(
    private readonly db: PostgresJsDatabase,
    encryptionService?: EncryptionService
  ) {
    this.encryptionService = encryptionService ?? getEncryptionService();
  }

  /**
   * Create a new encrypted credential
   */
  async create(input: CreateCredentialInput): Promise<CredentialInfo> {
    const encrypted = this.encryptionService.encrypt(input.value);

    const [credential] = await this.db
      .insert(integrationCredentials)
      .values({
        tenantId: input.tenantId,
        integrationId: input.integrationId,
        credentialType: input.credentialType,
        name: input.name,
        encryptedValue: encrypted.encryptedValue,
        encryptionIv: encrypted.iv,
        encryptionTag: encrypted.tag,
        encryptionVersion: encrypted.version,
        expiresAt: input.expiresAt,
        metadata: input.metadata ?? {},
        createdBy: input.createdBy,
        updatedBy: input.createdBy,
      })
      .returning();

    await this.logAudit({
      tenantId: input.tenantId,
      integrationId: input.integrationId,
      credentialId: credential.id,
      action: 'create',
      actorId: input.createdBy,
      success: true,
      context: { credentialType: input.credentialType, name: input.name },
    });

    return this.toCredentialInfo(credential, input.value);
  }

  /**
   * Update an existing credential
   */
  async update(
    id: string,
    tenantId: string,
    input: UpdateCredentialInput
  ): Promise<CredentialInfo | null> {
    const existing = await this.findById(id, tenantId);
    if (!existing) {
      return null;
    }

    const updateData: Partial<NewIntegrationCredential> = {
      updatedAt: new Date(),
      updatedBy: input.updatedBy,
    };

    if (input.name !== undefined) {
      updateData.name = input.name;
    }

    if (input.expiresAt !== undefined) {
      updateData.expiresAt = input.expiresAt;
    }

    if (input.isActive !== undefined) {
      updateData.isActive = input.isActive;
    }

    if (input.metadata !== undefined) {
      updateData.metadata = input.metadata;
    }

    let newValue: string | undefined;
    if (input.value !== undefined) {
      const encrypted = this.encryptionService.encrypt(input.value);
      updateData.encryptedValue = encrypted.encryptedValue;
      updateData.encryptionIv = encrypted.iv;
      updateData.encryptionTag = encrypted.tag;
      updateData.encryptionVersion = encrypted.version;
      updateData.lastRotatedAt = new Date();
      newValue = input.value;
    }

    const [updated] = await this.db
      .update(integrationCredentials)
      .set(updateData)
      .where(
        and(
          eq(integrationCredentials.id, id),
          eq(integrationCredentials.tenantId, tenantId)
        )
      )
      .returning();

    await this.logAudit({
      tenantId,
      integrationId: updated.integrationId,
      credentialId: id,
      action: input.value ? 'rotate' : 'update',
      actorId: input.updatedBy,
      success: true,
      context: { fieldsUpdated: Object.keys(input) },
    });

    return this.toCredentialInfo(updated, newValue);
  }

  /**
   * Delete a credential
   */
  async delete(id: string, tenantId: string, actorId?: string): Promise<boolean> {
    const existing = await this.findById(id, tenantId);
    if (!existing) {
      return false;
    }

    await this.db
      .delete(integrationCredentials)
      .where(
        and(
          eq(integrationCredentials.id, id),
          eq(integrationCredentials.tenantId, tenantId)
        )
      );

    await this.logAudit({
      tenantId,
      integrationId: existing.integrationId,
      credentialId: id,
      action: 'delete',
      actorId,
      success: true,
    });

    return true;
  }

  /**
   * Find a credential by ID (without decryption)
   */
  async findById(id: string, tenantId: string): Promise<IntegrationCredential | null> {
    const [credential] = await this.db
      .select()
      .from(integrationCredentials)
      .where(
        and(
          eq(integrationCredentials.id, id),
          eq(integrationCredentials.tenantId, tenantId)
        )
      );

    return credential ?? null;
  }

  /**
   * Get credential info (without decrypted value)
   */
  async getInfo(id: string, tenantId: string): Promise<CredentialInfo | null> {
    const credential = await this.findById(id, tenantId);
    if (!credential) {
      return null;
    }

    return this.toCredentialInfo(credential);
  }

  /**
   * Get decrypted credential value
   * This logs the access for security audit
   */
  async getDecryptedValue(
    id: string,
    tenantId: string,
    actorId?: string,
    actorIp?: string
  ): Promise<DecryptedCredential | null> {
    const credential = await this.findById(id, tenantId);
    if (!credential) {
      return null;
    }

    try {
      const decryptedValue = this.encryptionService.decrypt({
        encryptedValue: credential.encryptedValue,
        iv: credential.encryptionIv,
        tag: credential.encryptionTag,
        version: credential.encryptionVersion,
      });

      // Update last used timestamp
      await this.db
        .update(integrationCredentials)
        .set({ lastUsedAt: new Date() })
        .where(eq(integrationCredentials.id, id));

      await this.logAudit({
        tenantId,
        integrationId: credential.integrationId,
        credentialId: id,
        action: 'read',
        actorId,
        actorIp,
        success: true,
      });

      return {
        id: credential.id,
        tenantId: credential.tenantId,
        integrationId: credential.integrationId,
        credentialType: credential.credentialType,
        name: credential.name,
        value: decryptedValue,
        expiresAt: credential.expiresAt,
        lastUsedAt: credential.lastUsedAt,
        lastRotatedAt: credential.lastRotatedAt,
        isActive: credential.isActive,
        metadata: credential.metadata as Record<string, unknown>,
        createdAt: credential.createdAt,
        updatedAt: credential.updatedAt,
      };
    } catch (error) {
      await this.logAudit({
        tenantId,
        integrationId: credential.integrationId,
        credentialId: id,
        action: 'read',
        actorId,
        actorIp,
        success: false,
        errorMessage: error instanceof Error ? error.message : 'Decryption failed',
      });
      throw error;
    }
  }

  /**
   * List all credentials for an integration (without decrypted values)
   */
  async listByIntegration(
    integrationId: string,
    tenantId: string
  ): Promise<CredentialInfo[]> {
    const credentials = await this.db
      .select()
      .from(integrationCredentials)
      .where(
        and(
          eq(integrationCredentials.integrationId, integrationId),
          eq(integrationCredentials.tenantId, tenantId)
        )
      );

    return credentials.map(c => this.toCredentialInfo(c));
  }

  /**
   * List all credentials for a tenant (without decrypted values)
   */
  async listByTenant(tenantId: string): Promise<CredentialInfo[]> {
    const credentials = await this.db
      .select()
      .from(integrationCredentials)
      .where(eq(integrationCredentials.tenantId, tenantId));

    return credentials.map(c => this.toCredentialInfo(c));
  }

  /**
   * Check if a credential exists
   */
  async exists(
    integrationId: string,
    credentialType: CredentialType,
    name: string,
    tenantId: string
  ): Promise<boolean> {
    const [credential] = await this.db
      .select({ id: integrationCredentials.id })
      .from(integrationCredentials)
      .where(
        and(
          eq(integrationCredentials.integrationId, integrationId),
          eq(integrationCredentials.credentialType, credentialType),
          eq(integrationCredentials.name, name),
          eq(integrationCredentials.tenantId, tenantId)
        )
      );

    return !!credential;
  }

  /**
   * Convert database row to CredentialInfo (without sensitive data)
   */
  private toCredentialInfo(
    credential: IntegrationCredential,
    plaintextValue?: string
  ): CredentialInfo {
    // Generate masked value
    let maskedValue = '****';
    if (plaintextValue) {
      maskedValue = EncryptionService.mask(plaintextValue);
    }

    const now = new Date();
    const isExpired = credential.expiresAt ? credential.expiresAt < now : false;

    return {
      id: credential.id,
      tenantId: credential.tenantId,
      integrationId: credential.integrationId,
      credentialType: credential.credentialType,
      name: credential.name,
      maskedValue,
      expiresAt: credential.expiresAt,
      lastUsedAt: credential.lastUsedAt,
      lastRotatedAt: credential.lastRotatedAt,
      isActive: credential.isActive,
      isExpired,
      metadata: credential.metadata as Record<string, unknown>,
      createdAt: credential.createdAt,
      updatedAt: credential.updatedAt,
    };
  }

  /**
   * Log an audit entry
   */
  private async logAudit(input: AuditLogInput): Promise<void> {
    try {
      await this.db.insert(integrationAuditLogs).values({
        tenantId: input.tenantId,
        integrationId: input.integrationId,
        credentialId: input.credentialId,
        action: input.action,
        actorId: input.actorId,
        actorEmail: input.actorEmail,
        actorIp: input.actorIp,
        userAgent: input.userAgent,
        success: input.success,
        errorMessage: input.errorMessage,
        context: input.context ?? {},
      });
    } catch (error) {
      // Log but don't fail the operation if audit logging fails
      console.error('Failed to log integration audit:', error);
    }
  }
}

export default IntegrationCredentialsRepository;
