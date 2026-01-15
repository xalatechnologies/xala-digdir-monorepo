/**
 * Secrets Module
 * 
 * Provides a unified interface for secret management across different backends:
 * - Local encryption (AES-256-GCM)
 * - Azure Key Vault
 * - AWS Secrets Manager (planned)
 * - HashiCorp Vault (planned)
 * 
 * Usage:
 * ```typescript
 * import { getSecretsProvider, buildSecretName } from '@api/core/secrets';
 * 
 * const provider = await getSecretsProvider();
 * 
 * // Store a secret
 * const secretName = buildSecretName(tenantId, 'vipps', 'api_key', 'production');
 * await provider.setSecret({ name: secretName, value: 'sk_live_xxx' });
 * 
 * // Retrieve a secret
 * const secret = await provider.getSecret(secretName);
 * console.log(secret?.value);
 * ```
 * 
 * Configuration:
 * - SECRETS_PROVIDER: 'local' | 'azure-keyvault' | 'aws-secrets-manager' | 'hashicorp-vault'
 * - INTEGRATION_ENCRYPTION_KEY: Required for local encryption (min 32 chars)
 * - AZURE_KEYVAULT_URL: Required for Azure Key Vault
 * - AZURE_TENANT_ID, AZURE_CLIENT_ID, AZURE_CLIENT_SECRET: For Azure service principal auth
 */

export type {
  ISecretsProvider,
  Secret,
  SecretInput,
  SecretMetadata,
  SecretsProviderConfig,
} from './secrets.provider';

export {
  buildSecretName,
  parseSecretName,
} from './secrets.provider';

export {
  createSecretsProvider,
  getSecretsProvider,
  resetSecretsProvider,
  getConfiguredProvider,
  type SecretsProviderType,
} from './secrets.factory';

export { LocalEncryptionProvider } from './local-encryption.provider';
export { AzureKeyVaultProvider } from './azure-keyvault.provider';
export { CloudflareSecretsProvider } from './cloudflare.provider';
