-- Seed: 40 Listings with 3+ images each
-- Idempotent: uses ON CONFLICT on (tenant_id, slug) - assumes unique constraint exists
-- Each listing has category, type=SPACE, status=published, 3+ Unsplash images

-- Use a fixed tenant ID for demo
DO $$
DECLARE
  demo_tenant_id UUID := 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
BEGIN

-- GYMSAL (8 listings)
INSERT INTO public.listings (id, tenant_id, name, slug, type, status, category, capacity, description, images, pricing, created_at, updated_at) VALUES
('10000001-0000-0000-0000-000000000001', demo_tenant_id, 'Lillestrøm Gymsal', 'lillestrom-gymsal', 'SPACE', 'published', 'GYMSAL', 200,
 'Stor gymsal med tribune. Egnet for idrett, konserter og arrangementer.',
 '["https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800", "https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=800", "https://images.unsplash.com/photo-1558611848-73f7eb4001a1?w=800"]',
 '{"basePrice": 150, "currency": "NOK", "unit": "hour"}', now(), now()),

('10000001-0000-0000-0000-000000000002', demo_tenant_id, 'Strømmen Idrettshall', 'strommen-idrettshall', 'SPACE', 'published', 'GYMSAL', 300,
 'Fullskala idrettshall med parkettgulv og moderne fasiliteter.',
 '["https://images.unsplash.com/photo-1519311965067-36d3e5f33d39?w=800", "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=800", "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800"]',
 '{"basePrice": 150, "currency": "NOK", "unit": "hour"}', now(), now()),

('10000001-0000-0000-0000-000000000003', demo_tenant_id, 'Fjerdingby Gymsal', 'fjerdingby-gymsal', 'SPACE', 'published', 'GYMSAL', 150,
 'Nyoppusset gymsal ved Fjerdingby skole.',
 '["https://images.unsplash.com/photo-1540497077202-7c8a3999166f?w=800", "https://images.unsplash.com/photo-1576678927484-cc907957088c?w=800", "https://images.unsplash.com/photo-1593079831268-3381b0db4a77?w=800"]',
 '{"basePrice": 150, "currency": "NOK", "unit": "hour"}', now(), now()),

('10000001-0000-0000-0000-000000000004', demo_tenant_id, 'Sørumsand Gymsal', 'sorumsand-gymsal', 'SPACE', 'published', 'GYMSAL', 180,
 'Tradisjonell gymsal med god akustikk.',
 '["https://images.unsplash.com/photo-1571388208497-71bedc66e932?w=800", "https://images.unsplash.com/photo-1518611012118-696072aa579a?w=800", "https://images.unsplash.com/photo-1517963879433-6ad2b056d712?w=800"]',
 '{"basePrice": 150, "currency": "NOK", "unit": "hour"}', now(), now()),

('10000001-0000-0000-0000-000000000005', demo_tenant_id, 'Rælingen Gymsal', 'raelingen-gymsal', 'SPACE', 'published', 'GYMSAL', 220,
 'Moderne gymsal med LED-belysning og lydanlegg.',
 '["https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800", "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=800", "https://images.unsplash.com/photo-1594737625785-a6cbdabd333c?w=800"]',
 '{"basePrice": 150, "currency": "NOK", "unit": "hour"}', now(), now()),

('10000001-0000-0000-0000-000000000006', demo_tenant_id, 'Fetsund Gymsal', 'fetsund-gymsal', 'SPACE', 'published', 'GYMSAL', 160,
 'Romslig gymsal med basketballbaner.',
 '["https://images.unsplash.com/photo-1519311965067-36d3e5f33d39?w=800", "https://images.unsplash.com/photo-1599058917212-d750089bc07e?w=800", "https://images.unsplash.com/photo-1571388208497-71bedc66e932?w=800"]',
 '{"basePrice": 150, "currency": "NOK", "unit": "hour"}', now(), now()),

('10000001-0000-0000-0000-000000000007', demo_tenant_id, 'Lørenskog Storhall', 'lorenskog-storhall', 'SPACE', 'published', 'GYMSAL', 500,
 'Stor flerbrukshall for store arrangementer.',
 '["https://images.unsplash.com/photo-1540497077202-7c8a3999166f?w=800", "https://images.unsplash.com/photo-1558611848-73f7eb4001a1?w=800", "https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=800"]',
 '{"basePrice": 200, "currency": "NOK", "unit": "hour"}', now(), now()),

