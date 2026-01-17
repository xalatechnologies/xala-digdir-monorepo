/**
 * Blocks Service
 * Service for calendar block CRUD operations
 */
import { getClient } from '../core/client-factory';
import type {
  Block,
  CreateBlockDTO,
  UpdateBlockDTO,
  ConflictCheckParams,
  ConflictsResponse,
} from '../types/additional';

export interface BlockQueryParams {
  rentalObjectId?: string;
  from?: string;
  to?: string;
  status?: string;
  scope?: 'all' | 'assigned';
  limit?: number;
  offset?: number;
}

export interface BlockListResponse {
  data: Block[];
  meta: {
    total: number;
    limit: number;
    offset: number;
  };
}

/**
 * Blocks Service
 * Provides methods for block CRUD operations
 */
export const blocksService = {
  /**
   * Get all blocks with optional filtering
   */
  async getAll(params?: BlockQueryParams): Promise<BlockListResponse> {
    const queryParams = new URLSearchParams();
    if (params?.rentalObjectId) queryParams.set('rentalObjectId', params.rentalObjectId);
    if (params?.from) queryParams.set('from', params.from);
    if (params?.to) queryParams.set('to', params.to);
    if (params?.status) queryParams.set('status', params.status);
    if (params?.scope) queryParams.set('scope', params.scope);
    if (params?.limit) queryParams.set('limit', params.limit.toString());
    if (params?.offset) queryParams.set('offset', params.offset.toString());

    const url = queryParams.toString() ? `/api/blocks?${queryParams}` : '/api/blocks';
    return getClient().get<BlockListResponse>(url);
  },

  /**
   * Get a single block by ID
   */
  async getById(id: string): Promise<{ data: Block }> {
    return getClient().get<{ data: Block }>(`/api/blocks/${id}`);
  },

  /**
   * Create a new block
   */
  async create(data: CreateBlockDTO): Promise<{ data: Block; message: string }> {
    return getClient().post<{ data: Block; message: string }>('/api/blocks', data);
  },

  /**
   * Update an existing block
   */
  async update(id: string, data: UpdateBlockDTO): Promise<{ data: Block; message: string }> {
    return getClient().put<{ data: Block; message: string }>(`/api/blocks/${id}`, data);
  },

  /**
   * Delete a block
   */
  async delete(id: string): Promise<{ message: string }> {
    return getClient().delete<{ message: string }>(`/api/blocks/${id}`);
  },

  /**
   * Check for conflicts before creating/updating a block
   */
  async checkConflicts(params: ConflictCheckParams): Promise<{ data: ConflictsResponse }> {
    const queryParams = new URLSearchParams({
      rentalObjectId: params.rentalObjectId,
      startTime: params.startTime,
      endTime: params.endTime,
    });
    if (params.excludeBlockId) {
      queryParams.set('excludeBlockId', params.excludeBlockId);
    }
    return getClient().get<{ data: ConflictsResponse }>(`/api/blocks/conflicts?${queryParams}`);
  },
};

export default blocksService;
