/**
 * Secrets Provider Interface
 * 
 * Abstraction layer for secret storage backends.
 * Supports multiple providers: local encryption, Azure Key Vault, AWS Secrets Manager, etc.
 */

/**
 * Secret metadata
 */
export interface SecretMetadata {
  name: string;
  version?: string;
  createdAt?: Date;
  updatedAt?: Date;
  expiresAt?: Date;
  contentType?: string;
  tags?: Record<string, string>;
  enabled?: boolean;
}

/**
 * Secret with value
 */
export interface Secret extends SecretMetadata {
  value: string;
}

/**
 * Input for creating/updating a secret
 */
export interface SecretInput {
  name: string;
  value: string;
  expiresAt?: Date;
  contentType?: string;
  tags?: Record<string, string>;
}

/**
 * Secret provider configuration
 */
export interface SecretsProviderConfig {
  provider: 'local' | 'azure-keyvault' | 'aws-secrets-manager' | 'hashicorp-vault';
  
  // Azure Key Vault specific
  azureKeyVaultUrl?: string;
  azureTenantId?: string;
  azureClientId?: string;
  azureClientSecret?: string;
  
  // AWS Secrets Manager specific
  awsRegion?: string;
  awsAccessKeyId?: string;
  awsSecretAccessKey?: string;
  
  // HashiCorp Vault specific
  vaultUrl?: string;
  vaultToken?: string;
  vaultNamespace?: string;
  
  // Local encryption specific
  encryptionKey?: string;
}

/**
 * Abstract secrets provider interface
 */
export interface ISecretsProvider {
  /**
   * Get a secret by name
   */
  getSecret(name: string): Promise<Secret | null>;
  
  /**
   * Set a secret (create or update)
   */
  setSecret(input: SecretInput): Promise<SecretMetadata>;
  
  /**
   * Delete a secret
   */
  deleteSecret(name: string): Promise<boolean>;
  
  /**
   * List all secrets (metadata only, no values)
   */
  listSecrets(prefix?: string): Promise<SecretMetadata[]>;
  
  /**
   * Check if a secret exists
   */
  exists(name: string): Promise<boolean>;
  
  /**
   * Get provider name
   */
  getProviderName(): string;
  
  /**
   * Health check
   */
  healthCheck(): Promise<boolean>;
}

/**
 * Secret name builder for integration credentials
 */
export function buildSecretName(
  tenantId: string,
  integrationProvider: string,
  credentialType: string,
  credentialName: string
): string {
  // Format: digilist/{tenantId}/{provider}/{type}/{name}
  return `digilist/${tenantId}/${integrationProvider}/${credentialType}/${credentialName}`
    .toLowerCase()
    .replace(/[^a-z0-9\-\/]/g, '-');
}

/**
 * Parse a secret name back to components
 */
export function parseSecretName(secretName: string): {
  tenantId: string;
  integrationProvider: string;
  credentialType: string;
  credentialName: string;
} | null {
  const parts = secretName.split('/');
  if (parts.length !== 5 || parts[0] !== 'digilist') {
    return null;
  }
  
  return {
    tenantId: parts[1],
    integrationProvider: parts[2],
    credentialType: parts[3],
    credentialName: parts[4],
  };
}

export default ISecretsProvider;
