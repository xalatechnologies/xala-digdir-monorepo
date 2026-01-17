-- =====================================================================
--  06_DOMAIN_MESSAGING.SQL
--  Conversations, messages, favourites, ratings
-- =====================================================================

BEGIN;

-- =====================================================================
-- CONVERSATIONS (User <-> Backoffice)
-- =====================================================================

INSERT INTO domain.conversations (
  id, tenant_id, subject, status, is_active
)
VALUES
  ('c0000001-0000-0000-0000-000000000001',
   'f47ac10b-58cc-4372-a567-0e02b2c3d479',
   'Spørsmål om booking - Idrettshall A',
   'ACTIVE',
   true),
  
  ('c0000001-0000-0001-0000-000000000000',
   'a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d',
   'Avbestilling og refusjon',
   'RESOLVED',
   true),
  
  ('c0000001-0000-0002-0000-000000000000',
   'f47ac10b-58cc-4372-a567-0e02b2c3d479',
   'Teknisk problem med betaling',
   'ACTIVE',
   true)
ON CONFLICT (id) DO UPDATE SET
  status = EXCLUDED.status;

-- =====================================================================
-- CONVERSATION PARTICIPANTS
-- =====================================================================

INSERT INTO domain.conversation_participants (
  tenant_id, conversation_id, user_id, role, joined_at
)
VALUES
  -- Conversation 1: Ola Hansen + Saksbehandler Ole
  ('f47ac10b-58cc-4372-a567-0e02b2c3d479', 'c0000001-0000-0000-0000-000000000001',
   '01a2b3c4-d5e6-4f7a-8b9c-0d1e2f3a4b5c', 'PARTICIPANT', NOW() - INTERVAL '5 days'),
  ('f47ac10b-58cc-4372-a567-0e02b2c3d479', 'c0000001-0000-0000-0000-000000000001',
   '77777777-7777-7777-7777-777777777777', 'AGENT', NOW() - INTERVAL '5 days'),
  
  -- Conversation 2: Lisa Berg + Erik Larsen
  ('a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d', 'c0000001-0000-0001-0000-000000000000',
   'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'PARTICIPANT', NOW() - INTERVAL '10 days'),
  ('a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d', 'c0000001-0000-0001-0000-000000000000',
   '99999999-9999-9999-9999-999999999999', 'AGENT', NOW() - INTERVAL '10 days')
ON CONFLICT DO NOTHING;

-- =====================================================================
-- MESSAGES
-- =====================================================================

INSERT INTO domain.messages (
  id, tenant_id, conversation_id, sender_id,
  content, is_internal
)
VALUES
  -- Conversation 1
  ('m0000001-0000-0000-0000-000000000001',
   'f47ac10b-58cc-4372-a567-0e02b2c3d479',
   'c0000001-0000-0000-0000-000000000001',
   '01a2b3c4-d5e6-4f7a-8b9c-0d1e2f3a4b5c',
   'Hei! Jeg lurer på om det er mulig å booke Idrettshall A for fotballtrening hver onsdag?',
   false),
  
  ('m0000001-0000-0001-0000-000000000000',
   'f47ac10b-58cc-4372-a567-0e02b2c3d479',
   'c0000001-0000-0000-0000-000000000001',
   '77777777-7777-7777-7777-777777777777',
   'Hei Ola! Ja, det er mulig. Du kan opprette en gjentakende booking i systemet. La meg hjelpe deg med det.',
   false),
  
  ('m0000001-0000-0002-0000-000000000000',
   'f47ac10b-58cc-4372-a567-0e02b2c3d479',
   'c0000001-0000-0000-0000-000000000001',
   '01a2b3c4-d5e6-4f7a-8b9c-0d1e2f3a4b5c',
   'Takk! Hvor lang tid tar godkjenningen?',
   false),
  
  ('m0000001-0000-0003-0000-000000000000',
   'f47ac10b-58cc-4372-a567-0e02b2c3d479',
   'c0000001-0000-0000-0000-000000000001',
   '77777777-7777-7777-7777-777777777777',
   'Vanligvis innen 24 timer. Du får beskjed på e-post når bookingen er godkjent.',
   false),
  
  -- Conversation 2
  ('m0000001-0000-0004-0000-000000000000',
   'a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d',
   'c0000001-0000-0001-0000-000000000000',
   'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
   'Jeg må dessverre avbestille booking av Fotballbane 1. Hvordan går jeg fram for å få refusjon?',
   false),
  
  ('m0000001-0000-0005-0000-000000000000',
   'a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d',
   'c0000001-0000-0001-0000-000000000000',
   '99999999-9999-9999-9999-999999999999',
   'Hei Lisa! Ingen problem. Siden du avbestiller mer enn 24 timer før, får du full refusjon. Jeg ordner det nå.',
   false)
ON CONFLICT (id) DO UPDATE SET
  content = EXCLUDED.content;

-- =====================================================================
-- FAVOURITES
-- =====================================================================

INSERT INTO domain.favourites (
  tenant_id, user_id, rental_object_id
)
VALUES
  -- Ola Hansen favourites
  ('f47ac10b-58cc-4372-a567-0e02b2c3d479',
   '01a2b3c4-d5e6-4f7a-8b9c-0d1e2f3a4b5c',
   'd0000001-0000-0000-0000-000000000001'),
  
  ('f47ac10b-58cc-4372-a567-0e02b2c3d479',
   '01a2b3c4-d5e6-4f7a-8b9c-0d1e2f3a4b5c',
   'd0000001-0000-0001-0000-000000000000'),
  
  -- Lisa Berg favourites
  ('a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d',
   'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
   'd0000001-0000-0001-0000-000000000000')
ON CONFLICT DO NOTHING;

-- =====================================================================
-- RATINGS
-- =====================================================================

INSERT INTO domain.ratings (
  tenant_id, user_id, rental_object_id,
  rating, review, is_verified
)
VALUES
  ('f47ac10b-58cc-4372-a567-0e02b2c3d479',
   '01a2b3c4-d5e6-4f7a-8b9c-0d1e2f3a4b5c',
   'd0000001-0000-0000-0000-000000000001',
   5,
   'Fantastisk hall! Godt vedlikeholdt og god service.',
   true),
  
  ('a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d',
   'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
   'd0000001-0000-0001-0000-000000000000',
   4,
   'Bra bane, men kunne vært bedre belysning.',
   true)
ON CONFLICT DO NOTHING;

COMMIT;

-- =====================================================================
-- VERIFICATION
-- =====================================================================

SELECT 'Messaging seed complete.' AS status,
  (SELECT COUNT(*) FROM domain.conversations) AS conversations,
  (SELECT COUNT(*) FROM domain.messages) AS messages,
  (SELECT COUNT(*) FROM domain.favourites) AS favourites,
  (SELECT COUNT(*) FROM domain.ratings) AS ratings;
