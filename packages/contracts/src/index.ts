/**
 * @xala/contracts
 *
 * Shared API contracts: Zod schemas, TypeScript types, and projections.
 *
 * This package is the single source of truth for API contracts between
 * the API server, SDK, and frontend applications.
 *
 * ## Usage
 *
 * ### Import Schemas (for validation)
 * ```typescript
 * import { RentalObjectSchema, BookingSchema } from '@xala/contracts/schemas';
 *
 * const parsed = RentalObjectSchema.parse(data);
 * ```
 *
 * ### Import Types (for type annotations)
 * ```typescript
 * import type { RentalObject, Booking, User } from '@xala/contracts/types';
 *
 * function processBooking(booking: Booking) { ... }
 * ```
 *
 * ### Import Projections (for UI)
 * ```typescript
 * import type { RentalObjectCardProjection } from '@xala/contracts/projections';
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

// Storage
export * from './storage';

// Monitoring DTOs
export * from './monitoring';

// Modules
export * from './modules';

// Types (re-export for convenience)
export type {
  // Common
  Pagination,
  PaginatedResponseMeta,
  SortOrder,
  Timestamps,
  Metadata,
  CurrencyCode,
  Money,
  FieldError,
  ProblemDetails,

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
  Capability,
  UIHints,
  FeatureFlags,
  CapabilitiesResponse,
  CapabilityKey,

  // Custody
  CustodyScope,
  GranteeType,
  CustodyGrant,
  CustodySubgrant,
  CreateCustodyGrantDTO,
  BulkAssignCustodyGrantDTO,
  CreateCustodySubgrantDTO,

  // Projections
  RentalObjectCardProjection,
  RentalObjectDetailsProjection,
  RentalObjectSearchResultProjection,
  BookingCardProjection,
  BookingDetailsProjection,
  BookingReceiptProjection,
  CalendarEventProjection,
  OrganizationCardProjection,
  OrganizationDetailsProjection,
  MemberProjection,
  UserCardProjection,
  UserDetailsProjection,
  CurrentUserProjection,
} from './types';
