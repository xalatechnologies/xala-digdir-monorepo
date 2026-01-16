-- Complete Demo Seed Script for Skien Kommune
-- Target: 40 LOKALER_OG_BANER + 10 each other category
-- Each with 3 images and complete metadata

-- Get tenant ID
-- f47ac10b-58cc-4372-a567-0e02b2c3d479 is our Skien Kommune tenant

-- =============================================================================
-- STEP 1: Add 15 more LOKALER_OG_BANER to reach 40
-- =============================================================================

INSERT INTO rental_objects (id, tenant_id, name, slug, category_key, time_mode, status, capacity, description, images, metadata, pricing, features, created_at, updated_at)
VALUES 
-- Kulturhus og saler
('a0000001-0000-0000-0000-000000000001', 'f47ac10b-58cc-4372-a567-0e02b2c3d479', 'Kulturhuset - Hovedscene', 'kulturhuset-hovedscene', 'LOKALER_OG_BANER', 'PERIOD', 'published', 600,
'Den største scenen i Skien med plass til 600 gjester. Profesjonelt lys- og lydanlegg inkludert. Perfekt for konserter, teater og store arrangementer.',
'[{"url": "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200", "alt": "Hovedscene fra publikum"},
  {"url": "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=1200", "alt": "Scene med belysning"},
  {"url": "https://images.unsplash.com/photo-1431068799455-80bae0caf685?w=1200", "alt": "Sitteplasser"}]'::jsonb,
'{"address": {"street": "Kulturhusgata 1", "postalCode": "3724", "city": "Skien", "country": "Norway"},
  "location": {"latitude": 59.2086, "longitude": 9.6089},
  "amenities": ["wifi", "projector", "microphone", "stage_lighting", "wheelchair_accessible", "parking", "backstage"],
  "contact": {"email": "kulturhuset@skien.kommune.no", "phone": "+47 35 58 00 00"},
  "openingHours": {"weekdays": "08:00-23:00", "weekends": "10:00-23:00"}}'::jsonb,
'{"basePrice": 8000, "currency": "NOK", "unit": "day", "hourlyRate": 1500}'::jsonb,
'[]'::jsonb, NOW(), NOW()),

('a0000002-0000-0000-0000-000000000001', 'f47ac10b-58cc-4372-a567-0e02b2c3d479', 'Festiviteten - Foajé', 'festiviteten-foaje', 'LOKALER_OG_BANER', 'PERIOD', 'published', 200,
'Elegant foajé i Festiviteten. Ideell for mingling, utstillinger og cocktailselskaper.',
'[{"url": "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=1200", "alt": "Foajé interiør"},
  {"url": "https://images.unsplash.com/photo-1519750157634-b6d493a0f77c?w=1200", "alt": "Historisk detalj"},
  {"url": "https://images.unsplash.com/photo-1510076857177-7470076d4098?w=1200", "alt": "Belysning"}]'::jsonb,
'{"address": {"street": "Teaterplassen 2", "postalCode": "3724", "city": "Skien", "country": "Norway"},
  "location": {"latitude": 59.2092, "longitude": 9.6095},
  "amenities": ["wifi", "bar", "cloakroom", "wheelchair_accessible"],
  "contact": {"email": "festiviteten@skien.kommune.no", "phone": "+47 35 58 01 00"}}'::jsonb,
'{"basePrice": 4000, "currency": "NOK", "unit": "day", "hourlyRate": 700}'::jsonb,
'[]'::jsonb, NOW(), NOW()),

-- Idrettshaller
('a0000003-0000-0000-0000-000000000001', 'f47ac10b-58cc-4372-a567-0e02b2c3d479', 'Skienshallen - Hovedbane', 'skienshallen-hovedbane', 'LOKALER_OG_BANER', 'SLOT', 'published', 300,
'Skienshallen med full håndballbane. Elektronisk resultattavle og tribune for 300 tilskuere.',
'[{"url": "https://images.unsplash.com/photo-1519861531473-9200262188bf?w=1200", "alt": "Idrettshall innvendig"},
  {"url": "https://images.unsplash.com/photo-1577223625816-7546f13df25d?w=1200", "alt": "Basketballbane"},
  {"url": "https://images.unsplash.com/photo-1574623452334-1e0ac2b3ccb4?w=1200", "alt": "Tribune"}]'::jsonb,
'{"address": {"street": "Idrettsveien 15", "postalCode": "3724", "city": "Skien", "country": "Norway"},
  "location": {"latitude": 59.2150, "longitude": 9.6200},
  "amenities": ["changing_rooms", "showers", "parking", "scoreboard", "tribune"],
  "sportTypes": ["handball", "basketball", "volleyball", "futsal"],
  "contact": {"email": "idrett@skien.kommune.no", "phone": "+47 35 58 02 00"}}'::jsonb,
'{"basePrice": 800, "currency": "NOK", "unit": "hour"}'::jsonb,
'[]'::jsonb, NOW(), NOW()),

