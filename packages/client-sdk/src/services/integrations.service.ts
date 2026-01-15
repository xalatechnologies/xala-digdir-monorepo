/**
 * Integrations Service
 * Manages external integration configurations (ID-porten, Vipps, Visma, RCO, ACOS)
 */

import { BaseService } from './base.service';

export interface Integration {
  id: string;
  tenantId: string;
  provider: string;
  name: string;
  status: 'active' | 'inactive' | 'error';
  config: Record<string, any>;
  createdAt: string;
  updatedAt: string;
  createdBy: string | null;
  updatedBy: string | null;
}

export interface IntegrationUpdate {
  name?: string;
  status?: 'active' | 'inactive' | 'error';
  config?: Record<string, any>;
}

export interface IntegrationTestResult {
  success: boolean;
  message: string;
  details?: any;
}

export class IntegrationsService extends BaseService {
  constructor() {
    super('/api/configuration/integrations');
  }

  /**
   * List all integrations for current tenant
   */
  async listIntegrations(): Promise<Integration[]> {
    const response = await this.client.get<{ data: Integration[] }>(
      this.buildPath('')
    );
    return response.data;
  }

  /**
   * Get specific integration by provider
   */
  async getIntegration(provider: string): Promise<Integration> {
    const response = await this.client.get<{ data: Integration }>(
      this.buildPath(`/${provider}`)
    );
    return response.data;
  }

  /**
   * Update integration configuration
   */
  async updateIntegration(
    provider: string,
    data: IntegrationUpdate
  ): Promise<Integration> {
    const response = await this.client.put<{ data: Integration }>(
      this.buildPath(`/${provider}`),
      data
    );
    return response.data;
  }

  /**
   * Test integration connection
   */
  async testIntegration(provider: string): Promise<IntegrationTestResult> {
    const response = await this.client.post<{ data: IntegrationTestResult }>(
      this.buildPath(`/${provider}/test`),
      {}
    );
    return response.data;
  }
}

// Export singleton instance
export const integrationsService = new IntegrationsService();
