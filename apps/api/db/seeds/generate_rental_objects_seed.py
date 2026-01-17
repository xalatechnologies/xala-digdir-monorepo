#!/usr/bin/env python3
"""
Generate complete SQL seed for all 40 rental objects from JSON
"""

import json
import sys

# Read the JSON file
with open('apps/api/data/rental-objects-40-full.json', 'r') as f:
    data = json.load(f)

objects = data['objects']

print("-- =====================================================================")
print("--  03_DOMAIN_RENTAL_OBJECTS.SQL (ALL 40 OBJECTS)")
print("--  Generated from rental-objects-40-full.json")
print("-- =====================================================================")
print()
print("BEGIN;")
print()

# ========================================================================
# Part 1: Rental Objects
# ========================================================================
print("-- =====================================================================")
print("-- RENTAL OBJECTS (All 40)")
print("-- =====================================================================")
print()
print("INSERT INTO domain.rental_objects (")
print("  id, tenant_id, organization_id,")
print("  category_key, type_code, time_mode, status,")
print("  title, slug, description, capacity,")
print("  address, postal_code, city, country,")
print("  published_at, is_active")
print(")")
print("VALUES")

for i, obj in enumerate(objects):
    comma = "," if i < len(objects) - 1 else ""
    
    # Clean description
    desc = obj.get('description', '').replace("'", "''")
    
    print(f"  -- Object {i+1}: {obj['name']}")
    print(f"  ('{obj['id']}', '{obj['tenantId']}', '{obj['organizationId']}',")
    print(f"   '{obj['categoryKey']}', 'SPACE', 'PERIOD', 'PUBLISHED',")
    print(f"   '{obj['name']}', '{obj['slug']}',")
    print(f"   '{desc}',")
    print(f"   {obj['capacity']}, '{obj['metadata']['location']['address']}', '{obj['metadata']['location']['postalCode']}', '{obj['metadata']['location']['city']}', 'Norway',")
    print(f"   NOW() - INTERVAL '{40 - i} days', true){comma}")
    print()

print("ON CONFLICT (id) DO UPDATE SET")
print("  title = EXCLUDED.title,")
print("  description = EXCLUDED.description,")
print("  status = EXCLUDED.status,")
print("  updated_at = NOW();")
print()

# ========================================================================
# Part 2: Media (3 images per object)
# ========================================================================
print("-- =====================================================================")
print("-- RENTAL OBJECT MEDIA (3 images per object)")
print("-- =====================================================================")
print()
print("INSERT INTO domain.rental_object_media (tenant_id, rental_object_id, media_type, url, alt_text, sort_order, is_primary)")
print("VALUES")

media_values = []
for obj in objects:
    images = obj.get('images', [])[:3]  # Take first 3 images
    for idx, img_url in enumerate(images):
        is_primary = 'true' if idx == 0 else 'false'
        media_values.append(
            f"  ('{obj['tenantId']}', '{obj['id']}', 'IMAGE', '{img_url}', '{obj['name']} bilde {idx+1}', {idx+1}, {is_primary})"
        )

print(',\n'.join(media_values))
print("ON CONFLICT (rental_object_id, url) DO UPDATE SET")
print("  sort_order = EXCLUDED.sort_order,")
print("  is_primary = EXCLUDED.is_primary;")
print()

# ========================================================================
# Part 3: Amenities
# ========================================================================
print("-- =====================================================================")
print("-- RENTAL OBJECT AMENITIES")
print("-- =====================================================================")
print()
print("WITH amenity_mapping AS (")
print("  SELECT a.id, a.tenant_id, a.code")
print("  FROM domain.amenities a")
print("  WHERE a.is_active = true")
print(")")
print("INSERT INTO domain.rental_object_amenities (tenant_id, rental_object_id, amenity_id)")
print("SELECT")
print("  ro.tenant_id,")
print("  ro.id,")
print("  am.id")
print("FROM domain.rental_objects ro")
print("CROSS JOIN LATERAL (")
print("  VALUES")

