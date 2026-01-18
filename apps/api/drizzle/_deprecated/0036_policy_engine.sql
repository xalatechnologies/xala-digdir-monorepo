-- =====================================================================
-- Migration: 0036_policy_engine.sql
-- Purpose: Policy-Driven Configuration Engine (Versioned Policy Sets, Tenant Configs, Seed Blueprints, Message Templates)
-- Date: 2026-01-17
-- Implements: Phase 1 of Configuration-Driven Architecture Transformation
-- =====================================================================

-- =====================================================================
-- POLICY SETS (Versioned, Published)
-- Booking, Pricing, Approval, Payment, Availability, Privacy policies
-- =====================================================================

CREATE TABLE saas.policy_sets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES platform.tenants(id) ON DELETE CASCADE,
  
  -- Policy Type: booking, pricing, approval, payment, availability, privacy
  policy_type VARCHAR(50) NOT NULL,
  
  -- Versioning
  version INTEGER NOT NULL DEFAULT 1,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  
  -- Policy Rules (JSONB for flexibility)
  rules JSONB NOT NULL DEFAULT '{}',
  
  -- Workflow Status
  status VARCHAR(20) NOT NULL DEFAULT 'draft',
  published_at TIMESTAMP WITH TIME ZONE,
  published_by UUID REFERENCES platform.users(id),
  
  -- Audit
  created_by UUID REFERENCES platform.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT valid_policy_type CHECK (policy_type IN ('booking', 'pricing', 'approval', 'payment', 'availability', 'privacy', 'compliance')),
  CONSTRAINT valid_policy_status CHECK (status IN ('draft', 'published', 'archived', 'deprecated')),
  CONSTRAINT uq_policy_version UNIQUE (tenant_id, policy_type, version)
);

CREATE INDEX idx_policy_sets_tenant ON saas.policy_sets(tenant_id);
CREATE INDEX idx_policy_sets_type ON saas.policy_sets(policy_type);
CREATE INDEX idx_policy_sets_status ON saas.policy_sets(status);
CREATE INDEX idx_policy_sets_published ON saas.policy_sets(tenant_id, policy_type, status) WHERE status = 'published';

COMMENT ON TABLE saas.policy_sets IS 'Versioned policy configurations for booking, pricing, approval, and other domain behaviors';

-- =====================================================================
-- POLICY SET AUDIT LOG
-- Track all changes to policy sets
-- =====================================================================

CREATE TABLE saas.policy_set_audit (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  policy_set_id UUID NOT NULL REFERENCES saas.policy_sets(id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL REFERENCES platform.tenants(id) ON DELETE CASCADE,
  
  -- Change Details
  action VARCHAR(20) NOT NULL, -- 'create', 'update', 'publish', 'archive', 'rollback'
  old_state JSONB,
  new_state JSONB NOT NULL,
  
  -- Actor
  actor_user_id UUID REFERENCES platform.users(id),
  reason TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  
  CONSTRAINT valid_audit_action CHECK (action IN ('create', 'update', 'publish', 'archive', 'rollback', 'deprecate'))
);

CREATE INDEX idx_policy_set_audit_policy ON saas.policy_set_audit(policy_set_id);
CREATE INDEX idx_policy_set_audit_tenant ON saas.policy_set_audit(tenant_id);
CREATE INDEX idx_policy_set_audit_action ON saas.policy_set_audit(action);
CREATE INDEX idx_policy_set_audit_time ON saas.policy_set_audit(created_at DESC);

COMMENT ON TABLE saas.policy_set_audit IS 'Audit trail for all policy set modifications';

-- =====================================================================
-- TENANT CONFIGS (Versioned, Published)
-- General tenant configuration with draft/publish workflow
-- =====================================================================

CREATE TABLE saas.tenant_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES platform.tenants(id) ON DELETE CASCADE,
  
  -- Config Type: booking_defaults, ui_settings, integrations, compliance, notifications
  config_type VARCHAR(50) NOT NULL,
  
  -- Versioning
  version INTEGER NOT NULL DEFAULT 1,
  name VARCHAR(255),
  description TEXT,
  
  -- Configuration Data
  data JSONB NOT NULL DEFAULT '{}',
  
  -- Workflow Status
  status VARCHAR(20) NOT NULL DEFAULT 'draft',
  published_at TIMESTAMP WITH TIME ZONE,
  published_by UUID REFERENCES platform.users(id),
  
  -- Audit
  created_by UUID REFERENCES platform.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  
  CONSTRAINT valid_config_type CHECK (config_type IN ('booking_defaults', 'ui_settings', 'integrations', 'compliance', 'notifications', 'branding', 'localization')),
  CONSTRAINT valid_config_status CHECK (status IN ('draft', 'published', 'archived')),
  CONSTRAINT uq_tenant_config_version UNIQUE (tenant_id, config_type, version)
);

