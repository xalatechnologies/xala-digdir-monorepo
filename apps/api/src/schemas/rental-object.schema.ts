/**
 * Rental Object Zod Schemas
 * Clean schema definitions for the 4-category rental objects system
 */
import { z } from 'zod';

// =============================================================================
// Category Enum
// =============================================================================

export const RentalObjectCategorySchema = z.enum([
  'LOKALER_OG_BANER',
  'UTSTYR_OG_INVENTAR',
  'KJORETOY_OG_TRANSPORT',
  'OPPLEVELSER_OG_ARRANGEMENT',
]);
export type RentalObjectCategory = z.infer<typeof RentalObjectCategorySchema>;

// =============================================================================
// Time Mode Enum
// =============================================================================

export const BookingTimeModeSchema = z.enum(['PERIOD', 'SLOT', 'ALL_DAY']);
export type BookingTimeMode = z.infer<typeof BookingTimeModeSchema>;

// =============================================================================
// Status Enum
// =============================================================================

export const RentalObjectStatusSchema = z.enum(['draft', 'published', 'archived']);
export type RentalObjectStatus = z.infer<typeof RentalObjectStatusSchema>;

// =============================================================================
// Pricing Unit Enum
// =============================================================================

export const PricingUnitSchema = z.enum(['hour', 'day', 'booking', 'week', 'month']);
export type PricingUnit = z.infer<typeof PricingUnitSchema>;

// =============================================================================
// Pricing Schema
// =============================================================================

export const PricingSchema = z.object({
  basePrice: z.number().nonnegative(),
  currency: z.string().length(3).default('NOK'),
  unit: PricingUnitSchema.default('hour'),
  weekendModifier: z.number().optional(),
  memberDiscount: z.number().min(0).max(1).optional(),
});
export type Pricing = z.infer<typeof PricingSchema>;

// =============================================================================
// Booking Features Schema
// =============================================================================

export const InventoryFeatureSchema = z.object({
  enabled: z.boolean(),
  total: z.number().int().positive(),
  policy: z.enum(['FIFO', 'CONCURRENT']).default('FIFO'),
});

export const SharedCapacityFeatureSchema = z.object({
  enabled: z.boolean(),
  total: z.number().int().positive(),
  policy: z.enum(['PER_SLOT', 'PER_DAY']).default('PER_SLOT'),
});

export const PackageDefinitionSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional(),
  price: z.number().nonnegative(),
  currency: z.string().length(3).default('NOK'),
  includedItems: z.array(z.string()).optional(),
});

export const PackagesFeatureSchema = z.object({
  enabled: z.boolean(),
  items: z.array(PackageDefinitionSchema).default([]),
});

export const BookingFeaturesSchema = z.object({
  inventory: InventoryFeatureSchema.optional(),
  sharedCapacity: SharedCapacityFeatureSchema.optional(),
  packages: PackagesFeatureSchema.optional(),
});
export type BookingFeatures = z.infer<typeof BookingFeaturesSchema>;

// =============================================================================
// Location Schema
// =============================================================================

export const LocationSchema = z.object({
  address: z.string().optional(),
  city: z.string().optional(),
  postalCode: z.string().optional(),
  municipality: z.string().optional(),
  country: z.string().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
});
export type Location = z.infer<typeof LocationSchema>;

// =============================================================================
// Rules Schema (for category-specific rules)
// =============================================================================

export const RulesSchema = z.object({
  deposit: z.object({
    required: z.boolean(),
    amount: z.number().nonnegative(),
    currency: z.string().length(3).optional(),
  }).optional(),
  pickup: z.object({
    location: z.string(),
    instructions: z.string().optional(),
  }).optional(),
  ageRequirement: z.number().int().positive().optional(),
  licenseRequired: z.boolean().optional(),
  cancellation: z.object({
    hoursNotice: z.number().int().nonnegative(),
    refundPercent: z.number().min(0).max(100),
  }).optional(),
});
export type Rules = z.infer<typeof RulesSchema>;

// =============================================================================
// Full Rental Object Schema
// =============================================================================

