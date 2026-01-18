-- =====================================================================
-- Migration: 0030_favorites_and_conflicts
-- Description: Add favorites system and booking conflict detection
-- Author: System
-- Date: 2026-01-17
-- =====================================================================

BEGIN;

-- =====================================================================
-- FAVORITES SYSTEM
-- =====================================================================

-- Favorites table
CREATE TABLE IF NOT EXISTS domain.favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES platform.users(id) ON DELETE CASCADE,
  rental_object_id UUID NOT NULL REFERENCES domain.rental_objects(id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL REFERENCES platform.tenants(id) ON DELETE CASCADE,
  
  -- Metadata
  notes TEXT,
  tags TEXT[] DEFAULT '{}',
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraints
  UNIQUE(user_id, rental_object_id)
);

-- Indexes for favorites
CREATE INDEX idx_favorites_user ON domain.favorites(user_id);
CREATE INDEX idx_favorites_rental_object ON domain.favorites(rental_object_id);
CREATE INDEX idx_favorites_tenant ON domain.favorites(tenant_id);
CREATE INDEX idx_favorites_tags ON domain.favorites USING GIN(tags);
CREATE INDEX idx_favorites_created ON domain.favorites(created_at DESC);

-- RLS for favorites
ALTER TABLE domain.favorites ENABLE ROW LEVEL SECURITY;

-- Users can only see their own favorites
CREATE POLICY favorites_user_select ON domain.favorites
  FOR SELECT
  USING (user_id = auth.user_id());

-- Users can only create their own favorites
CREATE POLICY favorites_user_insert ON domain.favorites
  FOR INSERT
  WITH CHECK (user_id = auth.user_id());

-- Users can only update their own favorites
CREATE POLICY favorites_user_update ON domain.favorites
  FOR UPDATE
  USING (user_id = auth.user_id());

-- Users can only delete their own favorites
CREATE POLICY favorites_user_delete ON domain.favorites
  FOR DELETE
  USING (user_id = auth.user_id());

-- =====================================================================
-- BOOKING CONFLICTS TRACKING
-- =====================================================================

-- Booking conflicts table
CREATE TABLE IF NOT EXISTS domain.booking_conflicts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id_1 UUID NOT NULL REFERENCES domain.bookings(id) ON DELETE CASCADE,
  booking_id_2 UUID NOT NULL REFERENCES domain.bookings(id) ON DELETE CASCADE,
  rental_object_id UUID NOT NULL REFERENCES domain.rental_objects(id) ON DELETE CASCADE,
  
  -- Conflict details
  conflict_type VARCHAR(50) NOT NULL, -- HARD, SOFT, BUFFER, CAPACITY
  severity VARCHAR(20) NOT NULL DEFAULT 'WARNING', -- INFO, WARNING, CRITICAL
  
  -- Time overlap
  overlap_start TIMESTAMP WITH TIME ZONE NOT NULL,
  overlap_end TIMESTAMP WITH TIME ZONE NOT NULL,
  
  -- Resolution
  status VARCHAR(20) DEFAULT 'DETECTED', -- DETECTED, RESOLVED, IGNORED
  resolution_action VARCHAR(50), -- CANCEL_NEW, CANCEL_EXISTING, FORCE_ACCEPT, MODIFY_TIME, etc.
  resolved_by UUID REFERENCES platform.users(id),
  resolved_at TIMESTAMP WITH TIME ZONE,
  resolution_notes TEXT,
  
  -- Timestamps
  detected_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraints
  CHECK (booking_id_1 <> booking_id_2),
  CHECK (overlap_start < overlap_end)
);

-- Indexes for conflicts
CREATE INDEX idx_booking_conflicts_booking1 ON domain.booking_conflicts(booking_id_1);
CREATE INDEX idx_booking_conflicts_booking2 ON domain.booking_conflicts(booking_id_2);
CREATE INDEX idx_booking_conflicts_rental_object ON domain.booking_conflicts(rental_object_id);
CREATE INDEX idx_booking_conflicts_unresolved ON domain.booking_conflicts(status) WHERE status = 'DETECTED';
CREATE INDEX idx_booking_conflicts_severity ON domain.booking_conflicts(severity, status);

-- =====================================================================
-- RENTAL OBJECT PERMISSIONS (Granular per-object access control)
-- =====================================================================

