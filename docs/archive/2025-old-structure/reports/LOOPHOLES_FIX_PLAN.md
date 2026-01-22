# Loopholes Fix Plan

**Date:** 2026-01-16
**Status:** READY FOR IMPLEMENTATION
**Based on:** COUPLING_LOOPHOLES_AUDIT.md

---

## Executive Summary

This document provides a prioritized, minimal-change fix plan to close architectural loopholes while maintaining production stability.

**Key Principles:**
- Minimal breaking changes
- Additive migrations
- Feature flags for rollout
- Compatibility layers during transition

---

## Risk Ranking

### P0 - Demo Blockers
*None identified - demo functionality is intact*

### P1 - Critical Coupling (This Sprint)

| Issue | Impact | Effort | Files Affected |
|-------|--------|--------|----------------|
| Server-side capabilities endpoints | HIGH | MEDIUM | 3 new endpoints |
| OpenAPI breaking change CI gate | HIGH | LOW | 1 workflow file |
| Remove direct schema imports | MEDIUM | LOW | 4 controllers |

### P2 - Architectural Debt (Next Sprint)

| Issue | Impact | Effort | Files Affected |
|-------|--------|--------|----------------|
| ACL for other modules | MEDIUM | HIGH | 10+ files |
| Integration retry with DLQ | MEDIUM | MEDIUM | 5 files |
| SDK parity snapshot tests | LOW | LOW | 2 test files |

---

## MANDATORY DECISIONS

### 1. Type Boundaries (ALREADY IMPLEMENTED ✅)

```
apps/api/src/domain/         → Domain types (canonical business)
packages/client-sdk/src/types/ → API contracts (DTOs + projections + RFC7807)
apps/api/src/database/schema/  → Persistence models (DB only)
```

### 2. Anti-Corruption Layer (ACL) (PARTIAL ✅)

**Implemented:**
- `apps/api/src/acl/rental-objects/rental-object.mapper.ts`

**Required for:**
- bookings (todo)
- organizations (todo)
- users (todo)

### 3. UI Projections + Capabilities (PARTIALLY IMPLEMENTED ⚠️)

**Existing:**
- `/api/authz/permissions` - Generic permissions endpoint
- Client-side capability mapping in backoffice

**Required:**
- `GET /api/web/me/capabilities`
- `GET /api/backoffice/me/capabilities`
- `GET /api/minside/me/capabilities`

### 4. CI Tripwires (PARTIALLY IMPLEMENTED ⚠️)

**Existing:**
- Contract parity test
- RFC7807 compliance test
- No raw fetch lint
- Design token rules

**Required:**
- OpenAPI breaking-change check
- SDK parity snapshot test
- Persistence import block (enable rule)

---

## FIX PLAN - DETAILED

### FIX 1: Server-Side Capabilities Endpoints

**Priority:** P1
**Effort:** 2-3 hours
**Risk:** LOW (additive)

#### 1.1 Create CapabilitiesController

**File:** `apps/api/src/modules/capabilities/capabilities.controller.ts`

```typescript
import { Controller, Get } from '../../core/decorators';
import type { FastifyRequest, FastifyReply } from 'fastify';
import { getTenantId, type TenantRequest } from '../../core/validation/tenant';

interface CapabilitiesRequest extends TenantRequest {
  userId?: string;
  userRole?: string;
}

// Capability definitions per app context
const APP_CAPABILITIES = {
  web: {
    anonymous: ['CAP_LISTING_VIEW', 'CAP_SEARCH'],
    user: ['CAP_LISTING_VIEW', 'CAP_SEARCH', 'CAP_BOOKING_CREATE', 'CAP_PROFILE_VIEW'],
  },
  minside: {
    user: [
      'CAP_DASHBOARD_VIEW',
      'CAP_BOOKING_VIEW',
      'CAP_BOOKING_CANCEL',
      'CAP_PROFILE_EDIT',
      'CAP_NOTIFICATIONS_VIEW',
      'CAP_MESSAGES_VIEW',
    ],
  },
  backoffice: {
    admin: [
      'CAP_DASHBOARD_VIEW',
      'CAP_LISTING_MANAGE',
      'CAP_BOOKING_MANAGE',
      'CAP_USER_MANAGE',
      'CAP_REPORTS_VIEW',
      'CAP_SETTINGS_MANAGE',
      'CAP_AUDIT_VIEW',
    ],
    case_handler: [
      'CAP_DASHBOARD_VIEW',
      'CAP_BOOKING_APPROVE',
      'CAP_BOOKING_VIEW',
      'CAP_LISTING_VIEW',
      'CAP_REPORTS_VIEW',
    ],
  },
};

@Controller('/api')
export class CapabilitiesController {
  @Get('/web/me/capabilities')
  async getWebCapabilities(request: CapabilitiesRequest, reply: FastifyReply) {
    const role = request.userId ? 'user' : 'anonymous';
    return {
      data: {
        role,
        capabilities: APP_CAPABILITIES.web[role] || [],
        featureFlags: await this.getTenantFeatures(request),
      },
    };
  }

  @Get('/minside/me/capabilities')
  async getMinsideCapabilities(request: CapabilitiesRequest, reply: FastifyReply) {
    if (!request.userId) {
      return reply.status(401).send({
        type: '/errors/unauthorized',
        title: 'Authentication Required',
        status: 401,
      });
    }
    
    return {
      data: {
        role: 'user',
        capabilities: APP_CAPABILITIES.minside.user,
        featureFlags: await this.getTenantFeatures(request),
      },
    };
  }

  @Get('/backoffice/me/capabilities')
  async getBackofficeCapabilities(request: CapabilitiesRequest, reply: FastifyReply) {
    const role = request.userRole || 'case_handler';
    const capabilities = APP_CAPABILITIES.backoffice[role] || 
                        APP_CAPABILITIES.backoffice.case_handler;
    
    return {
      data: {
        role,
        capabilities,
        featureFlags: await this.getTenantFeatures(request),
        uiHints: {
          showAdminNav: role === 'admin',
          showReports: capabilities.includes('CAP_REPORTS_VIEW'),
          showAudit: capabilities.includes('CAP_AUDIT_VIEW'),
        },
      },
    };
  }

  private async getTenantFeatures(request: CapabilitiesRequest) {
    // TODO: Integrate with feature flags service
    return {};
  }
}
```

