# ACL Implementation - Comprehensive Testing Strategy

**Date:** 2026-01-16
**Goal:** 100% test coverage across all testing dimensions
**Current Status:** 99/99 tests passing (must maintain)
**Target:** 99 existing + 150+ new ACL tests = 249+ total passing tests

---

## Executive Summary

This document defines a **7-dimensional testing strategy** for ACL implementation:
1. **Unit Tests** - Mapper logic, permission resolution (Target: 100% code coverage)
2. **Integration Tests** - API → Service → Repository → ACL flow (Target: All endpoints)
3. **Security/Penetration Tests** - Bypass prevention, injection attacks (Target: OWASP Top 10)
4. **Performance Tests** - Permission check latency, query optimization (Target: <50ms p95)
5. **E2E Tests (Playwright)** - Full user journeys with ACL (Target: 4 roles × 5 journeys)
6. **User Story Tests** - BDD-style acceptance tests (Target: All user stories)
7. **Regression Tests** - Maintain 99 existing tests (Target: 100% pass rate)

**Total Estimated Tests:** 150+ new tests across all dimensions

---

## 1. UNIT TESTS (50+ tests)

### 1.1 Test Structure

```
tests/unit/acl/
├── acl-mapper.test.ts                    # Core mapper logic (15 tests)
├── acl-permission-resolver.test.ts       # Permission resolution (10 tests)
├── acl-role-mapper.test.ts              # Role to permission mapping (8 tests)
├── acl-filter-builder.test.ts           # SQL filter generation (12 tests)
├── acl-cache.test.ts                    # Permission caching (5 tests)
└── acl-audit-logger.test.ts             # ACL audit logging (5 tests)
```

### 1.2 Core Mapper Unit Tests

**File:** `tests/unit/acl/acl-mapper.test.ts`

**Coverage Requirements:**
- All public methods: 100%
- All private helper methods: 100%
- All branches (if/else, switch): 100%
- All error paths: 100%

**Test Categories:**

#### A. Transformation Tests (5 tests)
```typescript
describe('AclMapper - Transformations', () => {
  it('should transform DB entity to domain model', () => {
    const dbEntity = createMockDbRentalObject();
    const domain = mapper.toDomain(dbEntity);
    expect(domain).toMatchSnapshot();
  });

  it('should transform domain to projection DTO', () => {
    const domain = createMockDomainRentalObject();
    const projection = mapper.toCardProjection(domain, { role: 'CITIZEN' });
    expect(projection.canBook).toBeDefined();
    expect(projection.canEdit).toBeDefined();
  });

  it('should compute permissions correctly', () => {
    const domain = createMockDomainRentalObject();
    const adminProjection = mapper.toCardProjection(domain, { role: 'ADMIN' });
    const citizenProjection = mapper.toCardProjection(domain, { role: 'CITIZEN' });

    expect(adminProjection.canEdit).toBe(true);
    expect(citizenProjection.canEdit).toBe(false);
  });

  it('should handle null values gracefully', () => {
    const dbEntity = { ...createMockDbRentalObject(), organizationId: null };
    const domain = mapper.toDomain(dbEntity);
    expect(domain.organizationId).toBeUndefined();
  });

  it('should validate input data', () => {
    const invalidEntity = { id: 'invalid', /* missing required fields */ };
    expect(() => mapper.toDomain(invalidEntity as any)).toThrow();
  });
});
```

#### B. Permission Resolution Tests (10 tests)
```typescript
describe('AclMapper - Permission Resolution', () => {
  const roles = ['CITIZEN', 'CASEWORKER', 'ADMIN', 'SAAS_ADMIN'];

  describe('View Permission', () => {
    it.each(roles)('should resolve view permission for %s', (role) => {
      const canView = mapper.hasPermission(role, 'rental_objects.view');
      expect(canView).toBe(true); // All roles can view published objects
    });
  });

  describe('Edit Permission', () => {
    it('should allow ADMIN to edit', () => {
      expect(mapper.hasPermission('ADMIN', 'rental_objects.edit')).toBe(true);
    });

    it('should block CITIZEN from editing', () => {
      expect(mapper.hasPermission('CITIZEN', 'rental_objects.edit')).toBe(false);
    });

    it('should allow CASEWORKER to edit if owns organization', () => {
      const context = { role: 'CASEWORKER', organizationId: 'org-123' };
      const rentalObject = { organizationId: 'org-123' };
      expect(mapper.canEdit(context, rentalObject)).toBe(true);
    });

    it('should block CASEWORKER from editing other org objects', () => {
      const context = { role: 'CASEWORKER', organizationId: 'org-123' };
      const rentalObject = { organizationId: 'org-456' };
      expect(mapper.canEdit(context, rentalObject)).toBe(false);
    });
  });

  describe('Delete Permission', () => {
    it('should only allow ADMIN to delete', () => {
      expect(mapper.hasPermission('ADMIN', 'rental_objects.delete')).toBe(true);
      expect(mapper.hasPermission('CASEWORKER', 'rental_objects.delete')).toBe(false);
      expect(mapper.hasPermission('CITIZEN', 'rental_objects.delete')).toBe(false);
    });
  });

  describe('Book Permission', () => {
    it('should allow CITIZEN to book if object is bookable', () => {
      const context = { role: 'CITIZEN', userId: 'user-123' };
      const rentalObject = { status: 'published', requiresApproval: false };
      expect(mapper.canBook(context, rentalObject)).toBe(true);
    });

    it('should block booking on draft objects', () => {
      const context = { role: 'CITIZEN', userId: 'user-123' };
      const rentalObject = { status: 'draft' };
      expect(mapper.canBook(context, rentalObject)).toBe(false);
    });
  });
});
```

