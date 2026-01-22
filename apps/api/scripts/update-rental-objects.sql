-- Update rental objects with rich demo data (images, addresses, metadata)
-- Run this script on the production database to enrich existing rental objects

-- Sample image URLs (using Unsplash for demo purposes)
-- In production, these should be actual asset URLs

-- LOKALER_OG_BANER - Large venues
UPDATE rental_objects 
SET 
  description = 'Moderne storsalen med plass til 500 gjester. Perfekt for konferanser, konserter og store arrangementer. Full AV-utstyr inkludert.',
  images = '[
    {"url": "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200", "alt": "Kulturhuset Storsalen"},
    {"url": "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=1200", "alt": "Storsalen interiør"},
    {"url": "https://images.unsplash.com/photo-1431068799455-80bae0caf685?w=1200", "alt": "Scene og sitteplasser"}
  ]'::jsonb,
  metadata = '{
    "address": {"street": "Kulturhusgata 1", "postalCode": "3724", "city": "Skien", "country": "Norway"},
    "location": {"latitude": 59.2086, "longitude": 9.6089},
    "amenities": ["wifi", "projector", "microphone", "wheelchair_accessible", "parking", "kitchen"],
    "contact": {"email": "kulturhuset@skien.kommune.no", "phone": "+47 35 58 00 00"},
    "openingHours": {"weekdays": "08:00-22:00", "weekends": "10:00-20:00"}
  }'::jsonb,
  pricing = '{"basePrice": 5000, "currency": "NOK", "unit": "day", "hourlyRate": 800}'::jsonb
WHERE name = 'Kulturhuset - Storsalen';

UPDATE rental_objects 
SET 
  description = 'Intim stor sal med god akustikk. Egner seg godt til teaterforestillinger, mindre konserter og foredrag.',
  images = '[
    {"url": "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=1200", "alt": "Lillsalen scene"},
    {"url": "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=1200", "alt": "Salen fra publikum"}
  ]'::jsonb,
  metadata = '{
    "address": {"street": "Kulturhusgata 1", "postalCode": "3724", "city": "Skien", "country": "Norway"},
    "location": {"latitude": 59.2086, "longitude": 9.6089},
    "amenities": ["wifi", "projector", "microphone", "wheelchair_accessible"],
    "contact": {"email": "kulturhuset@skien.kommune.no", "phone": "+47 35 58 00 00"}
  }'::jsonb,
  pricing = '{"basePrice": 3000, "currency": "NOK", "unit": "day", "hourlyRate": 500}'::jsonb
WHERE name = 'Kulturhuset - Lillsalen';

UPDATE rental_objects 
SET 
  description = 'Historisk sal i rådhuset med plass til 300 gjester. Ideell for formelle arrangementer og større møter.',
  images = '[
    {"url": "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=1200", "alt": "Rådhussalen"},
    {"url": "https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=1200", "alt": "Interiør"}
  ]'::jsonb,
  metadata = '{
    "address": {"street": "Rådhusgata 2", "postalCode": "3724", "city": "Skien", "country": "Norway"},
    "location": {"latitude": 59.2100, "longitude": 9.6100},
    "amenities": ["wifi", "projector", "microphone", "wheelchair_accessible", "historic"],
    "contact": {"email": "radhuset@skien.kommune.no", "phone": "+47 35 58 00 00"}
  }'::jsonb,
  pricing = '{"basePrice": 4500, "currency": "NOK", "unit": "day", "hourlyRate": 700}'::jsonb
WHERE name = 'Rådhussalen';

-- Sports venues
UPDATE rental_objects 
SET 
  description = 'Moderne idrettshall med full størrelse håndballbane. Egnet for kamper, trening og arrangementer.',
  images = '[
    {"url": "https://images.unsplash.com/photo-1519861531473-9200262188bf?w=1200", "alt": "Idrettshallen innendørs"},
    {"url": "https://images.unsplash.com/photo-1577223625816-7546f13df25d?w=1200", "alt": "Basketballbane"}
  ]'::jsonb,
  metadata = '{
    "address": {"street": "Idrettsveien 10", "postalCode": "3724", "city": "Skien", "country": "Norway"},
    "location": {"latitude": 59.2150, "longitude": 9.6200},
    "amenities": ["changing_rooms", "showers", "parking", "wheelchair_accessible", "scoreboard"],
    "sportTypes": ["handball", "basketball", "volleyball", "badminton"],
    "contact": {"email": "idrett@skien.kommune.no", "phone": "+47 35 58 01 00"}
  }'::jsonb,
  pricing = '{"basePrice": 500, "currency": "NOK", "unit": "hour"}'::jsonb
