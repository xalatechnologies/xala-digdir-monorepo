/**
 * @digilist/contracts
 *
 * Domain-specific API contracts for the Digilist rental booking platform.
 *
 * This package contains schemas and projections specific to the rental booking domain.
 * For platform-agnostic contracts (pagination, RFC7807, etc.), use @xala/contracts.
 *
 * ## Usage
 *
 * ### Import Schemas (for validation)
 * ```typescript
 * import { RentalObjectSchema, BookingSchema } from '@digilist/contracts/schemas';
 *
 * const parsed = RentalObjectSchema.parse(data);
 * ```
 *
 * ### Import Types (for type annotations)
 * ```typescript
 * import type { RentalObject, Booking } from '@digilist/contracts/types';
 *
 * function processBooking(booking: Booking) { ... }
 * ```
 *
 * ### Import Projections (for UI)
 * ```typescript
 * import type { RentalObjectCardProjection } from '@digilist/contracts/projections';
 *
 * function RentalCard({ data }: { data: RentalObjectCardProjection }) { ... }
 * ```
 */

// =============================================================================
// Re-export all modules
// =============================================================================

// Schemas
export * from './schemas';

// Projections
export * from './projections';

// Types (for convenience)
export type {
  // Rental Objects
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

  // Bookings
  BookingStatus,
  PaymentStatus,
  Booking,
  CreateBookingDTO,
  UpdateBookingDTO,
  CancelBookingDTO,
  BookingQueryParams,
  BookingQuoteRequest,
  BookingQuoteResponse,

  // Organizations
  OrganizationType,
  OrganizationStatus,
  Branding,
  OrganizationSettings,
  Organization,
  CreateOrganizationDTO,
  UpdateOrganizationDTO,
  OrganizationQueryParams,

  // Users
  UserRole,
  UserStatus,
  User,
  CreateUserDTO,
  InviteUserDTO,
  UpdateUserDTO,
  AssignRoleDTO,
  UserQueryParams,
  ConsentPreferences,

  // Capabilities
  ActionCode,
  Capability,
  UIHints,
  FeatureFlags,
  CapabilitiesResponse,
  CapabilityKey,

  // Custody
  CustodyScope,
  GranteeType,
  CustodyGrantStatus,
  CustodyGrant,
  CustodySubgrant,
  CreateCustodyGrantDTO,
  BulkAssignCustodyGrantDTO,
  CreateCustodySubgrantDTO,

  // Projections - Rental Objects
  RentalObjectCardProjection,
  RentalObjectDetailsProjection,
  RentalObjectSearchResultProjection,

  // Projections - Bookings
  BookingCardProjection,
  BookingDetailsProjection,
  BookingReceiptProjection,
  CalendarEventProjection,

  // Projections - Organizations
  OrganizationCardProjection,
  OrganizationDetailsProjection,
  MemberProjection,

  // Projections - Users
  UserCardProjection,
  UserDetailsProjection,
  CurrentUserProjection,

  // Projections - Capabilities
  CapabilitiesProjection,

  // Booking UI Types (for @digilist/ui components)
  BookingMode,
  BookingPriceUnit,
  SlotStatus,
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
  ListingType,
  AdditionalService,
  BookingDetails,
} from './types';

// Booking UI Utility Functions
export {
  getBookingSteps,
  determineBookingMode,
  formatPrice,
  formatPriceUnit,
} from './types';
