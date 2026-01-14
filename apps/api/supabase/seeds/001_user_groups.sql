-- Seed: User Groups
-- Idempotent: uses ON CONFLICT DO NOTHING

INSERT INTO public.user_groups (id, code, name, description) VALUES
  ('00000001-0000-0000-0000-000000000001', 'U19', 'Under 19 år', 'Barn og ungdom under 19 år'),
  ('00000001-0000-0000-0000-000000000002', 'ADULT_ORG', 'Voksen organisasjon', 'Registrerte organisasjoner med voksne medlemmer'),
  ('00000001-0000-0000-0000-000000000003', 'OTHER', 'Andre', 'Private og kommersielle leietakere')
ON CONFLICT (code) DO NOTHING;

-- Verify count
DO $$
BEGIN
  RAISE NOTICE 'User groups count: %', (SELECT COUNT(*) FROM public.user_groups);
END $$;
