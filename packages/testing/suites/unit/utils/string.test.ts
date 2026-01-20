/**
 * String Utils Tests
 * String utility function tests
 */

import { describe, it, expect } from 'vitest';

describe('String Utils', () => {
  describe('capitalize', () => {
    const capitalize = (str: string) => str.charAt(0).toUpperCase() + str.slice(1);

    it('should capitalize first letter', () => {
      expect(capitalize('hello')).toBe('Hello');
    });

    it('should handle empty string', () => {
      expect(capitalize('')).toBe('');
    });
  });

  describe('camelCase', () => {
    const camelCase = (str: string) => 
      str.replace(/[-_\s]+(.)?/g, (_, c) => c ? c.toUpperCase() : '');

    it('should convert to camelCase', () => {
      expect(camelCase('hello-world')).toBe('helloWorld');
    });

    it('should handle snake_case', () => {
      expect(camelCase('hello_world')).toBe('helloWorld');
    });
  });

  describe('kebabCase', () => {
    const kebabCase = (str: string) => 
      str.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();

    it('should convert to kebab-case', () => {
      expect(kebabCase('helloWorld')).toBe('hello-world');
    });
  });

  describe('snakeCase', () => {
    const snakeCase = (str: string) => 
      str.replace(/([a-z])([A-Z])/g, '$1_$2').toLowerCase();

    it('should convert to snake_case', () => {
      expect(snakeCase('helloWorld')).toBe('hello_world');
    });
  });

  describe('padStart', () => {
    it('should pad string', () => {
      expect('5'.padStart(2, '0')).toBe('05');
    });
  });

  describe('trim', () => {
    it('should trim whitespace', () => {
      expect('  hello  '.trim()).toBe('hello');
    });
  });

  describe('includes', () => {
    it('should check substring', () => {
      expect('hello world'.includes('world')).toBe(true);
    });

    it('should return false for missing substring', () => {
      expect('hello world'.includes('foo')).toBe(false);
    });
  });

  describe('split', () => {
    it('should split string', () => {
      expect('a,b,c'.split(',')).toEqual(['a', 'b', 'c']);
    });
  });
});
