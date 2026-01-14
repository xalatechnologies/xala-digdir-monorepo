/**
 * DI Container Unit Tests
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Container } from '../../../src/core/container';
import { setupTestHooks } from '../../setup';

describe('Container', () => {
  let container: Container;

  setupTestHooks();

  beforeEach(() => {
    container = new Container();
  });

  describe('registerValue', () => {
    it('should register and resolve a value', () => {
      container.registerValue('config', { port: 4000 });

      const result = container.resolve('config');

      expect(result).toEqual({ port: 4000 });
    });

    it('should overwrite existing value', () => {
      container.registerValue('config', { port: 3000 });
      container.registerValue('config', { port: 4000 });

      const result = container.resolve('config');

      expect(result).toEqual({ port: 4000 });
    });
  });

  describe('registerFactory', () => {
    it('should register and resolve using factory', () => {
      const factory = vi.fn().mockReturnValue({ name: 'test' });
      container.registerFactory('service', factory);

      const result = container.resolve('service');

      expect(result).toEqual({ name: 'test' });
      expect(factory).toHaveBeenCalledTimes(1);
    });

    it('should cache factory result (singleton)', () => {
      let callCount = 0;
      container.registerFactory('counter', () => ({ count: ++callCount }));

      const first = container.resolve('counter') as { count: number };
      const second = container.resolve('counter') as { count: number };

      expect(first).toBe(second);
      expect(first.count).toBe(1);
    });
  });

  describe('resolve', () => {
    it('should throw for unregistered dependency', () => {
      expect(() => container.resolve('unknown')).toThrow();
    });

    it('should resolve registered value', () => {
      container.registerValue('test', 'value');
      expect(container.resolve('test')).toBe('value');
    });
  });

  describe('has', () => {
    it('should return true for registered dependency', () => {
      container.registerValue('test', 'value');

      expect(container.has('test')).toBe(true);
    });

    it('should return false for unregistered dependency', () => {
      expect(container.has('unknown')).toBe(false);
    });
  });

  describe('clear', () => {
    it('should remove all registrations', () => {
      container.registerValue('test', 'value');
      container.clear();

      expect(container.has('test')).toBe(false);
    });
  });
});
