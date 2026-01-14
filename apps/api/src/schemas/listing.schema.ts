/**
 * Listing Zod Schemas
 * Validation schemas for listing domain
 */
import { z } from 'zod';

/**
 * Listing Type Enum
 */
export const ListingTypeSchema = z.enum(['SPACE', 'RESOURCE', 'EVENT', 'SERVICE', 'VEHICLE', 'OTHER']);
export type ListingType = z.infer<typeof ListingTypeSchema>;

/**
 * Listing Status Enum
 */
export const ListingStatusSchema = z.enum(['draft', 'published', 'archived']);
export type ListingStatus = z.infer<typeof ListingStatusSchema>;

/**
 * Pricing Unit Enum
 */
export const PricingUnitSchema = z.enum(['hour', 'day', 'booking', 'week', 'month']);
export type PricingUnit = z.infer<typeof PricingUnitSchema>;

/**
 * Pricing Schema
 */
export const PricingSchema = z.object({
  basePrice: z.number().nonnegative(),
  currency: z.string().length(3).default('NOK'),
  unit: PricingUnitSchema.default('hour'),
  weekendModifier: z.number().optional(),
  memberDiscount: z.number().min(0).max(1).optional(),
});

export type Pricing = z.infer<typeof PricingSchema>;

/**
 * Full Listing Schema
 */
export const ListingSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  organizationId: z.string().uuid().optional().nullable(),
  name: z.string().min(1).max(255),
  slug: z.string().max(255),
  type: ListingTypeSchema.default('SPACE'),
  status: ListingStatusSchema.default('draft'),
  description: z.string().optional().nullable(),
  images: z.array(z.string().url()).optional().default([]),
  pricing: PricingSchema.optional().default({ basePrice: 0, currency: 'NOK', unit: 'hour' }),
  capacity: z.number().int().positive().optional().nullable(),
  metadata: z.record(z.unknown()).optional().default({}),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export type Listing = z.infer<typeof ListingSchema>;

/**
 * Create Listing DTO
 */
export const CreateListingSchema = z.object({
  name: z.string().min(1).max(255),
  slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).max(255).optional(),
  organizationId: z.string().uuid().optional(),
  type: ListingTypeSchema.optional().default('SPACE'),
  description: z.string().optional(),
  images: z.array(z.string().url()).optional(),
  pricing: PricingSchema.optional(),
  capacity: z.number().int().positive().optional(),
  metadata: z.record(z.unknown()).optional(),
});

export type CreateListingDTO = z.infer<typeof CreateListingSchema>;

/**
 * Update Listing DTO
 */
export const UpdateListingSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  type: ListingTypeSchema.optional(),
  description: z.string().optional().nullable(),
  images: z.array(z.string().url()).optional(),
  pricing: PricingSchema.partial().optional(),
  capacity: z.number().int().positive().optional().nullable(),
  metadata: z.record(z.unknown()).optional(),
});

export type UpdateListingDTO = z.infer<typeof UpdateListingSchema>;

/**
 * Listing Query Params
 */
export const ListingQuerySchema = z.object({
  // Tenant/Org filtering
  organizationId: z.string().uuid().optional(),
  
  // Type & Status
  type: ListingTypeSchema.optional(),
  status: ListingStatusSchema.optional(),
  
  // Text search
  search: z.string().optional(),
  
  // Location filters
  city: z.string().optional(),
  
  // Price filters
  minPrice: z.coerce.number().nonnegative().optional(),
  maxPrice: z.coerce.number().nonnegative().optional(),
  
  // Capacity filters
  minCapacity: z.coerce.number().int().positive().optional(),
  maxCapacity: z.coerce.number().int().positive().optional(),
  
  // Amenity filters (comma-separated list)
  amenities: z.string().optional(), // e.g., "wifi,parking,handicap_accessible"
  
  // Sorting
  sortBy: z.enum(['name', 'price', 'capacity', 'createdAt', 'updatedAt']).optional().default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
  
  // Pagination
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(20),
});

export type ListingQueryParams = z.infer<typeof ListingQuerySchema>;

/**
 * Time Slot Schema (for availability)
 */
export const TimeSlotSchema = z.object({
  start: z.string(),
  end: z.string(),
  available: z.boolean(),
  price: z.number().optional(),
});

export type TimeSlot = z.infer<typeof TimeSlotSchema>;
