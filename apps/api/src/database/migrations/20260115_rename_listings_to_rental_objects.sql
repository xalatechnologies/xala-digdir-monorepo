-- Migration: Rename listings table to rental_objects
-- Date: 2026-01-15
-- Description: Standardize terminology - rename listings to rental_objects (utleieobjekter)

-- Rename the table
ALTER TABLE IF EXISTS listings RENAME TO rental_objects;

-- Rename indexes to match new table name
ALTER INDEX IF EXISTS listings_tenant_idx RENAME TO rental_objects_tenant_idx;
ALTER INDEX IF EXISTS listings_status_idx RENAME TO rental_objects_status_idx;
ALTER INDEX IF EXISTS listings_category_idx RENAME TO rental_objects_category_idx;
ALTER INDEX IF EXISTS listings_subcategory_idx RENAME TO rental_objects_subcategory_idx;
ALTER INDEX IF EXISTS listings_slug_idx RENAME TO rental_objects_slug_idx;
ALTER INDEX IF EXISTS listings_time_mode_idx RENAME TO rental_objects_time_mode_idx;

-- Update foreign key constraints references (if any named constraints exist)
-- Note: The bookings and allocations tables reference listings via listing_id column
-- The column name stays as listing_id for backward compatibility, but the FK now points to rental_objects

-- Add comment to document the rename
COMMENT ON TABLE rental_objects IS 'Rental objects (utleieobjekter) - formerly named listings';
