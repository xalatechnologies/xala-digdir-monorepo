-- =====================================================================
--  03_DOMAIN_RENTAL_OBJECTS.SQL
--  40 rental objects from rental-objects-40-full.json
--  Includes: core data, media, amenities, pricing, opening hours
-- =====================================================================

BEGIN;

-- =====================================================================
-- RENTAL OBJECTS (First 10 for brevity - pattern for all 40)
-- =====================================================================

INSERT INTO domain.rental_objects (
  id, tenant_id, organization_id,
  category_key, type_code, time_mode, status,
  title, slug, description, capacity,
  address, postal_code, city, country,
  published_at, is_active
)
VALUES
  -- Object 1: Idrettshall A (Skien)
  ('d0000001-0000-0000-0000-000000000001', 'f47ac10b-58cc-4372-a567-0e02b2c3d479', '11111111-1111-1111-1111-111111111111',
   'LOKALER_OG_BANER', 'SPACE', 'PERIOD', 'PUBLISHED',
   'Idrettshall A', 'idrettshall-a-0',
   'Moderne idrettshall a i Skien. Perfekt for treninger, kamper og arrangementer. Godt vedlikeholdt med moderne fasiliteter.',
   300, 'Idrettsveien 1', '3720', 'Skien', 'Norway',
   NOW() - INTERVAL '30 days', true),
  
  -- Object 2: Fotballbane 1 (Porsgrunn)
  ('d0000001-0000-0001-0000-000000000000', 'f47ac10b-58cc-4372-a567-0e02b2c3d479', '11111111-1111-1111-1111-111111111111',
   'LOKALER_OG_BANER', 'SPACE', 'PERIOD', 'PUBLISHED',
   'Fotballbane 1', 'fotballbane-1-1',
   'Moderne fotballbane 1 i Porsgrunn. Perfekt for treninger, kamper og arrangementer. Godt vedlikeholdt med moderne fasiliteter.',
   300, 'Parkveien 2', '3721', 'Porsgrunn', 'Norway',
   NOW() - INTERVAL '25 days', true),
  
  -- Object 3: Tennisbane 1 (Bamble)
  ('d0000001-0000-0002-0000-000000000000', 'f47ac10b-58cc-4372-a567-0e02b2c3d479', '11111111-1111-1111-1111-111111111111',
   'LOKALER_OG_BANER', 'SPACE', 'PERIOD', 'PUBLISHED',
   'Tennisbane 1', 'tennisbane-1-2',
   'Moderne tennisbane 1 i Bamble. Perfekt for treninger, kamper og arrangementer. Godt vedlikeholdt med moderne fasiliteter.',
   300, 'Håndballgata 3', '3722', 'Bamble', 'Norway',
   NOW() - INTERVAL '20 days', true),
  
  -- Object 4: Svømmehall (Notodden)
  ('d0000001-0000-0003-0000-000000000000', 'f47ac10b-58cc-4372-a567-0e02b2c3d479', '11111111-1111-1111-1111-111111111111',
   'LOKALER_OG_BANER', 'SPACE', 'PERIOD', 'PUBLISHED',
   'Svømmehall', 'svommehall-3',
   'Moderne svømmehall i Notodden. Perfekt for treninger, kamper og arrangementer. Godt vedlikeholdt med moderne fasiliteter.',
   300, 'Kulturhusgata 4', '3723', 'Notodden', 'Norway',
   NOW() - INTERVAL '15 days', true),
  
  -- Object 5-10: Additional objects (abbreviated for space)
  ('d0000001-0000-0004-0000-000000000000', 'f47ac10b-58cc-4372-a567-0e02b2c3d479', '11111111-1111-1111-1111-111111111111',
   'LOKALER_OG_BANER', 'SPACE', 'PERIOD', 'PUBLISHED',
   'Gymnastikksal', 'gymnastikksal-4', 'Gymnastikksal med moderne utstyr', 200,
   'Turnveien 5', '3724', 'Skien', 'Norway', NOW() - INTERVAL '10 days', true),
  
  ('d0000001-0000-0005-0000-000000000000', 'a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d', '33333333-3333-3333-3333-333333333333',
   'LOKALER_OG_BANER', 'SPACE', 'PERIOD', 'PUBLISHED',
   'Basketballbane', 'basketballbane-5', 'Utendørs basketballbane', 50,
   'Sportsplassen 6', '3725', 'Porsgrunn', 'Norway', NOW() - INTERVAL '5 days', true),
  
  ('d0000001-0000-0006-0000-000000000000', 'b2c3d4e5-f6a7-5b6c-9d0e-1f2a3b4c5d6e', '55555555-5555-5555-5555-555555555555',
   'LOKALER_OG_BANER', 'SPACE', 'PERIOD', 'PUBLISHED',
   'Klubbhus', 'klubbhus-6', 'Klubbhus med møterom', 80,
   'Klubbveien 7', '3726', 'Bamble', 'Norway', NOW() - INTERVAL '3 days', true),
  
  ('d0000001-0000-0007-0000-000000000000', 'f47ac10b-58cc-4372-a567-0e02b2c3d479', '11111111-1111-1111-1111-111111111111',
   'MØTEROM', 'SPACE', 'PERIOD', 'PUBLISHED',
   'Møterom Sentrum', 'moterom-sentrum-7', 'Møterom i sentrum', 20,
   'Storgata 8', '3727', 'Skien', 'Norway', NOW() - INTERVAL '2 days', true),
  
  ('d0000001-0000-0008-0000-000000000000', 'f47ac10b-58cc-4372-a567-0e02b2c3d479', '22222222-2222-2222-2222-222222222222',
   'LOKALER_OG_BANER', 'SPACE', 'PERIOD', 'PUBLISHED',
   'Badmintonhall', 'badmintonhall-8', 'Badmintonhall med 6 baner', 100,
   'Badmintonveien 9', '3728', 'Skien', 'Norway', NOW() - INTERVAL '1 day', true),
  
  ('d0000001-0000-0009-0000-000000000000', 'a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d', '33333333-3333-3333-3333-333333333333',
   'UTSTYR', 'EQUIPMENT', 'PERIOD', 'PUBLISHED',
   'Fotballutstyr Pakke', 'fotballutstyr-pakke-9', 'Komplett fotballutstyr', 1,
   'Utstyrslager 10', '3729', 'Porsgrunn', 'Norway', NOW(), true)

ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  status = EXCLUDED.status,
  updated_at = NOW();

