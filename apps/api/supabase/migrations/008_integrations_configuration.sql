-- Integrations Configuration Table
-- Stores credentials and configuration for external integrations (ID-porten, Vipps, Visma, RCO, ACOS, etc.)

CREATE TABLE integrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,

  -- Integration identification
  provider VARCHAR(50) NOT NULL, -- 'idporten', 'vipps', 'visma', 'rco', 'acos', etc.
  name VARCHAR(255) NOT NULL, -- Display name
  status VARCHAR(20) NOT NULL DEFAULT 'inactive' CHECK (status IN ('active', 'inactive', 'error')),

  -- OAuth/API Configuration
  config JSONB NOT NULL DEFAULT '{}', -- Flexible config storage
  -- Example config structure:
  -- {
  --   "clientId": "...",
  --   "clientSecret": "...",
  --   "baseUrl": "...",
  --   "redirectUri": "...",
  --   "scopes": "...",
  --   "webhookSecret": "...",
  --   "apiKey": "...",
  --   "endpoints": { ... }
  -- }

  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  updated_by UUID REFERENCES users(id) ON DELETE SET NULL,

  -- Ensure one integration per provider per tenant
  UNIQUE(tenant_id, provider)
);

-- Indexes
CREATE INDEX integrations_tenant_id_idx ON integrations(tenant_id);
CREATE INDEX integrations_provider_idx ON integrations(provider);
CREATE INDEX integrations_status_idx ON integrations(status);

-- RLS Policies
ALTER TABLE integrations ENABLE ROW LEVEL SECURITY;

-- Tenants can only access their own integrations
CREATE POLICY tenant_integrations_isolation ON integrations
  FOR ALL
  USING (tenant_id = current_setting('app.current_tenant_id')::UUID);

-- Comments
COMMENT ON TABLE integrations IS 'External integration configuration and credentials';
COMMENT ON COLUMN integrations.provider IS 'Integration provider identifier (idporten, vipps, visma, rco, acos, etc.)';
COMMENT ON COLUMN integrations.config IS 'JSONB configuration including credentials, endpoints, and provider-specific settings';
COMMENT ON COLUMN integrations.status IS 'Integration status: active (enabled), inactive (disabled), error (connection failed)';

-- Seed default integration templates for main tenant
DO $$
DECLARE
  main_tenant_id UUID;
BEGIN
  -- Get main tenant ID
  SELECT id INTO main_tenant_id FROM tenants LIMIT 1;

  IF main_tenant_id IS NOT NULL THEN
    -- ID-porten / Signicat
    INSERT INTO integrations (tenant_id, provider, name, status, config) VALUES
    (main_tenant_id, 'idporten', 'ID-porten (BankID)', 'inactive', '{
      "clientId": "",
      "clientSecret": "",
      "baseUrl": "https://digilist.sandbox.signicat.com",
      "redirectUri": "https://api.digilist.no/api/auth/idporten/callback",
      "scopes": "signicat-api",
      "acrValues": "idp:nbid"
    }'::jsonb);

    -- Vipps
    INSERT INTO integrations (tenant_id, provider, name, status, config) VALUES
    (main_tenant_id, 'vipps', 'Vipps Payment', 'inactive', '{
      "clientId": "",
      "clientSecret": "",
      "subscriptionKey": "",
      "merchantSerialNumber": "",
      "baseUrl": "https://apitest.vipps.no",
      "webhookSecret": ""
    }'::jsonb);

    -- Visma
    INSERT INTO integrations (tenant_id, provider, name, status, config) VALUES
    (main_tenant_id, 'visma', 'Visma Integration', 'inactive', '{
      "apiKey": "",
      "companyId": "",
      "baseUrl": "https://api.visma.com"
    }'::jsonb);

    -- RCO (Resource Management)
    INSERT INTO integrations (tenant_id, provider, name, status, config) VALUES
    (main_tenant_id, 'rco', 'RCO Resource Management', 'inactive', '{
      "apiKey": "",
      "baseUrl": "",
      "username": "",
      "password": ""
    }'::jsonb);

    -- ACOS (Archive System)
    INSERT INTO integrations (tenant_id, provider, name, status, config) VALUES
    (main_tenant_id, 'acos', 'ACOS Arkivsystem', 'inactive', '{
      "apiKey": "",
      "baseUrl": "",
      "archiveId": ""
    }'::jsonb);
  END IF;
END $$;
