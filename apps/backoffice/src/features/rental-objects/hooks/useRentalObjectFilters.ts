/**
 * useRentalObjectFilters
 * Hook for managing rental object list filters with category, time mode, search, city, price range, and availability
 */

import { useState, useEffect, useCallback } from 'react';
import { useDebounce } from '../../../hooks/useDebounce';

export const STATUS_OPTIONS = [
  { value: 'all', label: 'Alle' },
  { value: 'published', label: 'Publisert' },
  { value: 'draft', label: 'Utkast' },
  { value: 'archived', label: 'Arkivert' },
];

export const CATEGORY_OPTIONS = [
  { value: 'all', label: 'Alle kategorier' },
  { value: 'LOKALER_OG_BANER', label: 'Lokaler og baner' },
  { value: 'UTSTYR_OG_INVENTAR', label: 'Utstyr og inventar' },
  { value: 'KJORETOY_OG_TRANSPORT', label: 'Kjøretøy og transport' },
  { value: 'OPPLEVELSER_OG_ARRANGEMENT', label: 'Opplevelser og arrangement' },
];

export const TIME_MODE_OPTIONS = [
  { value: 'all', label: 'Alle bookingtyper' },
  { value: 'PERIOD', label: 'Tidsperiode' },
  { value: 'SLOT', label: 'Tidsluke' },
  { value: 'ALL_DAY', label: 'Heldags' },
];

export const SORT_OPTIONS = [
  { value: 'name_asc', label: 'Navn (A-Å)' },
  { value: 'name_desc', label: 'Navn (Å-A)' },
  { value: 'created_desc', label: 'Nyeste først' },
  { value: 'created_asc', label: 'Eldste først' },
  { value: 'price_asc', label: 'Pris (lav-høy)' },
  { value: 'price_desc', label: 'Pris (høy-lav)' },
];

export interface RentalObjectFilters {
  searchTerm: string;
  statusFilter: string;
  categoryFilter: string;
  timeModeFilter: string;
  cityFilter: string;
  priceMin: number | null;
  priceMax: number | null;
  availabilityFilter: 'all' | 'available_now' | 'custom_date';
  customDateFrom: string | null;
  customDateTo: string | null;
  sortBy: string;
}

export function useRentalObjectFilters() {
  // Basic filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [timeModeFilter, setTimeModeFilter] = useState('all');
  const [cityFilter, setCityFilter] = useState('all');
  const [sortBy, setSortBy] = useState('name_asc');

  // Price range filters
  const [priceMin, setPriceMin] = useState<number | null>(null);
  const [priceMax, setPriceMax] = useState<number | null>(null);

  // Availability filters
  const [availabilityFilter, setAvailabilityFilter] = useState<'all' | 'available_now' | 'custom_date'>('all');
  const [customDateFrom, setCustomDateFrom] = useState<string | null>(null);
  const [customDateTo, setCustomDateTo] = useState<string | null>(null);

  // Debounced search term (300ms delay)
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  // City options (will be populated from API)
  const [cityOptions, setCityOptions] = useState<Array<{ value: string; label: string }>>([
    { value: 'all', label: 'Alle byer' },
  ]);

  const resetFilters = useCallback(() => {
    setSearchTerm('');
    setStatusFilter('all');
    setCategoryFilter('all');
    setTimeModeFilter('all');
    setCityFilter('all');
    setSortBy('name_asc');
    setPriceMin(null);
    setPriceMax(null);
    setAvailabilityFilter('all');
    setCustomDateFrom(null);
    setCustomDateTo(null);
  }, []);

  const activeFilterCount =
    (searchTerm ? 1 : 0) +
    (statusFilter !== 'all' ? 1 : 0) +
    (categoryFilter !== 'all' ? 1 : 0) +
    (timeModeFilter !== 'all' ? 1 : 0) +
    (cityFilter !== 'all' ? 1 : 0) +
    (priceMin !== null || priceMax !== null ? 1 : 0) +
    (availabilityFilter !== 'all' ? 1 : 0);

  // Build query params for API
  const getFilterParams = useCallback(() => {
    const params: Record<string, string | number> = {};

    if (debouncedSearchTerm) {
      params.search = debouncedSearchTerm;
    }
    if (statusFilter !== 'all') {
      params.status = statusFilter;
    }
    if (categoryFilter !== 'all') {
      params.category = categoryFilter;
    }
    if (timeModeFilter !== 'all') {
      params.timeMode = timeModeFilter;
    }
    if (cityFilter !== 'all') {
      params.city = cityFilter;
    }
    if (priceMin !== null) {
      params.priceMin = priceMin;
    }
    if (priceMax !== null) {
      params.priceMax = priceMax;
    }
    if (availabilityFilter === 'available_now') {
      params.availableNow = 'true';
    } else if (availabilityFilter === 'custom_date' && customDateFrom && customDateTo) {
      params.availableFrom = customDateFrom;
      params.availableTo = customDateTo;
    }

    // Handle sorting
    if (sortBy) {
      const [field, direction] = sortBy.split('_');
      params.sortBy = field;
      params.sortOrder = direction;
    }

    return params;
  }, [
    debouncedSearchTerm,
    statusFilter,
    categoryFilter,
    timeModeFilter,
    cityFilter,
    priceMin,
    priceMax,
    availabilityFilter,
    customDateFrom,
    customDateTo,
    sortBy,
  ]);

  return {
    // Search
    searchTerm,
    setSearchTerm,
    debouncedSearchTerm,

    // Status
    statusFilter,
    setStatusFilter,

    // Category
    categoryFilter,
    setCategoryFilter,

    // Time Mode
    timeModeFilter,
    setTimeModeFilter,

    // City
    cityFilter,
    setCityFilter,
    cityOptions,
    setCityOptions,

    // Price
    priceMin,
    setPriceMin,
    priceMax,
    setPriceMax,

    // Availability
    availabilityFilter,
    setAvailabilityFilter,
    customDateFrom,
    setCustomDateFrom,
    customDateTo,
    setCustomDateTo,

    // Sort
    sortBy,
    setSortBy,

    // Utilities
    resetFilters,
    activeFilterCount,
    getFilterParams,
  };
}
