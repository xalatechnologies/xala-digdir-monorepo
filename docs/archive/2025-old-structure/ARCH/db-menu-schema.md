# Database Schema Specification: Menu System

**Version:** 1.0.0  
**Last Updated:** 2026-01-19  
**Status:** Implementation Ready

---

## Overview

This document specifies the database schema for the DB-driven Backoffice menu system. All tables are in the `saas` schema to align with the existing entitlements system.

---

## Schema Namespace

All menu-related tables reside in the `saas` PostgreSQL schema:

```sql
CREATE SCHEMA IF NOT EXISTS saas;
```

---

## Entity Relationship Diagram

```
                                    ┌──────────────────────┐
                                    │    menu_templates    │
                                    │   (versioned base)   │
                                    └──────────┬───────────┘
                                               │
                    ┌──────────────────────────┼──────────────────────────┐
                    │                          │                          │
                    ▼                          ▼                          ▼
         ┌──────────────────┐      ┌──────────────────┐      ┌──────────────────────┐
         │ menu_categories  │      │   menu_items     │      │ tenant_menu_assigns  │
         │  (smart groups)  │◄─────│  (tree nodes)    │      │ (template → tenant)  │
         └──────────────────┘      └────────┬─────────┘      └──────────────────────┘
                                            │
                    ┌───────────────────────┼───────────────────────┐
                    │                       │                       │
                    ▼                       ▼                       ▼
         ┌──────────────────┐    ┌──────────────────┐    ┌──────────────────────┐
         │ menu_item_perms  │    │ menu_item_flags  │    │  role_menu_overrides │
         │ (perm join)      │    │ (flag join)      │    │ (per-role tweaks)    │
         └──────────────────┘    └──────────────────┘    └──────────────────────┘
```

---

## Tables

### 1. `saas.roles`

Canonical role definitions for the platform.

```sql
CREATE TABLE saas.roles (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code          VARCHAR(50) NOT NULL UNIQUE,
  scope         VARCHAR(20) NOT NULL CHECK (scope IN ('PLATFORM', 'TENANT', 'ORG')),
  name_nb       VARCHAR(100) NOT NULL,
  name_en       VARCHAR(100) NOT NULL,
  description_nb TEXT,
  description_en TEXT,
  is_active     BOOLEAN NOT NULL DEFAULT TRUE,
  sort_order    INTEGER NOT NULL DEFAULT 0,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_roles_code ON saas.roles(code);
CREATE INDEX idx_roles_scope ON saas.roles(scope);
```

**Seed Data:**

| code | scope | name_nb | name_en |
|------|-------|---------|---------|
| SAAS_ADMIN | PLATFORM | Plattformadministrator | Platform Admin |
| TENANT_ADMIN | TENANT | Kommuneadministrator | Tenant Admin |
| ORG_ADMIN | ORG | Organisasjonsadministrator | Organization Admin |
| TENANT_USER | TENANT | Kommunebruker | Tenant User |
| ORG_USER | ORG | Organisasjonsbruker | Organization User |
| CASE_HANDLER | TENANT | Saksbehandler | Case Handler |

---

### 2. `saas.permissions`

Permission definitions referenced by menu items.

```sql
CREATE TABLE saas.permissions (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code          VARCHAR(100) NOT NULL UNIQUE,
  category      VARCHAR(50),
  description_nb TEXT,
  description_en TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_permissions_code ON saas.permissions(code);
CREATE INDEX idx_permissions_category ON saas.permissions(category);
```

---

### 3. `saas.role_permissions`

Many-to-many join for roles and permissions.

```sql
CREATE TABLE saas.role_permissions (
  role_id       UUID NOT NULL REFERENCES saas.roles(id) ON DELETE CASCADE,
  permission_id UUID NOT NULL REFERENCES saas.permissions(id) ON DELETE CASCADE,
  PRIMARY KEY (role_id, permission_id)
);

CREATE INDEX idx_role_permissions_role ON saas.role_permissions(role_id);
CREATE INDEX idx_role_permissions_permission ON saas.role_permissions(permission_id);
```

---

### 4. `saas.feature_flags`

Feature flag definitions (boolean, plan-gated, date-gated, percentage rollout).

