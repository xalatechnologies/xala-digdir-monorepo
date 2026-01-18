-- =====================================================================
-- Migration: 0029_saas_foundation.sql
-- Purpose: SaaS Administration Foundation (Plans, Subscriptions, Licenses, Feature Flags)
-- Date: 2026-01-17
-- =====================================================================

-- Create saas schema
CREATE SCHEMA IF NOT EXISTS saas;

-- =====================================================================
-- SUBSCRIPTION PLANS
-- =====================================================================

CREATE TABLE saas.plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(50) NOT NULL UNIQUE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  
  -- Pricing
  base_price_cents INTEGER NOT NULL DEFAULT 0,
  currency VARCHAR(3) NOT NULL DEFAULT 'NOK',
  billing_interval VARCHAR(20) NOT NULL DEFAULT 'monthly', -- monthly, yearly, custom
  
  -- Limits
  max_tenants INTEGER,
  max_users_per_tenant INTEGER,
  max_rental_objects_per_tenant INTEGER,
  max_bookings_per_month INTEGER,
  max_storage_gb INTEGER,
  
  -- Features
  includes_api_access BOOLEAN NOT NULL DEFAULT false,
  includes_white_label BOOLEAN NOT NULL DEFAULT false,
  includes_custom_domain BOOLEAN NOT NULL DEFAULT false,
  includes_priority_support BOOLEAN NOT NULL DEFAULT false,
  
  -- Status
  is_active BOOLEAN NOT NULL DEFAULT true,
  is_public BOOLEAN NOT NULL DEFAULT true, -- Can users self-select?
  display_order INTEGER NOT NULL DEFAULT 0,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT valid_billing_interval CHECK (billing_interval IN ('monthly', 'yearly', 'custom'))
);

CREATE INDEX idx_plans_active ON saas.plans(is_active) WHERE is_active = true;
CREATE INDEX idx_plans_public ON saas.plans(is_public) WHERE is_public = true;

COMMENT ON TABLE saas.plans IS 'Subscription plan definitions (Free, Starter, Professional, Enterprise)';

-- =====================================================================
-- PLAN FEATURES
-- =====================================================================

CREATE TABLE saas.plan_features (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id UUID NOT NULL REFERENCES saas.plans(id) ON DELETE CASCADE,
  
  feature_key VARCHAR(100) NOT NULL,
  feature_name VARCHAR(255) NOT NULL,
  feature_description TEXT,
  feature_value TEXT, -- JSON or string value
  
  is_enabled BOOLEAN NOT NULL DEFAULT true,
  display_order INTEGER NOT NULL DEFAULT 0,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  
  CONSTRAINT uq_plan_feature UNIQUE (plan_id, feature_key)
);

CREATE INDEX idx_plan_features_plan ON saas.plan_features(plan_id);
CREATE INDEX idx_plan_features_enabled ON saas.plan_features(is_enabled) WHERE is_enabled = true;

COMMENT ON TABLE saas.plan_features IS 'Individual features included in each plan';

-- =====================================================================
-- TENANT SUBSCRIPTIONS
-- =====================================================================

CREATE TABLE saas.tenant_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES platform.tenants(id) ON DELETE CASCADE,
  plan_id UUID NOT NULL REFERENCES saas.plans(id),
  
  -- Status
  status VARCHAR(20) NOT NULL DEFAULT 'active',
  
  -- Billing
  current_period_start TIMESTAMP WITH TIME ZONE NOT NULL,
  current_period_end TIMESTAMP WITH TIME ZONE NOT NULL,
  trial_start TIMESTAMP WITH TIME ZONE,
  trial_end TIMESTAMP WITH TIME ZONE,
  
  -- Cancellation
  cancel_at_period_end BOOLEAN NOT NULL DEFAULT false,
  canceled_at TIMESTAMP WITH TIME ZONE,
  cancellation_reason TEXT,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  
  CONSTRAINT valid_subscription_status CHECK (status IN ('active', 'trialing', 'past_due', 'canceled', 'unpaid'))
);

CREATE INDEX idx_tenant_subscriptions_tenant ON saas.tenant_subscriptions(tenant_id);
CREATE INDEX idx_tenant_subscriptions_plan ON saas.tenant_subscriptions(plan_id);
CREATE INDEX idx_tenant_subscriptions_status ON saas.tenant_subscriptions(status);
CREATE INDEX idx_tenant_subscriptions_active ON saas.tenant_subscriptions(tenant_id, status) WHERE status = 'active';

COMMENT ON TABLE saas.tenant_subscriptions IS 'Links tenants to subscription plans with billing periods';

