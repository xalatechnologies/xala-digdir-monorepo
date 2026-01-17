-- =====================================================================
--  03_DOMAIN_RENTAL_OBJECTS.SQL (ALL 40 OBJECTS)
--  Generated from rental-objects-40-full.json
-- =====================================================================

BEGIN;

-- =====================================================================
-- RENTAL OBJECTS (All 40)
-- =====================================================================

INSERT INTO domain.rental_objects (
  id, tenant_id, organization_id,
  category_key, type_code, time_mode, status,
  title, slug, description, capacity,
  address, postal_code, city, country,
  published_at, is_active
)
VALUES
  -- Object 1: Idrettshall A
  ('d0000001-0000-0000-0000-000000000001', 'f47ac10b-58cc-4372-a567-0e02b2c3d479', '11111111-1111-1111-1111-111111111111',
   'LOKALER_OG_BANER', 'SPACE', 'PERIOD', 'PUBLISHED',
   'Idrettshall A', 'idrettshall-a-0',
   'Moderne idrettshall a i Skien. Perfekt for treninger, kamper og arrangementer. Godt vedlikeholdt med moderne fasiliteter.',
   300, 'Idrettsveien 1', '3720', 'Skien', 'Norway',
   NOW() - INTERVAL '40 days', true),

  -- Object 2: Fotballbane 1
  ('d0000001-0000-0001-0000-000000000000', 'f47ac10b-58cc-4372-a567-0e02b2c3d479', '11111111-1111-1111-1111-111111111111',
   'LOKALER_OG_BANER', 'SPACE', 'PERIOD', 'PUBLISHED',
   'Fotballbane 1', 'fotballbane-1-1',
   'Moderne fotballbane 1 i Porsgrunn. Perfekt for treninger, kamper og arrangementer. Godt vedlikeholdt med moderne fasiliteter.',
   300, 'Parkveien 2', '3721', 'Porsgrunn', 'Norway',
   NOW() - INTERVAL '39 days', true),

  -- Object 3: Tennisbane 1
  ('d0000001-0000-0002-0000-000000000000', 'f47ac10b-58cc-4372-a567-0e02b2c3d479', '11111111-1111-1111-1111-111111111111',
   'LOKALER_OG_BANER', 'SPACE', 'PERIOD', 'PUBLISHED',
   'Tennisbane 1', 'tennisbane-1-2',
   'Moderne tennisbane 1 i Bamble. Perfekt for treninger, kamper og arrangementer. Godt vedlikeholdt med moderne fasiliteter.',
   300, 'Håndballgata 3', '3722', 'Bamble', 'Norway',
   NOW() - INTERVAL '38 days', true),

  -- Object 4: Svømmehall
  ('d0000001-0000-0003-0000-000000000000', 'f47ac10b-58cc-4372-a567-0e02b2c3d479', '11111111-1111-1111-1111-111111111111',
   'LOKALER_OG_BANER', 'SPACE', 'PERIOD', 'PUBLISHED',
   'Svømmehall', 'svommehall-3',
   'Moderne svømmehall i Notodden. Perfekt for treninger, kamper og arrangementer. Godt vedlikeholdt med moderne fasiliteter.',
   300, 'Kulturhusgata 4', '3723', 'Notodden', 'Norway',
   NOW() - INTERVAL '37 days', true),

  -- Object 5: Treningsstudio 1
  ('d0000001-0000-0004-0000-000000000000', 'f47ac10b-58cc-4372-a567-0e02b2c3d479', '11111111-1111-1111-1111-111111111111',
   'LOKALER_OG_BANER', 'SPACE', 'PERIOD', 'PUBLISHED',
   'Treningsstudio 1', 'treningsstudio-1-4',
   'Moderne treningsstudio 1 i Kragerø. Perfekt for treninger, kamper og arrangementer. Godt vedlikeholdt med moderne fasiliteter.',
   20, 'Sportsbakken 5', '3724', 'Kragerø', 'Norway',
   NOW() - INTERVAL '36 days', true),

  -- Object 6: Kunstgressbane
  ('d0000001-0000-0005-0000-000000000000', 'f47ac10b-58cc-4372-a567-0e02b2c3d479', '11111111-1111-1111-1111-111111111111',
   'LOKALER_OG_BANER', 'SPACE', 'PERIOD', 'PUBLISHED',
   'Kunstgressbane', 'kunstgressbane-5',
   'Moderne kunstgressbane i Skien. Perfekt for treninger, kamper og arrangementer. Godt vedlikeholdt med moderne fasiliteter.',
   300, 'Hallveien 6', '3725', 'Skien', 'Norway',
   NOW() - INTERVAL '35 days', true),

  -- Object 7: Basketballbane
  ('d0000001-0000-0006-0000-000000000000', 'f47ac10b-58cc-4372-a567-0e02b2c3d479', '11111111-1111-1111-1111-111111111111',
   'LOKALER_OG_BANER', 'SPACE', 'PERIOD', 'PUBLISHED',
   'Basketballbane', 'basketballbane-6',
   'Moderne basketballbane i Porsgrunn. Perfekt for treninger, kamper og arrangementer. Godt vedlikeholdt med moderne fasiliteter.',
   300, 'Idrettsveien 7', '3726', 'Porsgrunn', 'Norway',
   NOW() - INTERVAL '34 days', true),

  -- Object 8: Håndballhall
  ('d0000001-0000-0007-0000-000000000000', 'f47ac10b-58cc-4372-a567-0e02b2c3d479', '11111111-1111-1111-1111-111111111111',
   'LOKALER_OG_BANER', 'SPACE', 'PERIOD', 'PUBLISHED',
   'Håndballhall', 'handballhall-7',
   'Moderne håndballhall i Bamble. Perfekt for treninger, kamper og arrangementer. Godt vedlikeholdt med moderne fasiliteter.',
   300, 'Parkveien 8', '3727', 'Bamble', 'Norway',
   NOW() - INTERVAL '33 days', true),

  -- Object 9: Turnhall
  ('d0000001-0000-0008-0000-000000000000', 'f47ac10b-58cc-4372-a567-0e02b2c3d479', '11111111-1111-1111-1111-111111111111',
   'LOKALER_OG_BANER', 'SPACE', 'PERIOD', 'PUBLISHED',
   'Turnhall', 'turnhall-8',
   'Moderne turnhall i Notodden. Perfekt for treninger, kamper og arrangementer. Godt vedlikeholdt med moderne fasiliteter.',
   300, 'Håndballgata 9', '3728', 'Notodden', 'Norway',
   NOW() - INTERVAL '32 days', true),

  -- Object 10: Klatrehall
  ('d0000001-0000-0009-0000-000000000000', 'f47ac10b-58cc-4372-a567-0e02b2c3d479', '11111111-1111-1111-1111-111111111111',
   'LOKALER_OG_BANER', 'SPACE', 'PERIOD', 'PUBLISHED',
   'Klatrehall', 'klatrehall-9',
   'Moderne klatrehall i Kragerø. Perfekt for treninger, kamper og arrangementer. Godt vedlikeholdt med moderne fasiliteter.',
   300, 'Kulturhusgata 10', '3729', 'Kragerø', 'Norway',
   NOW() - INTERVAL '31 days', true),

  -- Object 11: Dansestudio
  ('d0000001-0000-000a-0000-000000000000', 'f47ac10b-58cc-4372-a567-0e02b2c3d479', '11111111-1111-1111-1111-111111111111',
   'LOKALER_OG_BANER', 'SPACE', 'PERIOD', 'PUBLISHED',
   'Dansestudio', 'dansestudio-10',
   'Moderne dansestudio i Skien. Perfekt for treninger, kamper og arrangementer. Godt vedlikeholdt med moderne fasiliteter.',
   20, 'Sportsbakken 11', '3730', 'Skien', 'Norway',
   NOW() - INTERVAL '30 days', true),

  -- Object 12: Kampsportstudio
  ('d0000001-0000-000b-0000-000000000000', 'f47ac10b-58cc-4372-a567-0e02b2c3d479', '11111111-1111-1111-1111-111111111111',
   'LOKALER_OG_BANER', 'SPACE', 'PERIOD', 'PUBLISHED',
   'Kampsportstudio', 'kampsportstudio-11',
   'Moderne kampsportstudio i Porsgrunn. Perfekt for treninger, kamper og arrangementer. Godt vedlikeholdt med moderne fasiliteter.',
   20, 'Hallveien 12', '3731', 'Porsgrunn', 'Norway',
   NOW() - INTERVAL '29 days', true),

  -- Object 13: Yogastudio
  ('d0000001-0000-000c-0000-000000000000', 'f47ac10b-58cc-4372-a567-0e02b2c3d479', '11111111-1111-1111-1111-111111111111',
   'LOKALER_OG_BANER', 'SPACE', 'PERIOD', 'PUBLISHED',
   'Yogastudio', 'yogastudio-12',
   'Moderne yogastudio i Bamble. Perfekt for treninger, kamper og arrangementer. Godt vedlikeholdt med moderne fasiliteter.',
   20, 'Idrettsveien 13', '3732', 'Bamble', 'Norway',
   NOW() - INTERVAL '28 days', true),

  -- Object 14: Squashbane
  ('d0000001-0000-000d-0000-000000000000', 'f47ac10b-58cc-4372-a567-0e02b2c3d479', '11111111-1111-1111-1111-111111111111',
   'LOKALER_OG_BANER', 'SPACE', 'PERIOD', 'PUBLISHED',
   'Squashbane', 'squashbane-13',
   'Moderne squashbane i Notodden. Perfekt for treninger, kamper og arrangementer. Godt vedlikeholdt med moderne fasiliteter.',
   300, 'Parkveien 14', '3733', 'Notodden', 'Norway',
   NOW() - INTERVAL '27 days', true),

  -- Object 15: Badmintonhall
  ('d0000001-0000-000e-0000-000000000000', 'f47ac10b-58cc-4372-a567-0e02b2c3d479', '11111111-1111-1111-1111-111111111111',
   'LOKALER_OG_BANER', 'SPACE', 'PERIOD', 'PUBLISHED',
   'Badmintonhall', 'badmintonhall-14',
   'Moderne badmintonhall i Kragerø. Perfekt for treninger, kamper og arrangementer. Godt vedlikeholdt med moderne fasiliteter.',
   300, 'Håndballgata 15', '3734', 'Kragerø', 'Norway',
   NOW() - INTERVAL '26 days', true),

  -- Object 16: Innebandyhall
  ('d0000001-0000-000f-0000-000000000000', 'f47ac10b-58cc-4372-a567-0e02b2c3d479', '11111111-1111-1111-1111-111111111111',
   'LOKALER_OG_BANER', 'SPACE', 'PERIOD', 'PUBLISHED',
   'Innebandyhall', 'innebandyhall-15',
   'Moderne innebandyhall i Skien. Perfekt for treninger, kamper og arrangementer. Godt vedlikeholdt med moderne fasiliteter.',
   300, 'Kulturhusgata 16', '3735', 'Skien', 'Norway',
   NOW() - INTERVAL '25 days', true),

  -- Object 17: Volleyballbane
  ('d0000001-0000-0010-0000-000000000000', 'f47ac10b-58cc-4372-a567-0e02b2c3d479', '11111111-1111-1111-1111-111111111111',
   'LOKALER_OG_BANER', 'SPACE', 'PERIOD', 'PUBLISHED',
   'Volleyballbane', 'volleyballbane-16',
   'Moderne volleyballbane i Porsgrunn. Perfekt for treninger, kamper og arrangementer. Godt vedlikeholdt med moderne fasiliteter.',
   300, 'Sportsbakken 17', '3736', 'Porsgrunn', 'Norway',
   NOW() - INTERVAL '24 days', true),

  -- Object 18: Bordtennisrom
  ('d0000001-0000-0011-0000-000000000000', 'f47ac10b-58cc-4372-a567-0e02b2c3d479', '11111111-1111-1111-1111-111111111111',
   'LOKALER_OG_BANER', 'SPACE', 'PERIOD', 'PUBLISHED',
   'Bordtennisrom', 'bordtennisrom-17',
   'Moderne bordtennisrom i Bamble. Perfekt for treninger, kamper og arrangementer. Godt vedlikeholdt med moderne fasiliteter.',
   20, 'Hallveien 18', '3737', 'Bamble', 'Norway',
   NOW() - INTERVAL '23 days', true),

  -- Object 19: Bowlinghall
  ('d0000001-0000-0012-0000-000000000000', 'f47ac10b-58cc-4372-a567-0e02b2c3d479', '11111111-1111-1111-1111-111111111111',
   'LOKALER_OG_BANER', 'SPACE', 'PERIOD', 'PUBLISHED',
   'Bowlinghall', 'bowlinghall-18',
   'Moderne bowlinghall i Notodden. Perfekt for treninger, kamper og arrangementer. Godt vedlikeholdt med moderne fasiliteter.',
   300, 'Idrettsveien 19', '3738', 'Notodden', 'Norway',
   NOW() - INTERVAL '22 days', true),

  -- Object 20: Klubbhus
  ('d0000001-0000-0013-0000-000000000000', 'f47ac10b-58cc-4372-a567-0e02b2c3d479', '11111111-1111-1111-1111-111111111111',
   'LOKALER_OG_BANER', 'SPACE', 'PERIOD', 'PUBLISHED',
   'Klubbhus', 'klubbhus-19',
   'Moderne klubbhus i Kragerø. Perfekt for treninger, kamper og arrangementer. Godt vedlikeholdt med moderne fasiliteter.',
   100, 'Parkveien 20', '3739', 'Kragerø', 'Norway',
   NOW() - INTERVAL '21 days', true),

  -- Object 21: Kultursal
  ('d0000001-0000-0014-0000-000000000000', 'f47ac10b-58cc-4372-a567-0e02b2c3d479', '11111111-1111-1111-1111-111111111111',
   'LOKALER_OG_BANER', 'SPACE', 'PERIOD', 'PUBLISHED',
   'Kultursal', 'kultursal-20',
   'Moderne kultursal i Skien. Perfekt for treninger, kamper og arrangementer. Godt vedlikeholdt med moderne fasiliteter.',
   100, 'Håndballgata 21', '3740', 'Skien', 'Norway',
   NOW() - INTERVAL '20 days', true),

  -- Object 22: Konsertsal
  ('d0000001-0000-0015-0000-000000000000', 'f47ac10b-58cc-4372-a567-0e02b2c3d479', '11111111-1111-1111-1111-111111111111',
   'LOKALER_OG_BANER', 'SPACE', 'PERIOD', 'PUBLISHED',
   'Konsertsal', 'konsertsal-21',
   'Moderne konsertsal i Porsgrunn. Perfekt for treninger, kamper og arrangementer. Godt vedlikeholdt med moderne fasiliteter.',
   100, 'Kulturhusgata 22', '3741', 'Porsgrunn', 'Norway',
   NOW() - INTERVAL '19 days', true),

  -- Object 23: Teatersal
  ('d0000001-0000-0016-0000-000000000000', 'f47ac10b-58cc-4372-a567-0e02b2c3d479', '11111111-1111-1111-1111-111111111111',
   'LOKALER_OG_BANER', 'SPACE', 'PERIOD', 'PUBLISHED',
   'Teatersal', 'teatersal-22',
   'Moderne teatersal i Bamble. Perfekt for treninger, kamper og arrangementer. Godt vedlikeholdt med moderne fasiliteter.',
   100, 'Sportsbakken 23', '3742', 'Bamble', 'Norway',
   NOW() - INTERVAL '18 days', true),

  -- Object 24: Kinosal
  ('d0000001-0000-0017-0000-000000000000', 'f47ac10b-58cc-4372-a567-0e02b2c3d479', '11111111-1111-1111-1111-111111111111',
   'LOKALER_OG_BANER', 'SPACE', 'PERIOD', 'PUBLISHED',
   'Kinosal', 'kinosal-23',
   'Moderne kinosal i Notodden. Perfekt for treninger, kamper og arrangementer. Godt vedlikeholdt med moderne fasiliteter.',
   100, 'Hallveien 24', '3743', 'Notodden', 'Norway',
   NOW() - INTERVAL '17 days', true),

  -- Object 25: Forelesningssal
  ('d0000001-0000-0018-0000-000000000000', 'f47ac10b-58cc-4372-a567-0e02b2c3d479', '11111111-1111-1111-1111-111111111111',
   'LOKALER_OG_BANER', 'SPACE', 'PERIOD', 'PUBLISHED',
   'Forelesningssal', 'forelesningssal-24',
   'Moderne forelesningssal i Kragerø. Perfekt for treninger, kamper og arrangementer. Godt vedlikeholdt med moderne fasiliteter.',
   100, 'Idrettsveien 25', '3744', 'Kragerø', 'Norway',
   NOW() - INTERVAL '16 days', true),

  -- Object 26: Seminarrom
  ('d0000001-0000-0019-0000-000000000000', 'f47ac10b-58cc-4372-a567-0e02b2c3d479', '11111111-1111-1111-1111-111111111111',
   'LOKALER_OG_BANER', 'SPACE', 'PERIOD', 'PUBLISHED',
   'Seminarrom', 'seminarrom-25',
   'Moderne seminarrom i Skien. Perfekt for treninger, kamper og arrangementer. Godt vedlikeholdt med moderne fasiliteter.',
   20, 'Parkveien 26', '3745', 'Skien', 'Norway',
   NOW() - INTERVAL '15 days', true),

  -- Object 27: Møterom A
  ('d0000001-0000-001a-0000-000000000000', 'f47ac10b-58cc-4372-a567-0e02b2c3d479', '11111111-1111-1111-1111-111111111111',
   'LOKALER_OG_BANER', 'SPACE', 'PERIOD', 'PUBLISHED',
   'Møterom A', 'moterom-a-26',
   'Moderne møterom a i Porsgrunn. Perfekt for treninger, kamper og arrangementer. Godt vedlikeholdt med moderne fasiliteter.',
   20, 'Håndballgata 27', '3746', 'Porsgrunn', 'Norway',
   NOW() - INTERVAL '14 days', true),

  -- Object 28: Gymsal
  ('d0000001-0000-001b-0000-000000000000', 'f47ac10b-58cc-4372-a567-0e02b2c3d479', '11111111-1111-1111-1111-111111111111',
   'LOKALER_OG_BANER', 'SPACE', 'PERIOD', 'PUBLISHED',
   'Gymsal', 'gymsal-27',
   'Moderne gymsal i Bamble. Perfekt for treninger, kamper og arrangementer. Godt vedlikeholdt med moderne fasiliteter.',
   100, 'Kulturhusgata 28', '3747', 'Bamble', 'Norway',
   NOW() - INTERVAL '13 days', true),

  -- Object 29: Skøytebane
  ('d0000001-0000-001c-0000-000000000000', 'f47ac10b-58cc-4372-a567-0e02b2c3d479', '11111111-1111-1111-1111-111111111111',
   'LOKALER_OG_BANER', 'SPACE', 'PERIOD', 'PUBLISHED',
   'Skøytebane', 'skoytebane-28',
   'Moderne skøytebane i Notodden. Perfekt for treninger, kamper og arrangementer. Godt vedlikeholdt med moderne fasiliteter.',
   300, 'Sportsbakken 29', '3748', 'Notodden', 'Norway',
   NOW() - INTERVAL '12 days', true),

  -- Object 30: Curlinghall
  ('d0000001-0000-001d-0000-000000000000', 'f47ac10b-58cc-4372-a567-0e02b2c3d479', '11111111-1111-1111-1111-111111111111',
   'LOKALER_OG_BANER', 'SPACE', 'PERIOD', 'PUBLISHED',
   'Curlinghall', 'curlinghall-29',
   'Moderne curlinghall i Kragerø. Perfekt for treninger, kamper og arrangementer. Godt vedlikeholdt med moderne fasiliteter.',
   300, 'Hallveien 30', '3749', 'Kragerø', 'Norway',
   NOW() - INTERVAL '11 days', true),

  -- Object 31: Fotballbane 2
  ('d0000001-0000-001e-0000-000000000000', 'f47ac10b-58cc-4372-a567-0e02b2c3d479', '11111111-1111-1111-1111-111111111111',
   'LOKALER_OG_BANER', 'SPACE', 'PERIOD', 'PUBLISHED',
   'Fotballbane 2', 'fotballbane-2-30',
   'Moderne fotballbane 2 i Skien. Perfekt for treninger, kamper og arrangementer. Godt vedlikeholdt med moderne fasiliteter.',
   300, 'Idrettsveien 31', '3750', 'Skien', 'Norway',
   NOW() - INTERVAL '10 days', true),

  -- Object 32: Idrettshall B
  ('d0000001-0000-001f-0000-000000000000', 'f47ac10b-58cc-4372-a567-0e02b2c3d479', '11111111-1111-1111-1111-111111111111',
   'LOKALER_OG_BANER', 'SPACE', 'PERIOD', 'PUBLISHED',
   'Idrettshall B', 'idrettshall-b-31',
   'Moderne idrettshall b i Porsgrunn. Perfekt for treninger, kamper og arrangementer. Godt vedlikeholdt med moderne fasiliteter.',
   300, 'Parkveien 32', '3751', 'Porsgrunn', 'Norway',
   NOW() - INTERVAL '9 days', true),

  -- Object 33: Tennisbane 2
  ('d0000001-0000-0020-0000-000000000000', 'f47ac10b-58cc-4372-a567-0e02b2c3d479', '11111111-1111-1111-1111-111111111111',
   'LOKALER_OG_BANER', 'SPACE', 'PERIOD', 'PUBLISHED',
   'Tennisbane 2', 'tennisbane-2-32',
   'Moderne tennisbane 2 i Bamble. Perfekt for treninger, kamper og arrangementer. Godt vedlikeholdt med moderne fasiliteter.',
   300, 'Håndballgata 33', '3752', 'Bamble', 'Norway',
   NOW() - INTERVAL '8 days', true),

  -- Object 34: Treningsstudio 2
  ('d0000001-0000-0021-0000-000000000000', 'f47ac10b-58cc-4372-a567-0e02b2c3d479', '11111111-1111-1111-1111-111111111111',
   'LOKALER_OG_BANER', 'SPACE', 'PERIOD', 'PUBLISHED',
   'Treningsstudio 2', 'treningsstudio-2-33',
   'Moderne treningsstudio 2 i Notodden. Perfekt for treninger, kamper og arrangementer. Godt vedlikeholdt med moderne fasiliteter.',
   20, 'Kulturhusgata 34', '3753', 'Notodden', 'Norway',
   NOW() - INTERVAL '7 days', true),

  -- Object 35: Møterom B
  ('d0000001-0000-0022-0000-000000000000', 'f47ac10b-58cc-4372-a567-0e02b2c3d479', '11111111-1111-1111-1111-111111111111',
   'LOKALER_OG_BANER', 'SPACE', 'PERIOD', 'PUBLISHED',
   'Møterom B', 'moterom-b-34',
   'Moderne møterom b i Kragerø. Perfekt for treninger, kamper og arrangementer. Godt vedlikeholdt med moderne fasiliteter.',
   20, 'Sportsbakken 35', '3754', 'Kragerø', 'Norway',
   NOW() - INTERVAL '6 days', true),

  -- Object 36: Spillestudio
  ('d0000001-0000-0023-0000-000000000000', 'f47ac10b-58cc-4372-a567-0e02b2c3d479', '11111111-1111-1111-1111-111111111111',
   'LOKALER_OG_BANER', 'SPACE', 'PERIOD', 'PUBLISHED',
   'Spillestudio', 'spillestudio-35',
   'Moderne spillestudio i Skien. Perfekt for treninger, kamper og arrangementer. Godt vedlikeholdt med moderne fasiliteter.',
   20, 'Hallveien 36', '3755', 'Skien', 'Norway',
   NOW() - INTERVAL '5 days', true),

  -- Object 37: Podcaststudio
  ('d0000001-0000-0024-0000-000000000000', 'f47ac10b-58cc-4372-a567-0e02b2c3d479', '11111111-1111-1111-1111-111111111111',
   'LOKALER_OG_BANER', 'SPACE', 'PERIOD', 'PUBLISHED',
   'Podcaststudio', 'podcaststudio-36',
   'Moderne podcaststudio i Porsgrunn. Perfekt for treninger, kamper og arrangementer. Godt vedlikeholdt med moderne fasiliteter.',
   20, 'Idrettsveien 37', '3756', 'Porsgrunn', 'Norway',
   NOW() - INTERVAL '4 days', true),

  -- Object 38: Filmstudio
  ('d0000001-0000-0025-0000-000000000000', 'f47ac10b-58cc-4372-a567-0e02b2c3d479', '11111111-1111-1111-1111-111111111111',
   'LOKALER_OG_BANER', 'SPACE', 'PERIOD', 'PUBLISHED',
   'Filmstudio', 'filmstudio-37',
   'Moderne filmstudio i Bamble. Perfekt for treninger, kamper og arrangementer. Godt vedlikeholdt med moderne fasiliteter.',
   20, 'Parkveien 38', '3757', 'Bamble', 'Norway',
   NOW() - INTERVAL '3 days', true),

  -- Object 39: Lydstudio
  ('d0000001-0000-0026-0000-000000000000', 'f47ac10b-58cc-4372-a567-0e02b2c3d479', '11111111-1111-1111-1111-111111111111',
   'LOKALER_OG_BANER', 'SPACE', 'PERIOD', 'PUBLISHED',
   'Lydstudio', 'lydstudio-38',
   'Moderne lydstudio i Notodden. Perfekt for treninger, kamper og arrangementer. Godt vedlikeholdt med moderne fasiliteter.',
   20, 'Håndballgata 39', '3758', 'Notodden', 'Norway',
   NOW() - INTERVAL '2 days', true),

  -- Object 40: Multihall
  ('d0000001-0000-0027-0000-000000000000', 'f47ac10b-58cc-4372-a567-0e02b2c3d479', '11111111-1111-1111-1111-111111111111',
   'LOKALER_OG_BANER', 'SPACE', 'PERIOD', 'PUBLISHED',
   'Multihall', 'multihall-39',
   'Moderne multihall i Kragerø. Perfekt for treninger, kamper og arrangementer. Godt vedlikeholdt med moderne fasiliteter.',
   300, 'Kulturhusgata 40', '3759', 'Kragerø', 'Norway',
   NOW() - INTERVAL '1 days', true)

ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  status = EXCLUDED.status,
  updated_at = NOW();

