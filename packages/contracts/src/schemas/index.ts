/**
 * @digilist/contracts - Domain Schemas
 *
 * Re-exports all domain-specific schemas for the Digilist rental booking platform.
 */

// Base schemas (common utilities)
export {
  UUIDSchema,
  SlugSchema,
  MetadataSchema,
  TimestampsSchema,
  CurrencyCodeSchema,
  PaginationSchema,
  SortOrderSchema,
  ProblemDetailsSchema,
  createPaginatedResponseSchema,
  type Pagination,
  type SortOrder,
  type ProblemDetails,
} from './base.schema';

// Rental Object schemas
export {
  // Category/Type schemas
  RentalObjectCategorySchema,
  BookingTimeModeSchema,
  RentalObjectStatusSchema,
  PricingUnitSchema,

  // Default values
  DEFAULT_CATEGORIES,
  DEFAULT_TIME_MODES,
  DEFAULT_STATUSES,
  DEFAULT_PRICING_UNITS,

  // Nested schemas
  PricingSchema,
  LocationSchema,
  InventoryFeatureSchema,
  SharedCapacityFeatureSchema,
  PackageDefinitionSchema,
  PackagesFeatureSchema,
  BookingFeaturesSchema,
  RulesSchema,

  // Main entity schemas
  RentalObjectSchema,
  CreateRentalObjectSchema,
  UpdateRentalObjectSchema,
  RentalObjectQuerySchema,

  // Types
  type RentalObjectCategory,
  type BookingTimeMode,
  type RentalObjectStatus,
  type PricingUnit,
  type Pricing,
  type Location,
  type BookingFeatures,
  type Rules,
  type RentalObject,
  type CreateRentalObjectDTO,
  type UpdateRentalObjectDTO,
  type RentalObjectQueryParams,
} from './rental-object.schema';

// Booking schemas
export {
  // Enum schemas
  BookingStatusSchema,
  PaymentStatusSchema,

  // Main entity schemas
  BookingSchema,
  CreateBookingSchema,
  UpdateBookingSchema,
  CancelBookingSchema,
  BookingQuerySchema,

  // Quote schemas
  BookingQuoteRequestSchema,
  BookingQuoteResponseSchema,

  // Types
  type BookingStatus,
  type PaymentStatus,
  type Booking,
  type CreateBookingDTO,
  type UpdateBookingDTO,
  type CancelBookingDTO,
  type BookingQueryParams,
  type BookingQuoteRequest,
  type BookingQuoteResponse,
} from './booking.schema';

// Organization schemas
export {
  // Enum schemas
  OrganizationTypeSchema,
  OrganizationStatusSchema,

  // Settings schemas
  BrandingSchema,
  OrganizationSettingsSchema,

  // Main entity schemas
  OrganizationSchema,
  CreateOrganizationSchema,
  UpdateOrganizationSchema,
  OrganizationQuerySchema,

  // Types
  type OrganizationType,
  type OrganizationStatus,
  type Branding,
  type OrganizationSettings,
  type Organization,
  type CreateOrganizationDTO,
  type UpdateOrganizationDTO,
  type OrganizationQueryParams,
} from './organization.schema';

// User schemas
export {
  // Enum schemas
  UserRoleSchema,
  UserStatusSchema,

  // Main entity schemas
  UserSchema,
  CreateUserSchema,
  InviteUserSchema,
  UpdateUserSchema,
  AssignRoleSchema,
  UserQuerySchema,

  // GDPR
  ConsentPreferencesSchema,

  // Types
  type UserRole,
  type UserStatus,
  type User,
  type CreateUserDTO,
  type InviteUserDTO,
  type UpdateUserDTO,
  type AssignRoleDTO,
  type UserQueryParams,
  type ConsentPreferences,
} from './user.schema';

// Capabilities schemas
export {
  // Action codes
  ActionCodeSchema,

  // Capability types
  CapabilitySchema,

  // UI and feature schemas
  UIHintsSchema,
  FeatureFlagsSchema,
  CapabilitiesResponseSchema,

  // Constants
  CAPABILITIES,

  // Types
  type ActionCode,
  type Capability,
  type UIHints,
  type FeatureFlags,
  type CapabilitiesResponse,
  type CapabilityKey,
} from './capabilities.schema';

// Custody schemas
export {
  // Enum schemas
  CustodyScopeSchema,
  GranteeTypeSchema,
  CustodyGrantStatusSchema,

  // Main entity schemas
  CustodyGrantSchema,
  CustodySubgrantSchema,

  // DTO schemas
  CreateCustodyGrantSchema,
  BulkAssignCustodyGrantSchema,
  CreateCustodySubgrantSchema,

  // Types
  type CustodyScope,
  type GranteeType,
  type CustodyGrantStatus,
  type CustodyGrant,
  type CustodySubgrant,
  type CreateCustodyGrantDTO,
  type BulkAssignCustodyGrantDTO,
  type CreateCustodySubgrantDTO,
} from './custody.schema';

