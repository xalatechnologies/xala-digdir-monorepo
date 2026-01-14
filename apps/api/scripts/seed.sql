-- ============================================================================
-- Digilist Unified API - Comprehensive Seed Data
-- Run this file to populate all tables with Norwegian demo data
-- ============================================================================

-- Clear existing data (optional - uncomment if needed)
-- TRUNCATE messages, conversations, seasonal_leases, allocations, bookings, listings, users, organizations, tenants CASCADE;

-- ============================================================================
-- 1. TENANTS
-- ============================================================================
INSERT INTO tenants (id, name, slug, domain, status, settings) VALUES
('f47ac10b-58cc-4372-a567-0e02b2c3d479', 'Skien Kommune', 'skien-kommune', 'skien.kommune.no', 'active', '{"theme": "blue", "timezone": "Europe/Oslo"}'),
('a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d', 'Porsgrunn IL', 'porsgrunn-il', 'porsgrunn-il.no', 'active', '{"theme": "green"}'),
('b2c3d4e5-f6a7-5b6c-9d0e-1f2a3b4c5d6e', 'Oslo Idrettslag', 'oslo-idrettslag', 'oslo-il.no', 'active', '{}')
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- 2. ORGANIZATIONS
-- ============================================================================
INSERT INTO organizations (id, tenant_id, name, slug, type, status, settings) VALUES
-- Skien Kommune organizations
('11111111-1111-1111-1111-111111111111', 'f47ac10b-58cc-4372-a567-0e02b2c3d479', 'Skien Kommune - Kultur og idrett', 'skien-kultur', 'municipality', 'active', '{"orgNumber": "974766345"}'),
('22222222-2222-2222-2222-222222222222', 'f47ac10b-58cc-4372-a567-0e02b2c3d479', 'Kulturhuset Skien', 'kulturhuset-skien', 'cultural', 'active', '{}'),
('66666666-6666-6666-6666-666666666666', 'f47ac10b-58cc-4372-a567-0e02b2c3d479', 'Grenland Svømmeklubb', 'grenland-svommeklubb', 'sports_club', 'active', '{"members": 280}'),
('77777777-7777-7777-7777-777777777777', 'f47ac10b-58cc-4372-a567-0e02b2c3d479', 'Skien Håndballklubb', 'skien-handball', 'sports_club', 'active', '{"members": 450}'),
('99999999-9999-9999-9999-999999999999', 'f47ac10b-58cc-4372-a567-0e02b2c3d479', 'Telemark Kulturforening', 'telemark-kultur', 'cultural', 'active', '{}'),
-- Porsgrunn IL organizations
('33333333-3333-3333-3333-333333333333', 'a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d', 'Porsgrunn IL - Fotball', 'porsgrunn-fotball', 'sports_club', 'active', '{}'),
('88888888-8888-8888-8888-888888888888', 'a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d', 'Porsgrunn Fotballklubb', 'porsgrunn-fk', 'sports_club', 'active', '{"members": 620}')
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- 3. USERS (with roles: admin, saksbehandler, member, user)
-- ============================================================================
INSERT INTO users (id, tenant_id, organization_id, email, name, role, status, metadata, last_login_at) VALUES
-- Administrators
('aaaaaaaa-0001-0001-0001-000000000001', 'f47ac10b-58cc-4372-a567-0e02b2c3d479', '11111111-1111-1111-1111-111111111111', 'admin@skien.kommune.no', 'Ole Nordmann', 'admin', 'active', '{"phone": "+47 900 00 001", "department": "IT"}', NOW() - INTERVAL '1 hour'),
('aaaaaaaa-0001-0001-0001-000000000002', 'a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d', '33333333-3333-3333-3333-333333333333', 'admin@porsgrunn-il.no', 'Kari Olsen', 'admin', 'active', '{"phone": "+47 900 00 002"}', NOW() - INTERVAL '3 hours'),
-- Saksbehandlere
('aaaaaaaa-0002-0002-0002-000000000001', 'f47ac10b-58cc-4372-a567-0e02b2c3d479', '11111111-1111-1111-1111-111111111111', 'saksbehandler1@skien.kommune.no', 'Per Hansen', 'saksbehandler', 'active', '{"department": "Kultur og idrett"}', NOW() - INTERVAL '30 minutes'),
('aaaaaaaa-0002-0002-0002-000000000002', 'f47ac10b-58cc-4372-a567-0e02b2c3d479', '22222222-2222-2222-2222-222222222222', 'saksbehandler2@skien.kommune.no', 'Lisa Berg', 'saksbehandler', 'active', '{"department": "Kulturhuset"}', NOW() - INTERVAL '2 hours'),
('aaaaaaaa-0002-0002-0002-000000000003', 'a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d', '33333333-3333-3333-3333-333333333333', 'saksbehandler@porsgrunn-il.no', 'Erik Johansen', 'saksbehandler', 'active', '{}', NOW() - INTERVAL '1 day'),
-- Members (organization representatives)
('aaaaaaaa-0003-0003-0003-000000000001', 'f47ac10b-58cc-4372-a567-0e02b2c3d479', '77777777-7777-7777-7777-777777777777', 'leder@skien-handball.no', 'Morten Svendsen', 'member', 'active', '{"position": "Daglig leder"}', NOW() - INTERVAL '5 hours'),
('aaaaaaaa-0003-0003-0003-000000000002', 'f47ac10b-58cc-4372-a567-0e02b2c3d479', '66666666-6666-6666-6666-666666666666', 'trener@grenland-svomme.no', 'Anne Larsen', 'member', 'active', '{"position": "Hovedtrener"}', NOW() - INTERVAL '12 hours'),
('aaaaaaaa-0003-0003-0003-000000000003', 'f47ac10b-58cc-4372-a567-0e02b2c3d479', '99999999-9999-9999-9999-999999999999', 'leder@telemark-kultur.no', 'Silje Andersen', 'member', 'active', '{"position": "Styreleder"}', NOW() - INTERVAL '2 days'),
('aaaaaaaa-0003-0003-0003-000000000004', 'a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d', '88888888-8888-8888-8888-888888888888', 'dagligleder@porsgrunn-fk.no', 'Thomas Eriksen', 'member', 'active', '{"position": "Daglig leder"}', NOW() - INTERVAL '6 hours'),
-- Public users
('aaaaaaaa-0004-0004-0004-000000000001', 'f47ac10b-58cc-4372-a567-0e02b2c3d479', NULL, 'privat1@gmail.com', 'Henrik Nilsen', 'user', 'active', '{"phone": "+47 900 00 031"}', NOW() - INTERVAL '3 days'),
('aaaaaaaa-0004-0004-0004-000000000002', 'f47ac10b-58cc-4372-a567-0e02b2c3d479', NULL, 'privat2@outlook.com', 'Maria Kristiansen', 'user', 'active', '{}', NOW() - INTERVAL '1 week'),
('aaaaaaaa-0004-0004-0004-000000000003', 'a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d', NULL, 'privat3@hotmail.com', 'Anders Pedersen', 'user', 'active', '{}', NOW() - INTERVAL '4 days')
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- 4. LISTINGS (14 total with full metadata)
-- ============================================================================
-- (Already seeded with comprehensive metadata - see previous inserts)

