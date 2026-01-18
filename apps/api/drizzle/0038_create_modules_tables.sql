-- Migration: 0031_create_modules_tables
-- Description: Create tables for module-based feature flags system
-- Schema: platform

-- =============================================================================
-- 1. Module Catalog Table
-- =============================================================================
CREATE TABLE IF NOT EXISTS platform.modules (
    key VARCHAR(50) PRIMARY KEY,
    name JSONB NOT NULL DEFAULT '{"no": "", "en": ""}',
    description JSONB DEFAULT '{"no": "", "en": ""}',
    category VARCHAR(50) NOT NULL,
    dependencies TEXT[] NOT NULL DEFAULT '{}',
    capabilities TEXT[] NOT NULL DEFAULT '{}',
    is_core BOOLEAN NOT NULL DEFAULT FALSE,
    default_enabled BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS modules_category_idx ON platform.modules(category);
CREATE INDEX IF NOT EXISTS modules_is_core_idx ON platform.modules(is_core);

COMMENT ON TABLE platform.modules IS 'Module catalog - all available modules in the platform';
COMMENT ON COLUMN platform.modules.key IS 'Unique module identifier (e.g., RATINGS, MESSAGING)';
COMMENT ON COLUMN platform.modules.dependencies IS 'Array of module keys this module depends on';
COMMENT ON COLUMN platform.modules.capabilities IS 'Array of capability flags this module provides';

-- =============================================================================
-- 2. Tenant Module Overrides Table
-- =============================================================================
CREATE TABLE IF NOT EXISTS platform.tenant_modules (
    tenant_id UUID NOT NULL REFERENCES platform.tenants(id) ON DELETE CASCADE,
    module_key VARCHAR(50) NOT NULL REFERENCES platform.modules(key) ON DELETE CASCADE,
    is_enabled BOOLEAN NOT NULL DEFAULT FALSE,
    config JSONB DEFAULT '{}',
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_by UUID REFERENCES platform.users(id) ON DELETE SET NULL,
    PRIMARY KEY (tenant_id, module_key)
);

CREATE INDEX IF NOT EXISTS tenant_modules_tenant_idx ON platform.tenant_modules(tenant_id);
CREATE INDEX IF NOT EXISTS tenant_modules_module_key_idx ON platform.tenant_modules(module_key);
CREATE INDEX IF NOT EXISTS tenant_modules_enabled_idx ON platform.tenant_modules(tenant_id, is_enabled);

COMMENT ON TABLE platform.tenant_modules IS 'Tenant-specific module overrides';

-- =============================================================================
-- 3. Organization Module Overrides Table (Optional)
-- =============================================================================
CREATE TABLE IF NOT EXISTS platform.org_modules (
    tenant_id UUID NOT NULL REFERENCES platform.tenants(id) ON DELETE CASCADE,
    org_id UUID NOT NULL REFERENCES platform.organizations(id) ON DELETE CASCADE,
    module_key VARCHAR(50) NOT NULL REFERENCES platform.modules(key) ON DELETE CASCADE,
    is_enabled BOOLEAN NOT NULL DEFAULT FALSE,
    config JSONB DEFAULT '{}',
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_by UUID REFERENCES platform.users(id) ON DELETE SET NULL,
    PRIMARY KEY (org_id, module_key)
);

CREATE INDEX IF NOT EXISTS org_modules_tenant_idx ON platform.org_modules(tenant_id);
CREATE INDEX IF NOT EXISTS org_modules_org_idx ON platform.org_modules(org_id);
CREATE INDEX IF NOT EXISTS org_modules_module_key_idx ON platform.org_modules(module_key);

COMMENT ON TABLE platform.org_modules IS 'Organization-specific module overrides';

-- =============================================================================
-- 4. Module Audit Log Table
-- =============================================================================
CREATE TABLE IF NOT EXISTS platform.module_audit (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES platform.tenants(id) ON DELETE CASCADE,
    org_id UUID REFERENCES platform.organizations(id) ON DELETE SET NULL,
    module_key VARCHAR(50) NOT NULL,
    actor_user_id UUID REFERENCES platform.users(id) ON DELETE SET NULL,
    action VARCHAR(20) NOT NULL, -- 'enable', 'disable', 'config_update'
    old_state JSONB,
    new_state JSONB NOT NULL,
    reason TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS module_audit_tenant_idx ON platform.module_audit(tenant_id);
CREATE INDEX IF NOT EXISTS module_audit_module_key_idx ON platform.module_audit(module_key);
CREATE INDEX IF NOT EXISTS module_audit_actor_idx ON platform.module_audit(actor_user_id);
CREATE INDEX IF NOT EXISTS module_audit_created_at_idx ON platform.module_audit(created_at);
CREATE INDEX IF NOT EXISTS module_audit_tenant_module_idx ON platform.module_audit(tenant_id, module_key);

COMMENT ON TABLE platform.module_audit IS 'Audit trail for all module state changes';

-- =============================================================================
-- 5. RLS Policies
-- =============================================================================

-- Enable RLS on all tables
ALTER TABLE platform.tenant_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE platform.org_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE platform.module_audit ENABLE ROW LEVEL SECURITY;

-- tenant_modules: Users can only see their own tenant's modules
CREATE POLICY tenant_modules_tenant_isolation ON platform.tenant_modules
    FOR ALL
    USING (tenant_id = current_setting('app.current_tenant_id', true)::UUID);

-- org_modules: Users can only see their own tenant's org modules
CREATE POLICY org_modules_tenant_isolation ON platform.org_modules
    FOR ALL
    USING (tenant_id = current_setting('app.current_tenant_id', true)::UUID);

-- module_audit: Users can only see their own tenant's audit logs
CREATE POLICY module_audit_tenant_isolation ON platform.module_audit
    FOR ALL
    USING (tenant_id = current_setting('app.current_tenant_id', true)::UUID);
