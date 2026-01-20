/**
 * Array Utils Tests
 * Array utility function tests
 */

import { describe, it, expect } from 'vitest';

describe('Array Utils', () => {
  describe('unique', () => {
    const unique = <T>(arr: T[]) => [...new Set(arr)];

    it('should remove duplicates', () => {
      expect(unique([1, 2, 2, 3])).toEqual([1, 2, 3]);
    });

    it('should handle strings', () => {
      expect(unique(['a', 'b', 'a'])).toEqual(['a', 'b']);
    });

    it('should handle empty array', () => {
      expect(unique([])).toEqual([]);
    });
  });

  describe('groupBy', () => {
    const groupBy = <T, K extends string | number>(arr: T[], key: (item: T) => K) => {
      return arr.reduce((groups, item) => {
        const group = key(item);
        groups[group] = groups[group] || [];
        groups[group].push(item);
        return groups;
      }, {} as Record<K, T[]>);
    };

    it('should group by key', () => {
      const items = [{ type: 'a', value: 1 }, { type: 'b', value: 2 }, { type: 'a', value: 3 }];
      const result = groupBy(items, item => item.type);
      expect(result['a']).toHaveLength(2);
      expect(result['b']).toHaveLength(1);
    });
  });

  describe('chunk', () => {
    const chunk = <T>(arr: T[], size: number) => {
      const chunks = [];
      for (let i = 0; i < arr.length; i += size) {
        chunks.push(arr.slice(i, i + size));
      }
      return chunks;
    };

    it('should chunk array', () => {
      expect(chunk([1, 2, 3, 4, 5], 2)).toEqual([[1, 2], [3, 4], [5]]);
    });

    it('should handle exact chunks', () => {
      expect(chunk([1, 2, 3, 4], 2)).toEqual([[1, 2], [3, 4]]);
    });
  });

  describe('flatten', () => {
    const flatten = <T>(arr: T[][]) => arr.reduce((acc, val) => acc.concat(val), []);

    it('should flatten nested arrays', () => {
      expect(flatten([[1, 2], [3, 4]])).toEqual([1, 2, 3, 4]);
    });
  });

  describe('sortBy', () => {
    const sortBy = <T>(arr: T[], key: (item: T) => number) => [...arr].sort((a, b) => key(a) - key(b));

    it('should sort by key', () => {
      const items = [{ value: 3 }, { value: 1 }, { value: 2 }];
      const result = sortBy(items, item => item.value);
      expect(result[0].value).toBe(1);
    });
  });
});
