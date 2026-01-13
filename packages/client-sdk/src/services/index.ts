/**
 * Services Index
 * Exports all service instances and classes
 */

// Base service for extending
export { BaseService } from './base.service';

// Auth
export { AuthService, authService } from './auth.service';

// Listings
export { ListingService, PublicListingService, listingService, publicListingService } from './listing.service';

// Bookings
export { 
  BookingService, 
  CalendarService, 
  AllocationService, 
  AvailabilityService,
  bookingService,
  calendarService,
  allocationService,
  availabilityService
} from './booking.service';

// Organizations & Users
export { 
  OrganizationService, 
  UserService,
  organizationService,
  userService
} from './organization.service';

// Integrations
export {
  SettingsService,
  RcoService,
  VismaService,
  BrregService,
  NifService,
  VippsService,
  CalendarSyncService,
  settingsService,
  rcoService,
  vismaService,
  brregService,
  nifService,
  vippsService,
  calendarSyncService
} from './integration.service';

// Reports
export { reportsService } from './reports.service';

// Seasonal Leases
export { seasonalLeaseService } from './seasonal-lease.service';

// Conversations
export { conversationService } from './conversation.service';
