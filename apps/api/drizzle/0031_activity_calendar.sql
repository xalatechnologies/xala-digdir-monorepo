-- =====================================================================
-- Migration: 0031_activity_calendar
-- Description: Add activity/event calendar for public venue activities
-- Author: System
-- Date: 2026-01-17
-- =====================================================================

BEGIN;

-- =====================================================================
-- ACTIVITIES/EVENTS TABLE
-- =====================================================================

CREATE TABLE IF NOT EXISTS domain.activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES platform.tenants(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES platform.organizations(id) ON DELETE CASCADE,
  rental_object_id UUID NOT NULL REFERENCES domain.rental_objects(id) ON DELETE CASCADE,
  
  -- Basic info
  title VARCHAR(200) NOT NULL,
  description TEXT,
  category VARCHAR(50) NOT NULL, -- CLASS, EVENT, TRAINING, MATCH, WORKSHOP, PERFORMANCE, etc.
  
  -- Visibility & discovery
  is_public BOOLEAN DEFAULT true,
  is_searchable BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,
  
  -- Scheduling
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE NOT NULL,
  is_recurring BOOLEAN DEFAULT false,
  recurrence_rule TEXT, -- iCal RRULE format
  parent_series_id UUID REFERENCES domain.activities(id) ON DELETE SET NULL,
  
  -- Capacity
  max_participants INTEGER,
  current_participants INTEGER DEFAULT 0,
  allow_waitlist BOOLEAN DEFAULT false,
  
  -- Registration
  requires_registration BOOLEAN DEFAULT false,
  registration_deadline TIMESTAMP WITH TIME ZONE,
  registration_fee_cents INTEGER DEFAULT 0,
  
  -- Marketing
  image_url TEXT,
  tags TEXT[] DEFAULT '{}',
  instructor_name VARCHAR(100),
  difficulty VARCHAR(20), -- BEGINNER, INTERMEDIATE, ADVANCED
  
  -- Calendar integration
  blocks_bookings BOOLEAN DEFAULT true, -- Does it block the rental calendar?
  linked_booking_id UUID REFERENCES domain.bookings(id) ON DELETE SET NULL,
  
  -- Status
  status VARCHAR(20) DEFAULT 'DRAFT', -- DRAFT, PUBLISHED, CANCELLED, COMPLETED
  published_at TIMESTAMP WITH TIME ZONE,
  cancelled_at TIMESTAMP WITH TIME ZONE,
  cancellation_reason TEXT,
  
  -- Audit
  created_by UUID REFERENCES platform.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraints
  CHECK (start_time < end_time),
  CHECK (max_participants IS NULL OR max_participants > 0),
  CHECK (current_participants >= 0),
  CHECK (registration_fee_cents >= 0)
);

-- Indexes for activities
CREATE INDEX idx_activities_rental_object ON domain.activities(rental_object_id);
CREATE INDEX idx_activities_organization ON domain.activities(organization_id);
CREATE INDEX idx_activities_tenant ON domain.activities(tenant_id);
CREATE INDEX idx_activities_time_range ON domain.activities(start_time, end_time);
CREATE INDEX idx_activities_public ON domain.activities(is_public, is_searchable, status)
  WHERE status = 'PUBLISHED';
CREATE INDEX idx_activities_featured ON domain.activities(is_featured, status)
  WHERE is_featured = true AND status = 'PUBLISHED';
CREATE INDEX idx_activities_series ON domain.activities(parent_series_id)
  WHERE parent_series_id IS NOT NULL;
CREATE INDEX idx_activities_category ON domain.activities(category, status);
CREATE INDEX idx_activities_tags ON domain.activities USING GIN(tags);
CREATE INDEX idx_activities_upcoming ON domain.activities(start_time)
  WHERE status = 'PUBLISHED' AND start_time > NOW();

-- =====================================================================
-- ACTIVITY REGISTRATIONS
-- =====================================================================

CREATE TABLE IF NOT EXISTS domain.activity_registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  activity_id UUID NOT NULL REFERENCES domain.activities(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES platform.users(id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL REFERENCES platform.tenants(id) ON DELETE CASCADE,
  
  -- Registration details
  status VARCHAR(20) DEFAULT 'PENDING', -- PENDING, CONFIRMED, CANCELLED, WAITLIST, ATTENDED
  registered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  confirmed_at TIMESTAMP WITH TIME ZONE,
  cancelled_at TIMESTAMP WITH TIME ZONE,
  attended_at TIMESTAMP WITH TIME ZONE,
  
  -- Payment
  payment_status VARCHAR(20) DEFAULT 'PENDING', -- PENDING, PAID, REFUNDED, FAILED
  payment_amount_cents INTEGER,
  paid_at TIMESTAMP WITH TIME ZONE,
  
  -- Additional info
  notes TEXT,
  special_requirements TEXT,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraints
  UNIQUE(activity_id, user_id)
);

-- Indexes for registrations
CREATE INDEX idx_activity_registrations_activity ON domain.activity_registrations(activity_id);
CREATE INDEX idx_activity_registrations_user ON domain.activity_registrations(user_id);
CREATE INDEX idx_activity_registrations_status ON domain.activity_registrations(status);
CREATE INDEX idx_activity_registrations_pending ON domain.activity_registrations(activity_id, status)
  WHERE status = 'PENDING';
CREATE INDEX idx_activity_registrations_waitlist ON domain.activity_registrations(activity_id, registered_at)
  WHERE status = 'WAITLIST';

-- =====================================================================
-- RLS POLICIES
-- =====================================================================

-- Activities: Public can view published
ALTER TABLE domain.activities ENABLE ROW LEVEL SECURITY;

CREATE POLICY activities_public_select ON domain.activities
  FOR SELECT
  USING (status = 'PUBLISHED' AND is_public = true);

CREATE POLICY activities_org_select ON domain.activities
  FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id
      FROM platform.organization_members
      WHERE user_id = auth.user_id()
    )
  );

