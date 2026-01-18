/**
 * useRentalObjectFilters
 * Hook for managing rental object list filters with category, time mode, search, city, price range, and availability
 */

import { useState, useCallback, useMemo } from 'react';
import type { RentalObjectStatus } from '@digilist/client-sdk';
import { useT } from '@xala/i18n';

export const STATUS_OPTIONS = [
  { id: 'all', label: 'Alle', value: 'all' },
  { id: 'published', label: 'Publisert', value: 'published' },
  { id: 'draft', label: 'Utkast', value: 'draft' },
  { id: 'archived', label: 'Arkivert', value: 'archived' },
];

// Category options factory - call this inside component with t()
export const getCategoryOptions = (t: ReturnType<typeof useT>) => [
  { id: 'all', label: t('common.alle_kategorier'), value: 'all' },
  { id: 'LOKALER_OG_BANER', label: t('common.lokaler_og_baner'), value: 'LOKALER_OG_BANER' },
  { id: 'UTSTYR_OG_INVENTAR', label: t('common.utstyr_og_inventar'), value: 'UTSTYR_OG_INVENTAR' },
  { id: 'KJORETOY_OG_TRANSPORT', label: t('common.kjoretoy_og_transport'), value: 'KJORETOY_OG_TRANSPORT' },
  { id: 'OPPLEVELSER_OG_ARRANGEMENT', label: t('common.opplevelser_og_arrangement'), value: 'OPPLEVELSER_OG_ARRANGEMENT' },
];

// Time mode options factory
export const getTimeModeOptions = (t: ReturnType<typeof useT>) => [
  { id: 'all', label: t('common.alle_bookingtyper'), value: 'all' },
  { id: 'PERIOD', label: 'Tidsperiode', value: 'PERIOD' },
  { id: 'SLOT', label: 'Tidsluke', value: 'SLOT' },
  { id: 'ALL_DAY', label: 'Heldags', value: 'ALL_DAY' },
];

// Sort options factory
export const getSortOptions = (t: ReturnType<typeof useT>) => [
  { id: 'updated-desc', label: t('common.sist.oppdatert'), value: 'updated-desc', field: 'updatedAt', order: 'desc' },
  { id: 'updated-asc', label: t('common.eldste.oppdatering'), value: 'updated-asc', field: 'updatedAt', order: 'asc' },
  { id: 'name-asc', label: t('common.navn.aaa'), value: 'name-asc', field: 'name', order: 'asc' },
  { id: 'name-desc', label: t('common.navn.aaa'), value: 'name-desc', field: 'name', order: 'desc' },
  { id: 'created-desc', label: t('common.nyeste.forst'), value: 'created-desc', field: 'createdAt', order: 'desc' },
  { id: 'created-asc', label: t('common.eldste.forst'), value: 'created-asc', field: 'createdAt', order: 'asc' },
];

export interface RentalObjectFiltersState {
  search?: string;
  status?: RentalObjectStatus;
  category?: string;
  timeMode?: string;
  city?: string;
  minCapacity?: number;
  maxCapacity?: number;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export type ViewMode = 'grid' | 'table';

export function useRentalObjectFilters() {
  // Filter state object with default limit of 100
  const [filters, setFilters] = useState<RentalObjectFiltersState>({
    limit: 100, // Default to fetching 100 items instead of API default (20)
  });
  
  // View mode state
  const [viewMode, setViewMode] = useState<ViewMode>('grid');

  // Generic setFilter function to update any filter
  const setFilter = useCallback(<K extends keyof RentalObjectFiltersState>(
    key: K,
    value: RentalObjectFiltersState[K]
  ) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
    }));
  }, []);

  // Reset all filters
  const resetFilters = useCallback(() => {
    setFilters({
      limit: 100, // Preserve default limit when resetting
    });
  }, []);

  // Count active filters (excluding page and limit)
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.search) count++;
    if (filters.status) count++;
    if (filters.category) count++;
    if (filters.timeMode) count++;
    if (filters.city) count++;
    if (filters.minCapacity || filters.maxCapacity) count++;
    return count;
  }, [filters]);

  return {
    filters,
    setFilters,
    setFilter,
    viewMode,
    setViewMode,
    resetFilters,
    activeFilterCount,
  };
}
