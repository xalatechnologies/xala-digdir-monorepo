-- =====================================================================
-- 0032: NOTIFICATION USER PREFERENCES
-- Allow users to configure notification channels and types
-- =====================================================================

-- =====================================================================
-- Notification User Preferences
-- =====================================================================

CREATE TABLE IF NOT EXISTS domain.notification_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES platform.users(id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL REFERENCES platform.tenants(id) ON DELETE CASCADE,

  -- Channel preferences (global toggles)
  in_app_enabled BOOLEAN NOT NULL DEFAULT TRUE,
  email_enabled BOOLEAN NOT NULL DEFAULT TRUE,
  sms_enabled BOOLEAN NOT NULL DEFAULT FALSE,
  push_enabled BOOLEAN NOT NULL DEFAULT TRUE,

  -- Notification type preferences
  booking_created BOOLEAN NOT NULL DEFAULT TRUE,
  booking_approved BOOLEAN NOT NULL DEFAULT TRUE,
  booking_rejected BOOLEAN NOT NULL DEFAULT TRUE,
  booking_cancelled BOOLEAN NOT NULL DEFAULT TRUE,
  booking_changed BOOLEAN NOT NULL DEFAULT TRUE,

  reminder_24h BOOLEAN NOT NULL DEFAULT TRUE,
  reminder_2h BOOLEAN NOT NULL DEFAULT TRUE,

  system_notifications BOOLEAN NOT NULL DEFAULT TRUE,
  admin_messages BOOLEAN NOT NULL DEFAULT TRUE,

  invoice_available BOOLEAN NOT NULL DEFAULT TRUE,
  payment_status BOOLEAN NOT NULL DEFAULT TRUE,

  -- Advanced settings
  quiet_hours_start TIME,
  quiet_hours_end TIME,
  quiet_hours_timezone VARCHAR(50) DEFAULT 'Europe/Oslo',

  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Unique constraint: one preference record per user per tenant
  UNIQUE(user_id, tenant_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_notification_preferences_user
  ON domain.notification_preferences(user_id);

CREATE INDEX IF NOT EXISTS idx_notification_preferences_tenant
  ON domain.notification_preferences(tenant_id);

CREATE INDEX IF NOT EXISTS idx_notification_preferences_user_tenant
  ON domain.notification_preferences(user_id, tenant_id);

-- Comments
COMMENT ON TABLE domain.notification_preferences IS 'User notification preferences per tenant';
COMMENT ON COLUMN domain.notification_preferences.in_app_enabled IS 'Enable in-app notifications';
COMMENT ON COLUMN domain.notification_preferences.email_enabled IS 'Enable email notifications';
COMMENT ON COLUMN domain.notification_preferences.sms_enabled IS 'Enable SMS notifications';
COMMENT ON COLUMN domain.notification_preferences.push_enabled IS 'Enable push notifications';
COMMENT ON COLUMN domain.notification_preferences.quiet_hours_start IS 'Start of quiet hours (no notifications)';
COMMENT ON COLUMN domain.notification_preferences.quiet_hours_end IS 'End of quiet hours (no notifications)';

-- =====================================================================
-- Trigger: Auto-update updated_at
-- =====================================================================

CREATE TRIGGER notification_preferences_updated_at
  BEFORE UPDATE ON domain.notification_preferences
  FOR EACH ROW
  EXECUTE FUNCTION domain.update_updated_at_column();

-- =====================================================================
-- Function: Get or Create Default Preferences
-- =====================================================================

CREATE OR REPLACE FUNCTION domain.get_or_create_notification_preferences(
  p_user_id UUID,
  p_tenant_id UUID
) RETURNS domain.notification_preferences AS $$
DECLARE
  v_preferences domain.notification_preferences;
BEGIN
  -- Try to get existing preferences
  SELECT * INTO v_preferences
  FROM domain.notification_preferences
  WHERE user_id = p_user_id AND tenant_id = p_tenant_id;

  -- If not found, create with defaults
  IF NOT FOUND THEN
    INSERT INTO domain.notification_preferences (user_id, tenant_id)
    VALUES (p_user_id, p_tenant_id)
    RETURNING * INTO v_preferences;
  END IF;

  RETURN v_preferences;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION domain.get_or_create_notification_preferences IS 'Get existing preferences or create with defaults';

-- =====================================================================
-- Seed: Create preferences for existing users
-- =====================================================================

-- Create default preferences for all existing users
INSERT INTO domain.notification_preferences (user_id, tenant_id)
SELECT DISTINCT u.id, u.tenant_id
FROM platform.users u
WHERE NOT EXISTS (
  SELECT 1 FROM domain.notification_preferences np
  WHERE np.user_id = u.id AND np.tenant_id = u.tenant_id
)
ON CONFLICT (user_id, tenant_id) DO NOTHING;
