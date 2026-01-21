-- Migration: DB-Driven Backoffice Menu System
-- Version: 0006
-- Created: 2026-01-19
-- Description: Implements role-based, feature-flag-aware menu system controlled by SaaS Admin

-- ============================================================================
-- 1. ROLES TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS saas.roles (
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

CREATE INDEX IF NOT EXISTS idx_roles_code ON saas.roles(code);
CREATE INDEX IF NOT EXISTS idx_roles_scope ON saas.roles(scope);

COMMENT ON TABLE saas.roles IS 'Canonical role definitions for the platform';
COMMENT ON COLUMN saas.roles.scope IS 'Role scope: PLATFORM (SaaS Admin), TENANT (Tenant-level), ORG (Organization-level)';

-- ============================================================================
-- 2. PERMISSIONS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS saas.permissions (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code          VARCHAR(100) NOT NULL UNIQUE,
  category      VARCHAR(50),
  description_nb TEXT,
  description_en TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_permissions_code ON saas.permissions(code);
CREATE INDEX IF NOT EXISTS idx_permissions_category ON saas.permissions(category);

COMMENT ON TABLE saas.permissions IS 'Permission definitions referenced by menu items and RBAC';

-- ============================================================================
-- 3. ROLE_PERMISSIONS JOIN TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS saas.role_permissions (
  role_id       UUID NOT NULL REFERENCES saas.roles(id) ON DELETE CASCADE,
  permission_id UUID NOT NULL REFERENCES saas.permissions(id) ON DELETE CASCADE,
  PRIMARY KEY (role_id, permission_id)
);

CREATE INDEX IF NOT EXISTS idx_role_permissions_role ON saas.role_permissions(role_id);
CREATE INDEX IF NOT EXISTS idx_role_permissions_permission ON saas.role_permissions(permission_id);

-- ============================================================================
-- 4. FEATURE_FLAGS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS saas.feature_flags (
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

CREATE INDEX IF NOT EXISTS idx_feature_flags_code ON saas.feature_flags(code);
CREATE INDEX IF NOT EXISTS idx_feature_flags_type ON saas.feature_flags(type);

COMMENT ON TABLE saas.feature_flags IS 'Feature flag definitions (boolean, plan-gated, date-gated, percentage rollout)';

-- ============================================================================
-- 5. TENANT_FEATURE_FLAGS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS saas.tenant_feature_flags (
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

CREATE INDEX IF NOT EXISTS idx_tenant_feature_flags_tenant ON saas.tenant_feature_flags(tenant_id);
CREATE INDEX IF NOT EXISTS idx_tenant_feature_flags_flag ON saas.tenant_feature_flags(feature_flag_id);
CREATE INDEX IF NOT EXISTS idx_tenant_feature_flags_effective ON saas.tenant_feature_flags(effective_from, effective_to);

COMMENT ON TABLE saas.tenant_feature_flags IS 'Per-tenant feature flag overrides';

-- ============================================================================
-- 6. MENU_TEMPLATES TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS saas.menu_templates (
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

CREATE INDEX IF NOT EXISTS idx_menu_templates_code ON saas.menu_templates(code);
CREATE INDEX IF NOT EXISTS idx_menu_templates_status ON saas.menu_templates(status);
CREATE INDEX IF NOT EXISTS idx_menu_templates_code_status ON saas.menu_templates(code, status);

COMMENT ON TABLE saas.menu_templates IS 'Versioned menu template definitions';

-- ============================================================================
-- 7. MENU_CATEGORIES TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS saas.menu_categories (
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

CREATE INDEX IF NOT EXISTS idx_menu_categories_template ON saas.menu_categories(template_id);
CREATE INDEX IF NOT EXISTS idx_menu_categories_key ON saas.menu_categories(key);
CREATE INDEX IF NOT EXISTS idx_menu_categories_order ON saas.menu_categories(template_id, sort_order);

COMMENT ON TABLE saas.menu_categories IS 'Smart category groupings within a menu template';

-- ============================================================================
-- 8. MENU_ITEMS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS saas.menu_items (
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

CREATE INDEX IF NOT EXISTS idx_menu_items_template ON saas.menu_items(template_id);
CREATE INDEX IF NOT EXISTS idx_menu_items_category ON saas.menu_items(category_id);
CREATE INDEX IF NOT EXISTS idx_menu_items_parent ON saas.menu_items(parent_id);
CREATE INDEX IF NOT EXISTS idx_menu_items_key ON saas.menu_items(key);
CREATE INDEX IF NOT EXISTS idx_menu_items_order ON saas.menu_items(template_id, category_id, sort_order);

COMMENT ON TABLE saas.menu_items IS 'Menu items as a tree structure within categories';

-- ============================================================================
-- 9. MENU_ITEM_PERMISSIONS JOIN TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS saas.menu_item_permissions (
  menu_item_id  UUID NOT NULL REFERENCES saas.menu_items(id) ON DELETE CASCADE,
  permission_id UUID NOT NULL REFERENCES saas.permissions(id) ON DELETE CASCADE,
  PRIMARY KEY (menu_item_id, permission_id)
);

CREATE INDEX IF NOT EXISTS idx_menu_item_permissions_item ON saas.menu_item_permissions(menu_item_id);
CREATE INDEX IF NOT EXISTS idx_menu_item_permissions_perm ON saas.menu_item_permissions(permission_id);

-- ============================================================================
-- 10. MENU_ITEM_FLAGS JOIN TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS saas.menu_item_flags (
  menu_item_id    UUID NOT NULL REFERENCES saas.menu_items(id) ON DELETE CASCADE,
  feature_flag_id UUID NOT NULL REFERENCES saas.feature_flags(id) ON DELETE CASCADE,
  PRIMARY KEY (menu_item_id, feature_flag_id)
);

CREATE INDEX IF NOT EXISTS idx_menu_item_flags_item ON saas.menu_item_flags(menu_item_id);
CREATE INDEX IF NOT EXISTS idx_menu_item_flags_flag ON saas.menu_item_flags(feature_flag_id);

-- ============================================================================
-- 11. TENANT_MENU_ASSIGNMENTS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS saas.tenant_menu_assignments (
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

CREATE INDEX IF NOT EXISTS idx_tenant_menu_assignments_tenant ON saas.tenant_menu_assignments(tenant_id);
CREATE INDEX IF NOT EXISTS idx_tenant_menu_assignments_template ON saas.tenant_menu_assignments(template_id);
CREATE INDEX IF NOT EXISTS idx_tenant_menu_assignments_effective ON saas.tenant_menu_assignments(effective_from, effective_to);
CREATE UNIQUE INDEX IF NOT EXISTS idx_tenant_menu_assignments_active ON saas.tenant_menu_assignments(tenant_id) 
  WHERE effective_to IS NULL;

COMMENT ON TABLE saas.tenant_menu_assignments IS 'Assigns a specific template version to a tenant';

-- ============================================================================
-- 12. ROLE_MENU_OVERRIDES TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS saas.role_menu_overrides (
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

CREATE INDEX IF NOT EXISTS idx_role_menu_overrides_template ON saas.role_menu_overrides(template_id);
CREATE INDEX IF NOT EXISTS idx_role_menu_overrides_role ON saas.role_menu_overrides(role_code);

COMMENT ON TABLE saas.role_menu_overrides IS 'Per-role customizations without duplicating templates';
