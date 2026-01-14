/**
 * Blocks Controller
 * Calendar blocking/availability management
 * 
 * Endpoints:
 * - GET /api/blocks - List all blocks
 * - GET /api/blocks/:id - Get block by ID
 * - POST /api/blocks - Create a new block
 * - PUT /api/blocks/:id - Update block
 * - DELETE /api/blocks/:id - Delete block
 */

import { Controller, Get, Post, Put, Delete } from '../../core/decorators';
import type { FastifyRequest, FastifyReply } from 'fastify';

interface Block {
  id: string;
  listingId: string;
  title: string;
  reason?: string;
  startDate: string;
  endDate: string;
  allDay: boolean;
  recurring?: boolean;
  recurrenceRule?: string;
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
}

// Mock blocks data
const mockBlocks: Block[] = [
  {
    id: 'block-1',
    listingId: '10000001-0000-0000-0000-000000000001',
    title: 'Vedlikehold',
    reason: 'Årlig vedlikehold og rengjøring',
    startDate: '2026-02-01T08:00:00Z',
    endDate: '2026-02-03T17:00:00Z',
    allDay: true,
    recurring: false,
    createdAt: '2026-01-10T10:00:00Z',
    updatedAt: '2026-01-10T10:00:00Z',
  },
  {
    id: 'block-2',
    listingId: '10000001-0000-0000-0000-000000000001',
    title: 'Kommunal arrangement',
    reason: 'Reservert for kommunalt arrangement',
    startDate: '2026-01-20T09:00:00Z',
    endDate: '2026-01-20T16:00:00Z',
    allDay: false,
    recurring: false,
    createdAt: '2026-01-05T14:30:00Z',
    updatedAt: '2026-01-05T14:30:00Z',
  },
];

@Controller('/api/blocks')
export class BlocksController {
  /**
   * GET /api/blocks
   * List all blocks
   */
  @Get()
  async findAll(request: FastifyRequest, reply: FastifyReply) {
    const query = request.query as { listingId?: string; from?: string; to?: string; limit?: string };
    
    let blocks = [...mockBlocks];
    
    if (query.listingId) {
      blocks = blocks.filter(b => b.listingId === query.listingId);
    }
    
    if (query.from) {
      blocks = blocks.filter(b => new Date(b.startDate) >= new Date(query.from!));
    }
    
    if (query.to) {
      blocks = blocks.filter(b => new Date(b.endDate) <= new Date(query.to!));
    }
    
    return reply.send({
      data: blocks,
      meta: {
        total: blocks.length,
        limit: parseInt(query.limit || '50'),
      },
    });
  }

  /**
   * GET /api/blocks/:id
   * Get block by ID
   */
  @Get('/:id')
  async findById(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };
    const block = mockBlocks.find(b => b.id === id);
    
    if (!block) {
      return reply.status(404).send({
        error: 'not_found',
        message: `Block ${id} not found`,
      });
    }
    
    return reply.send({ data: block });
  }

  /**
   * POST /api/blocks
   * Create a new block
   */
  @Post()
  async create(request: FastifyRequest, reply: FastifyReply) {
    const body = request.body as Partial<Block>;
    
    const newBlock: Block = {
      id: `block-${Date.now()}`,
      listingId: body.listingId || '',
      title: body.title || 'Blocked',
      reason: body.reason,
      startDate: body.startDate || new Date().toISOString(),
      endDate: body.endDate || new Date(Date.now() + 3600000).toISOString(),
      allDay: body.allDay ?? false,
      recurring: body.recurring ?? false,
      recurrenceRule: body.recurrenceRule,
      createdBy: body.createdBy,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    mockBlocks.push(newBlock);
    
    return reply.status(201).send({
      data: newBlock,
      message: 'Block created successfully',
    });
  }

  /**
   * PUT /api/blocks/:id
   * Update block
   */
  @Put('/:id')
  async update(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };
    const body = request.body as Partial<Block>;
    
    const index = mockBlocks.findIndex(b => b.id === id);
    
    if (index === -1) {
      return reply.status(404).send({
        error: 'not_found',
        message: `Block ${id} not found`,
      });
    }
    
    mockBlocks[index] = {
      ...mockBlocks[index],
      ...body,
      updatedAt: new Date().toISOString(),
    };
    
    return reply.send({
      data: mockBlocks[index],
      message: 'Block updated successfully',
    });
  }

  /**
   * DELETE /api/blocks/:id
   * Delete block
   */
  @Delete('/:id')
  async delete(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };
    const index = mockBlocks.findIndex(b => b.id === id);
    
    if (index === -1) {
      return reply.status(404).send({
        error: 'not_found',
        message: `Block ${id} not found`,
      });
    }
    
    mockBlocks.splice(index, 1);
    
    return reply.send({
      message: 'Block deleted successfully',
    });
  }
}

export default BlocksController;
