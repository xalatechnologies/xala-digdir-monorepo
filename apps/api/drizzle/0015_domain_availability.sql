-- =====================================================================
-- DOMAIN: Availability Model (Opening Hours, Capacity, Conflicts)
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1) OPENING HOURS (Regular schedule)
-- ---------------------------------------------------------------------

create table if not exists domain.opening_hours (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references platform.tenants(id) on delete cascade,
  rental_object_id uuid not null references domain.rental_objects(id) on delete cascade,
  weekday int not null check (weekday between 0 and 6), -- 0=Sunday, 6=Saturday
  open_time time not null,
  close_time time not null,
  is_closed boolean not null default false,
  created_at timestamptz not null default now(),
  unique (tenant_id, rental_object_id, weekday)
);

-- ---------------------------------------------------------------------
-- 2) EXCEPTION DAYS (Holidays, special hours)
-- ---------------------------------------------------------------------

create table if not exists domain.exception_days (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references platform.tenants(id) on delete cascade,
  rental_object_id uuid null references domain.rental_objects(id) on delete cascade, -- null = tenant-wide
  exception_date date not null,
  exception_type text not null check (exception_type in ('CLOSED','SPECIAL_HOURS','HOLIDAY')),
  open_time time null,
  close_time time null,
  reason text null,
  created_at timestamptz not null default now(),
  unique (tenant_id, rental_object_id, exception_date)
);

create index if not exists idx_exception_days_date
  on domain.exception_days(tenant_id, exception_date);

-- ---------------------------------------------------------------------
-- 3) CAPACITY RULES (Per object / zone / segment)
-- ---------------------------------------------------------------------

create table if not exists domain.capacity_rules (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references platform.tenants(id) on delete cascade,
  rental_object_id uuid not null references domain.rental_objects(id) on delete cascade,
  rule_type text not null check (rule_type in ('MAX_CONCURRENT','MAX_PER_HOUR','MAX_PER_DAY','MAX_PER_WEEK')),
  capacity int not null,
  applies_to text not null check (applies_to in ('TOTAL','PER_USER','PER_ORG')) default 'TOTAL',
  time_window_start time null,
  time_window_end time null,
  effective_from date null,
  effective_to date null,
  created_at timestamptz not null default now()
);

create index if not exists idx_capacity_rules_ro
  on domain.capacity_rules(rental_object_id, effective_from, effective_to);

-- ---------------------------------------------------------------------
-- 4) BOOKING CONFLICTS (Materialized conflict reasons for UX)
-- ---------------------------------------------------------------------

create table if not exists domain.booking_conflicts (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references platform.tenants(id) on delete cascade,
  rental_object_id uuid not null references domain.rental_objects(id) on delete cascade,
  attempted_start timestamptz not null,
  attempted_end timestamptz not null,
  conflict_type text not null check (conflict_type in (
    'OVERLAPPING_BOOKING','TIME_BLOCK','OUTSIDE_HOURS','CAPACITY_EXCEEDED',
    'LEAD_TIME_VIOLATION','MAX_DURATION_EXCEEDED','BLACKOUT_DATE'
  )),
  conflict_details jsonb not null,
  user_id uuid null references platform.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists idx_conflicts_ro_time
  on domain.booking_conflicts(rental_object_id, created_at desc);

-- ---------------------------------------------------------------------
-- COMMENTS
-- ---------------------------------------------------------------------

comment on table domain.opening_hours is 'Regular weekly opening hours per rental object';
comment on table domain.exception_days is 'Holiday closures and special opening hours';
comment on table domain.capacity_rules is 'Capacity limits: concurrent bookings, hourly/daily/weekly caps';
comment on table domain.booking_conflicts is 'Materialized conflict log for UX feedback and analytics';
