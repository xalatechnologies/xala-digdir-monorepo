# SaaS Admin Audit Report

> **Audit Date**: 2026-01-18
> **Status**: Complete

## Executive Summary

The SaaS Admin is the **platform-level control plane** for managing the multi-tenant Digilist/Xala ecosystem. This audit inventories all modules, endpoints, SDK methods, UI routes, and database tables.

**Implementation Status**: ~92% Complete

---

## 1. Module Inventory

| Module | Status | Description |
|--------|--------|-------------|
| Tenants | ✅ | CRUD, suspend/activate, seat limits |
| Plans | ✅ | CRUD, entitlements matrix, assignment |
| Subscriptions | ✅ | Tenant-plan linking |
| License Keys | ✅ | Issue, rotate, verify (masked display) |
| Feature Flags | ✅ | Global catalog + tenant overrides |
| Billing | ⚠️ Mock | Stats only, no real provider |
| Secrets | ⚠️ Mock | Tenant integration secrets |
| Branding | ✅ | Theme tokens, visual editor |
| Seeds | ✅ | Manual upload + AI generator |
| Monitoring | ⚠️ Partial | Platform health metrics |
| Audit | ⚠️ Partial | Placeholder UI |

---

## 2. API Endpoints

### SaaS Controller (`/api/saas/*`)

| Method | Endpoint | Permission | Description |
|--------|----------|------------|-------------|
| GET | `/me` | `saas:*` | Current admin capabilities |
| GET | `/tenants` | `saas:tenants:read` | List all tenants |
| GET | `/tenants/:id` | `saas:tenants:read` | Tenant detail |
| POST | `/tenants` | `saas:tenants:create` | Create tenant |
| PATCH | `/tenants/:id` | `saas:tenants:update` | Update tenant |
| POST | `/tenants/:id/suspend` | `saas:tenants:update` | Suspend tenant |
| POST | `/tenants/:id/activate` | `saas:tenants:update` | Activate tenant |
| PUT | `/tenants/:id/seat-limits` | `saas:tenants:update` | Update seat limits |
| PUT | `/tenants/:id/flags` | `saas:flags:update` | Update tenant flags |
| POST | `/tenants/:id/rotate-license` | `saas:license:rotate` | Rotate license key |
| GET | `/tenants/:id/billing` | `saas:billing:read` | Tenant billing (mock) |
| GET | `/tenants/:id/secrets` | `saas:secrets:read` | Tenant secrets (mock) |
| GET | `/tenants/:id/categories` | `saas:categories:read` | Category entitlements |
| PUT | `/tenants/:id/categories` | `saas:categories:update` | Update categories |
| GET | `/feature-flags` | `saas:flags:read` | Feature flags catalog |
| GET | `/plans` | `saas:plans:read` | List plans |
| POST | `/plans` | `saas:plans:create` | Create plan |
| PUT | `/tenants/:id/plan` | `saas:plans:assign` | Assign plan to tenant |
| GET | `/billing` | `saas:billing:read` | Platform billing (mock) |

---

## 3. SDK Hooks

| Hook | Category | Description |
|------|----------|-------------|
| `useSaasMe` | Identity | Current admin capabilities |
| `useSaasTenants` | Tenants | Paginated tenant list |
| `useSaasTenant` | Tenants | Single tenant detail |
| `useCreateSaasTenant` | Tenants | Create mutation |
| `useUpdateSaasTenant` | Tenants | Update mutation |
| `useSuspendSaasTenant` | Tenants | Suspend mutation |
| `useReactivateSaasTenant` | Tenants | Reactivate mutation |
| `useUpdateSaasSeatLimits` | Limits | Seat limits mutation |
| `useSaasFeatureFlagsCatalog` | Flags | Global flag catalog |
| `useSaasTenantFlags` | Flags | Tenant flag overrides |
| `useUpdateSaasTenantFlags` | Flags | Update flags mutation |
| `useRotateSaasLicenseKey` | License | Rotate key mutation |
| `useValidateSaasLicenseKey` | License | Validate key mutation |
| `useSaasTenantBilling` | Billing | Tenant billing data |
| `useSaasBillingOverview` | Billing | Platform billing |
| `useSaasTenantSecrets` | Secrets | Tenant secrets |
| `useUpdateSaasTenantSecret` | Secrets | Update secret mutation |
| `useSaasPlans` | Plans | Plan list |
| `useSaasPlan` | Plans | Single plan detail |
| `useCreateSaasPlan` | Plans | Create mutation |
| `useUpdateSaasPlan` | Plans | Update mutation |
| `useSaasTenantCategories` | Categories | Category entitlements |
| `useUpdateSaasTenantCategories` | Categories | Update categories |