-- ============================================================================
-- 5. BOOKINGS (with diverse statuses)
-- ============================================================================
-- Pending bookings (4)
INSERT INTO bookings (id, tenant_id, listing_id, user_id, status, start_time, end_time, total_price, currency, notes, metadata) VALUES
('bbbbbbbb-0001-0001-0001-000000000001', 'f47ac10b-58cc-4372-a567-0e02b2c3d479', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'aaaaaaaa-0003-0003-0003-000000000001', 'pending', NOW() + INTERVAL '7 days', NOW() + INTERVAL '7 days' + INTERVAL '2 hours', 3000, 'NOK', 'Treningskamp U15', '{"requiresApproval": true}'),
('bbbbbbbb-0001-0001-0001-000000000002', 'f47ac10b-58cc-4372-a567-0e02b2c3d479', 'ffffffff-ffff-ffff-ffff-ffffffffffff', 'aaaaaaaa-0003-0003-0003-000000000003', 'pending', NOW() + INTERVAL '14 days', NOW() + INTERVAL '14 days' + INTERVAL '3 hours', 15000, 'NOK', 'Kulturkveld', '{"attendees": 200}'),
('bbbbbbbb-0001-0001-0001-000000000003', 'f47ac10b-58cc-4372-a567-0e02b2c3d479', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'aaaaaaaa-0004-0004-0004-000000000001', 'pending', NOW() + INTERVAL '3 days', NOW() + INTERVAL '3 days' + INTERVAL '2 hours', 600, 'NOK', 'Bursdagsfeiring', '{}'),
('bbbbbbbb-0001-0001-0001-000000000004', 'a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d', '44444444-5555-6666-7777-888888888888', 'aaaaaaaa-0003-0003-0003-000000000004', 'pending', NOW() + INTERVAL '5 days', NOW() + INTERVAL '5 days' + INTERVAL '2 hours', 2400, 'NOK', 'A-lag trening', '{}')
ON CONFLICT (id) DO NOTHING;