-- =====================================================================
-- RENTAL OBJECT MEDIA (3 images per object)
-- =====================================================================

INSERT INTO domain.rental_object_media (tenant_id, rental_object_id, media_type, url, alt_text, sort_order, is_primary)
VALUES
  ('f47ac10b-58cc-4372-a567-0e02b2c3d479', 'd0000001-0000-0000-0000-000000000001', 'IMAGE', 'https://images.unsplash.com/photo-1519861531473-9200262188bf?w=1200&q=80', 'Idrettshall A bilde 1', 1, true),
  ('f47ac10b-58cc-4372-a567-0e02b2c3d479', 'd0000001-0000-0000-0000-000000000001', 'IMAGE', 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&q=80', 'Idrettshall A bilde 2', 2, false),
  ('f47ac10b-58cc-4372-a567-0e02b2c3d479', 'd0000001-0000-0000-0000-000000000001', 'IMAGE', 'https://images.unsplash.com/photo-1577223625816-7546f13df25d?w=1200&q=80', 'Idrettshall A bilde 3', 3, false),
  ('f47ac10b-58cc-4372-a567-0e02b2c3d479', 'd0000001-0000-0001-0000-000000000000', 'IMAGE', 'https://images.unsplash.com/photo-1529900748604-07564a03e7a6?w=1200&q=80', 'Fotballbane 1 bilde 1', 1, true),
  ('f47ac10b-58cc-4372-a567-0e02b2c3d479', 'd0000001-0000-0001-0000-000000000000', 'IMAGE', 'https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?w=1200&q=80', 'Fotballbane 1 bilde 2', 2, false),
  ('f47ac10b-58cc-4372-a567-0e02b2c3d479', 'd0000001-0000-0001-0000-000000000000', 'IMAGE', 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=1200&q=80', 'Fotballbane 1 bilde 3', 3, false),
  ('f47ac10b-58cc-4372-a567-0e02b2c3d479', 'd0000001-0000-0002-0000-000000000000', 'IMAGE', 'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=1200&q=80', 'Tennisbane 1 bilde 1', 1, true),
  ('f47ac10b-58cc-4372-a567-0e02b2c3d479', 'd0000001-0000-0002-0000-000000000000', 'IMAGE', 'https://images.unsplash.com/photo-1622279457486-62dcc4a431d6?w=1200&q=80', 'Tennisbane 1 bilde 2', 2, false),
  ('f47ac10b-58cc-4372-a567-0e02b2c3d479', 'd0000001-0000-0002-0000-000000000000', 'IMAGE', 'https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?w=1200&q=80', 'Tennisbane 1 bilde 3', 3, false),
  ('f47ac10b-58cc-4372-a567-0e02b2c3d479', 'd0000001-0000-0003-0000-000000000000', 'IMAGE', 'https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?w=1200&q=80', 'Svømmehall bilde 1', 1, true),
  ('f47ac10b-58cc-4372-a567-0e02b2c3d479', 'd0000001-0000-0003-0000-000000000000', 'IMAGE', 'https://images.unsplash.com/photo-1519499772995-d59618c8c015?w=1200&q=80', 'Svømmehall bilde 2', 2, false),
  ('f47ac10b-58cc-4372-a567-0e02b2c3d479', 'd0000001-0000-0003-0000-000000000000', 'IMAGE', 'https://images.unsplash.com/photo-1600965962102-9d260a71890d?w=1200&q=80', 'Svømmehall bilde 3', 3, false),
  ('f47ac10b-58cc-4372-a567-0e02b2c3d479', 'd0000001-0000-0004-0000-000000000000', 'IMAGE', 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1200&q=80', 'Treningsstudio 1 bilde 1', 1, true),
  ('f47ac10b-58cc-4372-a567-0e02b2c3d479', 'd0000001-0000-0004-0000-000000000000', 'IMAGE', 'https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=1200&q=80', 'Treningsstudio 1 bilde 2', 2, false),
  ('f47ac10b-58cc-4372-a567-0e02b2c3d479', 'd0000001-0000-0004-0000-000000000000', 'IMAGE', 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=1200&q=80', 'Treningsstudio 1 bilde 3', 3, false),
  ('f47ac10b-58cc-4372-a567-0e02b2c3d479', 'd0000001-0000-0005-0000-000000000000', 'IMAGE', 'https://images.unsplash.com/photo-1519861531473-9200262188bf?w=1200&q=80', 'Kunstgressbane bilde 1', 1, true),
  ('f47ac10b-58cc-4372-a567-0e02b2c3d479', 'd0000001-0000-0005-0000-000000000000', 'IMAGE', 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&q=80', 'Kunstgressbane bilde 2', 2, false),
  ('f47ac10b-58cc-4372-a567-0e02b2c3d479', 'd0000001-0000-0005-0000-000000000000', 'IMAGE', 'https://images.unsplash.com/photo-1577223625816-7546f13df25d?w=1200&q=80', 'Kunstgressbane bilde 3', 3, false),
  ('f47ac10b-58cc-4372-a567-0e02b2c3d479', 'd0000001-0000-0006-0000-000000000000', 'IMAGE', 'https://images.unsplash.com/photo-1519861531473-9200262188bf?w=1200&q=80', 'Basketballbane bilde 1', 1, true),
  ('f47ac10b-58cc-4372-a567-0e02b2c3d479', 'd0000001-0000-0006-0000-000000000000', 'IMAGE', 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&q=80', 'Basketballbane bilde 2', 2, false),
  ('f47ac10b-58cc-4372-a567-0e02b2c3d479', 'd0000001-0000-0006-0000-000000000000', 'IMAGE', 'https://images.unsplash.com/photo-1577223625816-7546f13df25d?w=1200&q=80', 'Basketballbane bilde 3', 3, false),
  ('f47ac10b-58cc-4372-a567-0e02b2c3d479', 'd0000001-0000-0007-0000-000000000000', 'IMAGE', 'https://images.unsplash.com/photo-1519861531473-9200262188bf?w=1200&q=80', 'Håndballhall bilde 1', 1, true),
  ('f47ac10b-58cc-4372-a567-0e02b2c3d479', 'd0000001-0000-0007-0000-000000000000', 'IMAGE', 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&q=80', 'Håndballhall bilde 2', 2, false),
  ('f47ac10b-58cc-4372-a567-0e02b2c3d479', 'd0000001-0000-0007-0000-000000000000', 'IMAGE', 'https://images.unsplash.com/photo-1577223625816-7546f13df25d?w=1200&q=80', 'Håndballhall bilde 3', 3, false),
  ('f47ac10b-58cc-4372-a567-0e02b2c3d479', 'd0000001-0000-0008-0000-000000000000', 'IMAGE', 'https://images.unsplash.com/photo-1519861531473-9200262188bf?w=1200&q=80', 'Turnhall bilde 1', 1, true),
  ('f47ac10b-58cc-4372-a567-0e02b2c3d479', 'd0000001-0000-0008-0000-000000000000', 'IMAGE', 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&q=80', 'Turnhall bilde 2', 2, false),
  ('f47ac10b-58cc-4372-a567-0e02b2c3d479', 'd0000001-0000-0008-0000-000000000000', 'IMAGE', 'https://images.unsplash.com/photo-1577223625816-7546f13df25d?w=1200&q=80', 'Turnhall bilde 3', 3, false),
  ('f47ac10b-58cc-4372-a567-0e02b2c3d479', 'd0000001-0000-0009-0000-000000000000', 'IMAGE', 'https://images.unsplash.com/photo-1519861531473-9200262188bf?w=1200&q=80', 'Klatrehall bilde 1', 1, true),
  ('f47ac10b-58cc-4372-a567-0e02b2c3d479', 'd0000001-0000-0009-0000-000000000000', 'IMAGE', 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&q=80', 'Klatrehall bilde 2', 2, false),
  ('f47ac10b-58cc-4372-a567-0e02b2c3d479', 'd0000001-0000-0009-0000-000000000000', 'IMAGE', 'https://images.unsplash.com/photo-1577223625816-7546f13df25d?w=1200&q=80', 'Klatrehall bilde 3', 3, false),
  ('f47ac10b-58cc-4372-a567-0e02b2c3d479', 'd0000001-0000-000a-0000-000000000000', 'IMAGE', 'https://images.unsplash.com/photo-1519861531473-9200262188bf?w=1200&q=80', 'Dansestudio bilde 1', 1, true),
  ('f47ac10b-58cc-4372-a567-0e02b2c3d479', 'd0000001-0000-000a-0000-000000000000', 'IMAGE', 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&q=80', 'Dansestudio bilde 2', 2, false),
  ('f47ac10b-58cc-4372-a567-0e02b2c3d479', 'd0000001-0000-000a-0000-000000000000', 'IMAGE', 'https://images.unsplash.com/photo-1577223625816-7546f13df25d?w=1200&q=80', 'Dansestudio bilde 3', 3, false),
  ('f47ac10b-58cc-4372-a567-0e02b2c3d479', 'd0000001-0000-000b-0000-000000000000', 'IMAGE', 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1200&q=80', 'Kampsportstudio bilde 1', 1, true),
  ('f47ac10b-58cc-4372-a567-0e02b2c3d479', 'd0000001-0000-000b-0000-000000000000', 'IMAGE', 'https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=1200&q=80', 'Kampsportstudio bilde 2', 2, false),
  ('f47ac10b-58cc-4372-a567-0e02b2c3d479', 'd0000001-0000-000b-0000-000000000000', 'IMAGE', 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=1200&q=80', 'Kampsportstudio bilde 3', 3, false),
  ('f47ac10b-58cc-4372-a567-0e02b2c3d479', 'd0000001-0000-000c-0000-000000000000', 'IMAGE', 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1200&q=80', 'Yogastudio bilde 1', 1, true),
  ('f47ac10b-58cc-4372-a567-0e02b2c3d479', 'd0000001-0000-000c-0000-000000000000', 'IMAGE', 'https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=1200&q=80', 'Yogastudio bilde 2', 2, false),
  ('f47ac10b-58cc-4372-a567-0e02b2c3d479', 'd0000001-0000-000c-0000-000000000000', 'IMAGE', 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=1200&q=80', 'Yogastudio bilde 3', 3, false),
  ('f47ac10b-58cc-4372-a567-0e02b2c3d479', 'd0000001-0000-000d-0000-000000000000', 'IMAGE', 'https://images.unsplash.com/photo-1519861531473-9200262188bf?w=1200&q=80', 'Squashbane bilde 1', 1, true),
  ('f47ac10b-58cc-4372-a567-0e02b2c3d479', 'd0000001-0000-000d-0000-000000000000', 'IMAGE', 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&q=80', 'Squashbane bilde 2', 2, false),
  ('f47ac10b-58cc-4372-a567-0e02b2c3d479', 'd0000001-0000-000d-0000-000000000000', 'IMAGE', 'https://images.unsplash.com/photo-1577223625816-7546f13df25d?w=1200&q=80', 'Squashbane bilde 3', 3, false),
  ('f47ac10b-58cc-4372-a567-0e02b2c3d479', 'd0000001-0000-000e-0000-000000000000', 'IMAGE', 'https://images.unsplash.com/photo-1519861531473-9200262188bf?w=1200&q=80', 'Badmintonhall bilde 1', 1, true),
  ('f47ac10b-58cc-4372-a567-0e02b2c3d479', 'd0000001-0000-000e-0000-000000000000', 'IMAGE', 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&q=80', 'Badmintonhall bilde 2', 2, false),
  ('f47ac10b-58cc-4372-a567-0e02b2c3d479', 'd0000001-0000-000e-0000-000000000000', 'IMAGE', 'https://images.unsplash.com/photo-1577223625816-7546f13df25d?w=1200&q=80', 'Badmintonhall bilde 3', 3, false),
  ('f47ac10b-58cc-4372-a567-0e02b2c3d479', 'd0000001-0000-000f-0000-000000000000', 'IMAGE', 'https://images.unsplash.com/photo-1519861531473-9200262188bf?w=1200&q=80', 'Innebandyhall bilde 1', 1, true),
  ('f47ac10b-58cc-4372-a567-0e02b2c3d479', 'd0000001-0000-000f-0000-000000000000', 'IMAGE', 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&q=80', 'Innebandyhall bilde 2', 2, false),
  ('f47ac10b-58cc-4372-a567-0e02b2c3d479', 'd0000001-0000-000f-0000-000000000000', 'IMAGE', 'https://images.unsplash.com/photo-1577223625816-7546f13df25d?w=1200&q=80', 'Innebandyhall bilde 3', 3, false),
  ('f47ac10b-58cc-4372-a567-0e02b2c3d479', 'd0000001-0000-0010-0000-000000000000', 'IMAGE', 'https://images.unsplash.com/photo-1519861531473-9200262188bf?w=1200&q=80', 'Volleyballbane bilde 1', 1, true),
  ('f47ac10b-58cc-4372-a567-0e02b2c3d479', 'd0000001-0000-0010-0000-000000000000', 'IMAGE', 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&q=80', 'Volleyballbane bilde 2', 2, false),
  ('f47ac10b-58cc-4372-a567-0e02b2c3d479', 'd0000001-0000-0010-0000-000000000000', 'IMAGE', 'https://images.unsplash.com/photo-1577223625816-7546f13df25d?w=1200&q=80', 'Volleyballbane bilde 3', 3, false),
  ('f47ac10b-58cc-4372-a567-0e02b2c3d479', 'd0000001-0000-0011-0000-000000000000', 'IMAGE', 'https://images.unsplash.com/photo-1519861531473-9200262188bf?w=1200&q=80', 'Bordtennisrom bilde 1', 1, true),
  ('f47ac10b-58cc-4372-a567-0e02b2c3d479', 'd0000001-0000-0011-0000-000000000000', 'IMAGE', 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&q=80', 'Bordtennisrom bilde 2', 2, false),
  ('f47ac10b-58cc-4372-a567-0e02b2c3d479', 'd0000001-0000-0011-0000-000000000000', 'IMAGE', 'https://images.unsplash.com/photo-1577223625816-7546f13df25d?w=1200&q=80', 'Bordtennisrom bilde 3', 3, false),
  ('f47ac10b-58cc-4372-a567-0e02b2c3d479', 'd0000001-0000-0012-0000-000000000000', 'IMAGE', 'https://images.unsplash.com/photo-1519861531473-9200262188bf?w=1200&q=80', 'Bowlinghall bilde 1', 1, true),
  ('f47ac10b-58cc-4372-a567-0e02b2c3d479', 'd0000001-0000-0012-0000-000000000000', 'IMAGE', 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&q=80', 'Bowlinghall bilde 2', 2, false),
  ('f47ac10b-58cc-4372-a567-0e02b2c3d479', 'd0000001-0000-0012-0000-000000000000', 'IMAGE', 'https://images.unsplash.com/photo-1577223625816-7546f13df25d?w=1200&q=80', 'Bowlinghall bilde 3', 3, false),
  ('f47ac10b-58cc-4372-a567-0e02b2c3d479', 'd0000001-0000-0013-0000-000000000000', 'IMAGE', 'https://images.unsplash.com/photo-1519861531473-9200262188bf?w=1200&q=80', 'Klubbhus bilde 1', 1, true),
  ('f47ac10b-58cc-4372-a567-0e02b2c3d479', 'd0000001-0000-0013-0000-000000000000', 'IMAGE', 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&q=80', 'Klubbhus bilde 2', 2, false),
  ('f47ac10b-58cc-4372-a567-0e02b2c3d479', 'd0000001-0000-0013-0000-000000000000', 'IMAGE', 'https://images.unsplash.com/photo-1577223625816-7546f13df25d?w=1200&q=80', 'Klubbhus bilde 3', 3, false),
  ('f47ac10b-58cc-4372-a567-0e02b2c3d479', 'd0000001-0000-0014-0000-000000000000', 'IMAGE', 'https://images.unsplash.com/photo-1519861531473-9200262188bf?w=1200&q=80', 'Kultursal bilde 1', 1, true),
  ('f47ac10b-58cc-4372-a567-0e02b2c3d479', 'd0000001-0000-0014-0000-000000000000', 'IMAGE', 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&q=80', 'Kultursal bilde 2', 2, false),
  ('f47ac10b-58cc-4372-a567-0e02b2c3d479', 'd0000001-0000-0014-0000-000000000000', 'IMAGE', 'https://images.unsplash.com/photo-1577223625816-7546f13df25d?w=1200&q=80', 'Kultursal bilde 3', 3, false),
  ('f47ac10b-58cc-4372-a567-0e02b2c3d479', 'd0000001-0000-0015-0000-000000000000', 'IMAGE', 'https://images.unsplash.com/photo-1519861531473-9200262188bf?w=1200&q=80', 'Konsertsal bilde 1', 1, true),
  ('f47ac10b-58cc-4372-a567-0e02b2c3d479', 'd0000001-0000-0015-0000-000000000000', 'IMAGE', 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&q=80', 'Konsertsal bilde 2', 2, false),
  ('f47ac10b-58cc-4372-a567-0e02b2c3d479', 'd0000001-0000-0015-0000-000000000000', 'IMAGE', 'https://images.unsplash.com/photo-1577223625816-7546f13df25d?w=1200&q=80', 'Konsertsal bilde 3', 3, false),
  ('f47ac10b-58cc-4372-a567-0e02b2c3d479', 'd0000001-0000-0016-0000-000000000000', 'IMAGE', 'https://images.unsplash.com/photo-1519861531473-9200262188bf?w=1200&q=80', 'Teatersal bilde 1', 1, true),
  ('f47ac10b-58cc-4372-a567-0e02b2c3d479', 'd0000001-0000-0016-0000-000000000000', 'IMAGE', 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&q=80', 'Teatersal bilde 2', 2, false),
  ('f47ac10b-58cc-4372-a567-0e02b2c3d479', 'd0000001-0000-0016-0000-000000000000', 'IMAGE', 'https://images.unsplash.com/photo-1577223625816-7546f13df25d?w=1200&q=80', 'Teatersal bilde 3', 3, false),
  ('f47ac10b-58cc-4372-a567-0e02b2c3d479', 'd0000001-0000-0017-0000-000000000000', 'IMAGE', 'https://images.unsplash.com/photo-1519861531473-9200262188bf?w=1200&q=80', 'Kinosal bilde 1', 1, true),
  ('f47ac10b-58cc-4372-a567-0e02b2c3d479', 'd0000001-0000-0017-0000-000000000000', 'IMAGE', 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&q=80', 'Kinosal bilde 2', 2, false),
  ('f47ac10b-58cc-4372-a567-0e02b2c3d479', 'd0000001-0000-0017-0000-000000000000', 'IMAGE', 'https://images.unsplash.com/photo-1577223625816-7546f13df25d?w=1200&q=80', 'Kinosal bilde 3', 3, false),
  ('f47ac10b-58cc-4372-a567-0e02b2c3d479', 'd0000001-0000-0018-0000-000000000000', 'IMAGE', 'https://images.unsplash.com/photo-1519861531473-9200262188bf?w=1200&q=80', 'Forelesningssal bilde 1', 1, true),
  ('f47ac10b-58cc-4372-a567-0e02b2c3d479', 'd0000001-0000-0018-0000-000000000000', 'IMAGE', 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&q=80', 'Forelesningssal bilde 2', 2, false),
  ('f47ac10b-58cc-4372-a567-0e02b2c3d479', 'd0000001-0000-0018-0000-000000000000', 'IMAGE', 'https://images.unsplash.com/photo-1577223625816-7546f13df25d?w=1200&q=80', 'Forelesningssal bilde 3', 3, false),
  ('f47ac10b-58cc-4372-a567-0e02b2c3d479', 'd0000001-0000-0019-0000-000000000000', 'IMAGE', 'https://images.unsplash.com/photo-1519861531473-9200262188bf?w=1200&q=80', 'Seminarrom bilde 1', 1, true),
  ('f47ac10b-58cc-4372-a567-0e02b2c3d479', 'd0000001-0000-0019-0000-000000000000', 'IMAGE', 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&q=80', 'Seminarrom bilde 2', 2, false),
  ('f47ac10b-58cc-4372-a567-0e02b2c3d479', 'd0000001-0000-0019-0000-000000000000', 'IMAGE', 'https://images.unsplash.com/photo-1577223625816-7546f13df25d?w=1200&q=80', 'Seminarrom bilde 3', 3, false),
  ('f47ac10b-58cc-4372-a567-0e02b2c3d479', 'd0000001-0000-001a-0000-000000000000', 'IMAGE', 'https://images.unsplash.com/photo-1519861531473-9200262188bf?w=1200&q=80', 'Møterom A bilde 1', 1, true),
  ('f47ac10b-58cc-4372-a567-0e02b2c3d479', 'd0000001-0000-001a-0000-000000000000', 'IMAGE', 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&q=80', 'Møterom A bilde 2', 2, false),
  ('f47ac10b-58cc-4372-a567-0e02b2c3d479', 'd0000001-0000-001a-0000-000000000000', 'IMAGE', 'https://images.unsplash.com/photo-1577223625816-7546f13df25d?w=1200&q=80', 'Møterom A bilde 3', 3, false),
  ('f47ac10b-58cc-4372-a567-0e02b2c3d479', 'd0000001-0000-001b-0000-000000000000', 'IMAGE', 'https://images.unsplash.com/photo-1519861531473-9200262188bf?w=1200&q=80', 'Gymsal bilde 1', 1, true),
  ('f47ac10b-58cc-4372-a567-0e02b2c3d479', 'd0000001-0000-001b-0000-000000000000', 'IMAGE', 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&q=80', 'Gymsal bilde 2', 2, false),
  ('f47ac10b-58cc-4372-a567-0e02b2c3d479', 'd0000001-0000-001b-0000-000000000000', 'IMAGE', 'https://images.unsplash.com/photo-1577223625816-7546f13df25d?w=1200&q=80', 'Gymsal bilde 3', 3, false),
  ('f47ac10b-58cc-4372-a567-0e02b2c3d479', 'd0000001-0000-001c-0000-000000000000', 'IMAGE', 'https://images.unsplash.com/photo-1519861531473-9200262188bf?w=1200&q=80', 'Skøytebane bilde 1', 1, true),
  ('f47ac10b-58cc-4372-a567-0e02b2c3d479', 'd0000001-0000-001c-0000-000000000000', 'IMAGE', 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&q=80', 'Skøytebane bilde 2', 2, false),
  ('f47ac10b-58cc-4372-a567-0e02b2c3d479', 'd0000001-0000-001c-0000-000000000000', 'IMAGE', 'https://images.unsplash.com/photo-1577223625816-7546f13df25d?w=1200&q=80', 'Skøytebane bilde 3', 3, false),
  ('f47ac10b-58cc-4372-a567-0e02b2c3d479', 'd0000001-0000-001d-0000-000000000000', 'IMAGE', 'https://images.unsplash.com/photo-1519861531473-9200262188bf?w=1200&q=80', 'Curlinghall bilde 1', 1, true),
  ('f47ac10b-58cc-4372-a567-0e02b2c3d479', 'd0000001-0000-001d-0000-000000000000', 'IMAGE', 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&q=80', 'Curlinghall bilde 2', 2, false),
  ('f47ac10b-58cc-4372-a567-0e02b2c3d479', 'd0000001-0000-001d-0000-000000000000', 'IMAGE', 'https://images.unsplash.com/photo-1577223625816-7546f13df25d?w=1200&q=80', 'Curlinghall bilde 3', 3, false),
  ('f47ac10b-58cc-4372-a567-0e02b2c3d479', 'd0000001-0000-001e-0000-000000000000', 'IMAGE', 'https://images.unsplash.com/photo-1529900748604-07564a03e7a6?w=1200&q=80', 'Fotballbane 2 bilde 1', 1, true),
  ('f47ac10b-58cc-4372-a567-0e02b2c3d479', 'd0000001-0000-001e-0000-000000000000', 'IMAGE', 'https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?w=1200&q=80', 'Fotballbane 2 bilde 2', 2, false),
  ('f47ac10b-58cc-4372-a567-0e02b2c3d479', 'd0000001-0000-001e-0000-000000000000', 'IMAGE', 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=1200&q=80', 'Fotballbane 2 bilde 3', 3, false),
  ('f47ac10b-58cc-4372-a567-0e02b2c3d479', 'd0000001-0000-001f-0000-000000000000', 'IMAGE', 'https://images.unsplash.com/photo-1519861531473-9200262188bf?w=1200&q=80', 'Idrettshall B bilde 1', 1, true),
  ('f47ac10b-58cc-4372-a567-0e02b2c3d479', 'd0000001-0000-001f-0000-000000000000', 'IMAGE', 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&q=80', 'Idrettshall B bilde 2', 2, false),
  ('f47ac10b-58cc-4372-a567-0e02b2c3d479', 'd0000001-0000-001f-0000-000000000000', 'IMAGE', 'https://images.unsplash.com/photo-1577223625816-7546f13df25d?w=1200&q=80', 'Idrettshall B bilde 3', 3, false),
  ('f47ac10b-58cc-4372-a567-0e02b2c3d479', 'd0000001-0000-0020-0000-000000000000', 'IMAGE', 'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=1200&q=80', 'Tennisbane 2 bilde 1', 1, true),
  ('f47ac10b-58cc-4372-a567-0e02b2c3d479', 'd0000001-0000-0020-0000-000000000000', 'IMAGE', 'https://images.unsplash.com/photo-1622279457486-62dcc4a431d6?w=1200&q=80', 'Tennisbane 2 bilde 2', 2, false),
  ('f47ac10b-58cc-4372-a567-0e02b2c3d479', 'd0000001-0000-0020-0000-000000000000', 'IMAGE', 'https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?w=1200&q=80', 'Tennisbane 2 bilde 3', 3, false),
  ('f47ac10b-58cc-4372-a567-0e02b2c3d479', 'd0000001-0000-0021-0000-000000000000', 'IMAGE', 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1200&q=80', 'Treningsstudio 2 bilde 1', 1, true),
  ('f47ac10b-58cc-4372-a567-0e02b2c3d479', 'd0000001-0000-0021-0000-000000000000', 'IMAGE', 'https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=1200&q=80', 'Treningsstudio 2 bilde 2', 2, false),
  ('f47ac10b-58cc-4372-a567-0e02b2c3d479', 'd0000001-0000-0021-0000-000000000000', 'IMAGE', 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=1200&q=80', 'Treningsstudio 2 bilde 3', 3, false),
  ('f47ac10b-58cc-4372-a567-0e02b2c3d479', 'd0000001-0000-0022-0000-000000000000', 'IMAGE', 'https://images.unsplash.com/photo-1519861531473-9200262188bf?w=1200&q=80', 'Møterom B bilde 1', 1, true),
  ('f47ac10b-58cc-4372-a567-0e02b2c3d479', 'd0000001-0000-0022-0000-000000000000', 'IMAGE', 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&q=80', 'Møterom B bilde 2', 2, false),
  ('f47ac10b-58cc-4372-a567-0e02b2c3d479', 'd0000001-0000-0022-0000-000000000000', 'IMAGE', 'https://images.unsplash.com/photo-1577223625816-7546f13df25d?w=1200&q=80', 'Møterom B bilde 3', 3, false),
  ('f47ac10b-58cc-4372-a567-0e02b2c3d479', 'd0000001-0000-0023-0000-000000000000', 'IMAGE', 'https://images.unsplash.com/photo-1519861531473-9200262188bf?w=1200&q=80', 'Spillestudio bilde 1', 1, true),
  ('f47ac10b-58cc-4372-a567-0e02b2c3d479', 'd0000001-0000-0023-0000-000000000000', 'IMAGE', 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&q=80', 'Spillestudio bilde 2', 2, false),
  ('f47ac10b-58cc-4372-a567-0e02b2c3d479', 'd0000001-0000-0023-0000-000000000000', 'IMAGE', 'https://images.unsplash.com/photo-1577223625816-7546f13df25d?w=1200&q=80', 'Spillestudio bilde 3', 3, false),
  ('f47ac10b-58cc-4372-a567-0e02b2c3d479', 'd0000001-0000-0024-0000-000000000000', 'IMAGE', 'https://images.unsplash.com/photo-1519861531473-9200262188bf?w=1200&q=80', 'Podcaststudio bilde 1', 1, true),
  ('f47ac10b-58cc-4372-a567-0e02b2c3d479', 'd0000001-0000-0024-0000-000000000000', 'IMAGE', 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&q=80', 'Podcaststudio bilde 2', 2, false),
  ('f47ac10b-58cc-4372-a567-0e02b2c3d479', 'd0000001-0000-0024-0000-000000000000', 'IMAGE', 'https://images.unsplash.com/photo-1577223625816-7546f13df25d?w=1200&q=80', 'Podcaststudio bilde 3', 3, false),
  ('f47ac10b-58cc-4372-a567-0e02b2c3d479', 'd0000001-0000-0025-0000-000000000000', 'IMAGE', 'https://images.unsplash.com/photo-1519861531473-9200262188bf?w=1200&q=80', 'Filmstudio bilde 1', 1, true),
  ('f47ac10b-58cc-4372-a567-0e02b2c3d479', 'd0000001-0000-0025-0000-000000000000', 'IMAGE', 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&q=80', 'Filmstudio bilde 2', 2, false),
  ('f47ac10b-58cc-4372-a567-0e02b2c3d479', 'd0000001-0000-0025-0000-000000000000', 'IMAGE', 'https://images.unsplash.com/photo-1577223625816-7546f13df25d?w=1200&q=80', 'Filmstudio bilde 3', 3, false),
  ('f47ac10b-58cc-4372-a567-0e02b2c3d479', 'd0000001-0000-0026-0000-000000000000', 'IMAGE', 'https://images.unsplash.com/photo-1519861531473-9200262188bf?w=1200&q=80', 'Lydstudio bilde 1', 1, true),
  ('f47ac10b-58cc-4372-a567-0e02b2c3d479', 'd0000001-0000-0026-0000-000000000000', 'IMAGE', 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&q=80', 'Lydstudio bilde 2', 2, false),
  ('f47ac10b-58cc-4372-a567-0e02b2c3d479', 'd0000001-0000-0026-0000-000000000000', 'IMAGE', 'https://images.unsplash.com/photo-1577223625816-7546f13df25d?w=1200&q=80', 'Lydstudio bilde 3', 3, false),
  ('f47ac10b-58cc-4372-a567-0e02b2c3d479', 'd0000001-0000-0027-0000-000000000000', 'IMAGE', 'https://images.unsplash.com/photo-1519861531473-9200262188bf?w=1200&q=80', 'Multihall bilde 1', 1, true),
  ('f47ac10b-58cc-4372-a567-0e02b2c3d479', 'd0000001-0000-0027-0000-000000000000', 'IMAGE', 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&q=80', 'Multihall bilde 2', 2, false),
  ('f47ac10b-58cc-4372-a567-0e02b2c3d479', 'd0000001-0000-0027-0000-000000000000', 'IMAGE', 'https://images.unsplash.com/photo-1577223625816-7546f13df25d?w=1200&q=80', 'Multihall bilde 3', 3, false)
ON CONFLICT (rental_object_id, url) DO UPDATE SET
  sort_order = EXCLUDED.sort_order,
  is_primary = EXCLUDED.is_primary;

-- =====================================================================
-- RENTAL OBJECT AMENITIES
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
    ('changing_rooms'),
    ('first_aid'),
    ('parking'),
    ('showers'),
    ('wifi')
) AS codes(code)
JOIN amenity_mapping am ON am.tenant_id = ro.tenant_id AND am.code = codes.code
WHERE ro.id IN (
  'd0000001-0000-0000-0000-000000000001',
  'd0000001-0000-0001-0000-000000000000',
  'd0000001-0000-0002-0000-000000000000',
  'd0000001-0000-0003-0000-000000000000',
  'd0000001-0000-0004-0000-000000000000',
  'd0000001-0000-0005-0000-000000000000',
  'd0000001-0000-0006-0000-000000000000',
  'd0000001-0000-0007-0000-000000000000',
  'd0000001-0000-0008-0000-000000000000',
  'd0000001-0000-0009-0000-000000000000',
  'd0000001-0000-000a-0000-000000000000',
  'd0000001-0000-000b-0000-000000000000',
  'd0000001-0000-000c-0000-000000000000',
  'd0000001-0000-000d-0000-000000000000',
  'd0000001-0000-000e-0000-000000000000',
  'd0000001-0000-000f-0000-000000000000',
  'd0000001-0000-0010-0000-000000000000',
  'd0000001-0000-0011-0000-000000000000',
  'd0000001-0000-0012-0000-000000000000',
  'd0000001-0000-0013-0000-000000000000',
  'd0000001-0000-0014-0000-000000000000',
  'd0000001-0000-0015-0000-000000000000',
  'd0000001-0000-0016-0000-000000000000',
  'd0000001-0000-0017-0000-000000000000',
  'd0000001-0000-0018-0000-000000000000',
  'd0000001-0000-0019-0000-000000000000',
  'd0000001-0000-001a-0000-000000000000',
  'd0000001-0000-001b-0000-000000000000',
  'd0000001-0000-001c-0000-000000000000',
  'd0000001-0000-001d-0000-000000000000',
  'd0000001-0000-001e-0000-000000000000',
  'd0000001-0000-001f-0000-000000000000',
  'd0000001-0000-0020-0000-000000000000',
  'd0000001-0000-0021-0000-000000000000',
  'd0000001-0000-0022-0000-000000000000',
  'd0000001-0000-0023-0000-000000000000',
  'd0000001-0000-0024-0000-000000000000',
  'd0000001-0000-0025-0000-000000000000',
  'd0000001-0000-0026-0000-000000000000',
  'd0000001-0000-0027-0000-000000000000'
)
ON CONFLICT (rental_object_id, amenity_id) DO NOTHING;

-- =====================================================================
-- PRICING
-- =====================================================================

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
  150000, -- Base price from JSON: 1500 NOK
  CASE pg.code
    WHEN 'MEMBER' THEN 15
    WHEN 'STUDENT' THEN 20
    WHEN 'NONPROFIT' THEN 25
    ELSE 0
  END,
  true,
  300000, -- Deposit: 3000 NOK
  0.25
FROM domain.rental_objects ro
JOIN pricing_group_ids pg ON pg.tenant_id = ro.tenant_id
WHERE ro.id IN (
  'd0000001-0000-0000-0000-000000000001',
  'd0000001-0000-0001-0000-000000000000',
  'd0000001-0000-0002-0000-000000000000',
  'd0000001-0000-0003-0000-000000000000',
  'd0000001-0000-0004-0000-000000000000',
  'd0000001-0000-0005-0000-000000000000',
  'd0000001-0000-0006-0000-000000000000',
  'd0000001-0000-0007-0000-000000000000',
  'd0000001-0000-0008-0000-000000000000',
  'd0000001-0000-0009-0000-000000000000',
  'd0000001-0000-000a-0000-000000000000',
  'd0000001-0000-000b-0000-000000000000',
  'd0000001-0000-000c-0000-000000000000',
  'd0000001-0000-000d-0000-000000000000',
  'd0000001-0000-000e-0000-000000000000',
  'd0000001-0000-000f-0000-000000000000',
  'd0000001-0000-0010-0000-000000000000',
  'd0000001-0000-0011-0000-000000000000',
  'd0000001-0000-0012-0000-000000000000',
  'd0000001-0000-0013-0000-000000000000',
  'd0000001-0000-0014-0000-000000000000',
  'd0000001-0000-0015-0000-000000000000',
  'd0000001-0000-0016-0000-000000000000',
  'd0000001-0000-0017-0000-000000000000',
  'd0000001-0000-0018-0000-000000000000',
  'd0000001-0000-0019-0000-000000000000',
  'd0000001-0000-001a-0000-000000000000',
  'd0000001-0000-001b-0000-000000000000',
  'd0000001-0000-001c-0000-000000000000',
  'd0000001-0000-001d-0000-000000000000',
  'd0000001-0000-001e-0000-000000000000',
  'd0000001-0000-001f-0000-000000000000',
  'd0000001-0000-0020-0000-000000000000',
  'd0000001-0000-0021-0000-000000000000',
  'd0000001-0000-0022-0000-000000000000',
  'd0000001-0000-0023-0000-000000000000',
  'd0000001-0000-0024-0000-000000000000',
  'd0000001-0000-0025-0000-000000000000',
  'd0000001-0000-0026-0000-000000000000',
  'd0000001-0000-0027-0000-000000000000'
)
ON CONFLICT (rental_object_id, pricing_group_id) DO UPDATE SET
  base_price_cents = EXCLUDED.base_price_cents;

-- =====================================================================
-- OPENING HOURS (from JSON)
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
    (1, '06:00'::time, '23:00'::time),
    (2, '06:00'::time, '23:00'::time),
    (3, '06:00'::time, '23:00'::time),
    (4, '06:00'::time, '23:00'::time),
    (5, '06:00'::time, '23:00'::time),
    (6, '08:00'::time, '22:00'::time),
    (0, '08:00'::time, '22:00'::time)
) AS dow(day, open, close)
WHERE ro.id IN (
  'd0000001-0000-0000-0000-000000000001',
  'd0000001-0000-0001-0000-000000000000',
  'd0000001-0000-0002-0000-000000000000',
  'd0000001-0000-0003-0000-000000000000',
  'd0000001-0000-0004-0000-000000000000',
  'd0000001-0000-0005-0000-000000000000',
  'd0000001-0000-0006-0000-000000000000',
  'd0000001-0000-0007-0000-000000000000',
  'd0000001-0000-0008-0000-000000000000',
  'd0000001-0000-0009-0000-000000000000',
  'd0000001-0000-000a-0000-000000000000',
  'd0000001-0000-000b-0000-000000000000',
  'd0000001-0000-000c-0000-000000000000',
  'd0000001-0000-000d-0000-000000000000',
  'd0000001-0000-000e-0000-000000000000',
  'd0000001-0000-000f-0000-000000000000',
  'd0000001-0000-0010-0000-000000000000',
  'd0000001-0000-0011-0000-000000000000',
  'd0000001-0000-0012-0000-000000000000',
  'd0000001-0000-0013-0000-000000000000',
  'd0000001-0000-0014-0000-000000000000',
  'd0000001-0000-0015-0000-000000000000',
  'd0000001-0000-0016-0000-000000000000',
  'd0000001-0000-0017-0000-000000000000',
  'd0000001-0000-0018-0000-000000000000',
  'd0000001-0000-0019-0000-000000000000',
  'd0000001-0000-001a-0000-000000000000',
  'd0000001-0000-001b-0000-000000000000',
  'd0000001-0000-001c-0000-000000000000',
  'd0000001-0000-001d-0000-000000000000',
  'd0000001-0000-001e-0000-000000000000',
  'd0000001-0000-001f-0000-000000000000',
  'd0000001-0000-0020-0000-000000000000',
  'd0000001-0000-0021-0000-000000000000',
  'd0000001-0000-0022-0000-000000000000',
  'd0000001-0000-0023-0000-000000000000',
  'd0000001-0000-0024-0000-000000000000',
  'd0000001-0000-0025-0000-000000000000',
  'd0000001-0000-0026-0000-000000000000',
  'd0000001-0000-0027-0000-000000000000'
)
ON CONFLICT (rental_object_id, day_of_week) DO UPDATE SET
  open_time = EXCLUDED.open_time;

COMMIT;

-- =====================================================================
-- VERIFICATION
-- =====================================================================

SELECT 'All 40 rental objects seeded!' AS status,
  (SELECT COUNT(*) FROM domain.rental_objects) AS rental_objects,
  (SELECT COUNT(*) FROM domain.rental_object_media) AS media,
  (SELECT COUNT(*) FROM domain.rental_object_amenities) AS amenity_links,
  (SELECT COUNT(*) FROM domain.rental_object_pricing) AS pricing_configs,
  (SELECT COUNT(*) FROM domain.opening_hours) AS opening_hours;
