/**
 * Wizard Types
 * Type definitions for the rental object wizard
 */

import type { RentalObject as ContractRentalObject } from '@xala/contracts';

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
  | 'media'
  | 'location'
  | 'capacity'
  | 'inventory'
  | 'opening-hours'
  | 'pickup'
  | 'requirements'
  | 'packages'
  | 'schedule'
  | 'booking'
  | 'content'
  | 'custody'
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