### 1.3 Filter Builder Unit Tests

**File:** `tests/unit/acl/acl-filter-builder.test.ts`

```typescript
describe('AclFilterBuilder', () => {
  describe('buildRowLevelFilter', () => {
    it('should add organizationId filter for CASEWORKER', () => {
      const context = { role: 'CASEWORKER', organizationId: 'org-123' };
      const filter = builder.buildRowLevelFilter(context, 'rental_objects');

      expect(filter).toContainEqual({
        field: 'organizationId',
        operator: 'eq',
        value: 'org-123',
      });
    });

    it('should add status=published filter for CITIZEN', () => {
      const context = { role: 'CITIZEN', userId: 'user-123' };
      const filter = builder.buildRowLevelFilter(context, 'rental_objects');

      expect(filter).toContainEqual({
        field: 'status',
        operator: 'eq',
        value: 'published',
      });
    });

    it('should not add filters for ADMIN (full access)', () => {
      const context = { role: 'ADMIN', userId: 'user-123' };
      const filter = builder.buildRowLevelFilter(context, 'rental_objects');

      expect(filter).toHaveLength(0);
    });
  });

  describe('buildFieldMask', () => {
    it('should mask pricing fields for guests', () => {
      const context = { role: 'GUEST' };
      const mask = builder.buildFieldMask(context, 'rental_objects');

      expect(mask).not.toContain('pricing');
      expect(mask).not.toContain('internalNotes');
    });

    it('should not mask fields for ADMIN', () => {
      const context = { role: 'ADMIN' };
      const mask = builder.buildFieldMask(context, 'rental_objects');

      expect(mask).toContain('pricing');
      expect(mask).toContain('internalNotes');
    });
  });
});
```

### 1.4 Coverage Targets

| File | Statements | Branches | Functions | Lines |
|------|-----------|----------|-----------|-------|
| acl-mapper.ts | 100% | 100% | 100% | 100% |
| acl-permission-resolver.ts | 100% | 100% | 100% | 100% |
| acl-filter-builder.ts | 100% | 100% | 100% | 100% |
| acl-cache.ts | 95% | 90% | 100% | 95% |

**Enforcement:** Vitest coverage thresholds in `vitest.config.ts`:

```typescript
coverage: {
  provider: 'v8',
  reporter: ['text', 'json', 'html'],
  lines: 100,
  functions: 100,
  branches: 100,
  statements: 100,
  include: ['apps/api/src/acl/**/*.ts'],
  exclude: ['**/*.test.ts', '**/*.spec.ts'],
}
```

---

## 2. INTEGRATION TESTS (40+ tests)

### 2.1 Test Structure

```
tests/integration/
├── acl-flow.test.ts                     # Full auth → ACL → resource flow (20 tests)
├── acl-multi-tenant.test.ts             # Tenant isolation verification (8 tests)
├── acl-rbac-endpoints.test.ts           # All endpoints × 4 roles (12 tests)
└── acl-audit-integration.test.ts        # ACL actions logged correctly (5 tests)
```

### 2.2 ACL Flow Integration Tests

**File:** `tests/integration/acl-flow.test.ts`

