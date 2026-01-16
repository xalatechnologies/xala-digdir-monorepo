-- Migration: Refactor to 4 categories + time modes + composable features
-- Version: 006_listing_category_timemode_refactor.sql
-- Date: 2026-01-15

-- ============================================================================
-- Step 1: Add new category enum type (4 top-level categories)
-- ============================================================================

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'listing_category_v2') THEN
    CREATE TYPE listing_category_v2 AS ENUM (
      'LOKALER_OG_BANER',
      'UTSTYR_OG_INVENTAR',
      'KJORETOY_OG_TRANSPORT',
      'OPPLEVELSER_OG_ARRANGEMENT'
    );
  END IF;
END $$;

-- ============================================================================
-- Step 2: Add booking time mode enum
-- ============================================================================

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'booking_time_mode') THEN
    CREATE TYPE booking_time_mode AS ENUM (
      'PERIOD',   -- Tidsperiode (start/end interval)
      'SLOT',     -- Tidsluke (fixed slots)
      'ALL_DAY'   -- Heldags (per-day / multi-day picker)
    );
  END IF;
END $$;

-- ============================================================================
-- Step 3: Add new columns to listings table
-- ============================================================================

-- Add category_v2 column (new 4-category system)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'listings' 
    AND column_name = 'category_v2'
  ) THEN
    ALTER TABLE public.listings ADD COLUMN category_v2 TEXT;
  END IF;
END $$;

-- Add subcategory column
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'listings' 
    AND column_name = 'subcategory'
  ) THEN
    ALTER TABLE public.listings ADD COLUMN subcategory VARCHAR(100);
  END IF;
END $$;

-- Add tags column
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'listings' 
    AND column_name = 'tags'
  ) THEN
    ALTER TABLE public.listings ADD COLUMN tags JSONB DEFAULT '[]'::jsonb;
  END IF;
END $$;

-- Add fixed_location column
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'listings' 
    AND column_name = 'fixed_location'
  ) THEN
    ALTER TABLE public.listings ADD COLUMN fixed_location BOOLEAN DEFAULT true;
  END IF;
END $$;

-- Add time_mode column
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'listings' 
    AND column_name = 'time_mode'
  ) THEN
    ALTER TABLE public.listings ADD COLUMN time_mode VARCHAR(20) DEFAULT 'PERIOD';
  END IF;
END $$;

-- Add booking_features column (composable: inventory, capacity, packages)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'listings' 
    AND column_name = 'booking_features'
  ) THEN
    ALTER TABLE public.listings ADD COLUMN booking_features JSONB DEFAULT '{}'::jsonb;
  END IF;
END $$;

-- Add migration_status column for tracking
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'listings' 
    AND column_name = 'migration_status'
  ) THEN
    ALTER TABLE public.listings ADD COLUMN migration_status VARCHAR(20) DEFAULT 'pending';
  END IF;
END $$;

-- ============================================================================
-- Step 4: Migrate existing type → category_v2
-- ============================================================================

UPDATE public.listings SET category_v2 = CASE 
  WHEN type = 'SPACE' THEN 'LOKALER_OG_BANER'
  WHEN type = 'RESOURCE' THEN 'UTSTYR_OG_INVENTAR'
  WHEN type = 'VEHICLE' THEN 'KJORETOY_OG_TRANSPORT'
  WHEN type = 'EVENT' THEN 'OPPLEVELSER_OG_ARRANGEMENT'
  WHEN type = 'SERVICE' THEN 'LOKALER_OG_BANER'
  ELSE 'LOKALER_OG_BANER'  -- Default for OTHER
END
WHERE category_v2 IS NULL;

-- ============================================================================
-- Step 5: Migrate old category → subcategory
-- ============================================================================

UPDATE public.listings 
SET subcategory = category
WHERE subcategory IS NULL AND category IS NOT NULL;

-- ============================================================================
-- Step 6: Flag SERVICE type listings with serviceIncluded metadata
-- ============================================================================

UPDATE public.listings 
SET metadata = jsonb_set(COALESCE(metadata, '{}'), '{serviceIncluded}', 'true')
WHERE type = 'SERVICE' AND (metadata->>'serviceIncluded' IS NULL);

