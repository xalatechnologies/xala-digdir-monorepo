/**
 * Rental Object Wizard
 * Multi-step form for creating and editing rental objects
 *
 * NOTE: Rental objects use rental_object terminology throughout.
 * Internally, rental objects are stored as listings with type=RESOURCE.
 */

import { useT } from '@xala/i18n';
import { Heading, Paragraph } from '@xala/ds';

export interface RentalObjectWizardProps {
  /** Rental object slug for edit mode */
  slug?: string | undefined;
}

/**
 * Rental Object Wizard Component
 * Multi-step wizard for creating and editing rental objects
 * Rental objects are equipment and resources that can be booked by citizens
 *
 * TODO: Implement full wizard with steps (basics, location, media, pricing, etc.)
 */
export function RentalObjectWizard({ slug }: RentalObjectWizardProps) {
  const t = useT();

  return (
    <div>
      <Heading level={1}>{slug ? t('rentalObjects.editTitle') : t('rentalObjects.createTitle')}</Heading>
      <Paragraph>{t('rentalObjects.wizardDescription')}</Paragraph>
      {/* TODO: Implement wizard steps */}
    </div>
  );
}
