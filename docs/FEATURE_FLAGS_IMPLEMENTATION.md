# Feature Flags Implementation Plan

**Date**: 2026-01-16  
**Status**: Ready for Implementation  
**Priority**: High (Demo-critical)

---

## Overview

Implement tenant-controlled feature flags to enable:
1. **Category-level access control** (LOCALE, ARRANGEMENT, OTHER)
2. **Module-level feature toggles** (org mgmt, reporting, audit, etc.)
3. **SaaS-ready architecture** (scales to multi-tenant admin)

---

## 1. Database Schema Changes

### Migration: Add Feature Flags to Tenants

```sql
-- File: apps/api/drizzle/0007_tenant_feature_flags.sql

ALTER TABLE tenants 
ADD COLUMN feature_flags JSONB NOT NULL DEFAULT '{}',
ADD COLUMN enabled_rental_object_categories TEXT[] NOT NULL DEFAULT ARRAY['LOCALE', 'ARRANGEMENT']::TEXT[];

-- Create index for faster feature flag queries
CREATE INDEX idx_tenants_feature_flags ON tenants USING GIN (feature_flags);

-- Add comment for documentation
COMMENT ON COLUMN tenants.feature_flags IS 'Tenant-specific feature toggles (backoffice modules, web features, etc.)';
COMMENT ON COLUMN tenants.enabled_rental_object_categories IS 'Allowed rental object categories for this tenant';
```

### Schema Update (TypeScript)

```typescript
// File: apps/api/src/database/schema/index.ts

export const tenants = pgTable('tenants', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull(),
  slug: varchar('slug', { length: 100 }).notNull().unique(),
  domain: varchar('domain', { length: 255 }),
  settings: jsonb('settings').default({}),
  status: varchar('status', { length: 50 }).notNull().default('active'),
  
  // NEW: Feature flags
  featureFlags: jsonb('feature_flags').notNull().default({}),
  enabledRentalObjectCategories: text('enabled_rental_object_categories').array().notNull().default(['LOCALE', 'ARRANGEMENT']),
  
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});
```

---

## 2. Type Definitions

### Feature Flag Types