CREATE INDEX idx_tenant_configs_tenant ON saas.tenant_configs(tenant_id);
CREATE INDEX idx_tenant_configs_type ON saas.tenant_configs(config_type);
CREATE INDEX idx_tenant_configs_status ON saas.tenant_configs(status);
CREATE INDEX idx_tenant_configs_published ON saas.tenant_configs(tenant_id, config_type, status) WHERE status = 'published';

COMMENT ON TABLE saas.tenant_configs IS 'Versioned tenant configuration with draft/publish workflow';

-- =====================================================================
-- SEED BLUEPRINTS
-- Templates for demo tenant generation
-- =====================================================================

CREATE TABLE saas.seed_blueprints (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Blueprint Identity
  name VARCHAR(255) NOT NULL,
  code VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  
  -- Blueprint Definition
  blueprint JSONB NOT NULL DEFAULT '{}',
  -- Structure: { entities: { users: [...], organizations: [...], rental_objects: [...], bookings: [...] }, relationships: [...], config: {...} }
  
  -- Categorization
  category VARCHAR(50) NOT NULL DEFAULT 'demo', -- demo, test, production_template
  tags TEXT[] DEFAULT '{}',
  
  -- Status
  is_default BOOLEAN NOT NULL DEFAULT false,
  is_active BOOLEAN NOT NULL DEFAULT true,
  
  -- Audit
  created_by UUID REFERENCES platform.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  
  CONSTRAINT valid_blueprint_category CHECK (category IN ('demo', 'test', 'production_template', 'migration'))
);

CREATE INDEX idx_seed_blueprints_code ON saas.seed_blueprints(code);
CREATE INDEX idx_seed_blueprints_category ON saas.seed_blueprints(category);
CREATE INDEX idx_seed_blueprints_active ON saas.seed_blueprints(is_active) WHERE is_active = true;
CREATE INDEX idx_seed_blueprints_default ON saas.seed_blueprints(is_default) WHERE is_default = true;

COMMENT ON TABLE saas.seed_blueprints IS 'Templates for generating demo tenants with predefined data';

-- =====================================================================
-- SEED EXECUTIONS
-- Track seed blueprint executions for rollback support
-- =====================================================================

CREATE TABLE saas.seed_executions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES platform.tenants(id) ON DELETE CASCADE,
  blueprint_id UUID REFERENCES saas.seed_blueprints(id) ON DELETE SET NULL,
  
  -- Execution Status
  status VARCHAR(20) NOT NULL DEFAULT 'pending',
  
  -- Results
  entities_created JSONB DEFAULT '{}',
  -- Structure: { users: [ids], organizations: [ids], rental_objects: [ids], bookings: [ids] }
  
  entity_counts JSONB DEFAULT '{}',
  -- Quick lookup: { users: 10, organizations: 5, rental_objects: 20 }
  
  -- Error Handling
  error_log TEXT,
  warnings JSONB DEFAULT '[]',
  
  -- Rollback Support
  rollback_available BOOLEAN NOT NULL DEFAULT true,
  rolled_back_at TIMESTAMP WITH TIME ZONE,
  rolled_back_by UUID REFERENCES platform.users(id),
  
  -- Timing
  executed_by UUID REFERENCES platform.users(id),
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  duration_ms INTEGER,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  
  CONSTRAINT valid_execution_status CHECK (status IN ('pending', 'running', 'completed', 'failed', 'rolled_back', 'partial'))
);

