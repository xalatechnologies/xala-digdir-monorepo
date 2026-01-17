-- =====================================================================
--  04_DOMAIN_PRICING_AVAILABILITY.SQL
--  Price rules, add-on assignments, exception days
-- =====================================================================

BEGIN;

-- =====================================================================
-- RENTAL OBJECT ADDONS (assign cleaning & equipment to venues)
-- =====================================================================

WITH addon_mapping AS (
  SELECT id, tenant_id, code FROM domain.addons WHERE is_active = true
)

INSERT INTO domain.rental_object_addons (tenant_id, rental_object_id, addon_id)
SELECT
  ro.tenant_id,
  ro.id,
  am.id
FROM domain.rental_objects ro
CROSS JOIN LATERAL (
  VALUES
    ('cleaning'),
    ('equipment_football'),
    ('chairs'),
    ('tables')
) AS codes(code)
JOIN addon_mapping am ON am.tenant_id = ro.tenant_id AND am.code = codes.code
WHERE ro.category_key = 'LOKALER_OG_BANER'
  AND ro.id IN (
    'd0000001-0000-0000-0000-000000000001',
    'd0000001-0000-0001-0000-000000000000',
    'd0000001-0000-0002-0000-000000000000'
  )
ON CONFLICT (rental_object_id, addon_id) DO NOTHING;

-- =====================================================================
-- EXCEPTION DAYS (Holidays, closures)
-- =====================================================================

INSERT INTO domain.exception_days (
  tenant_id, rental_object_id, date, reason, is_closed
)
SELECT
  ro.tenant_id,
  ro.id,
  exc.date,
  exc.reason,
  exc.is_closed
FROM domain.rental_objects ro
CROSS JOIN (
  VALUES
    ('2026-01-01'::date, 'Nyttårsdag', true),
    ('2026-05-01'::date, 'Arbeidernes dag', true),
    ('2026-05-17'::date, 'Grunnlovsdag', true),
    ('2026-12-24'::date, 'Julaften', true),
    ('2026-12-25'::date, 'Juledag', true),
    ('2026-12-26'::date, 'Andre juledag', true),
    ('2026-12-31'::date, 'Nyttårsaften', true)
) AS exc(date, reason, is_closed)
WHERE ro.tenant_id = 'f47ac10b-58cc-4372-a567-0e02b2c3d479'
  AND ro.id IN (
    'd0000001-0000-0000-0000-000000000001',
    'd0000001-0000-0001-0000-000000000000'
  )
ON CONFLICT (rental_object_id, date) DO UPDATE SET
  reason = EXCLUDED.reason,
  is_closed = EXCLUDED.is_closed;

-- =====================================================================
-- TIME BLOCKS (Maintenance, admin holds)
-- =====================================================================

-- Summer maintenance block
INSERT INTO domain.time_blocks (
  tenant_id, rental_object_id, block_type,
  start_at, end_at, reason, created_by
)
VALUES
  ('f47ac10b-58cc-4372-a567-0e02b2c3d479',
   'd0000001-0000-0000-0000-000000000001',
   'MAINTENANCE',
   '2026-07-01 00:00:00'::timestamp,
   '2026-07-15 23:59:59'::timestamp,
   'Sommervedlikehold - gulvbehandling',
   '66666666-6666-6666-6666-666666666666'),
  
  ('f47ac10b-58cc-4372-a567-0e02b2c3d479',
   'd0000001-0000-0001-0000-000000000000',
   'MAINTENANCE',
   '2026-08-01 00:00:00'::timestamp,
   '2026-08-10 23:59:59'::timestamp,
   'Sommervedlikehold - gressmatte',
   '66666666-6666-6666-6666-666666666666')
ON CONFLICT DO NOTHING;

COMMIT;

-- =====================================================================
-- VERIFICATION
-- =====================================================================

SELECT 'Pricing & availability seed complete.' AS status,
  (SELECT COUNT(*) FROM domain.rental_object_addons) AS addon_assignments,
  (SELECT COUNT(*) FROM domain.exception_days) AS exception_days,
  (SELECT COUNT(*) FROM domain.time_blocks) AS time_blocks;
