-- Migration: Create listing_rules table
-- Stores booking/cancellation rules per listing

CREATE TABLE IF NOT EXISTS public.listing_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID NOT NULL UNIQUE,  -- one rule set per listing
  approval_required BOOLEAN NOT NULL DEFAULT false,
  min_age INTEGER,
  max_booking_days INTEGER,  -- max days ahead for booking
  min_booking_hours INTEGER, -- minimum notice for booking
  cancellation_deadline_days INTEGER,
  cancellation_fee_percent INTEGER CHECK (cancellation_fee_percent >= 0 AND cancellation_fee_percent <= 100),
  deposit_amount INTEGER,    -- in smallest currency unit
  deposit_required BOOLEAN DEFAULT false,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  
  CONSTRAINT fk_listing_rules_listing FOREIGN KEY (listing_id) REFERENCES public.listings(id) ON DELETE CASCADE
);

-- Performance index
CREATE INDEX IF NOT EXISTS idx_listing_rules_listing_id ON public.listing_rules(listing_id);

-- Comments
COMMENT ON TABLE public.listing_rules IS 'Booking and cancellation rules per listing';
COMMENT ON COLUMN public.listing_rules.approval_required IS 'Whether bookings require manual approval';
COMMENT ON COLUMN public.listing_rules.cancellation_deadline_days IS 'Days before booking that free cancellation is allowed';