---

## 4. UI Routes

| Route | Page | Status |
|-------|------|--------|
| `/` | DashboardPage | ⚠️ Placeholder |
| `/login` | LoginPage | ✅ |
| `/tenants` | TenantsListPage | ✅ |
| `/tenants/:id` | TenantDetailPage | ✅ |
| `/tenants/new` | TenantCreatePage | ✅ |
| `/tenants/:id/edit` | TenantEditPage | ✅ |
| `/plans` | PlansListPage | ✅ |
| `/plans/new` | PlanCreatePage | ✅ |
| `/plans/:id` | PlanDetailPage | ✅ |
| `/feature-flags` | FeatureFlagsCatalogPage | ✅ |
| `/billing` | BillingPage | ⚠️ Mock |
| `/branding` | BrandingListPage | ✅ |
| `/branding/:tenantId` | BrandingEditorPage | ✅ |
| `/ai-seeds` | AISeedGeneratorPage | ✅ |
| `/seed-data` | SeedDataManagementPage | ✅ |
| `/monitoring` | MonitoringPage | ⚠️ Mock |
| `/users` | UsersPage | ⚠️ Placeholder |
| `/audit` | AuditLogPage | ⚠️ Placeholder |
| `/settings` | SettingsPage | ⚠️ Placeholder |

---

## 5. Database Schema (`saas` schema)

| Table | Purpose | Key Columns |
|-------|---------|-------------|
| `plans` | Subscription tiers | id, slug, name, price, entitlements |
| `subscriptions` | Tenant-plan link | tenantId, planId, status, startDate |
| `feature_flags_catalog` | Global flags | id, key, category, type, defaultValue |
| `tenant_feature_flags` | Tenant overrides | tenantId, featureFlagId, value |
| `org_feature_flags` | Org overrides | organizationId, featureFlagId, value |
| `category_entitlements` | RO categories | tenantId, categoryId, allowed |
| `usage` | Usage metrics | tenantId, metric, value, period |
| `policy_sets` | Policy engine | tenantId, version, policies |
| `tenant_configs` | Tenant config | tenantId, config |
| `seed_blueprints` | Seed templates | id, name, definition |

**Key Columns in `platform.tenants`:**
- `licenseKeyHash` - SHA-256 hash of license key
- `licenseKeyRotatedAt` - Last rotation timestamp
- `featureFlags` - JSONB of computed flags
- `seatLimits` - JSONB of usage limits

---

## 6. External Providers

| Provider | Status | Integration |
|----------|--------|-------------|
| Stripe | ❌ Not connected | Future billing |
| Vipps | ❌ Not connected | Future payments |

**Webhook Endpoints**: None implemented

---

## 7. Existing Test Coverage

| Test File | Coverage | Lines |
|-----------|----------|-------|
| `saas-admin-flow.spec.ts` | Login, Dashboard, Tenants, Plans, RBAC, A11y | 454 |
| `saas-admin-data-page-components.spec.ts` | Data page components | ~100 |

**Missing Tests:**
- License key rotation E2E
- Seed data import E2E
- Feature flag toggle E2E with verification
- Security/IDOR tests
- Integration tests with real DB

---

_Generated: 2026-01-18_
