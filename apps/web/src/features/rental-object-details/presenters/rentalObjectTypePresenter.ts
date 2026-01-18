/**
 * Rental Object Type Presenter
 *
 * Configuration-driven presenter that controls how each rental object type
 * is displayed. This enables dynamic, type-specific rendering without
 * hardcoding logic in components.
 */

import type { RentalObjectType, KeyFacts, BookingMode } from '../types';
import { useT } from '@xala/i18n';

// =============================================================================
// Presenter Configuration Types
// =============================================================================

export interface KeyFactConfig {
  key: keyof KeyFacts;
  icon: string;
  labelKey: string;
  format?: (value: unknown, keyFacts: KeyFacts) => string;
  show: (keyFacts: KeyFacts) => boolean;
  priority: number;
}

export interface ActivityTabConfig {
  labelKey: string;
  type: 'events' | 'rentals' | 'sessions';
  showCalendar: boolean;
  showTimeline: boolean;
  emptyStateKey: string;
}

export interface RentalObjectTypeConfig {
  type: RentalObjectType;
  labelKey: string;
  iconName: string;
  keyFacts: KeyFactConfig[];
  activityTab: ActivityTabConfig;
  showOpeningHours: boolean;
  showCapacity: boolean;
  showArea: boolean;
  amenityCategories: string[];
  defaultBookingMode: BookingMode;
  emptyStates: {
    description: string;
    amenities: string;
    rules: string;
    faq: string;
    activity: string;
  };
}

// =============================================================================
// Key Fact Formatters
// =============================================================================

const formatCapacity = (value: unknown, keyFacts: KeyFacts): string => {
  const capacity = value as number;
  const label = keyFacts.capacityLabel || 'personer';
  return `${capacity} ${label}`;
};

const formatArea = (value: unknown, keyFacts: KeyFacts): string => {
  const area = value as number;
  const unit = keyFacts.areaUnit === 'sqft' ? 'sq ft' : 'm²';
  return `${area} ${unit}`;
};

const formatQuantity = (value: unknown, keyFacts: KeyFacts): string => {
  const qty = value as number;
  const label = keyFacts.unitLabel || 'enheter';
  return `${qty} ${label}`;
};

const formatDuration = (value: unknown): string => {
  return value as string;
};

const formatAccessibility = (value: unknown): string => {
  return value ? 't('common.universell_utforming')' : '';
};

// =============================================================================
// Presenter Configurations per Type
// =============================================================================

const facilityConfig: RentalObjectTypeConfig = {
  type: 'FACILITY',
  labelKey: 'listingTypes.facility',
  iconName: 'building',
  keyFacts: [
    {
      key: 'capacity',
      icon: 'users',
      labelKey: 'keyFacts.capacity',
      format: formatCapacity,
      show: (kf) => !!kf.capacity && kf.capacity > 0,
      priority: 1,
    },
    {
      key: 'area',
      icon: 'maximize',
      labelKey: 'keyFacts.area',
      format: formatArea,
      show: (kf) => !!kf.area && kf.area > 0,
      priority: 2,
    },
    {
      key: 'bookingMode',
      icon: 'calendar',
      labelKey: 'keyFacts.bookingMode',
      format: (v) => {
        const modes: Record<string, string> = {
          SLOTS: 'Timebasert',
          ALL_DAY: 'Heldags',
          DURATION: 'Varighet',
          TICKETS: 'Billetter',
          NONE: 'Ikke bookbar',
        };
        return modes[v as string] || '';
      },
      show: (kf) => !!kf.bookingMode && kf.bookingMode !== 'NONE',
      priority: 3,
    },
    {
      key: 'wheelchairAccessible',
      icon: 'accessibility',
      labelKey: 'keyFacts.accessibility',
      format: formatAccessibility,
      show: (kf) => !!kf.wheelchairAccessible,
      priority: 4,
    },
  ],
  activityTab: {
    labelKey: 'Aktivitetskalender',
    type: 'events',
    showCalendar: true,
    showTimeline: true,
    emptyStateKey: 'empty.noEvents',
  },
  showOpeningHours: true,
  showCapacity: true,
  showArea: true,
  amenityCategories: ['equipment', 'comfort', 'technology', 'accessibility'],
  defaultBookingMode: 'SLOTS',
  emptyStates: {
    description: 'rentalObject.emptyState.description',
    amenities: 'rentalObject.emptyState.amenities.facility',
    rules: 'rentalObject.emptyState.rules.facility',
    faq: 'rentalObject.emptyState.faq',
    activity: 'rentalObject.emptyState.activity.facility',
  },
};