('a0000004-0000-0000-0000-000000000001', 'f47ac10b-58cc-4372-a567-0e02b2c3d479', 'Skienshallen - Styrkerom', 'skienshallen-styrkerom', 'LOKALER_OG_BANER', 'SLOT', 'published', 20,
'Fullt utstyrt styrkerom med frivekter, maskiner og kardio-utstyr.',
'[{"url": "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1200", "alt": "Styrkerom"},
  {"url": "https://images.unsplash.com/photo-1540497077202-7c8a3999166f?w=1200", "alt": "Treningsutstyr"},
  {"url": "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=1200", "alt": "Frivekter"}]'::jsonb,
'{"address": {"street": "Idrettsveien 15", "postalCode": "3724", "city": "Skien", "country": "Norway"},
  "location": {"latitude": 59.2150, "longitude": 9.6200},
  "amenities": ["changing_rooms", "showers", "mirrors", "sound_system"],
  "equipment": ["free_weights", "machines", "cardio", "mats"],
  "contact": {"email": "idrett@skien.kommune.no", "phone": "+47 35 58 02 00"}}'::jsonb,
'{"basePrice": 300, "currency": "NOK", "unit": "hour"}'::jsonb,
'[]'::jsonb, NOW(), NOW()),

-- Svømmehall
('a0000005-0000-0000-0000-000000000001', 'f47ac10b-58cc-4372-a567-0e02b2c3d479', 'Skien Badeland - 25m basseng', 'skien-badeland-25m', 'LOKALER_OG_BANER', 'SLOT', 'published', 60,
'25 meter svømmebasseng med 6 baner. Perfekt for treningsgrupper og svømmekurs.',
'[{"url": "https://images.unsplash.com/photo-1519315901367-f34ff9154487?w=1200", "alt": "Svømmebasseng"},
  {"url": "https://images.unsplash.com/photo-1576610616656-d3aa5d1f4534?w=1200", "alt": "Baner ovenfra"},
  {"url": "https://images.unsplash.com/photo-1575429198097-0414ec08e8cd?w=1200", "alt": "Startblokker"}]'::jsonb,
'{"address": {"street": "Badeparken 5", "postalCode": "3724", "city": "Skien", "country": "Norway"},
  "location": {"latitude": 59.2120, "longitude": 9.6150},
  "amenities": ["changing_rooms", "showers", "sauna", "wheelchair_accessible"],
  "poolLength": "25m", "lanes": 6, "temperature": "27°C",
  "contact": {"email": "badeland@skien.kommune.no", "phone": "+47 35 58 03 00"}}'::jsonb,
'{"basePrice": 500, "currency": "NOK", "unit": "hour"}'::jsonb,
'[]'::jsonb, NOW(), NOW()),

-- Tennis og padel
('a0000006-0000-0000-0000-000000000001', 'f47ac10b-58cc-4372-a567-0e02b2c3d479', 'Skien Tennisklubb - Bane 3', 'skien-tennis-bane-3', 'LOKALER_OG_BANER', 'SLOT', 'published', 4,
'Innendørs tennisbane med profesjonelt underlag. Belysning og racketutleie tilgjengelig.',
'[{"url": "https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?w=1200", "alt": "Tennisbane"},
  {"url": "https://images.unsplash.com/photo-1545809627-e7b43c1abd7f?w=1200", "alt": "Tennis nett"},
  {"url": "https://images.unsplash.com/photo-1542144612-1b3641ec3459?w=1200", "alt": "Tennisball"}]'::jsonb,
'{"address": {"street": "Tennisalléen 5", "postalCode": "3724", "city": "Skien", "country": "Norway"},
  "location": {"latitude": 59.2140, "longitude": 9.6190},
  "amenities": ["changing_rooms", "showers", "equipment_rental", "lighting"],
  "surface": "hardcourt",
  "contact": {"email": "tennis@skien.kommune.no", "phone": "+47 35 58 04 00"}}'::jsonb,
'{"basePrice": 250, "currency": "NOK", "unit": "hour"}'::jsonb,
'[]'::jsonb, NOW(), NOW()),

('a0000007-0000-0000-0000-000000000001', 'f47ac10b-58cc-4372-a567-0e02b2c3d479', 'Padelhuset - Bane 3', 'padelhuset-bane-3', 'LOKALER_OG_BANER', 'SLOT', 'published', 4,
'Moderne padelbane med glassvegger og profesjonell belysning. Sentralt i Skien.',
'[{"url": "https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=1200", "alt": "Padelbane"},
  {"url": "https://images.unsplash.com/photo-1622279457486-28f77e6a92c4?w=1200", "alt": "Padel i aksjon"},
  {"url": "https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?w=1200", "alt": "Padel racket"}]'::jsonb,
'{"address": {"street": "Racketveien 8", "postalCode": "3724", "city": "Skien", "country": "Norway"},
  "location": {"latitude": 59.2135, "longitude": 9.6185},
  "amenities": ["changing_rooms", "showers", "equipment_rental", "cafe"],
  "courtType": "indoor",
  "contact": {"email": "padel@skien.kommune.no", "phone": "+47 35 58 05 00"}}'::jsonb,
