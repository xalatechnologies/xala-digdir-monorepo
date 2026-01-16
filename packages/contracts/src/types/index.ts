/**
 * Types Module
 *
 * Re-exports all TypeScript types derived from Zod schemas.
 * Use these types in your application code.
 *
 * @example
 * import type { RentalObject, Booking, User } from '@xala/contracts/types';
 */

// =============================================================================
// Common Types
// =============================================================================

export type {
  Pagination,
  PaginatedResponseMeta,
  SortOrder,
  Timestamps,
  Metadata,
  CurrencyCode,
  Money,
  FieldError,
  ProblemDetails,
} from '../schemas/common.schema';

// =============================================================================
// Rental Object Types
// =============================================================================

export type {
  RentalObjectCategory,
  BookingTimeMode,
  RentalObjectStatus,
  PricingUnit,
  Pricing,
  Location,
  BookingFeatures,
  Rules,
  RentalObject,
  CreateRentalObjectDTO,
  UpdateRentalObjectDTO,
  RentalObjectQueryParams,
} from '../schemas/rental-object.schema';

// =============================================================================
// Booking Types
// =============================================================================

export type {
  BookingStatus,
  PaymentStatus,
  Booking,
  CreateBookingDTO,
  UpdateBookingDTO,
  CancelBookingDTO,
  BookingQueryParams,
  BookingQuoteRequest,
  BookingQuoteResponse,
} from '../schemas/booking.schema';

// =============================================================================
// Organization Types
// =============================================================================

export type {
  OrganizationType,
  OrganizationStatus,
  Branding,
  OrganizationSettings,
  Organization,
  CreateOrganizationDTO,
  UpdateOrganizationDTO,
  OrganizationQueryParams,
} from '../schemas/organization.schema';

// =============================================================================
// User Types
// =============================================================================

export type {
  UserRole,
  UserStatus,
  User,
  CreateUserDTO,
  InviteUserDTO,
  UpdateUserDTO,
  AssignRoleDTO,
  UserQueryParams,
  ConsentPreferences,
} from '../schemas/user.schema';

// =============================================================================
// Capabilities Types
// =============================================================================

export type {
  Capability,
  UIHints,
  FeatureFlags,
  CapabilitiesResponse,
  CapabilityKey,
} from '../schemas/capabilities.schema';

// =============================================================================
// Projection Types
// =============================================================================

export type {
  RentalObjectCardProjection,
  RentalObjectDetailsProjection,
  RentalObjectSearchResultProjection,
} from '../projections/rental-object.projection';

export type {
  BookingCardProjection,
  BookingDetailsProjection,
  BookingReceiptProjection,
  CalendarEventProjection,
} from '../projections/booking.projection';

export type {
  OrganizationCardProjection,
  OrganizationDetailsProjection,
  MemberProjection,
} from '../projections/organization.projection';

export type {
  UserCardProjection,
  UserDetailsProjection,
  CurrentUserProjection,
} from '../projections/user.projection';