```typescript
const API_URL = process.env.API_URL || 'http://localhost:4000';
const TEST_TENANT_ID = 'd0000000-0000-0000-0000-000000000001';

describe('ACL Integration Flow', () => {
  let sessionCookies: Map<string, string> = new Map();

  async function loginAs(role: string) {
    const response = await fetch(`${API_URL}/api/auth/test-login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role, tenantId: TEST_TENANT_ID }),
    });
    const cookie = response.headers.get('set-cookie');
    sessionCookies.set(role, cookie || '');
    return cookie;
  }

  async function makeRequest(endpoint: string, role: string, method = 'GET') {
    const cookie = sessionCookies.get(role);
    return fetch(`${API_URL}${endpoint}`, {
      method,
      headers: {
        ...(cookie ? { Cookie: cookie } : {}),
        'Content-Type': 'application/json',
      },
    });
  }

  describe('Citizen Role', () => {
    beforeEach(async () => {
      await loginAs('CITIZEN');
    });

    it('should list published rental objects', async () => {
      const response = await makeRequest('/api/rental-objects', 'CITIZEN');
      expect(response.status).toBe(200);

      const body = await response.json();
      expect(body.data).toBeInstanceOf(Array);

      // All objects should be published (ACL filter)
      body.data.forEach((obj: any) => {
        expect(obj.status).toBe('published');
      });
    });

    it('should not see draft objects', async () => {
      const response = await makeRequest('/api/rental-objects?status=draft', 'CITIZEN');
      const body = await response.json();

      // ACL should override query param
      expect(body.data).toHaveLength(0);
    });

    it('should see canBook=true on bookable objects', async () => {
      const response = await makeRequest('/api/rental-objects', 'CITIZEN');
      const body = await response.json();

      const bookableObject = body.data.find((obj: any) => obj.status === 'published');
      expect(bookableObject.canBook).toBe(true);
    });

    it('should see canEdit=false', async () => {
      const response = await makeRequest('/api/rental-objects', 'CITIZEN');
      const body = await response.json();

      body.data.forEach((obj: any) => {
        expect(obj.canEdit).toBe(false);
      });
    });

    it('should be blocked from creating rental objects', async () => {
      const response = await makeRequest('/api/rental-objects', 'CITIZEN', 'POST');
      expect([401, 403]).toContain(response.status);
    });

    it('should be blocked from deleting rental objects', async () => {
      const response = await makeRequest('/api/rental-objects/r0000000-0000-0000-0000-000000000001', 'CITIZEN', 'DELETE');
      expect([401, 403]).toContain(response.status);
    });
  });

  describe('Caseworker Role', () => {
    beforeEach(async () => {
      await loginAs('CASEWORKER');
    });

    it('should list all rental objects in tenant', async () => {
      const response = await makeRequest('/api/rental-objects', 'CASEWORKER');
      expect(response.status).toBe(200);

      const body = await response.json();
      expect(body.data.length).toBeGreaterThan(0);
    });

    it('should see canEdit=true on owned objects', async () => {
      // Assuming caseworker owns organization 'org-123'
      const response = await makeRequest('/api/rental-objects', 'CASEWORKER');
      const body = await response.json();

      const ownedObject = body.data.find((obj: any) => obj.organizationId === 'org-123');
      if (ownedObject) {
        expect(ownedObject.canEdit).toBe(true);
      }
    });

    it('should see canEdit=false on other org objects', async () => {
      const response = await makeRequest('/api/rental-objects', 'CASEWORKER');
      const body = await response.json();

      const otherOrgObject = body.data.find((obj: any) => obj.organizationId !== 'org-123');
      if (otherOrgObject) {
        expect(otherOrgObject.canEdit).toBe(false);
      }
    });

    it('should be allowed to approve bookings', async () => {
      const response = await makeRequest('/api/bookings/b0000000-0000-0000-0000-000000000001/approve', 'CASEWORKER', 'PATCH');
      // 200 if exists, 404 if not - but NOT 403
      expect(response.status).not.toBe(403);
    });
  });

  describe('Admin Role', () => {
    beforeEach(async () => {
      await loginAs('ADMIN');
    });

    it('should see all rental objects (no ACL filter)', async () => {
      const response = await makeRequest('/api/rental-objects', 'ADMIN');
      expect(response.status).toBe(200);

      const body = await response.json();
      expect(body.data.length).toBeGreaterThanOrEqual(42); // Demo seed has 42
    });

    it('should see canEdit=true on all objects', async () => {
      const response = await makeRequest('/api/rental-objects', 'ADMIN');
      const body = await response.json();

      body.data.forEach((obj: any) => {
        expect(obj.canEdit).toBe(true);
      });
    });

    it('should be allowed to create rental objects', async () => {
      const response = await makeRequest('/api/rental-objects', 'ADMIN', 'POST');
      // 201 if created, 400 if validation fails - but NOT 403
      expect(response.status).not.toBe(403);
    });

    it('should be allowed to delete rental objects', async () => {
      const response = await makeRequest('/api/rental-objects/r0000000-0000-0000-0000-000000000001', 'ADMIN', 'DELETE');
      // 204 if deleted, 404 if not found - but NOT 403
      expect(response.status).not.toBe(403);
    });
  });
});
```

### 2.3 Multi-Tenant Isolation Tests

**File:** `tests/integration/acl-multi-tenant.test.ts`

```typescript
describe('ACL Multi-Tenant Isolation', () => {
  const TENANT_A = 'd0000000-0000-0000-0000-000000000001';
  const TENANT_B = 'd0000000-0000-0000-0000-000000000002';

  it('should not leak data across tenants', async () => {
    // Login as Tenant A user
    const cookieA = await loginAs('CITIZEN', TENANT_A);
    const responseA = await fetch(`${API_URL}/api/rental-objects`, {
      headers: { Cookie: cookieA },
    });
    const bodyA = await responseA.json();

    // All objects should belong to Tenant A
    bodyA.data.forEach((obj: any) => {
      expect(obj.tenantId).toBe(TENANT_A);
    });

    // Login as Tenant B user
    const cookieB = await loginAs('CITIZEN', TENANT_B);
    const responseB = await fetch(`${API_URL}/api/rental-objects`, {
      headers: { Cookie: cookieB },
    });
    const bodyB = await responseB.json();

    // All objects should belong to Tenant B
    bodyB.data.forEach((obj: any) => {
      expect(obj.tenantId).toBe(TENANT_B);
    });

    // No overlap
    const idsA = bodyA.data.map((obj: any) => obj.id);
    const idsB = bodyB.data.map((obj: any) => obj.id);
    const overlap = idsA.filter((id: string) => idsB.includes(id));
    expect(overlap).toHaveLength(0);
  });

  it('should block cross-tenant resource access', async () => {
    // Tenant A user tries to access Tenant B resource
    const cookieA = await loginAs('CITIZEN', TENANT_A);
    const tenantBResourceId = 'r0000042-0000-0000-0000-000000000002'; // Belongs to Tenant B

    const response = await fetch(`${API_URL}/api/rental-objects/${tenantBResourceId}`, {
      headers: { Cookie: cookieA },
    });

    expect(response.status).toBe(404); // Not found (ACL filtered)
  });
});
```

---

## 3. SECURITY / PENETRATION TESTS (20+ tests)

### 3.1 Test Structure

```
tests/security/
├── acl-bypass-attempts.test.ts          # Permission bypass prevention (10 tests)
├── acl-injection-attacks.test.ts        # SQL/NoSQL injection (5 tests)
├── acl-privilege-escalation.test.ts     # Role elevation attacks (5 tests)
└── acl-owasp-top10.test.ts             # OWASP Top 10 coverage (10 tests)
```

### 3.2 ACL Bypass Prevention Tests

**File:** `tests/security/acl-bypass-attempts.test.ts`

```typescript
describe('ACL Bypass Prevention', () => {
  describe('Query Parameter Manipulation', () => {
    it('should reject status override by citizen', async () => {
      const cookie = await loginAs('CITIZEN');

      // Try to view draft objects via query param
      const response = await fetch(`${API_URL}/api/rental-objects?status=draft`, {
        headers: { Cookie: cookie },
      });

      const body = await response.json();
      // ACL should override query param - no drafts visible
      const hasDrafts = body.data.some((obj: any) => obj.status === 'draft');
      expect(hasDrafts).toBe(false);
    });

    it('should reject tenantId override', async () => {
      const cookie = await loginAs('CITIZEN', TENANT_A);

      // Try to access Tenant B resources
      const response = await fetch(`${API_URL}/api/rental-objects?tenantId=${TENANT_B}`, {
        headers: { Cookie: cookie },
      });

      const body = await response.json();
      // Should still only see Tenant A resources
      body.data.forEach((obj: any) => {
        expect(obj.tenantId).toBe(TENANT_A);
      });
    });

    it('should reject limit bypass', async () => {
      const cookie = await loginAs('CITIZEN');

      // Try to request excessive data
      const response = await fetch(`${API_URL}/api/rental-objects?limit=999999`, {
        headers: { Cookie: cookie },
      });

      const body = await response.json();
      // Should be capped at max limit (e.g., 100)
      expect(body.data.length).toBeLessThanOrEqual(100);
    });
  });

  describe('Header Manipulation', () => {
    it('should reject X-Tenant-Id header injection', async () => {
      const cookie = await loginAs('CITIZEN', TENANT_A);

      const response = await fetch(`${API_URL}/api/rental-objects`, {
        headers: {
          Cookie: cookie,
          'X-Tenant-Id': TENANT_B, // Try to inject different tenant
        },
      });

      const body = await response.json();
      body.data.forEach((obj: any) => {
        expect(obj.tenantId).toBe(TENANT_A); // Should use session tenant
      });
    });

    it('should reject X-User-Id header injection', async () => {
      const cookie = await loginAs('CITIZEN');

      const response = await fetch(`${API_URL}/api/rental-objects`, {
        headers: {
          Cookie: cookie,
          'X-User-Id': 'admin-user-id', // Try to impersonate admin
        },
      });

      // Should use session user, not header
      expect(response.status).not.toBe(500); // No internal error from confusion
    });
  });

  describe('Token Manipulation', () => {
    it('should reject modified JWT tokens', async () => {
      const cookie = await loginAs('CITIZEN');

      // Tamper with session token
      const tamperedCookie = cookie.replace('CITIZEN', 'ADMIN');

      const response = await fetch(`${API_URL}/api/rental-objects`, {
        headers: { Cookie: tamperedCookie },
      });

      expect([401, 403]).toContain(response.status);
    });

    it('should reject expired tokens', async () => {
      // Create expired token (mocked)
      const expiredCookie = 'digilist_session=expired_token';

      const response = await fetch(`${API_URL}/api/rental-objects`, {
        headers: { Cookie: expiredCookie },
      });

      expect(response.status).toBe(401);
    });
  });

  describe('Direct API Manipulation', () => {
    it('should block PUT without permission', async () => {
      const cookie = await loginAs('CITIZEN');

      const response = await fetch(`${API_URL}/api/rental-objects/r0000000-0000-0000-0000-000000000001`, {
        method: 'PUT',
        headers: {
          Cookie: cookie,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: 'Hacked Name' }),
      });

      expect(response.status).toBe(403);

      // Verify object not changed
      const verifyResponse = await fetch(`${API_URL}/api/rental-objects/r0000000-0000-0000-0000-000000000001`);
      const body = await verifyResponse.json();
      expect(body.data.name).not.toBe('Hacked Name');
    });

    it('should block DELETE without permission', async () => {
      const cookie = await loginAs('CASEWORKER');

      const response = await fetch(`${API_URL}/api/rental-objects/r0000000-0000-0000-0000-000000000001`, {
        method: 'DELETE',
        headers: { Cookie: cookie },
      });

      expect(response.status).toBe(403);
    });
  });
});
```

### 3.3 SQL Injection Prevention

**File:** `tests/security/acl-injection-attacks.test.ts`

```typescript
describe('ACL Injection Attack Prevention', () => {
  it('should sanitize query parameters', async () => {
    const cookie = await loginAs('CITIZEN');

    // Try SQL injection in search param
    const response = await fetch(`${API_URL}/api/rental-objects?search='; DROP TABLE rental_objects; --`, {
      headers: { Cookie: cookie },
    });

    expect(response.status).toBe(200); // Should not error
    const body = await response.json();
    expect(body.data).toBeInstanceOf(Array); // Should return safe results
  });

  it('should validate organizationId parameter', async () => {
    const cookie = await loginAs('CITIZEN');

    // Try UUID injection
    const response = await fetch(`${API_URL}/api/rental-objects?organizationId=' OR '1'='1`, {
      headers: { Cookie: cookie },
    });

    expect([400, 200]).toContain(response.status);
    if (response.status === 200) {
      const body = await response.json();
      expect(body.data).toHaveLength(0); // Invalid UUID should match nothing
    }
  });
});
```

---

## 4. PERFORMANCE TESTS (15+ tests)

### 4.1 Test Structure

```
tests/performance/
├── acl-permission-check-latency.test.ts  # Permission check speed (5 tests)
├── acl-query-optimization.test.ts        # Query performance (5 tests)
├── acl-cache-efficiency.test.ts          # Cache hit rates (3 tests)
└── acl-load-testing.test.ts             # Concurrent users (2 tests)
```

### 4.2 Permission Check Latency Tests

**File:** `tests/performance/acl-permission-check-latency.test.ts`

```typescript
describe('ACL Permission Check Performance', () => {
  it('should check permission in <50ms (p95)', async () => {
    const iterations = 1000;
    const latencies: number[] = [];

    for (let i = 0; i < iterations; i++) {
      const start = performance.now();
      const canEdit = await aclService.hasPermission('CITIZEN', 'rental_objects.edit');
      const end = performance.now();
      latencies.push(end - start);
    }

    latencies.sort((a, b) => a - b);
    const p95 = latencies[Math.floor(iterations * 0.95)];

    expect(p95).toBeLessThan(50); // 50ms target
  });

  it('should resolve row-level filters in <100ms (p95)', async () => {
    const iterations = 500;
    const latencies: number[] = [];

    for (let i = 0; i < iterations; i++) {
      const start = performance.now();
      const filters = await aclService.getRowFilters('CASEWORKER', 'rental_objects');
      const end = performance.now();
      latencies.push(end - start);
    }

    latencies.sort((a, b) => a - b);
    const p95 = latencies[Math.floor(iterations * 0.95)];

    expect(p95).toBeLessThan(100);
  });

  it('should cache permission checks', async () => {
    // First call (cache miss)
    const start1 = performance.now();
    await aclService.hasPermission('CITIZEN', 'rental_objects.view');
    const latency1 = performance.now() - start1;

    // Second call (cache hit)
    const start2 = performance.now();
    await aclService.hasPermission('CITIZEN', 'rental_objects.view');
    const latency2 = performance.now() - start2;

    // Cache hit should be >10x faster
    expect(latency2).toBeLessThan(latency1 / 10);
  });
});
```

### 4.3 Query Optimization Tests

**File:** `tests/performance/acl-query-optimization.test.ts`

```typescript
describe('ACL Query Optimization', () => {
  it('should not cause N+1 queries', async () => {
    const cookie = await loginAs('CITIZEN');

    // Track query count
    let queryCount = 0;
    const originalQuery = db.query;
    db.query = function(...args: any[]) {
      queryCount++;
      return originalQuery.apply(this, args);
    };

    // Fetch list of 20 objects
    const response = await fetch(`${API_URL}/api/rental-objects?limit=20`, {
      headers: { Cookie: cookie },
    });

    await response.json();

    // Should be 1-2 queries max (1 for data, 1 for count)
    expect(queryCount).toBeLessThanOrEqual(2);
  });

  it('should use indexes for ACL filters', async () => {
    // Run EXPLAIN ANALYZE on ACL query
    const cookie = await loginAs('CASEWORKER');

    const response = await fetch(`${API_URL}/api/rental-objects?explain=true`, {
      headers: { Cookie: cookie },
    });

    const body = await response.json();
    const queryPlan = body.explain;

    // Should use index scans, not sequential scans
    expect(queryPlan).toContain('Index Scan');
    expect(queryPlan).not.toContain('Seq Scan');
  });
});
```

---

## 5. E2E TESTS - PLAYWRIGHT (30+ tests)

### 5.1 Test Structure

```
tests/e2e/acl/
├── citizen-journey.spec.ts              # Citizen user flow (8 tests)
├── caseworker-journey.spec.ts           # Caseworker user flow (8 tests)
├── admin-journey.spec.ts                # Admin user flow (8 tests)
├── permission-boundaries.spec.ts        # UI permission checks (6 tests)
└── visual-regression.spec.ts            # Visual ACL indicators (5 tests)
```

### 5.2 Citizen Journey E2E

**File:** `tests/e2e/acl/citizen-journey.spec.ts`

```typescript
import { test, expect, Page } from '@playwright/test';

