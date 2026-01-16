/**
 * Metadata Hooks
 *
 * React Query hooks for fetching dynamic metadata (categories, time modes, pricing units, statuses).
 * Provides caching, automatic refetching, and optimistic updates.
 *
 * Usage:
 * ```typescript
 * import { useCategoriesMetadata, useTimeModes } from '@digilist/client-sdk/hooks';
 *
 * function MyComponent() {
 *   const { data: categories, isLoading } = useCategoriesMetadata();
 *   const { data: timeModes } = useTimeModes({ enabled: true });
 *
 *   return <div>{categories?.items.map(cat => cat.label)}</div>;
 * }
 * ```
 */

import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { metadataService } from '../services/metadata.service';
import type {
  CategoryMetadata,
  TimeModeMetadata,
  PricingUnitMetadata,
  StatusMetadata,
  MetadataResponse,
  MetadataFilter,
} from '../services/metadata.service';

/**
 * Query keys for metadata
 */
export const metadataKeys = {
  all: ['metadata'] as const,
  categories: () => [...metadataKeys.all, 'categories'] as const,
  categoriesFiltered: (filter?: MetadataFilter) =>
    [...metadataKeys.categories(), filter] as const,
  category: (key: string) => [...metadataKeys.categories(), key] as const,
  timeModes: () => [...metadataKeys.all, 'time-modes'] as const,
  timeModesFiltered: (filter?: MetadataFilter) =>
    [...metadataKeys.timeModes(), filter] as const,
  timeMode: (key: string) => [...metadataKeys.timeModes(), key] as const,
  pricingUnits: () => [...metadataKeys.all, 'pricing-units'] as const,
  pricingUnitsFiltered: (filter?: MetadataFilter) =>
    [...metadataKeys.pricingUnits(), filter] as const,
  pricingUnit: (key: string) => [...metadataKeys.pricingUnits(), key] as const,
  statuses: () => [...metadataKeys.all, 'statuses'] as const,
  statusesFiltered: (filter?: MetadataFilter) =>
    [...metadataKeys.statuses(), filter] as const,
  status: (key: string, statusType: string) =>
    [...metadataKeys.statuses(), key, statusType] as const,
} as const;

/**
 * Hook: Get all categories
 *
 * @param filter - Optional filter (enabled, parentKey)
 * @returns React Query result with categories
 *
 * @example
 * ```typescript
 * const { data, isLoading } = useCategoriesMetadata();
 * const enabledOnly = useCategoriesMetadata({ enabled: true });
 * ```
 */
export function useCategoriesMetadata(
  filter?: MetadataFilter
): UseQueryResult<MetadataResponse<CategoryMetadata>> {
  return useQuery({
    queryKey: metadataKeys.categoriesFiltered(filter),
    queryFn: () => metadataService.getCategories(filter),
    staleTime: 1000 * 60 * 60, // 1 hour (metadata changes infrequently)
    gcTime: 1000 * 60 * 60 * 24, // 24 hours
  });
}

/**
 * Hook: Get single category by key
 *
 * @param key - Category key
 * @returns React Query result with category
 *
 * @example
 * ```typescript
 * const { data: category } = useCategoryMetadata('LOKALER_OG_BANER');
 * ```
 */
export function useCategoryMetadata(key: string): UseQueryResult<CategoryMetadata> {
  return useQuery({
    queryKey: metadataKeys.category(key),
    queryFn: () => metadataService.getCategoryByKey(key),
    staleTime: 1000 * 60 * 60, // 1 hour
    gcTime: 1000 * 60 * 60 * 24, // 24 hours
    enabled: !!key,
  });
}

/**
 * Hook: Get all time modes
 *
 * @param filter - Optional filter (enabled)
 * @returns React Query result with time modes
 *
 * @example
 * ```typescript
 * const { data: timeModes } = useTimeModesMetadata();
 * const enabledModes = useTimeModesMetadata({ enabled: true });
 * ```
 */
export function useTimeModesMetadata(
  filter?: MetadataFilter
): UseQueryResult<MetadataResponse<TimeModeMetadata>> {
  return useQuery({
    queryKey: metadataKeys.timeModesFiltered(filter),
    queryFn: () => metadataService.getTimeModes(filter),
    staleTime: 1000 * 60 * 60, // 1 hour
    gcTime: 1000 * 60 * 60 * 24, // 24 hours
  });
}

/**
 * Hook: Get single time mode by key
 *
 * @param key - Time mode key
 * @returns React Query result with time mode
 *
 * @example
 * ```typescript
 * const { data: timeMode } = useTimeModeMetadata('PERIOD');
 * ```
 */
