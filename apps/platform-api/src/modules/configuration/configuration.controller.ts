/**
 * Configuration Controller
 * REST API endpoints for schema-driven configuration management
 * 
 * All enums, categories, and configurable options are served from database
 */
import { Controller, Get, Post, Put, Delete } from '../../core/decorators';
import { Inject } from '../../core/decorators';
import { ConfigurationService } from './configuration.service';
import { getOptionalTenantId, getTenantId, TenantRequest } from '../../core/validation/tenant';
import type { FastifyRequest, FastifyReply } from 'fastify';

// =============================================================================
// Categories Controller
// Replaces hardcoded categories with database-driven configuration
// =============================================================================

@Controller('/api/categories')
export class CategoriesController {
  constructor(
    @Inject('ConfigurationService') private readonly configService: ConfigurationService
  ) {}

  /**
   * GET /api/categories - Get all rental object categories
   * Returns categories from database, with optional subcategories
   */
  @Get()
  async getAll(request: FastifyRequest, reply: FastifyReply) {
    const query = request.query as { includeSubcategories?: string };
    const includeSubcategories = query.includeSubcategories === 'true';
    
    const categories = await this.configService.getCategories(includeSubcategories);
    
    return {
      data: categories,
    };
  }

  /**
   * GET /api/categories/:code - Get category by code
   */
  @Get('/:code')
  async getByCode(request: FastifyRequest<{ Params: { code: string } }>, reply: FastifyReply) {
    const category = await this.configService.getCategoryByCode(request.params.code);
    
    if (!category) {
      reply.code(404);
      return { error: { code: 'NOT_FOUND', message: 'Category not found' } };
    }
    
    return { data: category };
  }

  /**
   * GET /api/categories/:code/subcategories - Get subcategories for a category
   */
  @Get('/:code/subcategories')
  async getSubcategories(request: FastifyRequest<{ Params: { code: string } }>, reply: FastifyReply) {
    const subcategories = await this.configService.getSubcategories(request.params.code);
    return { data: subcategories };
  }

  /**
   * POST /api/categories - Create a new category (admin only)
   */
  @Post()
  async create(request: FastifyRequest, reply: FastifyReply) {
    const body = request.body as {
      code: string;
      name: string;
      nameEn?: string;
      description?: string;
      descriptionEn?: string;
      icon?: string;
      examples?: string[];
      sortOrder?: number;
    };
    
    // Validate required fields
    if (!body.code || !body.name) {
      reply.code(400);
      return { error: { code: 'VALIDATION_ERROR', message: 'code and name are required' } };
    }
    
    const category = await this.configService.createCategory(body);
    reply.code(201);
    return { data: category };
  }

  /**
   * PUT /api/categories/:id - Update a category (admin only)
   */
  @Put('/:id')
  async update(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    const body = request.body as Partial<{
      code: string;
      name: string;
      nameEn: string | null;
      description: string | null;
      descriptionEn: string | null;
      icon: string | null;
      examples: string[];
      sortOrder: number;
      enabled: boolean;
    }>;
    
    const category = await this.configService.updateCategory(request.params.id, body);
    
    if (!category) {
      reply.code(404);
      return { error: { code: 'NOT_FOUND', message: 'Category not found' } };
    }
    
    return { data: category };
  }

  /**
   * DELETE /api/categories/:id - Delete a category (admin only)
   */
  @Delete('/:id')
  async delete(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    const success = await this.configService.deleteCategory(request.params.id);
    
    if (!success) {
      reply.code(404);
      return { error: { code: 'NOT_FOUND', message: 'Category not found' } };
    }
    
    return { success: true };
  }

  /**
   * POST /api/categories/:code/subcategories - Create a subcategory (admin only)
   */
  @Post('/:code/subcategories')
  async createSubcategory(request: FastifyRequest<{ Params: { code: string } }>, reply: FastifyReply) {
    const body = request.body as {
      code: string;
      name: string;
      nameEn?: string;
      description?: string;
      icon?: string;
      sortOrder?: number;
    };
    
    if (!body.code || !body.name) {
      reply.code(400);
      return { error: { code: 'VALIDATION_ERROR', message: 'code and name are required' } };
    }
    
    const subcategory = await this.configService.createSubcategory(request.params.code, body);
    
    if (!subcategory) {
      reply.code(404);
      return { error: { code: 'NOT_FOUND', message: 'Parent category not found' } };
    }
    
    reply.code(201);
    return { data: subcategory };
  }
}

