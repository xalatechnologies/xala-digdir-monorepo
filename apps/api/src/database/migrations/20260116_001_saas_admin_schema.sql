-- Migration: SaaS Admin Schema
-- Description: Creates tables for multi-tenant SaaS control room including:
--   - Plans & subscription tiers
--   - Feature flags system (catalog + tenant/org overrides)
--   - Category entitlements for access control
--   - Branding tokens and versioning
--   - Extensions to tenants table (subscription, license, seat limits)
-- Created: 2026-01-16
-- Author: xaheen

-- ============================================================================
-- Prerequisites: Enable required extensions
-- ============================================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- PLANS TABLE
-- Subscription tier definitions with seat limits and entitlements
-- ============================================================================
CREATE TABLE IF NOT EXISTS plans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    display_order INTEGER NOT NULL DEFAULT 0,
    base_price DECIMAL(10, 2) NOT NULL DEFAULT 0,
    currency VARCHAR(3) NOT NULL DEFAULT 'NOK',
    billing_period VARCHAR(20) NOT NULL DEFAULT 'monthly',
    seat_limits JSONB DEFAULT '{
        "maxUsers": 5,
        "maxOrganizations": 1,
        "maxListings": 10,
        "maxBookingsPerMonth": 100,
        "maxStorageMb": 500
    }'::jsonb,
    entitlements JSONB DEFAULT '{
        "modules": {
            "rating": false,
            "recommendations": false,
            "feedback": true,
            "favorites": true,
            "share": true,
            "recurringBookings": false
        },
        "integrations": {
            "visma": false,
            "rco": false,
            "acos": false,
            "outlook": false,
            "vipps": false
        },
        "features": {
            "customBranding": false,
            "advancedReporting": false,
            "apiAccess": false,
            "prioritySupport": false
        }
    }'::jsonb,
    trial_days INTEGER DEFAULT 0,
    is_public BOOLEAN NOT NULL DEFAULT true,
    status VARCHAR(50) NOT NULL DEFAULT 'active',
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS plans_slug_idx ON plans(slug);
CREATE INDEX IF NOT EXISTS plans_status_idx ON plans(status);
CREATE INDEX IF NOT EXISTS plans_display_order_idx ON plans(display_order);

COMMENT ON TABLE plans IS 'Subscription plan definitions with seat limits and feature entitlements';
COMMENT ON COLUMN plans.seat_limits IS 'JSONB: maxUsers, maxOrganizations, maxListings, maxBookingsPerMonth, maxStorageMb';
COMMENT ON COLUMN plans.entitlements IS 'JSONB: modules, integrations, features enabled by this plan';