-- =====================================================================
-- LICENSES
-- =====================================================================

CREATE TABLE saas.licenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES platform.tenants(id) ON DELETE CASCADE,
  
  license_key VARCHAR(255) NOT NULL UNIQUE,
  license_type VARCHAR(50) NOT NULL DEFAULT 'standard', -- standard, trial, enterprise
  
  -- Scope
  user_id UUID REFERENCES platform.users(id) ON DELETE SET NULL, -- If user-specific
  organization_id UUID REFERENCES platform.organizations(id) ON DELETE SET NULL, -- If org-specific
  
  -- Validity
  issued_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  
  -- Usage tracking
  activation_count INTEGER NOT NULL DEFAULT 0,
  max_activations INTEGER,
  last_activated_at TIMESTAMP WITH TIME ZONE,
  
  -- Metadata
  notes TEXT,
  created_by UUID REFERENCES platform.users(id),
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_licenses_tenant ON saas.licenses(tenant_id);
CREATE INDEX idx_licenses_key ON saas.licenses(license_key);
CREATE INDEX idx_licenses_active ON saas.licenses(tenant_id, is_active) WHERE is_active = true;
CREATE INDEX idx_licenses_expires ON saas.licenses(expires_at) WHERE expires_at IS NOT NULL;

COMMENT ON TABLE saas.licenses IS 'Individual licenses for tenants, users, or organizations';

-- =====================================================================
-- FEATURE FLAGS (Global)
-- =====================================================================

CREATE TABLE saas.feature_flags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  flag_key VARCHAR(100) NOT NULL UNIQUE,
  flag_name VARCHAR(255) NOT NULL,
  description TEXT,
  
  -- Default behavior
  is_enabled_by_default BOOLEAN NOT NULL DEFAULT false,
  
  -- Rollout
  rollout_percentage INTEGER NOT NULL DEFAULT 0, -- 0-100
  
  -- Metadata
  category VARCHAR(50), -- e.g., 'billing', 'features', 'experimental'
  tags TEXT[], -- For filtering/searching
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  
  CONSTRAINT valid_rollout_percentage CHECK (rollout_percentage >= 0 AND rollout_percentage <= 100)
);

CREATE INDEX idx_feature_flags_key ON saas.feature_flags(flag_key);
CREATE INDEX idx_feature_flags_category ON saas.feature_flags(category);

COMMENT ON TABLE saas.feature_flags IS 'Global feature flag definitions';

-- =====================================================================
-- TENANT FEATURE FLAGS (Overrides)
-- =====================================================================

CREATE TABLE saas.tenant_feature_flags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES platform.tenants(id) ON DELETE CASCADE,
  feature_flag_id UUID NOT NULL REFERENCES saas.feature_flags(id) ON DELETE CASCADE,
  
  -- Override
  is_enabled BOOLEAN NOT NULL,
  
  -- Audit
  enabled_by UUID REFERENCES platform.users(id),
  enabled_at TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  
  CONSTRAINT uq_tenant_feature_flag UNIQUE (tenant_id, feature_flag_id)
);

CREATE INDEX idx_tenant_feature_flags_tenant ON saas.tenant_feature_flags(tenant_id);
CREATE INDEX idx_tenant_feature_flags_flag ON saas.tenant_feature_flags(feature_flag_id);
CREATE INDEX idx_tenant_feature_flags_enabled ON saas.tenant_feature_flags(tenant_id, is_enabled) WHERE is_enabled = true;

COMMENT ON TABLE saas.tenant_feature_flags IS 'Tenant-specific feature flag overrides';

-- =====================================================================
-- SEED DEFAULT PLANS
-- =====================================================================

INSERT INTO saas.plans (code, name, description, base_price_cents, billing_interval, max_tenants, max_users_per_tenant, max_rental_objects_per_tenant, is_public, display_order) VALUES
  ('FREE', 'Free Plan', 'Perfect for getting started', 0, 'monthly', 1, 5, 10, true, 1),
  ('STARTER', 'Starter Plan', 'For small organizations', 49900, 'monthly', 1, 25, 50, true, 2),
  ('PROFESSIONAL', 'Professional Plan', 'For growing businesses', 149900, 'monthly', 1, 100, 200, true, 3),
  ('ENTERPRISE', 'Enterprise Plan', 'For large organizations', 499900, 'monthly', NULL, NULL, NULL, false, 4)
ON CONFLICT (code) DO NOTHING;

-- =====================================================================
-- SEED DEFAULT FEATURE FLAGS
-- =====================================================================