export function useTimeModeMetadata(key: string): UseQueryResult<TimeModeMetadata> {
  return useQuery({
    queryKey: metadataKeys.timeMode(key),
    queryFn: () => metadataService.getTimeModeByKey(key),
    staleTime: 1000 * 60 * 60, // 1 hour
    gcTime: 1000 * 60 * 60 * 24, // 24 hours
    enabled: !!key,
  });
}

/**
 * Hook: Get all pricing units
 *
 * @param filter - Optional filter (enabled)
 * @returns React Query result with pricing units
 *
 * @example
 * ```typescript
 * const { data: pricingUnits } = usePricingUnitsMetadata();
 * ```
 */
export function usePricingUnitsMetadata(
  filter?: MetadataFilter
): UseQueryResult<MetadataResponse<PricingUnitMetadata>> {
  return useQuery({
    queryKey: metadataKeys.pricingUnitsFiltered(filter),
    queryFn: () => metadataService.getPricingUnits(filter),
    staleTime: 1000 * 60 * 60, // 1 hour
    gcTime: 1000 * 60 * 60 * 24, // 24 hours
  });
}

/**
 * Hook: Get single pricing unit by key
 *
 * @param key - Pricing unit key
 * @returns React Query result with pricing unit
 *
 * @example
 * ```typescript
 * const { data: pricingUnit } = usePricingUnitMetadata('HOUR');
 * ```
 */
export function usePricingUnitMetadata(key: string): UseQueryResult<PricingUnitMetadata> {
  return useQuery({
    queryKey: metadataKeys.pricingUnit(key),
    queryFn: () => metadataService.getPricingUnitByKey(key),
    staleTime: 1000 * 60 * 60, // 1 hour
    gcTime: 1000 * 60 * 60 * 24, // 24 hours
    enabled: !!key,
  });
}

/**
 * Hook: Get all statuses
 *
 * @param filter - Optional filter (enabled, statusType)
 * @returns React Query result with statuses
 *
 * @example
 * ```typescript
 * const { data: allStatuses } = useStatusesMetadata();
 * const rentalObjectStatuses = useStatusesMetadata({ statusType: 'rental-object' });
 * const bookingStatuses = useStatusesMetadata({ statusType: 'booking' });
 * ```
 */
export function useStatusesMetadata(
  filter?: MetadataFilter
): UseQueryResult<MetadataResponse<StatusMetadata>> {
  return useQuery({
    queryKey: metadataKeys.statusesFiltered(filter),
    queryFn: () => metadataService.getStatuses(filter),
    staleTime: 1000 * 60 * 60, // 1 hour
    gcTime: 1000 * 60 * 60 * 24, // 24 hours
  });
}

/**
 * Hook: Get single status by key and type
 *
 * @param key - Status key
 * @param statusType - Status type (rental-object, booking, user, organization)
 * @returns React Query result with status
 *
 * @example
 * ```typescript
 * const { data: status } = useStatusMetadata('PUBLISHED', 'rental-object');
 * ```
 */
export function useStatusMetadata(
  key: string,
  statusType: string
): UseQueryResult<StatusMetadata> {
  return useQuery({
    queryKey: metadataKeys.status(key, statusType),
    queryFn: () => metadataService.getStatusByKey(key, statusType),
    staleTime: 1000 * 60 * 60, // 1 hour
    gcTime: 1000 * 60 * 60 * 24, // 24 hours
    enabled: !!key && !!statusType,
  });
}

/**
 * Hook: Get rental object statuses only (convenience)
 *
 * @returns React Query result with rental object statuses
 *
 * @example
 * ```typescript
 * const { data: rentalObjectStatuses } = useRentalObjectStatuses();
 * // Returns: DRAFT, PUBLISHED, ARCHIVED
 * ```
 */
export function useRentalObjectStatuses(): UseQueryResult<MetadataResponse<StatusMetadata>> {
  return useQuery({
    queryKey: metadataKeys.statusesFiltered({ statusType: 'rental-object', enabled: true }),
    queryFn: () => metadataService.getRentalObjectStatuses(),
    staleTime: 1000 * 60 * 60, // 1 hour
    gcTime: 1000 * 60 * 60 * 24, // 24 hours
  });
}

/**
 * Hook: Get booking statuses only (convenience)
 *
 * @returns React Query result with booking statuses
 *
 * @example
 * ```typescript
 * const { data: bookingStatuses } = useBookingStatuses();
 * // Returns: PENDING, CONFIRMED, CANCELLED, REJECTED, COMPLETED
 * ```
 */
export function useBookingStatuses(): UseQueryResult<MetadataResponse<StatusMetadata>> {
  return useQuery({
    queryKey: metadataKeys.statusesFiltered({ statusType: 'booking', enabled: true }),
    queryFn: () => metadataService.getBookingStatuses(),
    staleTime: 1000 * 60 * 60, // 1 hour
    gcTime: 1000 * 60 * 60 * 24, // 24 hours
  });
}
