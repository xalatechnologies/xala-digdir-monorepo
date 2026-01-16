/**
 * Rental Object Wizard
 * Multi-step form for creating and editing rental objects
 *
 * NOTE: Rental objects use rental_object terminology throughout.
 * Internally, rental objects are stored as listings with type=RESOURCE.
 */

import { ListingWizard } from '../../../listings/components/wizard/ListingWizard';

export interface RentalObjectWizardProps {
  /** Rental object slug for edit mode */
  slug?: string | undefined;
}

/**
 * Rental Object Wizard Component
 * Multi-step wizard for creating and editing rental objects
 * Rental objects are equipment and resources that can be booked by citizens
 *
 * NOTE: Delegates to ListingWizard internally (rental objects are RESOURCE type listings)
 */
export function RentalObjectWizard({ slug }: RentalObjectWizardProps) {
  // Forces type to RESOURCE for rental objects
  // In edit mode: loads existing rental object data
  // In create mode: creates new rental object with RESOURCE type
  return <ListingWizard slug={slug} initialType="RESOURCE" />;
}