test.describe('Citizen ACL Journey', () => {
  test.beforeEach(async ({ page }) => {
    // Login as citizen
    await page.goto('/login');
    await page.fill('[name="email"]', 'citizen@demo.no');
    await page.fill('[name="password"]', 'demo123');
    await page.click('button[type="submit"]');
    await page.waitForURL('/');
  });

  test('should see published rental objects', async ({ page }) => {
    await page.goto('/rental-objects');

    // Should see list
    await expect(page.locator('[data-testid="rental-object-card"]')).toHaveCount(42); // Demo seed

    // All should be published (no draft indicator)
    const draftBadges = page.locator('[data-status="draft"]');
    await expect(draftBadges).toHaveCount(0);
  });

  test('should see "Book" button but not "Edit" button', async ({ page }) => {
    await page.goto('/rental-objects');
    await page.click('[data-testid="rental-object-card"]:first-child');

    // Should see Book button
    await expect(page.getByRole('button', { name: /book/i })).toBeVisible();

    // Should NOT see Edit button
    await expect(page.getByRole('button', { name: /edit/i })).not.toBeVisible();

    // Should NOT see Delete button
    await expect(page.getByRole('button', { name: /delete/i })).not.toBeVisible();
  });

  test('should not access admin pages', async ({ page }) => {
    // Try to navigate to admin page
    await page.goto('/admin/rental-objects');

    // Should redirect to 403 or login
    await expect(page).toHaveURL(/\/(403|login)/);
  });

  test('should book available object', async ({ page }) => {
    await page.goto('/rental-objects');
    await page.click('[data-testid="rental-object-card"]:first-child');

    // Click Book button
    await page.click('button:has-text("Book")');

    // Should show booking modal
    await expect(page.locator('[data-testid="booking-modal"]')).toBeVisible();

    // Fill booking form
    await page.fill('[name="startDate"]', '2026-02-01');
    await page.fill('[name="endDate"]', '2026-02-02');
    await page.click('button:has-text("Confirm")');

    // Should succeed
    await expect(page.locator('text=Booking confirmed')).toBeVisible();
  });

  test('should see "Requires Approval" warning', async ({ page }) => {
    // Navigate to object with requiresApproval=true
    await page.goto('/rental-objects/r0000005-0000-0000-0000-000000000001');

    // Should see warning badge
    await expect(page.locator('[data-testid="requires-approval-badge"]')).toBeVisible();

    // Book button text should indicate approval needed
    await expect(page.getByRole('button', { name: /request booking/i })).toBeVisible();
  });

  test('should not see pricing if masked', async ({ page }) => {
    // Navigate to object with masked pricing
    await page.goto('/rental-objects/r0000010-0000-0000-0000-000000000001');

    // Should not see price
    await expect(page.locator('[data-testid="price"]')).not.toBeVisible();

    // Should see "Contact for pricing" placeholder
    await expect(page.locator('text=Contact for pricing')).toBeVisible();
  });
});
```

### 5.3 Admin Journey E2E

**File:** `tests/e2e/acl/admin-journey.spec.ts`

```typescript
test.describe('Admin ACL Journey', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/admin/login');
    await page.fill('[name="email"]', 'admin@demo.no');
    await page.fill('[name="password"]', 'demo123');
    await page.click('button[type="submit"]');
  });

  test('should see all rental objects including drafts', async ({ page }) => {
    await page.goto('/admin/rental-objects');

    // Should see draft objects
    const draftBadges = page.locator('[data-status="draft"]');
    await expect(draftBadges.first()).toBeVisible();
  });

  test('should see Edit and Delete buttons', async ({ page }) => {
    await page.goto('/admin/rental-objects');
    await page.click('[data-testid="rental-object-row"]:first-child');

    // Should see Edit button
    await expect(page.getByRole('button', { name: /edit/i })).toBeVisible();

    // Should see Delete button
    await expect(page.getByRole('button', { name: /delete/i })).toBeVisible();
  });

  test('should create new rental object', async ({ page }) => {
    await page.goto('/admin/rental-objects');
    await page.click('button:has-text("Create")');

    // Fill form
    await page.fill('[name="name"]', 'Test Venue');
    await page.selectOption('[name="categoryKey"]', 'LOKALER_OG_BANER');
    await page.click('button:has-text("Save")');

    // Should succeed
    await expect(page.locator('text=Created successfully')).toBeVisible();
  });

  test('should delete rental object', async ({ page }) => {
    await page.goto('/admin/rental-objects');

    // Click first Delete button
    await page.click('[data-testid="delete-button"]:first-child');

    // Confirm deletion
    await page.click('button:has-text("Confirm")');

    // Should succeed
    await expect(page.locator('text=Deleted successfully')).toBeVisible();
  });
});
```

---

## 6. USER STORY TESTS (20+ tests)

### 6.1 Test Structure

```
tests/user-stories/
├── us-001-citizen-browse.test.ts        # Citizen browses objects (5 tests)
├── us-002-citizen-book.test.ts          # Citizen books object (5 tests)
├── us-003-caseworker-approve.test.ts    # Caseworker approves (5 tests)
├── us-004-admin-manage.test.ts          # Admin manages objects (5 tests)
└── us-005-acl-enforcement.test.ts       # ACL edge cases (5 tests)
```

### 6.2 User Story Format (BDD-style)

**File:** `tests/user-stories/us-001-citizen-browse.test.ts`

```typescript
describe('User Story 001: Citizen Browses Rental Objects', () => {
  const story = `
    As a citizen
    I want to browse available rental objects
    So that I can find suitable venues for my event
  `;

  describe('Scenario: View published objects only', () => {
    it('Given I am logged in as a citizen', async () => {
      // Setup
      await loginAs('CITIZEN');
    });

    it('When I navigate to rental objects page', async () => {
      const response = await fetch(`${API_URL}/api/rental-objects`);
      expect(response.status).toBe(200);
    });

    it('Then I should see only published objects', async () => {
      const response = await fetch(`${API_URL}/api/rental-objects`);
      const body = await response.json();

      body.data.forEach((obj: any) => {
        expect(obj.status).toBe('published');
      });
    });

    it('And I should not see draft objects', async () => {
      const response = await fetch(`${API_URL}/api/rental-objects`);
      const body = await response.json();

      const hasDrafts = body.data.some((obj: any) => obj.status === 'draft');
      expect(hasDrafts).toBe(false);
    });
  });

  describe('Scenario: Permission indicators', () => {
    it('Then each object should have canBook flag', async () => {
      const response = await fetch(`${API_URL}/api/rental-objects`);
      const body = await response.json();

      body.data.forEach((obj: any) => {
        expect(obj).toHaveProperty('canBook');
      });
    });

    it('And canEdit should be false', async () => {
      const response = await fetch(`${API_URL}/api/rental-objects`);
      const body = await response.json();

      body.data.forEach((obj: any) => {
        expect(obj.canEdit).toBe(false);
      });
    });
  });
});
```

---

## 7. REGRESSION TESTS (Maintain 99 existing)

### 7.1 Strategy

**Goal:** Ensure ACL implementation doesn't break existing functionality

**Approach:**
1. Run existing test suite before ACL implementation (baseline: 99 passing)
2. Run after each ACL phase
3. Fix regressions immediately

**Commands:**
```bash
# Run all existing tests
pnpm test:run

