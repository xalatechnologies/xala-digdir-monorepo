/**
 * Adapters Index
 * 
 * Exports all domain adapters
 * 
 * @module domain/adapters
 * @since 1.0.0
 */

// Base adapter infrastructure
export {
  BaseDomainAdapter,
  AdapterLogger,
  DomainDisabledError,
  PolicyExecutionError,
  DEFAULT_ADAPTER_CONFIG,
  type AdapterConfig,
  type AdapterContext,
  type AdapterResult,
} from './base.adapter';

// Booking adapter
export {
  BookingDomainAdapter,
  BookingPolicyViolationError,
  type CreateBookingInput,
  type BookingDTO,
  type LegacyBookingService,
} from './booking.adapter';

// Pricing adapter
export {
  PricingDomainAdapter,
  type PriceQuoteRequest,
  type PriceQuoteDTO,
  type PriceBreakdownItem,
  type LegacyPricingService,
} from './pricing.adapter';
