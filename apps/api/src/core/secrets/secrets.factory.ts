/**
 * Secrets Provider Factory
 * 
 * Creates the appropriate secrets provider based on environment configuration.
 * Supports multiple backends for flexibility in different deployment environments.
 */

import type { ISecretsProvider, SecretsProviderConfig } from './secrets.provider';
import { LocalEncryptionProvider } from './local-encryption.provider';

/**
 * Provider types
 */
export type SecretsProviderType = 'local' | 'azure-keyvault' | 'aws-secrets-manager' | 'hashicorp-vault';

/**
 * Create a secrets provider based on configuration
 */
export async function createSecretsProvider(
  config?: Partial<SecretsProviderConfig>
): Promise<ISecretsProvider> {
  const providerType = config?.provider ?? getProviderFromEnv();

  switch (providerType) {
    case 'azure-keyvault':
      return createAzureKeyVaultProvider(config);

    case 'aws-secrets-manager':
      throw new Error('AWS Secrets Manager provider is not yet implemented');

    case 'hashicorp-vault':
      throw new Error('HashiCorp Vault provider is not yet implemented');

    case 'local':
    default:
      return new LocalEncryptionProvider();
  }
}

/**
 * Determine provider from environment variables
 */
function getProviderFromEnv(): SecretsProviderType {
  // Check for Azure Key Vault
  if (process.env.AZURE_KEYVAULT_URL) {
    return 'azure-keyvault';
  }

  // Check for AWS Secrets Manager
  if (process.env.AWS_SECRETS_MANAGER_REGION) {
    return 'aws-secrets-manager';
  }

  // Check for HashiCorp Vault
  if (process.env.VAULT_ADDR) {
    return 'hashicorp-vault';
  }

  // Default to local encryption
  return 'local';
}

/**
 * Create Azure Key Vault provider with dynamic import
 */
async function createAzureKeyVaultProvider(
  config?: Partial<SecretsProviderConfig>
): Promise<ISecretsProvider> {
  try {
    const { AzureKeyVaultProvider } = await import('./azure-keyvault.provider');
    return new AzureKeyVaultProvider({
      vaultUrl: config?.azureKeyVaultUrl,
      tenantId: config?.azureTenantId,
      clientId: config?.azureClientId,
      clientSecret: config?.azureClientSecret,
    });
  } catch (error) {
    console.error('Failed to create Azure Key Vault provider:', error);
    console.warn('Falling back to local encryption provider');
    return new LocalEncryptionProvider();
  }
}

/**
 * Singleton instance holder
 */
let secretsProviderInstance: ISecretsProvider | null = null;

/**
 * Get or create the singleton secrets provider
 */
export async function getSecretsProvider(): Promise<ISecretsProvider> {
  if (!secretsProviderInstance) {
    secretsProviderInstance = await createSecretsProvider();
  }
  return secretsProviderInstance;
}

/**
 * Reset the singleton (for testing)
 */
export function resetSecretsProvider(): void {
  secretsProviderInstance = null;
}

/**
 * Check which provider is currently configured
 */
export function getConfiguredProvider(): SecretsProviderType {
  return getProviderFromEnv();
}

export default createSecretsProvider;
