/**
 * Rental Objects Types
 * Central export point for all rental object types and constants
 */

// Re-export types from contracts
export type {
  RentalObjectCategory,
  BookingTimeMode,
  CreateRentalObjectDTO,
  UpdateRentalObjectDTO,
  RentalObjectProjectionDTO,
} from '@xalatechnologies/platform/contracts';

// Export wizard types
export * from './wizard-types';

// Export wizard constants
export * from './wizard-constants';

// Export wizard component props
export type { RentalObjectWizardProps } from '../components/wizard/RentalObjectWizard';