// =============================================================================
// Time Modes Controller
// =============================================================================

@Controller('/api/time-modes')
export class TimeModesController {
  constructor(
    @Inject('ConfigurationService') private readonly configService: ConfigurationService
  ) {}

  /**
   * GET /api/time-modes - Get all booking time modes
   */
  @Get()
  async getAll(request: FastifyRequest, reply: FastifyReply) {
    const modes = await this.configService.getTimeModes();
    return { data: modes };
  }

  /**
   * GET /api/time-modes/:code - Get time mode by code
   */
  @Get('/:code')
  async getByCode(request: FastifyRequest<{ Params: { code: string } }>, reply: FastifyReply) {
    const mode = await this.configService.getTimeModeByCode(request.params.code);
    
    if (!mode) {
      reply.code(404);
      return { error: { code: 'NOT_FOUND', message: 'Time mode not found' } };
    }
    
    return { data: mode };
  }

  /**
   * POST /api/time-modes - Create a new time mode (admin only)
   */
  @Post()
  async create(request: FastifyRequest, reply: FastifyReply) {
    const body = request.body as {
      code: string;
      name: string;
      nameEn?: string;
      description?: string;
      descriptionEn?: string;
      calendarBehavior?: string;
      icon?: string;
      sortOrder?: number;
    };
    
    if (!body.code || !body.name) {
      reply.code(400);
      return { error: { code: 'VALIDATION_ERROR', message: 'code and name are required' } };
    }
    
    const mode = await this.configService.createTimeMode(body);
    reply.code(201);
    return { data: mode };
  }

  /**
   * PUT /api/time-modes/:id - Update a time mode (admin only)
   */
  @Put('/:id')
  async update(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    const body = request.body as Partial<{
      code: string;
      name: string;
      nameEn: string | null;
      description: string | null;
      descriptionEn: string | null;
      calendarBehavior: string | null;
      icon: string | null;
      sortOrder: number;
      enabled: boolean;
    }>;
    
    const mode = await this.configService.updateTimeMode(request.params.id, body);
    
    if (!mode) {
      reply.code(404);
      return { error: { code: 'NOT_FOUND', message: 'Time mode not found' } };
    }
    
    return { data: mode };
  }
}

// =============================================================================
// Pricing Units Controller
// =============================================================================

@Controller('/api/pricing-units')
export class PricingUnitsController {
  constructor(
    @Inject('ConfigurationService') private readonly configService: ConfigurationService
  ) {}

  /**
   * GET /api/pricing-units - Get all pricing units
   */
  @Get()
  async getAll(request: FastifyRequest, reply: FastifyReply) {
    const units = await this.configService.getPricingUnits();
    return { data: units };
  }

  /**
   * GET /api/pricing-units/:code - Get pricing unit by code
   */
  @Get('/:code')
  async getByCode(request: FastifyRequest<{ Params: { code: string } }>, reply: FastifyReply) {
    const unit = await this.configService.getPricingUnitByCode(request.params.code);
    
    if (!unit) {
      reply.code(404);
      return { error: { code: 'NOT_FOUND', message: 'Pricing unit not found' } };
    }
    
    return { data: unit };
  }

  /**
   * POST /api/pricing-units - Create a new pricing unit (admin only)
   */
  @Post()
  async create(request: FastifyRequest, reply: FastifyReply) {
    const body = request.body as {
      code: string;
      name: string;
      nameEn?: string;
      description?: string;
      durationMinutes?: number;
      sortOrder?: number;
    };
    
    if (!body.code || !body.name) {
      reply.code(400);
      return { error: { code: 'VALIDATION_ERROR', message: 'code and name are required' } };
    }
    
    const unit = await this.configService.createPricingUnit(body);
    reply.code(201);
    return { data: unit };
  }
}

// =============================================================================
// Statuses Controller
// =============================================================================