export const RentalObjectSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  organizationId: z.string().uuid().optional().nullable(),
  name: z.string().min(1).max(255),
  slug: z.string().max(255),
  
  // Category system
  category: RentalObjectCategorySchema,
  subcategory: z.string().max(100).optional().nullable(),
  tags: z.array(z.string()).optional().default([]),
  
  // Booking configuration
  timeMode: BookingTimeModeSchema.default('PERIOD'),
  bookingFeatures: BookingFeaturesSchema.optional().default({}),
  
  // Common fields
  status: RentalObjectStatusSchema.default('draft'),
  description: z.string().optional().nullable(),
  images: z.array(z.string().url()).optional().default([]),
  pricing: PricingSchema.optional().default({ basePrice: 0, currency: 'NOK', unit: 'hour' }),
  capacity: z.number().int().positive().optional().nullable(),
  fixedLocation: z.boolean().default(true),
  location: LocationSchema.optional(),
  rules: RulesSchema.optional(),
  metadata: z.record(z.unknown()).optional().default({}),
  
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});
export type RentalObject = z.infer<typeof RentalObjectSchema>;

// =============================================================================
// Create Rental Object DTO
// =============================================================================

export const CreateRentalObjectSchema = z.object({
  name: z.string().min(1).max(255),
  slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).max(255).optional(),
  
  // Required category
  category: RentalObjectCategorySchema,
  subcategory: z.string().max(100).optional(),
  tags: z.array(z.string()).optional(),
  
  // Booking configuration
  timeMode: BookingTimeModeSchema.optional().default('PERIOD'),
  bookingFeatures: BookingFeaturesSchema.optional(),
  
  // Optional fields
  description: z.string().optional(),
  images: z.array(z.string().url()).optional(),
  pricing: PricingSchema.optional(),
  capacity: z.number().int().positive().optional(),
  fixedLocation: z.boolean().optional().default(true),
  location: LocationSchema.optional(),
  rules: RulesSchema.optional(),
  organizationId: z.string().uuid().optional(),
  metadata: z.record(z.unknown()).optional(),
});
export type CreateRentalObjectDTO = z.infer<typeof CreateRentalObjectSchema>;

// =============================================================================
// Update Rental Object DTO
// =============================================================================

export const UpdateRentalObjectSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  category: RentalObjectCategorySchema.optional(),
  subcategory: z.string().max(100).optional().nullable(),
  tags: z.array(z.string()).optional(),
  timeMode: BookingTimeModeSchema.optional(),
  bookingFeatures: BookingFeaturesSchema.optional(),
  status: RentalObjectStatusSchema.optional(),
  description: z.string().optional().nullable(),
  images: z.array(z.string().url()).optional(),
  pricing: PricingSchema.partial().optional(),
  capacity: z.number().int().positive().optional().nullable(),
  fixedLocation: z.boolean().optional(),
  location: LocationSchema.optional(),
  rules: RulesSchema.optional(),
  metadata: z.record(z.unknown()).optional(),
});
export type UpdateRentalObjectDTO = z.infer<typeof UpdateRentalObjectSchema>;

// =============================================================================
// Query Parameters
// =============================================================================

export const RentalObjectQuerySchema = z.object({
  // Category filtering
  category: RentalObjectCategorySchema.optional(),
  subcategory: z.string().optional(),
  
  // Booking mode filtering
  timeMode: BookingTimeModeSchema.optional(),
  
  // Status filtering
  status: RentalObjectStatusSchema.optional(),
  
  // Feature filtering
  hasInventory: z.coerce.boolean().optional(),
  hasSharedCapacity: z.coerce.boolean().optional(),
  hasPackages: z.coerce.boolean().optional(),
  
  // Text search
  search: z.string().optional(),
  
  // Organization filtering
  organizationId: z.string().uuid().optional(),
  
  // Location filtering
  city: z.string().optional(),
  municipality: z.string().optional(),
  
  // Capacity filtering
  minCapacity: z.coerce.number().int().positive().optional(),
  maxCapacity: z.coerce.number().int().positive().optional(),
  
  // Price filtering
  minPrice: z.coerce.number().nonnegative().optional(),
  maxPrice: z.coerce.number().nonnegative().optional(),
  
  // Sorting
  sortBy: z.enum(['name', 'createdAt', 'updatedAt', 'capacity']).optional().default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
  
  // Pagination
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(20),
});
export type RentalObjectQueryParams = z.infer<typeof RentalObjectQuerySchema>;

// =============================================================================
// Category Constants
// =============================================================================

export const RENTAL_OBJECT_CATEGORIES = [
  'LOKALER_OG_BANER',
  'UTSTYR_OG_INVENTAR',
  'KJORETOY_OG_TRANSPORT',
  'OPPLEVELSER_OG_ARRANGEMENT',
] as const;

export const BOOKING_TIME_MODES = ['PERIOD', 'SLOT', 'ALL_DAY'] as const;