-- ============================================================================
-- FEATURE FLAGS CATALOG
-- Central registry of all feature flags (code-owned definitions)
-- ============================================================================
CREATE TABLE IF NOT EXISTS feature_flags_catalog (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    key VARCHAR(100) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    type VARCHAR(50) NOT NULL DEFAULT 'boolean',
    default_value JSONB NOT NULL DEFAULT 'false'::jsonb,
    category VARCHAR(50) NOT NULL DEFAULT 'module',
    status VARCHAR(50) NOT NULL DEFAULT 'active',
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS feature_flags_catalog_key_idx ON feature_flags_catalog(key);
CREATE INDEX IF NOT EXISTS feature_flags_catalog_category_idx ON feature_flags_catalog(category);
CREATE INDEX IF NOT EXISTS feature_flags_catalog_status_idx ON feature_flags_catalog(status);

COMMENT ON TABLE feature_flags_catalog IS 'Central registry of feature flags - code-owned definitions';
COMMENT ON COLUMN feature_flags_catalog.type IS 'boolean | string | number';
COMMENT ON COLUMN feature_flags_catalog.category IS 'module | integration | policy';

-- ============================================================================
-- TENANT FEATURE FLAGS
-- Tenant-level overrides of feature flag values
-- ============================================================================
CREATE TABLE IF NOT EXISTS tenant_feature_flags (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    feature_flag_id UUID NOT NULL REFERENCES feature_flags_catalog(id) ON DELETE CASCADE,
    value JSONB NOT NULL,
    enabled BOOLEAN NOT NULL DEFAULT true,
    reason TEXT,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE(tenant_id, feature_flag_id)
);

CREATE INDEX IF NOT EXISTS tenant_feature_flags_tenant_idx ON tenant_feature_flags(tenant_id);
CREATE INDEX IF NOT EXISTS tenant_feature_flags_flag_idx ON tenant_feature_flags(feature_flag_id);

COMMENT ON TABLE tenant_feature_flags IS 'Tenant-level overrides of feature flags';
COMMENT ON COLUMN tenant_feature_flags.value IS 'Override value for this flag for this tenant';
COMMENT ON COLUMN tenant_feature_flags.enabled IS 'Whether override is active (allows disabling without deleting)';

-- ============================================================================
-- ORG FEATURE FLAGS
-- Organization-level overrides (can only restrict, never expand tenant permissions)
-- ============================================================================
CREATE TABLE IF NOT EXISTS org_feature_flags (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    feature_flag_id UUID NOT NULL REFERENCES feature_flags_catalog(id) ON DELETE CASCADE,
    value JSONB NOT NULL,
    enabled BOOLEAN NOT NULL DEFAULT true,
    reason TEXT,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE(organization_id, feature_flag_id)
);

CREATE INDEX IF NOT EXISTS org_feature_flags_org_idx ON org_feature_flags(organization_id);
CREATE INDEX IF NOT EXISTS org_feature_flags_flag_idx ON org_feature_flags(feature_flag_id);

COMMENT ON TABLE org_feature_flags IS 'Organization-level feature flag overrides (can only restrict tenant permissions)';

-- ============================================================================
-- CATEGORY ENTITLEMENTS
-- Controls which rental object categories a tenant/org can access
-- ============================================================================
CREATE TABLE IF NOT EXISTS category_entitlements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    category VARCHAR(100) NOT NULL,
    enabled BOOLEAN NOT NULL DEFAULT true,
    restrictions JSONB DEFAULT '{}'::jsonb,
    reason TEXT,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS category_entitlements_tenant_idx ON category_entitlements(tenant_id);
CREATE INDEX IF NOT EXISTS category_entitlements_org_idx ON category_entitlements(organization_id);
CREATE INDEX IF NOT EXISTS category_entitlements_category_idx ON category_entitlements(category);
CREATE UNIQUE INDEX IF NOT EXISTS category_entitlements_tenant_unique
    ON category_entitlements(tenant_id, category)
    WHERE organization_id IS NULL;
CREATE UNIQUE INDEX IF NOT EXISTS category_entitlements_org_unique
    ON category_entitlements(organization_id, category)
    WHERE organization_id IS NOT NULL;

COMMENT ON TABLE category_entitlements IS 'Controls which rental object categories a tenant/org can access';
COMMENT ON COLUMN category_entitlements.restrictions IS 'JSONB with optional restrictions (e.g., maxBookingsPerDay)';

-- ============================================================================
-- BRANDING TOKENS
-- Tenant branding configuration (colors, logos, typography)
-- ============================================================================
CREATE TABLE IF NOT EXISTS branding_tokens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE UNIQUE,
    name VARCHAR(255),
    logo_url TEXT,
    favicon_url TEXT,
    primary_color VARCHAR(50),
    secondary_color VARCHAR(50),
    accent_color VARCHAR(50),
    tokens JSONB DEFAULT '{}'::jsonb,
    typography JSONB DEFAULT '{}'::jsonb,
    active_version_id UUID,
    preview_version_id UUID,
    preview_mode BOOLEAN NOT NULL DEFAULT false,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS branding_tokens_tenant_idx ON branding_tokens(tenant_id);

COMMENT ON TABLE branding_tokens IS 'Tenant branding configuration with design tokens';
COMMENT ON COLUMN branding_tokens.tokens IS 'JSONB design tokens (colors, spacing, shadows, etc.)';
COMMENT ON COLUMN branding_tokens.typography IS 'JSONB typography settings (fonts, sizes, weights)';
COMMENT ON COLUMN branding_tokens.preview_mode IS 'When true, preview_version_id is shown instead of active_version_id';

-- ============================================================================
-- BRANDING VERSIONS
-- Version history for branding changes (supports publish/rollback)
-- ============================================================================
CREATE TABLE IF NOT EXISTS branding_versions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    branding_tokens_id UUID NOT NULL REFERENCES branding_tokens(id) ON DELETE CASCADE,
    version INTEGER NOT NULL,
    name VARCHAR(255),
    description TEXT,
    snapshot JSONB NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'draft',
    published_at TIMESTAMP,
    published_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE(tenant_id, version)
);

CREATE INDEX IF NOT EXISTS branding_versions_tenant_idx ON branding_versions(tenant_id);
CREATE INDEX IF NOT EXISTS branding_versions_tokens_idx ON branding_versions(branding_tokens_id);
CREATE INDEX IF NOT EXISTS branding_versions_version_idx ON branding_versions(branding_tokens_id, version);
CREATE INDEX IF NOT EXISTS branding_versions_status_idx ON branding_versions(status);

COMMENT ON TABLE branding_versions IS 'Version history for tenant branding (supports publish/rollback)';
COMMENT ON COLUMN branding_versions.snapshot IS 'Complete branding state snapshot at this version';
COMMENT ON COLUMN branding_versions.status IS 'draft | published | archived';

-- Add foreign key from branding_tokens to branding_versions (circular reference)
ALTER TABLE branding_tokens
    ADD CONSTRAINT branding_tokens_active_version_fk
    FOREIGN KEY (active_version_id) REFERENCES branding_versions(id) ON DELETE SET NULL;

