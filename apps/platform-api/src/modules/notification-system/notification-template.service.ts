/**
 * Notification Template Service
 * Handles template management and variable interpolation
 */
import type { NotificationRepository } from './notification.repository';
import type {
  NotificationTemplateDTO,
  CreateTemplateDTO,
  UpdateTemplateDTO,
  LocalizedTemplate,
  NotificationType,
} from './notification.types';

export class NotificationTemplateService {
  constructor(private readonly repository: NotificationRepository) {}

  // ==========================================================================
  // Template CRUD
  // ==========================================================================

  async getTemplate(code: string, tenantId?: string): Promise<NotificationTemplateDTO | null> {
    const template = await this.repository.findTemplateByCode(code, tenantId);
    if (!template) return null;
    return this.mapTemplateToDTO(template);
  }

  async getAllTemplates(tenantId?: string): Promise<NotificationTemplateDTO[]> {
    const templates = await this.repository.findAllTemplates(tenantId);
    return templates.map(this.mapTemplateToDTO);
  }

  async createTemplate(data: CreateTemplateDTO): Promise<NotificationTemplateDTO> {
    const template = await this.repository.createTemplate({
      tenantId: data.tenantId || null,
      code: data.code,
      name: data.name,
      description: data.description,
      emailTemplate: data.emailTemplate || {},
      smsTemplate: data.smsTemplate || {},
      pushTemplate: data.pushTemplate || {},
      inAppTemplate: data.inAppTemplate || {},
      availableVariables: data.availableVariables || [],
      isActive: true,
      isSystem: false,
    });
    return this.mapTemplateToDTO(template);
  }

  async updateTemplate(id: string, data: UpdateTemplateDTO): Promise<NotificationTemplateDTO | null> {
    const template = await this.repository.updateTemplate(id, {
      ...(data.name && { name: data.name }),
      ...(data.description !== undefined && { description: data.description }),
      ...(data.emailTemplate && { emailTemplate: data.emailTemplate }),
      ...(data.smsTemplate && { smsTemplate: data.smsTemplate }),
      ...(data.pushTemplate && { pushTemplate: data.pushTemplate }),
      ...(data.inAppTemplate && { inAppTemplate: data.inAppTemplate }),
      ...(data.availableVariables && { availableVariables: data.availableVariables }),
      ...(data.isActive !== undefined && { isActive: data.isActive }),
    });
    if (!template) return null;
    return this.mapTemplateToDTO(template);
  }

  async deleteTemplate(id: string): Promise<boolean> {
    return this.repository.deleteTemplate(id);
  }

  // ==========================================================================
  // Template Rendering
  // ==========================================================================

  /**
   * Render a template with variables for a specific channel and locale
   */
  async renderTemplate(
    type: NotificationType | string,
    channel: 'email' | 'sms' | 'push' | 'in_app',
    variables: Record<string, string | number | boolean>,
    locale: 'nb' | 'en' = 'nb',
    tenantId?: string
  ): Promise<{ subject?: string; title?: string; body: string } | null> {
    const template = await this.repository.findTemplateByCode(type, tenantId);
    if (!template) return null;

    // Get channel-specific template
    let channelTemplate: unknown;
    switch (channel) {
      case 'email':
        channelTemplate = template.emailTemplate;
        break;
      case 'sms':
        channelTemplate = template.smsTemplate;
        break;
      case 'push':
        channelTemplate = template.pushTemplate;
        break;
      case 'in_app':
        channelTemplate = template.inAppTemplate;
        break;
    }

    if (!channelTemplate || typeof channelTemplate !== 'object') {
      return null;
    }

    // Get localized content
    const ct = channelTemplate as Record<string, unknown>;
    const localizedContent = (ct[locale] || ct.nb || ct.en) as Record<string, string> | string | undefined;
    if (!localizedContent) return null;

    // Handle SMS (simple string format)
    if (channel === 'sms' && typeof localizedContent === 'string') {
      return { body: this.interpolate(localizedContent, variables) };
    }

    // Handle other channels (object format with subject/title/body)
    if (typeof localizedContent === 'object') {
      return {
        subject: localizedContent.subject ? this.interpolate(localizedContent.subject, variables) : undefined,
        title: localizedContent.title ? this.interpolate(localizedContent.title, variables) : undefined,
        body: this.interpolate(localizedContent.body || '', variables),
      };
    }

    return null;
  }

