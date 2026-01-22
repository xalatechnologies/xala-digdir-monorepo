/**
 * Domain Services Index
 *
 * Domain services are specific to the Digilist booking and resource management domain:
 * - Booking & Calendar
 * - Rental Objects & Resources
 * - Seasons & Allocations
 * - Pricing & Economy
 * - Reviews & Favorites
 * - Reports & Dashboards
 * - Templates & Widgets
 *
 * These services are part of @digilist/sdk and contain business logic
 * specific to the rental/booking domain.
 */

// =============================================================================
// Booking & Calendar
// =============================================================================
export {
  BookingService,
  CalendarService,
  AllocationService,
  AvailabilityService,
  bookingService,
  calendarService,
  allocationService,
  availabilityService,
} from '../services/booking.service';
export {
  RentalObjectCalendarService,
  AvailabilityMatrixService,
  rentalObjectCalendarService,
  availabilityMatrixService,
} from '../services/calendar.service';
export { AllocationsService, allocationsService } from '../services/allocations.service';

/**
 * @deprecated Use allocationsService instead. The standalone allocation.service.ts
 * has been deleted and consolidated into allocations.service.ts.
 */
export { allocationsService as standaloneAllocationService } from '../services/allocations.service';
export { blocksService } from '../services/blocks.service';
export type { BlockQueryParams, BlockListResponse } from '../services/blocks.service';

// =============================================================================
// Rental Objects & Resources
// =============================================================================
export {
  RentalObjectService,
  PublicRentalObjectService,
  rentalObjectService,
  publicRentalObjectService,
} from '../services/rental-object.service';
export { AmenitiesService, amenitiesService } from '../services/amenities.service';
export { favoritesService } from '../services/favorites.service';

// =============================================================================
// Seasons & Allocations
// =============================================================================
export { seasonService } from '../services/season.service';
export { seasonApplicationService } from '../services/season-application.service';
export { seasonalLeaseService } from '../services/seasonal-lease.service';

// =============================================================================
// Reviews & Ratings
// =============================================================================
export { ReviewService, reviewService } from '../services/review.service';

// =============================================================================
// Pricing & Economy
// =============================================================================
export { pricingService, PricingService } from '../services/pricing.service';
export {
  BackofficePriceRulesService,
  BackofficeRentalObjectsService,
  // Alias for backward compatibility
  BackofficeRentalObjectsService as BackofficeListingsService,
  backofficePriceRulesService,
  backofficeRentalObjectsService,
  backofficeListingsService,
} from '../services/price-rules.service';
export type {
  PriceRuleType,
  PriceUnit,
  // RentalObjectCategory exported from types/rental-object.ts, not from services
  PriceRule,
  CreatePriceRuleDTO,
  ListingRules,
  UpsertListingRulesDTO,
  BackofficeListingParams,
} from '../services/price-rules.service';
export { economyService, EconomyService } from '../services/economy.service';
export { discountCodesService, DiscountCodesService } from '../services/discount-codes.service';

/**
 * @deprecated Use discountCodesService instead. The standalone discount-code.service.ts
 * has been deleted and consolidated into discount-codes.service.ts.
 */
export { discountCodesService as discountCodeService } from '../services/discount-codes.service';

// =============================================================================
// Reports & Analytics
// =============================================================================
export { reportsService } from '../services/reports.service';
export type { DashboardStats as ReportsDashboardStats } from '../services/reports.service';
export {
  DashboardService,
  dashboardService,
} from '../services/dashboard.service';
export type {
  DashboardStats as DashboardStatsFromService,
  RecentActivity,
  QuickAction,
  UpcomingBooking,
  PendingItems,
} from '../services/dashboard.service';
export { orgDashboardService } from '../services/org-dashboard.service';

// =============================================================================
// Admin Permissions (Rental Object Specific)
// =============================================================================
export { adminPermissionService } from '../services/admin-permission.service';
export type {
  RentalObjectPermissionGrant,
  GrantPermissionDTO,
  AdminPermissionQueryParams,
} from '../services/admin-permission.service';

// =============================================================================
// Templates & Widgets
// =============================================================================
export { templatesService } from '../services/templates.service';
export { widgetService } from '../services/widget.service';

// =============================================================================
// Activities
// =============================================================================
export { activityService } from '../services/activity.service';
export type {
  Activity,
  ActivityCategory,
  ActivityQueryParams,
  ActivityRegistration,
  RegisterForActivityDTO,
} from '../services/activity.service';

// =============================================================================
// AI & Seed Generation
// =============================================================================
export { aiSeedService } from '../services/ai-seed.service';
export type {
  EntityType as SeedEntityType,
  GenerateSeedRequest,
  GenerateSeedResponse,
} from '../services/ai-seed.service';

// =============================================================================
// Case Handler Scope (Domain-specific delegation)
// =============================================================================
export { caseHandlerScopeService } from '../services/case-handler-scope.service';