('10000001-0000-0000-0000-000000000008', demo_tenant_id, 'Skedsmo Gymsal', 'skedsmo-gymsal', 'SPACE', 'published', 'GYMSAL', 175,
 'Klassisk gymsal med god standard.',
 '["https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=800", "https://images.unsplash.com/photo-1518611012118-696072aa579a?w=800", "https://images.unsplash.com/photo-1576678927484-cc907957088c?w=800"]',
 '{"basePrice": 150, "currency": "NOK", "unit": "hour"}', now(), now()),

-- GRENDEHUS (6 listings)
('10000002-0000-0000-0000-000000000001', demo_tenant_id, 'Kollmyr Grendehus', 'kollmyr-grendehus', 'SPACE', 'published', 'GRENDEHUS', 80,
 'Sjarmerende grendehus med kjøkken og sal. Perfekt for selskap og møter.',
 '["https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=800", "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800", "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=800"]',
 '{"basePrice": 300, "currency": "NOK", "unit": "hour"}', now(), now()),

('10000002-0000-0000-0000-000000000002', demo_tenant_id, 'Blaker Grendehus', 'blaker-grendehus', 'SPACE', 'published', 'GRENDEHUS', 60,
 'Koselig grendehus i landlige omgivelser.',
 '["https://images.unsplash.com/photo-1469371670807-013ccf25f16a?w=800", "https://images.unsplash.com/photo-1478146896981-b80fe463b330?w=800", "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=800"]',
 '{"basePrice": 250, "currency": "NOK", "unit": "hour"}', now(), now()),

('10000002-0000-0000-0000-000000000003', demo_tenant_id, 'Aurskog Grendehus', 'aurskog-grendehus', 'SPACE', 'published', 'GRENDEHUS', 100,
 'Stort grendehus med scene og danseområde.',
 '["https://images.unsplash.com/photo-1505236858219-8359eb29e329?w=800", "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=800", "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800"]',
 '{"basePrice": 280, "currency": "NOK", "unit": "hour"}', now(), now()),

('10000002-0000-0000-0000-000000000004', demo_tenant_id, 'Høland Grendehus', 'holand-grendehus', 'SPACE', 'published', 'GRENDEHUS', 70,
 'Tradisjonelt grendehus med peis og utsikt.',
 '["https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=800", "https://images.unsplash.com/photo-1469371670807-013ccf25f16a?w=800", "https://images.unsplash.com/photo-1478146896981-b80fe463b330?w=800"]',
 '{"basePrice": 220, "currency": "NOK", "unit": "hour"}', now(), now()),

('10000002-0000-0000-0000-000000000005', demo_tenant_id, 'Setskog Grendehus', 'setskog-grendehus', 'SPACE', 'published', 'GRENDEHUS', 50,
 'Intimt grendehus for mindre selskaper.',
 '["https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=800", "https://images.unsplash.com/photo-1505236858219-8359eb29e329?w=800", "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=800"]',
 '{"basePrice": 200, "currency": "NOK", "unit": "hour"}', now(), now()),

('10000002-0000-0000-0000-000000000006', demo_tenant_id, 'Rånåsfoss Grendehus', 'ranasfoss-grendehus', 'SPACE', 'published', 'GRENDEHUS', 90,
 'Moderne grendehus ved elven.',
 '["https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800", "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=800", "https://images.unsplash.com/photo-1469371670807-013ccf25f16a?w=800"]',
 '{"basePrice": 260, "currency": "NOK", "unit": "hour"}', now(), now()),

-- BYDELSHUS (4 listings)
('10000003-0000-0000-0000-000000000001', demo_tenant_id, 'Lillestrøm Bydelshus', 'lillestrom-bydelshus', 'SPACE', 'published', 'BYDELSHUS', 150,
 'Sentralt bydelshus med flere rom og kjøkken.',
 '["https://images.unsplash.com/photo-1497366216548-37526070297c?w=800", "https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=800", "https://images.unsplash.com/photo-1577412647305-991150c7d163?w=800"]',
 '{"basePrice": 350, "currency": "NOK", "unit": "hour"}', now(), now()),

('10000003-0000-0000-0000-000000000002', demo_tenant_id, 'Strømmen Bydelshus', 'strommen-bydelshus', 'SPACE', 'published', 'BYDELSHUS', 120,
 'Allsidig bydelshus i Strømmen sentrum.',
 '["https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=800", "https://images.unsplash.com/photo-1497366216548-37526070297c?w=800", "https://images.unsplash.com/photo-1577412647305-991150c7d163?w=800"]',
 '{"basePrice": 320, "currency": "NOK", "unit": "hour"}', now(), now()),

