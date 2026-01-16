/**
 * Encryption Service
 * 
 * Provides AES-256-GCM encryption for sensitive data like API keys,
 * client secrets, and certificates.
 * 
 * Security considerations:
 * - Uses AES-256-GCM for authenticated encryption
 * - Each encryption operation uses a unique IV
 * - Key is derived from environment variable
 * - Supports key rotation via encryption version
 */

import { createCipheriv, createDecipheriv, randomBytes, scryptSync } from 'crypto';

/**
 * Encryption algorithm configuration
 */
const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12; // 96 bits for GCM
const KEY_LENGTH = 32; // 256 bits for AES-256

/**
 * Encrypted data structure
 */
export interface EncryptedData {
  /** Base64-encoded encrypted value */
  encryptedValue: string;
  /** Hex-encoded initialization vector */
  iv: string;
  /** Hex-encoded authentication tag */
  tag: string;
  /** Encryption version for key rotation */
  version: number;
}

/**
 * Decryption input structure
 */
export interface DecryptionInput {
  encryptedValue: string;
  iv: string;
  tag: string;
  version?: number;
}

/**
 * Encryption service configuration
 */
interface EncryptionConfig {
  /** Master encryption key from environment */
  masterKey: string;
  /** Current encryption version */
  currentVersion: number;
  /** Previous keys for decryption during rotation */
  previousKeys?: Map<number, string>;
}

/**
 * EncryptionService
 * 
 * Handles encryption and decryption of sensitive integration credentials.
 * Uses AES-256-GCM for authenticated encryption.
 */
export class EncryptionService {
  private readonly config: EncryptionConfig;
  private readonly derivedKeys: Map<number, Buffer>;

  constructor(config?: Partial<EncryptionConfig>) {
    const masterKey = config?.masterKey ?? process.env.INTEGRATION_ENCRYPTION_KEY;
    
    if (!masterKey) {
      throw new Error(
        'INTEGRATION_ENCRYPTION_KEY environment variable is required for credential encryption'
      );
    }

    if (masterKey.length < 32) {
      throw new Error(
        'INTEGRATION_ENCRYPTION_KEY must be at least 32 characters long'
      );
    }

    this.config = {
      masterKey,
      currentVersion: config?.currentVersion ?? 1,
      previousKeys: config?.previousKeys ?? new Map(),
    };

    this.derivedKeys = new Map();
    this.deriveKey(this.config.currentVersion, this.config.masterKey);
  }

  /**
   * Derive an encryption key from the master key using scrypt
   */
  private deriveKey(version: number, masterKey: string): Buffer {
    if (this.derivedKeys.has(version)) {
      return this.derivedKeys.get(version)!;
    }

    // Use version as part of salt for key separation
    const salt = Buffer.from(`digilist-integration-v${version}`, 'utf8');
    const derivedKey = scryptSync(masterKey, salt, KEY_LENGTH);
    
    this.derivedKeys.set(version, derivedKey);
    return derivedKey;
  }

  /**
   * Get the encryption key for a specific version
   */
  private getKeyForVersion(version: number): Buffer {
    if (this.derivedKeys.has(version)) {
      return this.derivedKeys.get(version)!;
    }

    // Check if we have a previous key for this version
    const previousKey = this.config.previousKeys?.get(version);
    if (previousKey) {
      return this.deriveKey(version, previousKey);
    }

    // Fall back to current master key (for same-version decryption)
    return this.deriveKey(version, this.config.masterKey);
  }

  /**
   * Encrypt a plaintext value
   * 
   * @param plaintext - The value to encrypt
   * @returns Encrypted data with IV and auth tag
   */
  encrypt(plaintext: string): EncryptedData {
    if (!plaintext) {
      throw new Error('Cannot encrypt empty value');
    }

    const key = this.getKeyForVersion(this.config.currentVersion);
    const iv = randomBytes(IV_LENGTH);
    
    const cipher = createCipheriv(ALGORITHM, key, iv);
    
    let encrypted = cipher.update(plaintext, 'utf8', 'base64');
    encrypted += cipher.final('base64');
    
    const tag = cipher.getAuthTag();

    return {
      encryptedValue: encrypted,
      iv: iv.toString('hex'),
      tag: tag.toString('hex'),
      version: this.config.currentVersion,
    };
  }

