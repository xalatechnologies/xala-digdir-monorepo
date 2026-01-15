-- Migration: Add version field to bookings table
-- Enables optimistic locking for concurrent booking updates

-- Add version column to bookings table
ALTER TABLE public.bookings
ADD COLUMN IF NOT EXISTS version INTEGER NOT NULL DEFAULT 1;

-- Add comment
COMMENT ON COLUMN public.bookings.version IS 'Version number for optimistic locking (increments on each update)';
