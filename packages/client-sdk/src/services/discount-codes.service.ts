/**
 * Discount Codes Service
 * Handles discount/promo code management and validation
 */

import { BaseService } from './base.service';
import type {
  DiscountCode,
  CreateDiscountCodeDTO,
  UpdateDiscountCodeDTO,
  DiscountCodeQueryParams,
  ValidateDiscountCodeDTO,
  PaginatedResponse,
  SingleResponse,
} from '@/types';

export class DiscountCodesService extends BaseService {
  constructor() {
    super('/api/discount-codes');
  }

  /**
   * Get all discount codes with optional filtering
   */
  async getAll(params?: DiscountCodeQueryParams): Promise<PaginatedResponse<DiscountCode>> {
    return this.client.get(this.buildPath(), { params: params as Record<string, string | number | boolean> });
  }

  /**
   * Get single discount code by ID
   */
  async getById(id: string): Promise<SingleResponse<DiscountCode>> {
    return this.client.get(this.buildPath(`/${id}`));
  }

  /**
   * Get discount code by code string
   */
  async getByCode(code: string): Promise<SingleResponse<DiscountCode>> {
    return this.client.get(this.buildPath(`/code/${code}`));
  }

  /**
   * Create new discount code
   */
  async create(data: CreateDiscountCodeDTO): Promise<SingleResponse<DiscountCode>> {
    return this.client.post(this.buildPath(), data);
  }

  /**
   * Update existing discount code
   */
  async update(id: string, data: UpdateDiscountCodeDTO): Promise<SingleResponse<DiscountCode>> {
    return this.client.put(this.buildPath(`/${id}`), data);
  }

  /**
   * Delete discount code
   */
  async deleteCode(id: string): Promise<void> {
    return this.client.delete(this.buildPath(`/${id}`));
  }

  /**
   * Validate discount code for a booking
   * Returns the discount amount if valid
   */
  async validate(data: ValidateDiscountCodeDTO): Promise<SingleResponse<{
    valid: boolean;
    discountAmount: number;
    discountType: 'percentage' | 'fixed';
    message?: string;
  }>> {
    return this.client.post(this.buildPath('/validate'), data);
  }

  /**
   * Apply discount code to a booking
   */
  async apply(code: string, bookingId: string): Promise<SingleResponse<{
    appliedDiscount: number;
    newTotal: number;
  }>> {
    return this.client.post(this.buildPath('/apply'), { code, bookingId });
  }

  /**
   * Get discount code usage statistics
   */
  async getUsageStats(id: string): Promise<SingleResponse<{
    timesUsed: number;
    totalDiscount: number;
    remainingUses?: number;
  }>> {
    return this.client.get(this.buildPath(`/${id}/stats`));
  }

  /**
   * Deactivate discount code
   */
  async deactivate(id: string): Promise<SingleResponse<DiscountCode>> {
    return this.client.post(this.buildPath(`/${id}/deactivate`), {});
  }

  /**
   * Activate discount code
   */
  async activate(id: string): Promise<SingleResponse<DiscountCode>> {
    return this.client.post(this.buildPath(`/${id}/activate`), {});
  }
}

export const discountCodesService = new DiscountCodesService();