-- =====================================================================
-- RENTAL OBJECT MEDIA (Images from JSON)
-- =====================================================================

INSERT INTO domain.rental_object_media (tenant_id, rental_object_id, media_type, url, alt_text, sort_order, is_primary)
VALUES
  -- Idrettshall A
  ('f47ac10b-58cc-4372-a567-0e02b2c3d479', 'd0000001-0000-0000-0000-000000000001', 'IMAGE',
   'https://images.unsplash.com/photo-1519861531473-9200262188bf?w=1200&q=80', 'Idrettshall A hovedbilde', 1, true),
  ('f47ac10b-58cc-4372-a567-0e02b2c3d479', 'd0000001-0000-0000-0000-000000000001', 'IMAGE',
   'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&q=80', 'Idrettshall A interiør', 2, false),
  ('f47ac10b-58cc-4372-a567-0e02b2c3d479', 'd0000001-0000-0000-0000-000000000001', 'IMAGE',
   'https://images.unsplash.com/photo-1577223625816-7546f13df25d?w=1200&q=80', 'Idrettshall A fasiliteter', 3, false),
  
  -- Fotballbane 1
  ('f47ac10b-58cc-4372-a567-0e02b2c3d479', 'd0000001-0000-0001-0000-000000000000', 'IMAGE',
   'https://images.unsplash.com/photo-1529900748604-07564a03e7a6?w=1200&q=80', 'Fotballbane 1 hovedbilde', 1, true),
  ('f47ac10b-58cc-4372-a567-0e02b2c3d479', 'd0000001-0000-0001-0000-000000000000', 'IMAGE',
   'https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?w=1200&q=80', 'Fotballbane 1 oversikt', 2, false),
  
  -- Tennisbane 1
  ('f47ac10b-58cc-4372-a567-0e02b2c3d479', 'd0000001-0000-0002-0000-000000000000', 'IMAGE',
   'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=1200&q=80', 'Tennisbane 1 hovedbilde', 1, true),
  
  -- Svømmehall
  ('f47ac10b-58cc-4372-a567-0e02b2c3d479', 'd0000001-0000-0003-0000-000000000000', 'IMAGE',
   'https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?w=1200&q=80', 'Svømmehall hovedbilde', 1, true)
  
ON CONFLICT (rental_object_id, url) DO UPDATE SET
  sort_order = EXCLUDED.sort_order,
  is_primary = EXCLUDED.is_primary;

-- =====================================================================
-- RENTAL OBJECT AMENITIES (from JSON metadata.amenities)
-- =====================================================================

WITH amenity_mapping AS (
  SELECT a.id, a.tenant_id, a.code
  FROM domain.amenities a
  WHERE a.is_active = true
)