'{"basePrice": 450, "currency": "NOK", "unit": "hour"}'::jsonb,
'[]'::jsonb, NOW(), NOW()),

-- Møterom
('a0000008-0000-0000-0000-000000000001', 'f47ac10b-58cc-4372-a567-0e02b2c3d479', 'Rådhuset - Bystyresalen', 'radhuset-bystyresalen', 'LOKALER_OG_BANER', 'PERIOD', 'published', 80,
'Historisk bystyresal med talerstol og AV-utstyr. Perfekt for formelle møter og presentasjoner.',
'[{"url": "https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200", "alt": "Bystyresalen"},
  {"url": "https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=1200", "alt": "Talerstol"},
  {"url": "https://images.unsplash.com/photo-1431540015161-0bf868a2d407?w=1200", "alt": "Historisk interiør"}]'::jsonb,
'{"address": {"street": "Rådhusgata 2", "postalCode": "3724", "city": "Skien", "country": "Norway"},
  "location": {"latitude": 59.2100, "longitude": 9.6100},
  "amenities": ["wifi", "projector", "microphone", "video_conference", "wheelchair_accessible"],
  "contact": {"email": "radhuset@skien.kommune.no", "phone": "+47 35 58 00 00"}}'::jsonb,
'{"basePrice": 2000, "currency": "NOK", "unit": "day", "hourlyRate": 400}'::jsonb,
'[]'::jsonb, NOW(), NOW()),

('a0000009-0000-0000-0000-000000000001', 'f47ac10b-58cc-4372-a567-0e02b2c3d479', 'Rådhuset - Formannskapssalen', 'radhuset-formannskapssalen', 'LOKALER_OG_BANER', 'PERIOD', 'published', 25,
'Elegant sal for mindre møter og forhandlinger. Moderne AV-utstyr.',
'[{"url": "https://images.unsplash.com/photo-1582653291997-079a1c04e5a1?w=1200", "alt": "Møterom"},
  {"url": "https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=1200", "alt": "Konferansebord"},
  {"url": "https://images.unsplash.com/photo-1497215728101-856f4ea42174?w=1200", "alt": "Presentasjon"}]'::jsonb,
'{"address": {"street": "Rådhusgata 2", "postalCode": "3724", "city": "Skien", "country": "Norway"},
  "location": {"latitude": 59.2100, "longitude": 9.6100},
  "amenities": ["wifi", "projector", "video_conference", "whiteboard"],
  "contact": {"email": "radhuset@skien.kommune.no", "phone": "+47 35 58 00 00"}}'::jsonb,
'{"basePrice": 800, "currency": "NOK", "unit": "day", "hourlyRate": 200}'::jsonb,
'[]'::jsonb, NOW(), NOW()),

-- Grendehus
('a0000010-0000-0000-0000-000000000001', 'f47ac10b-58cc-4372-a567-0e02b2c3d479', 'Grendehuset Borgestad', 'grendehuset-borgestad', 'LOKALER_OG_BANER', 'ALL_DAY', 'published', 80,
'Koselig grendehus med kjøkken og stor sal. Perfekt for private fester og arrangementer.',
'[{"url": "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=1200", "alt": "Festsal"},
  {"url": "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=1200", "alt": "Kjøkken"},
  {"url": "https://images.unsplash.com/photo-1510076857177-7470076d4098?w=1200", "alt": "Dekorert sal"}]'::jsonb,
'{"address": {"street": "Borgestadvegen 45", "postalCode": "3724", "city": "Skien", "country": "Norway"},
  "location": {"latitude": 59.2250, "longitude": 9.5900},
  "amenities": ["kitchen", "tables_chairs", "parking", "wheelchair_accessible", "sound_system"],
  "contact": {"email": "grendehus@skien.kommune.no", "phone": "+47 35 58 06 00"}}'::jsonb,
'{"basePrice": 2500, "currency": "NOK", "unit": "day"}'::jsonb,
'[]'::jsonb, NOW(), NOW()),

('a0000011-0000-0000-0000-000000000001', 'f47ac10b-58cc-4372-a567-0e02b2c3d479', 'Grendehuset Falkum', 'grendehuset-falkum', 'LOKALER_OG_BANER', 'ALL_DAY', 'published', 60,
'Tradisjonelt grendehus med fin utsikt. Inkluderer kjøkken og uteplass.',
'[{"url": "https://images.unsplash.com/photo-1519710164239-da123dc03ef4?w=1200", "alt": "Grendehus interiør"},
  {"url": "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=1200", "alt": "Stue"},
  {"url": "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=1200", "alt": "Uteplass"}]'::jsonb,
'{"address": {"street": "Falkumveien 12", "postalCode": "3724", "city": "Skien", "country": "Norway"},
  "location": {"latitude": 59.2180, "longitude": 9.6050},
  "amenities": ["kitchen", "tables_chairs", "parking", "outdoor_space", "grill"],
  "contact": {"email": "grendehus@skien.kommune.no", "phone": "+47 35 58 06 00"}}'::jsonb,
'{"basePrice": 2000, "currency": "NOK", "unit": "day"}'::jsonb,
'[]'::jsonb, NOW(), NOW()),

