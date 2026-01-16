-- Migration: Add Session Management Tables
-- Description: Implements industry-standard session management with refresh token rotation
-- Date: 2026-01-16
-- Author: Claude Code (Cookie Authentication Migration)

-- =============================================================================
-- Sessions Table
-- =============================================================================
-- Stores active user sessions with refresh tokens
-- Each session represents one authenticated device/browser
-- Refresh tokens are hashed (SHA-256) for security

CREATE TABLE IF NOT EXISTS sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- User and tenant references
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,

  -- Authentication tokens
  refresh_token_hash TEXT NOT NULL UNIQUE,  -- SHA-256 hash of refresh token
  access_token_jti TEXT,                    -- JWT ID for access token revocation (optional)

  -- Session metadata
  user_agent TEXT,                          -- Browser/device info
  ip_address TEXT,                          -- Client IP address

  -- Lifecycle timestamps
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  last_refreshed_at TIMESTAMP,              -- Last time tokens were rotated
  expires_at TIMESTAMP NOT NULL,            -- Refresh token expiry (7 days)

  -- Revocation
  revoked_at TIMESTAMP,                     -- When session was revoked
  revoked_reason TEXT,                      -- Why: 'user_logout', 'expired', 'security_event'

  -- Constraints
  CONSTRAINT sessions_expires_at_check CHECK (expires_at > created_at)
);

-- =============================================================================
-- Indexes for Performance
-- =============================================================================

-- Critical for session lookup on every request
CREATE INDEX idx_sessions_user_id ON sessions(user_id);
CREATE INDEX idx_sessions_tenant_id ON sessions(tenant_id);

-- Critical for refresh token rotation (most frequent query)
CREATE INDEX idx_sessions_refresh_token_hash
  ON sessions(refresh_token_hash)
  WHERE revoked_at IS NULL;

-- For session cleanup cron job
CREATE INDEX idx_sessions_expires_at
  ON sessions(expires_at)
  WHERE revoked_at IS NULL;

-- For user session listing (admin/security features)
CREATE INDEX idx_sessions_user_tenant
  ON sessions(user_id, tenant_id)
  WHERE revoked_at IS NULL;

-- =============================================================================
-- Comments for Documentation
-- =============================================================================

COMMENT ON TABLE sessions IS 'Active user sessions with refresh token management';
COMMENT ON COLUMN sessions.id IS 'Unique session identifier';
COMMENT ON COLUMN sessions.user_id IS 'User who owns this session';
COMMENT ON COLUMN sessions.tenant_id IS 'Tenant context for this session';
COMMENT ON COLUMN sessions.refresh_token_hash IS 'SHA-256 hash of refresh token (never store plaintext)';
COMMENT ON COLUMN sessions.access_token_jti IS 'JWT ID for access token revocation (optional, for immediate revocation)';
COMMENT ON COLUMN sessions.user_agent IS 'Browser/device user agent string';
COMMENT ON COLUMN sessions.ip_address IS 'Client IP address at session creation';
COMMENT ON COLUMN sessions.last_refreshed_at IS 'Timestamp of last token rotation';
COMMENT ON COLUMN sessions.expires_at IS 'When refresh token expires (7 days from creation)';
COMMENT ON COLUMN sessions.revoked_at IS 'When session was revoked (logout, security event)';
COMMENT ON COLUMN sessions.revoked_reason IS 'Reason for revocation: user_logout, expired, security_event, admin_revoke';

-- =============================================================================
-- Audit Log Enhancement (Optional but Recommended)
-- =============================================================================
-- Add session_id to audit_logs for better traceability

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'audit_logs' AND column_name = 'session_id'
  ) THEN
    ALTER TABLE audit_logs ADD COLUMN session_id UUID REFERENCES sessions(id) ON DELETE SET NULL;
    CREATE INDEX idx_audit_logs_session_id ON audit_logs(session_id);
    COMMENT ON COLUMN audit_logs.session_id IS 'Session that performed this action';
  END IF;
END $$;

-- =============================================================================
-- Function: Clean up expired sessions
-- =============================================================================
-- Can be called by cron job or manually

CREATE OR REPLACE FUNCTION cleanup_expired_sessions()
RETURNS TABLE(deleted_count BIGINT) AS $$
BEGIN
  RETURN QUERY
  WITH deleted AS (
    DELETE FROM sessions
    WHERE expires_at < NOW()
      AND revoked_at IS NULL
    RETURNING *
  )
  SELECT COUNT(*)::BIGINT FROM deleted;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION cleanup_expired_sessions() IS 'Delete expired sessions (run hourly via cron)';

-- =============================================================================
-- Function: Revoke all sessions for a user
-- =============================================================================
-- Useful for security events or admin actions

CREATE OR REPLACE FUNCTION revoke_user_sessions(
  p_user_id UUID,
  p_reason TEXT DEFAULT 'admin_revoke'
)
RETURNS TABLE(revoked_count BIGINT) AS $$
BEGIN
  RETURN QUERY
  WITH revoked AS (
    UPDATE sessions
    SET
      revoked_at = NOW(),
      revoked_reason = p_reason
    WHERE user_id = p_user_id
      AND revoked_at IS NULL
    RETURNING *
  )
  SELECT COUNT(*)::BIGINT FROM revoked;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION revoke_user_sessions(UUID, TEXT) IS 'Revoke all active sessions for a user';

-- =============================================================================
-- Sample Queries for Testing
-- =============================================================================

-- Get active sessions for a user
-- SELECT
--   id,
--   user_agent,
--   ip_address,
--   created_at,
--   last_refreshed_at,
--   expires_at
-- FROM sessions
-- WHERE user_id = '<user_id>'
--   AND revoked_at IS NULL
--   AND expires_at > NOW()
-- ORDER BY last_refreshed_at DESC NULLS LAST;

-- Count active sessions by tenant
-- SELECT
--   t.name AS tenant_name,
--   COUNT(s.id) AS active_sessions
-- FROM tenants t
-- LEFT JOIN sessions s ON s.tenant_id = t.id
--   AND s.revoked_at IS NULL
--   AND s.expires_at > NOW()
-- GROUP BY t.id, t.name
-- ORDER BY active_sessions DESC;

-- Find sessions expiring soon (< 1 hour)
-- SELECT
--   u.email,
--   s.expires_at,
--   EXTRACT(EPOCH FROM (s.expires_at - NOW())) / 60 AS minutes_remaining
-- FROM sessions s
-- JOIN users u ON u.id = s.user_id
-- WHERE s.revoked_at IS NULL
--   AND s.expires_at > NOW()
--   AND s.expires_at < NOW() + INTERVAL '1 hour'
-- ORDER BY s.expires_at;

-- =============================================================================
-- Rollback Commands (if needed)
-- =============================================================================

-- DROP FUNCTION IF EXISTS cleanup_expired_sessions();
-- DROP FUNCTION IF EXISTS revoke_user_sessions(UUID, TEXT);
-- ALTER TABLE audit_logs DROP COLUMN IF EXISTS session_id;
-- DROP INDEX IF EXISTS idx_sessions_user_id;
-- DROP INDEX IF EXISTS idx_sessions_tenant_id;
-- DROP INDEX IF EXISTS idx_sessions_refresh_token_hash;
-- DROP INDEX IF EXISTS idx_sessions_expires_at;
-- DROP INDEX IF EXISTS idx_sessions_user_tenant;
-- DROP TABLE IF EXISTS sessions CASCADE;
