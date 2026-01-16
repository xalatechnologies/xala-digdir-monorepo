/**
 * Metadata Service
 *
 * Provides dynamic metadata for categories, time modes, pricing units, and statuses.
 * Currently returns hardcoded metadata, but can be extended to support:
 * - Database-driven metadata
 * - Tenant-specific customization
 * - Multi-language support
 *
 * @see /reports/DECOUPLED_ARCHITECTURE_PLAN.md
 */

import type {
  CategoryMetadata,
  TimeModeMetadata,
  PricingUnitMetadata,
  StatusMetadata,
  MetadataResponse,
  MetadataFilter,
} from './metadata.types';

export class MetadataService {
  private readonly METADATA_VERSION = '1.0.0';

  /**
   * Get all rental object categories
   */
  async getCategories(filter?: MetadataFilter): Promise<MetadataResponse<CategoryMetadata>> {
    let items: CategoryMetadata[] = [
      {
        key: 'LOKALER_OG_BANER',
        label: 'metadata.category.LOKALER_OG_BANER',
        description: 'Sports facilities, gyms, and courts',
        sortOrder: 1,
        enabled: true,
        icon: 'sports',
        color: 'blue',
      },
      {
        key: 'KULTURHUS_OG_SCENE',
        label: 'metadata.category.KULTURHUS_OG_SCENE',
        description: 'Cultural centers and stages',
        sortOrder: 2,
        enabled: true,
        icon: 'theater',
        color: 'purple',
      },
      {
        key: 'MØTEROM_OG_KONFERANSE',
        label: 'metadata.category.MØTEROM_OG_KONFERANSE',
        description: 'Meeting rooms and conference facilities',
        sortOrder: 3,
        enabled: true,
        icon: 'meeting',
        color: 'green',
      },
      {
        key: 'UTSTYR',
        label: 'metadata.category.UTSTYR',
        description: 'Equipment and tools',
        sortOrder: 4,
        enabled: true,
        icon: 'equipment',
        color: 'orange',
      },
      {
        key: 'TRANSPORT',
        label: 'metadata.category.TRANSPORT',
        description: 'Vehicles and transportation',
        sortOrder: 5,
        enabled: true,
        icon: 'car',
        color: 'red',
      },
      {
        key: 'UTENDØRS',
        label: 'metadata.category.UTENDØRS',
        description: 'Outdoor spaces and areas',
        sortOrder: 6,
        enabled: true,
        icon: 'park',
        color: 'teal',
      },
      {
        key: 'ANNET',
        label: 'metadata.category.ANNET',
        description: 'Other resources',
        sortOrder: 99,
        enabled: true,
        icon: 'more',
        color: 'gray',
      },
    ];

    // Apply filters
    if (filter?.enabled !== undefined) {
      items = items.filter((item) => item.enabled === filter.enabled);
    }

    if (filter?.parentKey) {
      items = items.filter((item) => item.parentKey === filter.parentKey);
    }

    return {
      items,
      totalCount: items.length,
      lastUpdated: new Date().toISOString(),
      version: this.METADATA_VERSION,
    };
  }

  /**
   * Get all time modes
   */
  async getTimeModes(filter?: MetadataFilter): Promise<MetadataResponse<TimeModeMetadata>> {
    let items: TimeModeMetadata[] = [
      {
        key: 'PERIOD',
        label: 'metadata.timeMode.PERIOD',
        description: 'Flexible time periods (hourly, daily, weekly)',
        sortOrder: 1,
        enabled: true,
        defaultDuration: 60,
        allowCustomDuration: true,
        minimumDuration: 30,
        maximumDuration: 10080, // 1 week
      },
      {
        key: 'SLOT',
        label: 'metadata.timeMode.SLOT',
        description: 'Fixed time slots',
        sortOrder: 2,
        enabled: true,
        defaultDuration: 60,
        allowCustomDuration: false,
        minimumDuration: 30,
        maximumDuration: 240,
      },
      {
        key: 'ALL_DAY',
        label: 'metadata.timeMode.ALL_DAY',
        description: 'Full day bookings',
        sortOrder: 3,
        enabled: true,
        defaultDuration: 1440, // 24 hours
        allowCustomDuration: false,
        minimumDuration: 1440,
        maximumDuration: 1440,
      },
    ];

    if (filter?.enabled !== undefined) {
      items = items.filter((item) => item.enabled === filter.enabled);
    }

    return {
      items,
      totalCount: items.length,
      lastUpdated: new Date().toISOString(),
      version: this.METADATA_VERSION,
    };
  }