('10000003-0000-0000-0000-000000000003', demo_tenant_id, 'Lørenskog Bydelshus', 'lorenskog-bydelshus', 'SPACE', 'published', 'BYDELSHUS', 180,
 'Nytt bydelshus med moderne fasiliteter.',
 '["https://images.unsplash.com/photo-1577412647305-991150c7d163?w=800", "https://images.unsplash.com/photo-1497366216548-37526070297c?w=800", "https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=800"]',
 '{"basePrice": 400, "currency": "NOK", "unit": "hour"}', now(), now()),

('10000003-0000-0000-0000-000000000004', demo_tenant_id, 'Rælingen Bydelshus', 'raelingen-bydelshus', 'SPACE', 'published', 'BYDELSHUS', 100,
 'Kompakt bydelshus med fleksible løsninger.',
 '["https://images.unsplash.com/photo-1497366216548-37526070297c?w=800", "https://images.unsplash.com/photo-1577412647305-991150c7d163?w=800", "https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=800"]',
 '{"basePrice": 280, "currency": "NOK", "unit": "hour"}', now(), now()),

-- MOTEROM (6 listings)
('10000004-0000-0000-0000-000000000001', demo_tenant_id, 'Rådhuset Møterom A', 'radhuset-moterom-a', 'SPACE', 'published', 'MOTEROM', 20,
 'Profesjonelt møterom med videokonferanse.',
 '["https://images.unsplash.com/photo-1517502884422-41eaead166d4?w=800", "https://images.unsplash.com/photo-1462826303086-329426d1aef5?w=800", "https://images.unsplash.com/photo-1497366672149-e5e4b4d34eb3?w=800"]',
 '{"basePrice": 200, "currency": "NOK", "unit": "hour"}', now(), now()),

('10000004-0000-0000-0000-000000000002', demo_tenant_id, 'Rådhuset Møterom B', 'radhuset-moterom-b', 'SPACE', 'published', 'MOTEROM', 12,
 'Mindre møterom for interne møter.',
 '["https://images.unsplash.com/photo-1462826303086-329426d1aef5?w=800", "https://images.unsplash.com/photo-1517502884422-41eaead166d4?w=800", "https://images.unsplash.com/photo-1497366672149-e5e4b4d34eb3?w=800"]',
 '{"basePrice": 150, "currency": "NOK", "unit": "hour"}', now(), now()),

('10000004-0000-0000-0000-000000000003', demo_tenant_id, 'Innovasjonssenteret Møterom', 'innovasjonssenteret-moterom', 'SPACE', 'published', 'MOTEROM', 30,
 'Kreativt møterom med whiteboard-vegger.',
 '["https://images.unsplash.com/photo-1497366672149-e5e4b4d34eb3?w=800", "https://images.unsplash.com/photo-1517502884422-41eaead166d4?w=800", "https://images.unsplash.com/photo-1462826303086-329426d1aef5?w=800"]',
 '{"basePrice": 250, "currency": "NOK", "unit": "hour"}', now(), now()),

('10000004-0000-0000-0000-000000000004', demo_tenant_id, 'Bibliotek Grupperom 1', 'bibliotek-grupperom-1', 'SPACE', 'published', 'MOTEROM', 8,
 'Stille grupperom for studier og møter.',
 '["https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=800", "https://images.unsplash.com/photo-1568667256549-094345857637?w=800", "https://images.unsplash.com/photo-1521587760476-6c12a4b040da?w=800"]',
 '{"basePrice": 100, "currency": "NOK", "unit": "hour"}', now(), now()),

('10000004-0000-0000-0000-000000000005', demo_tenant_id, 'Bibliotek Grupperom 2', 'bibliotek-grupperom-2', 'SPACE', 'published', 'MOTEROM', 6,
 'Kompakt grupperom med skjerm.',
 '["https://images.unsplash.com/photo-1568667256549-094345857637?w=800", "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=800", "https://images.unsplash.com/photo-1521587760476-6c12a4b040da?w=800"]',
 '{"basePrice": 80, "currency": "NOK", "unit": "hour"}', now(), now()),

