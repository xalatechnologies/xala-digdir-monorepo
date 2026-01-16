-- Migration: Rental Objects Category System
-- Replace legacy 'type' column with 'category' for the new 4-category system

-- Step 1: Rename type column to category
ALTER TABLE listings RENAME COLUMN type TO category;

-- Step 2: Update existing data to new categories
UPDATE listings SET category = 'LOKALER_OG_BANER' WHERE category IN ('SPACE');
UPDATE listings SET category = 'UTSTYR_OG_INVENTAR' WHERE category IN ('RESOURCE');
UPDATE listings SET category = 'KJORETOY_OG_TRANSPORT' WHERE category IN ('VEHICLE');
UPDATE listings SET category = 'OPPLEVELSER_OG_ARRANGEMENT' WHERE category IN ('EVENT', 'SERVICE', 'OTHER');

-- Step 3: Drop legacy columns that are no longer needed
ALTER TABLE listings DROP COLUMN IF EXISTS category_v2;
ALTER TABLE listings DROP COLUMN IF EXISTS migration_status;

-- Step 4: Add subcategory column if it doesn't exist
ALTER TABLE listings ADD COLUMN IF NOT EXISTS subcategory VARCHAR(100);

-- Step 5: Update indexes
DROP INDEX IF EXISTS listings_type_idx;
CREATE INDEX IF NOT EXISTS listings_category_idx ON listings(category);
CREATE INDEX IF NOT EXISTS listings_subcategory_idx ON listings(subcategory);
CREATE INDEX IF NOT EXISTS listings_time_mode_idx ON listings(time_mode);