  /**
   * Get all pricing units
   */
  async getPricingUnits(filter?: MetadataFilter): Promise<MetadataResponse<PricingUnitMetadata>> {
    let items: PricingUnitMetadata[] = [
      {
        key: 'HOUR',
        label: 'metadata.pricingUnit.HOUR',
        description: 'Per hour',
        sortOrder: 1,
        enabled: true,
        duration: 60,
        abbreviation: 'hr',
      },
      {
        key: 'DAY',
        label: 'metadata.pricingUnit.DAY',
        description: 'Per day',
        sortOrder: 2,
        enabled: true,
        duration: 1440,
        abbreviation: 'day',
      },
      {
        key: 'WEEK',
        label: 'metadata.pricingUnit.WEEK',
        description: 'Per week',
        sortOrder: 3,
        enabled: true,
        duration: 10080,
        abbreviation: 'wk',
      },
      {
        key: 'MONTH',
        label: 'metadata.pricingUnit.MONTH',
        description: 'Per month',
        sortOrder: 4,
        enabled: true,
        abbreviation: 'mo',
      },
      {
        key: 'FIXED',
        label: 'metadata.pricingUnit.FIXED',
        description: 'Fixed price',
        sortOrder: 5,
        enabled: true,
        abbreviation: 'fixed',
      },
    ];

    if (filter?.enabled !== undefined) {
      items = items.filter((item) => item.enabled === filter.enabled);
    }

    return {
      items,
      totalCount: items.length,
      lastUpdated: new Date().toISOString(),
      version: this.METADATA_VERSION,
    };
  }

  /**
   * Get all statuses
   */
  async getStatuses(filter?: MetadataFilter): Promise<MetadataResponse<StatusMetadata>> {
    let items: StatusMetadata[] = [
      // Rental object statuses
      {
        key: 'DRAFT',
        label: 'metadata.status.rentalObject.DRAFT',
        description: 'Rental object is in draft state',
        sortOrder: 1,
        enabled: true,
        statusType: 'rental-object',
        color: 'info',
        transitions: ['PUBLISHED'],
      },
      {
        key: 'PUBLISHED',
        label: 'metadata.status.rentalObject.PUBLISHED',
        description: 'Rental object is published and bookable',
        sortOrder: 2,
        enabled: true,
        statusType: 'rental-object',
        color: 'success',
        transitions: ['ARCHIVED', 'DRAFT'],
      },
      {
        key: 'ARCHIVED',
        label: 'metadata.status.rentalObject.ARCHIVED',
        description: 'Rental object is archived',
        sortOrder: 3,
        enabled: true,
        statusType: 'rental-object',
        color: 'warning',
        transitions: ['PUBLISHED'],
      },

      // Booking statuses
      {
        key: 'PENDING',
        label: 'metadata.status.booking.PENDING',
        description: 'Booking awaiting approval',
        sortOrder: 10,
        enabled: true,
        statusType: 'booking',
        color: 'warning',
        transitions: ['CONFIRMED', 'REJECTED', 'CANCELLED'],
      },
      {
        key: 'CONFIRMED',
        label: 'metadata.status.booking.CONFIRMED',
        description: 'Booking is confirmed',
        sortOrder: 11,
        enabled: true,
        statusType: 'booking',
        color: 'success',
        transitions: ['CANCELLED', 'COMPLETED'],
      },
      {
        key: 'CANCELLED',
        label: 'metadata.status.booking.CANCELLED',
        description: 'Booking was cancelled',
        sortOrder: 12,
        enabled: true,
        statusType: 'booking',
        color: 'error',
        transitions: [],
      },
      {
        key: 'REJECTED',
        label: 'metadata.status.booking.REJECTED',
        description: 'Booking was rejected',
        sortOrder: 13,
        enabled: true,
        statusType: 'booking',
        color: 'error',
        transitions: [],
      },
      {
        key: 'COMPLETED',
        label: 'metadata.status.booking.COMPLETED',
        description: 'Booking was completed',
        sortOrder: 14,
        enabled: true,
        statusType: 'booking',
        color: 'info',
        transitions: [],
      },
    ];

    if (filter?.enabled !== undefined) {
      items = items.filter((item) => item.enabled === filter.enabled);
    }

    if (filter?.statusType) {
      items = items.filter((item) => item.statusType === filter.statusType);
    }

    return {
      items,
      totalCount: items.length,
      lastUpdated: new Date().toISOString(),
      version: this.METADATA_VERSION,
    };
  }

  /**
   * Get single category by key
   */
  async getCategoryByKey(key: string): Promise<CategoryMetadata | null> {
    const response = await this.getCategories();
    return response.items.find((item) => item.key === key) || null;
  }

  /**
   * Get single time mode by key
   */
  async getTimeModeByKey(key: string): Promise<TimeModeMetadata | null> {
    const response = await this.getTimeModes();
    return response.items.find((item) => item.key === key) || null;
  }

  /**
   * Get single pricing unit by key
   */
  async getPricingUnitByKey(key: string): Promise<PricingUnitMetadata | null> {
    const response = await this.getPricingUnits();
    return response.items.find((item) => item.key === key) || null;
  }

  /**
   * Get single status by key and type
   */
  async getStatusByKey(key: string, statusType: string): Promise<StatusMetadata | null> {
    const response = await this.getStatuses({ statusType });
    return response.items.find((item) => item.key === key) || null;
  }
}
