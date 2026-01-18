/**
 * Rental Objects List View
 * Main container for rental objects list with right drawer filters
 *
 * NOTE: Rental objects use rental_object terminology throughout.
 * Internally, rental objects are stored as listings with type=RESOURCE.
 */

import { useState, useCallback } from 'react';
import {
  Button,
  Paragraph,
  Heading,
  ChevronLeftIcon,
  ChevronRightIcon,
  FilterIcon,
  PlusIcon,
  Drawer,
  DrawerSection,
  DrawerItem,
  HeaderSearch,
  Stack,
  Text,
} from '@xala/ds';
import { useNavigate } from 'react-router-dom';
import { useRentalObjects } from '@digilist/client-sdk';
import type { RentalObjectStatus } from '@digilist/client-sdk';
import { RentalObjectsGrid } from './list/RentalObjectsGrid';
import { RentalObjectsTable } from './list/RentalObjectsTable';
import { BulkCustodyModal } from './BulkCustodyModal';
import { useRentalObjectFilters, STATUS_OPTIONS, SORT_OPTIONS } from '../hooks/useRentalObjectFilters';
import { useRentalObjectPermissions } from '../hooks/useRentalObjectPermissions';
import { useT } from '@xala/i18n';

// Capacity filter options for rental objects
const CAPACITY_OPTIONS = [
  { id: 'all', label: t('common.alle_storrelser'), min: 0, max: 999999 },
  { id: '1-10', label: t('common.110_personer'), min: 1, max: 10 },
  { id: '11-25', label: t('common.1125_personer'), min: 11, max: 25 },
  { id: '26-50', label: t('common.2650_personer'), min: 26, max: 50 },
  { id: '51-100', label: t('common.51100_personer'), min: 51, max: 100 },
  { id: '100+', label: t('common.over_100_personer'), min: 101, max: 999999 },
];