```typescript
// File: packages/client-sdk/src/types/feature-flags.ts

/**
 * Rental Object Categories
 */
export enum RentalObjectCategory {
  LOCALE = 'LOCALE',           // Rooms/spaces
  ARRANGEMENT = 'ARRANGEMENT', // Events/activities
  EQUIPMENT = 'EQUIPMENT',     // Equipment (future)
  VEHICLE = 'VEHICLE',         // Vehicles (future)
  OTHER = 'OTHER',             // Other (placeholder)
}

/**
 * Feature Flag Keys
 */
export enum FeatureFlag {
  // Backoffice modules
  BACKOFFICE_ORG_MANAGEMENT = 'backoffice.orgManagement',
  BACKOFFICE_REPORTING = 'backoffice.reporting',
  BACKOFFICE_AUDIT_LOG = 'backoffice.auditLog',
  BACKOFFICE_MESSAGING = 'backoffice.messaging',
  BACKOFFICE_MAINTENANCE_CALENDAR = 'backoffice.maintenanceCalendar',
  
  // Web/Public modules
  WEB_RATINGS = 'web.ratings',
  WEB_FEEDBACK = 'web.feedback',
  WEB_PUBLIC_ACTIVITY_CALENDAR = 'web.publicActivityCalendar',
  WEB_PAYMENTS = 'web.payments',
  
  // Rental object features
  RENTAL_OBJECT_RECURRING_BOOKINGS = 'rentalObject.recurringBookings',
  RENTAL_OBJECT_PACKAGES = 'rentalObject.packages',
  RENTAL_OBJECT_DISCOUNTS = 'rentalObject.discounts',
}

/**
 * Feature flags configuration
 */
export interface FeatureFlags {
  [key: string]: boolean;
}

/**
 * Tenant features response
 */
export interface TenantFeatures {
  tenantId: string;
  tenantName: string;
  enabledRentalObjectCategories: RentalObjectCategory[];
  featureFlags: FeatureFlags;
}

/**
 * Default feature flags for new tenants
 */
export const DEFAULT_FEATURE_FLAGS: FeatureFlags = {
  // Backoffice - all enabled by default
  [FeatureFlag.BACKOFFICE_ORG_MANAGEMENT]: true,
  [FeatureFlag.BACKOFFICE_REPORTING]: true,
  [FeatureFlag.BACKOFFICE_AUDIT_LOG]: true,
  [FeatureFlag.BACKOFFICE_MESSAGING]: true,
  [FeatureFlag.BACKOFFICE_MAINTENANCE_CALENDAR]: true,
  
  // Web - selective by default
  [FeatureFlag.WEB_RATINGS]: false,
  [FeatureFlag.WEB_FEEDBACK]: false,
  [FeatureFlag.WEB_PUBLIC_ACTIVITY_CALENDAR]: true,
  [FeatureFlag.WEB_PAYMENTS]: false,
  
  // Rental object features
  [FeatureFlag.RENTAL_OBJECT_RECURRING_BOOKINGS]: true,
  [FeatureFlag.RENTAL_OBJECT_PACKAGES]: true,
  [FeatureFlag.RENTAL_OBJECT_DISCOUNTS]: true,
};

/**
 * Demo tenant preset (Cheyenne Kommune)
 */
export const DEMO_FEATURE_FLAGS: FeatureFlags = {
  // Backoffice - demo-safe subset
  [FeatureFlag.BACKOFFICE_ORG_MANAGEMENT]: true,
  [FeatureFlag.BACKOFFICE_REPORTING]: false,  // Hide for demo
  [FeatureFlag.BACKOFFICE_AUDIT_LOG]: true,
  [FeatureFlag.BACKOFFICE_MESSAGING]: true,
  [FeatureFlag.BACKOFFICE_MAINTENANCE_CALENDAR]: true,
  
  // Web - minimal for demo
  [FeatureFlag.WEB_RATINGS]: false,
  [FeatureFlag.WEB_FEEDBACK]: false,
  [FeatureFlag.WEB_PUBLIC_ACTIVITY_CALENDAR]: true,
  [FeatureFlag.WEB_PAYMENTS]: false,
  
  // Rental object features
  [FeatureFlag.RENTAL_OBJECT_RECURRING_BOOKINGS]: true,
  [FeatureFlag.RENTAL_OBJECT_PACKAGES]: false,
  [FeatureFlag.RENTAL_OBJECT_DISCOUNTS]: false,
};
```

---

## 3. API Implementation

### Feature Flags Service

```typescript
// File: apps/api/src/services/feature-flags.service.ts

import { db } from '../database';
import { tenants } from '../database/schema';
import { eq } from 'drizzle-orm';
import type { TenantFeatures, FeatureFlags } from '@digilist/client-sdk';

export class FeatureFlagsService {
  /**
   * Get tenant features
   */
  async getTenantFeatures(tenantId: string): Promise<TenantFeatures> {
    const tenant = await db.query.tenants.findFirst({
      where: eq(tenants.id, tenantId),
    });

    if (!tenant) {
      throw new Error('Tenant not found');
    }

    return {
      tenantId: tenant.id,
      tenantName: tenant.name,
      enabledRentalObjectCategories: tenant.enabledRentalObjectCategories || ['LOCALE', 'ARRANGEMENT'],
      featureFlags: (tenant.featureFlags as FeatureFlags) || {},
    };
  }

  /**
   * Check if feature is enabled
   */
  async isFeatureEnabled(tenantId: string, featureKey: string): Promise<boolean> {
    const features = await this.getTenantFeatures(tenantId);
    return features.featureFlags[featureKey] === true;
  }

  /**
   * Check if category is enabled
   */
  async isCategoryEnabled(tenantId: string, category: string): Promise<boolean> {
    const features = await this.getTenantFeatures(tenantId);
    return features.enabledRentalObjectCategories.includes(category as any);
  }

  /**
   * Update tenant features (SaaS Admin only)
   */
  async updateTenantFeatures(
    tenantId: string,
    updates: {
      featureFlags?: Partial<FeatureFlags>;
      enabledRentalObjectCategories?: string[];
    }
  ): Promise<TenantFeatures> {
    const current = await this.getTenantFeatures(tenantId);

    await db
      .update(tenants)
      .set({
        featureFlags: updates.featureFlags 
          ? { ...current.featureFlags, ...updates.featureFlags }
          : current.featureFlags,
        enabledRentalObjectCategories: updates.enabledRentalObjectCategories || current.enabledRentalObjectCategories,
        updatedAt: new Date(),
      })
      .where(eq(tenants.id, tenantId));

    return this.getTenantFeatures(tenantId);
  }
}

export const featureFlagsService = new FeatureFlagsService();
```

