/**
 * Message Templates Controller
 * CRUD for message templates used in booking workflows
 * 
 * Template types:
 * - confirmation: Booking confirmed
 * - reminder: Booking reminder
 * - rejection: Booking rejected
 * - change: Booking changed
 * - cancellation: Booking cancelled
 */
import { Controller, Get, Post, Put, Delete } from '../../core/decorators';
import type { FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';

interface TenantRequest extends FastifyRequest {
  tenantId?: string | null;
  userId?: string | null;
  user?: { tenantId: string; userId: string; role: string };
}

// Validation schemas
const CreateTemplateSchema = z.object({
  type: z.enum(['confirmation', 'reminder', 'rejection', 'change', 'cancellation', 'custom']),
  name: z.string().min(1).max(100),
  subject: z.string().min(1).max(200),
  bodyHtml: z.string().min(1),
  bodyText: z.string().optional(),
  variables: z.array(z.string()).optional(),
  isDefault: z.boolean().optional(),
  isActive: z.boolean().optional(),
});

const UpdateTemplateSchema = CreateTemplateSchema.partial();

// Mock templates data
const mockTemplates = [
  {
    id: 'tpl-001',
    type: 'confirmation',
    name: 'Booking bekreftet',
    subject: 'Din booking er bekreftet - {{rentalObjectName}}',
    bodyHtml: '<h1>Hei {{userName}}!</h1><p>Din booking for {{rentalObjectName}} er bekreftet.</p><p><strong>Dato:</strong> {{startDate}}</p><p><strong>Tid:</strong> {{startTime}} - {{endTime}}</p>',
    bodyText: 'Hei {{userName}}! Din booking for {{rentalObjectName}} er bekreftet.',
    variables: ['userName', 'rentalObjectName', 'startDate', 'startTime', 'endTime'],
    isDefault: true,
    isActive: true,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'tpl-002',
    type: 'reminder',
    name: 'Påminnelse om booking',
    subject: 'Påminnelse: Din booking i morgen - {{rentalObjectName}}',
    bodyHtml: '<h1>Hei {{userName}}!</h1><p>Dette er en påminnelse om din booking i morgen.</p>',
    bodyText: 'Hei {{userName}}! Påminnelse om din booking i morgen.',
    variables: ['userName', 'rentalObjectName', 'startDate', 'startTime'],
    isDefault: true,
    isActive: true,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'tpl-003',
    type: 'rejection',
    name: 'Booking avslått',
    subject: 'Din bookingforespørsel er avslått - {{rentalObjectName}}',
    bodyHtml: '<h1>Hei {{userName}}!</h1><p>Dessverre må vi avslå din bookingforespørsel.</p><p><strong>Begrunnelse:</strong> {{rejectionReason}}</p>',
    bodyText: 'Hei {{userName}}! Din bookingforespørsel er avslått. Begrunnelse: {{rejectionReason}}',
    variables: ['userName', 'rentalObjectName', 'rejectionReason'],
    isDefault: true,
    isActive: true,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  },
];

@Controller('/api/templates')
export class MessageTemplatesController {

  /**
   * GET /api/templates - List all templates
   */
  @Get()
  async listTemplates(request: TenantRequest, reply: FastifyReply) {
    const { type, isActive } = request.query as any;

    let templates = [...mockTemplates];

    if (type) {
      templates = templates.filter(t => t.type === type);
    }
    if (isActive !== undefined) {
      templates = templates.filter(t => t.isActive === (isActive === 'true'));
    }

    return {
      data: templates,
      meta: {
        total: templates.length,
        types: ['confirmation', 'reminder', 'rejection', 'change', 'cancellation', 'custom'],
      },
    };
  }

  /**
   * GET /api/templates/:id - Get template by ID
   */
  @Get('/:id')
  async getTemplate(request: TenantRequest, reply: FastifyReply) {
    const { id } = request.params as any;
    const template = mockTemplates.find(t => t.id === id);

    if (!template) {
      reply.code(404);
      return {
        type: 'https://api.digilist.no/errors/not-found',
        title: 'Template Not Found',
        status: 404,
        detail: `Template with ID ${id} not found`,
      };
    }

    return { data: template };
  }

  /**
   * POST /api/templates - Create new template
   */
  @Post()
  async createTemplate(request: TenantRequest, reply: FastifyReply) {
    const data = CreateTemplateSchema.parse(request.body);

    const template = {
      id: `tpl-${Date.now()}`,
      ...data,
      bodyText: data.bodyText || '',
      variables: data.variables || [],
      isDefault: data.isDefault ?? false,
      isActive: data.isActive ?? true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    mockTemplates.push(template);
    reply.code(201);
    return { data: template };
  }

  /**
   * PUT /api/templates/:id - Update template
   */
  @Put('/:id')
  async updateTemplate(request: TenantRequest, reply: FastifyReply) {
    const { id } = request.params as any;
    const data = UpdateTemplateSchema.parse(request.body);
    const index = mockTemplates.findIndex(t => t.id === id);

    if (index === -1) {
      reply.code(404);
      return {
        type: 'https://api.digilist.no/errors/not-found',
        title: 'Template Not Found',
        status: 404,
        detail: `Template with ID ${id} not found`,
      };
    }

    mockTemplates[index] = {
      ...mockTemplates[index],
      ...data,
      updatedAt: new Date().toISOString(),
    };

    return { data: mockTemplates[index] };
  }

  /**
   * DELETE /api/templates/:id - Delete template
   */
  @Delete('/:id')
  async deleteTemplate(request: TenantRequest, reply: FastifyReply) {
    const { id } = request.params as any;
    const index = mockTemplates.findIndex(t => t.id === id);

    if (index === -1) {
      reply.code(404);
      return {
        type: 'https://api.digilist.no/errors/not-found',
        title: 'Template Not Found',
        status: 404,
        detail: `Template with ID ${id} not found`,
      };
    }

    mockTemplates.splice(index, 1);
    reply.code(204);
  }

  /**
   * POST /api/templates/:id/preview - Preview template with sample data
   */
  @Post('/:id/preview')
  async previewTemplate(request: TenantRequest, reply: FastifyReply) {
    const { id } = request.params as any;
    const { variables } = request.body as { variables?: Record<string, string> };

    const template = mockTemplates.find(t => t.id === id);

    if (!template) {
      reply.code(404);
      return {
        type: 'https://api.digilist.no/errors/not-found',
        title: 'Template Not Found',
        status: 404,
        detail: `Template with ID ${id} not found`,
      };
    }

    // Replace variables in template
    let renderedSubject = template.subject;
    let renderedHtml = template.bodyHtml;
    let renderedText = template.bodyText || '';

    const sampleVariables: Record<string, string> = {
      userName: 'Ola Nordmann',
      rentalObjectName: 'Storefjell Idrettshall',
      startDate: '2026-01-20',
      startTime: '14:00',
      endTime: '16:00',
      rejectionReason: 'Lokalet er opptatt',
      ...variables,
    };

    for (const [key, value] of Object.entries(sampleVariables)) {
      const regex = new RegExp(`{{${key}}}`, 'g');
      renderedSubject = renderedSubject.replace(regex, value);
      renderedHtml = renderedHtml.replace(regex, value);
      renderedText = renderedText.replace(regex, value);
    }

    return {
      data: {
        subject: renderedSubject,
        html: renderedHtml,
        text: renderedText,
        variables: sampleVariables,
      },
    };
  }

  /**
   * POST /api/templates/:id/test-send - Send test email
   */
  @Post('/:id/test-send')
  async testSendTemplate(request: TenantRequest, reply: FastifyReply) {
    const { id } = request.params as any;
    const { recipientEmail, variables } = request.body as any;

    const template = mockTemplates.find(t => t.id === id);

    if (!template) {
      reply.code(404);
      return {
        type: 'https://api.digilist.no/errors/not-found',
        title: 'Template Not Found',
        status: 404,
        detail: `Template with ID ${id} not found`,
      };
    }

    if (!recipientEmail) {
      reply.code(400);
      return {
        type: 'https://api.digilist.no/errors/validation-error',
        title: 'Validation Error',
        status: 400,
        detail: 'recipientEmail is required',
      };
    }

    // Mock: In production, this would send via email service
    return {
      data: {
        success: true,
        message: `Test email sent to ${recipientEmail}`,
        templateId: id,
        sentAt: new Date().toISOString(),
      },
    };
  }
}
