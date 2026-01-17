-- Manual Seed Script for Production Database
-- Execute this in Hostinger's phpMyAdmin or PostgreSQL panel
-- Date: 2026-01-17

-- ============================================
-- 1. CHECK CURRENT STATE
-- ============================================

-- Check if rental objects exist
SELECT COUNT(*) as rental_count FROM platform.rental_objects;

-- Check if tenant exists
SELECT id, name, slug FROM platform.tenants WHERE slug = 'skien';

-- ============================================
-- 2. SEED TENANT (Skien Kommune)
-- ============================================

INSERT INTO platform.tenants (id, name, slug, domain, status, settings, feature_flags, enabled_rental_object_categories)
VALUES (
  'd0000000-0000-0000-0000-000000000001',
  'Skien Kommune',
  'skien',
  'skien.digilist.no',
  'active',
  '{}',
  '{"backoffice.orgManagement": true, "backoffice.reporting": true, "backoffice.auditLog": true}',
  '["LOKALER_OG_BANER", "UTSTYR_OG_INVENTAR", "KJORETOY_OG_TRANSPORT", "OPPLEVELSER_OG_ARRANGEMENT"]'
)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- 3. SEED DEMO ADMIN USER
-- ============================================

INSERT INTO platform.users (id, tenant_id, email, name, role, status, demo_token)
VALUES (
  'a0000000-0000-0000-0000-000000000001',
  'd0000000-0000-0000-0000-000000000001',
  'admin@skien.kommune.no',
  'Admin Skien',
  'admin',
  'active',
  'skien-admin-001'
)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- 4. SEED RENTAL OBJECTS (5 examples)
-- ============================================

-- Object 1: Kulturhuset - Storsalen
INSERT INTO platform.rental_objects (
  id, tenant_id, name, slug, category_key, time_mode, status, capacity,
  pricing, metadata, description
) VALUES (
  'r0000000-0000-0000-0000-000000000001',
  'd0000000-0000-0000-0000-000000000001',
  'Kulturhuset - Storsalen',
  'kulturhuset-storsalen',
  'LOKALER_OG_BANER',
  'PERIOD',
  'published',
  500,
  '{"basePrice": 500, "currency": "NOK", "unit": "hour"}',
  '{"city": "Skien", "location": {"address": "Kulturveien 1", "postalCode": "3720", "city": "Skien"}}',
  'Moderne idrettshall i Skien sentrum'
)
ON CONFLICT (id) DO NOTHING;

-- Object 2: Idrettshallen - Hovedhall
INSERT INTO platform.rental_objects (
  id, tenant_id, name, slug, category_key, time_mode, status, capacity,
  pricing, metadata, description
) VALUES (
  'r0000001-0000-0000-0000-000000000001',
  'd0000000-0000-0000-0000-000000000001',
  'Idrettshallen - Hovedhall',
  'idrettshallen-hovedhall',
  'LOKALER_OG_BANER',
  'SLOT',
  'published',
  200,
  '{"basePrice": 300, "currency": "NOK", "unit": "hour"}',
  '{"city": "Skien", "location": {"address": "Idrettsveien 1", "postalCode": "3720", "city": "Skien"}}',
  'Stor idrettshall for lagidretter'
)
ON CONFLICT (id) DO NOTHING;

-- Object 3: Tennisbane 1
INSERT INTO platform.rental_objects (
  id, tenant_id, name, slug, category_key, time_mode, status, capacity,
  pricing, metadata, description
) VALUES (
  'r0000002-0000-0000-0000-000000000001',
  'd0000000-0000-0000-0000-000000000001',
  'Tennisbane 1',
  'tennisbane-1',
  'LOKALER_OG_BANER',
  'SLOT',
  'published',
  4,
  '{"basePrice": 150, "currency": "NOK", "unit": "hour"}',
  '{"city": "Skien", "location": {"address": "Tennisveien 5", "postalCode": "3720", "city": "Skien"}}',
  'Utendørs tennisbane med god standard'
)
ON CONFLICT (id) DO NOTHING;

-- Object 4: Partytelt 6x12m
INSERT INTO platform.rental_objects (
  id, tenant_id, name, slug, category_key, time_mode, status, capacity,
  pricing, metadata, description, features, inventory_total
) VALUES (
  'r0000003-0000-0000-0000-000000000001',
  'd0000000-0000-0000-0000-000000000001',
  'Partytelt 6x12m',
  'partytelt-6x12m',
  'UTSTYR_OG_INVENTAR',
  'ALL_DAY',
  'published',
  NULL,
  '{"basePrice": 800, "currency": "NOK", "unit": "day"}',
  '{"city": "Skien"}',
  'Stort festtelt til arrangementer',
  '["INVENTORY"]',
  3
)
ON CONFLICT (id) DO NOTHING;

-- Object 5: Kommunebil - VW Transporter
INSERT INTO platform.rental_objects (
  id, tenant_id, name, slug, category_key, time_mode, status, capacity,
  pricing, metadata, description, features, inventory_total, requires_approval
) VALUES (
  'r0000004-0000-0000-0000-000000000001',
  'd0000000-0000-0000-0000-000000000001',
  'Kommunebil - VW Transporter',
  'kommunebil-vw-transporter',
  'KJORETOY_OG_TRANSPORT',
  'ALL_DAY',
  'published',
  NULL,
  '{"basePrice": 500, "currency": "NOK", "unit": "day"}',
  '{"city": "Skien"}',
  'Varebil til utlån',
  '["INVENTORY"]',
  1,
  true
)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- 5. VERIFY
-- ============================================

-- Count rental objects
SELECT COUNT(*) as total_rental_objects FROM platform.rental_objects WHERE status = 'published';

-- List all rental objects
SELECT id, name, category_key, time_mode, status, capacity FROM platform.rental_objects ORDER BY name;

-- Check cities
SELECT DISTINCT
  metadata->>'city' as city
FROM platform.rental_objects
WHERE status = 'published'
  AND metadata->>'city' IS NOT NULL;
