/**
 * Azure Key Vault Secrets Provider
 * 
 * Implements ISecretsProvider using Azure Key Vault for enterprise-grade secret management.
 * 
 * Features:
 * - Managed identity support (recommended for Azure-hosted apps)
 * - Service principal authentication for local development
 * - Automatic secret versioning
 * - Soft-delete and purge protection support
 * 
 * Required environment variables:
 * - AZURE_KEYVAULT_URL: https://<vault-name>.vault.azure.net
 * - AZURE_TENANT_ID: Azure AD tenant ID
 * - AZURE_CLIENT_ID: Service principal client ID
 * - AZURE_CLIENT_SECRET: Service principal secret (not needed with managed identity)
 */

import type { ISecretsProvider, Secret, SecretInput, SecretMetadata } from './secrets.provider';

/**
 * Azure Key Vault configuration
 */
interface AzureKeyVaultConfig {
  vaultUrl: string;
  tenantId?: string;
  clientId?: string;
  clientSecret?: string;
  useManagedIdentity?: boolean;
}

/**
 * Azure Key Vault Secrets Provider
 * 
 * Note: This implementation uses dynamic imports to avoid requiring
 * @azure/identity and @azure/keyvault-secrets as hard dependencies.
 * Install them when using this provider:
 *   pnpm add @azure/identity @azure/keyvault-secrets
 */
/* eslint-disable @typescript-eslint/no-explicit-any */
// Note: Azure SDK types are loaded dynamically - use 'any' for client
export class AzureKeyVaultProvider implements ISecretsProvider {
  private readonly config: AzureKeyVaultConfig;
  private client: any = null;
  private initialized = false;

  constructor(config?: Partial<AzureKeyVaultConfig>) {
    this.config = {
      vaultUrl: config?.vaultUrl ?? process.env.AZURE_KEYVAULT_URL ?? '',
      tenantId: config?.tenantId ?? process.env.AZURE_TENANT_ID,
      clientId: config?.clientId ?? process.env.AZURE_CLIENT_ID,
      clientSecret: config?.clientSecret ?? process.env.AZURE_CLIENT_SECRET,
      useManagedIdentity: config?.useManagedIdentity ?? !process.env.AZURE_CLIENT_SECRET,
    };

    if (!this.config.vaultUrl) {
      throw new Error('AZURE_KEYVAULT_URL is required for Azure Key Vault provider');
    }
  }

  /**
   * Initialize the Azure SDK client lazily
   */
  private async ensureInitialized(): Promise<void> {
    if (this.initialized) return;

    try {
      // Dynamic imports to avoid hard dependency
      const { DefaultAzureCredential, ClientSecretCredential } = await import('@azure/identity');
      const { SecretClient } = await import('@azure/keyvault-secrets');

      let credential;
      if (this.config.useManagedIdentity) {
        // Use managed identity (recommended for Azure-hosted apps)
        credential = new DefaultAzureCredential();
      } else if (this.config.tenantId && this.config.clientId && this.config.clientSecret) {
        // Use service principal for local development
        credential = new ClientSecretCredential(
          this.config.tenantId,
          this.config.clientId,
          this.config.clientSecret
        );
      } else {
        // Fall back to default credential chain
        credential = new DefaultAzureCredential();
      }

      this.client = new SecretClient(this.config.vaultUrl, credential);
      this.initialized = true;
    } catch (error) {
      throw new Error(
        `Failed to initialize Azure Key Vault client. Ensure @azure/identity and @azure/keyvault-secrets are installed. Error: ${error}`
      );
    }
  }

  /**
   * Convert Azure secret name to Key Vault compatible format
   * Key Vault names: alphanumeric and hyphens only, max 127 chars
   */
  private toVaultName(name: string): string {
    return name
      .replace(/\//g, '--') // Replace slashes with double hyphens
      .replace(/[^a-zA-Z0-9\-]/g, '-') // Replace other special chars
      .substring(0, 127);
  }

  /**
   * Convert Key Vault name back to original format
   */
  private fromVaultName(vaultName: string): string {
    return vaultName.replace(/--/g, '/');
  }

  async getSecret(name: string): Promise<Secret | null> {
    await this.ensureInitialized();

    try {
      const vaultName = this.toVaultName(name);
      const secret = await this.client.getSecret(vaultName);

      if (!secret.value) {
        return null;
      }

      return {
        name,
        value: secret.value,
        version: secret.properties.version,
        createdAt: secret.properties.createdOn,
        updatedAt: secret.properties.updatedOn,
        expiresAt: secret.properties.expiresOn,
        contentType: secret.properties.contentType,
        tags: secret.properties.tags,
        enabled: secret.properties.enabled,
      };
    } catch (error: any) {
      if (error.code === 'SecretNotFound' || error.statusCode === 404) {
        return null;
      }
      throw error;
    }
  }

  async setSecret(input: SecretInput): Promise<SecretMetadata> {
    await this.ensureInitialized();

    const vaultName = this.toVaultName(input.name);
    
    const secret = await this.client.setSecret(vaultName, input.value, {
      expiresOn: input.expiresAt,
      contentType: input.contentType,
      tags: input.tags,
    });

    return {
      name: input.name,
      version: secret.properties.version,
      createdAt: secret.properties.createdOn,
      updatedAt: secret.properties.updatedOn,
      expiresAt: secret.properties.expiresOn,
      contentType: secret.properties.contentType,
      tags: secret.properties.tags,
      enabled: secret.properties.enabled,
    };
  }

  async deleteSecret(name: string): Promise<boolean> {
    await this.ensureInitialized();

    try {
      const vaultName = this.toVaultName(name);
      
      // Begin delete operation (soft delete)
      const poller = await this.client.beginDeleteSecret(vaultName);
      await poller.pollUntilDone();
      
      return true;
    } catch (error: any) {
      if (error.code === 'SecretNotFound' || error.statusCode === 404) {
        return false;
      }
      throw error;
    }
  }

  async listSecrets(prefix?: string): Promise<SecretMetadata[]> {
    await this.ensureInitialized();

    const secrets: SecretMetadata[] = [];
    const prefixVault = prefix ? this.toVaultName(prefix) : undefined;

    for await (const secretProperties of this.client.listPropertiesOfSecrets()) {
      const name = this.fromVaultName(secretProperties.name);
      
      // Filter by prefix if specified
      if (prefixVault && !secretProperties.name.startsWith(prefixVault)) {
        continue;
      }

      secrets.push({
        name,
        version: secretProperties.version,
        createdAt: secretProperties.createdOn,
        updatedAt: secretProperties.updatedOn,
        expiresAt: secretProperties.expiresOn,
        contentType: secretProperties.contentType,
        tags: secretProperties.tags,
        enabled: secretProperties.enabled,
      });
    }

    return secrets;
  }

  async exists(name: string): Promise<boolean> {
    const secret = await this.getSecret(name);
    return secret !== null;
  }

  getProviderName(): string {
    return 'azure-keyvault';
  }

  async healthCheck(): Promise<boolean> {
    try {
      await this.ensureInitialized();
      
      // Try to list secrets (limited to 1) to verify connectivity
      const iterator = this.client.listPropertiesOfSecrets();
      await iterator.next();
      
      return true;
    } catch {
      return false;
    }
  }
}

export default AzureKeyVaultProvider;