export function RentalObjectsListView() {
  // Translation function available for future localization
  const _t = useT(); // eslint-disable-line @typescript-eslint/no-unused-vars
  const navigate = useNavigate();
  const { permissions } = useRentalObjectPermissions();
  const t = useT();

  const {
    filters,
    viewMode,
    setFilter,
    setViewMode,
    resetFilters,
    activeFilterCount,
  } = useRentalObjectFilters();

  // Right drawer state
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isBulkCustodyOpen, setIsBulkCustodyOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [searchValue, setSearchValue] = useState(filters.search || '');

  // Filter state for drawer
  const [selectedStatus, setSelectedStatus] = useState<string>(filters.status || 'all');
  const [selectedCapacity, setSelectedCapacity] = useState<string>('all');
  const [selectedSort, setSelectedSort] = useState<string>('updated-desc');

  // Build query params, forcing type to RESOURCE for rental objects
  const queryParams: Record<string, unknown> = {
    type: 'RESOURCE', // Always filter for RESOURCE type (rental objects)
  };
  if (filters.status) queryParams.status = filters.status;
  if (filters.search) queryParams.search = filters.search;
  if (filters.city) queryParams.city = filters.city;
  if (filters.page) queryParams.page = filters.page;
  if (filters.limit) queryParams.limit = filters.limit;
  if (filters.sortBy) queryParams.sortBy = filters.sortBy;
  if (filters.sortOrder) queryParams.sortOrder = filters.sortOrder;

  const { data, isLoading, refetch } = useRentalObjects(queryParams);

  const rentalObjects = data?.data || [];
  const pagination = data?.meta;
  const totalCount = pagination?.total || 0;
  const currentPage = pagination?.page || 1;
  const totalPages = pagination?.totalPages || 1;

  // Search handlers
  const handleSearchChange = useCallback((value: string) => {
    setSearchValue(value);
  }, []);

  const handleSearch = useCallback((value: string) => {
    setFilter('search', value || undefined);
  }, [setFilter]);

  // Apply filters from drawer
  const applyFilters = useCallback(() => {
    // Apply status
    setFilter('status', selectedStatus === 'all' ? undefined : selectedStatus as RentalObjectStatus);

    // Apply capacity
    const capacityOption = CAPACITY_OPTIONS.find(c => c.id === selectedCapacity);
    if (capacityOption && selectedCapacity !== 'all') {
      setFilter('minCapacity', capacityOption.min);
      setFilter('maxCapacity', capacityOption.max);
    } else {
      setFilter('minCapacity', undefined);
      setFilter('maxCapacity', undefined);
    }

    // Apply sort
    const sortOption = SORT_OPTIONS.find(s => s.id === selectedSort);
    if (sortOption && sortOption.field && sortOption.order) {
      setFilter('sortBy', sortOption.field);
      setFilter('sortOrder', sortOption.order);
    }

    setIsFilterOpen(false);
  }, [selectedStatus, selectedCapacity, selectedSort, setFilter]);

  // Reset drawer filters
  const resetDrawerFilters = useCallback(() => {
    setSelectedStatus('all');
    setSelectedCapacity('all');
    setSelectedSort('updated-desc');
  }, []);

  const handleSelectAll = useCallback((selected: boolean) => {
    if (selected) {
      setSelectedIds(rentalObjects.map((obj) => obj.id));
    } else {
      setSelectedIds([]);
    }
  }, [rentalObjects]);

  const handleSelectOne = useCallback((id: string, selected: boolean) => {
    if (selected) {
      setSelectedIds((prev) => [...prev, id]);
    } else {
      setSelectedIds((prev) => prev.filter((i) => i !== id));
    }
  }, []);

  const handleSort = useCallback((field: 'name' | 'updatedAt' | 'createdAt' | 'status' | undefined) => {
    if (!field) return;

    const currentSortBy = filters.sortBy;
    const currentSortOrder = filters.sortOrder;

    if (field === currentSortBy) {
      setFilter('sortOrder', currentSortOrder === 'desc' ? 'asc' : 'desc');
    } else {
      setFilter('sortBy', field);
      setFilter('sortOrder', 'desc');
    }
  }, [filters.sortBy, filters.sortOrder, setFilter]);

  const handlePageChange = useCallback((page: number) => {
    setFilter('page', page);
  }, [setFilter]);

  const handleRefresh = useCallback(() => {
    refetch();
    setSelectedIds([]);
  }, [refetch]);

  return (
    <>
      {/* Right Filter Drawer */}
      <Drawer
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        title={t('common.filter_og_sortering')}
        icon={<FilterIcon size={20} />}
        position="right"
        size="sm"
        footer={
          <Stack spacing="var(--ds-spacing-3)">
            <Text
              size="sm"
              color="var(--ds-color-neutral-text-subtle)"
              style={{ textAlign: 'center' }}
            >
              Viser {totalCount} resultater
            </Text>
            <div style={{ display: 'flex', gap: 'var(--ds-spacing-2)' }}>
              <Button
                type="button"
                variant="secondary"
                style={{ flex: 1 }}
                onClick={() => {
                  resetDrawerFilters();
                  resetFilters();
                  setIsFilterOpen(false);
                }}
              >
                Nullstill
              </Button>
              <Button
                type="button"
                variant="primary"
                style={{ flex: 1 }}
                onClick={applyFilters}
              >
                t('actions.bruk_filter')
              </Button>
            </div>
          </Stack>
        }
      >
        {/* Status Section */}
        <DrawerSection title="Status" collapsible>
          <Stack spacing="var(--ds-spacing-1)">
            {STATUS_OPTIONS.map((status) => (
              <DrawerItem
                key={status.id}
                left={
                  <input
                    type="radio"
                    name="status"
                    checked={selectedStatus === status.id}
                    onChange={() => setSelectedStatus(status.id)}
                    style={{
                      width: '18px',
                      height: '18px',
                      accentColor: 'var(--ds-color-accent-base-default)',
                    }}
                  />
                }
                onClick={() => setSelectedStatus(status.id)}
                selected={selectedStatus === status.id}
              >
                <Text size="sm" color="var(--ds-color-neutral-text-default)">
                  {status.label}
                </Text>
              </DrawerItem>
            ))}
          </Stack>
        </DrawerSection>

        {/* Capacity Section */}
        <DrawerSection title="Kapasitet" collapsible defaultCollapsed>
          <Stack spacing="var(--ds-spacing-1)">
            {CAPACITY_OPTIONS.map((cap) => (
              <DrawerItem
                key={cap.id}
                left={
                  <input
                    type="radio"
                    name="capacity"
                    checked={selectedCapacity === cap.id}
                    onChange={() => setSelectedCapacity(cap.id)}
                    style={{
                      width: '18px',
                      height: '18px',
                      accentColor: 'var(--ds-color-accent-base-default)',
                    }}
                  />
                }
                onClick={() => setSelectedCapacity(cap.id)}
                selected={selectedCapacity === cap.id}
              >
                <Text size="sm" color="var(--ds-color-neutral-text-default)">
                  {cap.label}
                </Text>
              </DrawerItem>
            ))}
          </Stack>
        </DrawerSection>

        {/* Sort Section */}
        <DrawerSection title="Sortering" collapsible defaultCollapsed>
          <Stack spacing="var(--ds-spacing-1)">
            {SORT_OPTIONS.map((sort) => (
              <DrawerItem
                key={sort.id}
                left={
                  <input
                    type="radio"
                    name="sort"
                    checked={selectedSort === sort.id}
                    onChange={() => setSelectedSort(sort.id)}
                    style={{
                      width: '18px',
                      height: '18px',
                      accentColor: 'var(--ds-color-accent-base-default)',
                    }}
                  />
                }
                onClick={() => setSelectedSort(sort.id)}
                selected={selectedSort === sort.id}
              >
                <Text size="sm" color="var(--ds-color-neutral-text-default)">
                  {sort.label}
                </Text>
              </DrawerItem>
            ))}
          </Stack>
        </DrawerSection>
      </Drawer>

      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--ds-spacing-5)',
          height: '100%',
        }}
      >
        {/* Header Row: Title + Create Button */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Heading level={1} data-size="md" style={{ margin: 0 }}>
            Utleieobjekter
            {totalCount > 0 && (
              <span
                style={{
                  color: 'var(--ds-color-neutral-text-subtle)',
                  fontWeight: 'var(--ds-font-weight-regular)',
                  marginLeft: 'var(--ds-spacing-2)',
                }}
              >
                ({totalCount})
              </span>
            )}
          </Heading>

          {permissions.canCreate && (
            <Button
              type="button"
              variant="primary"
              onClick={() => navigate('/rental-objects/new')}
            >
              <PlusIcon />
              Nytt utleieobjekt
            </Button>
          )}
        </div>

        {/* Toolbar Row: Search (left) | Count (center) | View toggle + Filter (right) */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--ds-spacing-3)',
          }}
        >
          {/* Search on left */}
          <HeaderSearch
            placeholder={t('common.sok_etter_utleieobjekter')}
            value={searchValue}
            onSearchChange={handleSearchChange}
            onSearch={handleSearch}
            width="350px"
          />

          {/* Count in center */}
          <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
            <Paragraph data-size="sm" style={{ margin: 0, color: 'var(--ds-color-neutral-text-subtle)', whiteSpace: 'nowrap' }}>
              {totalCount} utleieobjekter
            </Paragraph>
          </div>

          {/* View toggle + Filter on right */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--ds-spacing-2)' }}>
            {/* View toggle */}
            <div style={{ display: 'flex', gap: '2px', backgroundColor: 'var(--ds-color-neutral-surface-default)', padding: '2px', borderRadius: 'var(--ds-border-radius-md)', border: '1px solid var(--ds-color-neutral-border-subtle)' }}>
              <Button
                type="button"
                variant={viewMode === 'grid' ? 'primary' : 'tertiary'}
                data-size="sm"
                onClick={() => setViewMode('grid')}
                aria-label="Rutenettvisning"
                style={{ padding: 'var(--ds-spacing-2)' }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
                  <rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" />
                </svg>
              </Button>
              <Button
                type="button"
                variant={viewMode === 'table' ? 'primary' : 'tertiary'}
                data-size="sm"
                onClick={() => setViewMode('table')}
                aria-label="Listevisning"
                style={{ padding: 'var(--ds-spacing-2)' }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" />
                </svg>
              </Button>
            </div>

            {/* Filter button */}
            <Button
              type="button"
              variant="secondary"
              onClick={() => setIsFilterOpen(true)}
              style={{ position: 'relative' }}
            >
              <FilterIcon />
              Filtre
              {activeFilterCount > 0 && (
                <span
                  style={{
                    position: 'absolute',
                    top: 'calc(-1 * var(--ds-spacing-2))',
                    right: 'calc(-1 * var(--ds-spacing-2))',
                    minWidth: '18px',
                    height: '18px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 'var(--ds-font-size-xs)',
                    fontWeight: 'var(--ds-font-weight-semibold)',
                    backgroundColor: 'var(--ds-color-accent-base-default)',
                    color: 'var(--ds-color-accent-contrast-default)',
                    borderRadius: 'var(--ds-border-radius-full)',
                    padding: '0 var(--ds-spacing-1)',
                  }}
                >
                  {activeFilterCount}
                </span>
              )}
            </Button>
          </div>
        </div>

        {/* Bulk Actions (when items selected) */}
        {selectedIds.length > 0 && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--ds-spacing-3)',
              padding: 'var(--ds-spacing-3) var(--ds-spacing-4)',
              backgroundColor: 'var(--ds-color-accent-surface-default)',
              borderRadius: 'var(--ds-border-radius-md)',
            }}
          >
            <Paragraph data-size="sm" style={{ margin: 0 }}>
              {selectedIds.length} valgt
            </Paragraph>
            <Button type="button" variant="secondary" data-size="sm" onClick={() => setSelectedIds([])}>
              Fjern valg
            </Button>
            <Button type="button" variant="primary" data-size="sm" onClick={() => setIsBulkCustodyOpen(true)}>
              Tildel ansvar
            </Button>
          </div>
        )}

        {isBulkCustodyOpen && (
          <BulkCustodyModal 
            selectedIds={selectedIds} 
            onClose={() => setIsBulkCustodyOpen(false)} 
            onSuccess={handleRefresh} 
          />
        )}

        {/* Content - Grid or Table View */}
        <div style={{ flex: 1, overflow: 'auto' }}>
          {viewMode === 'grid' ? (
            <RentalObjectsGrid
              rentalObjects={rentalObjects}
              isLoading={isLoading}
              selectedIds={selectedIds}
              onSelectOne={handleSelectOne}
              onRefresh={handleRefresh}
            />
          ) : (
            <RentalObjectsTable
              rentalObjects={rentalObjects}
              isLoading={isLoading}
              selectedIds={selectedIds}
              onSelectAll={handleSelectAll}
              onSelectOne={handleSelectOne}
              onSort={handleSort}
              sortBy={filters.sortBy}
              sortOrder={filters.sortOrder}
              onRefresh={handleRefresh}
            />
          )}
        </div>

        {/* Simple Pagination */}
        {totalPages > 1 && (
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              gap: 'var(--ds-spacing-3)',
              paddingTop: 'var(--ds-spacing-4)',
              borderTop: '1px solid var(--ds-color-neutral-border-subtle)',
            }}
          >
            <Button
              type="button"
              variant="tertiary"
              data-size="sm"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage <= 1}
              aria-label={t('common.forrige_side')}
            >
              <ChevronLeftIcon />
            </Button>

            <Paragraph data-size="sm" style={{ margin: 0 }}>
              Side {currentPage} av {totalPages}
            </Paragraph>

            <Button
              type="button"
              variant="tertiary"
              data-size="sm"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage >= totalPages}
              aria-label={t('common.neste_side')}
            >
              <ChevronRightIcon />
            </Button>
          </div>
        )}
      </div>
    </>
  );
}
