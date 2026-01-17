/**
 * Wizard Constants
 * Defines category configurations and step mappings for the rental object wizard
 */

import type { RentalObjectCategory, BookingTimeMode } from '@xala/contracts';
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
    nameKey: 'rentalObjects.category.LOKALER_OG_BANER',
    descriptionKey: 'rentalObjects.category.LOKALER_OG_BANER.description',
  },
  UTSTYR_OG_INVENTAR: {
    defaultTimeMode: 'ALL_DAY',
    nameKey: 'rentalObjects.category.UTSTYR_OG_INVENTAR',
    descriptionKey: 'rentalObjects.category.UTSTYR_OG_INVENTAR.description',
  },
  KJORETOY_OG_TRANSPORT: {
    defaultTimeMode: 'ALL_DAY',
    nameKey: 'rentalObjects.category.KJORETOY_OG_TRANSPORT',
    descriptionKey: 'rentalObjects.category.KJORETOY_OG_TRANSPORT.description',
  },
  OPPLEVELSER_OG_ARRANGEMENT: {
    defaultTimeMode: 'SLOT',
    nameKey: 'rentalObjects.category.OPPLEVELSER_OG_ARRANGEMENT',
    descriptionKey: 'rentalObjects.category.OPPLEVELSER_OG_ARRANGEMENT.description',
  },
};

/**
 * All possible wizard steps
 */
export const ALL_WIZARD_STEPS: WizardStepId[] = [
  'category',
  'basics',
  'media',
  'location',
  'capacity',
  'inventory',
  'opening-hours',
  'pickup',
  'requirements',
  'packages',
  'schedule',
  'booking',
  'content',
  'review',
];

/**
 * Wizard steps by rental object category
 * Different categories show different steps based on their requirements
 */
export const WIZARD_STEPS_BY_CATEGORY: Record<RentalObjectCategory, WizardStepId[]> = {
  LOKALER_OG_BANER: [
    'category',
    'basics',
    'media',
    'location',
    'capacity',
    'opening-hours',
    'booking',
    'content',
    'review',
  ],
  UTSTYR_OG_INVENTAR: [
    'category',
    'basics',
    'media',
    'inventory',
    'pickup',
    'booking',
    'content',
    'review',
  ],
  KJORETOY_OG_TRANSPORT: [
    'category',
    'basics',
    'media',
    'inventory',
    'pickup',
    'requirements',
    'booking',
    'content',
    'review',
  ],
  OPPLEVELSER_OG_ARRANGEMENT: [
    'category',
    'basics',
    'media',
    'location',
    'capacity',
    'packages',
    'schedule',
    'booking',
    'content',
    'review',
  ],
};
