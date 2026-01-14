/**
 * Backoffice Controllers
 * RBAC-protected endpoints for admin operations
 */

import { Controller, Get, Post, Put, Patch, Delete } from '../../core/decorators';
import { mockDb } from '../../adapters/db.adapter';
import { validate } from '../../core/validation/zod-pipe';
import { CreateUserGroupSchema } from '../../schemas/user-group.schema';
import { CreatePriceRuleSchema, UpsertListingRulesSchema } from '../../schemas/price-rules.schema';
import { createProblemDetails } from '../../core/errors/problem-details';
import type { FastifyRequest, FastifyReply } from 'fastify';

// =============================================================================
// User Groups Controller
// =============================================================================
@Controller('/backoffice/user-groups')
export class BackofficeUserGroupsController {
  /**
   * GET /backoffice/user-groups
   */
  @Get()
  async list(_request: FastifyRequest, reply: FastifyReply) {
    const groups = await mockDb.query('SELECT * FROM user_groups ORDER BY name');
    return reply.send({
      data: groups || [],
      meta: { total: groups?.length || 0 },
    });
  }

  /**
   * POST /backoffice/user-groups
   */
  @Post()
  async create(request: FastifyRequest, reply: FastifyReply) {
    const data = validate(CreateUserGroupSchema, request.body);
    
    const existing = await mockDb.query('SELECT id FROM user_groups WHERE code = $1', [data.code]);
    if (existing) {
      return reply.status(409).send(createProblemDetails({
        type: 'conflict',
        title: 'Conflict',
        status: 409,
        detail: `User group with code ${data.code} already exists`,
        instance: '/backoffice/user-groups',
      }));
    }
    
    const group = await mockDb.insert('user_groups', data);
    return reply.status(201).send({ data: group });
  }
}

// =============================================================================
// Price Rules Controller
// =============================================================================
@Controller('/backoffice/listings')
export class BackofficePriceRulesController {
  /**
   * GET /backoffice/listings/:id/price-rules
   */
  @Get('/:id/price-rules')
  async getPriceRules(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    const { id } = request.params;
    const rules = await mockDb.query('SELECT * FROM price_rules WHERE listing_id = $1 ORDER BY priority DESC', [id]);
    return reply.send({
      data: rules || [],
      meta: { total: rules?.length || 0 },
    });
  }

  /**
   * PUT /backoffice/listings/:id/price-rules
   * Replace all price rules for a listing
   */
  @Put('/:id/price-rules')
  async replacePriceRules(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    const { id } = request.params;
    const body = request.body as { rules: any[] };
    
    if (!body.rules || !Array.isArray(body.rules)) {
      return reply.status(400).send(createProblemDetails({
        type: 'validation-error',
        title: 'Validation Error',
        status: 400,
        detail: 'Request body must contain a "rules" array',
        instance: `/backoffice/listings/${id}/price-rules`,
      }));
    }
    
    // Validate each rule
    const validatedRules = body.rules.map(rule => 
      validate(CreatePriceRuleSchema, { ...rule, listingId: id })
    );
    
    // Delete existing rules and insert new ones
    await mockDb.query('DELETE FROM price_rules WHERE listing_id = $1', [id]);
    
    const inserted = [];
    for (const rule of validatedRules) {
      const r = await mockDb.insert('price_rules', rule);
      inserted.push(r);
    }
    
    return reply.send({
      data: inserted,
      meta: { total: inserted.length },
    });
  }

  /**
   * GET /backoffice/listings/:id/rules
   */
  @Get('/:id/rules')
  async getListingRules(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    const { id } = request.params;
    const rules = await mockDb.query('SELECT * FROM listing_rules WHERE listing_id = $1', [id]);
    return reply.send({ data: rules || null });
  }

  /**
   * PUT /backoffice/listings/:id/rules
   * Upsert listing rules
   */
  @Put('/:id/rules')
  async upsertListingRules(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    const { id } = request.params;
    const data = validate(UpsertListingRulesSchema, request.body);
    
    // Check if rules exist
    const existing = await mockDb.query('SELECT id FROM listing_rules WHERE listing_id = $1', [id]);
    
    let result;
    if (existing) {
      result = await mockDb.query(
        'UPDATE listing_rules SET approval_required = $1, min_age = $2, cancellation_deadline_days = $3, cancellation_fee_percent = $4, notes = $5, updated_at = NOW() WHERE listing_id = $6 RETURNING *',
        [data.approvalRequired, data.minAge, data.cancellationDeadlineDays, data.cancellationFeePercent, data.notes, id]
      );
    } else {
      result = await mockDb.insert('listing_rules', {
        listing_id: id,
        ...data,
      });
    }
    
    return reply.send({ data: result });
  }
}

// =============================================================================
// Backoffice Listings Controller (extended)
// =============================================================================
@Controller('/backoffice/listings')
export class BackofficeListingsController {
  /**
   * GET /backoffice/listings
   * List all listings (any status)
   */
  @Get()
  async list(request: FastifyRequest, reply: FastifyReply) {
    const query = request.query as { status?: string; category?: string; search?: string; page?: string; limit?: string };
    
    let sql = 'SELECT * FROM listings WHERE 1=1';
    const params: any[] = [];
    let paramIndex = 1;
    
    if (query.status) {
      sql += ` AND status = $${paramIndex++}`;
      params.push(query.status);
    }
    if (query.category) {
      sql += ` AND category = $${paramIndex++}`;
      params.push(query.category);
    }
    if (query.search) {
      sql += ` AND (name ILIKE $${paramIndex} OR description ILIKE $${paramIndex})`;
      params.push(`%${query.search}%`);
      paramIndex++;
    }
    
    sql += ' ORDER BY created_at DESC';
    
    const listings = await mockDb.query(sql, params);
    
    return reply.send({
      data: listings || [],
      meta: {
        total: listings?.length || 0,
        page: parseInt(query.page || '1'),
        limit: parseInt(query.limit || '20'),
      },
    });
  }

  /**
   * POST /backoffice/listings
   */
  @Post()
  async create(request: FastifyRequest, reply: FastifyReply) {
    const body = request.body as any;
    const listing = await mockDb.insert('listings', {
      ...body,
      status: 'draft',
    });
    return reply.status(201).send({ data: listing });
  }

  /**
   * PATCH /backoffice/listings/:id
   */
  @Patch('/:id')
  async update(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    const { id } = request.params;
    const body = request.body as any;
    
    const listing = await mockDb.query('SELECT * FROM listings WHERE id = $1', [id]);
    if (!listing) {
      return reply.status(404).send(createProblemDetails({
        type: 'not-found',
        title: 'Not Found',
        status: 404,
        detail: `Listing ${id} not found`,
        instance: `/backoffice/listings/${id}`,
      }));
    }
    
    const updated = await mockDb.update('listings', id, body);
    return reply.send({ data: updated });
  }
}
