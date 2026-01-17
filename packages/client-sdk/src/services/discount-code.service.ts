/**
 * Discount Code Service
 * Promo codes and discounts management (Admin only)
 */
import { getClient } from '../core/client-factory';

export interface DiscountCode {
  id: string;
  tenantId: string;
  code: string;
  type: 'percentage' | 'fixed' | 'free';
  value: number;
  currency?: string;
  description?: string;
  validFrom?: string;
  validUntil?: string;
  usageLimit?: number;
  usageCount: number;
  minBookingValue?: number;
  applicableRentalObjects?: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface DiscountCodeQueryParams {
  isActive?: boolean;
  type?: string;
  page?: number;
  limit?: number;
}

export interface CreateDiscountCodeDTO {
  code: string;
  type: 'percentage' | 'fixed' | 'free';
  value: number;
  description?: string;
  validFrom?: string;
  validUntil?: string;
  usageLimit?: number;
  minBookingValue?: number;
  applicableRentalObjects?: string[];
  isActive?: boolean;
}

export interface ValidateCodeResult {
  valid: boolean;
  discount?: DiscountCode;
  message?: string;
}

class DiscountCodeService {
  private basePath = '/api/discount-codes';

  /**
   * Get all discount codes
   */
  async getAll(params: DiscountCodeQueryParams = {}): Promise<{ data: DiscountCode[] }> {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) queryParams.set(key, String(value));
    });
    
    const url = queryParams.toString() 
      ? `${this.basePath}?${queryParams.toString()}`
      : this.basePath;
    
    return getClient().get<{ data: DiscountCode[] }>(url);
  }

  /**
   * Get discount code by ID
   */
  async getById(id: string): Promise<{ data: DiscountCode }> {
    return getClient().get<{ data: DiscountCode }>(`${this.basePath}/${id}`);
  }

  /**
   * Create a new discount code
   */
  async create(data: CreateDiscountCodeDTO): Promise<{ data: DiscountCode }> {
    return getClient().post<{ data: DiscountCode }>(this.basePath, data);
  }

  /**
   * Update a discount code
   */
  async update(id: string, data: Partial<CreateDiscountCodeDTO>): Promise<{ data: DiscountCode }> {
    return getClient().put<{ data: DiscountCode }>(`${this.basePath}/${id}`, data);
  }

  /**
   * Delete a discount code
   */
  async deleteById(id: string): Promise<{ success: boolean }> {
    return getClient().delete<{ success: boolean }>(`${this.basePath}/${id}`);
  }

  /**
   * Validate a discount code
   */
  async validate(code: string, rentalObjectId?: string): Promise<ValidateCodeResult> {
    const queryParams = new URLSearchParams({ code });
    if (rentalObjectId) queryParams.set('rentalObjectId', rentalObjectId);

    return getClient().get<ValidateCodeResult>(`${this.basePath}/validate?${queryParams.toString()}`);
  }

  /**
   * Toggle discount code active status
   */
  async toggleActive(id: string): Promise<{ data: DiscountCode }> {
    return getClient().put<{ data: DiscountCode }>(`${this.basePath}/${id}/toggle`);
  }
}

export const discountCodeService = new DiscountCodeService();
