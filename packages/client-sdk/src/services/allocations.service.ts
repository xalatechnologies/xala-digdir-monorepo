/**
 * Allocations Service
 * Handles resource allocation operations for rental objects
 */

import { BaseService } from './base.service';
import type {
  Allocation,
  CreateAllocationDTO,
  UpdateAllocationDTO,
  AllocationQueryParams,
  PaginatedResponse,
  SingleResponse,
} from '@/types';

export class AllocationsService extends BaseService {
  constructor() {
    super('/api/allocations');
  }

  /**
   * Get all allocations with optional filtering
   */
  async getAll(params?: AllocationQueryParams): Promise<PaginatedResponse<Allocation>> {
    return this.client.get(this.buildPath(), { params: params as Record<string, string | number | boolean> });
  }

  /**
   * Get single allocation by ID
   */
  async getById(id: string): Promise<SingleResponse<Allocation>> {
    return this.client.get(this.buildPath(`/${id}`));
  }

  /**
   * Get allocations for a specific rental object
   */
  async getByRentalObject(rentalObjectId: string): Promise<PaginatedResponse<Allocation>> {
    return this.client.get(this.buildPath(), { 
      params: { rentalObjectId } 
    });
  }

  /**
   * Create new allocation
   */
  async create(data: CreateAllocationDTO): Promise<SingleResponse<Allocation>> {
    return this.client.post(this.buildPath(), data);
  }

  /**
   * Update existing allocation
   */
  async update(id: string, data: UpdateAllocationDTO): Promise<SingleResponse<Allocation>> {
    return this.client.put(this.buildPath(`/${id}`), data);
  }

  /**
   * Delete allocation
   */
  async delete(id: string): Promise<void> {
    return this.client.delete(this.buildPath(`/${id}`));
  }

  /**
   * Bulk create allocations
   */
  async bulkCreate(allocations: CreateAllocationDTO[]): Promise<PaginatedResponse<Allocation>> {
    return this.client.post(this.buildPath('/bulk'), { allocations });
  }

  /**
   * Get allocation conflicts for a time range
   */
  async checkConflicts(params: {
    rentalObjectId: string;
    startTime: string;
    endTime: string;
  }): Promise<SingleResponse<{ conflicts: Allocation[] }>> {
    return this.client.post(this.buildPath('/check-conflicts'), params);
  }
}

export const allocationsService = new AllocationsService();
