/**
 * Object Utils Tests
 * Object utility function tests
 */

import { describe, it, expect } from 'vitest';

describe('Object Utils', () => {
  describe('pick', () => {
    const pick = <T extends object, K extends keyof T>(obj: T, keys: K[]) => {
      const result = {} as Pick<T, K>;
      keys.forEach(key => { if (key in obj) result[key] = obj[key]; });
      return result;
    };

    it('should pick specified keys', () => {
      const obj = { a: 1, b: 2, c: 3 };
      expect(pick(obj, ['a', 'b'])).toEqual({ a: 1, b: 2 });
    });
  });

  describe('omit', () => {
    const omit = <T extends object, K extends keyof T>(obj: T, keys: K[]) => {
      const result = { ...obj };
      keys.forEach(key => delete result[key]);
      return result as Omit<T, K>;
    };

    it('should omit specified keys', () => {
      const obj = { a: 1, b: 2, c: 3 };
      expect(omit(obj, ['c'])).toEqual({ a: 1, b: 2 });
    });
  });

  describe('isEmpty', () => {
    const isEmpty = (obj: object) => Object.keys(obj).length === 0;

    it('should return true for empty object', () => {
      expect(isEmpty({})).toBe(true);
    });

    it('should return false for non-empty object', () => {
      expect(isEmpty({ a: 1 })).toBe(false);
    });
  });

  describe('deepMerge', () => {
    const deepMerge = <T extends object>(target: T, source: Partial<T>): T => {
      const result = { ...target };
      Object.keys(source).forEach(key => {
        const k = key as keyof T;
        if (source[k] && typeof source[k] === 'object' && !Array.isArray(source[k])) {
          result[k] = deepMerge(target[k] as object, source[k] as object) as T[keyof T];
        } else if (source[k] !== undefined) {
          result[k] = source[k] as T[keyof T];
        }
      });
      return result;
    };

    it('should deep merge objects', () => {
      const target = { a: { b: 1 } };
      const source = { a: { c: 2 } };
      const result = deepMerge(target, source as Partial<typeof target>);
      expect(result.a.b).toBe(1);
    });
  });

  describe('keys', () => {
    it('should return object keys', () => {
      const obj = { a: 1, b: 2 };
      expect(Object.keys(obj)).toEqual(['a', 'b']);
    });
  });

  describe('values', () => {
    it('should return object values', () => {
      const obj = { a: 1, b: 2 };
      expect(Object.values(obj)).toEqual([1, 2]);
    });
  });
});