WHERE name = 'Idrettshallen - Hovedhall';

UPDATE rental_objects 
SET 
  description = 'Fullt utstyrt treningsrom med styrke- og kondisjonsutstyr. Plass til gruppetrening.',
  images = '[
    {"url": "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1200", "alt": "Treningsrom"},
    {"url": "https://images.unsplash.com/photo-1540497077202-7c8a3999166f?w=1200", "alt": "Treningsutstyr"}
  ]'::jsonb,
  metadata = '{
    "address": {"street": "Idrettsveien 10", "postalCode": "3724", "city": "Skien", "country": "Norway"},
    "location": {"latitude": 59.2150, "longitude": 9.6200},
    "amenities": ["changing_rooms", "showers", "equipment"],
    "contact": {"email": "idrett@skien.kommune.no", "phone": "+47 35 58 01 00"}
  }'::jsonb,
  pricing = '{"basePrice": 200, "currency": "NOK", "unit": "hour"}'::jsonb
WHERE name = 'Idrettshallen - Treningsrom';

UPDATE rental_objects 
SET 
  description = 'Olympisk svømmebasseng (50 meter). Egnet for trening og svømmestevner.',
  images = '[
    {"url": "https://images.unsplash.com/photo-1519315901367-f34ff9154487?w=1200", "alt": "Svømmebasseng"},
    {"url": "https://images.unsplash.com/photo-1576610616656-d3aa5d1f4534?w=1200", "alt": "Basseng fra siden"}
  ]'::jsonb,
  metadata = '{
    "address": {"street": "Badeparken 5", "postalCode": "3724", "city": "Skien", "country": "Norway"},
    "location": {"latitude": 59.2120, "longitude": 9.6150},
    "amenities": ["changing_rooms", "showers", "sauna", "wheelchair_accessible"],
    "poolLength": "50m",
    "temperature": "26°C",
    "contact": {"email": "svommehall@skien.kommune.no", "phone": "+47 35 58 02 00"}
  }'::jsonb,
  pricing = '{"basePrice": 300, "currency": "NOK", "unit": "hour"}'::jsonb
WHERE name = 'Svømmehallen - Hovedbasseng';

-- Padel courts
UPDATE rental_objects 
SET 
  description = 'Moderne innendørs padelbane med panoramavegger. Profesjonell belysning.',
  images = '[
    {"url": "https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=1200", "alt": "Padelbane"},
    {"url": "https://images.unsplash.com/photo-1622279457486-28f77e6a92c4?w=1200", "alt": "Padel spilling"}
  ]'::jsonb,
  metadata = '{
    "address": {"street": "Racketveien 3", "postalCode": "3724", "city": "Skien", "country": "Norway"},
    "location": {"latitude": 59.2130, "longitude": 9.6180},
    "amenities": ["changing_rooms", "showers", "equipment_rental", "cafe"],
    "courtType": "indoor",
    "contact": {"email": "padel@skien.kommune.no", "phone": "+47 35 58 03 00"}
  }'::jsonb,
  pricing = '{"basePrice": 400, "currency": "NOK", "unit": "hour"}'::jsonb
WHERE name LIKE 'Padelbane%';

-- Tennis courts
UPDATE rental_objects 
SET 
  description = 'Utendørs tennisbane med grus underlag. God belysning for kveldsspill.',
  images = '[
    {"url": "https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?w=1200", "alt": "Tennisbane"},
    {"url": "https://images.unsplash.com/photo-1545809627-e7b43c1abd7f?w=1200", "alt": "Tennis nett"}
  ]'::jsonb,
  metadata = '{
    "address": {"street": "Tennisalléen 1", "postalCode": "3724", "city": "Skien", "country": "Norway"},
    "location": {"latitude": 59.2140, "longitude": 9.6190},
    "amenities": ["parking", "lighting", "equipment_rental"],
    "surface": "clay",
    "contact": {"email": "tennis@skien.kommune.no", "phone": "+47 35 58 04 00"}
  }'::jsonb,
  pricing = '{"basePrice": 200, "currency": "NOK", "unit": "hour"}'::jsonb
