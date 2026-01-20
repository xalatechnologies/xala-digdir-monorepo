/**
 * Rental Objects Feature
 *
 * Complete CRUD module for managing rental objects in the Backoffice
 */

// Components - List View
export { RentalObjectsListView } from './components/RentalObjectsListView';

// Components - Detail View
export { RentalObjectDetailView } from './components/detail/RentalObjectDetailView';

// Components - Wizard (Create/Edit)
export { RentalObjectWizard } from './components/wizard/RentalObjectWizard';
export type { RentalObjectWizardProps } from './components/wizard/RentalObjectWizard';

// Hooks
export { useRentalObjectWizard } from './hooks/useRentalObjectWizard';
export type { UseRentalObjectWizardReturn, UseRentalObjectWizardOptions } from './hooks/useRentalObjectWizard';

// Types
export type { RentalObjectCategory, WizardStepId, WizardStep, RentalObject } from './types';
export { ALL_WIZARD_STEPS, WIZARD_STEPS_BY_CATEGORY, CATEGORY_CONFIGS } from './types';