-- Cancelled bookings (3)
INSERT INTO bookings (id, tenant_id, listing_id, user_id, status, start_time, end_time, total_price, currency, notes, metadata) VALUES
('bbbbbbbb-0003-0003-0003-000000000001', 'f47ac10b-58cc-4372-a567-0e02b2c3d479', 'ffffffff-ffff-ffff-ffff-ffffffffffff', 'aaaaaaaa-0004-0004-0004-000000000001', 'cancelled', NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days' + INTERVAL '3 hours', 15000, 'NOK', 'Firmafest - avlyst', '{"reason": "For få påmeldte"}'),
('bbbbbbbb-0003-0003-0003-000000000002', 'f47ac10b-58cc-4372-a567-0e02b2c3d479', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'aaaaaaaa-0004-0004-0004-000000000002', 'cancelled', NOW() + INTERVAL '10 days', NOW() + INTERVAL '10 days' + INTERVAL '4 hours', 6000, 'NOK', 'Avslått - konflikt', '{"rejectionReason": "Seriekamp"}'),
('bbbbbbbb-0003-0003-0003-000000000003', 'a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d', '55555555-6666-7777-8888-999999999999', 'aaaaaaaa-0004-0004-0004-000000000003', 'cancelled', NOW() - INTERVAL '5 days', NOW() - INTERVAL '5 days' + INTERVAL '4 hours', 2400, 'NOK', 'Bruker kansellerte', '{}')
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- 6. ALLOCATIONS (calendar events, blocked times)
-- ============================================================================
INSERT INTO allocations (id, tenant_id, listing_id, title, start_time, end_time, status, notes) VALUES
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'f47ac10b-58cc-4372-a567-0e02b2c3d479', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'Vedlikehold - gulvsliper', NOW() + INTERVAL '2 days', NOW() + INTERVAL '2 days' + INTERVAL '8 hours', 'maintenance', 'Gulvsliper pga merker'),
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'f47ac10b-58cc-4372-a567-0e02b2c3d479', 'ffffffff-ffff-ffff-ffff-ffffffffffff', 'Sperret - kommunestyremøte', NOW() + INTERVAL '5 days' + INTERVAL '9 hours', NOW() + INTERVAL '5 days' + INTERVAL '15 hours', 'blocked', 'Kommunestyremøte'),
('cccccccc-1111-2222-3333-444444444444', 'a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d', '44444444-5555-6666-7777-888888888888', 'Banearbeid', NOW() + INTERVAL '8 days', NOW() + INTERVAL '10 days', 'maintenance', 'Gressklipping og oppmerking')
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- 7. SEASONAL LEASES
-- ============================================================================
INSERT INTO seasonal_leases (tenant_id, listing_id, organization_id, start_date, end_date, weekdays, start_time, end_time, status, total_price, notes) VALUES
('f47ac10b-58cc-4372-a567-0e02b2c3d479', 'cccccccc-cccc-cccc-cccc-cccccccccccc', '77777777-7777-7777-7777-777777777777', '2026-01-01', '2026-06-30', '[1,3]', '17:00', '19:00', 'active', 45000, 'Handballtrening mandag og onsdag'),
('f47ac10b-58cc-4372-a567-0e02b2c3d479', '77777777-8888-9999-aaaa-bbbbbbbbbbbb', '66666666-6666-6666-6666-666666666666', '2026-01-01', '2026-05-31', '[1,2,3,4,5]', '06:00', '08:00', 'active', 75000, 'Morgensvøm mandag-fredag'),
('a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d', '44444444-5555-6666-7777-888888888888', '88888888-8888-8888-8888-888888888888', '2026-03-01', '2026-11-30', '[2,4,6]', '18:00', '20:00', 'upcoming', 120000, 'Fotballtrening tirsdag, torsdag, lørdag')
ON CONFLICT DO NOTHING;

