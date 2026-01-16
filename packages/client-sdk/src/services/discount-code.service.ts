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
  applicableListings?: string[];
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
  applicableListings?: string[];
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
   * Get all discount codes with optional filtering
   * Admin only operation for managing promotional codes
   *
   * @param params - Optional query parameters for filtering and pagination
   * @returns Promise resolving to array of discount codes
   *
   * @example
   * ```typescript
   * // Get all active discount codes
   * const activeCodes = await discountCodeService.getAll({ isActive: true });
   *
   * // Get percentage-based discounts
   * const percentageCodes = await discountCodeService.getAll({
   *   type: 'percentage',
   *   page: 1,
   *   limit: 20
   * });
   * ```
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
   * Get a specific discount code by ID
   *
   * @param id - The discount code ID
   * @returns Promise resolving to the discount code
   *
   * @example
   * ```typescript
   * const code = await discountCodeService.getById('code-123');
   * console.log(`Code: ${code.data.code}, Used: ${code.data.usageCount}/${code.data.usageLimit || 'unlimited'}`);
   * ```
   */
  async getById(id: string): Promise<{ data: DiscountCode }> {
    return getClient().get<{ data: DiscountCode }>(`${this.basePath}/${id}`);
  }

  /**
   * Create a new discount code for promotional campaigns
   * Admin only operation
   *
   * @param data - Discount code creation data
   * @returns Promise resolving to the created discount code
   *
   * @example
   * ```typescript
   * // Create a 20% discount code for summer campaign
   * const summerCode = await discountCodeService.create({
   *   code: 'SUMMER2024',
   *   type: 'percentage',
   *   value: 20,
   *   description: 'Summer campaign 20% off',
   *   validFrom: '2024-06-01T00:00:00Z',
   *   validUntil: '2024-08-31T23:59:59Z',
   *   usageLimit: 100,
   *   minBookingValue: 50000, // 500 kr minimum
   *   isActive: true
   * });
   *
   * // Create a fixed amount discount
   * const fixedDiscount = await discountCodeService.create({
   *   code: 'WELCOME50',
   *   type: 'fixed',
   *   value: 5000, // 50 kr in øre
   *   description: 'Welcome bonus',
   *   usageLimit: 1
   * });
   * ```
   */
  async create(data: CreateDiscountCodeDTO): Promise<{ data: DiscountCode }> {
    return getClient().post<{ data: DiscountCode }>(this.basePath, data);
  }

  /**
   * Update an existing discount code (partial update)
   *
   * @param id - The discount code ID to update
   * @param data - Partial discount code data to update
   * @returns Promise resolving to the updated discount code
   *
   * @example
   * ```typescript
   * // Extend validity period
   * const extended = await discountCodeService.update('code-123', {
   *   validUntil: '2024-12-31T23:59:59Z'
   * });
   *
   * // Increase usage limit
   * const updated = await discountCodeService.update('code-456', {
   *   usageLimit: 200
   * });
   * ```
   */
  async update(id: string, data: Partial<CreateDiscountCodeDTO>): Promise<{ data: DiscountCode }> {
    return getClient().put<{ data: DiscountCode }>(`${this.basePath}/${id}`, data);
  }

  /**
   * Delete a discount code permanently
   * Use toggleActive() to deactivate instead if you want to preserve history
   *
   * @param id - The discount code ID to delete
   * @returns Promise resolving to success status
   *
   * @example
   * ```typescript
   * await discountCodeService.delete('code-123');
   * console.log('Discount code deleted');
   * ```
   */
  async delete(id: string): Promise<{ success: boolean }> {
    return getClient().delete<{ success: boolean }>(`${this.basePath}/${id}`);
  }

  /**
   * Validate a discount code before applying to a booking
   * Checks code existence, expiry, usage limits, and listing applicability
   *
   * @param code - The discount code string to validate
   * @param listingId - Optional listing ID to check applicability
   * @returns Promise resolving to validation result with discount details
   *
   * @example
   * ```typescript
   * // Validate code for general use
   * const validation = await discountCodeService.validate('SUMMER2024');
   * if (validation.valid) {
   *   console.log(`Discount: ${validation.discount.value}% off`);
   * } else {
   *   console.log(`Invalid: ${validation.message}`);
   * }
   *
   * // Validate code for specific listing
   * const listingValidation = await discountCodeService.validate('GYMSAL10', 'listing-123');
   * if (listingValidation.valid) {
   *   console.log('Code is valid for this listing');
   * }
   * ```
   */
  async validate(code: string, listingId?: string): Promise<ValidateCodeResult> {
    const queryParams = new URLSearchParams({ code });
    if (listingId) queryParams.set('listingId', listingId);
    
    return getClient().get<ValidateCodeResult>(`${this.basePath}/validate?${queryParams.toString()}`);
  }

  /**
   * Toggle the active status of a discount code
   * Preferred over delete() for preserving usage history
   *
   * @param id - The discount code ID to toggle
   * @returns Promise resolving to the updated discount code
   *
   * @example
   * ```typescript
   * // Deactivate a code that reached its limit
   * const deactivated = await discountCodeService.toggleActive('code-123');
   * console.log(`Code is now ${deactivated.data.isActive ? 'active' : 'inactive'}`);
   *
   * // Reactivate for a new campaign
   * const reactivated = await discountCodeService.toggleActive('code-456');
   * ```
   */
  async toggleActive(id: string): Promise<{ data: DiscountCode }> {
    return getClient().put<{ data: DiscountCode }>(`${this.basePath}/${id}/toggle`);
  }
}

export const discountCodeService = new DiscountCodeService();
