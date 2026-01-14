-- Migration: Create user_groups table
-- Stores user group classifications for pricing rules

CREATE TABLE IF NOT EXISTS public.user_groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Add comment
COMMENT ON TABLE public.user_groups IS 'User group classifications for tiered pricing';
COMMENT ON COLUMN public.user_groups.code IS 'Unique code: U19, ADULT_ORG, OTHER';

-- Create index
CREATE INDEX IF NOT EXISTS idx_user_groups_code ON public.user_groups(code);
