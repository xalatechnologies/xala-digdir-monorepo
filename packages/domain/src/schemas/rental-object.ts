import { z } from 'zod';

/**
 * Rental Object Status
 */
export const RentalObjectStatusSchema = z.enum([
  'available',
  'unavailable',
  'maintenance',
  'archived',
]);

/**
 * Rental Object Type
 */
export const RentalObjectTypeSchema = z.enum([
  'boat_slip',
  'guest_slip',
  'storage',
  'facility',
  'equipment',
  'parking',
  'other',
]);

/**
 * Rental Object Dimensions
 */
export const RentalObjectDimensionsSchema = z.object({
  length: z.number().positive().optional(),
  width: z.number().positive().optional(),
  depth: z.number().positive().optional(),
  unit: z.enum(['meters', 'feet']).default('meters'),
});

/**
 * Rental Object Pricing
 */
export const RentalObjectPricingSchema = z.object({
  basePrice: z.number().nonnegative(),
  currency: z.string().length(3).default('NOK'),
  priceUnit: z.enum(['hour', 'day', 'week', 'month', 'season', 'year']),
  taxRate: z.number().min(0).max(100).optional(),
  discountPercentage: z.number().min(0).max(100).optional(),
});

/**
 * Rental Object Location
 */
export const RentalObjectLocationSchema = z.object({
  harborId: z.string().uuid().optional(),
  harborName: z.string().optional(),
  pier: z.string().optional(),
  section: z.string().optional(),
  position: z.string().optional(),
  coordinates: z
    .object({
      latitude: z.number().min(-90).max(90),
      longitude: z.number().min(-180).max(180),
    })
    .optional(),
});

/**
 * Rental Object Amenities
 */
export const RentalObjectAmenitiesSchema = z.object({
  electricity: z.boolean().default(false),
  water: z.boolean().default(false),
  wifi: z.boolean().default(false),
  security: z.boolean().default(false),
  lighting: z.boolean().default(false),
  restrooms: z.boolean().default(false),
  showers: z.boolean().default(false),
  laundry: z.boolean().default(false),
  parking: z.boolean().default(false),
  fuelStation: z.boolean().default(false),
  wasteDisposal: z.boolean().default(false),
  customAmenities: z.array(z.string()).default([]),
});

/**
 * Create Rental Object Input
 */
export const CreateRentalObjectSchema = z.object({
  name: z.string().min(1).max(255),
  description: z.string().max(2000).optional(),
  type: RentalObjectTypeSchema,
  status: RentalObjectStatusSchema.default('available'),
  organizationId: z.string().uuid(),
  dimensions: RentalObjectDimensionsSchema.optional(),
  pricing: RentalObjectPricingSchema,
  location: RentalObjectLocationSchema.optional(),
  amenities: RentalObjectAmenitiesSchema.optional(),
  maxCapacity: z.number().int().positive().optional(),
  images: z.array(z.string().url()).default([]),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

/**
 * Update Rental Object Input
 */
export const UpdateRentalObjectSchema = CreateRentalObjectSchema.partial().omit({
  organizationId: true,
});

/**
 * Rental Object Filter
 */
export const RentalObjectFilterSchema = z.object({
  organizationId: z.string().uuid().optional(),
  type: RentalObjectTypeSchema.optional(),
  status: RentalObjectStatusSchema.optional(),
  minPrice: z.number().nonnegative().optional(),
  maxPrice: z.number().nonnegative().optional(),
  harborId: z.string().uuid().optional(),
  hasElectricity: z.boolean().optional(),
  hasWater: z.boolean().optional(),
  minLength: z.number().positive().optional(),
  maxLength: z.number().positive().optional(),
  search: z.string().optional(),
});

/**
 * Full Rental Object Schema
 */
export const RentalObjectSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(255),
  description: z.string().max(2000).nullable(),
  type: RentalObjectTypeSchema,
  status: RentalObjectStatusSchema,
  organizationId: z.string().uuid(),
  dimensions: RentalObjectDimensionsSchema.nullable(),
  pricing: RentalObjectPricingSchema,
  location: RentalObjectLocationSchema.nullable(),
  amenities: RentalObjectAmenitiesSchema.nullable(),
  maxCapacity: z.number().int().positive().nullable(),
  images: z.array(z.string().url()),
  metadata: z.record(z.string(), z.unknown()).nullable(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  deletedAt: z.coerce.date().nullable(),
});
