/**
 * Smoke Tests
 * Minimal tests to verify the test infrastructure is working
 */
import { describe, it, expect } from 'vitest';

describe('Test Infrastructure', () => {
  it('should run tests', () => {
    expect(true).toBe(true);
  });
  
  it('should have proper environment', () => {
    expect(process.env.NODE_ENV).toBe('test');
  });
});