-- ============================================================================
-- Step 7: Migrate old booking model → time_mode + booking_features
-- ============================================================================

-- Map TIME_RANGE, SLOT, ALL_DAY directly to time_mode
UPDATE public.listings 
SET time_mode = CASE
  WHEN (metadata->>'bookingModel') = 'TIME_RANGE' THEN 'PERIOD'
  WHEN (metadata->>'bookingModel') = 'SLOT' THEN 'SLOT'
  WHEN (metadata->>'bookingModel') = 'ALL_DAY' THEN 'ALL_DAY'
  WHEN (metadata->>'bookingModel') = 'QUANTITY' THEN 'PERIOD'  -- With inventory feature
  WHEN (metadata->>'bookingModel') = 'CAPACITY' THEN 'SLOT'   -- With shared capacity feature
  WHEN (metadata->>'bookingModel') = 'PACKAGE' THEN 'ALL_DAY' -- With packages feature
  ELSE 'PERIOD'
END
WHERE time_mode = 'PERIOD' OR time_mode IS NULL;

-- Enable inventory for QUANTITY booking model
UPDATE public.listings 
SET booking_features = jsonb_set(
  COALESCE(booking_features, '{}'),
  '{inventory}',
  jsonb_build_object('enabled', true, 'total', COALESCE(capacity, 1), 'policy', 'FIFO')
)
WHERE (metadata->>'bookingModel') = 'QUANTITY';

-- Enable shared capacity for CAPACITY booking model
UPDATE public.listings 
SET booking_features = jsonb_set(
  COALESCE(booking_features, '{}'),
  '{sharedCapacity}',
  jsonb_build_object('enabled', true, 'total', COALESCE(capacity, 10), 'policy', 'PER_SLOT')
)
WHERE (metadata->>'bookingModel') = 'CAPACITY';

-- Enable packages for PACKAGE booking model (items to be configured manually)
UPDATE public.listings 
SET booking_features = jsonb_set(
  COALESCE(booking_features, '{}'),
  '{packages}',
  jsonb_build_object('enabled', true, 'items', '[]'::jsonb)
)
WHERE (metadata->>'bookingModel') = 'PACKAGE';

-- ============================================================================
-- Step 8: Set migration status
-- ============================================================================

UPDATE public.listings SET migration_status = 'complete' WHERE migration_status = 'pending';

-- Flag OTHER type for manual review
UPDATE public.listings SET migration_status = 'needs_review' WHERE type = 'OTHER';

-- ============================================================================
-- Step 9: Create indexes for new columns
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_listings_category_v2 ON public.listings(category_v2);
CREATE INDEX IF NOT EXISTS idx_listings_time_mode ON public.listings(time_mode);
CREATE INDEX IF NOT EXISTS idx_listings_subcategory ON public.listings(subcategory);
CREATE INDEX IF NOT EXISTS idx_listings_fixed_location ON public.listings(fixed_location);
CREATE INDEX IF NOT EXISTS idx_listings_migration_status ON public.listings(migration_status);

-- GIN index for tags array
CREATE INDEX IF NOT EXISTS idx_listings_tags ON public.listings USING GIN (tags);

-- ============================================================================
-- Step 10: Add comments
-- ============================================================================

COMMENT ON COLUMN public.listings.category_v2 IS 'V2 category: LOKALER_OG_BANER, UTSTYR_OG_INVENTAR, KJORETOY_OG_TRANSPORT, OPPLEVELSER_OG_ARRANGEMENT';
COMMENT ON COLUMN public.listings.subcategory IS 'Subcategory within top-level category (migrated from old category)';
COMMENT ON COLUMN public.listings.tags IS 'Array of string tags for flexible categorization';
COMMENT ON COLUMN public.listings.fixed_location IS 'Whether listing has a fixed physical location';
COMMENT ON COLUMN public.listings.time_mode IS 'Booking time mode: PERIOD, SLOT, or ALL_DAY';
COMMENT ON COLUMN public.listings.booking_features IS 'Composable booking features: inventory, sharedCapacity, packages';
COMMENT ON COLUMN public.listings.migration_status IS 'Migration status: pending, complete, needs_review';
