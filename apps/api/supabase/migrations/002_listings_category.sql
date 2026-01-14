-- Migration: Add category column and expand listing categories
-- Also add performance indexes

-- Add category column if not exists (for spaces classification)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'listings' 
    AND column_name = 'category'
  ) THEN
    ALTER TABLE public.listings ADD COLUMN category TEXT;
  END IF;
END $$;

-- Create category enum type if not exists
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'listing_category') THEN
    CREATE TYPE listing_category AS ENUM (
      'GYMSAL',
      'MUSIKKBINGE', 
      'BYDELSHUS',
      'GRENDEHUS',
      'BIBLIOTEK',
      'UNGDOM',
      'FRIVILLIGHET',
      'UTE',
      'KULTUR',
      'MOTEROM',
      'IDRETT',
      'KURS',
      'OTHER'
    );
  END IF;
END $$;

-- Add performance indexes
CREATE INDEX IF NOT EXISTS idx_listings_status ON public.listings(status);
CREATE INDEX IF NOT EXISTS idx_listings_category ON public.listings(category);
CREATE INDEX IF NOT EXISTS idx_listings_type ON public.listings(type);
CREATE INDEX IF NOT EXISTS idx_listings_tenant_id ON public.listings(tenant_id);

-- Add comment
COMMENT ON COLUMN public.listings.category IS 'Space category: GYMSAL, GRENDEHUS, MOTEROM, etc.';
