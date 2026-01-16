-- Migration: Add Integration Credentials Tables with Encryption
-- Date: 2026-01-15
-- Description: Creates tables for encrypted storage of integration API keys, secrets, and certificates

-- Enable pgcrypto extension for additional crypto functions if needed
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ============================================================================
-- Integration Credentials Table
-- Stores encrypted API keys, client secrets, certificates, etc.
-- ============================================================================

CREATE TABLE IF NOT EXISTS integration_credentials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    integration_id UUID NOT NULL REFERENCES integrations(id) ON DELETE CASCADE,
    
    -- Credential identification
    credential_type VARCHAR(50) NOT NULL, -- 'api_key', 'client_secret', 'certificate', 'oauth_token', 'webhook_secret'
    name VARCHAR(100) NOT NULL, -- Human-readable name, e.g., 'Production API Key'
    
    -- Encrypted value storage (AES-256-GCM)
    encrypted_value TEXT NOT NULL, -- Base64-encoded encrypted value
    encryption_iv VARCHAR(32) NOT NULL, -- Hex-encoded initialization vector
    encryption_tag VARCHAR(32) NOT NULL, -- Hex-encoded authentication tag
    encryption_version INTEGER NOT NULL DEFAULT 1, -- For key rotation support
    
    -- Metadata (non-sensitive)
    expires_at TIMESTAMPTZ, -- For tokens/certs with expiration
    last_used_at TIMESTAMPTZ, -- Track usage for security monitoring
    last_rotated_at TIMESTAMPTZ, -- Track key rotation
    is_active BOOLEAN NOT NULL DEFAULT true,
    
    -- Audit trail
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    updated_by UUID REFERENCES users(id) ON DELETE SET NULL,
    
    -- Additional metadata (non-sensitive config)
    metadata JSONB DEFAULT '{}'::jsonb,
    
    -- Constraints
    CONSTRAINT integration_credentials_type_check CHECK (
        credential_type IN ('api_key', 'client_id', 'client_secret', 'certificate', 'private_key', 
                           'oauth_token', 'oauth_refresh_token', 'webhook_secret', 'bearer_token')
    )
);

-- Indexes for integration_credentials
CREATE INDEX IF NOT EXISTS integration_credentials_tenant_idx 
    ON integration_credentials(tenant_id);
CREATE INDEX IF NOT EXISTS integration_credentials_integration_idx 
    ON integration_credentials(integration_id);
CREATE INDEX IF NOT EXISTS integration_credentials_type_idx 
    ON integration_credentials(credential_type);
CREATE INDEX IF NOT EXISTS integration_credentials_active_idx 
    ON integration_credentials(is_active);
CREATE INDEX IF NOT EXISTS integration_credentials_expires_idx 
    ON integration_credentials(expires_at);
CREATE UNIQUE INDEX IF NOT EXISTS integration_credentials_integration_type_unique 
    ON integration_credentials(integration_id, credential_type, name);

-- Note: Integration credential auditing uses the central audit_logs table
-- with resource='credential' for unified audit management

-- ============================================================================
-- Row-Level Security Policies
-- Ensure tenants can only access their own credentials
-- ============================================================================

-- Enable RLS on integration_credentials
ALTER TABLE integration_credentials ENABLE ROW LEVEL SECURITY;

-- Policy: Tenant isolation for integration_credentials
CREATE POLICY integration_credentials_tenant_isolation ON integration_credentials
    FOR ALL
    USING (tenant_id = current_setting('app.current_tenant_id', true)::uuid)
    WITH CHECK (tenant_id = current_setting('app.current_tenant_id', true)::uuid);

-- ============================================================================
-- Trigger for updated_at
-- ============================================================================

CREATE OR REPLACE FUNCTION update_integration_credentials_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER integration_credentials_updated_at_trigger
    BEFORE UPDATE ON integration_credentials
    FOR EACH ROW
    EXECUTE FUNCTION update_integration_credentials_updated_at();

-- ============================================================================
-- Comments for documentation
-- ============================================================================

COMMENT ON TABLE integration_credentials IS 
    'Encrypted storage for integration API keys, secrets, and certificates. Values are encrypted using AES-256-GCM.';

COMMENT ON COLUMN integration_credentials.encrypted_value IS 
    'Base64-encoded AES-256-GCM encrypted value. Never log or expose this field.';

COMMENT ON COLUMN integration_credentials.encryption_iv IS 
    'Hex-encoded 12-byte initialization vector used for encryption. Unique per credential.';

COMMENT ON COLUMN integration_credentials.encryption_tag IS 
    'Hex-encoded 16-byte GCM authentication tag for integrity verification.';

COMMENT ON COLUMN integration_credentials.encryption_version IS 
    'Version of encryption key used. Allows for key rotation without re-encrypting all values immediately.';

-- Note: Credential access auditing uses the central audit_logs table with resource='credential'
