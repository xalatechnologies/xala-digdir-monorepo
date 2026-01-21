/**
 * Query Module Exports
 *
 * Schema-agnostic query key factory for React Query.
 */

export type { QueryKey, QueryKeyOptions } from './query-key-factory';

export {
  createQueryKeyFactory,
  mergeQueryKeyFactories,
  createScopedQueryKey,
  matchQueryKey,
  serializeQueryParams,
  hashQueryKey,
} from './query-key-factory';
