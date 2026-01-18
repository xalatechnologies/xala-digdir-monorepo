/**
 * Rental Object Filters Hook
 * Manages filter state for the rental objects list view
 */

import { useState, useCallback, useMemo } from 'react';
import { LISTING_TYPE_OPTIONS, type ListingType } from '@digilist/client-sdk';
import type { RentalObjectQueryFilters, ViewMode } from '../types';

export interface UseRentalObjectFiltersReturn {
  filters: RentalObjectQueryFilters;
  viewMode: ViewMode;
  setFilter: <K extends keyof RentalObjectQueryFilters>(key: K, value: RentalObjectQueryFilters[K]) => void;
  setFilters: (filters: Partial<RentalObjectQueryFilters>) => void;
  setViewMode: (mode: ViewMode) => void;
  resetFilters: () => void;
  activeFilterCount: number;
}

const DEFAULT_FILTERS: RentalObjectQueryFilters = {
  page: 1,
  limit: 50,
  sortBy: 'updatedAt',
  sortOrder: 'desc',
};

export function useRentalObjectFilters(
  initialFilters?: Partial<RentalObjectQueryFilters>,
  initialViewMode: ViewMode = 'table'
): UseRentalObjectFiltersReturn {
  const [filters, setFiltersState] = useState<RentalObjectQueryFilters>({
    ...DEFAULT_FILTERS,
    ...initialFilters,
  });
  const [viewMode, setViewMode] = useState<ViewMode>(initialViewMode);

  const setFilter = useCallback(<K extends keyof RentalObjectQueryFilters>(
    key: K,
    value: RentalObjectQueryFilters[K]
  ) => {
    setFiltersState((prev) => ({
      ...prev,
      [key]: value,
      // Reset to page 1 when filters change (except pagination itself)
      ...(key !== 'page' && key !== 'limit' ? { page: 1 } : {}),
    }));
  }, []);

  const setFilters = useCallback((newFilters: Partial<RentalObjectQueryFilters>) => {
    setFiltersState((prev) => ({
      ...prev,
      ...newFilters,
      // Reset to page 1 when filters change
      page: newFilters.page ?? 1,
    }));
  }, []);

  const resetFilters = useCallback(() => {
    setFiltersState(DEFAULT_FILTERS);
  }, []);

  // Count active filters (excluding default values and pagination)
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.type) count++;
    if (filters.status) count++;
    if (filters.search) count++;
    if (filters.city) count++;
    if (filters.municipality) count++;
    if (filters.organizationId) count++;
    if (filters.minCapacity) count++;
    if (filters.maxCapacity) count++;
    if (filters.hasBookingConfig !== undefined) count++;
    return count;
  }, [filters]);

  return {
    filters,
    viewMode,
    setFilter,
    setFilters,
    setViewMode,
    resetFilters,
    activeFilterCount,
  };
}

/**
 * Type tabs configuration - use SDK's LISTING_TYPE_OPTIONS directly
 */
export const TYPE_TABS: Array<{ id: ListingType | 'ALL'; label: string }> = LISTING_TYPE_OPTIONS;

/**
 * Status filter options
 */
export const STATUS_OPTIONS: Array<{ id: string; label: string }> = [
  { id: 'all', label: 'Alle statuser' },
  { id: 'draft', label: 'Utkast' },
  { id: 'published', label: 'Publisert' },
  { id: 'archived', label: 'Arkivert' },
];

/**
 * Sort options for rental objects
 */
export const SORT_OPTIONS: Array<{ id: string; label: string; field: RentalObjectQueryFilters['sortBy']; order: RentalObjectQueryFilters['sortOrder'] }> = [
  { id: 'updated-desc', label: 'Sist oppdatert', field: 'updatedAt', order: 'desc' },
  { id: 'updated-asc', label: 'Eldst oppdatert', field: 'updatedAt', order: 'asc' },
  { id: 'created-desc', label: 'Nyeste først', field: 'createdAt', order: 'desc' },
  { id: 'created-asc', label: 'Eldste først', field: 'createdAt', order: 'asc' },
  { id: 'name-asc', label: 'Navn A-Å', field: 'name', order: 'asc' },
  { id: 'name-desc', label: 'Navn Å-A', field: 'name', order: 'desc' },
];
