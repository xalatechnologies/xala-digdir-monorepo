/**
 * Seasonal Lease Service
 * Handles seasonal lease/rental operations
 */

import { BaseService } from './base.service';
import type {
  PaginatedResponse,
  SeasonalLease,
  CreateSeasonalLeaseDTO,
  UpdateSeasonalLeaseDTO,
  SeasonalLeaseQueryParams
} from '../types';

class SeasonalLeaseService extends BaseService {
  async getAll(params?: SeasonalLeaseQueryParams): Promise<PaginatedResponse<SeasonalLease>> {
    return this.client.get(this.buildPath(), { params });
  }

  async getById(id: string): Promise<{ data: SeasonalLease }> {
    return this.client.get(this.buildPath(`/${id}`));
  }

  async create(data: CreateSeasonalLeaseDTO): Promise<{ data: SeasonalLease }> {
    return this.client.post(this.buildPath(), data);
  }

  async update(id: string, data: UpdateSeasonalLeaseDTO): Promise<{ data: SeasonalLease }> {
    return this.client.patch(this.buildPath(`/${id}`), data);
  }

  async terminate(id: string): Promise<void> {
    return this.client.post(this.buildPath(`/${id}/terminate`), {});
  }

  async delete(id: string): Promise<void> {
    return this.client.delete(this.buildPath(`/${id}`));
  }
}

export const seasonalLeaseService = new SeasonalLeaseService('/seasonal-leases');
