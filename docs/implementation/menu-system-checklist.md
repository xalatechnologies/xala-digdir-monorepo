# DB-Driven Backoffice Menu System - Implementation Checklist

**Status:** In Progress  
**Started:** 2026-01-19  
**Target Completion:** TBD

---

## Phase 1: Schema & Foundation ✓ COMPLETE

- [x] Create navigation specification document
- [x] Create schema specification document
- [ ] Create database migration files
- [ ] Seed default roles, permissions, and feature flags
- [ ] Seed default menu template with categories and items
- [ ] Run migrations on development database
- [ ] Verify schema integrity

**Files to Create:**
- `packages/database-schema/migrations/0006_menu_system.sql`
- `packages/database-schema/seeds/menu-system-seed.sql`

---

## Phase 2: DK API Layer

### 2.1 DTOs & Types
- [ ] Create MenuTreeDTO interface
- [ ] Create MenuCategoryDTO interface
- [ ] Create MenuItemDTO interface
- [ ] Create MenuResolutionContext interface
- [ ] Add to Client SDK types

**Files to Create:**
- `packages/client-sdk/src/types/menu.types.ts`
- `apps/api/src/modules/menu/menu.dto.ts`

### 2.2 Menu Resolution Service
- [ ] Create MenuResolutionService class
- [ ] Implement template loading logic
- [ ] Implement feature flag gating
- [ ] Implement permission gating
- [ ] Implement role override application
- [ ] Implement localization
- [ ] Add caching layer

**Files to Create:**
- `apps/api/src/modules/menu/menu-resolution.service.ts`
- `apps/api/src/modules/menu/menu.repository.ts`

### 2.3 DK API Endpoints
- [ ] GET /dk/me/context - User context endpoint
- [ ] GET /dk/backoffice/menu - Menu tree endpoint
- [ ] Add authentication middleware
- [ ] Add caching headers

**Files to Create:**
- `apps/api/src/modules/menu/menu.controller.ts`

---

## Phase 3: Client SDK Integration

- [ ] Create useBackofficeMenu() hook
- [ ] Create useMenuContext() hook
- [ ] Add menu caching in React Query
- [ ] Add menu invalidation on flag/role changes
- [ ] Export types from SDK

**Files to Create:**
- `packages/client-sdk/src/hooks/useBackofficeMenu.ts`
- `packages/client-sdk/src/services/menu.service.ts`

---

## Phase 4: Backoffice UI Migration

### 4.1 Audit Current Implementation
- [ ] Document all hardcoded role checks in Sidebar.tsx
- [ ] Document all feature flag checks in menu rendering
- [ ] List all menu items and their current visibility logic
- [ ] Identify duplicated menu logic across components

**Files to Audit:**
- `apps/backoffice/src/components/layout/Sidebar.tsx`
- `apps/backoffice/src/hooks/useRBAC.ts`
- `apps/backoffice/src/providers/BackofficeRoleProvider.tsx`

### 4.2 Create New DTO-Driven Components
- [ ] Create <MenuCategory> component
- [ ] Create <MenuItem> component
- [ ] Create <MenuTree> component
- [ ] Create <SidebarNav> component (DTO-driven)
- [ ] Add loading states
- [ ] Add error states
- [ ] Add empty states

**Files to Create:**
- `apps/backoffice/src/components/menu/MenuCategory.tsx`
- `apps/backoffice/src/components/menu/MenuItem.tsx`
- `apps/backoffice/src/components/menu/MenuTree.tsx`
- `apps/backoffice/src/components/menu/SidebarNav.tsx`

### 4.3 Replace Sidebar Implementation
- [ ] Replace Sidebar.tsx with DTO-driven version
- [ ] Remove all role checks from menu rendering
- [ ] Remove all feature flag checks from menu rendering
- [ ] Add menu refresh on context change
- [ ] Test with all roles

**Files to Modify:**
- `apps/backoffice/src/components/layout/Sidebar.tsx`
- `apps/backoffice/src/App.tsx`

---

## Phase 5: SaaS Admin Control Plane

### 5.1 Admin API Endpoints
- [ ] GET /dk/saas-admin/menu-templates - List templates
- [ ] POST /dk/saas-admin/menu-templates - Create template
- [ ] PUT /dk/saas-admin/menu-templates/:id - Update template
- [ ] POST /dk/saas-admin/menu-templates/:id/publish - Publish template
- [ ] GET /dk/saas-admin/feature-flags - List flags
- [ ] POST /dk/saas-admin/tenants/:id/feature-flags - Toggle flag
- [ ] POST /dk/saas-admin/tenants/:id/menu-template - Assign template

**Files to Create:**
- `apps/api/src/modules/saas-admin/menu-admin.controller.ts`
- `apps/api/src/modules/saas-admin/menu-admin.service.ts`

### 5.2 Admin UI (Future)
- [ ] Template management page
- [ ] Feature flag toggle interface
- [ ] Tenant assignment interface
- [ ] Role override editor

---

## Phase 6: Testing

### 6.1 Unit Tests
- [ ] MenuResolutionService - flag gating
- [ ] MenuResolutionService - permission gating
- [ ] MenuResolutionService - role overrides
- [ ] MenuResolutionService - localization
- [ ] MenuResolutionService - ordering

**Files to Create:**
- `apps/api/src/modules/menu/__tests__/menu-resolution.service.test.ts`

### 6.2 Integration Tests
- [ ] DK API /backoffice/menu - TENANT_ADMIN role
- [ ] DK API /backoffice/menu - CASE_HANDLER role
- [ ] DK API /backoffice/menu - ORG_ADMIN role
- [ ] Feature flag toggle updates menu
- [ ] Template assignment updates menu

**Files to Create:**
- `apps/api/src/modules/menu/__tests__/menu.integration.test.ts`

### 6.3 E2E Tests (Playwright)
- [ ] Login as TENANT_ADMIN - verify full menu
- [ ] Login as CASE_HANDLER - verify restricted menu
- [ ] Toggle FEATURE_AUDIT_LOG - verify menu changes
- [ ] Navigation works for all visible items

**Files to Create:**
- `apps/backoffice/e2e/menu-system.spec.ts`

---

## Phase 7: CI/CD & Validation

- [ ] Add schema validation in CI
- [ ] Add contract validation (DB ↔ DTO)
- [ ] Add enum validation (role codes, flag codes)
- [ ] Add migration rollback test
- [ ] Add performance benchmarks

---

## Phase 8: Documentation & Rollout

- [ ] Update API documentation
- [ ] Create migration guide for tenants
- [ ] Create SaaS Admin guide
- [ ] Create developer guide
- [ ] Deploy to staging
- [ ] Run smoke tests
- [ ] Deploy to production
- [ ] Monitor menu resolution performance

---

## Current Status

**Phase 1**: Documentation complete, ready to create migrations  
**Next Step**: Create database migration files and seed data

---

## Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Breaking existing menus | HIGH | Gradual rollout with feature flag |
| Performance degradation | MEDIUM | Caching layer + benchmarks |
| Schema migration failure | HIGH | Rollback script + staging validation |
| Missing permissions | MEDIUM | Comprehensive audit before migration |

---

## Success Criteria

- [ ] All Backoffice roles see correct menu items
- [ ] Feature flags correctly show/hide menu items
- [ ] No hardcoded role checks in UI
- [ ] Menu loads in <100ms (cached)
- [ ] SaaS Admin can toggle flags without deploy
- [ ] All tests passing (unit, integration, E2E)
