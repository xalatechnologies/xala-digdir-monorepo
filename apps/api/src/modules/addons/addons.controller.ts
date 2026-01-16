/**
 * ADD-ONS CONTROLLER
 */

import type { FastifyRequest, FastifyReply } from 'fastify';
import { AddOnsService } from './addons.service';
import { z } from 'zod';

const CreateAddOnSchema = z.object({
  code: z.string().min(1).max(50),
  name: z.string().min(1).max(200),
  description: z.string().max(1000).optional(),
  pricingModel: z.enum(['PER_BOOKING', 'PER_HOUR', 'PER_DAY', 'PER_UNIT']),
  basePriceCents: z.number().int().min(0),
  isRequired: z.boolean().optional(),
  maxUnits: z.number().int().min(1).optional(),
});

const UpdateAddOnSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  description: z.string().max(1000).optional(),
  basePriceCents: z.number().int().min(0).optional(),
  isRequired: z.boolean().optional(),
  maxUnits: z.number().int().min(1).optional(),
  isActive: z.boolean().optional(),
});

const AssignAddOnsSchema = z.object({
  addonIds: z.array(z.string().uuid()),
});

export class AddOnsController {
  constructor(private readonly service: AddOnsService) {}

  async listAddOns(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const { tenantId } = request.user;
    const addons = await this.service.listAddOns(tenantId);
    reply.code(200).send({ data: addons, meta: { total: addons.length } });
  }

  async getAddOn(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply
  ): Promise<void> {
    const { id } = request.params;
    const { tenantId } = request.user;
    const addon = await this.service.getAddOn(id, tenantId);

    if (!addon) {
      return reply.code(404).send({
        type: 'https://api.digilist.no/errors/not-found',
        title: 'Add-on Not Found',
        status: 404,
        instance: request.url,
      });
    }

    reply.code(200).send({ data: addon });
  }

  async createAddOn(request: FastifyRequest<{ Body: unknown }>, reply: FastifyReply): Promise<void> {
    const data = CreateAddOnSchema.parse(request.body);
    const { tenantId, userId } = request.user;
    const addon = await this.service.createAddOn(data, tenantId, userId);
    reply.code(201).send({ data: addon });
  }

  async updateAddOn(
    request: FastifyRequest<{ Params: { id: string }; Body: unknown }>,
    reply: FastifyReply
  ): Promise<void> {
    const { id } = request.params;
    const data = UpdateAddOnSchema.parse(request.body);
    const { tenantId, userId } = request.user;

    try {
      const addon = await this.service.updateAddOn(id, data, tenantId, userId);
      reply.code(200).send({ data: addon });
    } catch (error: any) {
      if (error.message === 'Add-on not found') {
        return reply.code(404).send({
          type: 'https://api.digilist.no/errors/not-found',
          title: 'Add-on Not Found',
          status: 404,
          instance: request.url,
        });
      }
      throw error;
    }
  }

  async deleteAddOn(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply
  ): Promise<void> {
    const { id } = request.params;
    const { tenantId, userId } = request.user;

    try {
      await this.service.deleteAddOn(id, tenantId, userId);
      reply.code(204).send();
    } catch (error: any) {
      if (error.message === 'Add-on not found') {
        return reply.code(404).send({
          type: 'https://api.digilist.no/errors/not-found',
          title: 'Add-on Not Found',
          status: 404,
          instance: request.url,
        });
      }
      throw error;
    }
  }

  async getAddOnsForRentalObject(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply
  ): Promise<void> {
    const { id } = request.params;
    const { tenantId } = request.user;
    const addons = await this.service.getAddOnsForRentalObject(id, tenantId);
    reply.code(200).send({ data: addons });
  }

  async assignAddOnsToRentalObject(
    request: FastifyRequest<{ Params: { id: string }; Body: unknown }>,
    reply: FastifyReply
  ): Promise<void> {
    const { id } = request.params;
    const { addonIds } = AssignAddOnsSchema.parse(request.body);
    const { tenantId, userId } = request.user;
    await this.service.assignAddOnsToRentalObject(id, addonIds, tenantId, userId);
    reply.code(204).send();
  }
}
