/**
 * Listing Zod Schemas
 * Validation schemas for listing domain
 * 
 * NOTE: This file contains legacy schemas for backwards compatibility.
 * For new implementations, use rental-object.schema.ts with the 
 * ConfigurationService for dynamic validation.
 */
import { z } from 'zod';

/**
 * Listing Type Schema
 * @deprecated Use RentalObjectCategorySchema from rental-object.schema.ts
 * Legacy types are now mapped to the new 4-category system in the database
 */
export const ListingTypeSchema = z.string().min(1).max(50);
export type ListingType = z.infer<typeof ListingTypeSchema>;

/**
 * Listing Status Schema
 * Validates against database-defined status values
 */
export const ListingStatusSchema = z.string().min(1).max(50);
export type ListingStatus = z.infer<typeof ListingStatusSchema>;

/**
 * Pricing Unit Schema
 * Validates against database-defined pricing unit values
 */
export const PricingUnitSchema = z.string().min(1).max(50);
export type PricingUnit = z.infer<typeof PricingUnitSchema>;

// Legacy type constants for backwards compatibility
export const LEGACY_LISTING_TYPES = ['SPACE', 'RESOURCE', 'EVENT', 'SERVICE', 'VEHICLE', 'OTHER'] as const;

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

// =============================================================================
// V2 Category & Booking Model Schemas
// NOTE: These now use dynamic string validation instead of hardcoded enums.
// Use ConfigurationService for fetching valid values at runtime.
// =============================================================================

/**
 * V2 Listing Category Schema
 * Validates against database-defined category codes
 * @see ConfigurationService.getValidCategoryCodes()
 */
export const ListingCategorySchema = z.string().min(1).max(100);
export type ListingCategory = z.infer<typeof ListingCategorySchema>;

/**
 * Booking Time Mode Schema
 * Validates against database-defined time mode codes
 * @see ConfigurationService.getValidTimeModeCodes()
 */
export const BookingTimeModeSchema = z.string().min(1).max(50);
export type BookingTimeMode = z.infer<typeof BookingTimeModeSchema>;

/**
 * Inventory Feature Schema
 */
export const InventoryFeatureSchema = z.object({
  enabled: z.boolean(),
  total: z.number().int().positive(),
  policy: z.enum(['FIFO', 'CONCURRENT']).default('FIFO'),
});

/**
 * Shared Capacity Feature Schema
 */
export const SharedCapacityFeatureSchema = z.object({
  enabled: z.boolean(),
  total: z.number().int().positive(),
  policy: z.enum(['PER_SLOT', 'PER_DAY']).default('PER_SLOT'),
});

/**
 * Package Definition Schema
 */
export const PackageDefinitionSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional(),
  price: z.number().nonnegative(),
  currency: z.string().length(3).default('NOK'),
  includedItems: z.array(z.string()).optional(),
});

/**
 * Packages Feature Schema
 */
export const PackagesFeatureSchema = z.object({
  enabled: z.boolean(),
  items: z.array(PackageDefinitionSchema).default([]),
});

/**
 * Listing Booking Features Schema
 */
export const ListingBookingFeaturesSchema = z.object({
  inventory: InventoryFeatureSchema.optional(),
  sharedCapacity: SharedCapacityFeatureSchema.optional(),
  packages: PackagesFeatureSchema.optional(),
});

/**
 * Listing Booking Config Schema
 */
export const ListingBookingConfigSchema = z.object({
  timeMode: BookingTimeModeSchema,
  features: ListingBookingFeaturesSchema.optional().default({}),
});

/**
 * Listing Rules Config Schema
 */
export const ListingRulesConfigSchema = z.object({
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

/**
 * V2 Listing Query Schema (new filter facets)
 */
export const ListingQuerySchemaV2 = z.object({
  // New category filter
  category: ListingCategorySchema.optional(),
  
  // New time mode filter
  timeMode: BookingTimeModeSchema.optional(),
  
  // Feature toggles
  hasInventory: z.coerce.boolean().optional(),
  sharedCapacityEnabled: z.coerce.boolean().optional(),
  packagesEnabled: z.coerce.boolean().optional(),
  
  // Enhanced filters
  subcategory: z.string().optional(),
  tags: z.string().optional(), // comma-separated
  fixedLocation: z.coerce.boolean().optional(),
  priceMin: z.coerce.number().nonnegative().optional(),
  priceMax: z.coerce.number().nonnegative().optional(),
  capacityMin: z.coerce.number().int().positive().optional(),
  availableFrom: z.string().optional(), // ISO date
  availableTo: z.string().optional(),   // ISO date
  
  // Existing filters
  status: ListingStatusSchema.optional(),
  organizationId: z.string().uuid().optional(),
  search: z.string().optional(),
  city: z.string().optional(),
  municipality: z.string().optional(),
  
  // Sorting & Pagination
  sortBy: z.enum(['name', 'price', 'capacity', 'createdAt', 'updatedAt']).optional().default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(20),
});

export type ListingQueryParamsV2 = z.infer<typeof ListingQuerySchemaV2>;

/**
 * V2 Create Listing Schema
 */
export const CreateListingSchemaV2 = z.object({
  name: z.string().min(1).max(255),
  slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).max(255).optional(),
  description: z.string().optional(),
  images: z.array(z.string().url()).optional(),
  
  // Required V2 fields
  category: ListingCategorySchema,
  booking: z.object({
    timeMode: BookingTimeModeSchema,
    features: ListingBookingFeaturesSchema.optional(),
  }),
  
  // Optional V2 fields
  subcategory: z.string().max(100).optional(),
  tags: z.array(z.string()).optional(),
  fixedLocation: z.boolean().optional().default(true),
  pricing: PricingSchema.optional(),
  rules: ListingRulesConfigSchema.optional(),
  organizationId: z.string().uuid().optional(),
  metadata: z.record(z.unknown()).optional(),
});

export type CreateListingV2DTO = z.infer<typeof CreateListingSchemaV2>;

/**
 * V2 Update Listing Schema
 */
export const UpdateListingSchemaV2 = z.object({
  name: z.string().min(1).max(255).optional(),
  description: z.string().optional().nullable(),
  images: z.array(z.string().url()).optional(),
  category: ListingCategorySchema.optional(),
  subcategory: z.string().max(100).optional(),
  tags: z.array(z.string()).optional(),
  fixedLocation: z.boolean().optional(),
  booking: z.object({
    timeMode: BookingTimeModeSchema.optional(),
    features: ListingBookingFeaturesSchema.optional(),
  }).optional(),
  pricing: PricingSchema.partial().optional(),
  rules: ListingRulesConfigSchema.optional(),
  metadata: z.record(z.unknown()).optional(),
});

export type UpdateListingV2DTO = z.infer<typeof UpdateListingSchemaV2>;
