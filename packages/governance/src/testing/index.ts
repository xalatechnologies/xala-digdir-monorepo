/**
 * Testing utilities for Xala governance.
 *
 * This module provides shared testing utilities, fixtures, and helpers
 * for unit and integration testing across the platform.
 */

/**
 * Test fixture factory for creating consistent test data
 */
export interface TestFixture<T> {
  create(overrides?: Partial<T>): T;
  createMany(count: number, overrides?: Partial<T>): T[];
}

/**
 * Creates a test fixture factory
 */
export function createFixture<T>(defaults: T): TestFixture<T> {
  return {
    create(overrides?: Partial<T>): T {
      return { ...defaults, ...overrides };
    },
    createMany(count: number, overrides?: Partial<T>): T[] {
      return Array.from({ length: count }, () => this.create(overrides));
    },
  };
}

/**
 * Mock response builder for API testing
 */
export interface MockResponse<T> {
  data: T;
  status: number;
  headers: Record<string, string>;
}

export function createMockResponse<T>(
  data: T,
  status = 200,
  headers: Record<string, string> = {}
): MockResponse<T> {
  return {
    data,
    status,
    headers: {
      'content-type': 'application/json',
      ...headers,
    },
  };
}

/**
 * Test utilities for async operations
 */
export async function waitFor(
  condition: () => boolean | Promise<boolean>,
  timeout = 5000,
  interval = 100
): Promise<void> {
  const startTime = Date.now();

  while (Date.now() - startTime < timeout) {
    if (await condition()) {
      return;
    }
    await new Promise((resolve) => setTimeout(resolve, interval));
  }

  throw new Error(`waitFor timed out after ${timeout}ms`);
}

/**
 * Delay utility for testing
 */
export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Test ID generator for unique identifiers
 */
let testIdCounter = 0;

export function generateTestId(prefix = 'test'): string {
  testIdCounter += 1;
  return `${prefix}-${Date.now()}-${testIdCounter}`;
}

/**
 * Reset test ID counter (useful between test suites)
 */
export function resetTestIdCounter(): void {
  testIdCounter = 0;
}
