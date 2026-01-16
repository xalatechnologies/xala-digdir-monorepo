-- Migration: Add Notification Preferences Tables
-- Created: 2026-01-15
-- Description: Adds tables for user and organization notification preferences

-- ============================================================================
-- User Notification Preferences
-- ============================================================================
CREATE TABLE IF NOT EXISTS user_notification_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Master channel toggles
  email_enabled BOOLEAN NOT NULL DEFAULT true,
  push_enabled BOOLEAN NOT NULL DEFAULT false,
  in_app_enabled BOOLEAN NOT NULL DEFAULT true,
  sms_enabled BOOLEAN NOT NULL DEFAULT false,
  
  -- Granular notification matrix (JSONB)
  notification_matrix JSONB NOT NULL DEFAULT '{
    "request_received": {"in_app": true, "email": true, "sms": false},
    "approved": {"in_app": true, "email": true, "sms": false},
    "rejected": {"in_app": true, "email": true, "sms": false},
    "request_more_info": {"in_app": true, "email": true, "sms": false},
    "booking_changed": {"in_app": true, "email": true, "sms": true},
    "cancelled": {"in_app": true, "email": true, "sms": true},
    "reminder_24h": {"in_app": true, "email": false, "sms": true},
    "reminder_2h": {"in_app": true, "email": false, "sms": true},
    "invoice_available": {"in_app": true, "email": true, "sms": false},
    "payment_status": {"in_app": true, "email": true, "sms": false}
  }'::jsonb,
  
  -- Quiet hours
  quiet_hours_enabled BOOLEAN NOT NULL DEFAULT false,
  quiet_hours_start VARCHAR(5), -- HH:mm format
  quiet_hours_end VARCHAR(5),
  
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  updated_at TIMESTAMP NOT NULL DEFAULT now(),
  
  CONSTRAINT user_notification_prefs_tenant_user_unique UNIQUE (tenant_id, user_id)
);

CREATE INDEX IF NOT EXISTS user_notification_prefs_user_idx ON user_notification_preferences(user_id);

-- ============================================================================
-- Organization Notification Preferences
-- ============================================================================
CREATE TABLE IF NOT EXISTS organization_notification_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  
  -- Master channel toggles
  email_enabled BOOLEAN NOT NULL DEFAULT true,
  sms_enabled BOOLEAN NOT NULL DEFAULT false,
  in_app_enabled BOOLEAN NOT NULL DEFAULT true,
  
  -- Granular notification matrix (JSONB)
  notification_matrix JSONB NOT NULL DEFAULT '{
    "request_received": {"in_app": true, "email": true, "sms": false},
    "approved": {"in_app": true, "email": true, "sms": false},
    "rejected": {"in_app": true, "email": true, "sms": false},
    "request_more_info": {"in_app": true, "email": true, "sms": false},
    "booking_changed": {"in_app": true, "email": true, "sms": true},
    "cancelled": {"in_app": true, "email": true, "sms": true},
    "reminder_24h": {"in_app": true, "email": false, "sms": true},
    "reminder_2h": {"in_app": true, "email": false, "sms": true},
    "invoice_available": {"in_app": true, "email": true, "sms": false},
    "payment_status": {"in_app": true, "email": true, "sms": false}
  }'::jsonb,
  
  -- Recipient settings
  notify_admins BOOLEAN NOT NULL DEFAULT true,
  notify_booking_managers BOOLEAN NOT NULL DEFAULT true,
  notify_all_members BOOLEAN NOT NULL DEFAULT false,
  
  -- Contact information
  primary_email VARCHAR(255),
  primary_phone VARCHAR(50),
  
  -- Quiet hours
  quiet_hours_enabled BOOLEAN NOT NULL DEFAULT false,
  quiet_hours_start VARCHAR(5),
  quiet_hours_end VARCHAR(5),
  
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  updated_at TIMESTAMP NOT NULL DEFAULT now(),
  
  CONSTRAINT org_notification_prefs_tenant_org_unique UNIQUE (tenant_id, organization_id)
);

CREATE INDEX IF NOT EXISTS org_notification_prefs_org_idx ON organization_notification_preferences(organization_id);

-- ============================================================================
-- Push Subscriptions
-- ============================================================================
CREATE TABLE IF NOT EXISTS push_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Web Push API fields
  endpoint TEXT NOT NULL UNIQUE,
  p256dh TEXT NOT NULL,
  auth TEXT NOT NULL,
  
  -- Device info
  user_agent TEXT,
  device_name VARCHAR(100),
  
  -- Status
  is_active BOOLEAN NOT NULL DEFAULT true,
  last_used_at TIMESTAMP,
  expires_at TIMESTAMP,
  
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  updated_at TIMESTAMP NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS push_subscriptions_tenant_user_idx ON push_subscriptions(tenant_id, user_id);
CREATE INDEX IF NOT EXISTS push_subscriptions_active_idx ON push_subscriptions(is_active);

-- ============================================================================
-- Updated at trigger function
-- ============================================================================
CREATE OR REPLACE FUNCTION update_notification_prefs_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply triggers
DROP TRIGGER IF EXISTS user_notification_prefs_updated_at ON user_notification_preferences;
CREATE TRIGGER user_notification_prefs_updated_at
  BEFORE UPDATE ON user_notification_preferences
  FOR EACH ROW EXECUTE FUNCTION update_notification_prefs_updated_at();

DROP TRIGGER IF EXISTS org_notification_prefs_updated_at ON organization_notification_preferences;
CREATE TRIGGER org_notification_prefs_updated_at
  BEFORE UPDATE ON organization_notification_preferences
  FOR EACH ROW EXECUTE FUNCTION update_notification_prefs_updated_at();

DROP TRIGGER IF EXISTS push_subscriptions_updated_at ON push_subscriptions;
CREATE TRIGGER push_subscriptions_updated_at
  BEFORE UPDATE ON push_subscriptions
  FOR EACH ROW EXECUTE FUNCTION update_notification_prefs_updated_at();
