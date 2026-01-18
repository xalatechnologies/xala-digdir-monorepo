-- =====================================================================
-- DOMAIN: Pricing Engine (Rules, Discounts, Taxes, Deposits)
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1) PRICE RULES (Peak/off-peak, seasonal, weekend multipliers)
-- ---------------------------------------------------------------------

create table if not exists domain.price_rules (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references platform.tenants(id) on delete cascade,
  rental_object_id uuid null references domain.rental_objects(id) on delete cascade, -- null = tenant-wide
  pricing_group_id uuid null references domain.pricing_groups(id) on delete cascade,
  rule_type text not null check (rule_type in ('PEAK_HOURS','WEEKEND','SEASONAL','HOLIDAY','EARLY_BIRD','LAST_MINUTE')),
  multiplier numeric(5,2) not null default 1.0,
  fixed_adjustment_cents int null,
  conditions jsonb not null, -- e.g., {"days":[5,6],"hours":["18:00","22:00"],"months":[6,7,8]}
  priority int not null default 0,
  effective_from date null,
  effective_to date null,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create index if not exists idx_price_rules_ro_active
  on domain.price_rules(rental_object_id, is_active, priority);

-- ---------------------------------------------------------------------
-- 2) DISCOUNT CODES / VOUCHERS
-- ---------------------------------------------------------------------

create table if not exists domain.discount_codes (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references platform.tenants(id) on delete cascade,
  code text not null,
  discount_type text not null check (discount_type in ('PERCENTAGE','FIXED_AMOUNT','FREE_ADDON')),
  discount_value numeric not null,
  currency text not null default 'NOK',
  max_uses int null,
  uses_count int not null default 0,
  valid_from timestamptz not null default now(),
  valid_to timestamptz null,
  applicable_to jsonb null, -- {"rental_object_ids":[],"pricing_group_ids":[],"min_amount_cents":5000}
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  unique (tenant_id, code)
);

create index if not exists idx_discount_codes_active
  on domain.discount_codes(tenant_id, is_active, valid_from, valid_to);

-- Discount usage tracking
create table if not exists domain.discount_usages (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references platform.tenants(id) on delete cascade,
  discount_code_id uuid not null references domain.discount_codes(id) on delete cascade,
  booking_id uuid not null references domain.bookings(id) on delete cascade,
  user_id uuid not null references platform.users(id) on delete cascade,
  discount_amount_cents int not null,
  used_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- 3) TAX / VAT PROFILES
-- ---------------------------------------------------------------------

create table if not exists domain.tax_profiles (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references platform.tenants(id) on delete cascade,
  code text not null,
  name text not null,
  tax_rate numeric(5,4) not null, -- e.g., 0.25 for 25% VAT
  is_inclusive boolean not null default true,
  applies_to text not null check (applies_to in ('ALL','RENTAL','ADDONS','DEPOSITS')) default 'ALL',
  effective_from date not null,
  effective_to date null,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  unique (tenant_id, code)
);

-- Tax profile assignment to rental objects
create table if not exists domain.rental_object_tax_profiles (
  tenant_id uuid not null references platform.tenants(id) on delete cascade,
  rental_object_id uuid not null references domain.rental_objects(id) on delete cascade,
  tax_profile_id uuid not null references domain.tax_profiles(id) on delete cascade,
  primary key (tenant_id, rental_object_id, tax_profile_id)
);

-- ---------------------------------------------------------------------
-- 4) DEPOSIT RULES (Structured)
-- ---------------------------------------------------------------------

create table if not exists domain.deposit_rules (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references platform.tenants(id) on delete cascade,
  rental_object_id uuid null references domain.rental_objects(id) on delete cascade, -- null = tenant default
  deposit_type text not null check (deposit_type in ('FIXED','PERCENTAGE','CALCULATED')),
  deposit_amount_cents int null,
  deposit_percentage numeric(5,2) null,
  calculation_basis text null check (calculation_basis in ('BOOKING_TOTAL','RENTAL_COST','ADDON_COST')),
  refundable boolean not null default true,
  refund_conditions jsonb null, -- {"cancel_before_hours":48,"damage_inspection":true}
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- COMMENTS
-- ---------------------------------------------------------------------

comment on table domain.price_rules is 'Dynamic pricing rules: peak hours, weekends, seasonal multipliers';
comment on table domain.discount_codes is 'Discount codes and vouchers with usage limits';
comment on table domain.discount_usages is 'Tracking of discount code usage per booking';
comment on table domain.tax_profiles is 'VAT/tax profiles with rates and applicability';
comment on table domain.deposit_rules is 'Deposit calculation rules: fixed, percentage, or calculated';