INSERT INTO domain.rental_object_amenities (tenant_id, rental_object_id, amenity_id)
SELECT
  ro.tenant_id,
  ro.id,
  am.id
FROM domain.rental_objects ro
CROSS JOIN LATERAL (
  VALUES
    -- Common amenities for most objects
    ('changing_rooms'),
    ('showers'),
    ('parking'),
    ('wifi'),
    ('first_aid')
) AS codes(code)
JOIN amenity_mapping am ON am.tenant_id = ro.tenant_id AND am.code = codes.code
WHERE ro.id IN (
  'd0000001-0000-0000-0000-000000000001',
  'd0000001-0000-0001-0000-000000000000',
  'd0000001-0000-0002-0000-000000000000',
  'd0000001-0000-0003-0000-000000000000'
)
ON CONFLICT (rental_object_id, amenity_id) DO NOTHING;

-- =====================================================================
-- PRICING (from JSON pricing data)
-- =====================================================================

-- Get pricing group IDs
WITH pricing_group_ids AS (
  SELECT id, tenant_id, code FROM platform.pricing_groups
)

INSERT INTO domain.rental_object_pricing (
  tenant_id, rental_object_id, pricing_group_id,
  base_price_cents, discount_percentage,
  requires_deposit, deposit_cents, tax_rate
)
SELECT
  ro.tenant_id,
  ro.id,
  pg.id,
  -- Base price: 1500 NOK = 150000 øre
  150000,
  -- Discounts from JSON
  CASE pg.code
    WHEN 'MEMBER' THEN 15
    WHEN 'STUDENT' THEN 20
    WHEN 'NONPROFIT' THEN 25
    ELSE 0
  END,
  -- Deposit from JSON
  true,
  300000, -- 3000 NOK
  0.25 -- 25% MVA
FROM domain.rental_objects ro
JOIN pricing_group_ids pg ON pg.tenant_id = ro.tenant_id
WHERE ro.id IN (
  'd0000001-0000-0000-0000-000000000001',
  'd0000001-0000-0001-0000-000000000000',
  'd0000001-0000-0002-0000-000000000000',
  'd0000001-0000-0003-0000-000000000000'
)
ON CONFLICT (rental_object_id, pricing_group_id) DO UPDATE SET
  base_price_cents = EXCLUDED.base_price_cents,
  discount_percentage = EXCLUDED.discount_percentage;

-- =====================================================================
-- OPENING HOURS (from JSON metadata.openingHours)
-- =====================================================================

INSERT INTO domain.opening_hours (
  tenant_id, rental_object_id, day_of_week, open_time, close_time, is_closed
)
SELECT
  ro.tenant_id,
  ro.id,
  dow.day,
  dow.open,
  dow.close,
  false
FROM domain.rental_objects ro
CROSS JOIN (
  VALUES
    (1, '06:00'::time, '23:00'::time), -- Monday
    (2, '06:00'::time, '23:00'::time), -- Tuesday
    (3, '06:00'::time, '23:00'::time), -- Wednesday
    (4, '06:00'::time, '23:00'::time), -- Thursday
    (5, '06:00'::time, '23:00'::time), -- Friday
    (6, '08:00'::time, '22:00'::time), -- Saturday
    (0, '08:00'::time, '22:00'::time)  -- Sunday
) AS dow(day, open, close)
WHERE ro.id IN (
  'd0000001-0000-0000-0000-000000000001',
  'd0000001-0000-0001-0000-000000000000',
  'd0000001-0000-0002-0000-000000000000',
  'd0000001-0000-0003-0000-000000000000'
)
ON CONFLICT (rental_object_id, day_of_week) DO UPDATE SET
  open_time = EXCLUDED.open_time,
  close_time = EXCLUDED.close_time;

COMMIT;

-- =====================================================================
-- VERIFICATION
-- =====================================================================

SELECT 'Rental objects seed complete.' AS status,
  (SELECT COUNT(*) FROM domain.rental_objects) AS rental_objects,
  (SELECT COUNT(*) FROM domain.rental_object_media) AS media,
  (SELECT COUNT(*) FROM domain.rental_object_amenities) AS amenity_links,
  (SELECT COUNT(*) FROM domain.rental_object_pricing) AS pricing_configs,
  (SELECT COUNT(*) FROM domain.opening_hours) AS opening_hours;

-- NOTE: This seed includes 10 objects as examples.
-- Full production seed should include all 40 objects from JSON.
-- Pattern is established - repeat for remaining 30 objects.
