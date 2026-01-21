import React, { createContext, useContext, useState, useMemo, useCallback, useEffect } from 'react';
import type {
  RentalObject,
  RentalObjectCategory,
  BookingTimeMode,
  RentalObjectStatus,
  RentalObjectQueryParams,
  RentalObjectAvailability,
  RentalObjectCalendarConfig,
  UiRentalObject,
  AvailabilityQueryParams,
} from '@digilist/client-sdk/types';
import { toUiRentalObject } from '@digilist/client-sdk/types';
import {
  useRentalObjects,
  useRentalObject,
  useRentalObjectAvailability,
  useRentalObjectCalendarConfig,
  useFeaturedRentalObjects,
  useRentalObjectCategories,
} from '@digilist/client-sdk/hooks';

/**
 * Filter state for rental object discovery
 */
export interface RentalObjectFilters {
  /** Search query */
  search?: string;
  /** Category filter */
  category?: RentalObjectCategory;
  /** Subcategory filter */
  subcategory?: string;
  /** Time mode filter */
  timeMode?: BookingTimeMode;
  /** Status filter (for admin views) */
  status?: RentalObjectStatus;
  /** City filter */
  city?: string;
  /** Municipality filter */
  municipality?: string;
  /** Minimum capacity */
  minCapacity?: number;
  /** Maximum capacity */
  maxCapacity?: number;
  /** Minimum price */
  minPrice?: number;
  /** Maximum price */
  maxPrice?: number;
  /** Date filter for availability check */
  date?: string;
  /** Organization filter */
  organizationId?: string;
}

/**
 * Pagination state
 */
export interface PaginationState {
  page: number;
  limit: number;
  totalPages: number;
  totalItems: number;
}

/**
 * Sort configuration
 */
export interface SortConfig {
  sortBy: 'name' | 'createdAt' | 'updatedAt' | 'capacity';
  sortOrder: 'asc' | 'desc';
}

/**
 * Rental object context state
 */
export interface RentalObjectContextState {
  /** Current filters */
  filters: RentalObjectFilters;
  /** Current sort configuration */
  sort: SortConfig;
  /** Pagination state */
  pagination: PaginationState;
  /** List of rental objects matching current filters */
  rentalObjects: RentalObject[];
  /** UI-ready rental objects (transformed) */
  uiRentalObjects: UiRentalObject[];
  /** Featured rental objects */
  featuredRentalObjects: RentalObject[];
  /** Available categories */
  categories: Array<{ id: RentalObjectCategory; name: string; description?: string }>;
  /** Currently selected rental object for detail view */
  selectedRentalObject: RentalObject | null;
  /** Calendar configuration for selected rental object */
  calendarConfig: RentalObjectCalendarConfig | null;
  /** Availability data for selected rental object */
  availability: RentalObjectAvailability | null;
  /** Loading states */
  isLoading: boolean;
  isLoadingDetail: boolean;
  isLoadingAvailability: boolean;
  /** Error state */
  error: Error | null;
}

/**
 * Rental object context actions
 */
export interface RentalObjectContextActions {
  /** Update filters */
  setFilters: (filters: Partial<RentalObjectFilters>) => void;
  /** Reset filters to defaults */
  resetFilters: () => void;
  /** Update sort configuration */
  setSort: (sort: Partial<SortConfig>) => void;
  /** Go to specific page */
  goToPage: (page: number) => void;
  /** Set page size */
  setPageSize: (limit: number) => void;
  /** Select a rental object for detail view */
  selectRentalObject: (id: string | null) => void;
  /** Refresh data */
  refresh: () => void;
  /** Load availability for date range */
  loadAvailability: (startDate: string, endDate: string) => void;
}

/**
 * Combined rental object context value
 */
export interface RentalObjectContextValue extends RentalObjectContextState, RentalObjectContextActions {}

// Default values
const defaultFilters: RentalObjectFilters = {};

const defaultSort: SortConfig = {
  sortBy: 'name',
  sortOrder: 'asc',
};

const defaultPagination: PaginationState = {
  page: 1,
  limit: 12,
  totalPages: 0,
  totalItems: 0,
};

// Context
const RentalObjectContext = createContext<RentalObjectContextValue | undefined>(undefined);

/**
 * RentalObjectContextProvider Props
 */
