/**
 * Query Key Factory
 *
 * Schema-agnostic query key generation for React Query.
 * Provides type-safe, hierarchical query keys for cache management.
 */

/**
 * Query key tuple type
 */
export type QueryKey = readonly unknown[];

/**
 * Options for query key generation
 */
export interface QueryKeyOptions {
  /** Include undefined params in key (default: false) */
  includeUndefined?: boolean;
  /** Serialize params for consistent hashing (default: true) */
  serialize?: boolean;
}

/**
 * Create a hierarchical query key factory for a domain
 *
 * @example
 * const userKeys = createQueryKeyFactory('users');
 * userKeys.all()           // ['users']
 * userKeys.lists()         // ['users', 'list']
 * userKeys.list({ page: 1 }) // ['users', 'list', { page: 1 }]
 * userKeys.details()       // ['users', 'detail']
 * userKeys.detail('123')   // ['users', 'detail', '123']
 */
export function createQueryKeyFactory<TParams = Record<string, unknown>>(domain: string) {
  return {
    /** All keys for this domain */
    all: () => [domain] as const,

    /** All list keys */
    lists: () => [...createQueryKeyFactory(domain).all(), 'list'] as const,

    /** Specific list with params */
    list: (params?: TParams) =>
      params
        ? ([...createQueryKeyFactory(domain).lists(), params] as const)
        : createQueryKeyFactory(domain).lists(),

    /** All detail keys */
    details: () => [...createQueryKeyFactory(domain).all(), 'detail'] as const,

    /** Specific detail by ID */
    detail: (id: string) => [...createQueryKeyFactory(domain).details(), id] as const,

    /** Custom sub-key */
    sub: <T extends string>(key: T) =>
      [...createQueryKeyFactory(domain).all(), key] as const,

    /** Custom sub-key with ID */
    subWithId: <T extends string>(key: T, id: string) =>
      [...createQueryKeyFactory(domain).all(), key, id] as const,

    /** Custom sub-key with params */
    subWithParams: <T extends string, P = TParams>(key: T, params?: P) =>
      params
        ? ([...createQueryKeyFactory(domain).all(), key, params] as const)
        : ([...createQueryKeyFactory(domain).all(), key] as const),
  };
}

/**
 * Merge multiple query key factories
 *
 * @example
 * const keys = mergeQueryKeyFactories({
 *   users: createQueryKeyFactory('users'),
 *   posts: createQueryKeyFactory('posts'),
 * });
 */
export function mergeQueryKeyFactories<
  T extends Record<string, ReturnType<typeof createQueryKeyFactory>>
>(factories: T): T {
  return factories;
}

/**
 * Create a scoped query key (e.g., for tenant isolation)
 *
 * @example
 * const scopedKey = createScopedQueryKey(['users', 'list'], { tenantId: 'abc' });
 * // ['scope', { tenantId: 'abc' }, 'users', 'list']
 */
export function createScopedQueryKey(
  key: QueryKey,
  scope: Record<string, unknown>
): QueryKey {
  return ['scope', scope, ...key];
}

/**
 * Check if a query key matches a pattern
 *
 * @example
 * matchQueryKey(['users', 'list'], ['users']) // true
 * matchQueryKey(['users', 'detail', '123'], ['users', 'detail']) // true
 * matchQueryKey(['posts', 'list'], ['users']) // false
 */
export function matchQueryKey(key: QueryKey, pattern: QueryKey): boolean {
  if (pattern.length > key.length) {
    return false;
  }

  for (let i = 0; i < pattern.length; i++) {
    if (pattern[i] !== key[i]) {
      return false;
    }
  }

  return true;
}

/**
 * Serialize query params for consistent key generation
 */
export function serializeQueryParams(params: Record<string, unknown>): string {
  const sortedKeys = Object.keys(params).sort();
  const pairs = sortedKeys
    .filter((key) => params[key] !== undefined)
    .map((key) => `${key}=${JSON.stringify(params[key])}`);
  return pairs.join('&');
}

/**
 * Create a stable hash from query key for caching
 */
export function hashQueryKey(key: QueryKey): string {
  return JSON.stringify(key);
}
