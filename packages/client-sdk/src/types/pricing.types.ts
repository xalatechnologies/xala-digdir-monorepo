/**
 * Pricing Type Definitions
 * 
 * Types for pricing groups and rental object pricing
 */

// ====================================================================
// PRICING GROUP
// ====================================================================

export interface PricingGroup {
  id: string;
  tenantId: string;
  code: string;
  name: string;
  description?: string;
  
  // Discounts
  discountPercentage: number; // 0-100
  
  // Settings
  isActive: boolean;
  requiresVerification: boolean;
  
  // Metadata
  displayOrder: number;
  
  // Timestamps
  createdAt: string;
  updatedAt: string;
}

export interface PricingGroupListResponse {
  data: PricingGroup[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// ====================================================================
// RENTAL OBJECT PRICING
// ====================================================================

export interface RentalObjectPricing {
  id: string;
  rentalObjectId: string;
  pricingGroupId: string;
  tenantId: string;
  
  // Pricing details
  basePriceCents: number;
  discountPercentage: number;
  finalPriceCents: number;
  
  // Deposit
  requiresDeposit: boolean;
  depositAmountCents?: number;
  
  // Tax
  taxRate: number; // e.g., 0.25 for 25% MVA
  
  // Timestamps
  createdAt: string;
  updatedAt: string;
  
  // Relations
  pricingGroup?: PricingGroup;
}

// ====================================================================
// QUERY PARAMETERS
// ====================================================================

export interface ListPricingGroupsQuery {
  page?: number;
  limit?: number;
  search?: string;
  isActive?: boolean;
  sortBy?: 'name' | 'code' | 'discountPercentage' | 'displayOrder';
  sortOrder?: 'asc' | 'desc';
}

// ====================================================================
// REQUEST DTOs
// ====================================================================

export interface CreatePricingGroupDTO {
  code: string;
  name: string;
  description?: string;
  discountPercentage: number;
  requiresVerification?: boolean;
  displayOrder?: number;
}

export interface UpdatePricingGroupDTO {
  name?: string;
  description?: string;
  discountPercentage?: number;
  isActive?: boolean;
  requiresVerification?: boolean;
  displayOrder?: number;
}

export interface UpdateRentalObjectPricingDTO {
  basePriceCents?: number;
  discountPercentage?: number;
  requiresDeposit?: boolean;
  depositAmountCents?: number;
  taxRate?: number;
}

// ====================================================================
// BOOKING QUOTE
// ====================================================================

export interface BookingQuoteRequest {
  rentalObjectId: string;
  startTime: string;
  endTime: string;
  pricingGroupId?: string;
  addonIds?: string[];
}

export interface BookingQuoteResponse {
  rentalObjectId: string;
  startTime: string;
  endTime: string;
  durationHours: number;
  
  // Pricing breakdown
  basePriceCents: number;
  discountCents: number;
  addonsCents: number;
  subtotalCents: number;
  taxCents: number;
  totalCents: number;
  depositCents?: number;
  
  // Details
  pricingGroup?: PricingGroup;
  appliedDiscount?: {
    name: string;
    percentage: number;
    amountCents: number;
  };
  addons?: Array<{
    id: string;
    name: string;
    priceCents: number;
  }>;
  
  // Payment
  requiresDeposit: boolean;
  paymentDueCents: number; // Total or deposit
}

// ====================================================================
// BULK OPERATIONS
// ====================================================================

export interface BulkUpdatePricingDTO {
  rentalObjectIds: string[];
  pricing: UpdateRentalObjectPricingDTO;
}

export interface BulkUpdatePricingResponse {
  success: number;
  failed: number;
  errors?: Array<{
    rentalObjectId: string;
    error: string;
  }>;
}
