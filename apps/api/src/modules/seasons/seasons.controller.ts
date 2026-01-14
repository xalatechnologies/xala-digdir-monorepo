/**
 * Seasons Controller
 * Seasonal booking management endpoints
 * 
 * Endpoints:
 * - GET /api/seasons - List all seasons
 * - GET /api/seasons/:id - Get season by ID
 * - POST /api/seasons - Create a new season
 * - PUT /api/seasons/:id - Update season
 * - DELETE /api/seasons/:id - Delete season
 */

import { Controller, Get, Post, Put, Delete } from '../../core/decorators';
import type { FastifyRequest, FastifyReply } from 'fastify';

interface Season {
  id: string;
  name: string;
  description?: string;
  startDate: string;
  endDate: string;
  status: 'draft' | 'active' | 'closed' | 'archived';
  applicationDeadline?: string;
  settings?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

// Mock seasons data
const mockSeasons: Season[] = [
  {
    id: 'season-2026-spring',
    name: 'Vår 2026',
    description: 'Vårsesong 2026 for hallfordeling',
    startDate: '2026-01-15',
    endDate: '2026-06-30',
    status: 'active',
    applicationDeadline: '2026-01-10',
    createdAt: '2025-12-01T10:00:00Z',
    updatedAt: '2026-01-10T08:00:00Z',
  },
  {
    id: 'season-2025-fall',
    name: 'Høst 2025',
    description: 'Høstsesong 2025',
    startDate: '2025-08-15',
    endDate: '2025-12-31',
    status: 'closed',
    applicationDeadline: '2025-08-01',
    createdAt: '2025-06-01T10:00:00Z',
    updatedAt: '2025-12-31T23:59:59Z',
  },
];

@Controller('/api/seasons')
export class SeasonsController {
  /**
   * GET /api/seasons
   * List all seasons
   */
  @Get()
  async findAll(request: FastifyRequest, reply: FastifyReply) {
    const query = request.query as { status?: string; limit?: string; offset?: string };
    
    let seasons = [...mockSeasons];
    
    if (query.status) {
      seasons = seasons.filter(s => s.status === query.status);
    }
    
    // Sort by startDate descending
    seasons.sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());
    
    const limit = parseInt(query.limit || '20', 10);
    const offset = parseInt(query.offset || '0', 10);
    const paginated = seasons.slice(offset, offset + limit);
    
    return reply.send({
      data: paginated,
      meta: {
        total: seasons.length,
        limit,
        offset,
      },
    });
  }

  /**
   * GET /api/seasons/:id
   * Get season by ID
   */
  @Get('/:id')
  async findById(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };
    const season = mockSeasons.find(s => s.id === id);
    
    if (!season) {
      return reply.status(404).send({
        error: 'not_found',
        message: `Season ${id} not found`,
      });
    }
    
    return reply.send({ data: season });
  }

  /**
   * POST /api/seasons
   * Create a new season
   */
  @Post()
  async create(request: FastifyRequest, reply: FastifyReply) {
    const body = request.body as Partial<Season>;
    
    const newSeason: Season = {
      id: `season-${Date.now()}`,
      name: body.name || 'New Season',
      description: body.description,
      startDate: body.startDate || new Date().toISOString().split('T')[0],
      endDate: body.endDate || new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status: body.status || 'draft',
      applicationDeadline: body.applicationDeadline,
      settings: body.settings,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    mockSeasons.push(newSeason);
    
    return reply.status(201).send({
      data: newSeason,
      message: 'Season created successfully',
    });
  }

  /**
   * PUT /api/seasons/:id
   * Update season
   */
  @Put('/:id')
  async update(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };
    const body = request.body as Partial<Season>;
    
    const index = mockSeasons.findIndex(s => s.id === id);
    
    if (index === -1) {
      return reply.status(404).send({
        error: 'not_found',
        message: `Season ${id} not found`,
      });
    }
    
    mockSeasons[index] = {
      ...mockSeasons[index],
      ...body,
      updatedAt: new Date().toISOString(),
    };
    
    return reply.send({
      data: mockSeasons[index],
      message: 'Season updated successfully',
    });
  }

  /**
   * DELETE /api/seasons/:id
   * Delete season
   */
  @Delete('/:id')
  async delete(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };
    const index = mockSeasons.findIndex(s => s.id === id);
    
    if (index === -1) {
      return reply.status(404).send({
        error: 'not_found',
        message: `Season ${id} not found`,
      });
    }
    
    mockSeasons.splice(index, 1);
    
    return reply.send({
      message: 'Season deleted successfully',
    });
  }
}

export default SeasonsController;
