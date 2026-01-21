/**
 * Rental Object Schemas
 *
 * Domain-specific contract definitions for rental objects (utleieobjekter).
 * These schemas define the Digilist rental booking domain API contract.
 */
import { z } from 'zod';
import {
  UUIDSchema,
  SlugSchema,
  MetadataSchema,
  TimestampsSchema,
  CurrencyCodeSchema,
  PaginationSchema,
  SortOrderSchema,
} from '@xalatechnologies/platform/contracts';

// =============================================================================
// Dynamic Configuration Types
// Categories, statuses, etc. are database-driven strings.
// Validation against actual values happens at the service layer.
// =============================================================================

export const RentalObjectCategorySchema = z.string().min(1).max(100);
export type RentalObjectCategory = z.infer<typeof RentalObjectCategorySchema>;

export const BookingTimeModeSchema = z.string().min(1).max(50);
export type BookingTimeMode = z.infer<typeof BookingTimeModeSchema>;

export const RentalObjectStatusSchema = z.string().min(1).max(50);
export type RentalObjectStatus = z.infer<typeof RentalObjectStatusSchema>;

export const PricingUnitSchema = z.string().min(1).max(50);
export type PricingUnit = z.infer<typeof PricingUnitSchema>;

// =============================================================================
// Default Values (for backwards compatibility)
// Use ConfigurationService for runtime validation
// =============================================================================

export const DEFAULT_CATEGORIES = [
  'LOKALER_OG_BANER',
  'UTSTYR_OG_INVENTAR',
  'KJORETOY_OG_TRANSPORT',
  'OPPLEVELSER_OG_ARRANGEMENT',
] as const;

export const DEFAULT_TIME_MODES = ['PERIOD', 'SLOT', 'ALL_DAY'] as const;
export const DEFAULT_STATUSES = ['draft', 'published', 'archived'] as const;
export const DEFAULT_PRICING_UNITS = ['hour', 'day', 'booking', 'week', 'month'] as const;

// =============================================================================
// Pricing Schema
// =============================================================================

export const PricingSchema = z.object({
  basePrice: z.number().nonnegative(),
  currency: CurrencyCodeSchema,
  unit: PricingUnitSchema.default('hour'),
  weekendModifier: z.number().optional(),
  memberDiscount: z.number().min(0).max(1).optional(),
});

export type Pricing = z.infer<typeof PricingSchema>;

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
// Booking Features
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
  currency: CurrencyCodeSchema,
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
// Rules Schema
// =============================================================================

export const RulesSchema = z.object({
  deposit: z.object({
    required: z.boolean(),
    amount: z.number().nonnegative(),
    currency: CurrencyCodeSchema.optional(),
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
  id: UUIDSchema,
  tenantId: UUIDSchema,
  organizationId: UUIDSchema.optional().nullable(),
  name: z.string().min(1).max(255),
  slug: SlugSchema,
  category: RentalObjectCategorySchema,
  subcategory: z.string().max(100).optional().nullable(),
  tags: z.array(z.string()).default([]),
  timeMode: BookingTimeModeSchema.default('PERIOD'),
  bookingFeatures: BookingFeaturesSchema.optional().default({}),
  status: RentalObjectStatusSchema.default('draft'),
  description: z.string().optional().nullable(),
  images: z.array(z.string().url()).default([]),
  pricing: PricingSchema.optional().default({ basePrice: 0, currency: 'NOK', unit: 'hour' }),
  capacity: z.number().int().positive().optional().nullable(),
  fixedLocation: z.boolean().default(true),
  location: LocationSchema.optional(),
  rules: RulesSchema.optional(),
  metadata: MetadataSchema,
}).merge(TimestampsSchema);

export type RentalObject = z.infer<typeof RentalObjectSchema>;

// =============================================================================
// Create DTO
// =============================================================================

export const CreateRentalObjectSchema = z.object({
  name: z.string().min(1).max(255),
  slug: SlugSchema.optional(),
  category: RentalObjectCategorySchema,
  subcategory: z.string().max(100).optional(),
  tags: z.array(z.string()).optional(),
  timeMode: BookingTimeModeSchema.optional().default('PERIOD'),
  bookingFeatures: BookingFeaturesSchema.optional(),
  description: z.string().optional(),
  images: z.array(z.string().url()).optional(),
  pricing: PricingSchema.optional(),
  capacity: z.number().int().positive().optional(),
  fixedLocation: z.boolean().optional().default(true),
  location: LocationSchema.optional(),
  rules: RulesSchema.optional(),
  organizationId: UUIDSchema.optional(),
  metadata: MetadataSchema.optional(),
});

export type CreateRentalObjectDTO = z.infer<typeof CreateRentalObjectSchema>;

// =============================================================================
// Update DTO
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
  metadata: MetadataSchema.optional(),
});

export type UpdateRentalObjectDTO = z.infer<typeof UpdateRentalObjectSchema>;

// =============================================================================
// Query Parameters
// =============================================================================

export const RentalObjectQuerySchema = PaginationSchema.extend({
  category: RentalObjectCategorySchema.optional(),
  subcategory: z.string().optional(),
  timeMode: BookingTimeModeSchema.optional(),
  status: RentalObjectStatusSchema.optional(),
  hasInventory: z.coerce.boolean().optional(),
  hasSharedCapacity: z.coerce.boolean().optional(),
  hasPackages: z.coerce.boolean().optional(),
  search: z.string().optional(),
  organizationId: UUIDSchema.optional(),
  city: z.string().optional(),
  municipality: z.string().optional(),
  minCapacity: z.coerce.number().int().positive().optional(),
  maxCapacity: z.coerce.number().int().positive().optional(),
  minPrice: z.coerce.number().nonnegative().optional(),
  maxPrice: z.coerce.number().nonnegative().optional(),
  sortBy: z.enum(['name', 'createdAt', 'updatedAt', 'capacity']).optional().default('createdAt'),
  sortOrder: SortOrderSchema.optional().default('desc'),
});

export type RentalObjectQueryParams = z.infer<typeof RentalObjectQuerySchema>;
