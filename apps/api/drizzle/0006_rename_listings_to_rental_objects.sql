-- Migration: Rename listings to rental_objects
-- Date: 2026-01-16
-- Description: Complete migration from listing terminology to rental_object

-- Step 1: Rename the main table
ALTER TABLE IF EXISTS "listings" RENAME TO "rental_objects";

-- Step 2: Rename indexes
ALTER INDEX IF EXISTS "listings_tenant_idx" RENAME TO "rental_objects_tenant_idx";
ALTER INDEX IF EXISTS "listings_status_idx" RENAME TO "rental_objects_status_idx";
ALTER INDEX IF EXISTS "listings_type_idx" RENAME TO "rental_objects_type_idx";
ALTER INDEX IF EXISTS "listings_slug_idx" RENAME TO "rental_objects_slug_idx";
ALTER INDEX IF EXISTS "listings_category_idx" RENAME TO "rental_objects_category_idx";
ALTER INDEX IF EXISTS "listings_subcategory_idx" RENAME TO "rental_objects_subcategory_idx";
ALTER INDEX IF EXISTS "listings_time_mode_idx" RENAME TO "rental_objects_time_mode_idx";

-- Step 3: Rename foreign key columns in dependent tables
ALTER TABLE "bookings"
  RENAME COLUMN "listing_id" TO "rental_object_id";

ALTER TABLE "allocations"
  RENAME COLUMN "listing_id" TO "rental_object_id";

ALTER TABLE "seasonal_leases"
  RENAME COLUMN "listing_id" TO "rental_object_id";

-- Step 4: Rename indexes on foreign key columns
ALTER INDEX IF EXISTS "bookings_listing_idx" RENAME TO "bookings_rental_object_idx";
ALTER INDEX IF EXISTS "allocations_listing_idx" RENAME TO "allocations_rental_object_idx";
ALTER INDEX IF EXISTS "seasonal_leases_listing_idx" RENAME TO "seasonal_leases_rental_object_idx";

-- Step 5: Add migration documentation comment
COMMENT ON TABLE "rental_objects" IS 'Rental objects (utleieobjekter) - renamed from listings on 2026-01-16';