# Run demo readiness tests
pnpm test:run tests/unit/demo-readiness/

# Compare before/after
git diff baseline-test-results.json current-test-results.json
```

### 7.2 Regression Checklist

Before committing ACL changes:
- [ ] All 99 existing tests pass
- [ ] Demo seed still creates 42 objects
- [ ] All 4 roles still defined
- [ ] All API endpoints still respond
- [ ] Projection DTOs still match schema
- [ ] No TypeScript errors
- [ ] Build succeeds
- [ ] Lint passes

---

## 8. TEST EXECUTION PLAN

### 8.1 Pre-Implementation (Baseline)

```bash
# Establish baseline
pnpm test:run > baseline-test-results.txt
pnpm test:coverage > baseline-coverage.json

# Record metrics
echo "99 tests passing" > baseline-metrics.txt
echo "Demo: 42 objects, 4 roles, 5 bookings" >> baseline-metrics.txt
```

### 8.2 During Implementation (Per Phase)

**Phase 1: Foundation**
```bash
# After ACL mapper implementation
pnpm test:run tests/unit/acl/
pnpm test:coverage tests/unit/acl/

# Verify no regressions
pnpm test:run tests/unit/demo-readiness/
```

**Phase 2: Integration**
```bash
# After BaseController implementation
pnpm test:run tests/integration/acl-flow.test.ts