const equipmentConfig: RentalObjectTypeConfig = {
  type: 'EQUIPMENT',
  labelKey: 'listingTypes.equipment',
  iconName: 'tool',
  keyFacts: [
    {
      key: 'quantity',
      icon: 'package',
      labelKey: 'keyFacts.quantity',
      format: formatQuantity,
      show: (kf) => !!kf.quantity && kf.quantity > 0,
      priority: 1,
    },
    {
      key: 'condition',
      icon: 'check-circle',
      labelKey: 'keyFacts.condition',
      format: (v) => {
        const conditions: Record<string, string> = {
          new: 'Ny',
          good: 'God stand',
          fair: 'Brukbar stand',
        };
        return conditions[v as string] || '';
      },
      show: (kf) => !!kf.condition,
      priority: 2,
    },
    {
      key: 'bookingMode',
      icon: 'calendar',
      labelKey: 'keyFacts.bookingMode',
      format: (v) => {
        const modes: Record<string, string> = {
          SLOTS: 'Timebasert',
          ALL_DAY: 'Heldags',
          DURATION: 'Varighet',
          NONE: 'Ikke bookbar',
        };
        return modes[v as string] || '';
      },
      show: (kf) => !!kf.bookingMode && kf.bookingMode !== 'NONE',
      priority: 3,
    },
  ],
  activityTab: {
    labelKey: 'Utleiehistorikk',
    type: 'rentals',
    showCalendar: false,
    showTimeline: true,
    emptyStateKey: 'empty.noRentals',
  },
  showOpeningHours: false,
  showCapacity: false,
  showArea: false,
  amenityCategories: ['included', 'accessories'],
  defaultBookingMode: 'DURATION',
  emptyStates: {
    description: 'rentalObject.emptyState.description',
    amenities: 'rentalObject.emptyState.amenities.equipment',
    rules: 'rentalObject.emptyState.rules.equipment',
    faq: 'rentalObject.emptyState.faq',
    activity: 'rentalObject.emptyState.activity.equipment',
  },
};

const eventConfig: RentalObjectTypeConfig = {
  type: 'EVENT',
  labelKey: 'listingTypes.event',
  iconName: 'calendar-event',
  keyFacts: [
    {
      key: 'capacity',
      icon: 'users',
      labelKey: 'keyFacts.seats',
      format: (v, kf) => `${v} ${kf.capacityLabel || 'plasser'}`,
      show: (kf) => !!kf.capacity && kf.capacity > 0,
      priority: 1,
    },
    {
      key: 'duration',
      icon: 'clock',
      labelKey: 'keyFacts.duration',
      format: formatDuration,
      show: (kf) => !!kf.duration,
      priority: 2,
    },
    {
      key: 'sessions',
      icon: 'repeat',
      labelKey: 'keyFacts.sessions',
      format: (v) => `${v} økter`,
      show: (kf) => !!kf.sessions && kf.sessions > 1,
      priority: 3,
    },
    {
      key: 'wheelchairAccessible',
      icon: 'accessibility',
      labelKey: 'keyFacts.accessibility',
      format: formatAccessibility,
      show: (kf) => !!kf.wheelchairAccessible,
      priority: 4,
    },
  ],
  activityTab: {
    labelKey: 'Økter',
    type: 'sessions',
    showCalendar: true,
    showTimeline: false,
    emptyStateKey: 'empty.noSessions',
  },
  showOpeningHours: false,
  showCapacity: true,
  showArea: false,
  amenityCategories: ['included', 'accessibility'],
  defaultBookingMode: 'TICKETS',
  emptyStates: {
    description: 'rentalObject.emptyState.description',
    amenities: 'rentalObject.emptyState.amenities.event',
    rules: 'rentalObject.emptyState.rules.event',
    faq: 'rentalObject.emptyState.faq',
    activity: 'rentalObject.emptyState.activity.event',
  },
};

const otherConfig: RentalObjectTypeConfig = {
  type: 'OTHER',
  labelKey: 'listingTypes.other',
  iconName: 'grid',
  keyFacts: [
    {
      key: 'capacity',
      icon: 'users',
      labelKey: 'keyFacts.capacity',
      format: formatCapacity,
      show: (kf) => !!kf.capacity && kf.capacity > 0,
      priority: 1,
    },
    {
      key: 'quantity',
      icon: 'package',
      labelKey: 'keyFacts.quantity',
      format: formatQuantity,
      show: (kf) => !!kf.quantity && kf.quantity > 0,
      priority: 2,
    },
    {
      key: 'bookingMode',
      icon: 'calendar',
      labelKey: 'keyFacts.bookingMode',
      format: (v) => {
        const modes: Record<string, string> = {
          SLOTS: 'Timebasert',
          ALL_DAY: 'Heldags',
          DURATION: 'Varighet',
          TICKETS: 'Billetter',
          NONE: 'Ikke bookbar',
        };
        return modes[v as string] || '';
      },
      show: (kf) => !!kf.bookingMode && kf.bookingMode !== 'NONE',
      priority: 3,
    },
  ],
  activityTab: {
    labelKey: 'Aktivitetskalender',
    type: 'rentals',
    showCalendar: true,
    showTimeline: true,
    emptyStateKey: 'empty.noHistory',
  },
  showOpeningHours: true,
  showCapacity: true,
  showArea: true,
  amenityCategories: ['general'],
  defaultBookingMode: 'DURATION',
  emptyStates: {
    description: 'rentalObject.emptyState.description',
    amenities: 'rentalObject.emptyState.amenities.other',
    rules: 'rentalObject.emptyState.rules.other',
    faq: 'rentalObject.emptyState.faq',
    activity: 'rentalObject.emptyState.activity.other',
  },
};