```sql
CREATE TABLE saas.feature_flags (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code          VARCHAR(100) NOT NULL UNIQUE,
  type          VARCHAR(20) NOT NULL DEFAULT 'BOOLEAN' 
                CHECK (type IN ('BOOLEAN', 'PLAN_GATED', 'DATE_GATED', 'PERCENTAGE')),
  default_value JSONB NOT NULL DEFAULT 'false',
  description_nb TEXT,
  description_en TEXT,
  is_active     BOOLEAN NOT NULL DEFAULT TRUE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_feature_flags_code ON saas.feature_flags(code);
CREATE INDEX idx_feature_flags_type ON saas.feature_flags(type);
```

**Seed Data:**

| code | type | default_value | description_en |
|------|------|---------------|----------------|
| FEATURE_RECURRING | BOOLEAN | false | Seasonal/recurring bookings |
| FEATURE_REVIEWS | BOOLEAN | false | Customer reviews and ratings |
| FEATURE_ECONOMY | BOOLEAN | false | Financial reporting module |
| FEATURE_AUDIT_LOG | BOOLEAN | false | Detailed audit logging |
| FEATURE_MESSAGING | BOOLEAN | true | In-app messaging |

---

### 5. `saas.tenant_feature_flags`

Per-tenant feature flag overrides.

```sql
CREATE TABLE saas.tenant_feature_flags (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       UUID NOT NULL,
  feature_flag_id UUID NOT NULL REFERENCES saas.feature_flags(id) ON DELETE CASCADE,
  enabled         BOOLEAN NOT NULL,
  value           JSONB,
  effective_from  TIMESTAMPTZ,
  effective_to    TIMESTAMPTZ,
  created_by      UUID,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (tenant_id, feature_flag_id)
);

CREATE INDEX idx_tenant_feature_flags_tenant ON saas.tenant_feature_flags(tenant_id);
CREATE INDEX idx_tenant_feature_flags_flag ON saas.tenant_feature_flags(feature_flag_id);
CREATE INDEX idx_tenant_feature_flags_effective ON saas.tenant_feature_flags(effective_from, effective_to);
```

---

### 6. `saas.menu_templates`

Versioned menu template definitions.

```sql
CREATE TABLE saas.menu_templates (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code        VARCHAR(50) NOT NULL,
  version     INTEGER NOT NULL DEFAULT 1,
  status      VARCHAR(20) NOT NULL DEFAULT 'DRAFT' 
              CHECK (status IN ('DRAFT', 'PUBLISHED', 'ARCHIVED')),
  name_nb     VARCHAR(100),
  name_en     VARCHAR(100),
  notes       TEXT,
  created_by  UUID,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  published_at TIMESTAMPTZ,
  UNIQUE (code, version)
);

CREATE INDEX idx_menu_templates_code ON saas.menu_templates(code);
CREATE INDEX idx_menu_templates_status ON saas.menu_templates(status);
CREATE INDEX idx_menu_templates_code_status ON saas.menu_templates(code, status);
```

**Default Template:**

| code | version | status | name_en |
|------|---------|--------|---------|
| default | 1 | PUBLISHED | Default Backoffice Menu |

---

### 7. `saas.menu_categories`

Smart category groupings within a template.

```sql
CREATE TABLE saas.menu_categories (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id   UUID NOT NULL REFERENCES saas.menu_templates(id) ON DELETE CASCADE,
  key           VARCHAR(50) NOT NULL,
  label_nb      VARCHAR(100) NOT NULL,
  label_en      VARCHAR(100) NOT NULL,
  icon_key      VARCHAR(50),
  sort_order    INTEGER NOT NULL DEFAULT 0,
  is_collapsible BOOLEAN NOT NULL DEFAULT FALSE,
  default_expanded BOOLEAN NOT NULL DEFAULT TRUE,
  metadata      JSONB,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (template_id, key)
);

CREATE INDEX idx_menu_categories_template ON saas.menu_categories(template_id);
CREATE INDEX idx_menu_categories_key ON saas.menu_categories(key);
CREATE INDEX idx_menu_categories_order ON saas.menu_categories(template_id, sort_order);
```

**Default Categories:**

| key | sort_order | label_nb | label_en | icon_key |
|-----|------------|----------|----------|----------|
| overview | 0 | Oversikt | Overview | dashboard |
| operations | 10 | Drift | Operations | calendar |
| resources | 20 | Ressurser | Resources | building |
| communication | 30 | Kommunikasjon | Communication | mail |
| insights | 40 | Innsikt | Insights | chart |
| governance | 50 | Styring | Governance | shield-check |
| settings | 60 | Innstillinger | Settings | settings |

