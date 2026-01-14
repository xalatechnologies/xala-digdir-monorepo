-- Migration: Create price_rules table
-- Stores pricing rules per listing, optionally per user group

CREATE TABLE IF NOT EXISTS public.price_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID NOT NULL,
  user_group_id UUID,
  rule_type TEXT NOT NULL CHECK (rule_type IN ('HOURLY', 'DAILY', 'PACKAGE')),
  unit TEXT NOT NULL CHECK (unit IN ('HOUR', 'DAY', 'PACKAGE')),
  amount INTEGER NOT NULL,  -- in smallest currency unit (øre for NOK)
  currency TEXT NOT NULL DEFAULT 'NOK',
  applies_weekdays BOOLEAN NOT NULL DEFAULT true,
  applies_weekends BOOLEAN NOT NULL DEFAULT false,
  package_name TEXT,
  window_start TEXT,  -- e.g., "FRI 16:00"
  window_end TEXT,    -- e.g., "SUN 16:00"
  description TEXT,
  priority INTEGER DEFAULT 0,  -- higher = more specific
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  
  -- Foreign keys (added as constraints for flexibility)
  CONSTRAINT fk_price_rules_listing FOREIGN KEY (listing_id) REFERENCES public.listings(id) ON DELETE CASCADE,
  CONSTRAINT fk_price_rules_user_group FOREIGN KEY (user_group_id) REFERENCES public.user_groups(id) ON DELETE SET NULL
);

-- Unique constraint for HOURLY/DAILY rules (prevents duplicate rules on reseed)
-- Uses COALESCE to handle NULL user_group_id
CREATE UNIQUE INDEX IF NOT EXISTS idx_price_rules_basic_unique 
  ON public.price_rules(
    listing_id, 
    COALESCE(user_group_id, '00000000-0000-0000-0000-000000000000'::uuid), 
    rule_type, 
    applies_weekdays, 
    applies_weekends
  )
  WHERE rule_type IN ('HOURLY', 'DAILY');

-- Unique constraint for PACKAGE rules
CREATE UNIQUE INDEX IF NOT EXISTS idx_price_rules_package_unique
  ON public.price_rules(
    listing_id, 
    COALESCE(user_group_id, '00000000-0000-0000-0000-000000000000'::uuid), 
    rule_type, 
    COALESCE(package_name, '')
  )
  WHERE rule_type = 'PACKAGE';

-- Performance indexes
CREATE INDEX IF NOT EXISTS idx_price_rules_listing_id ON public.price_rules(listing_id);
CREATE INDEX IF NOT EXISTS idx_price_rules_user_group_id ON public.price_rules(user_group_id);
CREATE INDEX IF NOT EXISTS idx_price_rules_rule_type ON public.price_rules(rule_type);

-- Comments
COMMENT ON TABLE public.price_rules IS 'Pricing rules for listings, optionally per user group';
COMMENT ON COLUMN public.price_rules.amount IS 'Price in smallest currency unit (øre). 15000 = 150 NOK';
COMMENT ON COLUMN public.price_rules.rule_type IS 'HOURLY, DAILY, or PACKAGE';
COMMENT ON COLUMN public.price_rules.window_start IS 'Package window start, e.g., FRI 16:00';
