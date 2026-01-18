/**
 * Custom assertions and matchers for Digilist tests
 */

import { expect } from 'vitest';

/**
 * Assert that a response has RFC 7807 error format
 */
export function expectRFC7807Error(response: { error?: { code?: string; message?: string } }) {
  expect(response.error).toBeDefined();
  expect(response.error?.code).toBeDefined();
  expect(response.error?.message).toBeDefined();
}

/**
 * Assert that response has valid pagination
 */
export function expectPagination(response: { pagination?: { total?: number; page?: number; pageSize?: number } }) {
  expect(response.pagination).toBeDefined();
  expect(typeof response.pagination?.total).toBe('number');
  expect(typeof response.pagination?.page).toBe('number');
  expect(typeof response.pagination?.pageSize).toBe('number');
}

/**
 * Assert that an element has accessible name
 */
export function expectAccessibleName(element: HTMLElement, name: string) {
  expect(element.getAttribute('aria-label') || element.textContent).toContain(name);
}

/**
 * Assert that dates are within acceptable range
 */
export function expectDateNear(actual: Date | string, expected: Date | string, toleranceMs = 1000) {
  const actualTime = new Date(actual).getTime();
  const expectedTime = new Date(expected).getTime();
  expect(Math.abs(actualTime - expectedTime)).toBeLessThan(toleranceMs);
}

/**
 * Assert HTTP status code is in expected range
 */
export function expectStatus(status: number, expected: number | number[]) {
  const expectedArray = Array.isArray(expected) ? expected : [expected];
  expect(expectedArray).toContain(status);
}

/**
 * Assert that response has valid UUID
 */
export function expectUUID(value: string) {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  expect(value).toMatch(uuidRegex);
}
