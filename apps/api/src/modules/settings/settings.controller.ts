/**
 * Settings Controller
 * Tenant configuration and integrations
 */
import { Controller, Get, Put } from '../../core/decorators';
import { container } from '../../core/container';
import type { FastifyRequest, FastifyReply } from 'fastify';
import { eq } from 'drizzle-orm';
import { tenants } from '../../database/schema/index';

interface SettingsRequest extends FastifyRequest {
  tenantId?: string | null;
  userId?: string | null;
}

// Default settings template
const DEFAULT_SETTINGS = {
  bookingSettings: {
    requireApproval: true,
    defaultLeadTimeMinutes: 60,
    maxAdvanceDays: 90,
    cancellationPolicy: 'moderate',
    cancellationHours: 24,
  },
  notificationSettings: {
    emailNotifications: true,
    smsNotifications: false,
    bookingConfirmation: true,
    bookingReminder: true,
    reminderHoursBefore: 24,
  },
  paymentSettings: {
    enabled: false,
    provider: 'invoice',
    requirePaymentUpfront: false,
    vatRate: 25,
  },
};

const DEFAULT_INTEGRATIONS = {
  bankid: { enabled: false },
  vipps: { enabled: false },
  idporten: { enabled: false },
  visma: { enabled: false },
  brreg: { enabled: true },
  rco: { enabled: false },
  outlook: { enabled: false },
  googleCalendar: { enabled: false },
};

@Controller('/api/settings')
export class SettingsController {
  /**
   * GET /api/settings - Get tenant settings
   */
  @Get()
  async getSettings(request: SettingsRequest, reply: FastifyReply) {
    const db = container.resolve<any>('Database');
    const tenantId = request.tenantId;

    if (!tenantId) {
      reply.code(400);
      return { error: { code: 'VALIDATION_ERROR', message: 'Tenant ID required' } };
    }

    const result = await db.select().from(tenants).where(eq(tenants.id, tenantId)).limit(1);

    if (!result.length) {
      reply.code(404);
      return { error: { code: 'NOT_FOUND', message: 'Tenant not found' } };
    }

    const tenant = result[0];
    const settings = tenant.settings || {};

    return {
      data: {
        id: tenant.id,
        tenantId: tenant.id,
        displayName: tenant.name,
        timezone: 'Europe/Oslo',
        currency: 'NOK',
        language: 'no',
        ...DEFAULT_SETTINGS,
        ...settings,
      },
    };
  }

  /**
   * PUT /api/settings - Update tenant settings
   */
  @Put()
  async updateSettings(request: SettingsRequest, reply: FastifyReply) {
    const db = container.resolve<any>('Database');
    const tenantId = request.tenantId;
    const body = request.body as any;

    if (!tenantId) {
      reply.code(400);
      return { error: { code: 'VALIDATION_ERROR', message: 'Tenant ID required' } };
    }

    // Get current tenant
    const result = await db.select().from(tenants).where(eq(tenants.id, tenantId)).limit(1);

    if (!result.length) {
      reply.code(404);
      return { error: { code: 'NOT_FOUND', message: 'Tenant not found' } };
    }

    const tenant = result[0];
    const currentSettings = tenant.settings || {};
    const updatedSettings = { ...currentSettings, ...body };

    // Update tenant with new settings
    await db
      .update(tenants)
      .set({ settings: updatedSettings, updatedAt: new Date() })
      .where(eq(tenants.id, tenantId));

    return {
      data: {
        id: tenant.id,
        tenantId: tenant.id,
        displayName: body.displayName || tenant.name,
        ...DEFAULT_SETTINGS,
        ...updatedSettings,
      },
    };
  }

  /**
   * GET /api/settings/integrations - Get integration settings
   */
  @Get('/integrations')
  async getIntegrations(request: SettingsRequest, reply: FastifyReply) {
    const db = container.resolve<any>('Database');
    const tenantId = request.tenantId;

    if (!tenantId) {
      reply.code(400);
      return { error: { code: 'VALIDATION_ERROR', message: 'Tenant ID required' } };
    }

    const result = await db.select().from(tenants).where(eq(tenants.id, tenantId)).limit(1);

    if (!result.length) {
      reply.code(404);
      return { error: { code: 'NOT_FOUND', message: 'Tenant not found' } };
    }

    const tenant = result[0];
    const integrations = tenant.settings?.integrations || DEFAULT_INTEGRATIONS;

    return { data: integrations };
  }

  /**
   * PUT /api/settings/integrations/:provider - Update integration
   */
  @Put('/integrations/:provider')
  async updateIntegration(request: FastifyRequest<{ Params: { provider: string } }>, reply: FastifyReply) {
    const db = container.resolve<any>('Database');
    const tenantId = (request as any).tenantId;
    const { provider } = request.params;
    const body = request.body as any;

    if (!tenantId) {
      reply.code(400);
      return { error: { code: 'VALIDATION_ERROR', message: 'Tenant ID required' } };
    }

    const result = await db.select().from(tenants).where(eq(tenants.id, tenantId)).limit(1);

    if (!result.length) {
      reply.code(404);
      return { error: { code: 'NOT_FOUND', message: 'Tenant not found' } };
    }

    const tenant = result[0];
    const currentSettings = tenant.settings || {};
    const integrations = currentSettings.integrations || DEFAULT_INTEGRATIONS;
    integrations[provider] = { ...integrations[provider], ...body };

    await db
      .update(tenants)
      .set({ settings: { ...currentSettings, integrations }, updatedAt: new Date() })
      .where(eq(tenants.id, tenantId));

    return { data: integrations };
  }
}
