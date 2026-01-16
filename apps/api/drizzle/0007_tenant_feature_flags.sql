-- Migration: Add Feature Flags to Tenants
-- Date: 2026-01-16
-- Description: Adds tenant-controlled feature flags and rental object category controls

-- Add feature flags columns
ALTER TABLE tenants 
ADD COLUMN IF NOT EXISTS feature_flags JSONB NOT NULL DEFAULT '{}',
ADD COLUMN IF NOT EXISTS enabled_rental_object_categories TEXT[] NOT NULL DEFAULT ARRAY['LOCALE', 'ARRANGEMENT']::TEXT[];

-- Create index for faster feature flag queries
CREATE INDEX IF NOT EXISTS idx_tenants_feature_flags ON tenants USING GIN (feature_flags);

-- Add comments for documentation
COMMENT ON COLUMN tenants.feature_flags IS 'Tenant-specific feature toggles (backoffice modules, web features, etc.)';
COMMENT ON COLUMN tenants.enabled_rental_object_categories IS 'Allowed rental object categories for this tenant (LOCALE, ARRANGEMENT, EQUIPMENT, VEHICLE, OTHER)';

-- Update existing tenants with default feature flags
UPDATE tenants
SET 
  feature_flags = jsonb_build_object(
    'backoffice.orgManagement', true,
    'backoffice.reporting', true,
    'backoffice.auditLog', true,
    'backoffice.messaging', true,
    'backoffice.maintenanceCalendar', true,
    'web.ratings', false,
    'web.feedback', false,
    'web.publicActivityCalendar', true,
    'web.payments', false,
    'rentalObject.recurringBookings', true,
    'rentalObject.packages', true,
    'rentalObject.discounts', true
  ),
  enabled_rental_object_categories = ARRAY['LOCALE', 'ARRANGEMENT']::TEXT[]
WHERE feature_flags = '{}'::jsonb;
