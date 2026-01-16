/**
 * Metadata Controller
 *
 * REST API endpoints for dynamic metadata (categories, time modes, pricing units, statuses).
 * Replaces hardcoded SDK enums with server-driven metadata.
 *
 * Endpoints:
 * - GET /api/metadata/categories - Get all categories
 * - GET /api/metadata/categories/:key - Get single category
 * - GET /api/metadata/time-modes - Get all time modes
 * - GET /api/metadata/time-modes/:key - Get single time mode
 * - GET /api/metadata/pricing-units - Get all pricing units
 * - GET /api/metadata/pricing-units/:key - Get single pricing unit
 * - GET /api/metadata/statuses - Get all statuses
 * - GET /api/metadata/statuses/:key - Get single status
 *
 * @see /reports/DECOUPLED_ARCHITECTURE_PLAN.md
 */

import { BaseController } from '../../core/base.controller';
import { MetadataService } from './metadata.service';
import type { FastifyRequest, FastifyReply } from 'fastify';
import type { MetadataFilter } from './metadata.types';

interface MetadataQueryParams {
  enabled?: string; // 'true' | 'false'
  statusType?: string;
  parentKey?: string;
}

interface MetadataPathParams {
  key: string;
}

export class MetadataController extends BaseController {
  private service: MetadataService;

  constructor() {
    super();
    this.service = new MetadataService();
  }

  /**
   * GET /api/metadata/categories
   * Get all rental object categories
   */
  async getCategories(
    request: FastifyRequest<{ Querystring: MetadataQueryParams }>,
    reply: FastifyReply
  ): Promise<void> {
    const filter: MetadataFilter = {};

    if (request.query.enabled !== undefined) {
      filter.enabled = request.query.enabled === 'true';
    }

    if (request.query.parentKey) {
      filter.parentKey = request.query.parentKey;
    }

    const response = await this.service.getCategories(filter);
    await this.sendOk(reply, response);
  }

  /**
   * GET /api/metadata/categories/:key
   * Get single category by key
   */
  async getCategoryByKey(
    request: FastifyRequest<{ Params: MetadataPathParams }>,
    reply: FastifyReply
  ): Promise<void> {
    const { key } = request.params;
    const category = await this.service.getCategoryByKey(key);

    if (!category) {
      await this.sendError(reply, this.notFound(`Category '${key}' not found`));
      return;
    }

    await this.sendOk(reply, category);
  }

  /**
   * GET /api/metadata/time-modes
   * Get all time modes
   */
  async getTimeModes(
    request: FastifyRequest<{ Querystring: MetadataQueryParams }>,
    reply: FastifyReply
  ): Promise<void> {
    const filter: MetadataFilter = {};

    if (request.query.enabled !== undefined) {
      filter.enabled = request.query.enabled === 'true';
    }

    const response = await this.service.getTimeModes(filter);
    await this.sendOk(reply, response);
  }

  /**
   * GET /api/metadata/time-modes/:key
   * Get single time mode by key
   */
  async getTimeModeByKey(
    request: FastifyRequest<{ Params: MetadataPathParams }>,
    reply: FastifyReply
  ): Promise<void> {
    const { key } = request.params;
    const timeMode = await this.service.getTimeModeByKey(key);

    if (!timeMode) {
      await this.sendError(reply, this.notFound(`Time mode '${key}' not found`));
      return;
    }

    await this.sendOk(reply, timeMode);
  }

  /**
   * GET /api/metadata/pricing-units
   * Get all pricing units
   */
  async getPricingUnits(
    request: FastifyRequest<{ Querystring: MetadataQueryParams }>,
    reply: FastifyReply
  ): Promise<void> {
    const filter: MetadataFilter = {};

    if (request.query.enabled !== undefined) {
      filter.enabled = request.query.enabled === 'true';
    }

    const response = await this.service.getPricingUnits(filter);
    await this.sendOk(reply, response);
  }

  /**
   * GET /api/metadata/pricing-units/:key
   * Get single pricing unit by key
   */
  async getPricingUnitByKey(
    request: FastifyRequest<{ Params: MetadataPathParams }>,
    reply: FastifyReply
  ): Promise<void> {
    const { key } = request.params;
    const pricingUnit = await this.service.getPricingUnitByKey(key);

    if (!pricingUnit) {
      await this.sendError(reply, this.notFound(`Pricing unit '${key}' not found`));
      return;
    }

    await this.sendOk(reply, pricingUnit);
  }

  /**
   * GET /api/metadata/statuses
   * Get all statuses (filtered by statusType if provided)
   */
  async getStatuses(
    request: FastifyRequest<{ Querystring: MetadataQueryParams }>,
    reply: FastifyReply
  ): Promise<void> {
    const filter: MetadataFilter = {};

    if (request.query.enabled !== undefined) {
      filter.enabled = request.query.enabled === 'true';
    }

    if (request.query.statusType) {
      filter.statusType = request.query.statusType;
    }

    const response = await this.service.getStatuses(filter);
    await this.sendOk(reply, response);
  }

  /**
   * GET /api/metadata/statuses/:key
   * Get single status by key
   */
  async getStatusByKey(
    request: FastifyRequest<{
      Params: MetadataPathParams;
      Querystring: MetadataQueryParams;
    }>,
    reply: FastifyReply
  ): Promise<void> {
    const { key } = request.params;
    const { statusType } = request.query;

    if (!statusType) {
      await this.sendError(
        reply,
        this.badRequest('statusType query parameter is required', {
          statusType: ['statusType is required'],
        })
      );
      return;
    }

    const status = await this.service.getStatusByKey(key, statusType);

    if (!status) {
      await this.sendError(reply, this.notFound(`Status '${key}' not found for type '${statusType}'`));
      return;
    }

    await this.sendOk(reply, status);
  }
}
