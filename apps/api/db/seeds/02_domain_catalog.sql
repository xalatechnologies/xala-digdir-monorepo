-- =====================================================================
--  02_DOMAIN_CATALOG.SQL
--  Domain dictionaries: categories, amenities, addons
--  Extracted from rental-objects-40-full.json
-- =====================================================================

BEGIN;

-- =====================================================================
-- RENTAL OBJECT CATEGORIES
-- =====================================================================

INSERT INTO domain.rental_object_categories (code, name, description, icon, is_active)
VALUES
  ('LOKALER_OG_BANER', 'Lokaler og baner', 'Idrettshaller, fotballbaner, tennisbaner', 'sports_hall', true),
  ('UTSTYR', 'Utstyr', 'Sportsutstyr og annet leieutstyr', 'equipment', true),
  ('MØTEROM', 'Møterom', 'Møterom og konferanselokaler', 'meeting', true),
  ('LEILIGHETER', 'Leiligheter', 'Utleieleiligheter', 'apartment', true)
ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  updated_at = NOW();

-- =====================================================================
-- AMENITY GROUPS
-- =====================================================================

INSERT INTO domain.amenity_groups (tenant_id, code, name, description, is_active)
VALUES
  -- Skien
  ('f47ac10b-58cc-4372-a567-0e02b2c3d479', 'FACILITIES', 'Fasiliteter', 'Garderober, dusjer, etc.', true),
  ('f47ac10b-58cc-4372-a567-0e02b2c3d479', 'SERVICES', 'Tjenester', 'WiFi, parkering, etc.', true),
  ('f47ac10b-58cc-4372-a567-0e02b2c3d479', 'SAFETY', 'Sikkerhet', 'Førstehjelpsutstyr, etc.', true),
  
  -- Porsgrunn
  ('a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d', 'FACILITIES', 'Fasiliteter', 'Garderober, dusjer, etc.', true),
  ('a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d', 'SERVICES', 'Tjenester', 'WiFi, parkering, etc.', true),
  
  -- Bamble
  ('b2c3d4e5-f6a7-5b6c-9d0e-1f2a3b4c5d6e', 'FACILITIES', 'Fasiliteter', 'Garderober, dusjer, etc.', true),
  ('b2c3d4e5-f6a7-5b6c-9d0e-1f2a3b4c5d6e', 'SERVICES', 'Tjenester', 'WiFi, parkering, etc.', true)
ON CONFLICT (tenant_id, code) DO UPDATE SET
  name = EXCLUDED.name,
  updated_at = NOW();

-- =====================================================================
-- AMENITIES (from JSON metadata.amenities)
-- =====================================================================

INSERT INTO domain.amenities (tenant_id, code, name, group_code, icon_key, is_active)
VALUES
  -- Skien amenities
  ('f47ac10b-58cc-4372-a567-0e02b2c3d479', 'changing_rooms', 'Garderober', 'FACILITIES', 'locker_room', true),
  ('f47ac10b-58cc-4372-a567-0e02b2c3d479', 'showers', 'Dusjer', 'FACILITIES', 'shower', true),
  ('f47ac10b-58cc-4372-a567-0e02b2c3d479', 'parking', 'Parkering', 'SERVICES', 'parking', true),
  ('f47ac10b-58cc-4372-a567-0e02b2c3d479', 'wifi', 'WiFi', 'SERVICES', 'wifi', true),
  ('f47ac10b-58cc-4372-a567-0e02b2c3d479', 'first_aid', 'Førstehjelpsutstyr', 'SAFETY', 'medical', true),
  ('f47ac10b-58cc-4372-a567-0e02b2c3d479', 'wheelchair_access', 'Rullestoltilgang', 'FACILITIES', 'accessibility', true),
  ('f47ac10b-58cc-4372-a567-0e02b2c3d479', 'hearing_loop', 'Teleslynge', 'FACILITIES', 'hearing', true),
  ('f47ac10b-58cc-4372-a567-0e02b2c3d479', 'kitchen', 'Kjøkken', 'FACILITIES', 'kitchen', true),
  ('f47ac10b-58cc-4372-a567-0e02b2c3d479', 'projector', 'Projektor', 'SERVICES', 'projector', true),
  ('f47ac10b-58cc-4372-a567-0e02b2c3d479', 'sound_system', 'Lydsystem', 'SERVICES', 'speaker', true),
  
  -- Porsgrunn amenities
  ('a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d', 'changing_rooms', 'Garderober', 'FACILITIES', 'locker_room', true),
  ('a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d', 'showers', 'Dusjer', 'FACILITIES', 'shower', true),
  ('a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d', 'parking', 'Parkering', 'SERVICES', 'parking', true),
  ('a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d', 'wifi', 'WiFi', 'SERVICES', 'wifi', true),
  ('a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d', 'first_aid', 'Førstehjelpsutstyr', 'SAFETY', 'medical', true),
  
  -- Bamble amenities
  ('b2c3d4e5-f6a7-5b6c-9d0e-1f2a3b4c5d6e', 'changing_rooms', 'Garderober', 'FACILITIES', 'locker_room', true),
  ('b2c3d4e5-f6a7-5b6c-9d0e-1f2a3b4c5d6e', 'showers', 'Dusjer', 'FACILITIES', 'shower', true),
  ('b2c3d4e5-f6a7-5b6c-9d0e-1f2a3b4c5d6e', 'parking', 'Parkering', 'SERVICES', 'parking', true),
  ('b2c3d4e5-f6a7-5b6c-9d0e-1f2a3b4c5d6e', 'wifi', 'WiFi', 'SERVICES', 'wifi', true)