CREATE TABLE IF NOT EXISTS domain.rental_object_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rental_object_id UUID NOT NULL REFERENCES domain.rental_objects(id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL REFERENCES platform.tenants(id) ON DELETE CASCADE,
  
  -- Grant to user OR organization (mutually exclusive)
  user_id UUID REFERENCES platform.users(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES platform.organizations(id) ON DELETE CASCADE,
  
  -- Granular permissions
  can_view BOOLEAN DEFAULT true,
  can_book BOOLEAN DEFAULT false,
  can_manage BOOLEAN DEFAULT false,
  can_approve_bookings BOOLEAN DEFAULT false,
  can_cancel_bookings BOOLEAN DEFAULT false,
  can_view_reports BOOLEAN DEFAULT false,
  can_set_pricing BOOLEAN DEFAULT false,
  can_manage_availability BOOLEAN DEFAULT false,
  
  -- Time-based permissions
  valid_from TIMESTAMP WITH TIME ZONE,
  valid_until TIMESTAMP WITH TIME ZONE,
  
  -- Audit
  granted_by UUID REFERENCES platform.users(id),
  granted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  revoked_at TIMESTAMP WITH TIME ZONE,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraints: Must grant to either user OR organization, not both
  CONSTRAINT user_or_org_required CHECK (
    (user_id IS NOT NULL AND organization_id IS NULL) OR
    (user_id IS NULL AND organization_id IS NOT NULL)
  ),
  
  -- Unique permission per user/org per object
  UNIQUE(rental_object_id, user_id) WHERE user_id IS NOT NULL,
  UNIQUE(rental_object_id, organization_id) WHERE organization_id IS NOT NULL
);

-- Indexes for rental object permissions
CREATE INDEX idx_rental_permissions_object ON domain.rental_object_permissions(rental_object_id);
CREATE INDEX idx_rental_permissions_user ON domain.rental_object_permissions(user_id) WHERE user_id IS NOT NULL;
CREATE INDEX idx_rental_permissions_org ON domain.rental_object_permissions(organization_id) WHERE organization_id IS NOT NULL;
CREATE INDEX idx_rental_permissions_active ON domain.rental_object_permissions(rental_object_id, user_id)
  WHERE revoked_at IS NULL AND (valid_until IS NULL OR valid_until > NOW());

-- =====================================================================
-- HELPER FUNCTIONS
-- =====================================================================

-- Function to check if user has permission on rental object
CREATE OR REPLACE FUNCTION domain.check_rental_object_permission(
  p_user_id UUID,
  p_rental_object_id UUID,
  p_permission_name TEXT
) RETURNS BOOLEAN AS $$
DECLARE
  v_has_permission BOOLEAN := false;
  v_org_ids UUID[];
BEGIN
  -- Get user's organization memberships
  SELECT ARRAY_AGG(organization_id)
  INTO v_org_ids
  FROM platform.organization_members
  WHERE user_id = p_user_id AND status = 'ACTIVE';
  
  -- Check direct user permission
  SELECT EXISTS (
    SELECT 1
    FROM domain.rental_object_permissions
    WHERE rental_object_id = p_rental_object_id
      AND user_id = p_user_id
      AND revoked_at IS NULL
      AND (valid_from IS NULL OR valid_from <= NOW())
      AND (valid_until IS NULL OR valid_until > NOW())
      AND CASE p_permission_name
        WHEN 'can_view' THEN can_view
        WHEN 'can_book' THEN can_book
        WHEN 'can_manage' THEN can_manage
        WHEN 'can_approve_bookings' THEN can_approve_bookings
        WHEN 'can_cancel_bookings' THEN can_cancel_bookings
        WHEN 'can_view_reports' THEN can_view_reports
        WHEN 'can_set_pricing' THEN can_set_pricing
        WHEN 'can_manage_availability' THEN can_manage_availability
        ELSE false
      END = true
  )
  INTO v_has_permission;
  
  -- If  direct permission found, return true
  IF v_has_permission THEN
    RETURN true;
  END IF;
  
  -- Check organization permission
  IF v_org_ids IS NOT NULL AND array_length(v_org_ids, 1) > 0 THEN
    SELECT EXISTS (
      SELECT 1
      FROM domain.rental_object_permissions
      WHERE rental_object_id = p_rental_object_id
        AND organization_id = ANY(v_org_ids)
        AND revoked_at IS NULL
        AND (valid_from IS NULL OR valid_from <= NOW())
        AND (valid_until IS NULL OR valid_until > NOW())
        AND CASE p_permission_name
          WHEN 'can_view' THEN can_view
          WHEN 'can_book' THEN can_book
          WHEN 'can_manage' THEN can_manage
          WHEN 'can_approve_bookings' THEN can_approve_bookings
          WHEN 'can_cancel_bookings' THEN can_cancel_bookings
          WHEN 'can_view_reports' THEN can_view_reports
          WHEN 'can_set_pricing' THEN can_set_pricing
          WHEN 'can_manage_availability' THEN can_manage_availability
          ELSE false
        END = true
    )
    INTO v_has_permission;
  END IF;
  
  RETURN v_has_permission;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to detect booking conflicts
CREATE OR REPLACE FUNCTION domain.detect_booking_conflicts(
  p_rental_object_id UUID,
  p_start_time TIMESTAMP WITH TIME ZONE,
  p_end_time TIMESTAMP WITH TIME ZONE,
  p_exclude_booking_id UUID DEFAULT NULL
) RETURNS TABLE (
  booking_id UUID,
  conflict_type VARCHAR,
  severity VARCHAR,
  overlap_start TIMESTAMP WITH TIME ZONE,
  overlap_end TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    b.id AS booking_id,
    'HARD'::VARCHAR AS conflict_type,
    'CRITICAL'::VARCHAR AS severity,
    GREATEST(b.start_time, p_start_time) AS overlap_start,
    LEAST(b.end_time, p_end_time) AS overlap_end
  FROM domain.bookings b
  WHERE b.rental_object_id = p_rental_object_id
    AND b.status NOT IN ('CANCELLED', 'REJECTED')
    AND b.start_time < p_end_time
    AND b.end_time > p_start_time
    AND (p_exclude_booking_id IS NULL OR b.id <> p_exclude_booking_id);
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update updated_at
CREATE OR REPLACE FUNCTION domain.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_favorites_updated_at
  BEFORE UPDATE ON domain.favorites
  FOR EACH ROW
  EXECUTE FUNCTION domain.update_updated_at_column();

CREATE TRIGGER update_rental_permissions_updated_at
  BEFORE UPDATE ON domain.rental_object_permissions
  FOR EACH ROW
  EXECUTE FUNCTION domain.update_updated_at_column();

COMMIT;

-- =====================================================================
-- VERIFICATION
-- =====================================================================

SELECT 
  'Migration 0030 complete!' AS status,
  (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'domain' AND table_name = 'favorites') AS favorites_table,
  (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'domain' AND table_name = 'booking_conflicts') AS conflicts_table,
  (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'domain' AND table_name = 'rental_object_permissions') AS permissions_table;
