/**
 * Rental Object Wizard Validation
 * Category-specific validation for each wizard step
 */

import type {
  RentalObject,
  RentalObjectCategory,
  WizardStep,
  WizardStepId,
  ValidationError,
  StepValidationResult,
} from '../types';

/**
 * Validates a single wizard step
 * Note: Messages are hardcoded in Norwegian as this is a pure validation utility
 */
export function validateStep(
  stepId: WizardStepId,
  data: Partial<RentalObject>,
  category: RentalObjectCategory
): StepValidationResult {
  const errors: ValidationError[] = [];

  switch (stepId) {
    case 'basics':
      if (!data.name?.trim()) {
        errors.push({ field: 'name', message: 'Navn er påkrevd' });
      }
      if (!data.category) {
        errors.push({ field: 'category', message: 'Kategori er påkrevd' });
      }
      break;

    case 'location':
      // Location is required for LOKALER_OG_BANER and optional for OPPLEVELSER
      if (category === 'LOKALER_OG_BANER') {
        if (!data.location?.address) {
          errors.push({ field: 'location.address', message: 'Adresse er påkrevd for denne kategori' });
        }
      }
      break;

    case 'capacity':
      if (data.capacity !== undefined && data.capacity < 0) {
        errors.push({ field: 'capacity', message: 'Kapasitet kan ikke være negativ' });
      }
      break;

    case 'opening-hours':
      // Opening hours validation - at least one day should be set for LOKALER_OG_BANER
      if (category === 'LOKALER_OG_BANER') {
        const hasOpeningHours = data.openingHours && Object.values(data.openingHours).some(
          (day) => day !== null && day !== undefined
        );
        if (!hasOpeningHours) {
          errors.push({ field: 'openingHours', message: 'Minst én dag med åpningstider er påkrevd' });
        }
      }
      break;

    case 'inventory':
      // Inventory is required for UTSTYR_OG_INVENTAR
      if (category === 'UTSTYR_OG_INVENTAR') {
        if (!data.inventory?.totalQuantity || data.inventory.totalQuantity <= 0) {
          errors.push({ field: 'inventory.totalQuantity', message: 'Antall enheter er påkrevd' });
        }
      }
      break;

    case 'pickup':
      // Pickup validation for UTSTYR_OG_INVENTAR and KJORETOY_OG_TRANSPORT
      if (category === 'UTSTYR_OG_INVENTAR' || category === 'KJORETOY_OG_TRANSPORT') {
        if (data.pickup?.enabled && !data.pickup?.pickupLocation?.address) {
          errors.push({ field: 'pickup.pickupLocation', message: 'Hentelokasjon er påkrevd' });
        }
      }
      break;

    case 'requirements':
      // Requirements validation for KJORETOY_OG_TRANSPORT
      if (category === 'KJORETOY_OG_TRANSPORT') {
        if (data.requirements?.licenseRequired && (!data.requirements?.licenseTypes || data.requirements.licenseTypes.length === 0)) {
          errors.push({ field: 'requirements.licenseTypes', message: 'Førerkorttype er påkrevd når førerkort kreves' });
        }
      }
      break;

    case 'packages':
      // Packages validation for OPPLEVELSER_OG_ARRANGEMENT
      if (category === 'OPPLEVELSER_OG_ARRANGEMENT') {
        if (data.packages) {
          data.packages.forEach((pkg: { name?: string; price: number }, index: number) => {
            if (!pkg.name?.trim()) {
              errors.push({ field: `packages[${index}].name`, message: `Pakke ${index + 1}: Navn er påkrevd` });
            }
            if (pkg.price < 0) {
              errors.push({ field: `packages[${index}].price`, message: `Pakke ${index + 1}: Pris kan ikke være negativ` });
            }
          });
        }
      }
      break;

    case 'schedule':
      // Schedule validation for OPPLEVELSER_OG_ARRANGEMENT
      if (category === 'OPPLEVELSER_OG_ARRANGEMENT') {
        if (!data.schedule?.sessions || data.schedule.sessions.length === 0) {
          errors.push({ field: 'schedule.sessions', message: 'Minst én økt er påkrevd' });
        }
      }
      break;

    case 'content':
      // Content is optional but should have reasonable limits
      if (data.content?.fullDescription && data.content.fullDescription.length > 10000) {
        errors.push({ field: 'content.fullDescription', message: 'Beskrivelse er for lang (maks 10000 tegn)' });
      }
      break;

    case 'booking':
      // Booking configuration validation
      if (data.bookingConfig) {
        if (data.bookingConfig.slotDurationMinutes !== undefined && data.bookingConfig.slotDurationMinutes <= 0) {
          errors.push({ field: 'bookingConfig.slotDurationMinutes', message: 'Tidsluke-varighet må være positiv' });
        }
        if (data.bookingConfig.minLeadTimeHours !== undefined && data.bookingConfig.minLeadTimeHours < 0) {
          errors.push({ field: 'bookingConfig.minLeadTimeHours', message: 'Minimum ledetid kan ikke være negativ' });
        }
        if (data.bookingConfig.maxAdvanceDays !== undefined && data.bookingConfig.maxAdvanceDays <= 0) {
          errors.push({ field: 'bookingConfig.maxAdvanceDays', message: 'Maks forhåndsbestilling må være positiv' });
        }
      }
      break;

    case 'media':
      // At least one image is recommended for publishing
      // This is a soft validation - we don't block progress
      break;

    case 'review':
      // Final review step - comprehensive validation
      if (!data.name?.trim()) {
        errors.push({ field: 'name', message: 'Navn er påkrevd' });
      }
      if (!data.description?.trim()) {
        errors.push({ field: 'description', message: 'Beskrivelse anbefales for publisering' });
      }
      break;
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Validates all wizard steps
 */
export function validateAllSteps(
  steps: WizardStep[],
  data: Partial<RentalObject>,
  category: RentalObjectCategory
): Record<string, string[]> {
  const allErrors: Record<string, string[]> = {};

  for (const step of steps) {
    const result = validateStep(step.id, data, category);
    if (!result.isValid) {
      allErrors[step.id] = result.errors.map((e) => e.message);
    }
  }

  return allErrors;
}

/**
 * Checks if rental object is ready for publishing
 */
export function canPublish(
  data: Partial<RentalObject>,
  category: RentalObjectCategory
): { canPublish: boolean; missingFields: string[] } {
  const missingFields: string[] = [];

  // Required fields for all categories
  if (!data.name?.trim()) missingFields.push('Navn');
  if (!data.category) missingFields.push('Kategori');
  if (!data.description?.trim()) missingFields.push('Beskrivelse');

  // Category-specific required fields
  switch (category) {
    case 'LOKALER_OG_BANER':
      if (!data.location?.address) missingFields.push('Adresse');
      if (!data.openingHours || Object.values(data.openingHours).every(d => !d)) {
        missingFields.push('Åpningstider');
      }
      break;

    case 'UTSTYR_OG_INVENTAR':
      if (!data.inventory?.totalQuantity) missingFields.push('Antall enheter');
      break;

    case 'KJORETOY_OG_TRANSPORT':
      // Requirements are optional but recommended
      break;

    case 'OPPLEVELSER_OG_ARRANGEMENT':
      if (!data.schedule?.sessions?.length) missingFields.push('Timeplan');
      break;
  }

  // Media is recommended for all
  if (!data.images || data.images.length === 0) {
    missingFields.push('Bilder');
  }

  return {
    canPublish: missingFields.length === 0,
    missingFields,
  };
}
