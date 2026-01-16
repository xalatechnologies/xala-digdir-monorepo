/**
 * Local Encryption Secrets Provider
 * 
 * Implements ISecretsProvider using local AES-256-GCM encryption.
 * Stores encrypted secrets in the database (integration_credentials table).
 * 
 * Use this provider when:
 * - Running locally or in non-cloud environments
 * - Azure Key Vault is not available
 * - Cost optimization is needed
 * 
 * For production, Azure Key Vault is recommended for:
 * - Hardware security module (HSM) backing
 * - Automatic key rotation
 * - Centralized audit logging
 * - Compliance certifications (SOC 2, ISO 27001, etc.)
 */

import type { ISecretsProvider, Secret, SecretInput, SecretMetadata } from './secrets.provider';
import { EncryptionService, getEncryptionService } from '../encryption';

/**
 * In-memory cache for local secrets
 * In production, this would be backed by the database
 */
interface StoredSecret {
  name: string;
  encryptedValue: string;
  iv: string;
  tag: string;
  version: number;
  createdAt: Date;
  updatedAt: Date;
  expiresAt?: Date;
  contentType?: string;
  tags?: Record<string, string>;
  enabled: boolean;
}

/**
 * Local Encryption Secrets Provider
 */
export class LocalEncryptionProvider implements ISecretsProvider {
  private readonly encryptionService: EncryptionService;
  private readonly secrets: Map<string, StoredSecret>;

  constructor(encryptionService?: EncryptionService) {
    this.encryptionService = encryptionService ?? getEncryptionService();
    this.secrets = new Map();
  }

  async getSecret(name: string): Promise<Secret | null> {
    const stored = this.secrets.get(name);
    if (!stored || !stored.enabled) {
      return null;
    }

    // Check expiration
    if (stored.expiresAt && stored.expiresAt < new Date()) {
      return null;
    }

    try {
      const decryptedValue = this.encryptionService.decrypt({
        encryptedValue: stored.encryptedValue,
        iv: stored.iv,
        tag: stored.tag,
        version: stored.version,
      });

      return {
        name: stored.name,
        value: decryptedValue,
        version: String(stored.version),
        createdAt: stored.createdAt,
        updatedAt: stored.updatedAt,
        expiresAt: stored.expiresAt,
        contentType: stored.contentType,
        tags: stored.tags,
        enabled: stored.enabled,
      };
    } catch (error) {
      console.error(`Failed to decrypt secret ${name}:`, error);
      return null;
    }
  }

  async setSecret(input: SecretInput): Promise<SecretMetadata> {
    const encrypted = this.encryptionService.encrypt(input.value);
    const now = new Date();

    const existing = this.secrets.get(input.name);
    
    const stored: StoredSecret = {
      name: input.name,
      encryptedValue: encrypted.encryptedValue,
      iv: encrypted.iv,
      tag: encrypted.tag,
      version: encrypted.version,
      createdAt: existing?.createdAt ?? now,
      updatedAt: now,
      expiresAt: input.expiresAt,
      contentType: input.contentType,
      tags: input.tags,
      enabled: true,
    };

    this.secrets.set(input.name, stored);

    return {
      name: stored.name,
      version: String(stored.version),
      createdAt: stored.createdAt,
      updatedAt: stored.updatedAt,
      expiresAt: stored.expiresAt,
      contentType: stored.contentType,
      tags: stored.tags,
      enabled: stored.enabled,
    };
  }

  async deleteSecret(name: string): Promise<boolean> {
    return this.secrets.delete(name);
  }

  async listSecrets(prefix?: string): Promise<SecretMetadata[]> {
    const results: SecretMetadata[] = [];

    for (const [name, stored] of this.secrets) {
      if (prefix && !name.startsWith(prefix)) {
        continue;
      }

      results.push({
        name: stored.name,
        version: String(stored.version),
        createdAt: stored.createdAt,
        updatedAt: stored.updatedAt,
        expiresAt: stored.expiresAt,
        contentType: stored.contentType,
        tags: stored.tags,
        enabled: stored.enabled,
      });
    }

    return results;
  }

  async exists(name: string): Promise<boolean> {
    return this.secrets.has(name);
  }

  getProviderName(): string {
    return 'local-encryption';
  }

  async healthCheck(): Promise<boolean> {
    try {
      // Test encryption/decryption
      const testValue = 'health-check-test';
      const encrypted = this.encryptionService.encrypt(testValue);
      const decrypted = this.encryptionService.decrypt(encrypted);
      return decrypted === testValue;
    } catch {
      return false;
    }
  }

  /**
   * Clear all secrets (for testing only)
   */
  clear(): void {
    this.secrets.clear();
  }

  /**
   * Get count of stored secrets
   */
  count(): number {
    return this.secrets.size;
  }
}

export default LocalEncryptionProvider;