ALTER TABLE branding_tokens
    ADD CONSTRAINT branding_tokens_preview_version_fk
    FOREIGN KEY (preview_version_id) REFERENCES branding_versions(id) ON DELETE SET NULL;

-- ============================================================================
-- EXTEND TENANTS TABLE
-- Add columns for subscription, license key, seat limits, and branding
-- ============================================================================

-- Add subscription_plan_id column if not exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'tenants' AND column_name = 'subscription_plan_id'
    ) THEN
        ALTER TABLE tenants ADD COLUMN subscription_plan_id UUID;
        ALTER TABLE tenants
            ADD CONSTRAINT tenants_subscription_plan_fk
            FOREIGN KEY (subscription_plan_id) REFERENCES plans(id) ON DELETE SET NULL;
        CREATE INDEX IF NOT EXISTS tenants_subscription_plan_idx ON tenants(subscription_plan_id);
    END IF;
END $$;

-- Add license_key_hash column if not exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'tenants' AND column_name = 'license_key_hash'
    ) THEN
        ALTER TABLE tenants ADD COLUMN license_key_hash TEXT;
    END IF;
END $$;

-- Add license_key_rotated_at column if not exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'tenants' AND column_name = 'license_key_rotated_at'
    ) THEN
        ALTER TABLE tenants ADD COLUMN license_key_rotated_at TIMESTAMP;
    END IF;
END $$;

-- Add seat_limits column if not exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'tenants' AND column_name = 'seat_limits'
    ) THEN
        ALTER TABLE tenants ADD COLUMN seat_limits JSONB DEFAULT '{
            "maxUsers": 5,
            "maxOrganizations": 1,
            "maxListings": 10,
            "maxBookingsPerMonth": 100,
            "maxStorageMb": 500
        }'::jsonb;
    END IF;
END $$;

-- Add branding_version_id column if not exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'tenants' AND column_name = 'branding_version_id'
    ) THEN
        ALTER TABLE tenants ADD COLUMN branding_version_id UUID;
        ALTER TABLE tenants
            ADD CONSTRAINT tenants_branding_version_fk
            FOREIGN KEY (branding_version_id) REFERENCES branding_versions(id) ON DELETE SET NULL;
    END IF;
END $$;

COMMENT ON COLUMN tenants.subscription_plan_id IS 'References the current subscription plan';
COMMENT ON COLUMN tenants.license_key_hash IS 'Hashed license key (never store plaintext)';
COMMENT ON COLUMN tenants.license_key_rotated_at IS 'Timestamp of last license key rotation';
COMMENT ON COLUMN tenants.seat_limits IS 'Overrides plan seat limits when set';
COMMENT ON COLUMN tenants.branding_version_id IS 'Active branding version for this tenant';

-- ============================================================================
-- EXTEND SUBSCRIPTIONS TABLE
-- Add plan_id foreign key reference
-- ============================================================================

-- Add plan_id column if not exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'subscriptions' AND column_name = 'plan_id'
    ) THEN
        ALTER TABLE subscriptions ADD COLUMN plan_id UUID;
        ALTER TABLE subscriptions
            ADD CONSTRAINT subscriptions_plan_fk
            FOREIGN KEY (plan_id) REFERENCES plans(id) ON DELETE SET NULL;
        CREATE INDEX IF NOT EXISTS subscriptions_plan_idx ON subscriptions(plan_id);
    END IF;
END $$;

COMMENT ON COLUMN subscriptions.plan_id IS 'References the subscription plan definition';

-- ============================================================================
-- UPDATED_AT TRIGGER FUNCTION
-- Automatically update updated_at timestamp on row update
-- ============================================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to new tables
DO $$
DECLARE
    tbl TEXT;
BEGIN
    FOREACH tbl IN ARRAY ARRAY['plans', 'feature_flags_catalog', 'tenant_feature_flags', 'org_feature_flags', 'category_entitlements', 'branding_tokens', 'branding_versions']
    LOOP
        EXECUTE format('
            DROP TRIGGER IF EXISTS update_%I_updated_at ON %I;
            CREATE TRIGGER update_%I_updated_at
            BEFORE UPDATE ON %I
            FOR EACH ROW
            EXECUTE FUNCTION update_updated_at_column();
        ', tbl, tbl, tbl, tbl);
    END LOOP;
END;
$$;

-- ============================================================================
-- GRANTS (adjust role names as needed for your environment)
-- ============================================================================
-- GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO api_user;
-- GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO api_user;

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================
-- Tables created:
--   - plans
--   - feature_flags_catalog
--   - tenant_feature_flags
--   - org_feature_flags
--   - category_entitlements
--   - branding_tokens
--   - branding_versions
--
-- Tables extended:
--   - tenants (added: subscription_plan_id, license_key_hash, license_key_rotated_at, seat_limits, branding_version_id)
--   - subscriptions (added: plan_id)
--
-- Run the feature flags seed script to populate the catalog after this migration.
-- ============================================================================
