import { z } from 'zod';
import {
  RentalObjectStatusSchema,
  RentalObjectTypeSchema,
  RentalObjectDimensionsSchema,
  RentalObjectPricingSchema,
  RentalObjectLocationSchema,
  RentalObjectAmenitiesSchema,
  CreateRentalObjectSchema,
  UpdateRentalObjectSchema,
  RentalObjectFilterSchema,
  RentalObjectSchema,
} from '../schemas/rental-object';

/**
 * Rental Object Status
 */
export type RentalObjectStatus = z.infer<typeof RentalObjectStatusSchema>;

/**
 * Rental Object Type
 */
export type RentalObjectType = z.infer<typeof RentalObjectTypeSchema>;

/**
 * Rental Object Dimensions
 */
export type RentalObjectDimensions = z.infer<typeof RentalObjectDimensionsSchema>;

/**
 * Rental Object Pricing
 */
export type RentalObjectPricing = z.infer<typeof RentalObjectPricingSchema>;

/**
 * Rental Object Location
 */
export type RentalObjectLocation = z.infer<typeof RentalObjectLocationSchema>;

/**
 * Rental Object Amenities
 */
export type RentalObjectAmenities = z.infer<typeof RentalObjectAmenitiesSchema>;

/**
 * Create Rental Object Input
 */
export type CreateRentalObjectInput = z.infer<typeof CreateRentalObjectSchema>;

/**
 * Update Rental Object Input
 */
export type UpdateRentalObjectInput = z.infer<typeof UpdateRentalObjectSchema>;

/**
 * Rental Object Filter
 */
export type RentalObjectFilter = z.infer<typeof RentalObjectFilterSchema>;

/**
 * Full Rental Object
 */
export type RentalObject = z.infer<typeof RentalObjectSchema>;

/**
 * Rental Object ID
 */
export type RentalObjectId = RentalObject['id'];

/**
 * Rental Object with Relations
 */
export interface RentalObjectWithRelations extends RentalObject {
  organization?: {
    id: string;
    name: string;
  };
  activeAllocations?: Array<{
    id: string;
    userId: string | null;
    startDate: Date;
    endDate: Date;
  }>;
  upcomingBookings?: Array<{
    id: string;
    startDate: Date;
    endDate: Date;
    status: string;
  }>;
}

/**
 * Rental Object Summary (for lists)
 */
export interface RentalObjectSummary {
  id: string;
  name: string;
  type: RentalObjectType;
  status: RentalObjectStatus;
  organizationId: string;
  location: Pick<RentalObjectLocation, 'harborName' | 'pier' | 'position'> | null;
  pricing: Pick<RentalObjectPricing, 'basePrice' | 'currency' | 'priceUnit'>;
  isAvailable: boolean;
  thumbnailUrl: string | null;
}

/**
 * Rental Object Availability
 */
export interface RentalObjectAvailability {
  rentalObjectId: string;
  date: Date;
  isAvailable: boolean;
  reason?: 'booked' | 'allocated' | 'maintenance' | 'unavailable';
  conflictingEntityId?: string;
  conflictingEntityType?: 'booking' | 'allocation';
}

/**
 * Rental Object Statistics
 */
export interface RentalObjectStatistics {
  rentalObjectId: string;
  totalBookings: number;
  totalRevenue: number;
  occupancyRate: number;
  averageBookingDuration: number;
  period: {
    startDate: Date;
    endDate: Date;
  };
}
