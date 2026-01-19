-- Migration: auth_demo_tokens
-- Description: Create auth_demo_tokens table for secure demo role-based login

CREATE TABLE IF NOT EXISTS platform.auth_demo_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key VARCHAR(50) NOT NULL UNIQUE,
  tenant_id UUID REFERENCES platform.tenants(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES platform.organizations(id) ON DELETE SET NULL,
  user_id UUID NOT NULL REFERENCES platform.users(id) ON DELETE CASCADE,
  token_hash TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS auth_demo_tokens_key_idx ON platform.auth_demo_tokens(key);
CREATE INDEX IF NOT EXISTS auth_demo_tokens_tenant_idx ON platform.auth_demo_tokens(tenant_id);
CREATE INDEX IF NOT EXISTS auth_demo_tokens_user_idx ON platform.auth_demo_tokens(user_id);
CREATE INDEX IF NOT EXISTS auth_demo_tokens_active_idx ON platform.auth_demo_tokens(is_active);

COMMENT ON TABLE platform.auth_demo_tokens IS 'Secure demo login tokens mapped to roles for one-click demo authentication';
COMMENT ON COLUMN platform.auth_demo_tokens.key IS 'Role key (admin, case_handler, org_admin, org_member)';
COMMENT ON COLUMN platform.auth_demo_tokens.token_hash IS 'Hashed token for verification - never expose plaintext';