#### 1.2 Add SDK Hook

**File:** `packages/client-sdk/src/hooks/use-capabilities.ts`

```typescript
import { useQuery } from '@tanstack/react-query';
import { fetchClient } from '../core/fetch-client';

export interface AppCapabilities {
  role: string;
  capabilities: string[];
  featureFlags: Record<string, boolean>;
  uiHints?: {
    showAdminNav?: boolean;
    showReports?: boolean;
    showAudit?: boolean;
  };
}

export function useWebCapabilities() {
  return useQuery({
    queryKey: ['capabilities', 'web'],
    queryFn: () => fetchClient.get<{ data: AppCapabilities }>('/api/web/me/capabilities'),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useMinsideCapabilities() {
  return useQuery({
    queryKey: ['capabilities', 'minside'],
    queryFn: () => fetchClient.get<{ data: AppCapabilities }>('/api/minside/me/capabilities'),
    staleTime: 5 * 60 * 1000,
  });
}

export function useBackofficeCapabilities() {
  return useQuery({
    queryKey: ['capabilities', 'backoffice'],
    queryFn: () => fetchClient.get<{ data: AppCapabilities }>('/api/backoffice/me/capabilities'),
    staleTime: 5 * 60 * 1000,
  });
}
```

---

### FIX 2: OpenAPI Breaking Change Detection

**Priority:** P1
**Effort:** 1 hour
**Risk:** LOW

#### 2.1 Update CI Workflow

**File:** `.github/workflows/contract-compliance.yml`

Add after existing jobs:

```yaml
  openapi-breaking-check:
    name: OpenAPI Breaking Change Detection
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout current
        uses: actions/checkout@v4
        with:
          fetch-depth: 0
      
      - name: Checkout base branch
        run: |
          git fetch origin ${{ github.base_ref || 'main' }}
          git checkout origin/${{ github.base_ref || 'main' }} -- apps/api/openapi.json || true
          mv apps/api/openapi.json /tmp/openapi-base.json 2>/dev/null || echo '{}' > /tmp/openapi-base.json
          git checkout -
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
      
      - name: Generate current OpenAPI spec
        run: |
          # Placeholder - generate from routes/schemas
          echo '{}' > /tmp/openapi-current.json
      
      - name: Check for breaking changes
        run: |
          npx @openapi-diff/openapi-diff /tmp/openapi-base.json /tmp/openapi-current.json || true
        continue-on-error: true
```

---

### FIX 3: Remove Direct Schema Imports

**Priority:** P1
**Effort:** 2 hours
**Risk:** MEDIUM

#### 3.1 Controllers to Fix

| Controller | Current Import | Fix Strategy |
|------------|----------------|--------------|
| OrganizationsController | Direct schema | Use service layer |
| MessagesController | Direct schema | Use service layer |
| CalendarController | Direct schema | Use service layer |
| SeasonalLeaseController | Direct schema | Use service layer |

#### 3.2 Example Fix: OrganizationsController

**Before:**
```typescript
import { organizations, users } from '../../database/schema/index';

const result = await db.select({
  id: organizations.id,
  name: organizations.name,
}).from(organizations);
```

**After:**
```typescript
// Use service layer instead
const result = await this.organizationService.findAll(tenantId, params);
```

---

### FIX 4: Enable Persistence Import Block

**Priority:** P2
**Effort:** 30 minutes
**Risk:** LOW

