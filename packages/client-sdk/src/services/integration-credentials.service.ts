/**
 * Integration Credentials Service
 * 
 * Client SDK service for managing encrypted integration credentials.
 * Super admin only - all operations require elevated privileges.
 */

import { BaseService } from './base.service';

/**
 * Credential types supported by the system
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
 * Credential info (without decrypted value)
 */
export interface CredentialInfo {
  id: string;
  tenantId: string;
  integrationId: string;
  credentialType: CredentialType;
  name: string;
  maskedValue: string;
  expiresAt: string | null;
  lastUsedAt: string | null;
  lastRotatedAt: string | null;
  isActive: boolean;
  isExpired: boolean;
  metadata: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

/**
 * Input for creating a credential
 */
export interface CreateCredentialInput {
  credentialType: CredentialType;
  name: string;
  value: string;
  expiresAt?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Input for updating a credential
 */
export interface UpdateCredentialInput {
  name?: string;
  value?: string;
  expiresAt?: string | null;
  isActive?: boolean;
  metadata?: Record<string, unknown>;
}

/**
 * Integration Credentials Service
 */
export class IntegrationCredentialsService extends BaseService {
  constructor() {
    super('/api/integrations');
  }

  /**
   * List all credentials for an integration
   */
  async listCredentials(integrationId: string): Promise<CredentialInfo[]> {
    const response = await this.client.get<{ data: CredentialInfo[] }>(
      `/api/integrations/${integrationId}/credentials`
    );
    return response.data;
  }

  /**
   * Get a specific credential (without decrypted value)
   */
  async getCredential(integrationId: string, credentialId: string): Promise<CredentialInfo> {
    const response = await this.client.get<{ data: CredentialInfo }>(
      `/api/integrations/${integrationId}/credentials/${credentialId}`
    );
    return response.data;
  }

  /**
   * Get decrypted credential value
   * WARNING: This is logged for audit purposes
   */
  async getCredentialValue(integrationId: string, credentialId: string): Promise<string> {
    const response = await this.client.get<{ data: { value: string } }>(
      `/api/integrations/${integrationId}/credentials/${credentialId}/value`
    );
    return response.data.value;
  }

  /**
   * Create a new credential
   */
  async createCredential(
    integrationId: string,
    input: CreateCredentialInput
  ): Promise<CredentialInfo> {
    const response = await this.client.post<{ data: CredentialInfo }>(
      `/api/integrations/${integrationId}/credentials`,
      input
    );
    return response.data;
  }

  /**
   * Update a credential
   */
  async updateCredential(
    integrationId: string,
    credentialId: string,
    input: UpdateCredentialInput
  ): Promise<CredentialInfo> {
    const response = await this.client.put<{ data: CredentialInfo }>(
      `/api/integrations/${integrationId}/credentials/${credentialId}`,
      input
    );
    return response.data;
  }

  /**
   * Delete a credential
   */
  async deleteCredential(integrationId: string, credentialId: string): Promise<void> {
    await this.client.delete(
      `/api/integrations/${integrationId}/credentials/${credentialId}`
    );
  }

  /**
   * Rotate a credential with a new value
   */
  async rotateCredential(
    integrationId: string,
    credentialId: string,
    newValue: string
  ): Promise<CredentialInfo> {
    const response = await this.client.post<{ data: CredentialInfo }>(
      `/api/integrations/${integrationId}/credentials/${credentialId}/rotate`,
      { value: newValue }
    );
    return response.data;
  }

  /**
   * Get available credential types
   */
  async getCredentialTypes(): Promise<Array<{ key: string; value: string; label: string }>> {
    const response = await this.client.get<{ data: Array<{ key: string; value: string; label: string }> }>(
      '/api/integrations/credential-types'
    );
    return response.data;
  }

  /**
   * Get available integration providers
   */
  async getProviders(): Promise<Array<{ key: string; value: string; label: string }>> {
    const response = await this.client.get<{ data: Array<{ key: string; value: string; label: string }> }>(
      '/api/integrations/providers'
    );
    return response.data;
  }
}

export const integrationCredentialsService = new IntegrationCredentialsService();
export default IntegrationCredentialsService;