### API Endpoint

```typescript
// File: apps/api/src/routes/features.routes.ts

import { FastifyPluginAsync } from 'fastify';
import { featureFlagsService } from '../services/feature-flags.service';
import { requireAuth } from '../middleware/auth';

export const featuresRoutes: FastifyPluginAsync = async (fastify) => {
  /**
   * GET /api/me/features
   * Get current tenant's features
   */
  fastify.get('/me/features', {
    preHandler: [requireAuth],
    handler: async (request, reply) => {
      const { tenantId } = request.user;
      
      const features = await featureFlagsService.getTenantFeatures(tenantId);
      
      return reply.send({
        data: features,
      });
    },
  });

  /**
   * PATCH /api/admin/tenants/:tenantId/features
   * Update tenant features (SaaS Admin only)
   */
  fastify.patch('/admin/tenants/:tenantId/features', {
    preHandler: [requireAuth, requireSaasAdmin],
    handler: async (request, reply) => {
      const { tenantId } = request.params as { tenantId: string };
      const updates = request.body as any;
      
      const features = await featureFlagsService.updateTenantFeatures(tenantId, updates);
      
      return reply.send({
        data: features,
      });
    },
  });
};
```

### Middleware: Feature Guard

```typescript
// File: apps/api/src/middleware/feature-guard.ts

import { FastifyRequest, FastifyReply } from 'fastify';
import { featureFlagsService } from '../services/feature-flags.service';

/**
 * Middleware to check if a feature is enabled
 */
export function requireFeature(featureKey: string) {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    const { tenantId } = request.user;
    
    const isEnabled = await featureFlagsService.isFeatureEnabled(tenantId, featureKey);
    
    if (!isEnabled) {
      return reply.status(403).send({
        type: 'https://api.digilist.no/errors/feature-disabled',
        title: 'Feature Disabled',
        status: 403,
        detail: `The feature '${featureKey}' is not enabled for your organization.`,
        instance: request.url,
      });
    }
  };
}

/**
 * Middleware to check if a category is enabled
 */
export function requireCategory(category: string) {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    const { tenantId } = request.user;
    
    const isEnabled = await featureFlagsService.isCategoryEnabled(tenantId, category);
    
    if (!isEnabled) {
      return reply.status(403).send({
        type: 'https://api.digilist.no/errors/category-disabled',
        title: 'Category Disabled',
        status: 403,
        detail: `The rental object category '${category}' is not enabled for your organization.`,
        instance: request.url,
      });
    }
  };
}
```

---

## 4. SDK Integration

### Feature Flags Hook

```typescript
// File: packages/client-sdk/src/hooks/use-features.ts

import { useQuery } from '@tanstack/react-query';
import { getClient } from '../core/client-factory';
import type { TenantFeatures } from '../types/feature-flags';

/**
 * Get tenant features
 */
export function useTenantFeatures() {
  return useQuery({
    queryKey: ['features', 'tenant'],
    queryFn: async () => {
      const response = await getClient().get<{ data: TenantFeatures }>('/api/me/features');
      return response.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Check if a feature is enabled
 */
export function useFeature(featureKey: string): boolean {
  const { data } = useTenantFeatures();
  return data?.featureFlags[featureKey] === true;
}

/**
 * Check if a category is enabled
 */
export function useCategory(category: string): boolean {
  const { data } = useTenantFeatures();
  return data?.enabledRentalObjectCategories.includes(category as any) || false;
}

/**
 * Get enabled categories
 */
export function useEnabledCategories(): string[] {
  const { data } = useTenantFeatures();
  return data?.enabledRentalObjectCategories || [];
}
```

---

## 5. Frontend Integration

### Feature-Gated Component

```typescript
// File: packages/ds/src/components/FeatureGate.tsx

import { useFeature } from '@digilist/client-sdk';

interface FeatureGateProps {
  feature: string;
  fallback?: React.ReactNode;
  children: React.ReactNode;
}

export function FeatureGate({ feature, fallback = null, children }: FeatureGateProps) {
  const isEnabled = useFeature(feature);
  
  if (!isEnabled) {
    return <>{fallback}</>;
  }
  
  return <>{children}</>;
}
```

