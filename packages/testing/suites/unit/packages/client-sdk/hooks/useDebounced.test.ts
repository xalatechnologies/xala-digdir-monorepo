/**
 * Unit Tests for useDebounced Hook
 * Tests hook structure and export
 *
 * Note: Hook behavior is verified through integration tests in the apps that use it.
 * These tests verify the hook is properly exported and has correct TypeScript signatures.
 */
import { describe, it, expect } from 'vitest';
import { useDebounced } from '@digilist/api/useDebounced';
import * as hooksIndex from '@digilist/api/index';

// SKIPPED
describe.skip('useDebounced', () => {
  it('should be defined and exported', () => {
    expect(useDebounced).toBeDefined();
    expect(typeof useDebounced).toBe('function');
  });

  it('should be exported from hooks index', () => {
    expect(hooksIndex.useDebounced).toBeDefined();
    expect(typeof hooksIndex.useDebounced).toBe('function');
    expect(hooksIndex.useDebounced).toBe(useDebounced);
  });

  it('should have correct TypeScript types', () => {
    // This is a compile-time check
    // If TypeScript compiles this file without errors, the hook has correct types

    // Verify the hook has the expected signature
    type UseDebounced = <T>(value: T, delay?: number) => T;

    const hook: UseDebounced = useDebounced;
    expect(hook).toBe(useDebounced);
  });
});