WHERE name LIKE 'Tennisbane%';

-- Meeting rooms
UPDATE rental_objects 
SET 
  description = 'Profesjonelt styrerom med videokonferanse og whiteboard. Plass til 12 personer.',
  images = '[
    {"url": "https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200", "alt": "Styrerom"},
    {"url": "https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=1200", "alt": "Møtebord"}
  ]'::jsonb,
  metadata = '{
    "address": {"street": "Kommunehuset", "postalCode": "3724", "city": "Skien", "country": "Norway"},
    "location": {"latitude": 59.2095, "longitude": 9.6095},
    "amenities": ["wifi", "video_conference", "whiteboard", "coffee_machine", "wheelchair_accessible"],
    "contact": {"email": "moterom@skien.kommune.no", "phone": "+47 35 58 00 00"}
  }'::jsonb,
  pricing = '{"basePrice": 500, "currency": "NOK", "unit": "hour"}'::jsonb
WHERE name = 'Kommunehuset - Styrerom';

UPDATE rental_objects 
SET 
  description = 'Fleksibelt møterom for mindre grupper. Utstyrt med skjerm og videokonferanse.',
  images = '[
    {"url": "https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=1200", "alt": "Møterom"}
  ]'::jsonb,
  metadata = '{
    "address": {"street": "Kommunehuset", "postalCode": "3724", "city": "Skien", "country": "Norway"},
    "location": {"latitude": 59.2095, "longitude": 9.6095},
    "amenities": ["wifi", "screen", "video_conference", "coffee_machine"],
    "contact": {"email": "moterom@skien.kommune.no", "phone": "+47 35 58 00 00"}
  }'::jsonb,
  pricing = '{"basePrice": 300, "currency": "NOK", "unit": "hour"}'::jsonb
WHERE name LIKE 'Kommunehuset - Møterom%';

-- Library rooms
UPDATE rental_objects 
SET 
  description = 'Moderne auditorium i biblioteket med god akustikk. Perfekt for foredrag og presentasjoner.',
  images = '[
    {"url": "https://images.unsplash.com/photo-1507842217343-583bb7270b66?w=1200", "alt": "Bibliotek auditorium"}
  ]'::jsonb,
  metadata = '{
    "address": {"street": "Bibliotekgata 5", "postalCode": "3724", "city": "Skien", "country": "Norway"},
    "location": {"latitude": 59.2080, "longitude": 9.6070},
    "amenities": ["wifi", "projector", "microphone", "wheelchair_accessible"],
    "contact": {"email": "bibliotek@skien.kommune.no", "phone": "+47 35 58 05 00"}
  }'::jsonb,
  pricing = '{"basePrice": 1000, "currency": "NOK", "unit": "day"}'::jsonb
WHERE name = 'Biblioteket - Auditorium';

UPDATE rental_objects 
SET 
  description = 'Stille grupperom i biblioteket. Perfekt for studiegrupper og små møter.',
  images = '[
    {"url": "https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=1200", "alt": "Grupperom"}
  ]'::jsonb,
  metadata = '{
    "address": {"street": "Bibliotekgata 5", "postalCode": "3724", "city": "Skien", "country": "Norway"},
    "location": {"latitude": 59.2080, "longitude": 9.6070},
    "amenities": ["wifi", "whiteboard"],
    "contact": {"email": "bibliotek@skien.kommune.no", "phone": "+47 35 58 05 00"}
  }'::jsonb,
  pricing = '{"basePrice": 0, "currency": "NOK", "unit": "hour"}'::jsonb
WHERE name LIKE 'Biblioteket - Grupperom%';

-- Community centers (Grendehus)
UPDATE rental_objects 
SET 
  description = 'Tradisjonelt grendehus med kjøkken og stor sal. Perfekt for fester og arrangementer.',
  images = '[
    {"url": "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=1200", "alt": "Grendehuset sal"},
    {"url": "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=1200", "alt": "Kjøkken"}
  ]'::jsonb,
  metadata = '{
    "address": {"street": "Grendeveien 10", "postalCode": "3724", "city": "Skien", "country": "Norway"},
    "location": {"latitude": 59.2200, "longitude": 9.6300},
    "amenities": ["kitchen", "tables_chairs", "parking", "wheelchair_accessible"],
    "contact": {"email": "grendehus@skien.kommune.no", "phone": "+47 35 58 06 00"}
  }'::jsonb,
  pricing = '{"basePrice": 2000, "currency": "NOK", "unit": "day"}'::jsonb