CREATE POLICY activities_org_insert ON domain.activities
  FOR INSERT
  WITH CHECK (
    organization_id IN (
      SELECT organization_id
      FROM platform.organization_members
      WHERE user_id = auth.user_id() AND role IN ('ADMIN', 'MANAGER')
    )
  );

CREATE POLICY activities_org_update ON domain.activities
  FOR UPDATE
  USING (
    organization_id IN (
      SELECT organization_id
      FROM platform.organization_members
      WHERE user_id = auth.user_id() AND role IN ('ADMIN', 'MANAGER')
    )
  );

-- Registrations: Users see their own
ALTER TABLE domain.activity_registrations ENABLE ROW LEVEL SECURITY;

CREATE POLICY registrations_user_select ON domain.activity_registrations
  FOR SELECT
  USING (user_id = auth.user_id());

CREATE POLICY registrations_user_insert ON domain.activity_registrations
  FOR INSERT
  WITH CHECK (user_id = auth.user_id());

CREATE POLICY registrations_org_select ON domain.activity_registrations
  FOR SELECT
  USING (
    activity_id IN (
      SELECT id FROM domain.activities
      WHERE organization_id IN (
        SELECT organization_id
        FROM platform.organization_members
        WHERE user_id = auth.user_id() AND role IN ('ADMIN', 'MANAGER')
      )
    )
  );

-- =====================================================================
-- HELPER FUNCTIONS
-- =====================================================================

-- Function to check activity availability
CREATE OR REPLACE FUNCTION domain.check_activity_availability(
  p_activity_id UUID
) RETURNS TABLE (
  is_available BOOLEAN,
  available_spots INTEGER,
  is_full BOOLEAN,
  waitlist_count INTEGER
) AS $$
DECLARE
  v_max_participants INTEGER;
  v_current_participants INTEGER;
  v_confirmed_count INTEGER;
  v_waitlist_count INTEGER;
BEGIN
  -- Get activity details
  SELECT max_participants, current_participants
  INTO v_max_participants, v_current_participants
  FROM domain.activities
  WHERE id = p_activity_id;
  
  -- Count confirmed registrations
  SELECT COUNT(*)
  INTO v_confirmed_count
  FROM domain.activity_registrations
  WHERE activity_id = p_activity_id
    AND status = 'CONFIRMED';
  
  -- Count waitlist
  SELECT COUNT(*)
  INTO v_waitlist_count
  FROM domain.activity_registrations
  WHERE activity_id = p_activity_id
    AND status = 'WAITLIST';
  
  -- Return availability info
  RETURN QUERY
  SELECT
    CASE
      WHEN v_max_participants IS NULL THEN true
      WHEN v_confirmed_count < v_max_participants THEN true
      ELSE false
    END AS is_available,
    CASE
      WHEN v_max_participants IS NULL THEN NULL
      ELSE v_max_participants - v_confirmed_count
    END AS available_spots,
    CASE
      WHEN v_max_participants IS NULL THEN false
      WHEN v_confirmed_count >= v_max_participants THEN true
      ELSE false
    END AS is_full,
    v_waitlist_count;
END;
$$ LANGUAGE plpgsql;

-- Function to automatically update activity participant count
CREATE OR REPLACE FUNCTION domain.update_activity_participant_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    UPDATE domain.activities
    SET current_participants = (
      SELECT COUNT(*)
      FROM domain.activity_registrations
      WHERE activity_id = NEW.activity_id
        AND status = 'CONFIRMED'
    )
    WHERE id = NEW.activity_id;
  END IF;
  
  IF TG_OP = 'DELETE' THEN
    UPDATE domain.activities
    SET current_participants = (
      SELECT COUNT(*)
      FROM domain.activity_registrations
      WHERE activity_id = OLD.activity_id
        AND status = 'CONFIRMED'
    )
    WHERE id = OLD.activity_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_activity_participants
  AFTER INSERT OR UPDATE OR DELETE ON domain.activity_registrations
  FOR EACH ROW
  EXECUTE FUNCTION domain.update_activity_participant_count();

-- Trigger to auto-update updated_at
CREATE TRIGGER update_activities_updated_at
  BEFORE UPDATE ON domain.activities
  FOR EACH ROW
  EXECUTE FUNCTION domain.update_updated_at_column();

CREATE TRIGGER update_activity_registrations_updated_at
  BEFORE UPDATE ON domain.activity_registrations
  FOR EACH ROW
  EXECUTE FUNCTION domain.update_updated_at_column();

COMMIT;

-- =====================================================================
-- VERIFICATION
-- =====================================================================

SELECT
  'Migration 0031 complete!' AS status,
  (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'domain' AND table_name = 'activities') AS activities_table,
  (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'domain' AND table_name = 'activity_registrations') AS registrations_table;