('10000004-0000-0000-0000-000000000006', demo_tenant_id, 'Kulturhuset Seminarrom', 'kulturhuset-seminarrom', 'SPACE', 'published', 'MOTEROM', 40,
 'Stort seminarrom med scene og projektor.',
 '["https://images.unsplash.com/photo-1517502884422-41eaead166d4?w=800", "https://images.unsplash.com/photo-1497366672149-e5e4b4d34eb3?w=800", "https://images.unsplash.com/photo-1462826303086-329426d1aef5?w=800"]',
 '{"basePrice": 300, "currency": "NOK", "unit": "hour"}', now(), now()),

-- KULTUR (4 listings)
('10000005-0000-0000-0000-000000000001', demo_tenant_id, 'Kulturhuset Scene', 'kulturhuset-scene', 'SPACE', 'published', 'KULTUR', 400,
 'Profesjonell scene med lys- og lydanlegg.',
 '["https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?w=800", "https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=800", "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800"]',
 '{"basePrice": 800, "currency": "NOK", "unit": "hour"}', now(), now()),

('10000005-0000-0000-0000-000000000002', demo_tenant_id, 'Black Box Teater', 'black-box-teater', 'SPACE', 'published', 'KULTUR', 100,
 'Fleksibelt black box-rom for teater og performance.',
 '["https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=800", "https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?w=800", "https://images.unsplash.com/photo-1503095396549-807759245b35?w=800"]',
 '{"basePrice": 500, "currency": "NOK", "unit": "hour"}', now(), now()),

('10000005-0000-0000-0000-000000000003', demo_tenant_id, 'Kunstgalleri Vest', 'kunstgalleri-vest', 'SPACE', 'published', 'KULTUR', 50,
 'Elegant gallerirom med naturlig lys.',
 '["https://images.unsplash.com/photo-1518998053901-5348d3961a04?w=800", "https://images.unsplash.com/photo-1577720643272-265f09367456?w=800", "https://images.unsplash.com/photo-1531699527402-ab7e9dbc9b49?w=800"]',
 '{"basePrice": 400, "currency": "NOK", "unit": "hour"}', now(), now()),

('10000005-0000-0000-0000-000000000004', demo_tenant_id, 'Kinosal', 'kinosal', 'SPACE', 'published', 'KULTUR', 150,
 'Kinosal med 4K-projektor og surroundlyd.',
 '["https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=800", "https://images.unsplash.com/photo-1595769816263-9b910be24d5f?w=800", "https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=800"]',
 '{"basePrice": 600, "currency": "NOK", "unit": "hour"}', now(), now()),

-- UNGDOM (4 listings)
('10000006-0000-0000-0000-000000000001', demo_tenant_id, 'Ungdomshuset Plansen', 'ungdomshuset-plansen', 'SPACE', 'published', 'UNGDOM', 80,
 'Aktivt ungdomshus med spill og musikkrom.',
 '["https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=800", "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800", "https://images.unsplash.com/photo-1543269865-cbf427effbad?w=800"]',
 '{"basePrice": 150, "currency": "NOK", "unit": "hour"}', now(), now()),

('10000006-0000-0000-0000-000000000002', demo_tenant_id, 'Ungdomsklubben Øst', 'ungdomsklubben-ost', 'SPACE', 'published', 'UNGDOM', 60,
 'Uformell møteplass for ungdom.',
 '["https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800", "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=800", "https://images.unsplash.com/photo-1543269865-cbf427effbad?w=800"]',
 '{"basePrice": 120, "currency": "NOK", "unit": "hour"}', now(), now()),

('10000006-0000-0000-0000-000000000003', demo_tenant_id, 'Spillsenteret', 'spillsenteret', 'SPACE', 'published', 'UNGDOM', 40,
 'Gaming-senter med PCer og konsoller.',
 '["https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800", "https://images.unsplash.com/photo-1593305841991-05c297ba4575?w=800", "https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=800"]',
 '{"basePrice": 180, "currency": "NOK", "unit": "hour"}', now(), now()),

('10000006-0000-0000-0000-000000000004', demo_tenant_id, 'Musikkbingen', 'musikkbingen', 'SPACE', 'published', 'MUSIKKBINGE', 10,
 'Øvingsrom for band med PA og backline.',
 '["https://images.unsplash.com/photo-1460723237483-7a6dc9d0b212?w=800", "https://images.unsplash.com/photo-1598653222000-6b7b7a552625?w=800", "https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=800"]',
 '{"basePrice": 100, "currency": "NOK", "unit": "hour"}', now(), now()),

