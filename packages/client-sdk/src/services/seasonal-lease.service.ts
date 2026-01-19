/**
 * Seasonal Lease Service
 * Handles seasonal/long-term booking and lease management
 */

import { BaseService } from './base.service';
import type {
  SeasonalLease,
  CreateSeasonalLeaseDTO,
  UpdateSeasonalLeaseDTO,
  SeasonalLeaseQueryParams,
  PaginatedResponse,
  SingleResponse,
} from '../types';

export class SeasonalLeaseService extends BaseService {
  constructor() {
    super('/api/seasonal-lease');
  }

  /**
   * Get all seasonal leases
   */
  async getAll(params?: SeasonalLeaseQueryParams): Promise<PaginatedResponse<SeasonalLease>> {
    return this.client.get(this.buildPath(), { params: params as Record<string, string | number | boolean> });
  }

  /**
   * Get single seasonal lease by ID
   */
  async getById(id: string): Promise<SingleResponse<SeasonalLease>> {
    return this.client.get(this.buildPath(`/${id}`));
  }

  /**
   * Get leases for a specific season
   */
  async getForSeason(seasonId: string): Promise<PaginatedResponse<SeasonalLease>> {
    return this.client.get(this.buildPath(`/season/${seasonId}`));
  }

  /**
   * Get leases for a specific rental object
   */
  async getForRentalObject(rentalObjectId: string): Promise<PaginatedResponse<SeasonalLease>> {
    return this.client.get(this.buildPath(`/rental-object/${rentalObjectId}`));
  }

  /**
   * Get leases for current user
   */
  async getMyLeases(): Promise<PaginatedResponse<SeasonalLease>> {
    return this.client.get(this.buildPath('/my'));
  }

  /**
   * Create seasonal lease
   */
  async create(data: CreateSeasonalLeaseDTO): Promise<SingleResponse<SeasonalLease>> {
    return this.client.post(this.buildPath(), data);
  }

  /**
   * Update seasonal lease
   */
  async update(id: string, data: UpdateSeasonalLeaseDTO): Promise<SingleResponse<SeasonalLease>> {
    return this.client.put(this.buildPath(`/${id}`), data);
  }

  /**
   * Cancel seasonal lease
   */
  async cancel(id: string, reason?: string): Promise<SingleResponse<SeasonalLease>> {
    return this.client.post(this.buildPath(`/${id}/cancel`), { reason });
  }

  /**
   * Renew seasonal lease
   */
  async renew(id: string, data: { nextSeasonId: string }): Promise<SingleResponse<SeasonalLease>> {
    return this.client.post(this.buildPath(`/${id}/renew`), data);
  }

  /**
   * Get lease payment schedule
   */
  async getPaymentSchedule(id: string): Promise<SingleResponse<{
    totalAmount: number;
    payments: Array<{
      dueDate: string;
      amount: number;
      status: 'pending' | 'paid' | 'overdue';
    }>;
  }>> {
    return this.client.get(this.buildPath(`/${id}/payment-schedule`));
  }

  /**
   * Record payment for lease
   */
  async recordPayment(id: string, data: {
    amount: number;
    paymentMethod: string;
    transactionId?: string;
  }): Promise<SingleResponse<void>> {
    return this.client.post(this.buildPath(`/${id}/payment`), data);
  }

  /**
   * Get lease contract document
   */
  async getContract(id: string): Promise<Blob> {
    const response = await this.client.get(this.buildPath(`/${id}/contract`), {
      responseType: 'blob',
    });
    return response as unknown as Blob;
  }

  /**
   * Upload signed contract
   */
  async uploadSignedContract(id: string, file: File): Promise<SingleResponse<void>> {
    const formData = new FormData();
    formData.append('contract', file);
    return this.client.post(this.buildPath(`/${id}/signed-contract`), formData);
  }

  /**
   * Terminate lease early
   */
  async terminate(id: string, data: {
    terminationDate: string;
    reason: string;
  }): Promise<SingleResponse<SeasonalLease>> {
    return this.client.post(this.buildPath(`/${id}/terminate`), data);
  }
}

export const seasonalLeaseService = new SeasonalLeaseService();