WHERE name LIKE 'Grendehuset%';

-- Equipment
UPDATE rental_objects 
SET 
  description = 'Stort partytelt (6x12 meter) med sideduk. Kan romme opptil 100 personer.',
  images = '[
    {"url": "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=1200", "alt": "Partytelt"}
  ]'::jsonb,
  metadata = '{
    "dimensions": "6m x 12m",
    "capacity": 100,
    "includes": ["sideduk", "gulv_plates"],
    "pickup": {"address": "Kommunelager, Industriveien 5", "hours": "08:00-16:00"},
    "contact": {"email": "utstyr@skien.kommune.no", "phone": "+47 35 58 07 00"}
  }'::jsonb,
  pricing = '{"basePrice": 1500, "currency": "NOK", "unit": "day", "deposit": 2000}'::jsonb
WHERE name = 'Partytelt 6x12m';

UPDATE rental_objects 
SET 
  description = 'Profesjonell HD-projektor med 5000 lumen. Inkluderer HDMI-kabel.',
  images = '[
    {"url": "https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=1200", "alt": "Projektor"}
  ]'::jsonb,
  metadata = '{
    "specs": {"resolution": "1920x1080", "lumens": 5000, "connections": ["HDMI", "VGA"]},
    "includes": ["HDMI-kabel", "bæreveske"],
    "pickup": {"address": "Kommunelager, Industriveien 5", "hours": "08:00-16:00"},
    "contact": {"email": "utstyr@skien.kommune.no", "phone": "+47 35 58 07 00"}
  }'::jsonb,
  pricing = '{"basePrice": 300, "currency": "NOK", "unit": "day", "deposit": 500}'::jsonb
WHERE name = 'Projektor HD';

UPDATE rental_objects 
SET 
  description = 'Profesjonelt PA-lydanlegg med mikser, høyttalere og mikrofoner.',
  images = '[
    {"url": "https://images.unsplash.com/photo-1558584673-c834fb1cc3ca?w=1200", "alt": "PA-anlegg"}
  ]'::jsonb,
  metadata = '{
    "specs": {"power": "500W", "includes": ["2x høyttalere", "mikser", "2x mikrofoner", "stativer"]},
    "pickup": {"address": "Kommunelager, Industriveien 5", "hours": "08:00-16:00"},
    "contact": {"email": "utstyr@skien.kommune.no", "phone": "+47 35 58 07 00"}
  }'::jsonb,
  pricing = '{"basePrice": 800, "currency": "NOK", "unit": "day", "deposit": 1500}'::jsonb
WHERE name = 'Lydanlegg PA';

-- Vehicles
UPDATE rental_objects 
SET 
  description = 'VW Transporter varebil med lang akselavstand. Krever førerkort klasse B.',
  images = '[
    {"url": "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200", "alt": "VW Transporter"}
  ]'::jsonb,
  metadata = '{
    "vehicle": {"make": "Volkswagen", "model": "Transporter", "year": 2022, "seats": 3, "cargo_m3": 6.7},
    "requirements": ["Førerkort B", "Min 25 år", "Min 3 års erfaring"],
    "insuranceIncluded": true,
    "fuelType": "diesel",
    "pickup": {"address": "Kommunegarasjen, Verkstedveien 1", "hours": "07:00-15:00"},
    "contact": {"email": "bilpark@skien.kommune.no", "phone": "+47 35 58 08 00"}
  }'::jsonb,
  pricing = '{"basePrice": 500, "currency": "NOK", "unit": "day", "kmIncluded": 100, "extraKmRate": 3}'::jsonb
WHERE name = 'Kommunebil - VW Transporter';