-- BIBLIOTEK (2 listings)
('10000007-0000-0000-0000-000000000001', demo_tenant_id, 'Hovedbiblioteket Sal', 'hovedbiblioteket-sal', 'SPACE', 'published', 'BIBLIOTEK', 100,
 'Sal i biblioteket for foredrag og boklanseringer.',
 '["https://images.unsplash.com/photo-1521587760476-6c12a4b040da?w=800", "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=800", "https://images.unsplash.com/photo-1568667256549-094345857637?w=800"]',
 '{"basePrice": 250, "currency": "NOK", "unit": "hour"}', now(), now()),

('10000007-0000-0000-0000-000000000002', demo_tenant_id, 'Barneavdelingen Scene', 'barneavdelingen-scene', 'SPACE', 'published', 'BIBLIOTEK', 40,
 'Intimt rom for barneaktiviteter og fortellerstunder.',
 '["https://images.unsplash.com/photo-1568667256549-094345857637?w=800", "https://images.unsplash.com/photo-1521587760476-6c12a4b040da?w=800", "https://images.unsplash.com/photo-1507842217343-583bb7270b66?w=800"]',
 '{"basePrice": 150, "currency": "NOK", "unit": "hour"}', now(), now()),

-- UTE (2 listings)
('10000008-0000-0000-0000-000000000001', demo_tenant_id, 'Strandpromenaden Paviljong', 'strandpromenaden-paviljong', 'SPACE', 'published', 'UTE', 200,
 'Overdekket paviljong ved vannet.',
 '["https://images.unsplash.com/photo-1495639424644-beabe8bb42a5?w=800", "https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?w=800", "https://images.unsplash.com/photo-1519331379826-f10be5486c6f?w=800"]',
 '{"basePrice": 400, "currency": "NOK", "unit": "hour"}', now(), now()),

('10000008-0000-0000-0000-000000000002', demo_tenant_id, 'Byparken Scene', 'byparken-scene', 'SPACE', 'published', 'UTE', 500,
 'Utendørs scene for konserter og festivaler.',
 '["https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?w=800", "https://images.unsplash.com/photo-1495639424644-beabe8bb42a5?w=800", "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800"]',
 '{"basePrice": 600, "currency": "NOK", "unit": "hour"}', now(), now()),

-- FRIVILLIGHET (2 listings)
('10000009-0000-0000-0000-000000000001', demo_tenant_id, 'Frivilligsentral Lokale', 'frivilligsentral-lokale', 'SPACE', 'published', 'FRIVILLIGHET', 40,
 'Lokale for frivillige organisasjoner.',
 '["https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=800", "https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?w=800", "https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?w=800"]',
 '{"basePrice": 100, "currency": "NOK", "unit": "hour"}', now(), now()),

('10000009-0000-0000-0000-000000000002', demo_tenant_id, 'Røde Kors Huset', 'rode-kors-huset', 'SPACE', 'published', 'FRIVILLIGHET', 60,
 'Møtelokale tilgjengelig for humanitære formål.',
 '["https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?w=800", "https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=800", "https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?w=800"]',
 '{"basePrice": 80, "currency": "NOK", "unit": "hour"}', now(), now()),

-- IDRETT (2 listings)
('1000000a-0000-0000-0000-000000000001', demo_tenant_id, 'Tennis- og Squashhall', 'tennis-squashhall', 'SPACE', 'published', 'IDRETT', 20,
 '4 tennisbaner og 2 squashbaner.',
 '["https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=800", "https://images.unsplash.com/photo-1545809074-59472b3f5ecc?w=800", "https://images.unsplash.com/photo-1617883861744-13b534e3b928?w=800"]',
 '{"basePrice": 350, "currency": "NOK", "unit": "hour"}', now(), now()),

('1000000a-0000-0000-0000-000000000002', demo_tenant_id, 'Svømmehall Aktivitetsrom', 'svommehall-aktivitetsrom', 'SPACE', 'published', 'IDRETT', 30,
 'Aktivitetsrom ved svømmehallen.',
 '["https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?w=800", "https://images.unsplash.com/photo-1519315901367-f34ff9154487?w=800", "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800"]',
 '{"basePrice": 200, "currency": "NOK", "unit": "hour"}', now(), now())

ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  images = EXCLUDED.images,
  pricing = EXCLUDED.pricing,
  category = EXCLUDED.category,
  updated_at = now();

END $$;

-- Verify count
DO $$
BEGIN
  RAISE NOTICE 'Listings count: %', (SELECT COUNT(*) FROM public.listings WHERE status = 'published');
END $$;
