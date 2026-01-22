/**
 * Schema Module Exports
 *
 * NOTE: Schemas are now sourced from @xala/contracts for schema-agnostic architecture.
 * Local schemas are kept for API-specific validation and backwards compatibility.
 *
 * @xala/contracts provides:
 * - Zod schemas for validation
 * - TypeScript types derived from schemas
 * - Projection schemas for UI-ready DTOs
 */

// =============================================================================
// Re-export from @xala/contracts (Schema-Agnostic Contracts)
// =============================================================================

// Common schemas (from local types)
export {
  UUIDSchema,
  SlugSchema,
  PaginationSchema,
  PaginatedResponseMetaSchema,
  SortOrderSchema,
  MetadataSchema,
  CurrencyCodeSchema,
  MoneySchema,
  ProblemDetailsSchema,
  FieldErrorSchema,
  type Pagination,
  type PaginatedResponseMeta,
  type SortOrder,
  type Metadata,
  type CurrencyCode,
  type Money,
  type ProblemDetails,
  type FieldError,
} from '../types/contracts';

// Capabilities schemas (from local types)
export {
  CapabilitySchema,
  UIHintsSchema,
  FeatureFlagsSchema,
  CapabilitiesResponseSchema,
  CAPABILITIES,
  type Capability,
  type UIHints,
  type CapabilitiesResponse,
  type CapabilityKey,
} from '../types/contracts';

// =============================================================================
// Local Schemas (API-specific, backwards compatible)
// =============================================================================

export * from './tenant.schema';
export * from './user.schema';
export * from './booking.schema';
export * from './monitoring.schema';
export * from './saas.schema';
// Note: calendar.schema exports are already included in booking.schema
// export * from './calendar.schema';

// Primary rental object schemas (new 4-category system)
export {
  // Schema factory functions for dynamic validation
  createCategorySchema,
  createTimeModeSchema,
  createStatusSchema,
  createPricingUnitSchema,
  
  // Base schemas
  RentalObjectCategorySchema,
  BookingTimeModeSchema,
  RentalObjectStatusSchema,
  PricingUnitSchema,
  PricingSchema,
  BookingFeaturesSchema,
  InventoryFeatureSchema,
  SharedCapacityFeatureSchema,
  PackageDefinitionSchema,
  PackagesFeatureSchema,
  LocationSchema,
  RulesSchema,
  RentalObjectSchema,
  CreateRentalObjectSchema,
  UpdateRentalObjectSchema,
  RentalObjectQuerySchema,
  
  // Default values
  DEFAULT_CATEGORIES,
  DEFAULT_TIME_MODES,
  DEFAULT_STATUSES,
  DEFAULT_PRICING_UNITS,
  RENTAL_OBJECT_CATEGORIES,
  BOOKING_TIME_MODES,
  PRICING_UNITS,
  RENTAL_OBJECT_STATUSES,
  
  // Types
  type RentalObjectCategory,
  type BookingTimeMode,
  type RentalObjectStatus,
  type PricingUnit,
  type Pricing,
  type BookingFeatures,
  type Location,
  type Rules,
  type RentalObject,
  type CreateRentalObjectDTO,
  type UpdateRentalObjectDTO,
  type RentalObjectQueryParams,
} from './rental-object.schema';

// Legacy listing schemas (for backwards compatibility)
// NOTE: These are deprecated - use rental-object schemas instead
export {
  // Re-export from rental-object.schema for backwards compatibility
  RentalObjectSchema as ListingSchema,
  CreateRentalObjectSchema as CreateListingSchema,
  UpdateRentalObjectSchema as UpdateListingSchema,
  RentalObjectQuerySchema as ListingQuerySchema,

  // Legacy types (mapped to new rental object types)
  type RentalObject as Listing,
  type CreateRentalObjectDTO as CreateListingDTO,
  type UpdateRentalObjectDTO as UpdateListingDTO,
  type RentalObjectQueryParams as ListingQueryParams,

  // Legacy enums - removed duplicate export
  // RentalObjectCategorySchema is already exported above

  // These are no longer needed - using rental object equivalents
  // ListingTypeSchema,
  // ListingStatusSchema,
  // ListingQuerySchemaV2,
  // CreateListingSchemaV2,
  // UpdateListingSchemaV2,
  // LEGACY_LISTING_TYPES,

  // type ListingType,
  // type ListingStatus,
  // type ListingQueryParamsV2,
  // type CreateListingV2DTO,
  // type UpdateListingV2DTO,
} from './rental-object.schema';