-- Utendørs anlegg
('a0000012-0000-0000-0000-000000000001', 'f47ac10b-58cc-4372-a567-0e02b2c3d479', 'Stadionparken - Hovedbane', 'stadionparken-hovedbane', 'LOKALER_OG_BANER', 'SLOT', 'published', 22,
'Kunstgress fotballbane med flomlys. Godkjent for kamper på høyeste nivå.',
'[{"url": "https://images.unsplash.com/photo-1459865264687-595d652de67e?w=1200", "alt": "Fotballbane"},
  {"url": "https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?w=1200", "alt": "Flomlys"},
  {"url": "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=1200", "alt": "Mål"}]'::jsonb,
'{"address": {"street": "Stadionparken 1", "postalCode": "3724", "city": "Skien", "country": "Norway"},
  "location": {"latitude": 59.2160, "longitude": 9.6180},
  "amenities": ["changing_rooms", "showers", "floodlights", "parking"],
  "surface": "artificial_grass", "dimensions": "105x68m",
  "contact": {"email": "idrett@skien.kommune.no", "phone": "+47 35 58 02 00"}}'::jsonb,
'{"basePrice": 600, "currency": "NOK", "unit": "hour"}'::jsonb,
'[]'::jsonb, NOW(), NOW()),

('a0000013-0000-0000-0000-000000000001', 'f47ac10b-58cc-4372-a567-0e02b2c3d479', 'Friluftsbadet - Bassenget', 'friluftsbadet-bassenget', 'LOKALER_OG_BANER', 'SLOT', 'published', 100,
'Utendørs svømmebasseng åpent i sommersesongen. 50 meter med stupetårn.',
'[{"url": "https://images.unsplash.com/photo-1575429198097-0414ec08e8cd?w=1200", "alt": "Friluftsbadet"},
  {"url": "https://images.unsplash.com/photo-1582653291997-079a1c04e5a1?w=1200", "alt": "Stupetårn"},
  {"url": "https://images.unsplash.com/photo-1560185127-bdf4a3d8d6a9?w=1200", "alt": "Solsenger"}]'::jsonb,
'{"address": {"street": "Friluftsallé 10", "postalCode": "3724", "city": "Skien", "country": "Norway"},
  "location": {"latitude": 59.2200, "longitude": 9.6220},
  "amenities": ["changing_rooms", "showers", "diving_board", "sunbeds", "kiosk"],
  "poolLength": "50m", "openSeason": "June-August",
  "contact": {"email": "friluftsbadet@skien.kommune.no", "phone": "+47 35 58 07 00"}}'::jsonb,
'{"basePrice": 400, "currency": "NOK", "unit": "hour"}'::jsonb,
'[]'::jsonb, NOW(), NOW()),

-- Bibliotek og kulturrom
('a0000014-0000-0000-0000-000000000001', 'f47ac10b-58cc-4372-a567-0e02b2c3d479', 'Hovedbiblioteket - Salen', 'hovedbiblioteket-salen', 'LOKALER_OG_BANER', 'PERIOD', 'published', 100,
'Moderne sal i biblioteket for foredrag, boklanseringer og kulturarrangementer.',
'[{"url": "https://images.unsplash.com/photo-1507842217343-583bb7270b66?w=1200", "alt": "Biblioteket"},
  {"url": "https://images.unsplash.com/photo-1521587760476-6c12a4b040da?w=1200", "alt": "Bøker"},
  {"url": "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=1200", "alt": "Lesekrok"}]'::jsonb,
'{"address": {"street": "Bibliotekgata 5", "postalCode": "3724", "city": "Skien", "country": "Norway"},
  "location": {"latitude": 59.2080, "longitude": 9.6070},
  "amenities": ["wifi", "projector", "microphone", "wheelchair_accessible"],
  "contact": {"email": "bibliotek@skien.kommune.no", "phone": "+47 35 58 08 00"}}'::jsonb,
'{"basePrice": 0, "currency": "NOK", "unit": "hour"}'::jsonb,
'[]'::jsonb, NOW(), NOW()),

('a0000015-0000-0000-0000-000000000001', 'f47ac10b-58cc-4372-a567-0e02b2c3d479', 'Ungdomshuset - Aktivitetsrom', 'ungdomshuset-aktivitetsrom', 'LOKALER_OG_BANER', 'PERIOD', 'published', 40,
'Fleksibelt aktivitetsrom for ungdomsarrangementer, kurs og verksteder.',
'[{"url": "https://images.unsplash.com/photo-1497215728101-856f4ea42174?w=1200", "alt": "Aktivitetsrom"},
  {"url": "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=1200", "alt": "Ungdomsaktivitet"},
  {"url": "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=1200", "alt": "Kreativt rom"}]'::jsonb,
'{"address": {"street": "Ungdomsveien 8", "postalCode": "3724", "city": "Skien", "country": "Norway"},
  "location": {"latitude": 59.2110, "longitude": 9.6130},
  "amenities": ["wifi", "sound_system", "projector", "kitchen"],
  "contact": {"email": "ungdomshuset@skien.kommune.no", "phone": "+47 35 58 09 00"}}'::jsonb,