// =============================================================================
// Configuration Map
// =============================================================================

const configMap: Record<RentalObjectType, RentalObjectTypeConfig> = {
  FACILITY: facilityConfig,
  EQUIPMENT: equipmentConfig,
  EVENT: eventConfig,
  OTHER: otherConfig,
};

// =============================================================================
// Presenter Class
// =============================================================================

export class RentalObjectTypePresenter {
  private config: RentalObjectTypeConfig;

  constructor(rentalObjectType: RentalObjectType) {
    this.config = configMap[rentalObjectType] || configMap.OTHER;
  }

  get type(): RentalObjectType {
    return this.config.type;
  }

  get labelKey(): string {
    return this.config.labelKey;
  }

  get iconName(): string {
    return this.config.iconName;
  }

  get showOpeningHours(): boolean {
    return this.config.showOpeningHours;
  }

  get activityTabConfig(): ActivityTabConfig {
    return this.config.activityTab;
  }

  get amenityCategories(): string[] {
    return this.config.amenityCategories;
  }

  get defaultBookingMode(): BookingMode {
    return this.config.defaultBookingMode;
  }

  /**
   * Get the key facts to display, sorted by priority
   */
  getKeyFacts(keyFacts: KeyFacts): Array<{
    key: string;
    icon: string;
    label: string;
    value: string;
  }> {
    return this.config.keyFacts
      .filter((config) => config.show(keyFacts))
      .sort((a, b) => a.priority - b.priority)
      .map((config) => ({
        key: config.key,
        icon: config.icon,
        label: config.labelKey,
        value: config.format
          ? config.format(keyFacts[config.key], keyFacts)
          : String(keyFacts[config.key] || ''),
      }));
  }

  /**
   * Get empty state message for a section
   */
  getEmptyState(section: keyof RentalObjectTypeConfig['emptyStates']): string {
    return this.config.emptyStates[section];
  }

  /**
   * Check if a specific feature should be shown
   */
  shouldShow(feature: 'openingHours' | 'capacity' | 'area'): boolean {
    switch (feature) {
      case 'openingHours':
        return this.config.showOpeningHours;
      case 'capacity':
        return this.config.showCapacity;
      case 'area':
        return this.config.showArea;
      default:
        return false;
    }
  }
}

// =============================================================================
// Factory Function
// =============================================================================

export function createPresenter(rentalObjectType: RentalObjectType): RentalObjectTypePresenter {
  return new RentalObjectTypePresenter(rentalObjectType);
}

// =============================================================================
// Helper Functions
// =============================================================================

/**
 * Get localized rental object type label
 */
export function getRentalObjectTypeLabel(type: RentalObjectType): string {
  const t = useT();
  const labels: Record<RentalObjectType, string> = {
    FACILITY: 'Lokale',
    EQUIPMENT: 'Utstyr',
    EVENT: 'Arrangement',
    OTHER: 'Annet',
  };
  return labels[type] || labels.OTHER;
}

/**
 * Get booking mode label
 */
export function getBookingModeLabel(mode: BookingMode): string {
  const labels: Record<BookingMode, string> = {
    SLOTS: 'Timebasert booking',
    ALL_DAY: 'Heldagsbooking',
    DURATION: 'Varighetsbasert',
    TICKETS: 'Billettbooking',
    NONE: 'Ikke bookbar',
  };
  return labels[mode] || '';
}

/**
 * Check if listing is currently open (for facilities)
 */
export function isCurrentlyOpen(
  openingHours: { regular: Array<{ dayIndex: number; open?: string; close?: string; isClosed: boolean }> } | undefined
): { isOpen: boolean; statusText: string; nextChange?: string } {
  if (!openingHours?.regular) {
    return { isOpen: false, statusText: 'Ukjent' };
  }

  const now = new Date();
  const currentDay = now.getDay();
  const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

  const todayHours = openingHours.regular.find((h) => h.dayIndex === currentDay);

  if (!todayHours || todayHours.isClosed || !todayHours.open || !todayHours.close) {
    return { isOpen: false, statusText: 'Stengt i dag' };
  }

  const isOpen = currentTime >= todayHours.open && currentTime < todayHours.close;

  if (isOpen) {
    return {
      isOpen: true,
      statusText: 'Åpent nå',
      nextChange: `Stenger ${todayHours.close}`,
    };
  } else if (currentTime < todayHours.open) {
    return {
      isOpen: false,
      statusText: 'Stengt nå',
      nextChange: `Åpner ${todayHours.open}`,
    };
  } else {
    return { isOpen: false, statusText: 'Stengt' };
  }
}
