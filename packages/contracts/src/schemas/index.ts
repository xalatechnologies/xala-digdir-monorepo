/**
 * @digilist/contracts - Domain Schemas
 *
 * Re-exports all domain-specific schemas for the Digilist rental booking platform.
 */

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