---

### 8. `saas.menu_items`

Menu items as a tree structure within categories.

```sql
CREATE TABLE saas.menu_items (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id     UUID NOT NULL REFERENCES saas.menu_templates(id) ON DELETE CASCADE,
  category_id     UUID REFERENCES saas.menu_categories(id) ON DELETE SET NULL,
  parent_id       UUID REFERENCES saas.menu_items(id) ON DELETE CASCADE,
  key             VARCHAR(100) NOT NULL,
  label_nb        VARCHAR(150) NOT NULL,
  label_en        VARCHAR(150) NOT NULL,
  description_nb  VARCHAR(300),
  description_en  VARCHAR(300),
  route           VARCHAR(200) NOT NULL,
  icon_key        VARCHAR(50),
  sort_order      INTEGER NOT NULL DEFAULT 0,
  is_section      BOOLEAN NOT NULL DEFAULT FALSE,
  visibility_scope VARCHAR(20) NOT NULL DEFAULT 'TENANT' 
                  CHECK (visibility_scope IN ('PLATFORM', 'TENANT', 'ORG')),
  is_active       BOOLEAN NOT NULL DEFAULT TRUE,
  metadata        JSONB,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (template_id, key)
);

CREATE INDEX idx_menu_items_template ON saas.menu_items(template_id);
CREATE INDEX idx_menu_items_category ON saas.menu_items(category_id);
CREATE INDEX idx_menu_items_parent ON saas.menu_items(parent_id);
CREATE INDEX idx_menu_items_key ON saas.menu_items(key);
CREATE INDEX idx_menu_items_order ON saas.menu_items(template_id, category_id, sort_order);
```

---

### 9. `saas.menu_item_permissions`

Join table: menu items require these permissions.

```sql
CREATE TABLE saas.menu_item_permissions (
  menu_item_id  UUID NOT NULL REFERENCES saas.menu_items(id) ON DELETE CASCADE,
  permission_id UUID NOT NULL REFERENCES saas.permissions(id) ON DELETE CASCADE,
  PRIMARY KEY (menu_item_id, permission_id)
);

CREATE INDEX idx_menu_item_permissions_item ON saas.menu_item_permissions(menu_item_id);
CREATE INDEX idx_menu_item_permissions_perm ON saas.menu_item_permissions(permission_id);
```

---

### 10. `saas.menu_item_flags`

Join table: menu items require these feature flags.

```sql
CREATE TABLE saas.menu_item_flags (
  menu_item_id    UUID NOT NULL REFERENCES saas.menu_items(id) ON DELETE CASCADE,
  feature_flag_id UUID NOT NULL REFERENCES saas.feature_flags(id) ON DELETE CASCADE,
  PRIMARY KEY (menu_item_id, feature_flag_id)
);

CREATE INDEX idx_menu_item_flags_item ON saas.menu_item_flags(menu_item_id);
CREATE INDEX idx_menu_item_flags_flag ON saas.menu_item_flags(feature_flag_id);
```

---

### 11. `saas.tenant_menu_assignments`

Assigns a specific template version to a tenant.

```sql
CREATE TABLE saas.tenant_menu_assignments (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       UUID NOT NULL,
  template_id     UUID NOT NULL REFERENCES saas.menu_templates(id) ON DELETE CASCADE,
  effective_from  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  effective_to    TIMESTAMPTZ,
  assigned_by     UUID,
  notes           TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_tenant_menu_assignments_tenant ON saas.tenant_menu_assignments(tenant_id);
CREATE INDEX idx_tenant_menu_assignments_template ON saas.tenant_menu_assignments(template_id);
CREATE INDEX idx_tenant_menu_assignments_effective ON saas.tenant_menu_assignments(effective_from, effective_to);
CREATE UNIQUE INDEX idx_tenant_menu_assignments_active ON saas.tenant_menu_assignments(tenant_id) 
  WHERE effective_to IS NULL;
```

---

### 12. `saas.role_menu_overrides`

Per-role customizations without duplicating templates.

