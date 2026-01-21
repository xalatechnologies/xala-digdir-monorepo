-- Migration: Booking Approvals
-- Adds columns for approval workflow and optimistic locking

-- Add new columns to bookings table
ALTER TABLE domain.bookings
  ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES platform.organizations(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS version INTEGER NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS submitted_at TIMESTAMP,
  ADD COLUMN IF NOT EXISTS approved_by UUID REFERENCES platform.users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS approved_at TIMESTAMP,
  ADD COLUMN IF NOT EXISTS rejection_reason TEXT;

-- Add indexes for approval workflow queries
CREATE INDEX IF NOT EXISTS bookings_organization_idx ON domain.bookings(organization_id);
CREATE INDEX IF NOT EXISTS bookings_approval_queue_idx ON domain.bookings(tenant_id, status, start_time);
CREATE INDEX IF NOT EXISTS bookings_time_range_idx ON domain.bookings(rental_object_id, start_time, end_time);

-- Add comment for documentation
COMMENT ON COLUMN domain.bookings.version IS 'Optimistic locking version number';
COMMENT ON COLUMN domain.bookings.submitted_at IS 'When booking was submitted for approval';
COMMENT ON COLUMN domain.bookings.approved_by IS 'User ID who approved/rejected the booking';
COMMENT ON COLUMN domain.bookings.approved_at IS 'When booking was approved/rejected';
COMMENT ON COLUMN domain.bookings.rejection_reason IS 'Reason for rejection if status is rejected';