CREATE INDEX idx_seed_executions_tenant ON saas.seed_executions(tenant_id);
CREATE INDEX idx_seed_executions_blueprint ON saas.seed_executions(blueprint_id);
CREATE INDEX idx_seed_executions_status ON saas.seed_executions(status);
CREATE INDEX idx_seed_executions_time ON saas.seed_executions(created_at DESC);

COMMENT ON TABLE saas.seed_executions IS 'Audit trail for seed blueprint executions with rollback support';

-- =====================================================================
-- MESSAGE TEMPLATES (Versioned)
-- Email, SMS, Push notification templates
-- =====================================================================

CREATE TABLE saas.message_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Scope: NULL = platform default, UUID = tenant override
  tenant_id UUID REFERENCES platform.tenants(id) ON DELETE CASCADE,
  
  -- Template Identity
  template_key VARCHAR(100) NOT NULL,
  channel VARCHAR(20) NOT NULL,
  
  -- Versioning
  version INTEGER NOT NULL DEFAULT 1,
  name VARCHAR(255),
  
  -- Content (i18n)
  subject JSONB, -- { nb: '...', en: '...' } - for email
  body JSONB NOT NULL, -- { nb: '...', en: '...' }
  
  -- Template Variables
  variables TEXT[] NOT NULL DEFAULT '{}',
  -- e.g., ['{{user.name}}', '{{booking.date}}', '{{rental_object.name}}']
  
  -- Rendering Hints
  content_type VARCHAR(20) NOT NULL DEFAULT 'html', -- text, html, markdown
  
  -- Status
  status VARCHAR(20) NOT NULL DEFAULT 'draft',
  published_at TIMESTAMP WITH TIME ZONE,
  published_by UUID REFERENCES platform.users(id),
  
  -- Audit
  created_by UUID REFERENCES platform.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  
  CONSTRAINT valid_template_channel CHECK (channel IN ('email', 'sms', 'push', 'in_app')),
  CONSTRAINT valid_template_status CHECK (status IN ('draft', 'published', 'archived')),
  CONSTRAINT valid_content_type CHECK (content_type IN ('text', 'html', 'markdown')),
  CONSTRAINT uq_message_template_version UNIQUE (tenant_id, template_key, channel, version)
);

CREATE INDEX idx_message_templates_tenant ON saas.message_templates(tenant_id);
CREATE INDEX idx_message_templates_key ON saas.message_templates(template_key);
CREATE INDEX idx_message_templates_channel ON saas.message_templates(channel);
CREATE INDEX idx_message_templates_status ON saas.message_templates(status);
CREATE INDEX idx_message_templates_published ON saas.message_templates(tenant_id, template_key, channel, status) WHERE status = 'published';
CREATE INDEX idx_message_templates_platform ON saas.message_templates(template_key, channel) WHERE tenant_id IS NULL;

COMMENT ON TABLE saas.message_templates IS 'Versioned message templates for email, SMS, and push notifications';

-- =====================================================================
-- RENTAL OBJECT POLICIES (Links rental objects to policy sets)
-- =====================================================================