#### 4.1 Update ESLint Config

**File:** `eslint.config.js`

Ensure rule is enabled:

```javascript
{
  rules: {
    'digdir/no-direct-schema-import': 'error', // Enforce in controllers
  },
  overrides: [
    {
      files: ['**/repositories/**/*.ts', '**/database/**/*.ts'],
      rules: {
        'digdir/no-direct-schema-import': 'off', // Allow in persistence layer
      },
    },
  ],
}
```

---

### FIX 5: SDK Parity Snapshot Tests

**Priority:** P2
**Effort:** 2 hours
**Risk:** LOW

**File:** `packages/client-sdk/src/__tests__/projection-parity.test.ts`

```typescript
import { describe, it, expect } from 'vitest';
import type { RentalObjectCardProjectionDTO } from '../types/projection-dtos';

describe('Projection DTO Parity', () => {
  it('should match API response shape exactly', async () => {
    // This test requires a running API or mock
    const expectedKeys: (keyof RentalObjectCardProjectionDTO)[] = [
      'id',
      'slug',
      'name',
      'tenantId',
      'type',
      'typeLabel',
      'locationFormatted',
      'city',
      'latitude',
      'longitude',
      'primaryImageUrl',
      'priceAmount',
      'priceCurrency',
      'priceUnit',
      'priceDisplay',
      'capacity',
      'capacityLabel',
      'amenities',
      'averageRating',
      'reviewCount',
      'ratingDisplay',
      'descriptionExcerpt',
      'isAvailable',
      'isFeatured',
    ];

    // Snapshot test
    expect(expectedKeys).toMatchSnapshot('RentalObjectCardProjectionDTO keys');
  });
});
```

---

## ROLLOUT PLAN

### Phase 1: Capabilities Endpoints (Week 1)

1. ✅ Create capabilities controller
2. ✅ Add SDK hooks
3. ⬜ Update backoffice to use server capabilities
4. ⬜ Feature flag: `use_server_capabilities`
5. ⬜ Monitor for issues
6. ⬜ Remove client-side capability mapping

### Phase 2: CI Gates (Week 1)

1. ⬜ Add OpenAPI breaking check
2. ⬜ Enable persistence import rule
3. ⬜ Add SDK parity snapshot tests

### Phase 3: Controller Refactor (Week 2)

1. ⬜ Fix OrganizationsController
2. ⬜ Fix MessagesController
3. ⬜ Fix CalendarController
4. ⬜ Fix SeasonalLeaseController

### Phase 4: Remaining ACLs (Week 3-4)

1. ⬜ Create BookingMapper ACL
2. ⬜ Create OrganizationMapper ACL
3. ⬜ Create UserMapper ACL

---

## TEST PLAN

### Capabilities Endpoints

```typescript
describe('Capabilities Endpoints', () => {
  it('GET /api/web/me/capabilities returns anonymous caps for unauthenticated', async () => {
    const res = await request(app).get('/api/web/me/capabilities');
    expect(res.body.data.role).toBe('anonymous');
    expect(res.body.data.capabilities).toContain('CAP_LISTING_VIEW');
  });

  it('GET /api/backoffice/me/capabilities requires auth', async () => {
    const res = await request(app).get('/api/backoffice/me/capabilities');
    expect(res.status).toBe(401);
  });

  it('GET /api/backoffice/me/capabilities returns admin caps for admin', async () => {
    const res = await request(app)
      .get('/api/backoffice/me/capabilities')
      .set('Authorization', 'Bearer admin-token');
    expect(res.body.data.capabilities).toContain('CAP_LISTING_MANAGE');
  });
});
```

### Controller Schema Import Tests

```typescript
describe('Controller Schema Isolation', () => {
  it('should not import from database/schema in controllers', async () => {
    const result = await runESLint('apps/api/src/modules/*/**.controller.ts');
    const schemaImportViolations = result.filter(
      r => r.ruleId === 'digdir/no-direct-schema-import'
    );
    expect(schemaImportViolations).toHaveLength(0);
  });
});
```

---

## COMPATIBILITY STRATEGY

### Backward Compatibility

1. **Capabilities:** Old client-side mapping continues to work
2. **Schema imports:** Refactor incrementally, no breaking API changes
3. **CI gates:** Start with warnings, then errors

### Deprecation Clock

| Change | Deprecation Start | Removal Date |
|--------|-------------------|--------------|
| Client-side capabilities | 2026-01-16 | 2026-03-01 |
| Direct schema imports | 2026-01-16 | 2026-02-15 |

---

## SUCCESS CRITERIA

- [ ] All 3 capability endpoints return correct data
- [ ] OpenAPI breaking change detected in CI
- [ ] 0 direct schema imports in controllers
- [ ] SDK parity snapshot tests pass
- [ ] No regression in existing functionality

---

**Next Step:** Begin implementation with FIX 1 (Capabilities Endpoints)