-- ============================================================================
-- 8. CONVERSATIONS & MESSAGES
-- ============================================================================
INSERT INTO conversations (id, tenant_id, user_id, booking_id, subject, status, unread_count, last_message_at) VALUES
('aaaaaaaa-1111-2222-3333-444444444444', 'f47ac10b-58cc-4372-a567-0e02b2c3d479', 'aaaaaaaa-0003-0003-0003-000000000001', 'bbbbbbbb-0001-0001-0001-000000000001', 'Spørsmål om booking', 'active', 2, NOW() - INTERVAL '1 hour'),
('bbbbbbbb-1111-2222-3333-444444444444', 'f47ac10b-58cc-4372-a567-0e02b2c3d479', 'aaaaaaaa-0004-0004-0004-000000000001', NULL, 'Generell henvendelse om priser', 'active', 1, NOW() - INTERVAL '3 hours')
ON CONFLICT DO NOTHING;

INSERT INTO messages (conversation_id, sender_type, sender_id, content) VALUES
('aaaaaaaa-1111-2222-3333-444444444444', 'user', 'aaaaaaaa-0003-0003-0003-000000000001', 'Hei, kan vi flytte bookingtiden en time tidligere?'),
('aaaaaaaa-1111-2222-3333-444444444444', 'admin', 'aaaaaaaa-0002-0002-0002-000000000001', 'Hei, dessverre er den tiden opptatt. Hva med fredag i stedet?'),
('bbbbbbbb-1111-2222-3333-444444444444', 'user', 'aaaaaaaa-0004-0004-0004-000000000001', 'Hei, hva er prisen for å leie hovedhallen en hel lørdag?')
ON CONFLICT DO NOTHING;

-- ============================================================================
-- SUMMARY
-- ============================================================================
SELECT 'Tenants' as entity, COUNT(*) as count FROM tenants
UNION ALL SELECT 'Organizations', COUNT(*) FROM organizations
UNION ALL SELECT 'Users', COUNT(*) FROM users
UNION ALL SELECT 'Listings', COUNT(*) FROM listings
UNION ALL SELECT 'Bookings', COUNT(*) FROM bookings
UNION ALL SELECT 'Allocations', COUNT(*) FROM allocations
UNION ALL SELECT 'Seasonal Leases', COUNT(*) FROM seasonal_leases
UNION ALL SELECT 'Conversations', COUNT(*) FROM conversations
UNION ALL SELECT 'Messages', COUNT(*) FROM messages;