INSERT INTO saas.feature_flags (flag_key, flag_name, description, is_enabled_by_default, category) VALUES
  ('advanced_analytics', 'Advanced Analytics', 'Enable advanced analytics dashboard', false, 'features'),
  ('white_label', 'White Label', 'Allow tenant to customize branding', false, 'features'),
  ('api_access', 'API Access', 'Enable programmatic API access', false, 'features'),
  ('custom_domain', 'Custom Domain', 'Allow custom domain configuration', false, 'features'),
  ('priority_support', 'Priority Support', 'Include priority support', false, 'features'),
  ('beta_features', 'Beta Features', 'Enable experimental beta features', false, 'experimental')
ON CONFLICT (flag_key) DO NOTHING;

-- =====================================================================
-- RLS POLICIES
-- =====================================================================

-- Plans are readable by all authenticated users
ALTER TABLE saas.plans ENABLE ROW LEVEL SECURITY;
CREATE POLICY plans_select_all ON saas.plans FOR SELECT USING (true);

-- Plan features are readable by all
ALTER TABLE saas.plan_features ENABLE ROW LEVEL SECURITY;
CREATE POLICY plan_features_select_all ON saas.plan_features FOR SELECT USING (true);

-- Tenant subscriptions: tenant-scoped
ALTER TABLE saas.tenant_subscriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_subscriptions_select ON saas.tenant_subscriptions FOR SELECT USING (
  tenant_id = current_setting('app.current_tenant_id', true)::uuid
);

-- Licenses: tenant-scoped
ALTER TABLE saas.licenses ENABLE ROW LEVEL SECURITY;
CREATE POLICY licenses_select ON saas.licenses FOR SELECT USING (
  tenant_id = current_setting('app.current_tenant_id', true)::uuid
);

-- Feature flags: readable by all
ALTER TABLE saas.feature_flags ENABLE ROW LEVEL SECURITY;
CREATE POLICY feature_flags_select_all ON saas.feature_flags FOR SELECT USING (true);

-- Tenant feature flags: tenant-scoped
ALTER TABLE saas.tenant_feature_flags ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_feature_flags_select ON saas.tenant_feature_flags FOR SELECT USING (
  tenant_id = current_setting('app.current_tenant_id', true)::uuid
);

-- =====================================================================
-- HELPER FUNCTIONS
-- =====================================================================

-- Get active subscription for tenant
CREATE OR REPLACE FUNCTION saas.get_active_subscription(p_tenant_id UUID)
RETURNS saas.tenant_subscriptions
LANGUAGE sql
STABLE
AS $$
  SELECT *
  FROM saas.tenant_subscriptions
  WHERE tenant_id = p_tenant_id
    AND status = 'active'
    AND current_period_end > NOW()
  ORDER BY current_period_start DESC
  LIMIT 1;
$$;

-- Check if feature is enabled for tenant
CREATE OR REPLACE FUNCTION saas.is_feature_enabled(p_tenant_id UUID, p_flag_key VARCHAR)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
AS $$
  SELECT COALESCE(
    (SELECT tff.is_enabled
     FROM saas.tenant_feature_flags tff
     JOIN saas.feature_flags ff ON ff.id = tff.feature_flag_id
     WHERE tff.tenant_id = p_tenant_id
       AND ff.flag_key = p_flag_key),
    (SELECT ff.is_enabled_by_default
     FROM saas.feature_flags ff
     WHERE ff.flag_key = p_flag_key),
    false
  );
$$;

COMMENT ON FUNCTION saas.is_feature_enabled IS 'Check if a feature flag is enabled for a tenant (respects overrides)';

-- =====================================================================
-- AUDIT TRIGGERS
-- =====================================================================

CREATE TRIGGER update_plans_timestamp
  BEFORE UPDATE ON saas.plans
  FOR EACH ROW
  EXECUTE FUNCTION platform.update_updated_at_column();

CREATE TRIGGER update_tenant_subscriptions_timestamp
  BEFORE UPDATE ON saas.tenant_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION platform.update_updated_at_column();

CREATE TRIGGER update_licenses_timestamp
  BEFORE UPDATE ON saas.licenses
  FOR EACH ROW
  EXECUTE FUNCTION platform.update_updated_at_column();

CREATE TRIGGER update_feature_flags_timestamp
  BEFORE UPDATE ON saas.feature_flags
  FOR EACH ROW
  EXECUTE FUNCTION platform.update_updated_at_column();

CREATE TRIGGER update_tenant_feature_flags_timestamp
  BEFORE UPDATE ON saas.tenant_feature_flags
  FOR EACH ROW
  EXECUTE FUNCTION platform.update_updated_at_column();
