/**
 * Wizard Constants
 * Defines category configurations and step mappings for the rental object wizard
 */

import type { RentalObjectCategory, BookingTimeMode } from '@xalatechnologies/platform/contracts';
import type { WizardStepId } from './wizard-types';

/**
 * Category configuration
 */
export interface CategoryConfig {
  /** Default time mode for this category */
  defaultTimeMode: BookingTimeMode;
  /** Display name i18n key */
  nameKey: string;
  /** Description i18n key */
  descriptionKey: string;
}

/**
 * Configuration for each rental object category
 */
export const CATEGORY_CONFIGS: Record<RentalObjectCategory, CategoryConfig> = {
  LOKALER_OG_BANER: {
    defaultTimeMode: 'PERIOD',
    nameKey: 'rentalObjects.category.LOKALER-OG-BANER',
    descriptionKey: 'rentalObjects.category.LOKALER-OG-BANER.description',
  },
  UTSTYR_OG_INVENTAR: {
    defaultTimeMode: 'ALL_DAY',
    nameKey: 'rentalObjects.category.UTSTYR-OG-INVENTAR',
    descriptionKey: 'rentalObjects.category.UTSTYR-OG-INVENTAR.description',
  },
  KJORETOY_OG_TRANSPORT: {
    defaultTimeMode: 'ALL_DAY',
    nameKey: 'rentalObjects.category.KJORETOY-OG-TRANSPORT',
    descriptionKey: 'rentalObjects.category.KJORETOY-OG-TRANSPORT.description',
  },
  OPPLEVELSER_OG_ARRANGEMENT: {
    defaultTimeMode: 'SLOT',
    nameKey: 'rentalObjects.category.OPPLEVELSER-OG-ARRANGEMENT',
    descriptionKey: 'rentalObjects.category.OPPLEVELSER-OG-ARRANGEMENT.description',
  },
};

/**
 * All possible wizard steps
 */
export const ALL_WIZARD_STEPS: WizardStepId[] = [
  'category',
  'basics',
  'details',
  'resources',
  'availability',
  'booking-settings',
  'packages',
  'media',
  'content',
  'review',
];

/**
 * Wizard steps by rental object category
 * Different categories show different steps based on their requirements
 */
/**
 * Wizard steps by rental object category
 * Consolidated professional steps
 */
export const WIZARD_STEPS_BY_CATEGORY: Record<RentalObjectCategory, WizardStepId[]> = {
  LOKALER_OG_BANER: [
    'category',
    'basics',
    'details',           // location + capacity
    'availability',      // opening-hours + schedule
    'booking-settings',  // pricing + policies + timing
    'media',
    'content',
    'review',
  ],
  UTSTYR_OG_INVENTAR: [
    'category',
    'basics',
    'resources',         // inventory + pickup
    'availability',      // opening-hours + schedule
    'booking-settings',  // pricing + policies + timing
    'media',
    'content',
    'review',
  ],
  KJORETOY_OG_TRANSPORT: [
    'category',
    'basics',
    'resources',         // inventory + pickup + requirements
    'availability',      // opening-hours + schedule
    'booking-settings',  // pricing + policies + timing
    'media',
    'content',
    'review',
  ],
  OPPLEVELSER_OG_ARRANGEMENT: [
    'category',
    'basics',
    'details',           // location + capacity
    'packages',          // keep packages separate as it's complex
    'availability',      // schedule
    'booking-settings',  // pricing + policies + timing
    'media',
    'content',
    'review',
  ],
};
