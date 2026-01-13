/**
 * Block Service
 * Single Responsibility: Handle calendar blocking API operations
 */

import { BaseService } from './base.service';
import type {
  Block,
  BlockQueryParams,
  CreateBlockDTO,
  UpdateBlockDTO,
  ConflictCheckParams,
  ConflictCheckResult,
} from '../types/booking';
import type { PaginatedResponse, SingleResponse, SuccessResponse } from '../types/enums';

export class BlockService extends BaseService {
  constructor() {
    super('/api/blocks');
  }

  /**
   * Get paginated blocks
   */
  async getAll(params?: BlockQueryParams): Promise<PaginatedResponse<Block>> {
    return this.client.get(this.buildPath(), {
      params: params as Record<string, string | number | boolean>,
    });
  }

  /**
   * Get single block by ID
   */
  async getById(id: string): Promise<SingleResponse<Block>> {
    return this.client.get(this.buildPath(`/${id}`));
  }

  /**
   * Create new block
   */
  async create(data: CreateBlockDTO): Promise<SingleResponse<Block>> {
    return this.client.post(this.buildPath(), data);
  }

  /**
   * Update existing block
   */
  async update(id: string, data: UpdateBlockDTO): Promise<SingleResponse<Block>> {
    return this.client.put(this.buildPath(`/${id}`), data);
  }

  /**
   * Delete block
   */
  async delete(id: string): Promise<SuccessResponse> {
    return this.client.delete(this.buildPath(`/${id}`));
  }

  /**
   * Cancel block (soft delete)
   */
  async cancel(id: string): Promise<SingleResponse<Block>> {
    return this.client.put(this.buildPath(`/${id}/cancel`));
  }

  /**
   * Check for conflicts before creating/updating a block
   */
  async checkConflicts(params: ConflictCheckParams): Promise<SingleResponse<ConflictCheckResult>> {
    return this.client.get(this.buildPath('/conflicts'), {
      params: params as unknown as Record<string, string | number | boolean>,
    });
  }

  /**
   * Bulk delete blocks
   * Admin only
   */
  async bulkDelete(ids: string[]): Promise<SuccessResponse> {
    return this.client.post(this.buildPath('/bulk-delete'), { ids });
  }

  /**
   * Get blocks for a specific listing
   */
  async getByListing(
    listingId: string,
    params?: Omit<BlockQueryParams, 'listingId'>
  ): Promise<PaginatedResponse<Block>> {
    return this.client.get(this.buildPath(), {
      params: { listingId, ...params } as Record<string, string | number | boolean>,
    });
  }
}

// Singleton instance
export const blockService = new BlockService();