// Allocation schemas
export {
  // Enum schemas
  AllocationStatusSchema,
  AllocationTypeSchema,
  AllocationSourceSchema,

  // Main entity schemas
  AllocationSchema,
  CreateAllocationSchema,
  UpdateAllocationSchema,
  TransferAllocationSchema,
  CancelAllocationSchema,
  AllocationFilterSchema,
  AllocationConflictCheckSchema,
  AllocationHistoryEntrySchema,
  AllocationAvailabilitySlotSchema,
  BulkAllocationSchema,

  // Types
  type AllocationStatus,
  type AllocationType,
  type AllocationSource,
  type CreateAllocationInput,
  type UpdateAllocationInput,
  type TransferAllocationInput,
  type CancelAllocationInput,
  type AllocationFilter,
  type AllocationConflictCheckInput,
  type AllocationHistoryEntry,
  type Allocation,
  type AllocationAvailabilitySlot,
  type BulkAllocationInput,
  type AllocationId,
  type AllocationWithRelations,
  type AllocationSummary,
  type AllocationCalendarEvent,
  type AllocationConflict,
  type BulkAllocationResult,
  type AllocationStatistics,
  type AllocationAction,
  type AllocationPermission,
  type AllocationMatrixCell,
  type AllocationMatrixRow,
  type AllocationMatrix,
} from './allocation.schema';

// Season schemas
export {
  // Enum schemas
  SeasonStatusSchema,
  SeasonApplicationStatusSchema,
  PriorityRuleTypeSchema,

  // Nested schemas
  SeasonPricingTierSchema,
  SeasonDateRangeSchema,
  ApplicationWindowSchema,
  PriorityRuleSchema,

  // Main entity schemas
  SeasonSchema,
  SeasonApplicationSchema,
  CreateSeasonSchema,
  UpdateSeasonSchema,
  CreateSeasonApplicationSchema,
  UpdateSeasonApplicationSchema,
  SeasonFilterSchema,
  SeasonApplicationFilterSchema,

  // Types
  type SeasonStatus,
  type SeasonApplicationStatus,
  type PriorityRuleType,
  type SeasonPricingTier,
  type SeasonDateRange,
  type ApplicationWindow,
  type PriorityRule,
  type CreateSeasonInput,
  type UpdateSeasonInput,
  type CreateSeasonApplicationInput,
  type UpdateSeasonApplicationInput,
  type SeasonFilter,
  type SeasonApplicationFilter,
  type Season,
  type SeasonApplication,
  type SeasonId,
  type SeasonApplicationId,
  type SeasonWithRelations,
  type SeasonApplicationWithRelations,
  type SeasonSummary,
  type SeasonApplicationSummary,
  type SeasonStatistics,
  type SeasonTimelineEvent,
  type SeasonAction,
  type SeasonApplicationAction,
  type SeasonPermission,
  type SeasonApplicationPermission,
} from './season.schema';

// Favorites schemas
export {
  // Main entity schemas
  FavoriteSchema,
  CreateFavoriteSchema,
  UpdateFavoriteSchema,
  ListFavoritesQuerySchema,

  // Response schemas
  FavoriteRentalObjectSchema,
  FavoriteDetailSchema,
  FavoritesListResponseSchema,
  IsFavoritedResponseSchema,

  // Bulk operation schemas
  BulkAddFavoritesSchema,
  BulkRemoveFavoritesSchema,
  BulkFavoriteErrorSchema,
  BulkFavoritesResponseSchema,

  // Enum schemas
  FavoritesSortBySchema,

  // Types
  type Favorite,
  type CreateFavoriteDTO,
  type UpdateFavoriteDTO,
  type ListFavoritesQuery,
  type FavoriteRentalObject,
  type FavoriteDetail,
  type FavoritesListResponse,
  type IsFavoritedResponse,
  type BulkAddFavoritesDTO,
  type BulkRemoveFavoritesDTO,
  type BulkFavoriteError,
  type BulkFavoritesResponse,
  type FavoritesSortBy,
} from './favorites.schema';

// Pricing schemas
export {
  // Enum schemas
  QuotePriceUnitSchema,
  QuoteRuleTypeSchema,

  // Request schemas
  PricingQuoteRequestSchema,

  // Response schemas
  QuoteLineItemSchema,
  AppliedPriceRuleSchema,
  PricingQuoteResponseSchema,

  // Helper
  PricingPaginatedSchema,

  // Types
  type QuotePriceUnit,
  type QuoteRuleType,
  type PricingQuoteRequest,
  type QuoteLineItem,
  type AppliedPriceRule,
  type PricingQuoteResponse,
  type PricingPaginated,
} from './pricing.schema';

// Price Rules schemas
export {
  // Enum schemas
  PriceRuleTypeSchema,
  PriceUnitSchema,

  // Main entity schemas
  PriceRuleSchema,
  CreatePriceRuleSchema,
  UpdatePriceRuleSchema,

  // Listing rules schemas
  ListingRulesSchema,
  UpsertListingRulesSchema,

  // Query schemas
  PriceRulesQuerySchema,

  // Types
  type PriceRuleType,
  type PriceUnit,
  type PriceRule,
  type CreatePriceRuleDTO,
  type UpdatePriceRuleDTO,
  type ListingRules,
  type UpsertListingRulesDTO,
  type PriceRulesQuery,
} from './price-rules.schema';

// User Group schemas
export {
  // Enum schemas
  UserGroupCodeSchema,

  // Main entity schemas
  UserGroupSchema,
  CreateUserGroupSchema,
  UpdateUserGroupSchema,
  UserGroupsQuerySchema,

  // Types
  type UserGroupCode,
  type UserGroup,
  type CreateUserGroupDTO,
  type UpdateUserGroupDTO,
  type UserGroupsQuery,
} from './user-group.schema';