CREATE TABLE saas.rental_object_policies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES platform.tenants(id) ON DELETE CASCADE,
  rental_object_id UUID NOT NULL REFERENCES domain.rental_objects(id) ON DELETE CASCADE,
  
  -- Policy References
  booking_policy_id UUID REFERENCES saas.policy_sets(id) ON DELETE SET NULL,
  pricing_policy_id UUID REFERENCES saas.policy_sets(id) ON DELETE SET NULL,
  approval_policy_id UUID REFERENCES saas.policy_sets(id) ON DELETE SET NULL,
  payment_policy_id UUID REFERENCES saas.policy_sets(id) ON DELETE SET NULL,
  availability_policy_id UUID REFERENCES saas.policy_sets(id) ON DELETE SET NULL,
  
  -- Fallback Behavior
  use_tenant_defaults BOOLEAN NOT NULL DEFAULT true,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  
  CONSTRAINT uq_rental_object_policies UNIQUE (tenant_id, rental_object_id)
);

CREATE INDEX idx_rental_object_policies_tenant ON saas.rental_object_policies(tenant_id);
CREATE INDEX idx_rental_object_policies_ro ON saas.rental_object_policies(rental_object_id);

COMMENT ON TABLE saas.rental_object_policies IS 'Maps rental objects to specific policy sets (or tenant defaults)';

-- =====================================================================
-- SEED DEFAULT BLUEPRINTS
-- =====================================================================

INSERT INTO saas.seed_blueprints (code, name, description, category, is_default, blueprint) VALUES
  ('demo_kommune', 'Demo Kommune', 'Standard Norwegian municipality demo with sports halls, meeting rooms, and equipment', 'demo', true, '{
    "entities": {
      "organizations": [
        {"name": "Idrettslag A", "type": "sports_club"},
        {"name": "Kulturforening B", "type": "cultural"}
      ],
      "rental_objects": [
        {"category": "LOKALER_OG_BANER", "name": "Storhall", "capacity": 200},
        {"category": "LOKALER_OG_BANER", "name": "Lillesal", "capacity": 50},
        {"category": "ARRANGEMENT", "name": "Møterom 1", "capacity": 20}
      ],
      "users": 10,
      "bookings": 25
    },
    "config": {
      "locale": "nb-NO",
      "timezone": "Europe/Oslo"
    }
  }'::jsonb),
  ('small_test', 'Lite Testmiljø', 'Minimal data for unit testing', 'test', false, '{
    "entities": {
      "organizations": 1,
      "rental_objects": 2,
      "users": 3,
      "bookings": 5
    }
  }'::jsonb),
  ('large_production', 'Stort Produksjonsmiljø', 'Large-scale demo for enterprise customers', 'demo', false, '{
    "entities": {
      "organizations": 25,
      "rental_objects": 100,
      "users": 500,
      "bookings": 1000
    },
    "config": {
      "include_history": true,
      "history_months": 12
    }
  }'::jsonb)
ON CONFLICT (code) DO NOTHING;

-- =====================================================================
-- SEED DEFAULT MESSAGE TEMPLATES
-- =====================================================================

