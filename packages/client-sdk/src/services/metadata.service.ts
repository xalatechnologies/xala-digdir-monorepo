/**
 * Metadata Service
 *
 * Provides dynamic metadata for categories, time modes, pricing units, and statuses.
 * Replaces hardcoded enums with server-driven metadata.
 *
 * Usage:
 * ```typescript
 * import { metadataService } from '@digilist/client-sdk';
 *
 * // Get all categories
 * const categories = await metadataService.getCategories();
 *
 * // Get filtered categories
 * const enabledCategories = await metadataService.getCategories({ enabled: true });
 * ```
 *
 * @see /reports/DECOUPLED_ARCHITECTURE_PLAN.md
 */

import { BaseService } from './base.service';

/**
 * Base metadata item
 */
export interface MetadataItem {
  key: string;
  label: string; // i18n key
  description?: string;
  sortOrder: number;
  enabled: boolean;
  metadata?: Record<string, unknown>;
}

/**
 * Category metadata
 */
export interface CategoryMetadata extends MetadataItem {
  icon?: string;
  color?: string;
  parentKey?: string;
}

/**
 * Time mode metadata
 */
export interface TimeModeMetadata extends MetadataItem {
  defaultDuration?: number;
  allowCustomDuration: boolean;
  minimumDuration?: number;
  maximumDuration?: number;
}

/**
 * Pricing unit metadata
 */
export interface PricingUnitMetadata extends MetadataItem {
  duration?: number;
  abbreviation: string;
}

/**
 * Status metadata
 */
export interface StatusMetadata extends MetadataItem {
  statusType: 'rental-object' | 'booking' | 'user' | 'organization';
  color: string;
  transitions: string[];
}

/**
 * Metadata response envelope
 */
export interface MetadataResponse<T extends MetadataItem = MetadataItem> {
  items: T[];
  totalCount: number;
  lastUpdated: string;
  version: string;
}

/**
 * Metadata filter options
 */
export interface MetadataFilter {
  enabled?: boolean;
  parentKey?: string;
  statusType?: string;
}

/**
 * Metadata service class
 */
export class MetadataService extends BaseService {
  /**
   * Get all rental object categories
   */
  async getCategories(filter?: MetadataFilter): Promise<MetadataResponse<CategoryMetadata>> {
    const params = new URLSearchParams();

    if (filter?.enabled !== undefined) {
      params.append('enabled', String(filter.enabled));
    }

    if (filter?.parentKey) {
      params.append('parentKey', filter.parentKey);
    }

    const query = params.toString();
    const url = query ? `/api/metadata/categories?${query}` : '/api/metadata/categories';

    return this.get<MetadataResponse<CategoryMetadata>>(url);
  }

  /**
   * Get single category by key
   */
  async getCategoryByKey(key: string): Promise<CategoryMetadata> {
    return this.get<CategoryMetadata>(`/api/metadata/categories/${key}`);
  }

  /**
   * Get all time modes
   */
  async getTimeModes(filter?: MetadataFilter): Promise<MetadataResponse<TimeModeMetadata>> {
    const params = new URLSearchParams();

    if (filter?.enabled !== undefined) {
      params.append('enabled', String(filter.enabled));
    }

    const query = params.toString();
    const url = query ? `/api/metadata/time-modes?${query}` : '/api/metadata/time-modes';

    return this.get<MetadataResponse<TimeModeMetadata>>(url);
  }

  /**
   * Get single time mode by key
   */
  async getTimeModeByKey(key: string): Promise<TimeModeMetadata> {
    return this.get<TimeModeMetadata>(`/api/metadata/time-modes/${key}`);
  }

  /**
   * Get all pricing units
   */
  async getPricingUnits(filter?: MetadataFilter): Promise<MetadataResponse<PricingUnitMetadata>> {
    const params = new URLSearchParams();

    if (filter?.enabled !== undefined) {
      params.append('enabled', String(filter.enabled));
    }

    const query = params.toString();
    const url = query ? `/api/metadata/pricing-units?${query}` : '/api/metadata/pricing-units';

    return this.get<MetadataResponse<PricingUnitMetadata>>(url);
  }

  /**
   * Get single pricing unit by key
   */
  async getPricingUnitByKey(key: string): Promise<PricingUnitMetadata> {
    return this.get<PricingUnitMetadata>(`/api/metadata/pricing-units/${key}`);
  }

  /**
   * Get all statuses (filtered by statusType if provided)
   */
  async getStatuses(filter?: MetadataFilter): Promise<MetadataResponse<StatusMetadata>> {
    const params = new URLSearchParams();

    if (filter?.enabled !== undefined) {
      params.append('enabled', String(filter.enabled));
    }

    if (filter?.statusType) {
      params.append('statusType', filter.statusType);
    }

    const query = params.toString();
    const url = query ? `/api/metadata/statuses?${query}` : '/api/metadata/statuses';

    return this.get<MetadataResponse<StatusMetadata>>(url);
  }

  /**
   * Get single status by key and type
   */
  async getStatusByKey(key: string, statusType: string): Promise<StatusMetadata> {
    return this.get<StatusMetadata>(`/api/metadata/statuses/${key}?statusType=${statusType}`);
  }

  /**
   * Get rental object statuses only
   */
  async getRentalObjectStatuses(): Promise<MetadataResponse<StatusMetadata>> {
    return this.getStatuses({ statusType: 'rental-object', enabled: true });
  }

  /**
   * Get booking statuses only
   */
  async getBookingStatuses(): Promise<MetadataResponse<StatusMetadata>> {
    return this.getStatuses({ statusType: 'booking', enabled: true });
  }

  /**
   * Get enabled categories only (convenience method)
   */
  async getEnabledCategories(): Promise<MetadataResponse<CategoryMetadata>> {
    return this.getCategories({ enabled: true });
  }

  /**
   * Get enabled time modes only (convenience method)
   */
  async getEnabledTimeModes(): Promise<MetadataResponse<TimeModeMetadata>> {
    return this.getTimeModes({ enabled: true });
  }

  /**
   * Get enabled pricing units only (convenience method)
   */
  async getEnabledPricingUnits(): Promise<MetadataResponse<PricingUnitMetadata>> {
    return this.getPricingUnits({ enabled: true });
  }
}

// Export singleton instance
export const metadataService = new MetadataService();