'{"basePrice": 500, "currency": "NOK", "unit": "day"}'::jsonb,
'[]'::jsonb, NOW(), NOW())

ON CONFLICT (id) DO UPDATE SET 
  description = EXCLUDED.description,
  images = EXCLUDED.images,
  metadata = EXCLUDED.metadata,
  pricing = EXCLUDED.pricing,
  updated_at = NOW();

-- =============================================================================
-- STEP 2: Add 2 more UTSTYR_OG_INVENTAR to reach 10
-- =============================================================================

INSERT INTO rental_objects (id, tenant_id, name, slug, category_key, time_mode, status, description, images, metadata, pricing, features, inventory_total, created_at, updated_at)
VALUES 
('b0000001-0000-0000-0000-000000000001', 'f47ac10b-58cc-4372-a567-0e02b2c3d479', 'Scene/Podium 4x6m', 'scene-podium-4x6', 'UTSTYR_OG_INVENTAR', 'ALL_DAY', 'published',
'Modulær scene/podium 4x6 meter. Høyde 60cm. Inkluderer trapper og rekkverk.',
'[{"url": "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=1200", "alt": "Scene"},
  {"url": "https://images.unsplash.com/photo-1504680177321-2e6a879aac86?w=1200", "alt": "Podium"},
  {"url": "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=1200", "alt": "Scene oppsett"}]'::jsonb,
'{"dimensions": "4m x 6m", "height": "60cm",
  "includes": ["trapper", "rekkverk", "tepper"],
  "pickup": {"address": "Kommunelager, Industriveien 5", "hours": "08:00-16:00"},
  "contact": {"email": "utstyr@skien.kommune.no", "phone": "+47 35 58 10 00"}}'::jsonb,
'{"basePrice": 2000, "currency": "NOK", "unit": "day", "deposit": 3000}'::jsonb,
'["INVENTORY"]'::jsonb, 2, NOW(), NOW()),

('b0000002-0000-0000-0000-000000000001', 'f47ac10b-58cc-4372-a567-0e02b2c3d479', 'Belysningspakke LED', 'belysningspakke-led', 'UTSTYR_OG_INVENTAR', 'ALL_DAY', 'published',
'Komplett LED belysningspakke med 8 spots, stativ og DMX-kontroller.',
'[{"url": "https://images.unsplash.com/photo-1558584673-c834fb1cc3ca?w=1200", "alt": "Scenelys"},
  {"url": "https://images.unsplash.com/photo-1504680177321-2e6a879aac86?w=1200", "alt": "LED spots"},
  {"url": "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=1200", "alt": "Lyskontroller"}]'::jsonb,
'{"specs": {"lights": 8, "type": "LED RGBW", "controller": "DMX"},
  "includes": ["8x LED spots", "2x stativ", "DMX-kontroller", "kabler"],
  "pickup": {"address": "Kommunelager, Industriveien 5", "hours": "08:00-16:00"},
  "contact": {"email": "utstyr@skien.kommune.no", "phone": "+47 35 58 10 00"}}'::jsonb,
'{"basePrice": 1200, "currency": "NOK", "unit": "day", "deposit": 2000}'::jsonb,
'["INVENTORY"]'::jsonb, 3, NOW(), NOW())

ON CONFLICT (id) DO UPDATE SET 
  description = EXCLUDED.description,
  images = EXCLUDED.images,
  metadata = EXCLUDED.metadata,
  pricing = EXCLUDED.pricing,
  updated_at = NOW();

-- =============================================================================
-- STEP 3: Add 6 more KJORETOY_OG_TRANSPORT to reach 10
-- =============================================================================

INSERT INTO rental_objects (id, tenant_id, name, slug, category_key, time_mode, status, description, images, metadata, pricing, features, inventory_total, requires_approval, created_at, updated_at)
VALUES 
('c0000001-0000-0000-0000-000000000001', 'f47ac10b-58cc-4372-a567-0e02b2c3d479', 'Kommunebil - VW ID.Buzz', 'kommunebil-vw-id-buzz', 'KJORETOY_OG_TRANSPORT', 'ALL_DAY', 'published',
'Elektrisk minibuss med plass til 7 passasjerer. Perfekt for gruppeture.',
'[{"url": "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200", "alt": "VW ID Buzz"},
  {"url": "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=1200", "alt": "Interiør"},
  {"url": "https://images.unsplash.com/photo-1581540222194-0def2dda95b8?w=1200", "alt": "Lading"}]'::jsonb,
'{"vehicle": {"make": "Volkswagen", "model": "ID.Buzz", "year": 2024, "seats": 7, "range_km": 400},
  "requirements": ["Førerkort B", "Min 21 år"],
  "insuranceIncluded": true, "fuelType": "electric",
  "pickup": {"address": "Kommunegarasjen, Verkstedveien 1", "hours": "07:00-15:00"},
  "contact": {"email": "bilpark@skien.kommune.no", "phone": "+47 35 58 11 00"}}'::jsonb,