INSERT INTO saas.message_templates (template_key, channel, name, subject, body, variables, status, published_at, content_type) VALUES
  ('booking_confirmation', 'email', 'Booking Confirmation', 
   '{"nb": "Bekreftelse på booking", "en": "Booking Confirmation"}'::jsonb,
   '{"nb": "Hei {{user.name}},\n\nDin booking av {{rental_object.name}} er bekreftet.\n\nDato: {{booking.date}}\nTid: {{booking.time}}\n\nVennlig hilsen,\n{{tenant.name}}", "en": "Hi {{user.name}},\n\nYour booking of {{rental_object.name}} has been confirmed.\n\nDate: {{booking.date}}\nTime: {{booking.time}}\n\nBest regards,\n{{tenant.name}}"}'::jsonb,
   ARRAY['{{user.name}}', '{{rental_object.name}}', '{{booking.date}}', '{{booking.time}}', '{{tenant.name}}'],
   'published', NOW(), 'html'),
  
  ('booking_reminder', 'email', 'Booking Reminder',
   '{"nb": "Påminnelse: Din booking i morgen", "en": "Reminder: Your booking tomorrow"}'::jsonb,
   '{"nb": "Hei {{user.name}},\n\nDette er en påminnelse om din booking i morgen.\n\n{{rental_object.name}}\n{{booking.date}} kl. {{booking.time}}\n\nVi ser frem til å se deg!", "en": "Hi {{user.name}},\n\nThis is a reminder about your booking tomorrow.\n\n{{rental_object.name}}\n{{booking.date}} at {{booking.time}}\n\nWe look forward to seeing you!"}'::jsonb,
   ARRAY['{{user.name}}', '{{rental_object.name}}', '{{booking.date}}', '{{booking.time}}'],
   'published', NOW(), 'html'),
  
  ('booking_cancelled', 'email', 'Booking Cancelled',
   '{"nb": "Booking kansellert", "en": "Booking Cancelled"}'::jsonb,
   '{"nb": "Hei {{user.name}},\n\nDin booking av {{rental_object.name}} den {{booking.date}} er kansellert.\n\nÅrsak: {{cancellation.reason}}", "en": "Hi {{user.name}},\n\nYour booking of {{rental_object.name}} on {{booking.date}} has been cancelled.\n\nReason: {{cancellation.reason}}"}'::jsonb,
   ARRAY['{{user.name}}', '{{rental_object.name}}', '{{booking.date}}', '{{cancellation.reason}}'],
   'published', NOW(), 'html'),
   
  ('booking_pending_approval', 'email', 'Booking Pending Approval',
   '{"nb": "Booking venter på godkjenning", "en": "Booking Pending Approval"}'::jsonb,
   '{"nb": "Hei {{user.name}},\n\nDin booking av {{rental_object.name}} venter på godkjenning.\n\nDu vil motta en bekreftelse når bookingen er behandlet.", "en": "Hi {{user.name}},\n\nYour booking of {{rental_object.name}} is pending approval.\n\nYou will receive a confirmation once the booking is processed."}'::jsonb,
   ARRAY['{{user.name}}', '{{rental_object.name}}'],
   'published', NOW(), 'html')
ON CONFLICT DO NOTHING;

-- =====================================================================
-- RLS POLICIES
-- =====================================================================

-- Policy Sets: tenant-scoped
ALTER TABLE saas.policy_sets ENABLE ROW LEVEL SECURITY;
CREATE POLICY policy_sets_tenant_select ON saas.policy_sets FOR SELECT USING (
  tenant_id = current_setting('app.current_tenant_id', true)::uuid
);
CREATE POLICY policy_sets_tenant_all ON saas.policy_sets FOR ALL USING (
  tenant_id = current_setting('app.current_tenant_id', true)::uuid
);

-- Policy Set Audit: tenant-scoped
ALTER TABLE saas.policy_set_audit ENABLE ROW LEVEL SECURITY;
CREATE POLICY policy_set_audit_tenant ON saas.policy_set_audit FOR SELECT USING (
  tenant_id = current_setting('app.current_tenant_id', true)::uuid
);

-- Tenant Configs: tenant-scoped
ALTER TABLE saas.tenant_configs ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_configs_tenant_select ON saas.tenant_configs FOR SELECT USING (
  tenant_id = current_setting('app.current_tenant_id', true)::uuid
);
CREATE POLICY tenant_configs_tenant_all ON saas.tenant_configs FOR ALL USING (
  tenant_id = current_setting('app.current_tenant_id', true)::uuid
);

-- Seed Blueprints: readable by all (admin only for write)
ALTER TABLE saas.seed_blueprints ENABLE ROW LEVEL SECURITY;
CREATE POLICY seed_blueprints_select_all ON saas.seed_blueprints FOR SELECT USING (true);

-- Seed Executions: tenant-scoped
ALTER TABLE saas.seed_executions ENABLE ROW LEVEL SECURITY;
CREATE POLICY seed_executions_tenant ON saas.seed_executions FOR SELECT USING (
  tenant_id = current_setting('app.current_tenant_id', true)::uuid
);

