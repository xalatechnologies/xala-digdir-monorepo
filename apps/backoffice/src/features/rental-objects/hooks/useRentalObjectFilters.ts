/**
 * useRentalObjectFilters
 * Hook for managing rental object list filters
 * TODO: Implement full filter logic
 */

import { useState } from 'react';

export const STATUS_OPTIONS = [
  { value: 'all', label: 'Alle' },
  { value: 'published', label: 'Publisert' },
  { value: 'draft', label: 'Utkast' },
];

export const SORT_OPTIONS = [
  { value: 'name_asc', label: 'Navn (A-Å)' },
  { value: 'name_desc', label: 'Navn (Å-A)' },
  { value: 'created_desc', label: 'Nyeste først' },
  { value: 'created_asc', label: 'Eldste først' },
];

export function useRentalObjectFilters() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('name_asc');

  const resetFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setSortBy('name_asc');
  };

  const activeFilterCount =
    (searchTerm ? 1 : 0) +
    (statusFilter !== 'all' ? 1 : 0);

  return {
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    sortBy,
    setSortBy,
    resetFilters,
    activeFilterCount,
  };
}