# Verify existing endpoints still work
pnpm test:run tests/unit/rental-objects/
```

**Phase 3: Security**
```bash
# After ACL enforcement
pnpm test:run tests/security/

# Verify no bypass possible
pnpm test:run tests/integration/acl-rbac-endpoints.test.ts
```

### 8.3 Post-Implementation (Verification)

```bash
# Run all tests
pnpm test:run

# Run E2E tests
pnpm test:e2e

# Performance benchmarks
pnpm test:run tests/performance/

# Generate reports
pnpm test:coverage
pnpm test:e2e --reporter=html

# Compare metrics
diff baseline-metrics.txt final-metrics.txt
```

---

## 9. CI/CD INTEGRATION

### 9.1 GitHub Actions Workflow

```yaml
# .github/workflows/acl-test-suite.yml
name: ACL Test Suite

on:
  push:
    branches: [main, acl-implementation]
  pull_request:
    branches: [main]

jobs:
  unit-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: pnpm/action-setup@v2
      - name: Install dependencies
        run: pnpm install
      - name: Run unit tests
        run: pnpm test:run tests/unit/acl/
      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/coverage-final.json
          flags: unit-tests

  integration-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Start API server
        run: docker-compose up -d
      - name: Wait for API
        run: npx wait-on http://localhost:4000/health
      - name: Run integration tests
        run: pnpm test:run tests/integration/acl-flow.test.ts

  security-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Run security tests
        run: pnpm test:run tests/security/
      - name: OWASP ZAP scan
        uses: zaproxy/action-full-scan@v0.4.0

  performance-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Run performance tests
        run: pnpm test:run tests/performance/
      - name: Check performance budget
        run: |
          p95=$(cat performance-report.json | jq '.p95')
          if [ $p95 -gt 50 ]; then
            echo "Performance regression: p95=$p95ms (target: <50ms)"
            exit 1
          fi

  e2e-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Install Playwright
        run: pnpm playwright install
      - name: Run E2E tests
        run: pnpm test:e2e tests/e2e/acl/
      - uses: actions/upload-artifact@v3
        if: failure()
        with:
          name: playwright-report
          path: tests/reports/e2e/

  regression-check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Run existing test suite
        run: pnpm test:run
      - name: Verify 99 tests still pass
        run: |
          passing=$(cat test-results.json | jq '.numPassedTests')
          if [ $passing -lt 99 ]; then
            echo "Regression detected: only $passing tests passing (expected 99)"
            exit 1
          fi