'{"basePrice": 800, "currency": "NOK", "unit": "day", "kmIncluded": 200, "extraKmRate": 2}'::jsonb,
'["INVENTORY"]'::jsonb, 2, true, NOW(), NOW()),

('c0000002-0000-0000-0000-000000000001', 'f47ac10b-58cc-4372-a567-0e02b2c3d479', 'Sparkesykkel Tier', 'sparkesykkel-tier', 'KJORETOY_OG_TRANSPORT', 'ALL_DAY', 'published',
'Elektrisk sparkesykkel for by-transport. Maks hastighet 20 km/t.',
'[{"url": "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200", "alt": "Sparkesykkel"},
  {"url": "https://images.unsplash.com/photo-1571068316344-75bc76f77890?w=1200", "alt": "El-sparkesykkel"},
  {"url": "https://images.unsplash.com/photo-1565104781149-275a5392f7e2?w=1200", "alt": "Urban transport"}]'::jsonb,
'{"vehicle": {"type": "electric_scooter", "maxSpeed": "20 km/t", "range_km": 30},
  "requirements": ["Min 18 år", "Hjelm anbefalt"],
  "pickup": {"address": "Sentralstasjonen", "hours": "06:00-22:00"},
  "contact": {"email": "mobilitet@skien.kommune.no", "phone": "+47 35 58 12 00"}}'::jsonb,
'{"basePrice": 100, "currency": "NOK", "unit": "day"}'::jsonb,
'["INVENTORY"]'::jsonb, 20, false, NOW(), NOW()),

('c0000003-0000-0000-0000-000000000001', 'f47ac10b-58cc-4372-a567-0e02b2c3d479', 'Kano 2-seter', 'kano-2-seter', 'KJORETOY_OG_TRANSPORT', 'ALL_DAY', 'published',
'Stabil 2-seters kano for turer på Telemarkskanalen. Inkluderer årer og redningsvester.',
'[{"url": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1200", "alt": "Kano"},
  {"url": "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=1200", "alt": "Padling"},
  {"url": "https://images.unsplash.com/photo-1533240332962-5765e3e96e9e?w=1200", "alt": "Kanoferie"}]'::jsonb,
'{"equipment": {"type": "canoe", "capacity": 2, "length": "4.5m"},
  "includes": ["2x årer", "2x redningsvester", "tørrpose"],
  "pickup": {"address": "Kanoutleie Skien Brygge", "hours": "09:00-18:00"},
  "contact": {"email": "friluft@skien.kommune.no", "phone": "+47 35 58 13 00"}}'::jsonb,
'{"basePrice": 300, "currency": "NOK", "unit": "day"}'::jsonb,
'["INVENTORY"]'::jsonb, 8, false, NOW(), NOW()),

('c0000004-0000-0000-0000-000000000001', 'f47ac10b-58cc-4372-a567-0e02b2c3d479', 'SUP-brett', 'sup-brett', 'KJORETOY_OG_TRANSPORT', 'ALL_DAY', 'published',
'Stand-up paddleboard for rolig vannsport. Perfekt for nybegynnere.',
'[{"url": "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=1200", "alt": "SUP-brett"},
  {"url": "https://images.unsplash.com/photo-1559264950-c4665a8c52ed?w=1200", "alt": "SUP padling"},
  {"url": "https://images.unsplash.com/photo-1593351415075-3bac9f45c877?w=1200", "alt": "SUP ved sjøen"}]'::jsonb,
'{"equipment": {"type": "SUP", "length": "3.2m", "volume": "300L"},
  "includes": ["åre", "redningsvest", "leash"],
  "pickup": {"address": "Kanoutleie Skien Brygge", "hours": "09:00-18:00"},
  "contact": {"email": "friluft@skien.kommune.no", "phone": "+47 35 58 13 00"}}'::jsonb,
'{"basePrice": 200, "currency": "NOK", "unit": "day"}'::jsonb,
'["INVENTORY"]'::jsonb, 10, false, NOW(), NOW()),

('c0000005-0000-0000-0000-000000000001', 'f47ac10b-58cc-4372-a567-0e02b2c3d479', 'Minibuss 16-seter', 'minibuss-16-seter', 'KJORETOY_OG_TRANSPORT', 'ALL_DAY', 'published',
'Mercedes Sprinter med 16 seter. Krever førerkort D1. Inkluderer forsikring.',
'[{"url": "https://images.unsplash.com/photo-1570125909232-eb263c188f7e?w=1200", "alt": "Minibuss"},
  {"url": "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=1200", "alt": "Interiør"},
  {"url": "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=1200", "alt": "Transport"}]'::jsonb,
'{"vehicle": {"make": "Mercedes-Benz", "model": "Sprinter", "year": 2022, "seats": 16},
  "requirements": ["Førerkort D1", "Min 25 år", "Min 3 års erfaring"],
  "insuranceIncluded": true, "fuelType": "diesel",
  "pickup": {"address": "Kommunegarasjen, Verkstedveien 1", "hours": "07:00-15:00"},
  "contact": {"email": "bilpark@skien.kommune.no", "phone": "+47 35 58 11 00"}}'::jsonb,
