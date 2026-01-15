/**
 * Cloudflare Secrets Provider
 * 
 * Implements ISecretsProvider using Cloudflare Workers secrets.
 * 
 * Cloudflare Workers secrets are:
 * - Encrypted at rest
 * - Only accessible at runtime via the env object
 * - Set via wrangler CLI: `wrangler secret put SECRET_NAME`
 * 
 * For Hostinger + Cloudflare integration:
 * 1. Enable Cloudflare on your Hostinger domain
 * 2. Deploy a Cloudflare Worker for secrets management
 * 3. Store secrets via `wrangler secret put SECRET_NAME`
 * 4. Access secrets in your Worker via env.SECRET_NAME
 * 
 * Note: This provider is designed for use within Cloudflare Workers.
 * For traditional Node.js apps on Hostinger, use the Cloudflare API
 * to fetch secrets at startup, or use local encryption with env vars.
 */

import type { ISecretsProvider, Secret, SecretInput, SecretMetadata } from './secrets.provider';

/**
 * Cloudflare Worker environment bindings
 */
interface CloudflareEnv {
  [key: string]: string | undefined;
}

/**
 * Cloudflare API configuration for external access
 */
interface CloudflareApiConfig {
  accountId: string;
  apiToken: string;
  scriptName?: string;
}

/**
 * Cloudflare Secrets Provider
 * 
 * Two modes of operation:
 * 1. Worker Mode: Direct access via env object (when running as CF Worker)
 * 2. API Mode: Fetch secrets via Cloudflare API (when running externally)
 */
export class CloudflareSecretsProvider implements ISecretsProvider {
  private readonly env: CloudflareEnv | null;
  private readonly apiConfig: CloudflareApiConfig | null;
  private readonly cache: Map<string, { value: string; timestamp: number }>;
  private readonly cacheTtlMs: number;

  constructor(options?: {
    env?: CloudflareEnv;
    apiConfig?: CloudflareApiConfig;
    cacheTtlMs?: number;
  }) {
    this.env = options?.env ?? null;
    this.apiConfig = options?.apiConfig ?? this.getApiConfigFromEnv();
    this.cache = new Map();
    this.cacheTtlMs = options?.cacheTtlMs ?? 5 * 60 * 1000; // 5 minutes default
  }

  /**
   * Get API config from environment variables
   */
  private getApiConfigFromEnv(): CloudflareApiConfig | null {
    const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
    const apiToken = process.env.CLOUDFLARE_API_TOKEN;
    const scriptName = process.env.CLOUDFLARE_SCRIPT_NAME;

    if (!accountId || !apiToken) {
      return null;
    }

    return { accountId, apiToken, scriptName };
  }

  /**
   * Convert secret name to Cloudflare-compatible format
   * Cloudflare secrets: uppercase, underscores, alphanumeric only
   */
  private toCloudflareKey(name: string): string {
    return name
      .toUpperCase()
      .replace(/[^A-Z0-9_]/g, '_')
      .replace(/_+/g, '_')
      .replace(/^_|_$/g, '');
  }

  async getSecret(name: string): Promise<Secret | null> {
    const cfKey = this.toCloudflareKey(name);

    // Check cache first
    const cached = this.cache.get(cfKey);
    if (cached && Date.now() - cached.timestamp < this.cacheTtlMs) {
      return {
        name,
        value: cached.value,
        createdAt: new Date(cached.timestamp),
      };
    }

    // Worker mode: direct env access
    if (this.env) {
      const value = this.env[cfKey];
      if (!value) return null;

      this.cache.set(cfKey, { value, timestamp: Date.now() });
      return {
        name,
        value,
        createdAt: new Date(),
      };
    }

    // API mode: fetch via Cloudflare API
    if (this.apiConfig) {
      try {
        const value = await this.fetchSecretViaApi(cfKey);
        if (!value) return null;

        this.cache.set(cfKey, { value, timestamp: Date.now() });
        return {
          name,
          value,
          createdAt: new Date(),
        };
      } catch (error) {
        console.error(`Failed to fetch secret ${cfKey} from Cloudflare:`, error);
        return null;
      }
    }

    return null;
  }