```

---

## 10. TEST METRICS & REPORTING

### 10.1 Coverage Targets

| Test Type | Target | Enforcement |
|-----------|--------|-------------|
| Unit Tests | 100% (ACL code) | vitest coverage threshold |
| Integration Tests | All endpoints covered | Manual checklist |
| Security Tests | OWASP Top 10 covered | Security checklist |
| Performance Tests | <50ms p95 | Automated performance budget |
| E2E Tests | 4 roles × 5 journeys | Playwright suite |
| User Stories | All stories covered | BDD scenario completion |
| Regression Tests | 99 existing pass | CI gate |

### 10.2 Test Dashboard

**Metrics to Track:**
- Total tests: 249+ (99 existing + 150 new)
- Pass rate: 100%
- Coverage: 100% (ACL code)
- Performance: <50ms p95 (permission checks)
- Security: 0 vulnerabilities
- Regressions: 0

**Tools:**
- **Vitest UI:** `pnpm test:ui` - Interactive test runner
- **Playwright Trace Viewer:** `pnpm playwright show-trace` - E2E debugging
- **Coverage Report:** `pnpm test:coverage` - HTML coverage viewer
- **Performance Dashboard:** Custom dashboard with p50/p95/p99 metrics

---

## 11. IMPLEMENTATION CHECKLIST

Before marking ACL implementation complete:

### Unit Tests
- [ ] 50+ unit tests written
- [ ] 100% code coverage on ACL mappers
- [ ] All branches tested
- [ ] All error paths tested

### Integration Tests
- [ ] 40+ integration tests written
- [ ] All 4 roles tested
- [ ] Multi-tenant isolation verified
- [ ] Audit logging verified

### Security Tests
- [ ] 20+ security tests written
- [ ] OWASP Top 10 covered
- [ ] Bypass attempts blocked
- [ ] Injection attacks prevented

### Performance Tests
- [ ] 15+ performance tests written
- [ ] Permission checks <50ms p95
- [ ] Query optimization verified
- [ ] Cache efficiency measured

### E2E Tests
- [ ] 30+ E2E tests written
- [ ] 4 roles × 5 journeys covered
- [ ] Visual regression tests pass
- [ ] Permission boundaries enforced

### User Story Tests
- [ ] 20+ user story tests written
- [ ] All acceptance criteria met
- [ ] BDD scenarios pass

### Regression Tests
- [ ] 99 existing tests still pass
- [ ] Demo readiness maintained
- [ ] No breaking changes

---

## SUMMARY

This comprehensive testing strategy ensures:
- **100% confidence** in ACL implementation
- **0 regressions** in existing functionality
- **Production-ready** security and performance
- **Complete coverage** across all testing dimensions
- **Maintainable** test suite for future changes

**Total Tests:** 249+ (99 existing + 150 new)
**Estimated Effort:** 3 weeks (parallel with implementation)
**Automation:** 90% (unit, integration, E2E automated in CI)
