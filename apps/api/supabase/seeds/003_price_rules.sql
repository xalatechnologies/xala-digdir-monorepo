-- Seed: Price Rules
-- Idempotent: uses unique indexes to prevent duplicates

-- User group IDs (from seed 001)
-- U19:        00000001-0000-0000-0000-000000000001
-- ADULT_ORG:  00000001-0000-0000-0000-000000000002
-- OTHER:      00000001-0000-0000-0000-000000000003

-- ========================================================================
-- GYMSAL Price Rules (all 8 gymsals)
-- ========================================================================
-- U19 weekday HOURLY: 0 NOK
-- ADULT_ORG weekday HOURLY: 99 NOK
-- OTHER weekday HOURLY: 150 NOK
-- Weekend DAILY (all): 2225 NOK

DO $$
DECLARE
  gymsal_ids UUID[] := ARRAY[
    '10000001-0000-0000-0000-000000000001',
    '10000001-0000-0000-0000-000000000002',
    '10000001-0000-0000-0000-000000000003',
    '10000001-0000-0000-0000-000000000004',
    '10000001-0000-0000-0000-000000000005',
    '10000001-0000-0000-0000-000000000006',
    '10000001-0000-0000-0000-000000000007',
    '10000001-0000-0000-0000-000000000008'
  ];
  u19_id UUID := '00000001-0000-0000-0000-000000000001';
  adult_org_id UUID := '00000001-0000-0000-0000-000000000002';
  other_id UUID := '00000001-0000-0000-0000-000000000003';
  gymsal_id UUID;
BEGIN
  FOREACH gymsal_id IN ARRAY gymsal_ids LOOP
    -- U19 weekday HOURLY: 0 NOK (free for youth)
    INSERT INTO public.price_rules (listing_id, user_group_id, rule_type, unit, amount, currency, applies_weekdays, applies_weekends, description, priority)
    VALUES (gymsal_id, u19_id, 'HOURLY', 'HOUR', 0, 'NOK', true, false, 'Gratis for U19 på hverdager', 10)
    ON CONFLICT DO NOTHING;

    -- ADULT_ORG weekday HOURLY: 99 NOK
    INSERT INTO public.price_rules (listing_id, user_group_id, rule_type, unit, amount, currency, applies_weekdays, applies_weekends, description, priority)
    VALUES (gymsal_id, adult_org_id, 'HOURLY', 'HOUR', 9900, 'NOK', true, false, 'Voksenorganisasjoner hverdag', 10)
    ON CONFLICT DO NOTHING;

    -- OTHER weekday HOURLY: 150 NOK
    INSERT INTO public.price_rules (listing_id, user_group_id, rule_type, unit, amount, currency, applies_weekdays, applies_weekends, description, priority)
    VALUES (gymsal_id, other_id, 'HOURLY', 'HOUR', 15000, 'NOK', true, false, 'Private/kommersielle hverdag', 10)
    ON CONFLICT DO NOTHING;

    -- Weekend DAILY: 2225 NOK (all groups, sporadisk helgeleie)
    INSERT INTO public.price_rules (listing_id, user_group_id, rule_type, unit, amount, currency, applies_weekdays, applies_weekends, window_start, window_end, description, priority)
    VALUES (gymsal_id, NULL, 'DAILY', 'DAY', 222500, 'NOK', false, true, 'SAT 00:00', 'SUN 23:59', 'Helgeleie gymsal (sporadisk)', 5)
    ON CONFLICT DO NOTHING;
  END LOOP;
END $$;

-- ========================================================================
-- Kollmyr Grendehus Price Rules
-- ========================================================================
-- Weekday HOURLY: 300 NOK (no group)
-- Weekend PACKAGE for OTHER: 4800 NOK (FRI 16:00 → SUN 16:00)
-- Weekend PACKAGE for ADULT_ORG: 3600 NOK (FRI 16:00 → SUN 16:00)

DO $$
DECLARE
  kollmyr_id UUID := '10000002-0000-0000-0000-000000000001';
  adult_org_id UUID := '00000001-0000-0000-0000-000000000002';
  other_id UUID := '00000001-0000-0000-0000-000000000003';
BEGIN
  -- Weekday HOURLY: 300 NOK (no specific group)
  INSERT INTO public.price_rules (listing_id, user_group_id, rule_type, unit, amount, currency, applies_weekdays, applies_weekends, description, priority)
  VALUES (kollmyr_id, NULL, 'HOURLY', 'HOUR', 30000, 'NOK', true, false, 'Timeleie hverdag', 1)
  ON CONFLICT DO NOTHING;

  -- Weekend PACKAGE for OTHER: 4800 NOK
  INSERT INTO public.price_rules (listing_id, user_group_id, rule_type, unit, amount, currency, applies_weekdays, applies_weekends, package_name, window_start, window_end, description, priority)
  VALUES (kollmyr_id, other_id, 'PACKAGE', 'PACKAGE', 480000, 'NOK', false, true, 'Helgepakke', 'FRI 16:00', 'SUN 16:00', 'Helgeleie for private (fre-søn)', 10)
  ON CONFLICT DO NOTHING;

  -- Weekend PACKAGE for ADULT_ORG: 3600 NOK
  INSERT INTO public.price_rules (listing_id, user_group_id, rule_type, unit, amount, currency, applies_weekdays, applies_weekends, package_name, window_start, window_end, description, priority)
  VALUES (kollmyr_id, adult_org_id, 'PACKAGE', 'PACKAGE', 360000, 'NOK', false, true, 'Helgepakke', 'FRI 16:00', 'SUN 16:00', 'Helgeleie for organisasjoner (fre-søn)', 10)
  ON CONFLICT DO NOTHING;
END $$;

-- Verify counts
DO $$
BEGIN
  RAISE NOTICE 'Price rules count: %', (SELECT COUNT(*) FROM public.price_rules);
END $$;
