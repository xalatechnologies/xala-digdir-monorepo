/**
 * @digilist/domain - Type exports
 *
 * All TypeScript types inferred from Zod schemas
 */

// Rental Object Types
export type {
  RentalObjectStatus,
  RentalObjectType,
  RentalObjectDimensions,
  RentalObjectPricing,
  RentalObjectLocation,
  RentalObjectAmenities,
  CreateRentalObjectInput,
  UpdateRentalObjectInput,
  RentalObjectFilter,
  RentalObject,
  RentalObjectId,
  RentalObjectWithRelations,
  RentalObjectSummary,
  RentalObjectAvailability,
  RentalObjectStatistics,
} from './rental-object';

// Booking Types
export type {
  BookingStatus,
  BookingSource,
  PaymentStatus,
  BookingContact,
  BookingVessel,
  BookingPricing,
  BookingExtra,
  CreateBookingInput,
  UpdateBookingInput,
  CancelBookingInput,
  BookingFilter,
  Booking,
  BookingId,
  BookingWithRelations,
  BookingSummary,
  BookingCalendarEvent,
  BookingConfirmation,
  BookingStatistics,
  BookingAction,
  BookingPermission,
} from './booking';

// Season Types
export type {
  SeasonStatus,
  SeasonApplicationStatus,
  PriorityRuleType,
  SeasonPricingTier,
  SeasonDateRange,
  ApplicationWindow,
  PriorityRule,
  CreateSeasonInput,
  UpdateSeasonInput,
  CreateSeasonApplicationInput,
  UpdateSeasonApplicationInput,
  SeasonFilter,
  SeasonApplicationFilter,
  Season,
  SeasonApplication,
  SeasonId,
  SeasonApplicationId,
  SeasonWithRelations,
  SeasonApplicationWithRelations,
  SeasonSummary,
  SeasonApplicationSummary,
  SeasonStatistics,
  SeasonTimelineEvent,
  SeasonAction,
  SeasonApplicationAction,
  SeasonPermission,
  SeasonApplicationPermission,
} from './season';

// Allocation Types
export type {
  AllocationStatus,
  AllocationType,
  AllocationSource,
  CreateAllocationInput,
  UpdateAllocationInput,
  TransferAllocationInput,
  CancelAllocationInput,
  AllocationFilter,
  AllocationConflictCheckInput,
  AllocationHistoryEntry,
  Allocation,
  AllocationAvailabilitySlot,
  BulkAllocationInput,
  AllocationId,
  AllocationWithRelations,
  AllocationSummary,
  AllocationCalendarEvent,
  AllocationConflict,
  BulkAllocationResult,
  AllocationStatistics,
  AllocationAction,
  AllocationPermission,
  AllocationMatrixCell,
  AllocationMatrixRow,
  AllocationMatrix,
} from './allocation';