### Usage in Backoffice

```typescript
// File: apps/backoffice/src/components/Navigation.tsx

import { FeatureGate } from '@xala/ds';
import { FeatureFlag } from '@digilist/client-sdk';

export function Navigation() {
  return (
    <nav>
      <NavItem to="/dashboard">Dashboard</NavItem>
      <NavItem to="/rental-objects">Rental Objects</NavItem>
      <NavItem to="/bookings">Bookings</NavItem>
      
      <FeatureGate feature={FeatureFlag.BACKOFFICE_ORG_MANAGEMENT}>
        <NavItem to="/organizations">Organizations</NavItem>
      </FeatureGate>
      
      <FeatureGate feature={FeatureFlag.BACKOFFICE_REPORTING}>
        <NavItem to="/reports">Reports</NavItem>
      </FeatureGate>
      
      <FeatureGate feature={FeatureFlag.BACKOFFICE_AUDIT_LOG}>
        <NavItem to="/audit">Audit Log</NavItem>
      </FeatureGate>
      
      <FeatureGate feature={FeatureFlag.BACKOFFICE_MESSAGING}>
        <NavItem to="/messages">Messages</NavItem>
      </FeatureGate>
    </nav>
  );
}
```

---

## 6. Seed Data

### Demo Tenant (Cheyenne Kommune)

```typescript
// File: apps/api/src/database/seeds/tenants.seed.ts

import { DEMO_FEATURE_FLAGS, RentalObjectCategory } from '@digilist/client-sdk';

export const demoTenant = {
  name: 'Cheyenne Kommune',
  slug: 'cheyenne',
  enabledRentalObjectCategories: [
    RentalObjectCategory.LOCALE,
    RentalObjectCategory.ARRANGEMENT,
  ],
  featureFlags: DEMO_FEATURE_FLAGS,
};
```

---

## 7. Testing Strategy

### Unit Tests

```typescript
// File: apps/api/src/services/__tests__/feature-flags.service.test.ts

describe('FeatureFlagsService', () => {
  it('should return tenant features', async () => {
    const features = await featureFlagsService.getTenantFeatures('tenant-123');
    expect(features.tenantId).toBe('tenant-123');
    expect(features.enabledRentalObjectCategories).toContain('LOCALE');
  });

  it('should check if feature is enabled', async () => {
    const isEnabled = await featureFlagsService.isFeatureEnabled(
      'tenant-123',
      'backoffice.reporting'
    );
    expect(typeof isEnabled).toBe('boolean');
  });

  it('should reject disabled category', async () => {
    const isEnabled = await featureFlagsService.isCategoryEnabled('tenant-123', 'EQUIPMENT');
    expect(isEnabled).toBe(false);
  });
});
```

---

## 8. Implementation Checklist

### Phase 1: Database & API (Day 1)
- [ ] Create migration `0007_tenant_feature_flags.sql`
- [ ] Update schema types
- [ ] Implement `FeatureFlagsService`
- [ ] Create `/api/me/features` endpoint
- [ ] Add feature guard middleware
- [ ] Seed demo tenant with flags

### Phase 2: SDK & Frontend (Day 2)
- [ ] Add feature flag types to SDK
- [ ] Create `use-features.ts` hooks
- [ ] Build `<FeatureGate>` component
- [ ] Update backoffice navigation
- [ ] Update web app features

### Phase 3: Enforcement (Day 3)
- [ ] Add guards to all protected routes
- [ ] Test category restrictions
- [ ] Test feature restrictions
- [ ] Verify RFC7807 error responses

---

## 9. Acceptance Criteria

✅ **Category Control**
- Tenant with only `LOCALE` cannot create `ARRANGEMENT` rental objects
- API returns 403 with RFC7807 error for disabled categories
- UI hides category options not enabled

✅ **Feature Control**
- Backoffice menu hides disabled modules
- API endpoints return 403 for disabled features
- `/api/me/features` returns correct flags

✅ **Demo Ready**
- Cheyenne tenant has LOCALE + ARRANGEMENT enabled
- Reporting module hidden (demo-safe)
- All enabled features work correctly

---

**Status**: Ready for implementation  
**Estimated Time**: 2-3 days  
**Priority**: High (Demo-critical)