-- Experiences  
UPDATE rental_objects 
SET 
  description = 'Inspirerende konferanse om digital markedsføring med eksperter fra bransjen.',
  images = '[
    {"url": "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200", "alt": "Konferanse"}
  ]'::jsonb,
  metadata = '{
    "venue": "Kulturhuset - Storsalen",
    "address": {"street": "Kulturhusgata 1", "postalCode": "3724", "city": "Skien"},
    "location": {"latitude": 59.2086, "longitude": 9.6089},
    "includes": ["lunsj", "kaffe", "foredragsmateriale"],
    "language": "norsk",
    "contact": {"email": "kurs@skien.kommune.no", "phone": "+47 35 58 09 00"}
  }'::jsonb,
  pricing = '{"basePrice": 1500, "currency": "NOK", "unit": "person"}'::jsonb
WHERE name = 'Konferanse - Digital markedsføring';

UPDATE rental_objects 
SET 
  description = 'Kreativ skriveverksted ledet av erfaren forfatter. Passer for alle nivåer.',
  images = '[
    {"url": "https://images.unsplash.com/photo-1455390582262-044cdead277a?w=1200", "alt": "Skriveverksted"}
  ]'::jsonb,
  metadata = '{
    "venue": "Biblioteket - Grupperom A",
    "address": {"street": "Bibliotekgata 5", "postalCode": "3724", "city": "Skien"},
    "location": {"latitude": 59.2080, "longitude": 9.6070},
    "includes": ["materiale", "kaffe"],
    "language": "norsk",
    "ageGroup": "18+",
    "contact": {"email": "kurs@skien.kommune.no", "phone": "+47 35 58 09 00"}
  }'::jsonb,
  pricing = '{"basePrice": 500, "currency": "NOK", "unit": "person"}'::jsonb
WHERE name = 'Workshop - Kreativ skriving';

UPDATE rental_objects 
SET 
  description = 'Guidet byvandring gjennom Skiens historiske sentrum. Ca 2 timer.',
  images = '[
    {"url": "https://images.unsplash.com/photo-1519501025264-65ba15a82390?w=1200", "alt": "Byvandring"}
  ]'::jsonb,
  metadata = '{
    "meetingPoint": "Rådhusplassen",
    "address": {"street": "Rådhusgata 2", "postalCode": "3724", "city": "Skien"},
    "location": {"latitude": 59.2100, "longitude": 9.6100},
    "duration": "2 timer",
    "language": "norsk",
    "accessibilityNote": "Ikke rullestolvennlig",
    "contact": {"email": "omvisning@skien.kommune.no", "phone": "+47 35 58 10 00"}
  }'::jsonb,
  pricing = '{"basePrice": 150, "currency": "NOK", "unit": "person"}'::jsonb
WHERE name = 'Omvisning - Byhistorie';

-- Update all remaining rental objects that have empty images
UPDATE rental_objects 
SET 
  images = '[
    {"url": "https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200", "alt": "' || name || '"}
  ]'::jsonb,
  metadata = jsonb_build_object(
    'address', jsonb_build_object(
      'street', 'Kommunehuset',
      'postalCode', '3724',
      'city', 'Skien',
      'country', 'Norway'
    ),
    'location', jsonb_build_object(
      'latitude', 59.21 + (random() * 0.02 - 0.01),
      'longitude', 9.61 + (random() * 0.02 - 0.01)
    ),
    'amenities', to_jsonb(ARRAY['wifi', 'parking']),
    'contact', jsonb_build_object('email', 'booking@skien.kommune.no', 'phone', '+47 35 58 00 00')
  ),
  description = CASE 
    WHEN description IS NULL OR description = '' THEN 'Velkommen til ' || name || '. Kontakt oss for mer informasjon om leie og tilgjengelighet.'
    ELSE description
  END,
  pricing = CASE 
    WHEN (pricing->>'basePrice')::numeric = 0 THEN '{"basePrice": 500, "currency": "NOK", "unit": "hour"}'::jsonb
    ELSE pricing
  END
WHERE images = '[]'::jsonb OR images IS NULL;

-- Verify the update
SELECT 
  name, 
  category_key,
  CASE WHEN jsonb_array_length(images) > 0 THEN 'Yes' ELSE 'No' END as has_images,
  CASE WHEN metadata->>'address' IS NOT NULL THEN 'Yes' ELSE 'No' END as has_address,
  pricing->>'basePrice' as price
FROM rental_objects 
LIMIT 10;