```sql
CREATE TABLE saas.role_menu_overrides (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id     UUID NOT NULL REFERENCES saas.menu_templates(id) ON DELETE CASCADE,
  role_code       VARCHAR(50) NOT NULL,
  hidden_item_keys TEXT[] NOT NULL DEFAULT '{}',
  forced_item_keys TEXT[] NOT NULL DEFAULT '{}',
  custom_order    JSONB,
  custom_labels   JSONB,
  notes           TEXT,
  created_by      UUID,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (template_id, role_code)
);

CREATE INDEX idx_role_menu_overrides_template ON saas.role_menu_overrides(template_id);
CREATE INDEX idx_role_menu_overrides_role ON saas.role_menu_overrides(role_code);
```

---

## DTO Contracts

### MenuCategoryDTO

```typescript
interface MenuCategoryDTO {
  key: string;
  label: string;
  iconKey: string | null;
  sortOrder: number;
  isCollapsible: boolean;
  defaultExpanded: boolean;
  items: MenuItemDTO[];
}
```

### MenuItemDTO

```typescript
interface MenuItemDTO {
  key: string;
  label: string;
  description: string | null;
  route: string;
  iconKey: string | null;
  sortOrder: number;
  isSection: boolean;
  visibilityScope: 'PLATFORM' | 'TENANT' | 'ORG';
  children: MenuItemDTO[];
  metadata: Record<string, unknown> | null;
}
```

### MenuTreeDTO (API Response)

```typescript
interface MenuTreeDTO {
  templateCode: string;
  templateVersion: number;
  language: 'nb' | 'en';
  categories: MenuCategoryDTO[];
  resolvedAt: string; // ISO timestamp
}
```

---

## Resolution Query (Pseudocode)

```sql
-- Step 1: Get tenant's active template
SELECT t.* FROM saas.menu_templates t
JOIN saas.tenant_menu_assignments a ON a.template_id = t.id
WHERE a.tenant_id = $tenantId
  AND a.effective_from <= NOW()
  AND (a.effective_to IS NULL OR a.effective_to > NOW())
  AND t.status = 'PUBLISHED'
ORDER BY a.effective_from DESC
LIMIT 1;

-- Step 2: Get categories for template
SELECT * FROM saas.menu_categories
WHERE template_id = $templateId
ORDER BY sort_order;

-- Step 3: Get items for template with permission/flag joins
SELECT 
  i.*,
  array_agg(DISTINCT p.code) AS required_permissions,
  array_agg(DISTINCT f.code) AS required_flags
FROM saas.menu_items i
LEFT JOIN saas.menu_item_permissions mip ON mip.menu_item_id = i.id
LEFT JOIN saas.permissions p ON p.id = mip.permission_id
LEFT JOIN saas.menu_item_flags mif ON mif.menu_item_id = i.id
LEFT JOIN saas.feature_flags f ON f.id = mif.feature_flag_id
WHERE i.template_id = $templateId AND i.is_active = TRUE
GROUP BY i.id
ORDER BY i.category_id, i.sort_order;

-- Step 4: Get role overrides
SELECT * FROM saas.role_menu_overrides
WHERE template_id = $templateId AND role_code = $roleCode;

-- Step 5: Get tenant feature flags
SELECT f.code, COALESCE(tf.enabled, f.default_value::boolean) AS enabled
FROM saas.feature_flags f
LEFT JOIN saas.tenant_feature_flags tf 
  ON tf.feature_flag_id = f.id AND tf.tenant_id = $tenantId
WHERE f.is_active = TRUE;
```

---

## Indexes Summary

| Table | Index | Purpose |
|-------|-------|---------|
| roles | code | Role lookup |
| permissions | code | Permission lookup |
| feature_flags | code | Flag lookup |
| menu_templates | code, status | Template resolution |
| menu_categories | template_id, sort_order | Category ordering |
| menu_items | template_id, category_id, sort_order | Item ordering |
| tenant_menu_assignments | tenant_id, effective dates | Active assignment lookup |
| role_menu_overrides | template_id, role_code | Override lookup |

---

## Migration Strategy

1. **Phase 1**: Create tables in order (roles -> permissions -> flags -> templates -> categories -> items -> joins -> assignments -> overrides)
2. **Phase 2**: Seed default data (roles, permissions, flags, default template)
3. **Phase 3**: Assign default template to all existing tenants
4. **Phase 4**: Backfill feature flags for existing tenants based on current entitlements

---

## References

- Navigation Spec: `docs/NAVIGATION/backoffice-menu.md`
- Existing Entitlements: `packages/database-schema/src/saas/entitlements.ts`
- Permission Catalog: `apps/api/src/core/permissions.ts`