export interface RentalObjectContextProviderProps {
  /** Children to render */
  children: React.ReactNode;
  /** Initial filters */
  initialFilters?: Partial<RentalObjectFilters>;
  /** Initial sort configuration */
  initialSort?: Partial<SortConfig>;
  /** Initial page size */
  initialPageSize?: number;
  /** Organization scope (for org-specific views) */
  organizationId?: string;
  /** Auto-load featured rental objects */
  loadFeatured?: boolean;
}

/**
 * RentalObjectContextProvider
 *
 * Domain-specific provider for managing rental object discovery and selection.
 * This provider handles:
 *
 * 1. **Filtering & Search** - Full-text search and category filters
 * 2. **Pagination** - Page navigation and size control
 * 3. **Sorting** - Multiple sort options
 * 4. **Detail View** - Selected rental object with calendar config
 * 5. **Availability** - Time-based availability checking
 *
 * @example Basic Usage
 * ```tsx
 * import { RentalObjectContextProvider, useRentalObjectContext } from '@digilist/runtime';
 *
 * function DiscoveryPage() {
 *   return (
 *     <RentalObjectContextProvider loadFeatured>
 *       <FilterBar />
 *       <RentalObjectGrid />
 *       <Pagination />
 *     </RentalObjectContextProvider>
 *   );
 * }
 *
 * function RentalObjectGrid() {
 *   const { uiRentalObjects, isLoading, selectRentalObject } = useRentalObjectContext();
 *
 *   if (isLoading) return <Spinner />;
 *
 *   return (
 *     <Grid>
 *       {uiRentalObjects.map((obj) => (
 *         <Card key={obj.id} onClick={() => selectRentalObject(obj.id)}>
 *           {obj.name}
 *         </Card>
 *       ))}
 *     </Grid>
 *   );
 * }
 * ```
 *
 * @example With Filters
 * ```tsx
 * function FilterBar() {
 *   const { filters, setFilters, categories } = useRentalObjectContext();
 *
 *   return (
 *     <div>
 *       <SearchInput
 *         value={filters.search ?? ''}
 *         onChange={(search) => setFilters({ search })}
 *       />
 *       <CategorySelect
 *         value={filters.category}
 *         options={categories}
 *         onChange={(category) => setFilters({ category })}
 *       />
 *     </div>
 *   );
 * }
 * ```
 */
