/**
 * Test Utilities - Shared Fixtures & Helpers
 * 
 * Common utilities for all test suites
 */

import { testConfig } from '../config/test-config';

// =============================================================================
// AUTH HELPERS
// =============================================================================

export interface TestUser {
  id: string;
  email: string;
  role: 'CITIZEN' | 'CASEWORKER' | 'ORG_ADMIN' | 'ADMIN' | 'SAAS_ADMIN';
  tenantId: string;
  token?: string;
}

export const testUsers: Record<string, TestUser> = {
  citizen: {
    id: 'test-citizen-001',
    email: 'citizen@test.digilist.no',
    role: 'CITIZEN',
    tenantId: 'test-tenant',
  },
  caseworker: {
    id: 'test-caseworker-001',
    email: 'caseworker@test.digilist.no',
    role: 'CASEWORKER',
    tenantId: 'test-tenant',
  },
  orgAdmin: {
    id: 'test-org-admin-001',
    email: 'org-admin@test.digilist.no',
    role: 'ORG_ADMIN',
    tenantId: 'test-tenant',
  },
  admin: {
    id: 'test-admin-001',
    email: 'admin@test.digilist.no',
    role: 'ADMIN',
    tenantId: 'test-tenant',
  },
  saasAdmin: {
    id: 'test-saas-admin-001',
    email: 'saas@test.digilist.no',
    role: 'SAAS_ADMIN',
    tenantId: 'system',
  },
};

// =============================================================================
// API HELPERS
// =============================================================================

export async function apiGet<T>(path: string, token?: string): Promise<T> {
  const response = await fetch(`${testConfig.apiUrl}${path}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  return response.json();
}

export async function apiPost<T>(path: string, body: unknown, token?: string): Promise<T> {
  const response = await fetch(`${testConfig.apiUrl}${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(body),
  });
  return response.json();
}

export async function checkApiHealth(): Promise<boolean> {
  try {
    const response = await fetch(`${testConfig.apiUrl}/health`, {
      signal: AbortSignal.timeout(2000),
    });
    return response.ok;
  } catch {
    return false;
  }
}

// =============================================================================
// RFC 7807 PROBLEM DETAILS MATCHER
// =============================================================================

export interface ProblemDetails {
  type: string;
  title: string;
  status: number;
  detail?: string;
  instance?: string;
  violations?: Array<{ field: string; message: string }>;
}

export function expectProblem(
  response: unknown,
  expected: { type?: string; title?: string; status: number; detail?: string }
): void {
  const problem = response as ProblemDetails;
  
  if (expected.status) {
    expect(problem.status).toBe(expected.status);
  }
  if (expected.type) {
    expect(problem.type).toContain(expected.type);
  }
  if (expected.title) {
    expect(problem.title).toBe(expected.title);
  }
  if (expected.detail) {
    expect(problem.detail).toContain(expected.detail);
  }
}

// =============================================================================
// FIXTURES
// =============================================================================

export const fixtures = {
  rentalObject: {
    id: 'test-rental-001',
    name: 'Test Idrettshall',
    slug: 'test-idrettshall',
    categoryKey: 'LOKALER_OG_BANER',
    tenantId: 'test-tenant',
    capacity: 50,
    status: 'published',
  },
  booking: {
    id: 'test-booking-001',
    rentalObjectId: 'test-rental-001',
    userId: 'test-citizen-001',
    startTime: new Date('2026-02-01T10:00:00Z'),
    endTime: new Date('2026-02-01T12:00:00Z'),
    status: 'confirmed',
  },
  organization: {
    id: 'test-org-001',
    name: 'Test Idrettslag',
    tenantId: 'test-tenant',
  },
};

// =============================================================================
// TIME HELPERS (for deterministic tests)
// =============================================================================

export function freezeTime(date: Date): () => void {
  const originalNow = Date.now;
  Date.now = () => date.getTime();
  return () => {
    Date.now = originalNow;
  };
}

export const testNow = new Date('2026-01-20T12:00:00Z');
