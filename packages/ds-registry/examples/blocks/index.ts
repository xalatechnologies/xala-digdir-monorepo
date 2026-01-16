/**
 * Blocks component examples
 *
 * This file exports all example implementations for blocks components.
 * Blocks components are business-logic components built from primitives
 * and composed components, providing domain-specific UI patterns.
 */

// Re-export all blocks component examples
export * from './listing-card';
export * from './booking-form-modal';

/**
 * Example metadata for documentation generation
 */
export const blocksExampleList = [
  {
    name: 'ListingCard',
    file: 'listing-card.tsx',
    description: 'Reusable card component for displaying rental objects (spaces, resources, vehicles, events). NOTE: "ListingCard" is a legacy component name.',
    examples: [
      'BasicListingCard',
      'GridListingCardWithFacilities',
      'ListingCardWithPricing',
      'DetailedListingCard',
      'InteractiveListingCard',
      'VehicleListingCard',
      'EventListingCard',
      'ListingCardGrid',
      'CustomizedListingCard'
    ]
  },
  {
    name: 'BookingFormModal',
    file: 'booking-form-modal.tsx',
    description: 'Modal component for booking rental objects with validation and submission',
    examples: [
      'BasicBookingFormModal',
      'BookingFormModalWithPricing',
      'BookingFormModalWithServices',
      'BookingFormModalWithCapacity',
      'MultiDayBookingFormModal',
      'CompleteBookingFlow',
      'EventBookingFormModal',
      'ControlledBookingFormModal'
    ]
  }
] as const;
