/**
 * Storage Query Keys
 * React Query keys for storage operations
 */

import type { ListFilesQuery } from '../types/storage.types';

export const storageKeys = {
  all: ['storage'] as const,
  
  lists: () => [...storageKeys.all, 'list'] as const,
  list: (query: ListFilesQuery) => [...storageKeys.lists(), query] as const,
  
  details: () => [...storageKeys.all, 'detail'] as const,
  detail: (id: string) => [...storageKeys.details(), id] as const,
} as const;
