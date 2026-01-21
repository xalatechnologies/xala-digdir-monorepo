/**
 * @digilist/contracts - Type Exports
 *
 * Re-exports all TypeScript types for the Digilist rental booking platform.
 * Types are inferred from Zod schemas.
 */

// =============================================================================
// Rental Object Types
// =============================================================================

export type {
  // Category/Type types
  RentalObjectCategory,
  BookingTimeMode,
  RentalObjectStatus,
  PricingUnit,

  // Nested types
  Pricing,
  Location,
  BookingFeatures,
  Rules,

  // Main entity types
  RentalObject,
  CreateRentalObjectDTO,
  UpdateRentalObjectDTO,
  RentalObjectQueryParams,
} from '../schemas/rental-object.schema';

// =============================================================================
// Booking Types
// =============================================================================

export type {
  // Enum types
  BookingStatus,
  PaymentStatus,

  // Main entity types
  Booking,
  CreateBookingDTO,
  UpdateBookingDTO,
  CancelBookingDTO,
  BookingQueryParams,

  // Quote types
  BookingQuoteRequest,
  BookingQuoteResponse,
} from '../schemas/booking.schema';

// =============================================================================
// Projection Types
// =============================================================================

export type {
  // Rental Object projections
  RentalObjectCardProjection,
  RentalObjectDetailsProjection,
  RentalObjectSearchResultProjection,
} from '../projections/rental-object.projection';

export type {
  // Booking projections
  BookingCardProjection,
  BookingDetailsProjection,
  BookingReceiptProjection,
  CalendarEventProjection,
} from '../projections/booking.projection';

// =============================================================================
// Organization Types
// =============================================================================

export type {
  // Enum types
  OrganizationType,
  OrganizationStatus,

  // Settings types
  Branding,
  OrganizationSettings,

  // Main entity types
  Organization,
  CreateOrganizationDTO,
  UpdateOrganizationDTO,
  OrganizationQueryParams,
} from '../schemas/organization.schema';

export type {
  // Organization projections
  OrganizationCardProjection,
  OrganizationDetailsProjection,
  MemberProjection,
} from '../projections/organization.projection';

// =============================================================================
// User Types
// =============================================================================

export type {
  // Enum types
  UserRole,
  UserStatus,

  // Main entity types
  User,
  CreateUserDTO,
  InviteUserDTO,
  UpdateUserDTO,
  AssignRoleDTO,
  UserQueryParams,

  // GDPR
  ConsentPreferences,
} from '../schemas/user.schema';

export type {
  // User projections
  UserCardProjection,
  UserDetailsProjection,
  CurrentUserProjection,
} from '../projections/user.projection';

// =============================================================================
// Capabilities Types
// =============================================================================

export type {
  // Action codes
  ActionCode,

  // Capability types
  Capability,
  CapabilityKey,

  // UI and feature types
  UIHints,
  FeatureFlags,
  CapabilitiesResponse,
} from '../schemas/capabilities.schema';

export type {
  // Capabilities projection
  CapabilitiesProjection,
} from '../projections/capabilities.projection';

// =============================================================================
// Custody Types
// =============================================================================

export type {
  // Enum types
  CustodyScope,
  GranteeType,
  CustodyGrantStatus,

  // Main entity types
  CustodyGrant,
  CustodySubgrant,

  // DTO types
  CreateCustodyGrantDTO,
  BulkAssignCustodyGrantDTO,
  CreateCustodySubgrantDTO,
} from '../schemas/custody.schema';

// =============================================================================
// Menu System Types
// =============================================================================

export type {
  // Enums
  MenuTemplateStatus,
  VisibilityScope,
  FeatureFlagType,
  RoleScope,
  SupportedLanguage,

  // DTOs
  MenuItemDTO,
  MenuCategoryDTO,
  MenuTreeDTO,
  UserContextDTO,
  FeatureFlagDTO,
  RoleDTO,

  // SaaS Admin DTOs
  MenuTemplateListItemDTO,
  MenuTemplateDetailDTO,
  CreateMenuTemplateDTO,
  UpdateMenuTemplateDTO,
  TenantFeatureFlagOverrideDTO,
  TenantMenuAssignmentDTO,

  // API Responses
  BackofficeMenuResponse,
  UserContextResponse,
  FeatureFlagsResponse,
  RolesResponse,
  MenuTemplatesResponse,
} from '../projections/menu';

// =============================================================================
// Booking UI Types (for @digilist/ui components)
// =============================================================================

export type {
  // Booking modes and units
  BookingMode,
  BookingPriceUnit,
  SlotStatus,

  // Data structures
  AvailabilitySlot,
  DayAvailability,
  BookingPricing,
  BookingRules,
  DaySchedule,
  BookingConfig,
  BookingSelection,
  BookingFormData,
  PriceItem,
  BookingPriceCalculation,
  BookingStepConfig,

  // Listing detail types
  ListingType,
  AdditionalService,
  BookingDetails,
} from './booking-ui';

export {
  // Utility functions
  getBookingSteps,
  determineBookingMode,
  formatPrice,
  formatPriceUnit,
} from './booking-ui';