'{"basePrice": 1500, "currency": "NOK", "unit": "day", "kmIncluded": 150, "extraKmRate": 5}'::jsonb,
'["INVENTORY"]'::jsonb, 1, true, NOW(), NOW()),

('c0000006-0000-0000-0000-000000000001', 'f47ac10b-58cc-4372-a567-0e02b2c3d479', 'Sykkel med barnevogn', 'sykkel-barnevogn', 'KJORETOY_OG_TRANSPORT', 'ALL_DAY', 'published',
'Elektrisk sykkel med påmontert barnevogn for 2 barn. Komfortabel for familieturer.',
'[{"url": "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200", "alt": "Sykkel"},
  {"url": "https://images.unsplash.com/photo-1571068316344-75bc76f77890?w=1200", "alt": "Barnevogn"},
  {"url": "https://images.unsplash.com/photo-1532298229144-0ec0c57515c7?w=1200", "alt": "Familiesykkel"}]'::jsonb,
'{"equipment": {"type": "electric_bike", "childSeats": 2},
  "includes": ["barnevogn", "hjelmer (barn)", "lås"],
  "pickup": {"address": "Sentralstasjonen", "hours": "08:00-18:00"},
  "contact": {"email": "mobilitet@skien.kommune.no", "phone": "+47 35 58 12 00"}}'::jsonb,
'{"basePrice": 400, "currency": "NOK", "unit": "day"}'::jsonb,
'["INVENTORY"]'::jsonb, 5, false, NOW(), NOW())

ON CONFLICT (id) DO UPDATE SET 
  description = EXCLUDED.description,
  images = EXCLUDED.images,
  metadata = EXCLUDED.metadata,
  pricing = EXCLUDED.pricing,
  updated_at = NOW();

-- =============================================================================
-- STEP 4: Add 5 more OPPLEVELSER_OG_ARRANGEMENT to reach 10
-- =============================================================================

INSERT INTO rental_objects (id, tenant_id, name, slug, category_key, time_mode, status, capacity, description, images, metadata, pricing, features, created_at, updated_at)
VALUES 
('d0000001-0000-0000-0000-000000000001', 'f47ac10b-58cc-4372-a567-0e02b2c3d479', 'Kulturtur: Ibsen i Skien', 'kulturtur-ibsen-skien', 'OPPLEVELSER_OG_ARRANGEMENT', 'SLOT', 'published', 30,
'Guidet vandring i Ibsens fotspor. Besøk hans barndomshjem og viktige steder i Skien.',
'[{"url": "https://images.unsplash.com/photo-1519501025264-65ba15a82390?w=1200", "alt": "Byvandring"},
  {"url": "https://images.unsplash.com/photo-1518611012118-696072aa579a?w=1200", "alt": "Historisk tur"},
  {"url": "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200", "alt": "Ibsen-statue"}]'::jsonb,
'{"meetingPoint": "Ibsenhuset, hovedinngang",
  "address": {"street": "Henrik Ibsens gate 15", "postalCode": "3724", "city": "Skien"},
  "location": {"latitude": 59.2090, "longitude": 9.6080},
  "duration": "2.5 timer",
  "includes": ["guide", "inngangsbillett Ibsenhuset"],
  "language": "norsk, engelsk",
  "contact": {"email": "kultur@skien.kommune.no", "phone": "+47 35 58 14 00"}}'::jsonb,
'{"basePrice": 250, "currency": "NOK", "unit": "person"}'::jsonb,
'["SHARED_CAPACITY"]'::jsonb, NOW(), NOW()),

('d0000002-0000-0000-0000-000000000001', 'f47ac10b-58cc-4372-a567-0e02b2c3d479', 'Fotokurs: Landskapsfotografering', 'fotokurs-landskapsfotografering', 'OPPLEVELSER_OG_ARRANGEMENT', 'SLOT', 'published', 12,
'Praktisk fotokurs i naturskjønne omgivelser. Lær komposisjon, lyssetting og etterbehandling.',
'[{"url": "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200", "alt": "Fotokurs"},
  {"url": "https://images.unsplash.com/photo-1452587925148-ce544e77e70d?w=1200", "alt": "Kamera"},
  {"url": "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=1200", "alt": "Fotografering"}]'::jsonb,
'{"meetingPoint": "Telemark Museum",
  "address": {"street": "Museumsvegen 10", "postalCode": "3724", "city": "Skien"},
  "location": {"latitude": 59.2070, "longitude": 9.6050},
  "duration": "4 timer",
  "includes": ["instruksjon", "materiale", "lunsj"],
  "requirements": ["Eget kamera"],
  "contact": {"email": "kurs@skien.kommune.no", "phone": "+47 35 58 15 00"}}'::jsonb,
'{"basePrice": 800, "currency": "NOK", "unit": "person"}'::jsonb,
'["SHARED_CAPACITY"]'::jsonb, NOW(), NOW()),