@Controller('/api/statuses')
export class StatusesController {
  constructor(
    @Inject('ConfigurationService') private readonly configService: ConfigurationService
  ) {}

  /**
   * GET /api/statuses/rental-object - Get all rental object statuses
   */
  @Get('/rental-object')
  async getRentalObjectStatuses(request: FastifyRequest, reply: FastifyReply) {
    const statuses = await this.configService.getRentalObjectStatuses();
    return { data: statuses };
  }

  /**
   * GET /api/statuses/booking - Get all booking statuses
   */
  @Get('/booking')
  async getBookingStatuses(request: FastifyRequest, reply: FastifyReply) {
    const statuses = await this.configService.getBookingStatuses();
    return { data: statuses };
  }
}

// =============================================================================
// System Configuration Controller
// =============================================================================

@Controller('/api/config')
export class SystemConfigController {
  constructor(
    @Inject('ConfigurationService') private readonly configService: ConfigurationService
  ) {}

  /**
   * GET /api/config - Get all public configurations
   */
  @Get()
  async getPublicConfigs(request: FastifyRequest, reply: FastifyReply) {
    const tenantId = getOptionalTenantId(request as TenantRequest);
    const configs = await this.configService.getConfigurations(tenantId ?? undefined, true);
    return { data: configs };
  }

  /**
   * GET /api/config/:key - Get specific configuration
   */
  @Get('/:key')
  async getConfig(request: FastifyRequest<{ Params: { key: string } }>, reply: FastifyReply) {
    const tenantId = getOptionalTenantId(request as TenantRequest);
    const config = await this.configService.getConfiguration(request.params.key, tenantId ?? undefined);
    
    if (!config) {
      reply.code(404);
      return { error: { code: 'NOT_FOUND', message: 'Configuration not found' } };
    }
    
    return { data: config };
  }

  /**
   * PUT /api/config/:key - Set configuration (admin only)
   */
  @Put('/:key')
  async setConfig(request: TenantRequest & FastifyRequest<{ Params: { key: string } }>, reply: FastifyReply) {
    const tenantId = getOptionalTenantId(request);
    const body = request.body as {
      value: unknown;
      valueType?: string;
      description?: string;
      isPublic?: boolean;
    };
    
    const config = await this.configService.setConfiguration({
      key: request.params.key,
      value: body.value,
      valueType: body.valueType,
      description: body.description,
      isPublic: body.isPublic,
      tenantId: tenantId ?? undefined,
    });
    
    return { data: config };
  }

  /**
   * DELETE /api/config/:key - Delete configuration (admin only)
   */
  @Delete('/:key')
  async deleteConfig(request: TenantRequest & FastifyRequest<{ Params: { key: string } }>, reply: FastifyReply) {
    const tenantId = getOptionalTenantId(request);
    const success = await this.configService.deleteConfiguration(request.params.key, tenantId ?? undefined);
    
    if (!success) {
      reply.code(404);
      return { error: { code: 'NOT_FOUND', message: 'Configuration not found' } };
    }
    
    return { success: true };
  }
}

// =============================================================================
// Schema Validation Endpoints
// Used by frontend for dynamic validation
// =============================================================================

@Controller('/api/schema')
export class SchemaController {
  constructor(
    @Inject('ConfigurationService') private readonly configService: ConfigurationService
  ) {}

  /**
   * GET /api/schema/enums - Get all valid enum values for validation
   * Returns all configurable enum values for frontend validation
   */
  @Get('/enums')
  async getEnums(request: FastifyRequest, reply: FastifyReply) {
    const [categories, timeModes, pricingUnits, rentalObjectStatuses, bookingStatuses] = await Promise.all([
      this.configService.getValidCategoryCodes(),
      this.configService.getValidTimeModeCodes(),
      this.configService.getValidPricingUnitCodes(),
      this.configService.getRentalObjectStatuses(),
      this.configService.getBookingStatuses(),
    ]);
    
    return {
      data: {
        categories,
        timeModes,
        pricingUnits,
        rentalObjectStatuses: rentalObjectStatuses.map(s => s.code),
        bookingStatuses: bookingStatuses.map(s => s.code),
      },
    };
  }