  /**
   * Decrypt an encrypted value
   * 
   * @param input - The encrypted data with IV and auth tag
   * @returns Decrypted plaintext
   */
  decrypt(input: DecryptionInput): string {
    const version = input.version ?? this.config.currentVersion;
    const key = this.getKeyForVersion(version);
    
    const iv = Buffer.from(input.iv, 'hex');
    const tag = Buffer.from(input.tag, 'hex');
    
    const decipher = createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(tag);
    
    let decrypted = decipher.update(input.encryptedValue, 'base64', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  }

  /**
   * Re-encrypt a value with the current encryption version
   * Used during key rotation
   * 
   * @param input - The encrypted data to re-encrypt
   * @returns Newly encrypted data with current version
   */
  reencrypt(input: DecryptionInput): EncryptedData {
    const plaintext = this.decrypt(input);
    return this.encrypt(plaintext);
  }

  /**
   * Validate that a value can be decrypted
   * 
   * @param input - The encrypted data to validate
   * @returns True if decryption succeeds
   */
  validate(input: DecryptionInput): boolean {
    try {
      this.decrypt(input);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get the current encryption version
   */
  getCurrentVersion(): number {
    return this.config.currentVersion;
  }

  /**
   * Mask a sensitive value for display (e.g., "sk_live_****abcd")
   * 
   * @param value - The value to mask
   * @param visibleChars - Number of characters to show at end
   * @returns Masked string
   */
  static mask(value: string, visibleChars: number = 4): string {
    if (!value || value.length <= visibleChars) {
      return '****';
    }
    
    const suffix = value.slice(-visibleChars);
    return `****${suffix}`;
  }

  /**
   * Generate a random API key or secret
   * 
   * @param prefix - Optional prefix (e.g., "sk_live_")
   * @param length - Length of random part in bytes
   * @returns Generated key
   */
  static generateKey(prefix: string = '', length: number = 32): string {
    const randomPart = randomBytes(length).toString('hex');
    return `${prefix}${randomPart}`;
  }
}

/**
 * Credential types for integration credentials
 */
export const CREDENTIAL_TYPES = {
  API_KEY: 'api_key',
  CLIENT_SECRET: 'client_secret',
  CLIENT_ID: 'client_id',
  CERTIFICATE: 'certificate',
  PRIVATE_KEY: 'private_key',
  OAUTH_TOKEN: 'oauth_token',
  OAUTH_REFRESH_TOKEN: 'oauth_refresh_token',
  WEBHOOK_SECRET: 'webhook_secret',
  BEARER_TOKEN: 'bearer_token',
} as const;

export type CredentialType = typeof CREDENTIAL_TYPES[keyof typeof CREDENTIAL_TYPES];

/**
 * Integration providers
 */
export const INTEGRATION_PROVIDERS = {
  IDPORTEN: 'idporten',
  VIPPS: 'vipps',
  VISMA: 'visma',
  RCO: 'rco',
  ACOS: 'acos',
  OUTLOOK: 'outlook',
  GOOGLE_CALENDAR: 'google_calendar',
  BRREG: 'brreg',
  NIF: 'nif',
} as const;

export type IntegrationProvider = typeof INTEGRATION_PROVIDERS[keyof typeof INTEGRATION_PROVIDERS];

/**
 * Credential requirements per provider
 */
export const PROVIDER_CREDENTIAL_REQUIREMENTS: Record<IntegrationProvider, CredentialType[]> = {
  [INTEGRATION_PROVIDERS.IDPORTEN]: ['client_id', 'client_secret', 'certificate'],
  [INTEGRATION_PROVIDERS.VIPPS]: ['client_id', 'client_secret', 'api_key'],
  [INTEGRATION_PROVIDERS.VISMA]: ['api_key', 'client_secret'],
  [INTEGRATION_PROVIDERS.RCO]: ['api_key', 'client_secret'],
  [INTEGRATION_PROVIDERS.ACOS]: ['api_key', 'certificate'],
  [INTEGRATION_PROVIDERS.OUTLOOK]: ['client_id', 'client_secret', 'oauth_refresh_token'],
  [INTEGRATION_PROVIDERS.GOOGLE_CALENDAR]: ['client_id', 'client_secret', 'oauth_refresh_token'],
  [INTEGRATION_PROVIDERS.BRREG]: [], // Public API, no credentials needed
  [INTEGRATION_PROVIDERS.NIF]: ['api_key'],
};

// Export singleton instance
let encryptionServiceInstance: EncryptionService | null = null;

export function getEncryptionService(): EncryptionService {
  if (!encryptionServiceInstance) {
    encryptionServiceInstance = new EncryptionService();
  }
  return encryptionServiceInstance;
}

export default EncryptionService;
