/**
 * Rental Object Categories
 * 
 * This file defines the category system for rental objects (utleieobjekter).
 * The 4-category system represents the main types of municipal assets available for rental.
 */

import type { BookingTimeMode } from '../types/enums';
import type { RentalObjectCategory } from '../types/rental-object';

// =============================================================================
// Default Time Modes
// =============================================================================

/**
 * Default time modes for each category
 */
export const CATEGORY_DEFAULT_TIME_MODE: Record<RentalObjectCategory, BookingTimeMode> = {
  LOKALER_OG_BANER: 'PERIOD',
  UTSTYR_OG_INVENTAR: 'ALL_DAY',
  KJORETOY_OG_TRANSPORT: 'ALL_DAY',
  OPPLEVELSER_OG_ARRANGEMENT: 'SLOT',
};

// =============================================================================
// Validation Functions
// =============================================================================

/**
 * Check if a value is a valid RentalObjectCategory
 */
export function isRentalObjectCategory(value: unknown): value is RentalObjectCategory {
  const validCategories: RentalObjectCategory[] = [
    'LOKALER_OG_BANER',
    'UTSTYR_OG_INVENTAR',
    'KJORETOY_OG_TRANSPORT',
    'OPPLEVELSER_OG_ARRANGEMENT',
  ];
  return typeof value === 'string' && validCategories.includes(value as RentalObjectCategory);
}

/**
 * Get the default time mode for a category
 */
export function getDefaultTimeMode(category: RentalObjectCategory): BookingTimeMode {
  return CATEGORY_DEFAULT_TIME_MODE[category];
}

// =============================================================================
// Display Labels
// =============================================================================

/**
 * Norwegian labels for categories
 */
export const CATEGORY_LABELS_NB: Record<RentalObjectCategory, string> = {
  LOKALER_OG_BANER: 'Lokaler og baner',
  UTSTYR_OG_INVENTAR: 'Utstyr og inventar',
  KJORETOY_OG_TRANSPORT: 'Kjoeretoy og transport',
  OPPLEVELSER_OG_ARRANGEMENT: 'Opplevelser og arrangement',
};

/**
 * English labels for categories
 */
export const CATEGORY_LABELS_EN: Record<RentalObjectCategory, string> = {
  LOKALER_OG_BANER: 'Spaces & Courts',
  UTSTYR_OG_INVENTAR: 'Equipment & Inventory',
  KJORETOY_OG_TRANSPORT: 'Vehicles & Transport',
  OPPLEVELSER_OG_ARRANGEMENT: 'Experiences & Events',
};

/**
 * Get display label for a category
 */
export function getCategoryLabel(
  category: RentalObjectCategory,
  locale: 'nb' | 'en' = 'nb'
): string {
  const labels = locale === 'nb' ? CATEGORY_LABELS_NB : CATEGORY_LABELS_EN;
  return labels[category] || category;
}

/**
 * Category icons (icon names for use with icon libraries)
 */
export const CATEGORY_ICONS: Record<RentalObjectCategory, string> = {
  LOKALER_OG_BANER: 'building',
  UTSTYR_OG_INVENTAR: 'package',
  KJORETOY_OG_TRANSPORT: 'car',
  OPPLEVELSER_OG_ARRANGEMENT: 'calendar',
};

// =============================================================================
// API Endpoints
// =============================================================================

/**
 * API endpoints for rental objects
 */
export const RENTAL_OBJECT_ENDPOINTS = {
  base: '/api/rental-objects',
  byId: (id: string) => `/api/rental-objects/${id}`,
  bySlug: (slug: string) => `/api/rental-objects/slug/${slug}`,
  availability: (id: string) => `/api/rental-objects/${id}/availability`,
  calendarConfig: (id: string) => `/api/rental-objects/${id}/calendar-config`,
  stats: (id: string) => `/api/rental-objects/${id}/stats`,
  media: (id: string) => `/api/rental-objects/${id}/media`,
  publish: (id: string) => `/api/rental-objects/${id}/publish`,
  unpublish: (id: string) => `/api/rental-objects/${id}/unpublish`,
  archive: (id: string) => `/api/rental-objects/${id}/archive`,
  restore: (id: string) => `/api/rental-objects/${id}/restore`,
  duplicate: (id: string) => `/api/rental-objects/${id}/duplicate`,
} as const;