ON CONFLICT (tenant_id, code) DO UPDATE SET
  name = EXCLUDED.name,
  group_code = EXCLUDED.group_code,
  updated_at = NOW();

-- =====================================================================
-- ADDONS (Additional services)
-- =====================================================================

INSERT INTO domain.addons (tenant_id, code, name, description, pricing_model, base_price_cents, is_required, max_units, is_active)
VALUES
  -- Skien addons
  ('f47ac10b-58cc-4372-a567-0e02b2c3d479', 'cleaning', 'Rengjøring', 'Profesjonell rengjøring etter bruk', 'PER_BOOKING', 80000, false, 1, true),
  ('f47ac10b-58cc-4372-a567-0e02b2c3d479', 'equipment_football', 'Fotballutstyr', 'Baller, kjegler, vester', 'PER_BOOKING', 50000, false, 1, true),
  ('f47ac10b-58cc-4372-a567-0e02b2c3d479', 'equipment_handball', 'Håndballutstyr', 'Baller og mål', 'PER_BOOKING', 50000, false, 1, true),
  ('f47ac10b-58cc-4372-a567-0e02b2c3d479', 'chairs', 'Ekstra stoler', 'Stoler for arrangement', 'PER_UNIT', 5000, false, 100, true),
  ('f47ac10b-58cc-4372-a567-0e02b2c3d479', 'tables', 'Ekstra bord', 'Bord for arrangement', 'PER_UNIT', 10000, false, 50, true),
  ('f47ac10b-58cc-4372-a567-0e02b2c3d479', 'catering', 'Catering', 'Mat og drikke', 'PER_UNIT', 25000, false, 100, true),
  
  -- Porsgrunn addons
  ('a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d', 'cleaning', 'Rengjøring', 'Profesjonell rengjøring etter bruk', 'PER_BOOKING', 80000, false, 1, true),
  ('a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d', 'equipment_football', 'Fotballutstyr', 'Baller, kjegler, vester', 'PER_BOOKING', 50000, false, 1, true),
  ('a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d', 'chairs', 'Ekstra stoler', 'Stoler for arrangement', 'PER_UNIT', 5000, false, 100, true),
  
  -- Bamble addons
  ('b2c3d4e5-f6a7-5b6c-9d0e-1f2a3b4c5d6e', 'cleaning', 'Rengjøring', 'Profesjonell rengjøring etter bruk', 'PER_BOOKING', 80000, false, 1, true),
  ('b2c3d4e5-f6a7-5b6c-9d0e-1f2a3b4c5d6e', 'equipment_football', 'Fotballutstyr', 'Baller, kjegler, vester', 'PER_BOOKING', 50000, false, 1, true)
ON CONFLICT (tenant_id, code) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  base_price_cents = EXCLUDED.base_price_cents,
  updated_at = NOW();

-- =====================================================================
-- SUPPORT CATEGORIES
-- =====================================================================

INSERT INTO domain.support_categories (tenant_id, code, name, description, is_active)
VALUES
  -- Skien
  ('f47ac10b-58cc-4372-a567-0e02b2c3d479', 'BOOKING', 'Booking', 'Spørsmål om booking', true),
  ('f47ac10b-58cc-4372-a567-0e02b2c3d479', 'PAYMENT', 'Betaling', 'Betalingsproblemer', true),
  ('f47ac10b-58cc-4372-a567-0e02b2c3d479', 'TECHNICAL', 'Teknisk', 'Tekniske problemer', true),
  ('f47ac10b-58cc-4372-a567-0e02b2c3d479', 'OTHER', 'Annet', 'Andre henvendelser', true),
  
  -- Porsgrunn
  ('a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d', 'BOOKING', 'Booking', 'Spørsmål om booking', true),
  ('a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d', 'PAYMENT', 'Betaling', 'Betalingsproblemer', true),
  ('a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d', 'TECHNICAL', 'Teknisk', 'Tekniske problemer', true),
  
  -- Bamble
  ('b2c3d4e5-f6a7-5b6c-9d0e-1f2a3b4c5d6e', 'BOOKING', 'Booking', 'Spørsmål om booking', true),
  ('b2c3d4e5-f6a7-5b6c-9d0e-1f2a3b4c5d6e', 'TECHNICAL', 'Teknisk', 'Tekniske problemer', true)
ON CONFLICT (tenant_id, code) DO UPDATE SET
  name = EXCLUDED.name,
  updated_at = NOW();

COMMIT;

-- =====================================================================
-- VERIFICATION
-- =====================================================================

SELECT 'Domain catalog seed complete.' AS status,
  (SELECT COUNT(*) FROM domain.rental_object_categories) AS categories,
  (SELECT COUNT(*) FROM domain.amenity_groups) AS amenity_groups,
  (SELECT COUNT(*) FROM domain.amenities) AS amenities,
  (SELECT COUNT(*) FROM domain.addons) AS addons,
  (SELECT COUNT(*) FROM domain.support_categories) AS support_categories;