export const RentalObjectContextProvider: React.FC<RentalObjectContextProviderProps> = ({
  children,
  initialFilters = {},
  initialSort = {},
  initialPageSize = 12,
  organizationId,
  loadFeatured = false,
}) => {
  // State
  const [filters, setFiltersState] = useState<RentalObjectFilters>({
    ...defaultFilters,
    ...initialFilters,
    organizationId,
  });
  const [sort, setSortState] = useState<SortConfig>({
    ...defaultSort,
    ...initialSort,
  });
  const [pagination, setPagination] = useState<PaginationState>({
    ...defaultPagination,
    limit: initialPageSize,
  });
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [availabilityRange, setAvailabilityRange] = useState<{
    startDate: string;
    endDate: string;
  } | null>(null);

  // Build query params from state
  const queryParams: RentalObjectQueryParams = useMemo(
    () => ({
      ...filters,
      sortBy: sort.sortBy,
      sortOrder: sort.sortOrder,
      page: pagination.page,
      limit: pagination.limit,
    }),
    [filters, sort, pagination.page, pagination.limit]
  );

  // Fetch rental objects
  const {
    data: rentalObjectsData,
    isLoading: isLoadingList,
    error: listError,
    refetch: refetchList,
  } = useRentalObjects(queryParams);

  // Fetch featured rental objects (optional)
  const {
    data: featuredData,
    isLoading: isLoadingFeatured,
  } = useFeaturedRentalObjects();

  // Fetch categories
  const { data: categoriesData } = useRentalObjectCategories();

  // Fetch selected rental object detail
  const {
    data: detailData,
    isLoading: isLoadingDetail,
    error: detailError,
  } = useRentalObject(selectedId ?? '');

  // Fetch calendar config for selected rental object
  const { data: calendarConfigData } = useRentalObjectCalendarConfig(selectedId ?? '');

  // Build availability params
  const availabilityParams: AvailabilityQueryParams | undefined = useMemo(() => {
    if (!availabilityRange) return undefined;
    return {
      startDate: availabilityRange.startDate,
      endDate: availabilityRange.endDate,
    };
  }, [availabilityRange]);

  // Fetch availability for selected rental object
  const { data: availabilityData, isLoading: isLoadingAvailability } = useRentalObjectAvailability(
    selectedId ?? '',
    availabilityParams ?? { startDate: '', endDate: '' }
  );

  // Update pagination when data changes
  useEffect(() => {
    if (rentalObjectsData?.meta) {
      setPagination((prev) => ({
        ...prev,
        totalPages: rentalObjectsData.meta.totalPages,
        totalItems: rentalObjectsData.meta.total,
      }));
    }
  }, [rentalObjectsData?.meta]);

  // Computed values
  const rentalObjects = rentalObjectsData?.data ?? [];
  const uiRentalObjects = useMemo(
    () => rentalObjects.map((obj) => toUiRentalObject(obj)),
    [rentalObjects]
  );
  const featuredRentalObjects = featuredData?.data ?? [];
  const categories = categoriesData?.data ?? [];
  const selectedRentalObject = detailData?.data ?? null;
  const calendarConfig = calendarConfigData?.data ?? null;
  const availability = availabilityData?.data ?? null;

  // Actions
  const setFilters = useCallback((newFilters: Partial<RentalObjectFilters>) => {
    setFiltersState((prev) => ({ ...prev, ...newFilters }));
    // Reset to page 1 when filters change
    setPagination((prev) => ({ ...prev, page: 1 }));
  }, []);

  const resetFilters = useCallback(() => {
    setFiltersState({ ...defaultFilters, organizationId });
    setPagination((prev) => ({ ...prev, page: 1 }));
  }, [organizationId]);

  const setSort = useCallback((newSort: Partial<SortConfig>) => {
    setSortState((prev) => ({ ...prev, ...newSort }));
  }, []);

  const goToPage = useCallback((page: number) => {
    setPagination((prev) => ({
      ...prev,
      page: Math.max(1, Math.min(page, prev.totalPages || 1)),
    }));
  }, []);

  const setPageSize = useCallback((limit: number) => {
    setPagination((prev) => ({
      ...prev,
      limit,
      page: 1, // Reset to first page when changing page size
    }));
  }, []);

  const selectRentalObject = useCallback((id: string | null) => {
    setSelectedId(id);
    setAvailabilityRange(null); // Reset availability when selection changes
  }, []);

  const refresh = useCallback(() => {
    refetchList();
  }, [refetchList]);

  const loadAvailability = useCallback((startDate: string, endDate: string) => {
    setAvailabilityRange({ startDate, endDate });
  }, []);

  // Combined loading and error states
  const isLoading = isLoadingList || isLoadingFeatured;
  const error = listError ?? detailError ?? null;

  // Memoized context value
  const value = useMemo<RentalObjectContextValue>(
    () => ({
      // State
      filters,
      sort,
      pagination,
      rentalObjects,
      uiRentalObjects,
      featuredRentalObjects,
      categories,
      selectedRentalObject,
      calendarConfig,
      availability,
      isLoading,
      isLoadingDetail,
      isLoadingAvailability,
      error: error instanceof Error ? error : error ? new Error(String(error)) : null,
      // Actions
      setFilters,
      resetFilters,
      setSort,
      goToPage,
      setPageSize,
      selectRentalObject,
      refresh,
      loadAvailability,
    }),
    [
      filters,
      sort,
      pagination,
      rentalObjects,
      uiRentalObjects,
      featuredRentalObjects,
      categories,
      selectedRentalObject,
      calendarConfig,
      availability,
      isLoading,
      isLoadingDetail,
      isLoadingAvailability,
      error,
      setFilters,
      resetFilters,
      setSort,
      goToPage,
      setPageSize,
      selectRentalObject,
      refresh,
      loadAvailability,
    ]
  );

  return <RentalObjectContext.Provider value={value}>{children}</RentalObjectContext.Provider>;
};

RentalObjectContextProvider.displayName = 'RentalObjectContextProvider';

/**
 * Hook to access rental object context
 *
 * @throws Error if used outside RentalObjectContextProvider
 */
export const useRentalObjectContext = (): RentalObjectContextValue => {
  const context = useContext(RentalObjectContext);

  if (!context) {
    throw new Error('useRentalObjectContext must be used within RentalObjectContextProvider');
  }

  return context;
};

/**
 * Hook to access rental object context (optional)
 * Returns undefined if not within provider
 */
export const useRentalObjectContextOptional = (): RentalObjectContextValue | undefined => {
  return useContext(RentalObjectContext);
};

export default RentalObjectContextProvider;
