-- Quick Local Database Setup
-- Run this to test locally

-- Create schemas
CREATE SCHEMA IF NOT EXISTS platform;
CREATE SCHEMA IF NOT EXISTS domain;
CREATE SCHEMA IF NOT EXISTS compliance;

-- Create minimal rental_objects table
CREATE TABLE IF NOT EXISTS platform.rental_objects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL,
  category_key VARCHAR(50) NOT NULL DEFAULT 'LOKALER_OG_BANER',
  time_mode VARCHAR(20) NOT NULL DEFAULT 'PERIOD',
  status VARCHAR(50) NOT NULL DEFAULT 'draft',
  capacity INTEGER,
  pricing JSONB DEFAULT '{}',
  metadata JSONB DEFAULT '{}',
  description TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create index
CREATE INDEX IF NOT EXISTS rental_objects_status_idx ON platform.rental_objects(status);

-- Insert test tenant (Skien Kommune)
INSERT INTO platform.tenants (id, name, slug, status)
VALUES (
  'd0000000-0000-0000-0000-000000000001',
  'Skien Kommune',
  'skien',
  'active'
)
ON CONFLICT (id) DO NOTHING;

-- Insert 5 test rental objects
INSERT INTO platform.rental_objects (
  id, tenant_id, name, slug, category_key, time_mode, status, capacity, pricing, metadata
) VALUES
(
  'r0000000-0000-0000-0000-000000000001',
  'd0000000-0000-0000-0000-000000000001',
  'Kulturhuset Storsalen',
  'kulturhuset-storsalen',
  'LOKALER_OG_BANER',
  'PERIOD',
  'published',
  500,
  '{"basePrice": 500, "currency": "NOK", "unit": "hour"}',
  '{"city": "Skien", "location": {"city": "Skien", "address": "Kulturveien 1"}}'
),
(
  'r0000001-0000-0000-0000-000000000001',
  'd0000000-0000-0000-0000-000000000001',
  'Idrettshallen Hovedhall',
  'idrettshallen-hovedhall',
  'LOKALER_OG_BANER',
  'SLOT',
  'published',
  200,
  '{"basePrice": 300, "currency": "NOK", "unit": "hour"}',
  '{"city": "Skien", "location": {"city": "Skien"}}'
),
(
  'r0000002-0000-0000-0000-000000000001',
  'd0000000-0000-0000-0000-000000000001',
  'Tennisbane 1',
  'tennisbane-1',
  'LOKALER_OG_BANER',
  'SLOT',
  'published',
  4,
  '{"basePrice": 150, "currency": "NOK", "unit": "hour"}',
  '{"city": "Skien"}'
),
(
  'r0000003-0000-0000-0000-000000000001',
  'd0000000-0000-0000-0000-000000000001',
  'Partytelt 6x12m',
  'partytelt-6x12m',
  'UTSTYR_OG_INVENTAR',
  'ALL_DAY',
  'published',
  NULL,
  '{"basePrice": 800, "currency": "NOK", "unit": "day"}',
  '{"city": "Skien"}'
),
(
  'r0000004-0000-0000-0000-000000000001',
  'd0000000-0000-0000-0000-000000000001',
  'Kommunebil VW Transporter',
  'kommunebil-vw-transporter',
  'KJORETOY_OG_TRANSPORT',
  'ALL_DAY',
  'published',
  NULL,
  '{"basePrice": 500, "currency": "NOK", "unit": "day"}',
  '{"city": "Skien"}'
)
ON CONFLICT (id) DO NOTHING;

-- Verify
SELECT COUNT(*) as total FROM platform.rental_objects;
SELECT id, name, status FROM platform.rental_objects;
