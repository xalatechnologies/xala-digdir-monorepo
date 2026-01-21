/**
 * @digilist/contracts - Domain Projections
 *
 * Re-exports all domain-specific projections for the Digilist rental booking platform.
 */

// Rental Object projections
export {
  RentalObjectCardProjectionSchema,
  RentalObjectDetailsProjectionSchema,
  RentalObjectSearchResultProjectionSchema,
  type RentalObjectCardProjection,
  type RentalObjectDetailsProjection,
  type RentalObjectSearchResultProjection,
} from './rental-object.projection';

// Booking projections
export {
  BookingCardProjectionSchema,
  BookingDetailsProjectionSchema,
  BookingReceiptProjectionSchema,
  CalendarEventProjectionSchema,
  type BookingCardProjection,
  type BookingDetailsProjection,
  type BookingReceiptProjection,
  type CalendarEventProjection,
} from './booking.projection';

// Organization projections
export {
  OrganizationCardProjectionSchema,
  OrganizationDetailsProjectionSchema,
  MemberProjectionSchema,
  type OrganizationCardProjection,
  type OrganizationDetailsProjection,
  type MemberProjection,
} from './organization.projection';

// User projections
export {
  UserCardProjectionSchema,
  UserDetailsProjectionSchema,
  CurrentUserProjectionSchema,
  type UserCardProjection,
  type UserDetailsProjection,
  type CurrentUserProjection,
} from './user.projection';

// Capabilities projection
export {
  CapabilitiesProjectionSchema,
  type CapabilitiesProjection,
} from './capabilities.projection';

// Menu system contracts
export {
  // Enums
  type MenuTemplateStatus,
  type VisibilityScope,
  type FeatureFlagType,
  type RoleScope,
  type SupportedLanguage,

  // DTOs
  type MenuItemDTO,
  type MenuCategoryDTO,
  type MenuTreeDTO,
  type UserContextDTO,
  type FeatureFlagDTO,
  type RoleDTO,

  // SaaS Admin DTOs
  type MenuTemplateListItemDTO,
  type MenuTemplateDetailDTO,
  type CreateMenuTemplateDTO,
  type UpdateMenuTemplateDTO,
  type TenantFeatureFlagOverrideDTO,
  type TenantMenuAssignmentDTO,

  // API Responses
  type BackofficeMenuResponse,
  type UserContextResponse,
  type FeatureFlagsResponse,
  type RolesResponse,
  type MenuTemplatesResponse,
} from './menu';
