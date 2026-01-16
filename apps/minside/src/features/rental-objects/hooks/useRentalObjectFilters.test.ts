import { renderHook, act } from '@testing-library/react';
import { useRentalObjectFilters } from './useRentalObjectFilters';
import type { RentalObjectQueryFilters, ViewMode } from '../types';

describe('useRentalObjectFilters', () => {
  it('should initialize with default filters', () => {
    const { result } = renderHook(() => useRentalObjectFilters());

    expect(result.current.filters).toEqual({
      page: 1,
      limit: 50,
      sortBy: 'updatedAt',
      sortOrder: 'desc',
    });
    expect(result.current.viewMode).toBe('table');
    expect(result.current.activeFilterCount).toBe(0);
  });

  it('should initialize with custom filters', () => {
    const initialFilters: Partial<RentalObjectQueryFilters> = {
      type: 'SPACE',
      status: 'published',
      search: 'test',
      page: 2,
    };

    const { result } = renderHook(() => useRentalObjectFilters(initialFilters));

    expect(result.current.filters).toEqual({
      page: 2,
      limit: 50,
      sortBy: 'updatedAt',
      sortOrder: 'desc',
      type: 'SPACE',
      status: 'published',
      search: 'test',
    });
    expect(result.current.activeFilterCount).toBe(3); // type, status, search
  });

  it('should initialize with custom view mode', () => {
    const { result } = renderHook(() => useRentalObjectFilters(undefined, 'grid'));

    expect(result.current.viewMode).toBe('grid');
  });

  it('should update a single filter', () => {
    const { result } = renderHook(() => useRentalObjectFilters());

    act(() => {
      result.current.setFilter('search', 'test query');
    });

    expect(result.current.filters.search).toBe('test query');
    expect(result.current.activeFilterCount).toBe(1);
  });

  it('should reset page to 1 when setting non-pagination filter', () => {
    const initialFilters: Partial<RentalObjectQueryFilters> = {
      page: 5,
    };
    const { result } = renderHook(() => useRentalObjectFilters(initialFilters));

    act(() => {
      result.current.setFilter('search', 'new search');
    });

    expect(result.current.filters.page).toBe(1);
    expect(result.current.filters.search).toBe('new search');
  });

  it('should not reset page when updating page filter', () => {
    const initialFilters: Partial<RentalObjectQueryFilters> = {
      page: 2,
    };
    const { result } = renderHook(() => useRentalObjectFilters(initialFilters));

    act(() => {
      result.current.setFilter('page', 3);
    });

    expect(result.current.filters.page).toBe(3);
  });

  it('should not reset page when updating limit filter', () => {
    const initialFilters: Partial<RentalObjectQueryFilters> = {
      page: 2,
      limit: 50,
    };
    const { result } = renderHook(() => useRentalObjectFilters(initialFilters));

    act(() => {
      result.current.setFilter('limit', 100);
    });

    expect(result.current.filters.page).toBe(2);
    expect(result.current.filters.limit).toBe(100);
  });

  it('should update multiple filters at once', () => {
    const { result } = renderHook(() => useRentalObjectFilters());

    act(() => {
      result.current.setFilters({
        type: 'RESOURCE',
        status: 'draft',
        city: 'Oslo',
      });
    });

    expect(result.current.filters).toMatchObject({
      type: 'RESOURCE',
      status: 'draft',
      city: 'Oslo',
      page: 1,
    });
    expect(result.current.activeFilterCount).toBe(3);
  });

  it('should reset page to 1 when setting multiple filters', () => {
    const initialFilters: Partial<RentalObjectQueryFilters> = {
      page: 5,
    };
    const { result } = renderHook(() => useRentalObjectFilters(initialFilters));

    act(() => {
      result.current.setFilters({
        type: 'EVENT',
        status: 'published',
      });
    });

    expect(result.current.filters.page).toBe(1);
  });

  it('should allow setting page explicitly in setFilters', () => {
    const { result } = renderHook(() => useRentalObjectFilters());

    act(() => {
      result.current.setFilters({
        type: 'SERVICE',
        page: 3,
      });
    });

    expect(result.current.filters.page).toBe(3);
    expect(result.current.filters.type).toBe('SERVICE');
  });

  it('should reset filters to default', () => {
    const initialFilters: Partial<RentalObjectQueryFilters> = {
      type: 'SPACE',
      status: 'published',
      search: 'test',
      city: 'Bergen',
      page: 5,
    };
    const { result } = renderHook(() => useRentalObjectFilters(initialFilters));

    expect(result.current.activeFilterCount).toBe(4);

    act(() => {
      result.current.resetFilters();
    });

    expect(result.current.filters).toEqual({
      page: 1,
      limit: 50,
      sortBy: 'updatedAt',
      sortOrder: 'desc',
    });
    expect(result.current.activeFilterCount).toBe(0);
  });

  it('should update view mode', () => {
    const { result } = renderHook(() => useRentalObjectFilters(undefined, 'table'));

    expect(result.current.viewMode).toBe('table');

    act(() => {
      result.current.setViewMode('grid');
    });

    expect(result.current.viewMode).toBe('grid');
  });

  it('should calculate active filter count correctly', () => {
    const { result } = renderHook(() => useRentalObjectFilters());

    expect(result.current.activeFilterCount).toBe(0);

    act(() => {
      result.current.setFilters({
        type: 'SPACE',
        status: 'published',
        search: 'test',
        city: 'Oslo',
        municipality: 'Oslo Kommune',
        organizationId: 'org-123',
        minCapacity: 10,
        maxCapacity: 50,
        hasBookingConfig: true,
      });
    });

    expect(result.current.activeFilterCount).toBe(9);
  });

  it('should not count pagination and sorting in active filter count', () => {
    const { result } = renderHook(() => useRentalObjectFilters());

    act(() => {
      result.current.setFilters({
        page: 3,
        limit: 100,
        sortBy: 'name',
        sortOrder: 'asc',
      });
    });

    expect(result.current.activeFilterCount).toBe(0);
  });

  it('should handle undefined hasBookingConfig filter', () => {
    const { result } = renderHook(() => useRentalObjectFilters());

    act(() => {
      result.current.setFilter('hasBookingConfig', undefined);
    });

    expect(result.current.filters.hasBookingConfig).toBeUndefined();
    expect(result.current.activeFilterCount).toBe(0);
  });

  it('should count hasBookingConfig when explicitly set to false', () => {
    const { result } = renderHook(() => useRentalObjectFilters());

    act(() => {
      result.current.setFilter('hasBookingConfig', false);
    });

    expect(result.current.filters.hasBookingConfig).toBe(false);
    expect(result.current.activeFilterCount).toBe(1);
  });

  it('should handle multiple filter updates sequentially', () => {
    const { result } = renderHook(() => useRentalObjectFilters());

    act(() => {
      result.current.setFilter('type', 'SPACE');
    });

    expect(result.current.filters.type).toBe('SPACE');
    expect(result.current.activeFilterCount).toBe(1);

    act(() => {
      result.current.setFilter('status', 'published');
    });

    expect(result.current.filters.status).toBe('published');
    expect(result.current.activeFilterCount).toBe(2);

    act(() => {
      result.current.setFilter('search', 'meeting room');
    });

    expect(result.current.filters.search).toBe('meeting room');
    expect(result.current.activeFilterCount).toBe(3);
  });

  it('should update sort options correctly', () => {
    const { result } = renderHook(() => useRentalObjectFilters());

    act(() => {
      result.current.setFilters({
        sortBy: 'name',
        sortOrder: 'asc',
      });
    });

    expect(result.current.filters.sortBy).toBe('name');
    expect(result.current.filters.sortOrder).toBe('asc');
  });

  it('should handle capacity range filters', () => {
    const { result } = renderHook(() => useRentalObjectFilters());

    act(() => {
      result.current.setFilters({
        minCapacity: 5,
        maxCapacity: 20,
      });
    });

    expect(result.current.filters.minCapacity).toBe(5);
    expect(result.current.filters.maxCapacity).toBe(20);
    expect(result.current.activeFilterCount).toBe(2);
  });

  it('should override existing filter values', () => {
    const initialFilters: Partial<RentalObjectQueryFilters> = {
      type: 'SPACE',
      status: 'draft',
    };
    const { result } = renderHook(() => useRentalObjectFilters(initialFilters));

    act(() => {
      result.current.setFilter('type', 'RESOURCE');
    });

    expect(result.current.filters.type).toBe('RESOURCE');
    expect(result.current.filters.status).toBe('draft');
  });

  it('should maintain other filters when resetting page', () => {
    const { result } = renderHook(() => useRentalObjectFilters());

    act(() => {
      result.current.setFilters({
        type: 'EVENT',
        status: 'published',
        city: 'Trondheim',
        page: 3,
      });
    });

    act(() => {
      result.current.setFilter('search', 'concert');
    });

    expect(result.current.filters).toMatchObject({
      type: 'EVENT',
      status: 'published',
      city: 'Trondheim',
      search: 'concert',
      page: 1, // Reset to 1 because of search filter change
    });
  });

  it('should handle empty string filters correctly', () => {
    const { result } = renderHook(() => useRentalObjectFilters());

    act(() => {
      result.current.setFilter('search', '');
    });

    expect(result.current.filters.search).toBe('');
    // Empty string is not counted as active filter in the implementation
    expect(result.current.activeFilterCount).toBe(0);
  });
});