-- Message Templates: tenant-scoped or platform (NULL tenant_id)
ALTER TABLE saas.message_templates ENABLE ROW LEVEL SECURITY;
CREATE POLICY message_templates_select ON saas.message_templates FOR SELECT USING (
  tenant_id IS NULL OR tenant_id = current_setting('app.current_tenant_id', true)::uuid
);
CREATE POLICY message_templates_tenant_all ON saas.message_templates FOR ALL USING (
  tenant_id = current_setting('app.current_tenant_id', true)::uuid
);

-- Rental Object Policies: tenant-scoped
ALTER TABLE saas.rental_object_policies ENABLE ROW LEVEL SECURITY;
CREATE POLICY rental_object_policies_tenant ON saas.rental_object_policies FOR ALL USING (
  tenant_id = current_setting('app.current_tenant_id', true)::uuid
);

-- =====================================================================
-- HELPER FUNCTIONS
-- =====================================================================

-- Get published policy for tenant
CREATE OR REPLACE FUNCTION saas.get_published_policy(
  p_tenant_id UUID,
  p_policy_type VARCHAR
)
RETURNS saas.policy_sets
LANGUAGE sql
STABLE
AS $$
  SELECT *
  FROM saas.policy_sets
  WHERE tenant_id = p_tenant_id
    AND policy_type = p_policy_type
    AND status = 'published'
  ORDER BY version DESC
  LIMIT 1;
$$;

COMMENT ON FUNCTION saas.get_published_policy IS 'Get the latest published policy of a given type for a tenant';

-- Get published config for tenant
CREATE OR REPLACE FUNCTION saas.get_published_config(
  p_tenant_id UUID,
  p_config_type VARCHAR
)
RETURNS saas.tenant_configs
LANGUAGE sql
STABLE
AS $$
  SELECT *
  FROM saas.tenant_configs
  WHERE tenant_id = p_tenant_id
    AND config_type = p_config_type
    AND status = 'published'
  ORDER BY version DESC
  LIMIT 1;
$$;

COMMENT ON FUNCTION saas.get_published_config IS 'Get the latest published config of a given type for a tenant';

-- Get message template (with fallback to platform default)
CREATE OR REPLACE FUNCTION saas.get_message_template(
  p_tenant_id UUID,
  p_template_key VARCHAR,
  p_channel VARCHAR
)
RETURNS saas.message_templates
LANGUAGE sql
STABLE
AS $$
  SELECT *
  FROM saas.message_templates
  WHERE template_key = p_template_key
    AND channel = p_channel
    AND status = 'published'
    AND (tenant_id = p_tenant_id OR tenant_id IS NULL)
  ORDER BY tenant_id DESC NULLS LAST, version DESC
  LIMIT 1;
$$;

COMMENT ON FUNCTION saas.get_message_template IS 'Get message template with tenant override fallback to platform default';

-- =====================================================================
-- AUDIT TRIGGERS
-- =====================================================================

CREATE TRIGGER update_policy_sets_timestamp
  BEFORE UPDATE ON saas.policy_sets
  FOR EACH ROW
  EXECUTE FUNCTION platform.update_updated_at_column();

CREATE TRIGGER update_tenant_configs_timestamp
  BEFORE UPDATE ON saas.tenant_configs
  FOR EACH ROW
  EXECUTE FUNCTION platform.update_updated_at_column();

CREATE TRIGGER update_seed_blueprints_timestamp
  BEFORE UPDATE ON saas.seed_blueprints
  FOR EACH ROW
  EXECUTE FUNCTION platform.update_updated_at_column();

CREATE TRIGGER update_message_templates_timestamp
  BEFORE UPDATE ON saas.message_templates
  FOR EACH ROW
  EXECUTE FUNCTION platform.update_updated_at_column();

CREATE TRIGGER update_rental_object_policies_timestamp
  BEFORE UPDATE ON saas.rental_object_policies
  FOR EACH ROW
  EXECUTE FUNCTION platform.update_updated_at_column();

-- =====================================================================
-- END OF MIGRATION
-- =====================================================================
