-- Migration: 0033_blocks_schema.sql
-- Description: Add blocks table for calendar blocking and availability management
-- Date: 2026-01-17
-- Author: Claude Code

-- ============================================================================
-- Blocks Table (domain schema)
-- ============================================================================
-- Blocks prevent bookings during specified time periods for rental objects.
-- Use cases: maintenance, municipal reservations, seasonal closures, etc.

CREATE TABLE IF NOT EXISTS domain.blocks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Tenant isolation (required per project rules)
    tenant_id UUID NOT NULL REFERENCES platform.tenants(id) ON DELETE CASCADE,

    -- Reference to the rental object being blocked
    rental_object_id UUID NOT NULL REFERENCES domain.rental_objects(id) ON DELETE CASCADE,

    -- Block details
    title VARCHAR(255) NOT NULL,
    reason TEXT,

    -- Time range (with timezone for proper handling)
    start_date TIMESTAMPTZ NOT NULL,
    end_date TIMESTAMPTZ NOT NULL,

    -- All-day flag (ignores time portion when true)
    all_day BOOLEAN NOT NULL DEFAULT false,

    -- Recurrence support (iCal RRULE format)
    recurring BOOLEAN NOT NULL DEFAULT false,
    recurrence_rule TEXT,

    -- Visibility: public (shows to all), internal (staff only), private (creator/admin only)
    visibility VARCHAR(20) NOT NULL DEFAULT 'public',

    -- Status: active, cancelled, expired
    status VARCHAR(50) NOT NULL DEFAULT 'active',

    -- Audit fields
    created_by UUID REFERENCES platform.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Constraints
    CONSTRAINT blocks_end_after_start CHECK (end_date > start_date),
    CONSTRAINT blocks_valid_visibility CHECK (visibility IN ('public', 'internal', 'private')),
    CONSTRAINT blocks_valid_status CHECK (status IN ('active', 'cancelled', 'expired'))
);

-- ============================================================================
-- Indexes for efficient querying
-- ============================================================================

-- Tenant isolation index
CREATE INDEX IF NOT EXISTS blocks_tenant_idx ON domain.blocks(tenant_id);

-- Rental object lookup
CREATE INDEX IF NOT EXISTS blocks_rental_object_idx ON domain.blocks(rental_object_id);

-- Time range queries (for availability checks)
CREATE INDEX IF NOT EXISTS blocks_time_range_idx ON domain.blocks(start_date, end_date);

-- Status filtering
CREATE INDEX IF NOT EXISTS blocks_status_idx ON domain.blocks(status);

-- Combined tenant + rental object + time for efficient availability queries
CREATE INDEX IF NOT EXISTS blocks_tenant_ro_time_idx ON domain.blocks(
    tenant_id,
    rental_object_id,
    start_date,
    end_date
);

-- ============================================================================
-- Comments for documentation
-- ============================================================================

COMMENT ON TABLE domain.blocks IS 'Calendar blocks that prevent bookings during specified time periods';
COMMENT ON COLUMN domain.blocks.visibility IS 'public: visible to all, internal: staff only, private: creator/admin only';
COMMENT ON COLUMN domain.blocks.recurrence_rule IS 'iCal RRULE format, e.g., FREQ=WEEKLY;BYDAY=MO for weekly on Monday';
COMMENT ON COLUMN domain.blocks.all_day IS 'When true, ignores time portion and blocks entire days';

-- ============================================================================
-- Trigger for updated_at timestamp
-- ============================================================================

-- Create trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION domain.update_blocks_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
DROP TRIGGER IF EXISTS blocks_updated_at_trigger ON domain.blocks;
CREATE TRIGGER blocks_updated_at_trigger
    BEFORE UPDATE ON domain.blocks
    FOR EACH ROW
    EXECUTE FUNCTION domain.update_blocks_updated_at();