# Collect unique amenities from all objects
all_amenities = set()
for obj in objects:
    amenities = obj.get('metadata', {}).get('amenities', [])
    all_amenities.update(amenities)

amenity_values = [f"    ('{code}')" for code in sorted(all_amenities)]
print(',\n'.join(amenity_values))

print(") AS codes(code)")
print("JOIN amenity_mapping am ON am.tenant_id = ro.tenant_id AND am.code = codes.code")
print("WHERE ro.id IN (")

object_ids = [f"  '{obj['id']}'" for obj in objects]
print(',\n'.join(object_ids))

print(")")
print("ON CONFLICT (rental_object_id, amenity_id) DO NOTHING;")
print()

# ========================================================================
# Part 4: Pricing
# ========================================================================
print("-- =====================================================================")
print("-- PRICING")
print("-- =====================================================================")
print()
print("WITH pricing_group_ids AS (")
print("  SELECT id, tenant_id, code FROM platform.pricing_groups")
print(")")
print("INSERT INTO domain.rental_object_pricing (")
print("  tenant_id, rental_object_id, pricing_group_id,")
print("  base_price_cents, discount_percentage,")
print("  requires_deposit, deposit_cents, tax_rate")
print(")")
print("SELECT")
print("  ro.tenant_id,")
print("  ro.id,")
print("  pg.id,")
print("  150000, -- Base price from JSON: 1500 NOK")
print("  CASE pg.code")
print("    WHEN 'MEMBER' THEN 15")
print("    WHEN 'STUDENT' THEN 20")
print("    WHEN 'NONPROFIT' THEN 25")
print("    ELSE 0")
print("  END,")
print("  true,")
print("  300000, -- Deposit: 3000 NOK")
print("  0.25")
print("FROM domain.rental_objects ro")
print("JOIN pricing_group_ids pg ON pg.tenant_id = ro.tenant_id")
print("WHERE ro.id IN (")
print(',\n'.join(object_ids))
print(")")
print("ON CONFLICT (rental_object_id, pricing_group_id) DO UPDATE SET")
print("  base_price_cents = EXCLUDED.base_price_cents;")
print()

# ========================================================================
# Part 5: Opening Hours
# ========================================================================
print("-- =====================================================================")
print("-- OPENING HOURS (from JSON)")
print("-- =====================================================================")
print()
print("INSERT INTO domain.opening_hours (")
print("  tenant_id, rental_object_id, day_of_week, open_time, close_time, is_closed")
print(")")
print("SELECT")
print("  ro.tenant_id,")
print("  ro.id,")
print("  dow.day,")
print("  dow.open,")
print("  dow.close,")
print("  false")
print("FROM domain.rental_objects ro")
print("CROSS JOIN (")
print("  VALUES")
print("    (1, '06:00'::time, '23:00'::time),")
print("    (2, '06:00'::time, '23:00'::time),")
print("    (3, '06:00'::time, '23:00'::time),")
print("    (4, '06:00'::time, '23:00'::time),")
print("    (5, '06:00'::time, '23:00'::time),")
print("    (6, '08:00'::time, '22:00'::time),")
print("    (0, '08:00'::time, '22:00'::time)")
print(") AS dow(day, open, close)")
print("WHERE ro.id IN (")
print(',\n'.join(object_ids))
print(")")
print("ON CONFLICT (rental_object_id, day_of_week) DO UPDATE SET")
print("  open_time = EXCLUDED.open_time;")
print()

print("COMMIT;")
print()
print("-- =====================================================================")
print("-- VERIFICATION")
print("-- =====================================================================")
print()
print("SELECT 'All 40 rental objects seeded!' AS status,")
print("  (SELECT COUNT(*) FROM domain.rental_objects) AS rental_objects,")
print("  (SELECT COUNT(*) FROM domain.rental_object_media) AS media,")
print("  (SELECT COUNT(*) FROM domain.rental_object_amenities) AS amenity_links,")
print("  (SELECT COUNT(*) FROM domain.rental_object_pricing) AS pricing_configs,")
print("  (SELECT COUNT(*) FROM domain.opening_hours) AS opening_hours;")