  /**
   * Set a secret via Cloudflare API
   * Note: In Worker mode, secrets must be set via wrangler CLI
   */
  async setSecret(input: SecretInput): Promise<SecretMetadata> {
    const cfKey = this.toCloudflareKey(input.name);

    if (!this.apiConfig) {
      throw new Error(
        'Cloudflare API credentials not configured. ' +
        'Set CLOUDFLARE_ACCOUNT_ID and CLOUDFLARE_API_TOKEN, ' +
        'or use wrangler CLI: wrangler secret put ' + cfKey
      );
    }

    await this.setSecretViaApi(cfKey, input.value);

    // Update cache
    this.cache.set(cfKey, { value: input.value, timestamp: Date.now() });

    return {
      name: input.name,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  async deleteSecret(name: string): Promise<boolean> {
    const cfKey = this.toCloudflareKey(name);

    if (!this.apiConfig) {
      throw new Error(
        'Cloudflare API credentials not configured. ' +
        'Use wrangler CLI: wrangler secret delete ' + cfKey
      );
    }

    try {
      await this.deleteSecretViaApi(cfKey);
      this.cache.delete(cfKey);
      return true;
    } catch {
      return false;
    }
  }

  async listSecrets(_prefix?: string): Promise<SecretMetadata[]> {
    if (!this.apiConfig) {
      // In Worker mode, we can't list secrets - return empty
      return [];
    }

    try {
      const secrets = await this.listSecretsViaApi();
      return secrets.map(name => ({
        name,
        createdAt: new Date(),
      }));
    } catch {
      return [];
    }
  }

  async exists(name: string): Promise<boolean> {
    const secret = await this.getSecret(name);
    return secret !== null;
  }

  getProviderName(): string {
    return 'cloudflare';
  }

  async healthCheck(): Promise<boolean> {
    if (this.env) {
      // Worker mode - always healthy if we have env
      return true;
    }

    if (this.apiConfig) {
      try {
        // Try to list secrets to verify API access
        await this.listSecretsViaApi();
        return true;
      } catch {
        return false;
      }
    }

    return false;
  }

  /**
   * Fetch a secret value via Cloudflare API
   * Note: Cloudflare API doesn't expose secret values for security
   * This method is a placeholder - use environment variables instead
   */
  private async fetchSecretViaApi(_key: string): Promise<string | null> {
    // Cloudflare doesn't allow reading secret values via API for security
    // Secrets can only be read at runtime within a Worker
    // For external apps, use a Worker as a secrets proxy or use env vars
    console.warn(
      'Cloudflare secrets cannot be read via API. ' +
      'Use a Cloudflare Worker as a secrets proxy, or store secrets in environment variables.'
    );
    return null;
  }

  /**
   * Set a secret via Cloudflare API
   */
  private async setSecretViaApi(key: string, value: string): Promise<void> {
    if (!this.apiConfig) throw new Error('API config required');

    const { accountId, apiToken, scriptName } = this.apiConfig;
    
    if (!scriptName) {
      throw new Error('CLOUDFLARE_SCRIPT_NAME is required to set secrets via API');
    }

    const response = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${accountId}/workers/scripts/${scriptName}/secrets`,
      {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${apiToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: key,
          text: value,
          type: 'secret_text',
        }),
      }
    );

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to set Cloudflare secret: ${error}`);
    }
  }

  /**
   * Delete a secret via Cloudflare API
   */
  private async deleteSecretViaApi(key: string): Promise<void> {
    if (!this.apiConfig) throw new Error('API config required');

    const { accountId, apiToken, scriptName } = this.apiConfig;
    
    if (!scriptName) {
      throw new Error('CLOUDFLARE_SCRIPT_NAME is required to delete secrets via API');
    }

    const response = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${accountId}/workers/scripts/${scriptName}/secrets/${key}`,
      {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${apiToken}`,
        },
      }
    );

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to delete Cloudflare secret: ${error}`);
    }
  }

  /**
   * List secrets via Cloudflare API
   */
  private async listSecretsViaApi(): Promise<string[]> {
    if (!this.apiConfig) throw new Error('API config required');

    const { accountId, apiToken, scriptName } = this.apiConfig;
    
    if (!scriptName) {
      return [];
    }

    const response = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${accountId}/workers/scripts/${scriptName}/secrets`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${apiToken}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error('Failed to list Cloudflare secrets');
    }

    const data = await response.json() as { result: Array<{ name: string }> };
    return data.result.map(s => s.name);
  }
}

export default CloudflareSecretsProvider;