  /**
   * Render all channels for a template
   */
  async renderAllChannels(
    type: NotificationType | string,
    variables: Record<string, string | number | boolean>,
    locale: 'nb' | 'en' = 'nb',
    tenantId?: string
  ): Promise<{
    email?: { subject: string; body: string };
    sms?: { body: string };
    push?: { title: string; body: string };
    inApp?: { title: string; body: string };
  }> {
    const [email, sms, push, inApp] = await Promise.all([
      this.renderTemplate(type, 'email', variables, locale, tenantId),
      this.renderTemplate(type, 'sms', variables, locale, tenantId),
      this.renderTemplate(type, 'push', variables, locale, tenantId),
      this.renderTemplate(type, 'in_app', variables, locale, tenantId),
    ]);

    return {
      email: email?.subject && email?.body ? { subject: email.subject, body: email.body } : undefined,
      sms: sms?.body ? { body: sms.body } : undefined,
      push: push?.title && push?.body ? { title: push.title, body: push.body } : undefined,
      inApp: inApp?.title && inApp?.body ? { title: inApp.title, body: inApp.body } : undefined,
    };
  }

  /**
   * Interpolate variables into a template string
   * Supports {{variableName}} syntax
   */
  private interpolate(
    template: string,
    variables: Record<string, string | number | boolean>
  ): string {
    return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
      const value = variables[key];
      if (value === undefined) {
        console.warn(`Template variable not found: ${key}`);
        return match; // Keep original if not found
      }
      return String(value);
    });
  }

  /**
   * Get available variables for a template
   */
  async getAvailableVariables(code: string, tenantId?: string): Promise<string[]> {
    const template = await this.repository.findTemplateByCode(code, tenantId);
    if (!template) return [];
    return (template.availableVariables as string[]) || [];
  }

  /**
   * Validate that all required variables are provided
   */
  async validateVariables(
    code: string,
    variables: Record<string, unknown>,
    tenantId?: string
  ): Promise<{ valid: boolean; missing: string[] }> {
    const required = await this.getAvailableVariables(code, tenantId);
    const missing = required.filter((v) => variables[v] === undefined);
    return { valid: missing.length === 0, missing };
  }

  // ==========================================================================
  // Helpers
  // ==========================================================================

  private mapTemplateToDTO(template: {
    id: string;
    tenantId: string | null;
    code: string;
    name: string;
    description: string | null;
    emailTemplate: unknown;
    smsTemplate: unknown;
    pushTemplate: unknown;
    inAppTemplate: unknown;
    availableVariables: unknown;
    isActive: boolean;
    isSystem: boolean;
    createdAt: Date;
    updatedAt: Date;
  }): NotificationTemplateDTO {
    return {
      id: template.id,
      tenantId: template.tenantId,
      code: template.code,
      name: template.name,
      description: template.description,
      emailTemplate: template.emailTemplate as LocalizedTemplate | null,
      smsTemplate: template.smsTemplate as { nb: string; en: string } | null,
      pushTemplate: template.pushTemplate as LocalizedTemplate | null,
      inAppTemplate: template.inAppTemplate as LocalizedTemplate | null,
      availableVariables: (template.availableVariables as string[]) || [],
      isActive: template.isActive,
      isSystem: template.isSystem,
      createdAt: template.createdAt.toISOString(),
      updatedAt: template.updatedAt.toISOString(),
    };
  }
}
