-- Seed: Listing Rules
-- Idempotent: uses unique constraint on listing_id

-- ========================================================================
-- GYMSAL Listing Rules
-- ========================================================================
-- approval_required: true
-- min_age: 18
-- cancellation_deadline_days: 2
-- cancellation_fee_percent: 0
-- notes: weekday vs weekend info

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
  gymsal_id UUID;
BEGIN
  FOREACH gymsal_id IN ARRAY gymsal_ids LOOP
    INSERT INTO public.listing_rules (listing_id, approval_required, min_age, cancellation_deadline_days, cancellation_fee_percent, notes)
    VALUES (
      gymsal_id,
      true,
      18,
      2,
      0,
      E'Gymsaler kan leies på hverdager (mandag-fredag) per time, eller som helgeleie (lørdag-søndag).\n\nHverdager:\n- U19: Gratis\n- Voksenorganisasjoner: 99 kr/time\n- Private/kommersielle: 150 kr/time\n\nHelg:\n- Sporadisk helgeleie: 2225 kr/dag\n\nAvbestilling må skje minst 2 dager før.'
    )
    ON CONFLICT (listing_id) DO UPDATE SET
      approval_required = EXCLUDED.approval_required,
      min_age = EXCLUDED.min_age,
      cancellation_deadline_days = EXCLUDED.cancellation_deadline_days,
      cancellation_fee_percent = EXCLUDED.cancellation_fee_percent,
      notes = EXCLUDED.notes,
      updated_at = now();
  END LOOP;
END $$;

-- ========================================================================
-- Kollmyr Grendehus Listing Rules
-- ========================================================================
-- approval_required: true
-- min_age: 25
-- cancellation_deadline_days: 21
-- cancellation_fee_percent: 100
-- notes: 3-week rule

INSERT INTO public.listing_rules (listing_id, approval_required, min_age, cancellation_deadline_days, cancellation_fee_percent, notes)
VALUES (
  '10000002-0000-0000-0000-000000000001',
  true,
  25,
  21,
  100,
  E'Kollmyr Grendehus utleie:\n\nHverdager:\n- Timeleie: 300 kr/time\n\nHelg (fredag 16:00 - søndag 16:00):\n- Voksenorganisasjoner: 3600 kr\n- Private: 4800 kr\n\nAVBESTILLING:\nAvbestilling må skje minst 3 uker (21 dager) før arrangementsstart.\nVed avbestilling innenfor 21-dagersfristen: 100% av leieprisen faktureres.'
)
ON CONFLICT (listing_id) DO UPDATE SET
  approval_required = EXCLUDED.approval_required,
  min_age = EXCLUDED.min_age,
  cancellation_deadline_days = EXCLUDED.cancellation_deadline_days,
  cancellation_fee_percent = EXCLUDED.cancellation_fee_percent,
  notes = EXCLUDED.notes,
  updated_at = now();

-- ========================================================================
-- Default rules for other listings (simpler policies)
-- ========================================================================
INSERT INTO public.listing_rules (listing_id, approval_required, min_age, cancellation_deadline_days, cancellation_fee_percent, notes)
SELECT 
  l.id,
  false,  -- no approval needed
  18,     -- min age 18
  1,      -- 1 day notice
  0,      -- no fee
  'Standard utleieregler. Avbestilling innen 24 timer før leiestart.'
FROM public.listings l
WHERE l.status = 'published'
  AND l.id NOT IN (SELECT listing_id FROM public.listing_rules)
ON CONFLICT (listing_id) DO NOTHING;

-- Verify counts
DO $$
BEGIN
  RAISE NOTICE 'Listing rules count: %', (SELECT COUNT(*) FROM public.listing_rules);
END $$;