  /**
   * POST /api/schema/validate/category - Validate a category code
   */
  @Post('/validate/category')
  async validateCategory(request: FastifyRequest, reply: FastifyReply) {
    const body = request.body as { code: string };
    const isValid = await this.configService.isValidCategoryCode(body.code);
    return { valid: isValid };
  }

  /**
   * POST /api/schema/validate/subcategory - Validate a subcategory code
   */
  @Post('/validate/subcategory')
  async validateSubcategory(request: FastifyRequest, reply: FastifyReply) {
    const body = request.body as { categoryCode: string; subcategoryCode: string };
    const isValid = await this.configService.isValidSubcategoryCode(body.categoryCode, body.subcategoryCode);
    return { valid: isValid };
  }

  /**
   * POST /api/schema/validate/time-mode - Validate a time mode code
   */
  @Post('/validate/time-mode')
  async validateTimeMode(request: FastifyRequest, reply: FastifyReply) {
    const body = request.body as { code: string };
    const isValid = await this.configService.isValidTimeModeCode(body.code);
    return { valid: isValid };
  }
}

// =============================================================================
// Integrations Configuration Controller
// Manages external integration credentials (ID-porten, Vipps, Visma, RCO, ACOS)
// =============================================================================

@Controller('/api/configuration/integrations')
export class IntegrationsConfigController {
  /**
   * GET /api/configuration/integrations
   * List all integrations for tenant
   */
  @Get()
  async listIntegrations(request: TenantRequest, reply: FastifyReply) {
    const { container } = await import('../../core/container');
    const configService = container.resolve<ConfigurationService>('ConfigurationService');
    const tenantId = getTenantId(request);
    const integrations = await configService.listIntegrations(tenantId);
    return { data: integrations };
  }

  /**
   * GET /api/configuration/integrations/:provider
   * Get specific integration by provider
   */
  @Get('/:provider')
  async getIntegration(
    request: TenantRequest & FastifyRequest<{ Params: { provider: string } }>,
    reply: FastifyReply
  ) {
    const { container } = await import('../../core/container');
    const configService = container.resolve<ConfigurationService>('ConfigurationService');
    const tenantId = getTenantId(request);
    const integration = await configService.getIntegration(tenantId, request.params.provider);

    if (!integration) {
      reply.code(404);
      return { error: { code: 'NOT_FOUND', message: `Integration '${request.params.provider}' not found` } };
    }

    return { data: integration };
  }

  /**
   * PUT /api/configuration/integrations/:provider
   * Update integration configuration (admin only)
   */
  @Put('/:provider')
  async updateIntegration(
    request: TenantRequest & FastifyRequest<{ Params: { provider: string } }>,
    reply: FastifyReply
  ) {
    const { container } = await import('../../core/container');
    const configService = container.resolve<ConfigurationService>('ConfigurationService');
    const tenantId = getTenantId(request);
    const body = request.body as {
      name?: string;
      status?: string;
      config?: Record<string, any>;
    };

    // RBAC check - only admins can update integrations
    if (request.user?.role !== 'admin' && request.user?.role !== 'super_admin') {
      reply.code(403);
      return { error: { code: 'FORBIDDEN', message: 'Only administrators can update integrations' } };
    }

    const integration = await configService.updateIntegration(
      tenantId,
      request.params.provider,
      body,
      request.user?.id
    );

    if (!integration) {
      reply.code(404);
      return { error: { code: 'NOT_FOUND', message: `Integration '${request.params.provider}' not found` } };
    }

    return { data: integration };
  }

  /**
   * POST /api/configuration/integrations/:provider/test
   * Test integration connection
   */
  @Post('/:provider/test')
  async testIntegration(
    request: TenantRequest & FastifyRequest<{ Params: { provider: string } }>,
    reply: FastifyReply
  ) {
    const { container } = await import('../../core/container');
    const configService = container.resolve<ConfigurationService>('ConfigurationService');
    const tenantId = getTenantId(request);
    const result = await configService.testIntegration(tenantId, request.params.provider);

    if (!result) {
      reply.code(404);
      return { error: { code: 'NOT_FOUND', message: `Integration '${request.params.provider}' not found` } };
    }

    return { data: result };
  }
}
