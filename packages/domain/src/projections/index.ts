/**
 * @digilist/domain - Projection exports
 *
 * Projection DTOs for API responses, optimized for specific UI use cases.
 * These follow the "Zero Transformers" principle - use directly in components.
 */

// Rental Object Projections
export {
  RentalObjectListProjectionSchema,
  RentalObjectDetailProjectionSchema,
  RentalObjectCardProjectionSchema,
  RentalObjectSelectProjectionSchema,
  RentalObjectCalendarProjectionSchema,
  RentalObjectMapMarkerProjectionSchema,
} from './rental-object';

export type {
  RentalObjectListProjection,
  RentalObjectDetailProjection,
  RentalObjectCardProjection,
  RentalObjectSelectProjection,
  RentalObjectCalendarProjection,
  RentalObjectMapMarkerProjection,
} from './rental-object';

// Booking Projections
export {
  BookingListProjectionSchema,
  BookingDetailProjectionSchema,
  BookingCardProjectionSchema,
  BookingCalendarProjectionSchema,
  BookingConfirmationProjectionSchema,
  BookingSummaryStatsProjectionSchema,
} from './booking';

export type {
  BookingListProjection,
  BookingDetailProjection,
  BookingCardProjection,
  BookingCalendarProjection,
  BookingConfirmationProjection,
  BookingSummaryStatsProjection,
} from './booking';

// Season Projections
export {
  SeasonListProjectionSchema,
  SeasonDetailProjectionSchema,
  SeasonApplicationListProjectionSchema,
  SeasonApplicationDetailProjectionSchema,
  SeasonCardProjectionSchema,
  SeasonSummaryStatsProjectionSchema,
} from './season';

export type {
  SeasonListProjection,
  SeasonDetailProjection,
  SeasonApplicationListProjection,
  SeasonApplicationDetailProjection,
  SeasonCardProjection,
  SeasonSummaryStatsProjection,
} from './season';
