-- Migration: Rename type to category in rental_objects
-- Simplifies schema to use consistent 'category' terminology

-- Step 1: Add category column (same values as type)
ALTER TABLE rental_objects 
ADD COLUMN IF NOT EXISTS category varchar(50) NOT NULL DEFAULT 'LOCALE';

-- Step 2: Copy data from type to category
UPDATE rental_objects SET category = type WHERE category = 'LOCALE';

-- Step 3: Add requires_approval column
ALTER TABLE rental_objects
ADD COLUMN IF NOT EXISTS requires_approval boolean NOT NULL DEFAULT false;

-- Step 4: Add index for category
CREATE INDEX IF NOT EXISTS rental_objects_category_idx ON rental_objects(category);

-- Note: type column kept for backward compatibility
-- Can be dropped in future migration after all code is updated
