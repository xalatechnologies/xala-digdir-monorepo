/**
 * Query Key Factory Tests
 */
import { describe, it, expect } from 'vitest';
import {
  createQueryKeyFactory,
  mergeQueryKeyFactories,
  createScopedQueryKey,
  matchQueryKey,
  serializeQueryParams,
} from '@xala/api/query/query-key-factory';

describe('QueryKeyFactory', () => {
  describe('createQueryKeyFactory', () => {
    it('should create a factory with all key methods', () => {
      const keys = createQueryKeyFactory('users');

      expect(keys.all()).toEqual(['users']);
      expect(keys.lists()).toEqual(['users', 'list']);
      expect(keys.details()).toEqual(['users', 'detail']);
    });

    it('should create list keys with params', () => {
      const keys = createQueryKeyFactory<{ page?: number; limit?: number }>('users');

      expect(keys.list()).toEqual(['users', 'list']);
      expect(keys.list({ page: 1 })).toEqual(['users', 'list', { page: 1 }]);
      expect(keys.list({ page: 1, limit: 10 })).toEqual(['users', 'list', { page: 1, limit: 10 }]);
    });

    it('should create detail keys with id', () => {
      const keys = createQueryKeyFactory('users');

      expect(keys.detail('123')).toEqual(['users', 'detail', '123']);
      expect(keys.detail('abc-def')).toEqual(['users', 'detail', 'abc-def']);
    });

    it('should create sub-keys', () => {
      const keys = createQueryKeyFactory('users');

      expect(keys.sub('permissions')).toEqual(['users', 'permissions']);
      expect(keys.subWithId('bookings', '123')).toEqual(['users', 'bookings', '123']);
      expect(keys.subWithParams('filter', { active: true })).toEqual(['users', 'filter', { active: true }]);
    });
  });

  describe('mergeQueryKeyFactories', () => {
    it('should merge multiple factories', () => {
      const factories = mergeQueryKeyFactories({
        users: createQueryKeyFactory('users'),
        bookings: createQueryKeyFactory('bookings'),
      });

      expect(factories.users.all()).toEqual(['users']);
      expect(factories.bookings.all()).toEqual(['bookings']);
    });
  });

  describe('createScopedQueryKey', () => {
    it('should create a scoped key', () => {
      const key = createScopedQueryKey(['users', 'list'], { tenantId: 'abc' });

      expect(key).toEqual(['scope', { tenantId: 'abc' }, 'users', 'list']);
    });
  });

  describe('matchQueryKey', () => {
    it('should match exact keys', () => {
      expect(matchQueryKey(['users', 'list'], ['users', 'list'])).toBe(true);
    });

    it('should match prefix patterns', () => {
      expect(matchQueryKey(['users', 'list', { page: 1 }], ['users'])).toBe(true);
      expect(matchQueryKey(['users', 'detail', '123'], ['users', 'detail'])).toBe(true);
    });

    it('should not match non-matching keys', () => {
      expect(matchQueryKey(['users'], ['bookings'])).toBe(false);
      expect(matchQueryKey(['users'], ['users', 'list'])).toBe(false);
    });
  });

  describe('serializeQueryParams', () => {
    it('should serialize params alphabetically', () => {
      const result = serializeQueryParams({ z: 1, a: 2, m: 3 });
      expect(result).toBe('a=2&m=3&z=1');
    });

    it('should skip undefined values', () => {
      const result = serializeQueryParams({ a: 1, b: undefined, c: 3 });
      expect(result).toBe('a=1&c=3');
    });

    it('should handle complex values', () => {
      const result = serializeQueryParams({ filter: { active: true }, page: 1 });
      expect(result).toBe('filter={"active":true}&page=1');
    });
  });
});
