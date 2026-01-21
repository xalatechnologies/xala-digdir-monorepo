/**
 * @digilist/domain - Schema exports
 *
 * All Zod schemas for domain validation
 */

// Rental Object Schemas
export {
  RentalObjectStatusSchema,
  RentalObjectTypeSchema,
  RentalObjectDimensionsSchema,
  RentalObjectPricingSchema,
  RentalObjectLocationSchema,
  RentalObjectAmenitiesSchema,
  CreateRentalObjectSchema,
  UpdateRentalObjectSchema,
  RentalObjectFilterSchema,
  RentalObjectSchema,
} from './rental-object';

// Booking Schemas
export {
  BookingStatusSchema,
  BookingSourceSchema,
  PaymentStatusSchema,
  BookingContactSchema,
  BookingVesselSchema,
  BookingPricingSchema,
  BookingExtraSchema,
  CreateBookingSchema,
  UpdateBookingSchema,
  CancelBookingSchema,
  BookingFilterSchema,
  BookingSchema,
} from './booking';

// Season Schemas
export {
  SeasonStatusSchema,
  SeasonApplicationStatusSchema,
  PriorityRuleTypeSchema,
  SeasonPricingTierSchema,
  SeasonDateRangeSchema,
  ApplicationWindowSchema,
  PriorityRuleSchema,
  CreateSeasonSchema,
  UpdateSeasonSchema,
  CreateSeasonApplicationSchema,
  UpdateSeasonApplicationSchema,
  SeasonFilterSchema,
  SeasonApplicationFilterSchema,
  SeasonSchema,
  SeasonApplicationSchema,
} from './season';

// Allocation Schemas
export {
  AllocationStatusSchema,
  AllocationTypeSchema,
  AllocationSourceSchema,
  CreateAllocationSchema,
  UpdateAllocationSchema,
  TransferAllocationSchema,
  CancelAllocationSchema,
  AllocationFilterSchema,
  AllocationConflictCheckSchema,
  AllocationHistoryEntrySchema,
  AllocationSchema,
  AllocationAvailabilitySlotSchema,
  BulkAllocationSchema,
} from './allocation';