('d0000003-0000-0000-0000-000000000001', 'f47ac10b-58cc-4372-a567-0e02b2c3d479', 'Matkurs: Norsk tradisjonsmat', 'matkurs-norsk-tradisjonsmat', 'OPPLEVELSER_OG_ARRANGEMENT', 'SLOT', 'published', 16,
'Lær å lage klassiske norske retter med lokale råvarer. Smaker og historier fra Telemark.',
'[{"url": "https://images.unsplash.com/photo-1507048331197-7d4ac70811cf?w=1200", "alt": "Matkurs"},
  {"url": "https://images.unsplash.com/photo-1466637574441-749b8f19452f?w=1200", "alt": "Matlaging"},
  {"url": "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=1200", "alt": "Kjøkken"}]'::jsonb,
'{"venue": "Kulturhuset - Kjøkken",
  "address": {"street": "Kulturhusgata 1", "postalCode": "3724", "city": "Skien"},
  "location": {"latitude": 59.2086, "longitude": 9.6089},
  "duration": "3 timer",
  "includes": ["alle ingredienser", "oppskrifter", "middag"],
  "contact": {"email": "kurs@skien.kommune.no", "phone": "+47 35 58 15 00"}}'::jsonb,
'{"basePrice": 650, "currency": "NOK", "unit": "person"}'::jsonb,
'["SHARED_CAPACITY"]'::jsonb, NOW(), NOW()),

('d0000004-0000-0000-0000-000000000001', 'f47ac10b-58cc-4372-a567-0e02b2c3d479', 'Konsert: Jazz i parken', 'konsert-jazz-parken', 'OPPLEVELSER_OG_ARRANGEMENT', 'PERIOD', 'published', 200,
'Stemningsfull jazzkonsert i Byparken. Ta med teppe og nyt sommerkvelders musikk.',
'[{"url": "https://images.unsplash.com/photo-1415201364774-f6f0bb35f28f?w=1200", "alt": "Jazz konsert"},
  {"url": "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=1200", "alt": "Scene utendørs"},
  {"url": "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=1200", "alt": "Publikum"}]'::jsonb,
'{"venue": "Byparken - Paviljongen",
  "address": {"street": "Byparken 1", "postalCode": "3724", "city": "Skien"},
  "location": {"latitude": 59.2095, "longitude": 9.6095},
  "duration": "2 timer",
  "includes": ["konsert", "program"],
  "contact": {"email": "kultur@skien.kommune.no", "phone": "+47 35 58 14 00"}}'::jsonb,
'{"basePrice": 150, "currency": "NOK", "unit": "person"}'::jsonb,
'["SHARED_CAPACITY"]'::jsonb, NOW(), NOW()),

('d0000005-0000-0000-0000-000000000001', 'f47ac10b-58cc-4372-a567-0e02b2c3d479', 'Barneaktivitet: Eventyrskogen', 'barneaktivitet-eventyrskogen', 'OPPLEVELSER_OG_ARRANGEMENT', 'SLOT', 'published', 25,
'Magisk eventyrtur for barn 4-10 år. Møt troll, alver og andre figurer i skogen.',
'[{"url": "https://images.unsplash.com/photo-1502086223501-7ea6ecd79368?w=1200", "alt": "Eventyrskog"},
  {"url": "https://images.unsplash.com/photo-1517457373958-b7bdd4587205?w=1200", "alt": "Barn i naturen"},
  {"url": "https://images.unsplash.com/photo-1504196606672-aef5c9cefc92?w=1200", "alt": "Lek i skogen"}]'::jsonb,
'{"meetingPoint": "Eventyrskogen inngang",
  "address": {"street": "Skogsveien 20", "postalCode": "3724", "city": "Skien"},
  "location": {"latitude": 59.2200, "longitude": 9.6150},
  "duration": "1.5 timer",
  "ageGroup": "4-10 år",
  "includes": ["eventyr", "aktiviteter", "saft og kjeks"],
  "contact": {"email": "friluft@skien.kommune.no", "phone": "+47 35 58 13 00"}}'::jsonb,
'{"basePrice": 100, "currency": "NOK", "unit": "person"}'::jsonb,
'["SHARED_CAPACITY"]'::jsonb, NOW(), NOW())

ON CONFLICT (id) DO UPDATE SET 
  description = EXCLUDED.description,
  images = EXCLUDED.images,
  metadata = EXCLUDED.metadata,
  pricing = EXCLUDED.pricing,
  updated_at = NOW();

-- =============================================================================
-- STEP 5: Update existing objects with 3 images if they only have 1
-- =============================================================================

-- Update LOKALER_OG_BANER with more images
UPDATE rental_objects 
SET images = '[
  {"url": "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200", "alt": "' || name || ' - hovedbilde"},
  {"url": "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=1200", "alt": "' || name || ' - interiør"},
  {"url": "https://images.unsplash.com/photo-1431068799455-80bae0caf685?w=1200", "alt": "' || name || ' - detalj"}
]'::jsonb
WHERE category_key = 'LOKALER_OG_BANER' 
AND jsonb_array_length(images) < 3;

-- Summary query
SELECT category_key, COUNT(*) as count FROM rental_objects WHERE status = 'published' GROUP BY category_key ORDER BY category_key;
