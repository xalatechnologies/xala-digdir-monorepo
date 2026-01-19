/**
 * Wizard Types
 * Type definitions for the rental object wizard
 */

import type { RentalObject as ContractRentalObject } from '@digilist/client-sdk';

/**
 * Re-export RentalObject from contracts
 */
export type RentalObject = ContractRentalObject;

/**
 * Wizard step identifiers
 */
export type WizardStepId =
  | 'category'
  | 'basics'
  | 'details'           // Location + Capacity
  | 'resources'         // Inventory + Pickup + Requirements
  | 'availability'      // Opening Hours + Schedule
  | 'booking-settings'  // Pricing + Policies + Timing (interactive)
  | 'packages'
  | 'media'
  | 'content'
  | 'review';

/**
 * Wizard step configuration
 */
export interface WizardStep {
  /** Step identifier */
  id: WizardStepId;
  /** Step title i18n key */
  titleKey: string;
  /** Step description i18n key */
  descriptionKey?: string;
  /** Whether step is completed */
  completed: boolean;
  /** Whether step has validation errors */
  hasErrors: boolean;
  /** Whether step can be skipped */
  optional?: boolean;
}

/**
 * Validation error
 */
export interface ValidationError {
  /** Field name */
  field: string;
  /** Error message */
  message: string;
}

/**
 * Step validation result
 */
export interface StepValidationResult {
  /** Whether step is valid */
  isValid: boolean;
  /** Validation errors (if any) */
  errors: ValidationError[];
}
