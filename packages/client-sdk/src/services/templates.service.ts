/**
 * Templates Service
 * Message templates for booking workflows
 */

import { BaseService } from './base.service';
import type { SingleResponse, PaginatedResponse } from '../types/enums';

// =============================================================================
// Types
// =============================================================================

export interface MessageTemplate {
  id: string;
  type: 'confirmation' | 'reminder' | 'rejection' | 'change' | 'cancellation' | 'custom';
  name: string;
  subject: string;
  bodyHtml: string;
  bodyText: string;
  variables: string[];
  isDefault: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTemplateDTO {
  type: MessageTemplate['type'];
  name: string;
  subject: string;
  bodyHtml: string;
  bodyText?: string;
  variables?: string[];
  isDefault?: boolean;
  isActive?: boolean;
}

export type UpdateTemplateDTO = Partial<CreateTemplateDTO>;

export interface TemplatePreviewRequest {
  variables?: Record<string, string>;
}

export interface TemplatePreviewResponse {
  subject: string;
  html: string;
  text: string;
  variables: Record<string, string>;
}

// =============================================================================
// Service
// =============================================================================

export class TemplatesService extends BaseService {
  constructor() {
    super('/api/templates');
  }

  /**
   * List all templates
   */
  async list(query?: { type?: string; isActive?: boolean }): Promise<PaginatedResponse<MessageTemplate>> {
    const params = new URLSearchParams();
    if (query?.type) params.set('type', query.type);
    if (query?.isActive !== undefined) params.set('isActive', String(query.isActive));
    const queryString = params.toString();
    return this.client.get(this.buildPath(queryString ? `?${queryString}` : ''));
  }

  /**
   * Get template by ID
   */
  async getById(id: string): Promise<SingleResponse<MessageTemplate>> {
    return this.client.get(this.buildPath(`/${id}`));
  }

  /**
   * Create new template
   */
  async create(data: CreateTemplateDTO): Promise<SingleResponse<MessageTemplate>> {
    return this.client.post(this.buildPath(''), data);
  }

  /**
   * Update template
   */
  async update(id: string, data: UpdateTemplateDTO): Promise<SingleResponse<MessageTemplate>> {
    return this.client.put(this.buildPath(`/${id}`), data);
  }

  /**
   * Delete template
   */
  async deleteTemplate(id: string): Promise<void> {
    return this.client.delete(this.buildPath(`/${id}`));
  }

  /**
   * Preview template with variable substitution
   */
  async preview(id: string, data?: TemplatePreviewRequest): Promise<SingleResponse<TemplatePreviewResponse>> {
    return this.client.post(this.buildPath(`/${id}/preview`), data || {});
  }

  /**
   * Send test email
   */
  async testSend(id: string, recipientEmail: string, variables?: Record<string, string>): Promise<SingleResponse<{ success: boolean; sentAt: string }>> {
    return this.client.post(this.buildPath(`/${id}/test-send`), { recipientEmail, variables });
  }
}

// Singleton instance
export const templatesService = new TemplatesService();
